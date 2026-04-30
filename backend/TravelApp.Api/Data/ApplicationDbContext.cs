using Microsoft.EntityFrameworkCore;
using TravelApp.Api.Models;

namespace TravelApp.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<TravelPlan> TravelPlans => Set<TravelPlan>();
    public DbSet<Destination> Destinations => Set<Destination>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();
    public DbSet<ShareToken> ShareTokens => Set<ShareToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<TravelPlan>(e =>
        {
            e.Property(t => t.Budget).HasPrecision(18, 2);

            e.HasOne(t => t.User)
                .WithMany(u => u.TravelPlans)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(t => t.ShareToken).IsUnique().HasFilter("[ShareToken] IS NOT NULL");
        });

        modelBuilder.Entity<Destination>(e =>
        {
            e.Property(d => d.Name).HasMaxLength(200);
            e.Property(d => d.Location).HasMaxLength(300);
            e.Property(d => d.Description).HasMaxLength(2000);
            e.Property(d => d.Notes).HasMaxLength(2000);

            e.HasOne(d => d.TravelPlan)
                .WithMany(t => t.Destinations)
                .HasForeignKey(d => d.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Activity>(e =>
        {
            e.Property(a => a.Cost).HasPrecision(18, 2);
            e.Property(a => a.Time).HasMaxLength(10);
            e.Property(a => a.Location).HasMaxLength(300);

            e.HasOne(a => a.TravelPlan)
                .WithMany(t => t.Activities)
                .HasForeignKey(a => a.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Expense>(e =>
        {
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.Category).HasMaxLength(50);

            e.HasOne(x => x.TravelPlan)
                .WithMany(t => t.Expenses)
                .HasForeignKey(x => x.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChecklistItem>(e =>
        {
            e.HasOne(c => c.TravelPlan)
                .WithMany(t => t.ChecklistItems)
                .HasForeignKey(c => c.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ShareToken>(e =>
        {
            e.Property(s => s.Token).HasMaxLength(96);
            e.HasIndex(s => s.Token).IsUnique();

            e.HasOne(s => s.TravelPlan)
                .WithMany(t => t.ShareTokens)
                .HasForeignKey(s => s.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
