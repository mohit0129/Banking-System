using System.Security.Claims;
using Backend.Interfaces;
using Backend.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Authorize(Roles = "Customer")]
[ApiController]
[Route("api/[controller]")]
public class BankingController : ControllerBase
{
    private readonly IBankingService _bankingService;

    public BankingController(IBankingService bankingService) => _bankingService = bankingService;

    private string CustomerId => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("Customer identifier not found.");

    [HttpGet("account")]
    public async Task<IActionResult> GetAccount()
    {
        var acc = await _bankingService.GetAccountByCustomerIdAsync(CustomerId);
        return acc is null ? NotFound(new { message = "Bank account not found." }) : Ok(acc);
    }

    [HttpPost("deposit")]
    public async Task<IActionResult> Deposit([FromBody] DepositRequest req)
    {
        if (req.Amount <= 0) return BadRequest(new { message = "Deposit amount must be greater than zero." });
        try
        {
            var acc = await _bankingService.DepositAsync(CustomerId, req.Amount, req.Note);
            return Ok(new { message = $"Successfully deposited ₹{req.Amount:N2}.", acc.AccountNumber, acc.Balance });
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("withdraw")]
    public async Task<IActionResult> Withdraw([FromBody] WithdrawRequest req)
    {
        if (req.Amount <= 0) return BadRequest(new { message = "Withdrawal amount must be greater than zero." });
        try
        {
            var acc = await _bankingService.WithdrawAsync(CustomerId, req.Amount, req.Note);
            return Ok(new { message = $"Successfully withdrew ₹{req.Amount:N2}.", acc.AccountNumber, acc.Balance });
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> Transfer([FromBody] TransferRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.TargetAccountNumber))
            return BadRequest(new { message = "Target account number is required." });
        if (req.Amount <= 0)
            return BadRequest(new { message = "Transfer amount must be greater than zero." });

        try
        {
            var (source, target) = await _bankingService.TransferAsync(CustomerId, req.TargetAccountNumber, req.Amount, req.Note);
            return Ok(new
            {
                message = $"Successfully transferred ₹{req.Amount:N2} to account {target.AccountNumber}.",
                accountNumber = source.AccountNumber,
                balance = source.Balance,
                targetAccountNumber = target.AccountNumber
            });
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions() =>
        Ok(await _bankingService.GetCustomerTransactionsAsync(CustomerId));

    [HttpGet("payees")]
    public async Task<IActionResult> GetPayees() =>
        Ok(await _bankingService.GetAvailablePayeesAsync(CustomerId));
}
