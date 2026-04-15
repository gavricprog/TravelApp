using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TravelApp.Api.Models;
using TravelApp.Api.TravelModule.Repositories;

namespace TravelApp.Api.TravelModule.Services;

public class TravelPdfService : ITravelPdfService
{
    private readonly ITravelRepository _travel;

    public TravelPdfService(ITravelRepository travel)
    {
        _travel = travel;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<(bool ok, string? error, byte[]? content, string? fileName)> GeneratePlanPdfAsync(int travelPlanId, int userId)
    {
        var plan = await _travel.GetOwnedWithDetailsAsync(travelPlanId, userId);
        if (plan == null)
            return (false, "Travel plan not found.", null, null);

        var totalCost = plan.Expenses.Sum(x => x.Amount);
        var remainingBudget = plan.Budget - totalCost;
        var groupedActivities = plan.Activities
            .OrderBy(a => a.DayDate.Date)
            .ThenBy(a => a.Time ?? "99:99")
            .ThenBy(a => a.Id)
            .GroupBy(a => a.DayDate.Date)
            .ToList();

        var doc = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(30);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Column(header =>
                {
                    header.Item().Text(plan.Title).FontSize(22).SemiBold().FontColor(Colors.Teal.Darken2);
                    header.Item().Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC").FontSize(9).FontColor(Colors.Grey.Darken1);
                });

                page.Content().Column(content =>
                {
                    content.Spacing(14);

                    content.Item().Element(c => SectionTitle(c, "1. Basic Information"));
                    content.Item().Element(c => BasicInfoTable(c, plan));

                    content.Item().Element(c => SectionTitle(c, "2. Destinations"));
                    if (plan.Destinations.Any())
                    {
                        content.Item().Element(c => DestinationsTable(c, plan.Destinations.OrderBy(d => d.SortOrder).ToList()));
                    }
                    else
                    {
                        content.Item().Text("No destinations available.").Italic().FontColor(Colors.Grey.Darken1);
                    }

                    content.Item().Element(c => SectionTitle(c, "3. Activities (Grouped by Date)"));
                    if (groupedActivities.Any())
                    {
                        foreach (var group in groupedActivities)
                        {
                            content.Item().Text(group.Key.ToString("yyyy-MM-dd")).SemiBold().FontColor(Colors.Teal.Darken1);
                            content.Item().Element(c => ActivitiesTable(c, group.ToList()));
                        }
                    }
                    else
                    {
                        content.Item().Text("No activities available.").Italic().FontColor(Colors.Grey.Darken1);
                    }

                    content.Item().Element(c => SectionTitle(c, "4. Budget Summary"));
                    content.Item().Element(c => BudgetTable(c, plan.Budget, totalCost, remainingBudget));

                    content.Item().Element(c => SectionTitle(c, "5. Notes / Checklist"));
                    content.Item().Element(c => NotesAndChecklist(c, plan));
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        var fileName = $"travel-plan-{SanitizeFileName(plan.Title)}-{DateTime.UtcNow:yyyyMMddHHmm}.pdf";
        return (true, null, doc.GeneratePdf(), fileName);
    }

    private static void SectionTitle(IContainer container, string title)
    {
        container.PaddingBottom(4).Text(title).FontSize(14).Bold().FontColor(Colors.BlueGrey.Darken2);
    }

    private static void BasicInfoTable(IContainer container, TravelPlan plan)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(140);
                columns.RelativeColumn();
            });

            Row(table, "Name", plan.Title);
            Row(table, "Description", "N/A");
            Row(table, "Start Date", plan.StartDate.ToString("yyyy-MM-dd"));
            Row(table, "End Date", plan.EndDate.ToString("yyyy-MM-dd"));
            Row(table, "Budget", plan.Budget.ToString("0.00"));
        });
    }

    private static void DestinationsTable(IContainer container, List<Destination> destinations)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(2);
                columns.RelativeColumn(2);
                columns.RelativeColumn(1.2f);
                columns.RelativeColumn(1.2f);
                columns.RelativeColumn(2);
                columns.RelativeColumn(2);
            });

            HeaderCell(table, "Name");
            HeaderCell(table, "Location");
            HeaderCell(table, "Start");
            HeaderCell(table, "End");
            HeaderCell(table, "Description");
            HeaderCell(table, "Notes");

            foreach (var d in destinations)
            {
                BodyCell(table, d.Name);
                BodyCell(table, d.Location);
                BodyCell(table, d.StartDate.ToString("yyyy-MM-dd"));
                BodyCell(table, d.EndDate.ToString("yyyy-MM-dd"));
                BodyCell(table, d.Description ?? "-");
                BodyCell(table, d.Notes ?? "-");
            }
        });
    }

    private static void ActivitiesTable(IContainer container, List<Activity> activities)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(2);
                columns.RelativeColumn(1);
                columns.RelativeColumn(2);
                columns.RelativeColumn(1);
                columns.RelativeColumn(1);
            });

            HeaderCell(table, "Title");
            HeaderCell(table, "Time");
            HeaderCell(table, "Location");
            HeaderCell(table, "Status");
            HeaderCell(table, "Cost");

            foreach (var activity in activities)
            {
                BodyCell(table, activity.Title);
                BodyCell(table, string.IsNullOrWhiteSpace(activity.Time) ? "-" : activity.Time);
                BodyCell(table, string.IsNullOrWhiteSpace(activity.Location) ? "-" : activity.Location);
                BodyCell(table, activity.Status.ToString());
                BodyCell(table, activity.Cost?.ToString("0.00") ?? "-");
            }
        });
    }

    private static void BudgetTable(IContainer container, decimal budget, decimal totalCost, decimal remaining)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(180);
                columns.RelativeColumn();
            });

            Row(table, "Planned Budget", budget.ToString("0.00"));
            Row(table, "Total Cost", totalCost.ToString("0.00"));
            Row(table, "Remaining Budget", remaining.ToString("0.00"));
        });
    }

    private static void NotesAndChecklist(IContainer container, TravelPlan plan)
    {
        container.Column(col =>
        {
            col.Spacing(6);
            col.Item().Text("Checklist").SemiBold();

            if (plan.ChecklistItems.Any())
            {
                foreach (var item in plan.ChecklistItems.OrderBy(x => x.Id))
                {
                    var mark = item.IsDone ? "[x]" : "[ ]";
                    col.Item().Text($"{mark} {item.Text}");
                }
            }
            else
            {
                col.Item().Text("No checklist items.").Italic().FontColor(Colors.Grey.Darken1);
            }

            var notes = plan.Destinations
                .Where(d => !string.IsNullOrWhiteSpace(d.Notes))
                .Select(d => $"{d.Name}: {d.Notes}")
                .Concat(plan.Activities.Where(a => !string.IsNullOrWhiteSpace(a.Notes)).Select(a => $"{a.DayDate:yyyy-MM-dd} - {a.Title}: {a.Notes}"))
                .ToList();

            col.Item().PaddingTop(6).Text("Notes").SemiBold();
            if (notes.Any())
            {
                foreach (var note in notes)
                    col.Item().Text($"- {note}");
            }
            else
            {
                col.Item().Text("No notes available.").Italic().FontColor(Colors.Grey.Darken1);
            }
        });
    }

    private static void Row(TableDescriptor table, string key, string value)
    {
        table.Cell().PaddingVertical(4).Text(key).SemiBold();
        table.Cell().PaddingVertical(4).Text(string.IsNullOrWhiteSpace(value) ? "-" : value);
    }

    private static void HeaderCell(TableDescriptor table, string text)
    {
        table.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text(text).SemiBold();
    }

    private static void BodyCell(TableDescriptor table, string text)
    {
        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(string.IsNullOrWhiteSpace(text) ? "-" : text);
    }

    private static string SanitizeFileName(string value)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var clean = string.Concat(value.Select(ch => invalid.Contains(ch) ? '-' : ch));
        return string.IsNullOrWhiteSpace(clean) ? "travel-plan" : clean.Trim();
    }
}
