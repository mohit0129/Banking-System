using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models;

/// <summary>
/// OOP Class and Object: BankAccount
/// OOP Encapsulation: The balance is stored in a private field and can ONLY be altered
/// through validated domain methods: Deposit() and Withdraw().
/// </summary>
public class BankAccount
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("AccountNumber")]
    public string AccountNumber { get; set; } = string.Empty;

    [BsonElement("CustomerId")]
    public string CustomerId { get; set; } = string.Empty;

    [BsonElement("IsActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("CreatedAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // OOP Encapsulation: Private setter protects balance from external mutation.
    // Balance can ONLY be changed through validated domain methods: Deposit() and Withdraw().
    [BsonElement("Balance")]
    public decimal Balance { get; private set; }

    public BankAccount()
    {
    }

    public BankAccount(string accountNumber, string customerId, decimal initialDeposit = 0)
    {
        if (initialDeposit < 0)
        {
            throw new ArgumentException("Initial deposit cannot be negative.", nameof(initialDeposit));
        }

        AccountNumber = accountNumber;
        CustomerId = customerId;
        Balance = initialDeposit;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Validated business method for depositing funds.
    /// Encapsulates balance mutation rules.
    /// </summary>
    public void Deposit(decimal amount)
    {
        if (!IsActive)
        {
            throw new InvalidOperationException("Account is currently inactive. Cannot deposit funds.");
        }

        if (amount <= 0)
        {
            throw new ArgumentException("Deposit amount must be strictly positive.", nameof(amount));
        }

        Balance += amount;
    }

    /// <summary>
    /// Validated business method for withdrawing funds.
    /// Encapsulates balance mutation rules and prevents overdraft.
    /// </summary>
    public void Withdraw(decimal amount)
    {
        if (!IsActive)
        {
            throw new InvalidOperationException("Account is currently inactive. Cannot withdraw funds.");
        }

        if (amount <= 0)
        {
            throw new ArgumentException("Withdrawal amount must be strictly positive.", nameof(amount));
        }

        if (amount > Balance)
        {
            throw new InvalidOperationException($"Insufficient funds. Available balance: ₹{Balance:N2}, Requested: ₹{amount:N2}");
        }

        Balance -= amount;
    }

    /// <summary>
    /// Update account activation status.
    /// </summary>
    public void SetStatus(bool active)
    {
        IsActive = active;
    }
}
