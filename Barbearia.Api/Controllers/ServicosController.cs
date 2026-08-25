using Barbearia.Api.Data;
using Barbearia.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Barbearia.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicosController : ControllerBase
    {
        private readonly BarbeariaDbContext _context;

        public ServicosController(BarbeariaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Servico>>> ListarServicos()
        {
            return await _context.Servicos
                .Where(s => s.Ativo)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Servico>> CriarServico(Servico servico)
        {
            _context.Servicos.Add(servico);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(BuscarServicoPorId),
                new { id = servico.Id },
                servico);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Servico>> BuscarServicoPorId(int id)
        {
            var servico = await _context.Servicos.FindAsync(id);

            if (servico == null)
            {
                return NotFound();
            }

            return Ok(servico);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarServico(int id, Servico servico)
        {
            if (id != servico.Id)
            {
                return BadRequest();
            }

            var servicoExistente = await _context.Servicos.FindAsync(id);

            if (servicoExistente == null)
            {
                return NotFound();
            }

            servicoExistente.Nome = servico.Nome;
            servicoExistente.Preco = servico.Preco;
            servicoExistente.DuracaoMinutos = servico.DuracaoMinutos;
            servicoExistente.Ativo = servico.Ativo;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> ExcluirServico(int id)
        {
            var servico = await _context.Servicos.FindAsync(id);

            if (servico == null)
            {
                return NotFound();
            }

            servico.Ativo = false;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}