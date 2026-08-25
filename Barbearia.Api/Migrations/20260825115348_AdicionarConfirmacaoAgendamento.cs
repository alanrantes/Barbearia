using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Barbearia.Api.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarConfirmacaoAgendamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Confirmado",
                table: "Agendamentos",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Confirmado",
                table: "Agendamentos");
        }
    }
}
