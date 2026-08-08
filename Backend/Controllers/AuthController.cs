using System.Net.Mail;
using System.Security.Claims;
using Backend.Interfaces;
using Backend.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IBankingService _bankingService;

    public AuthController(IAuthService authService, IBankingService bankingService)
    {
        _authService = authService;
        _bankingService = bankingService;
    }

    private static bool IsValidEmail(string email) =>
        !string.IsNullOrWhiteSpace(email) &&
        MailAddress.TryCreate(email.Trim(), out var addr) &&
        addr.Address == email.Trim() &&
        email.Contains('.') &&
        email.IndexOf('@') > 0;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.FullName) || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Full name, email, and password are required." });

        if (!IsValidEmail(req.Email))
            return BadRequest(new { message = "Please enter a valid email address." });

        if (req.Password.Trim().Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters long." });

        if (req.InitialDeposit < 0)
            return BadRequest(new { message = "Initial deposit cannot be negative." });

        try
        {
            var res = await _authService.RegisterCustomerAsync(req);
            return Ok(res);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Email and password are required." });

        if (!IsValidEmail(req.Email))
            return BadRequest(new { message = "Please enter a valid email address." });

        try
        {
            var res = await _authService.LoginAsync(req);
            return Ok(res);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _authService.GetUserByIdAsync(userId);
        if (user is null) return NotFound(new { message = "User not found." });

        string? accNum = null;
        decimal? bal = null;

        if (user.Role == "Customer")
        {
            var acc = await _bankingService.GetAccountByCustomerIdAsync(user.Id!);
            accNum = acc?.AccountNumber;
            bal = acc?.Balance;
        }

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.Role,
            RoleDescription = user.GetRoleDescription(),
            PortalGreeting = user.GetPortalGreeting(),
            AccountNumber = accNum,
            Balance = bal
        });
    }
}
