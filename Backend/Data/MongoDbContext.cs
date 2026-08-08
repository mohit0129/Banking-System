using Backend.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Backend.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);

        // Ensure unique index on Email for Users
        var userEmailIndex = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.Email),
            new CreateIndexOptions { Unique = true }
        );
        Users.Indexes.CreateOne(userEmailIndex);

        // Ensure unique index on AccountNumber for Accounts
        var accountNumIndex = new CreateIndexModel<BankAccount>(
            Builders<BankAccount>.IndexKeys.Ascending(a => a.AccountNumber),
            new CreateIndexOptions { Unique = true }
        );
        Accounts.Indexes.CreateOne(accountNumIndex);
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<BankAccount> Accounts => _database.GetCollection<BankAccount>("accounts");
    public IMongoCollection<Transaction> Transactions => _database.GetCollection<Transaction>("transactions");
}
