using System.ComponentModel.DataAnnotations;

namespace TravelApp.Api.DTOs;

public class ChecklistItemDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsDone { get; set; }
}

public class CreateChecklistItemRequest
{
    [Required, MaxLength(500)]
    public string Text { get; set; } = string.Empty;
}

public class UpdateChecklistItemRequest
{
    public bool IsDone { get; set; }
}
