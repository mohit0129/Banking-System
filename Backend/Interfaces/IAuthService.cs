using Backend.Models;
using Backend.Models.DTOs;

namespace Backend.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterCustomerAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<User?> GetUserByIdAsync(string id);
    Task<List<CustomerDto>> GetAllCustomersAsync();
    Task SeedDefaultManagerAsync();
}
