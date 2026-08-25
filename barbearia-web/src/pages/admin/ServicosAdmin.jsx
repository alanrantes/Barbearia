import { useEffect, useState } from 'react'

import API_URL from '../../services/api'

import AdminSidebar from '../../components/admin/AdminSidebar'

import '../../styles/admin/Admin.css'
import '../../styles/admin/ServicosAdmin.css'

const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})

function ServicosAdmin() {
  const [servicos, setServicos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [modalAberto, setModalAberto] = useState(false)
  const [servicoEditando, setServicoEditando] = useState(null)

  const [nome, setNome] = useState('')
  const [duracaoMinutos, setDuracaoMinutos] = useState('')
  const [preco, setPreco] = useState('')

  async function carregarServicos() {
    try {
      setCarregando(true)

      const response = await fetch(`${API_URL}/Servicos`)

      if (!response.ok) {
        throw new Error('Erro ao carregar serviços')
      }

      setServicos(await response.json())
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
      setServicos([])
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarServicos()
  }, [])

  function abrirNovoServico() {
    setServicoEditando(null)
    setNome('')
    setDuracaoMinutos('')
    setPreco('')
    setModalAberto(true)
  }

  function abrirEdicao(servico) {
    setServicoEditando(servico)
    setNome(servico.nome)
    setDuracaoMinutos(String(servico.duracaoMinutos))
    setPreco(String(servico.preco).replace('.', ','))
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setServicoEditando(null)
    setNome('')
    setDuracaoMinutos('')
    setPreco('')
  }

  async function salvarServico(event) {
    event.preventDefault()

    const duracao = Number(duracaoMinutos)
    const valor = Number(preco.replace(',', '.'))

    if (!nome.trim() || duracao <= 0 || valor <= 0) {
      alert('Preencha todos os campos corretamente.')
      return
    }

    const dados = {
      nome: nome.trim(),
      duracaoMinutos: duracao,
      preco: valor,
      ativo: true
    }

    try {
      const editando = Boolean(servicoEditando)

      const response = await fetch(
        editando
          ? `${API_URL}/Servicos/${servicoEditando.id}`
          : `${API_URL}/Servicos`,
        {
          method: editando ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            editando
              ? {
                  id: servicoEditando.id,
                  ...dados
                }
              : dados
          )
        }
      )

      if (!response.ok) {
        const mensagem = await response.text()

        alert(
          mensagem ||
            `Não foi possível ${
              editando ? 'atualizar' : 'cadastrar'
            } o serviço.`
        )

        return
      }

      fecharModal()
      await carregarServicos()
    } catch (error) {
      console.error('Erro ao salvar serviço:', error)
      alert('Não foi possível salvar o serviço.')
    }
  }

  async function excluirServico() {
    if (!servicoEditando) return

    const confirmar = window.confirm(
      `Excluir o serviço "${servicoEditando.nome}"?`
    )

    if (!confirmar) return

    try {
      const response = await fetch(
        `${API_URL}/Servicos/${servicoEditando.id}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao excluir serviço')
      }

      fecharModal()
      await carregarServicos()
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
      alert('Não foi possível excluir o serviço.')
    }
  }

  return (
    <main className="admin-servicos-page">
      <AdminSidebar paginaAtiva="servicos" />

      <section className="admin-servicos-content">
        <header className="admin-servicos-header">
          <div>
            <span className="admin-servicos-label">
              SERVIÇOS
            </span>

            <h1>Gerenciar serviços</h1>

            <p>
              Cadastre e gerencie os serviços oferecidos pela barbearia.
            </p>
          </div>

          <button
            type="button"
            className="admin-novo-servico"
            onClick={abrirNovoServico}
          >
            + Novo serviço
          </button>
        </header>

        <section className="admin-servicos-lista">
          {carregando && (
            <p className="admin-servicos-mensagem">
              Carregando serviços...
            </p>
          )}

          {!carregando && servicos.length === 0 && (
            <div className="admin-servicos-vazio">
              <strong>Nenhum serviço cadastrado</strong>
              <span>Cadastre um serviço para começar.</span>
            </div>
          )}

          {!carregando &&
            servicos.map((servico) => (
              <article
                className="admin-servico-card"
                key={servico.id}
              >
                <div className="admin-servico-icon">
                  ✂
                </div>

                <div className="admin-servico-info">
                  <strong>{servico.nome}</strong>
                  <span>{servico.duracaoMinutos} minutos</span>
                </div>

                <strong className="admin-servico-preco">
                  {formatadorMoeda.format(servico.preco)}
                </strong>

                <button
                  type="button"
                  className="admin-servico-editar"
                  onClick={() => abrirEdicao(servico)}
                >
                  Editar
                </button>
              </article>
            ))}
        </section>
      </section>

      {modalAberto && (
        <div
          className="admin-servico-modal-overlay"
          onClick={fecharModal}
        >
          <section
            className="admin-servico-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="admin-servico-modal-header">
              <div>
                <span>
                  {servicoEditando
                    ? 'EDITAR SERVIÇO'
                    : 'NOVO SERVIÇO'}
                </span>

                <h2>
                  {servicoEditando
                    ? 'Editar serviço'
                    : 'Cadastrar serviço'}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>

            <form
              className="admin-servico-form"
              onSubmit={salvarServico}
            >
              <div>
                <label htmlFor="nomeServico">
                  Nome
                </label>

                <input
                  id="nomeServico"
                  type="text"
                  placeholder="Ex.: Corte + Barba"
                  value={nome}
                  onChange={(event) =>
                    setNome(event.target.value)
                  }
                  required
                />
              </div>

              <div className="admin-servico-form-linha">
                <div>
                  <label htmlFor="duracaoServico">
                    Duração
                  </label>

                  <input
                    id="duracaoServico"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={duracaoMinutos}
                    onChange={(event) =>
                      setDuracaoMinutos(event.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <label htmlFor="precoServico">
                    Preço
                  </label>

                  <input
                    id="precoServico"
                    type="text"
                    inputMode="decimal"
                    placeholder="40,00"
                    value={preco}
                    onChange={(event) =>
                      setPreco(event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {servicoEditando && (
                <button
                  type="button"
                  className="admin-servico-excluir"
                  onClick={excluirServico}
                >
                  EXCLUIR SERVIÇO
                </button>
              )}

              <div className="admin-servico-modal-acoes">
                <button
                  type="button"
                  className="admin-servico-cancelar"
                  onClick={fecharModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-servico-salvar"
                >
                  {servicoEditando
                    ? 'Salvar alterações'
                    : 'Cadastrar'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default ServicosAdmin