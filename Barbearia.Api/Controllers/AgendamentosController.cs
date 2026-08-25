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

        private static readonly TimeZoneInfo FusoHorario =
            TimeZoneInfo.FindSystemTimeZoneById(
                OperatingSystem.IsWindows()
                    ? "E. South America Standard Time"
                    : "America/Sao_Paulo"
            );

        public AgendamentosController(BarbeariaDbContext context)
        {
            _context = context;
        }

        private static DateTime AgoraLocal()
        {
            return TimeZoneInfo.ConvertTimeFromUtc(
                DateTime.UtcNow,
                FusoHorario
            );
        }

        private static DateTime ParaUtc(DateTime dataHora)
        {
            if (dataHora.Kind == DateTimeKind.Utc)
            {
                return dataHora;
            }

            if (dataHora.Kind == DateTimeKind.Local)
            {
                return dataHora.ToUniversalTime();
            }

            return TimeZoneInfo.ConvertTimeToUtc(
                DateTime.SpecifyKind(
                    dataHora,
                    DateTimeKind.Unspecified
                ),
                FusoHorario
            );
        }

        private static DateTime ParaHorarioLocal(DateTime dataHoraUtc)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(
                DateTime.SpecifyKind(
                    dataHoraUtc,
                    DateTimeKind.Utc
                ),
                FusoHorario
            );
        }

        private static DateTime InicioDiaUtc(DateTime data)
        {
            var inicioLocal = DateTime.SpecifyKind(
                data.Date,
                DateTimeKind.Unspecified
            );

            return TimeZoneInfo.ConvertTimeToUtc(
                inicioLocal,
                FusoHorario
            );
        }

        private static DateTime FimDiaUtc(DateTime data)
        {
            var fimLocal = DateTime.SpecifyKind(
                data.Date.AddDays(1),
                DateTimeKind.Unspecified
            );

            return TimeZoneInfo.ConvertTimeToUtc(
                fimLocal,
                FusoHorario
            );
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
                return BadRequest(
                    "O nome do cliente é obrigatório.");
            }

            if (string.IsNullOrWhiteSpace(agendamento.TelefoneCliente))
            {
                return BadRequest(
                    "O telefone do cliente é obrigatório.");
            }

            var servico = await _context.Servicos
                .FirstOrDefaultAsync(s =>
                    s.Id == agendamento.ServicoId &&
                    s.Ativo);

            if (servico == null)
            {
                return BadRequest(
                    "Serviço inválido ou inativo.");
            }

            var dataHoraUtc =
                ParaUtc(agendamento.DataHora);

            var dataHoraLocal =
                ParaHorarioLocal(dataHoraUtc);

            if (dataHoraLocal <= AgoraLocal())
            {
                return BadRequest(
                    "Não é possível realizar um agendamento no passado.");
            }

            var configuracaoDia =
                await _context.HorariosFuncionamento
                    .FirstOrDefaultAsync(h =>
                        h.DiaSemana ==
                        dataHoraLocal.DayOfWeek);

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

            var inicioExpedienteLocal =
                dataHoraLocal.Date.Add(
                    configuracaoDia.HoraInicio.Value);

            var fimExpedienteLocal =
                dataHoraLocal.Date.Add(
                    configuracaoDia.HoraFim.Value);

            var inicioExpedienteUtc =
                ParaUtc(inicioExpedienteLocal);

            var fimExpedienteUtc =
                ParaUtc(fimExpedienteLocal);

            if (dataHoraUtc < inicioExpedienteUtc ||
                dataHoraUtc >= fimExpedienteUtc)
            {
                return BadRequest(
                    "Horário fora do expediente.");
            }

            var dataHoraFimUtc =
                dataHoraUtc.AddMinutes(
                    servico.DuracaoMinutos);

            if (dataHoraFimUtc > fimExpedienteUtc)
            {
                return BadRequest(
                    "O serviço ultrapassa o horário de funcionamento.");
            }

            var existeBloqueio =
                await _context.BloqueiosHorario
                    .AnyAsync(b =>
                        dataHoraUtc < b.DataHoraFim &&
                        dataHoraFimUtc > b.DataHoraInicio);

            if (existeBloqueio)
            {
                return Conflict(
                    "Este horário está bloqueado pelo barbeiro.");
            }

            var existeConflito =
                await _context.Agendamentos
                    .AnyAsync(a =>
                        dataHoraUtc < a.DataHoraFim &&
                        dataHoraFimUtc > a.DataHora);

            if (existeConflito)
            {
                return Conflict(
                    "Este horário entra em conflito com outro agendamento.");
            }

            agendamento.DataHora = dataHoraUtc;
            agendamento.DataHoraFim = dataHoraFimUtc;
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

            var dataLocal = data.Date;

            if (dataLocal < AgoraLocal().Date)
            {
                return BadRequest(
                    "Não é possível consultar horários de uma data passada.");
            }

            var configuracaoDia =
                await _context.HorariosFuncionamento
                    .FirstOrDefaultAsync(h =>
                        h.DiaSemana ==
                        dataLocal.DayOfWeek);

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

            var inicioDiaUtc =
                InicioDiaUtc(dataLocal);

            var fimDiaUtc =
                FimDiaUtc(dataLocal);

            var agendamentosDoDia =
                await _context.Agendamentos
                    .Where(a =>
                        a.DataHora >= inicioDiaUtc &&
                        a.DataHora < fimDiaUtc)
                    .ToListAsync();

            var bloqueiosDoDia =
                await _context.BloqueiosHorario
                    .Where(b =>
                        b.DataHoraInicio >= inicioDiaUtc &&
                        b.DataHoraInicio < fimDiaUtc)
                    .ToListAsync();

            var inicioExpedienteLocal =
                dataLocal.Add(
                    configuracaoDia.HoraInicio.Value);

            var fimExpedienteLocal =
                dataLocal.Add(
                    configuracaoDia.HoraFim.Value);

            var horariosDisponiveis =
                new List<DateTime>();

            for (
                var horarioLocal = inicioExpedienteLocal;
                horarioLocal.AddMinutes(
                    servico.DuracaoMinutos)
                    <= fimExpedienteLocal;
                horarioLocal =
                    horarioLocal.AddMinutes(30))
            {
                var horarioUtc =
                    ParaUtc(horarioLocal);

                var horarioFimUtc =
                    horarioUtc.AddMinutes(
                        servico.DuracaoMinutos);

                if (horarioUtc <= DateTime.UtcNow)
                {
                    continue;
                }

                var conflito =
                    agendamentosDoDia.Any(a =>
                        horarioUtc < a.DataHoraFim &&
                        horarioFimUtc > a.DataHora);

                var bloqueado =
                    bloqueiosDoDia.Any(b =>
                        horarioUtc < b.DataHoraFim &&
                        horarioFimUtc >
                        b.DataHoraInicio);

                if (conflito || bloqueado)
                {
                    continue;
                }

                horariosDisponiveis.Add(horarioUtc);
            }

            return Ok(horariosDisponiveis);
        }

        [HttpGet("por-data")]
        public async Task<ActionResult<IEnumerable<Agendamento>>> ListarAgendamentosPorData(
            DateTime data)
        {
            var inicioUtc = InicioDiaUtc(data);
            var fimUtc = FimDiaUtc(data);

            var agendamentos =
                await _context.Agendamentos
                    .Include(a => a.Servico)
                    .Where(a =>
                        a.DataHora >= inicioUtc &&
                        a.DataHora < fimUtc)
                    .OrderBy(a => a.DataHora)
                    .ToListAsync();

            return Ok(agendamentos);
        }

        [HttpPatch("{id}/confirmar")]
        public async Task<IActionResult> ConfirmarAgendamento(
            int id)
        {
            var agendamento =
                await _context.Agendamentos
                    .FindAsync(id);

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
        public async Task<IActionResult> CancelarAgendamento(
            int id)
        {
            var agendamento =
                await _context.Agendamentos
                    .FindAsync(id);

            if (agendamento == null)
            {
                return NotFound();
            }

            _context.Agendamentos.Remove(
                agendamento);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}