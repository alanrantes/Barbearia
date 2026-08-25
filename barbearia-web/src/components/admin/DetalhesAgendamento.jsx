function DetalhesAgendamento({
  agendamento,
  formatarData,
  formatarHorario,
  formatarTelefone,
  onVoltar,
  onWhatsApp,
  onConfirmar,
  onCancelar
}) {
  return (
    <section className="admin-detalhes-content">
      <header className="admin-detalhes-header">
        <button
          type="button"
          onClick={onVoltar}
          aria-label="Voltar"
        >
          ‹
        </button>

        <h1>Detalhes do agendamento</h1>
      </header>

      <section className="admin-detalhes-card">
        <div className="admin-cliente">
          <div className="admin-cliente-avatar">
            {agendamento.nomeCliente
              .trim()
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>{agendamento.nomeCliente}</strong>
            <span>{agendamento.servico?.nome}</span>
          </div>
        </div>

        <div className="admin-detalhes-info">
          <div>
            <span>Data</span>
            <strong>
              {formatarData(agendamento.dataHora)}
            </strong>
          </div>

          <div>
            <span>Horário</span>
            <strong>
              {formatarHorario(agendamento.dataHora)}
            </strong>
          </div>

          <div>
            <span>WhatsApp</span>
            <strong>
              {formatarTelefone(
                agendamento.telefoneCliente
              )}
            </strong>
          </div>
        </div>

        <div className="admin-detalhes-acoes">
          <button
            type="button"
            className="admin-whatsapp"
            onClick={onWhatsApp}
          >
            ABRIR WHATSAPP
          </button>

          <button
            type="button"
            className={`admin-confirmar-agendamento ${
              agendamento.confirmado ? 'confirmado' : ''
            }`}
            onClick={onConfirmar}
            disabled={agendamento.confirmado}
          >
            {agendamento.confirmado
              ? '✓ AGENDAMENTO CONFIRMADO'
              : 'MARCAR COMO CONFIRMADO'}
          </button>

          <button
            type="button"
            className="admin-cancelar-agendamento"
            onClick={onCancelar}
          >
            CANCELAR AGENDAMENTO
          </button>
        </div>
      </section>
    </section>
  )
}

export default DetalhesAgendamento