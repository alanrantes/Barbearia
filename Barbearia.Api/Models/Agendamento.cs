namespace Barbearia.Api.Models
{
    public class Agendamento
    {
        public int Id { get; set; }

        public string NomeCliente { get; set; } = string.Empty;

        public string TelefoneCliente { get; set; } = string.Empty;

        public DateTime DataHora { get; set; }

        public DateTime DataHoraFim { get; set; }

        public int ServicoId { get; set; }

        public Servico? Servico { get; set; }

        public bool Confirmado { get; set; } = false;
    }
}