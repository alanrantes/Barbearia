function AgendamentoCard({
  agendamento,
  formatarHorario,
  onAbrir
}) {
  const confirmado = agendamento.confirmado

  return (
    <button
      type="button"
      className="admin-agendamento-card"
      onClick={() => onAbrir(agendamento.id)}
    >
      <span className="admin-agendamento-horario">
        {formatarHorario(agendamento.dataHora)}
      </span>

      <div className="admin-agendamento-info">
        <strong>{agendamento.nomeCliente}</strong>

        <span>{agendamento.servico?.nome}</span>

        <small
          className={`admin-agendamento-status ${
            confirmado ? 'confirmado' : 'pendente'
          }`}
        >
          {confirmado ? '✓ Confirmado' : 'Pendente'}
        </small>
      </div>

      <span className="admin-agendamento-seta">
        ›
      </span>
    </button>
  )
}

export default AgendamentoCard