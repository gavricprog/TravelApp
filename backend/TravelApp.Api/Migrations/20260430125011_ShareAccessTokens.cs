using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class ShareAccessTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ShareTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TravelPlanId = table.Column<int>(type: "int", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(96)", maxLength: 96, nullable: false),
                    AccessType = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShareTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShareTokens_TravelPlans_TravelPlanId",
                        column: x => x.TravelPlanId,
                        principalTable: "TravelPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ShareTokens_Token",
                table: "ShareTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShareTokens_TravelPlanId",
                table: "ShareTokens",
                column: "TravelPlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShareTokens");
        }
    }
}
