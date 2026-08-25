import '../../styles/clientes/Cliente.css'
import '../../styles/clientes/Confirmacao.css'

const formatarData = (data) =>
  new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

const formatarHorario = (horario) =>
  new Date(horario).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })

function Confirmacao({ agendamento, onVoltar }) {
  return (
    <main className="confirmacao-page">
      <section className="confirmacao-topo">
        <div className="confirmacao-icon">✓</div>

        <h1>
          Agendamento
          <br />
          confirmado!
        </h1>
      </section>

      <section className="confirmacao-card">
        <div className="confirmacao-item">
          <div className="confirmacao-item-icon">✂</div>

          <div>
            <span>Serviço</span>
            <strong>{agendamento.servico.nome}</strong>
          </div>
        </div>

        <div className="confirmacao-item">
          <div className="confirmacao-item-icon">▣</div>

          <div>
            <span>Data</span>
            <strong className="confirmacao-data">
              {formatarData(agendamento.data)}
            </strong>
          </div>
        </div>

        <div className="confirmacao-item">
          <div className="confirmacao-item-icon">◷</div>

          <div>
            <span>Horário</span>
            <strong>{formatarHorario(agendamento.horario)}</strong>
          </div>
        </div>
      </section>

      <p className="confirmacao-aviso">
        Em caso de imprevisto, entre em contato com a barbearia.
      </p>

      <button
        type="button"
        className="confirmacao-voltar"
        onClick={onVoltar}
      >
        VOLTAR AO INÍCIO
      </button>
    </main>
  )
}

export default Confirmacao