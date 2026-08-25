namespace Barbearia.Api.Models
{
    public class HorarioFuncionamento
    {
        public int Id { get; set; }

        public DayOfWeek DiaSemana { get; set; }

        public TimeSpan? HoraInicio { get; set; }

        public TimeSpan? HoraFim { get; set; }

        public bool Fechado { get; set; }
    }
}