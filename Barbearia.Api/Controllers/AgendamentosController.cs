using Barbearia.Api.Data;
using Barbearia.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Barbearia.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AgendamentosController : ControllerBase
    {
        private readonly BarbeariaDbContext _context;

        public AgendamentosController(BarbeariaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Agendamento>>> ListarAgendamentos()
        {
            return await _context.Agendamentos
                .Include(a => a.Servico)
                .OrderBy(a => a.DataHora)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Agendamento>> BuscarAgendamentoPorId(int id)
        {
            var agendamento = await _context.Agendamentos
                .Include(a => a.Servico)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (agendamento == null)
            {
                return NotFound();
            }

            return Ok(agendamento);
        }

        [HttpPost]
        public async Task<ActionResult<Agendamento>> CriarAgendamento(
            Agendamento agendamento)
        {
            if (string.IsNullOrWhiteSpace(agendamento.NomeCliente))
            {
                return BadRequest("O nome do cliente é obrigatório.");
            }

            if (string.IsNullOrWhiteSpace(agendamento.TelefoneCliente))
            {
                return BadRequest("O telefone do cliente é obrigatório.");
            }

            var servico = await _context.Servicos
                .FirstOrDefaultAsync(s =>
                    s.Id == agendamento.ServicoId &&
                    s.Ativo);

            if (servico == null)
            {
                return BadRequest("Serviço inválido ou inativo.");
            }

            if (agendamento.DataHora <= DateTime.Now)
            {
                return BadRequest(
                    "Não é possível realizar um agendamento no passado.");
            }

            var configuracaoDia = await _context.HorariosFuncionamento
                .FirstOrDefaultAsync(h =>
                    h.DiaSemana == agendamento.DataHora.DayOfWeek);

            if (configuracaoDia == null)
            {
                return BadRequest(
                    "Não existe horário de funcionamento configurado para este dia.");
            }

            if (configuracaoDia.Fechado)
            {
                return BadRequest(
                    "A barbearia está fechada neste dia.");
            }

            if (configuracaoDia.HoraInicio == null ||
                configuracaoDia.HoraFim == null)
            {
                return BadRequest(
                    "Horário de funcionamento inválido.");
            }

            var inicioExpediente =
                agendamento.DataHora.Date.Add(
                    configuracaoDia.HoraInicio.Value);

            var fimExpediente =
                agendamento.DataHora.Date.Add(
                    configuracaoDia.HoraFim.Value);

            if (agendamento.DataHora < inicioExpediente ||
                agendamento.DataHora >= fimExpediente)
            {
                return BadRequest(
                    "Horário fora do expediente.");
            }

            agendamento.DataHoraFim =
                agendamento.DataHora.AddMinutes(
                    servico.DuracaoMinutos);

            if (agendamento.DataHoraFim > fimExpediente)
            {
                return BadRequest(
                    "O serviço ultrapassa o horário de funcionamento.");
            }

            var existeBloqueio = await _context.BloqueiosHorario
                .AnyAsync(b =>
                    agendamento.DataHora < b.DataHoraFim &&
                    agendamento.DataHoraFim > b.DataHoraInicio);

            if (existeBloqueio)
            {
                return Conflict(
                    "Este horário está bloqueado pelo barbeiro.");
            }

            var existeConflito = await _context.Agendamentos
                .AnyAsync(a =>
                    agendamento.DataHora < a.DataHoraFim &&
                    agendamento.DataHoraFim > a.DataHora);

            if (existeConflito)
            {
                return Conflict(
                    "Este horário entra em conflito com outro agendamento.");
            }

            agendamento.Servico = null;

            _context.Agendamentos.Add(agendamento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(BuscarAgendamentoPorId),
                new { id = agendamento.Id },
                agendamento);
        }

        [HttpGet("disponiveis")]
        public async Task<ActionResult<IEnumerable<DateTime>>> ListarHorariosDisponiveis(
            DateTime data,
            int servicoId)
        {
            var servico = await _context.Servicos
                .FirstOrDefaultAsync(s =>
                    s.Id == servicoId &&
                    s.Ativo);

            if (servico == null)
            {
                return BadRequest(
                    "Serviço inválido ou inativo.");
            }

            if (data.Date < DateTime.Today)
            {
                return BadRequest(
                    "Não é possível consultar horários de uma data passada.");
            }

            var configuracaoDia = await _context.HorariosFuncionamento
                .FirstOrDefaultAsync(h =>
                    h.DiaSemana == data.DayOfWeek);

            if (configuracaoDia == null)
            {
                return BadRequest(
                    "Não existe horário de funcionamento configurado para este dia.");
            }

            if (configuracaoDia.Fechado)
            {
                return Ok(new List<DateTime>());
            }

            if (configuracaoDia.HoraInicio == null ||
                configuracaoDia.HoraFim == null)
            {
                return BadRequest(
                    "Horário de funcionamento inválido.");
            }

            var inicioExpediente =
                data.Date.Add(configuracaoDia.HoraInicio.Value);

            var fimExpediente =
                data.Date.Add(configuracaoDia.HoraFim.Value);

            var agendamentosDoDia = await _context.Agendamentos
                .Where(a => a.DataHora.Date == data.Date)
                .ToListAsync();

            var bloqueiosDoDia = await _context.BloqueiosHorario
                .Where(b => b.DataHoraInicio.Date == data.Date)
                .ToListAsync();

            var horariosDisponiveis = new List<DateTime>();

            for (
                var horario = inicioExpediente;
                horario.AddMinutes(servico.DuracaoMinutos) <= fimExpediente;
                horario = horario.AddMinutes(30))
            {
                if (horario <= DateTime.Now)
                {
                    continue;
                }

                var horarioFim =
                    horario.AddMinutes(servico.DuracaoMinutos);

                var conflito = agendamentosDoDia.Any(a =>
                    horario < a.DataHoraFim &&
                    horarioFim > a.DataHora);

                var bloqueado = bloqueiosDoDia.Any(b =>
                    horario < b.DataHoraFim &&
                    horarioFim > b.DataHoraInicio);

                if (conflito || bloqueado)
                {
                    continue;
                }

                horariosDisponiveis.Add(horario);
            }

            return Ok(horariosDisponiveis);
        }

        [HttpGet("por-data")]
        public async Task<ActionResult<IEnumerable<Agendamento>>> ListarAgendamentosPorData(
            DateTime data)
        {
            var agendamentos = await _context.Agendamentos
                .Include(a => a.Servico)
                .Where(a => a.DataHora.Date == data.Date)
                .OrderBy(a => a.DataHora)
                .ToListAsync();

            return Ok(agendamentos);
        }

        [HttpPatch("{id}/confirmar")]
        public async Task<IActionResult> ConfirmarAgendamento(int id)
        {
            var agendamento = await _context.Agendamentos.FindAsync(id);

            if (agendamento == null)
            {
                return NotFound();
            }

            if (agendamento.Confirmado)
            {
                return NoContent();
            }

            agendamento.Confirmado = true;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelarAgendamento(int id)
        {
            var agendamento = await _context.Agendamentos.FindAsync(id);

            if (agendamento == null)
            {
                return NotFound();
            }

            _context.Agendamentos.Remove(agendamento);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}