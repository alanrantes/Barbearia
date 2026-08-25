namespace Barbearia.Api.Models
{
    public class BloqueioHorario
    {
        public int Id { get; set; }

        public DateTime DataHoraInicio { get; set; }

        public DateTime DataHoraFim { get; set; }

        public string? Motivo { get; set; }
    }
}