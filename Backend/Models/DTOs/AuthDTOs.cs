namespace Backend.Models.DTOs;

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public decimal InitialDeposit { get; set; } = 0;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string RoleDescription { get; set; } = string.Empty;
    public string PortalGreeting { get; set; } = string.Empty;
    public string? AccountNumber { get; set; }
    public decimal? Balance { get; set; }
}

public class CustomerDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string RoleDescription { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? AccountId { get; set; }
    public string? AccountNumber { get; set; }
    public decimal? Balance { get; set; }
    public bool? IsActive { get; set; }
}
