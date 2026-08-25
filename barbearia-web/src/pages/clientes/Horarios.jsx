import { useEffect, useState } from 'react'

import API_URL from '../../services/api'

import '../../styles/clientes/Cliente.css'
import '../../styles/clientes/Horarios.css'

const formatarHorario = (horario) =>
  new Date(horario).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })

const formatarData = (data) =>
  new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  })

function Horarios({ servico, data, onVoltar, onAvancar }) {
  const [horarios, setHorarios] = useState([])
  const [horarioSelecionado, setHorarioSelecionado] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarHorarios() {
      try {
        setCarregando(true)

        const response = await fetch(
          `${API_URL}/Agendamentos/disponiveis?data=${data}&servicoId=${servico.id}`
        )

        if (!response.ok) {
          throw new Error('Erro ao carregar horários')
        }

        setHorarios(await response.json())
      } catch (error) {
        console.error('Erro ao carregar horários:', error)
        setHorarios([])
      } finally {
        setCarregando(false)
      }
    }

    carregarHorarios()
  }, [data, servico.id])

  function selecionarHorario(horario) {
    setHorarioSelecionado(horario)
  }

  function continuar() {
    if (!horarioSelecionado) return

    onAvancar(horarioSelecionado)
  }

  return (
    <main className="horarios-page">
      <header className="horarios-header">
        <button
          type="button"
          className="horarios-voltar"
          onClick={onVoltar}
          aria-label="Voltar"
        >
          ‹
        </button>

        <div>
          <h1>Escolha o horário</h1>
          <span>{formatarData(data)}</span>
        </div>
      </header>

      <section className="horarios-lista">
        {carregando && (
          <p className="horarios-mensagem">
            Carregando horários...
          </p>
        )}

        {!carregando && horarios.length === 0 && (
          <div className="horarios-vazio">
            <strong>Nenhum horário disponível</strong>
            <span>Volte e escolha outra data.</span>
          </div>
        )}

        {!carregando &&
          horarios.map((horario) => {
            const selecionado =
              horarioSelecionado === horario

            return (
              <button
                type="button"
                key={horario}
                className={`horario-item ${
                  selecionado ? 'selecionado' : ''
                }`}
                onClick={() => selecionarHorario(horario)}
              >
                <span>
                  {formatarHorario(horario)}
                </span>

                {selecionado && (
                  <span className="horario-check">
                    ✓
                  </span>
                )}
              </button>
            )
          })}
      </section>

      <button
        type="button"
        className="horarios-continuar"
        disabled={!horarioSelecionado}
        onClick={continuar}
      >
        CONTINUAR
      </button>
    </main>
  )
}

export default Horarios