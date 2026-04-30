using System.ComponentModel.DataAnnotations;

namespace TravelApp.Api.DTOs;

public class AdminUserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class UpdateUserRoleRequest
{
    [Required]
    [RegularExpression("^(User|Admin)$", ErrorMessage = "Role must be User or Admin.")]
    public string Role { get; set; } = string.Empty;
}

public class AdminTravelPlanDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Budget { get; set; }
    public decimal TotalExpenses { get; set; }
    public int OwnerId { get; set; }
    public string OwnerEmail { get; set; } = string.Empty;
}
