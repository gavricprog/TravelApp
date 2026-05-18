using System.ComponentModel.DataAnnotations;

namespace TravelApp.Api.DTOs;

public class ChecklistItemDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime? ReminderDate { get; set; }
    public string? Notes { get; set; }
    public bool IsDone { get; set; }
}

public class CreateChecklistItemRequest
{
    [Required, MaxLength(500)]
    public string Text { get; set; } = string.Empty;

    public DateTime? ReminderDate { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}

public class UpdateChecklistItemRequest
{
    public bool IsDone { get; set; }
}
