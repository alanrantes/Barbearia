using Barbearia.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Barbearia.Api.Data
{
    public class BarbeariaDbContext : DbContext
    {
        public BarbeariaDbContext(DbContextOptions<BarbeariaDbContext> options)
            : base(options)
        {
        }

        public DbSet<Servico> Servicos { get; set; }

        public DbSet<Agendamento> Agendamentos { get; set; }

        public DbSet<HorarioFuncionamento> HorariosFuncionamento { get; set; }

        public DbSet<BloqueioHorario> BloqueiosHorario { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Servico>()
                .Property(s => s.Preco)
                .HasPrecision(10, 2);

            base.OnModelCreating(modelBuilder);
        }
    }
}