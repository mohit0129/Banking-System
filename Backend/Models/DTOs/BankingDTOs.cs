namespace Backend.Models.DTOs;

public class DepositRequest
{
    public decimal Amount { get; set; }
    public string? Note { get; set; }
}

public class WithdrawRequest : DepositRequest { }

public class TransferRequest
{
    public string TargetAccountNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Note { get; set; }
}

public class ToggleStatusRequest
{
    public bool IsActive { get; set; }
}

public class AccountDetailDto
{
    public string Id { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PayeeDto
{
    public string AccountNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
}
