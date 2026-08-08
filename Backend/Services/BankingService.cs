using Backend.Data;
using Backend.Interfaces;
using Backend.Models;
using Backend.Models.DTOs;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Backend.Services;

/// <summary>
/// Implements IBankingService abstraction.
/// Utilizes BankAccount encapsulation to safely mutate balances and persist state to MongoDB.
/// </summary>
public class BankingService : IBankingService
{
    private readonly MongoDbContext _context;

    public BankingService(MongoDbContext context) => _context = context;

    public async Task<BankAccount?> GetAccountByCustomerIdAsync(string customerId) =>
        await _context.Accounts.Find(a => a.CustomerId == customerId).FirstOrDefaultAsync();

    public async Task<BankAccount?> GetAccountByNumberAsync(string accountNumber)
    {
        var normalized = accountNumber.Trim().ToUpperInvariant();
        return await _context.Accounts.Find(a => a.AccountNumber == normalized).FirstOrDefaultAsync();
    }

    public async Task<BankAccount> CreateAccountForCustomerAsync(string customerId, decimal initialDeposit = 0)
    {
        var existing = await GetAccountByCustomerIdAsync(customerId);
        if (existing is not null) return existing;

        string accountNumber;
        do
        {
            accountNumber = $"MB{Random.Shared.Next(10000000, 99999999)}";
        } while (await _context.Accounts.Find(a => a.AccountNumber == accountNumber).AnyAsync());

        var account = new BankAccount(accountNumber, customerId, initialDeposit);
        await _context.Accounts.InsertOneAsync(account);

        if (initialDeposit > 0)
        {
            await RecordTxAsync(account.Id!, account.AccountNumber, "Deposit", initialDeposit, account.Balance, "Opening Deposit");
        }

        return account;
    }

    public async Task<BankAccount> DepositAsync(string customerId, decimal amount, string? note = null)
    {
        var account = await GetAccountByCustomerIdAsync(customerId)
            ?? throw new InvalidOperationException("Bank account not found for this customer.");

        account.Deposit(amount);
        await _context.Accounts.ReplaceOneAsync(a => a.Id == account.Id, account);
        await RecordTxAsync(account.Id!, account.AccountNumber, "Deposit", amount, account.Balance, string.IsNullOrWhiteSpace(note) ? "Cash Deposit" : note.Trim());

        return account;
    }

    public async Task<BankAccount> WithdrawAsync(string customerId, decimal amount, string? note = null)
    {
        var account = await GetAccountByCustomerIdAsync(customerId)
            ?? throw new InvalidOperationException("Bank account not found for this customer.");

        account.Withdraw(amount);
        await _context.Accounts.ReplaceOneAsync(a => a.Id == account.Id, account);
        await RecordTxAsync(account.Id!, account.AccountNumber, "Withdrawal", amount, account.Balance, string.IsNullOrWhiteSpace(note) ? "Cash Withdrawal" : note.Trim());

        return account;
    }

    public async Task<(BankAccount Source, BankAccount Target)> TransferAsync(
        string senderCustomerId,
        string targetAccountNumber,
        decimal amount,
        string? note = null)
    {
        if (amount <= 0)
            throw new ArgumentException("Transfer amount must be strictly positive.", nameof(amount));

        var senderAccount = await GetAccountByCustomerIdAsync(senderCustomerId)
            ?? throw new InvalidOperationException("Sender bank account not found.");

        if (!senderAccount.IsActive)
            throw new InvalidOperationException("Your bank account is inactive. Transfer denied.");

        var targetAccount = await GetAccountByNumberAsync(targetAccountNumber)
            ?? throw new InvalidOperationException($"Recipient account number '{targetAccountNumber}' does not exist.");

        if (!targetAccount.IsActive)
            throw new InvalidOperationException($"Recipient account '{targetAccountNumber}' is inactive.");

        if (senderAccount.AccountNumber.Equals(targetAccount.AccountNumber, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Cannot transfer money to the same account.");

        senderAccount.Withdraw(amount);
        targetAccount.Deposit(amount);

        await _context.Accounts.ReplaceOneAsync(a => a.Id == senderAccount.Id, senderAccount);
        await _context.Accounts.ReplaceOneAsync(a => a.Id == targetAccount.Id, targetAccount);

        var transferNote = string.IsNullOrWhiteSpace(note) ? "Transfer" : note.Trim();

        await RecordTxAsync(
            senderAccount.Id!, senderAccount.AccountNumber, "Transfer Out", amount, senderAccount.Balance,
            $"Sent to {targetAccount.AccountNumber} ({transferNote})",
            targetAccount.Id, targetAccount.AccountNumber);

        await RecordTxAsync(
            targetAccount.Id!, targetAccount.AccountNumber, "Transfer In", amount, targetAccount.Balance,
            $"Received from {senderAccount.AccountNumber} ({transferNote})",
            senderAccount.Id, senderAccount.AccountNumber);

        return (senderAccount, targetAccount);
    }

    public async Task<List<Transaction>> GetCustomerTransactionsAsync(string customerId)
    {
        var account = await GetAccountByCustomerIdAsync(customerId);
        if (account is null) return new List<Transaction>();

        return await _context.Transactions
            .Find(t => t.AccountId == account.Id)
            .SortByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task<List<AccountDetailDto>> GetAllAccountsWithCustomerDetailsAsync()
    {
        var accounts = await _context.Accounts.Find(_ => true).ToListAsync();
        var users = await _context.Users.Find(_ => true).ToListAsync();
        var userDict = users.ToDictionary(u => u.Id ?? string.Empty, u => u);

        return accounts.Select(acc =>
        {
            userDict.TryGetValue(acc.CustomerId, out var user);
            return new AccountDetailDto
            {
                Id = acc.Id ?? string.Empty,
                AccountNumber = acc.AccountNumber,
                CustomerId = acc.CustomerId,
                CustomerName = user?.FullName ?? "Unknown",
                CustomerEmail = user?.Email ?? "Unknown",
                Balance = acc.Balance,
                IsActive = acc.IsActive,
                CreatedAt = acc.CreatedAt
            };
        }).ToList();
    }

    public async Task<List<Transaction>> GetAllTransactionsAsync() =>
        await _context.Transactions.Find(_ => true).SortByDescending(t => t.Date).ToListAsync();

    public async Task<BankAccount> ToggleAccountStatusAsync(string accountIdentifier, bool isActive)
    {
        var normalized = accountIdentifier.Trim();
        var normalizedUpper = normalized.ToUpperInvariant();

        BankAccount? account = null;
        if (ObjectId.TryParse(normalized, out _))
        {
            account = await _context.Accounts.Find(a => a.Id == normalized || a.CustomerId == normalized).FirstOrDefaultAsync();
        }

        account ??= await _context.Accounts.Find(a => a.AccountNumber == normalizedUpper || a.CustomerId == normalized).FirstOrDefaultAsync();

        if (account is null)
        {
            throw new InvalidOperationException("Bank account not found.");
        }

        account.SetStatus(isActive);
        await _context.Accounts.ReplaceOneAsync(a => a.Id == account.Id, account);
        return account;
    }

    public async Task<List<PayeeDto>> GetAvailablePayeesAsync(string currentCustomerId)
    {
        var otherAccounts = await _context.Accounts.Find(a => a.CustomerId != currentCustomerId && a.IsActive).ToListAsync();
        var users = await _context.Users.Find(_ => true).ToListAsync();
        var userDict = users.ToDictionary(u => u.Id ?? string.Empty, u => u.FullName);

        return otherAccounts.Select(acc => new PayeeDto
        {
            AccountNumber = acc.AccountNumber,
            CustomerName = userDict.TryGetValue(acc.CustomerId, out var name) ? name : "Valued Customer"
        }).ToList();
    }

    private async Task RecordTxAsync(
        string accountId,
        string accountNumber,
        string type,
        decimal amount,
        decimal balanceAfter,
        string description,
        string? relatedId = null,
        string? relatedNumber = null)
    {
        var tx = new Transaction
        {
            AccountId = accountId,
            AccountNumber = accountNumber,
            Type = type,
            Amount = amount,
            BalanceAfter = balanceAfter,
            Description = description,
            RelatedAccountId = relatedId,
            RelatedAccountNumber = relatedNumber,
            Date = DateTime.UtcNow
        };
        await _context.Transactions.InsertOneAsync(tx);
    }
}
