import { useState } from 'react'

import '../../styles/clientes/Cliente.css'
import '../../styles/clientes/Agendamento.css'

const nomesMeses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
]

const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

const formatarDataApi = (ano, mes, dia) =>
  `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`

const formatarDataSelecionada = (data) =>
  new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  })

function Agendamento({ onAvancar, onVoltar }) {
  const hoje = new Date()

  const inicioHoje = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  )

  const primeiroMesPermitido = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    1
  )

  const [mesAtual, setMesAtual] = useState(primeiroMesPermitido)
  const [data, setData] = useState('')

  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()

  const primeiroDia = new Date(ano, mes, 1).getDay()
  const quantidadeDias = new Date(ano, mes + 1, 0).getDate()

  function dataPassou(dia) {
    return new Date(ano, mes, dia) < inicioHoje
  }

  function selecionarDia(dia) {
    if (!dataPassou(dia)) {
      setData(formatarDataApi(ano, mes, dia))
    }
  }

  function alterarMes(direcao) {
    const novoMes = new Date(ano, mes + direcao, 1)

    if (novoMes < primeiroMesPermitido) {
      return
    }

    setMesAtual(novoMes)
    setData('')
  }

  return (
    <main className="agendamento-page">
      <header className="agendamento-header">
        <button
          type="button"
          className="agendamento-voltar"
          onClick={onVoltar}
          aria-label="Voltar"
        >
          ‹
        </button>

        <h1>Escolha a data</h1>
      </header>

      <section className="calendario">
        <div className="calendario-topo">
          <button
            type="button"
            className="calendario-seta"
            onClick={() => alterarMes(-1)}
            aria-label="Mês anterior"
          >
            ‹
          </button>

          <strong>
            {nomesMeses[mes]} {ano}
          </strong>

          <button
            type="button"
            className="calendario-seta"
            onClick={() => alterarMes(1)}
            aria-label="Próximo mês"
          >
            ›
          </button>
        </div>

        <div className="calendario-semana">
          {diasSemana.map((dia) => (
            <span key={dia}>{dia}</span>
          ))}
        </div>

        <div className="calendario-dias">
          {Array.from({ length: primeiroDia }, (_, index) => (
            <span
              className="calendario-vazio"
              key={`vazio-${index}`}
            />
          ))}

          {Array.from({ length: quantidadeDias }, (_, index) => {
            const dia = index + 1
            const dataDia = formatarDataApi(ano, mes, dia)
            const selecionado = data === dataDia
            const passado = dataPassou(dia)

            return (
              <button
                type="button"
                key={dia}
                className={`calendario-dia ${
                  selecionado ? 'selecionado' : ''
                } ${passado ? 'desabilitado' : ''}`}
                disabled={passado}
                onClick={() => selecionarDia(dia)}
              >
                {dia}
              </button>
            )
          })}
        </div>

        {data && (
          <div className="data-selecionada">
            <span className="data-selecionada-icon">
              ▣
            </span>

            <strong>
              {formatarDataSelecionada(data)}
            </strong>
          </div>
        )}
      </section>

      <button
        type="button"
        className="agendamento-continuar"
        disabled={!data}
        onClick={() => onAvancar(data)}
      >
        CONTINUAR
      </button>
    </main>
  )
}

export default Agendamento