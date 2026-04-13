using System.ComponentModel.DataAnnotations;

namespace TravelApp.Api.DTOs;

public class ExpenseDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "General";
    public DateTime? SpentOn { get; set; }
}

public class CreateExpenseRequest
{
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be positive")]
    public decimal Amount { get; set; }

    [Required, MaxLength(200)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Category { get; set; }

    public DateTime? SpentOn { get; set; }
}
