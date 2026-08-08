using System.Net.Mail;
using Backend.Interfaces;
using Backend.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Authorize(Roles = "Manager")]
[ApiController]
[Route("api/[controller]")]
public class ManagerController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IBankingService _bankingService;

    public ManagerController(IAuthService authService, IBankingService bankingService)
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

    [HttpGet("customers")]
    public async Task<IActionResult> GetAllCustomers() =>
        Ok(await _authService.GetAllCustomersAsync());

    [HttpGet("accounts")]
    public async Task<IActionResult> GetAllAccounts() =>
        Ok(await _bankingService.GetAllAccountsWithCustomerDetailsAsync());

    [HttpPost("create-customer-account")]
    public async Task<IActionResult> CreateCustomerAccount([FromBody] RegisterRequest req)
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
            return Ok(new { message = "Customer account created successfully.", customer = res });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetAllTransactions() =>
        Ok(await _bankingService.GetAllTransactionsAsync());

    [HttpPatch("accounts/{accountId}/toggle-status")]
    public async Task<IActionResult> ToggleAccountStatus(string accountId, [FromBody] ToggleStatusRequest req)
    {
        try
        {
            var acc = await _bankingService.ToggleAccountStatusAsync(accountId, req.IsActive);
            return Ok(new
            {
                message = $"Account {acc.AccountNumber} is now {(acc.IsActive ? "Activated" : "Deactivated")}.",
                accountId = acc.Id,
                accountNumber = acc.AccountNumber,
                isActive = acc.IsActive
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
