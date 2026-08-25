using Barbearia.Api.Data;
using Barbearia.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Barbearia.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HorariosFuncionamentoController : ControllerBase
    {
        private readonly BarbeariaDbContext _context;

        public HorariosFuncionamentoController(BarbeariaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HorarioFuncionamento>>> ListarHorarios()
        {
            return await _context.HorariosFuncionamento
                .OrderBy(h => h.DiaSemana)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<HorarioFuncionamento>> CriarHorario(
            HorarioFuncionamento horario)
        {
            var existeDia = await _context.HorariosFuncionamento
                .AnyAsync(h => h.DiaSemana == horario.DiaSemana);

            if (existeDia)
            {
                return Conflict(
                    "Já existe uma configuração para este dia da semana.");
            }

            if (!horario.Fechado)
            {
                if (horario.HoraInicio == null || horario.HoraFim == null)
                {
                    return BadRequest(
                        "Informe o horário de início e fim para um dia aberto.");
                }

                if (horario.HoraInicio >= horario.HoraFim)
                {
                    return BadRequest(
                        "O horário de início deve ser anterior ao horário de fim.");
                }
            }

            if (horario.Fechado)
            {
                horario.HoraInicio = null;
                horario.HoraFim = null;
            }

            _context.HorariosFuncionamento.Add(horario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(ListarHorarios),
                new { id = horario.Id },
                horario);
        }
    }
}