import { useEffect, useState } from 'react'
import API_URL from '../../services/api'
import '../../styles/clientes/Cliente.css'
import '../../styles/clientes/Servicos.css'

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})

function Servicos({ onSelecionar, onVoltar }) {
  const [servicos, setServicos] = useState([])
  const [servicoSelecionado, setServicoSelecionado] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarServicos() {
      try {
        const response = await fetch(`${API_URL}/Servicos`)

        if (!response.ok) {
          throw new Error('Erro ao carregar serviços')
        }

        setServicos(await response.json())
      } catch (error) {
        console.error('Erro ao carregar serviços:', error)
      } finally {
        setCarregando(false)
      }
    }

    carregarServicos()
  }, [])

  if (carregando) {
    return (
      <main className="servicos-page">
        <p>Carregando serviços...</p>
      </main>
    )
  }

  return (
    <main className="servicos-page">
      <header className="servicos-header">
        <button
          type="button"
          className="servicos-voltar"
          onClick={onVoltar}
          aria-label="Voltar"
        >
          ‹
        </button>

        <h1>Escolha o serviço</h1>
      </header>

      <section className="servicos-list">
        {servicos.map((servico) => {
          const selecionado = servicoSelecionado?.id === servico.id

          return (
            <button
              type="button"
              key={servico.id}
              className={`servico-card ${selecionado ? 'selecionado' : ''}`}
              onClick={() => setServicoSelecionado(servico)}
            >
              <div className="servico-icon">✂</div>

              <div className="servico-info">
                <strong>{servico.nome}</strong>
                <span>{servico.duracaoMinutos} min</span>
              </div>

              <strong className="servico-preco">
                {formatadorMoeda.format(servico.preco)}
              </strong>
            </button>
          )
        })}
      </section>

      <button
        type="button"
        className="servicos-continuar"
        disabled={!servicoSelecionado}
        onClick={() => onSelecionar(servicoSelecionado)}
      >
        CONTINUAR
      </button>
    </main>
  )
}

export default Servicos