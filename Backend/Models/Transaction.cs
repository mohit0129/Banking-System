using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models;

/// <summary>
/// OOP Class and Object: Transaction
/// Represents an immutable financial transaction record in Money Bank.
/// </summary>
public class Transaction
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("AccountId")]
    public string AccountId { get; set; } = string.Empty;

    [BsonElement("AccountNumber")]
    public string AccountNumber { get; set; } = string.Empty;

    [BsonElement("Type")]
    public string Type { get; set; } = string.Empty; // "Deposit", "Withdrawal", "Transfer Out", "Transfer In"

    [BsonElement("Amount")]
    public decimal Amount { get; set; }

    [BsonElement("BalanceAfter")]
    public decimal BalanceAfter { get; set; }

    [BsonElement("RelatedAccountId")]
    public string? RelatedAccountId { get; set; }

    [BsonElement("RelatedAccountNumber")]
    public string? RelatedAccountNumber { get; set; }

    [BsonElement("Description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("Date")]
    public DateTime Date { get; set; } = DateTime.UtcNow;
}
