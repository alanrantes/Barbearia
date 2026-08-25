using Barbearia.Api.Data;
using Barbearia.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Barbearia.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BloqueiosHorarioController : ControllerBase
    {
        private readonly BarbeariaDbContext _context;

        public BloqueiosHorarioController(BarbeariaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BloqueioHorario>>> ListarBloqueios()
        {
            return await _context.BloqueiosHorario
                .OrderBy(b => b.DataHoraInicio)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<BloqueioHorario>> CriarBloqueio(
            BloqueioHorario bloqueio)
        {
            if (bloqueio.DataHoraInicio >= bloqueio.DataHoraFim)
            {
                return BadRequest(
                    "O horário de início deve ser anterior ao horário de fim.");
            }

            var existeConflito = await _context.BloqueiosHorario
                .AnyAsync(b =>
                    bloqueio.DataHoraInicio < b.DataHoraFim &&
                    bloqueio.DataHoraFim > b.DataHoraInicio);

            if (existeConflito)
            {
                return Conflict(
                    "Este bloqueio entra em conflito com outro bloqueio existente.");
            }

            _context.BloqueiosHorario.Add(bloqueio);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(ListarBloqueios),
                new { id = bloqueio.Id },
                bloqueio);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> ExcluirBloqueio(int id)
        {
            var bloqueio = await _context.BloqueiosHorario.FindAsync(id);

            if (bloqueio == null)
            {
                return NotFound();
            }

            _context.BloqueiosHorario.Remove(bloqueio);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}