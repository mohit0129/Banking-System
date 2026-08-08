using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.Interfaces;
using Backend.Models;
using Backend.Models.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly MongoDbContext _context;
    private readonly IBankingService _bankingService;
    private readonly IConfiguration _configuration;

    public AuthService(MongoDbContext context, IBankingService bankingService, IConfiguration configuration)
    {
        _context = context;
        _bankingService = bankingService;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterCustomerAsync(RegisterRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (request.InitialDeposit < 0)
        {
            throw new InvalidOperationException("Initial deposit cannot be negative.");
        }

        // Check duplicate email
        var existingUser = await _context.Users.Find(u => u.Email == normalizedEmail).FirstOrDefaultAsync();
        if (existingUser != null)
        {
            throw new InvalidOperationException("An account with this email address already exists.");
        }

        // OOP Polymorphic Customer instance
        var customer = new Customer
        {
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.InsertOneAsync(customer);

        // Open BankAccount for the customer
        var account = await _bankingService.CreateAccountForCustomerAsync(customer.Id!, request.InitialDeposit);

        var token = GenerateJwtToken(customer);
        return CreateAuthResponse(customer, token, account.AccountNumber, account.Balance);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.Find(u => u.Email == normalizedEmail).FirstOrDefaultAsync()
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        var token = GenerateJwtToken(user);

        string? accountNumber = null;
        decimal? balance = null;

        if (user is Customer)
        {
            var account = await _bankingService.GetAccountByCustomerIdAsync(user.Id!);
            accountNumber = account?.AccountNumber;
            balance = account?.Balance;
        }

        return CreateAuthResponse(user, token, accountNumber, balance);
    }

    public async Task<User?> GetUserByIdAsync(string id) =>
        await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();

    public async Task<List<CustomerDto>> GetAllCustomersAsync()
    {
        var customers = (await _context.Users.Find(_ => true).ToListAsync()).OfType<Customer>();
        var accounts = await _context.Accounts.Find(_ => true).ToListAsync();
        var accountDict = accounts.ToDictionary(a => a.CustomerId, a => a);

        return customers.Select(c =>
        {
            accountDict.TryGetValue(c.Id ?? string.Empty, out var acc);
            return new CustomerDto
            {
                Id = c.Id ?? string.Empty,
                FullName = c.FullName,
                Email = c.Email,
                PhoneNumber = c.PhoneNumber,
                Role = c.Role,
                RoleDescription = c.GetRoleDescription(),
                CreatedAt = c.CreatedAt,
                AccountId = acc?.Id,
                AccountNumber = acc?.AccountNumber,
                Balance = acc?.Balance,
                IsActive = acc?.IsActive
            };
        }).ToList();
    }

    private static AuthResponse CreateAuthResponse(User user, string token, string? accountNumber = null, decimal? balance = null) => new()
    {
        Token = token,
        UserId = user.Id ?? string.Empty,
        FullName = user.FullName,
        Email = user.Email,
        Role = user.Role,
        RoleDescription = user.GetRoleDescription(),
        PortalGreeting = user.GetPortalGreeting(),
        AccountNumber = accountNumber,
        Balance = balance
    };

    public async Task SeedDefaultManagerAsync()
    {
        var managerEmail = "manager@moneybank.com";
        var existingManager = await _context.Users.Find(u => u.Email == managerEmail).FirstOrDefaultAsync();
        if (existingManager == null)
        {
            var manager = new Manager
            {
                FullName = "Admin Operations Manager",
                Email = managerEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager@123"),
                Department = "Central Operations (Mumbai)",
                CreatedAt = DateTime.UtcNow
            };
            await _context.Users.InsertOneAsync(manager);
        }

        var customerEmail = "customer@moneybank.com";
        var existingCustomer = await _context.Users.Find(u => u.Email == customerEmail).FirstOrDefaultAsync();
        if (existingCustomer == null)
        {
            await RegisterCustomerAsync(new RegisterRequest
            {
                FullName = "Rohan Sharma",
                Email = customerEmail,
                Password = "Customer@123",
                PhoneNumber = "+91 98200 12345",
                InitialDeposit = 25000
            });
        }
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secret = jwtSettings["Secret"] ?? "DefaultSuperSecretKeyForMoneyBankSystem12345";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"] ?? "MoneyBankApi",
            audience: jwtSettings["Audience"] ?? "MoneyBankClient",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(Convert.ToDouble(jwtSettings["ExpiryInDays"] ?? "7")),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
