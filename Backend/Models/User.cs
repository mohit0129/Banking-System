using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models;

/// <summary>
/// OOP Inheritance Base Class: User
/// Customer and Manager inherit common properties from User.
/// </summary>
[BsonDiscriminator(RootClass = true)]
[BsonKnownTypes(typeof(Customer), typeof(Manager))]
public abstract class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty; // "Customer" or "Manager"

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// OOP Polymorphism: Abstract method overridden by Customer and Manager to demonstrate different behavior.
    /// </summary>
    public abstract string GetRoleDescription();

    /// <summary>
    /// OOP Polymorphism: Abstract method for role-specific portal greeting.
    /// </summary>
    public abstract string GetPortalGreeting();
}

/// <summary>
/// OOP Inheritance: Customer inherits from User.
/// </summary>
public class Customer : User
{
    public string PhoneNumber { get; set; } = string.Empty;

    public Customer()
    {
        Role = "Customer";
    }

    /// <summary>
    /// OOP Polymorphism: Customer-specific role description.
    /// </summary>
    public override string GetRoleDescription() => "Customer - Everyday Retail Banking Member";

    /// <summary>
    /// OOP Polymorphism: Customer-specific greeting.
    /// </summary>
    public override string GetPortalGreeting() => $"Welcome to Money Bank, {FullName}!";
}

/// <summary>
/// OOP Inheritance: Manager inherits from User.
/// </summary>
public class Manager : User
{
    public string Department { get; set; } = "Branch Operations";

    public Manager()
    {
        Role = "Manager";
    }

    /// <summary>
    /// OOP Polymorphism: Manager-specific role description.
    /// </summary>
    public override string GetRoleDescription() => "Manager - System & Customer Operations Administrator";

    /// <summary>
    /// OOP Polymorphism: Manager-specific greeting.
    /// </summary>
    public override string GetPortalGreeting() => $"Money Bank Executive Control - Manager {FullName}";
}
