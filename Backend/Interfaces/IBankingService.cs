using Backend.Models;
using Backend.Models.DTOs;

namespace Backend.Interfaces;

/// <summary>
/// OOP Abstraction: IBankingService defines the contract for bank operations
/// without exposing underlying implementation or data store details.
/// </summary>
public interface IBankingService
{
    Task<BankAccount?> GetAccountByCustomerIdAsync(string customerId);
    Task<BankAccount?> GetAccountByNumberAsync(string accountNumber);
    Task<BankAccount> CreateAccountForCustomerAsync(string customerId, decimal initialDeposit = 0);
    Task<BankAccount> DepositAsync(string customerId, decimal amount, string? note = null);
    Task<BankAccount> WithdrawAsync(string customerId, decimal amount, string? note = null);
    Task<(BankAccount Source, BankAccount Target)> TransferAsync(string senderCustomerId, string targetAccountNumber, decimal amount, string? note = null);
    Task<List<Transaction>> GetCustomerTransactionsAsync(string customerId);
    Task<List<AccountDetailDto>> GetAllAccountsWithCustomerDetailsAsync();
    Task<List<Transaction>> GetAllTransactionsAsync();
    Task<BankAccount> ToggleAccountStatusAsync(string accountId, bool isActive);
    Task<List<PayeeDto>> GetAvailablePayeesAsync(string currentCustomerId);
}
