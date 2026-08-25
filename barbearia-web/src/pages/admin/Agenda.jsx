import { useEffect, useState } from 'react'

import API_URL from '../../services/api'

import AdminSidebar from '../../components/admin/AdminSidebar'
import AgendamentoCard from '../../components/admin/AgendamentoCard'
import DetalhesAgendamento from '../../components/admin/DetalhesAgendamento'
import BloqueioModal from '../../components/admin/BloqueioModal'

import '../../styles/admin/Admin.css'
import '../../styles/admin/Agenda.css'

const INTERVALO_ATUALIZACAO = 5000

const formatarHorario = (dataHora) =>
  new Date(dataHora).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })

const formatarDataApi = (data) => {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

const formatarDataTitulo = (data) =>
  data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  })

const formatarDataDetalhe = (dataHora) => {
  const data = new Date(dataHora).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  return data.charAt(0).toUpperCase() + data.slice(1)
}

const formatarTelefone = (telefone) => {
  const numeros = telefone.replace(/\D/g, '')

  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
  }

  if (numeros.length === 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`
  }

  return telefone
}

const inicioDoDia = (data) =>
  new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate()
  )

function Agenda() {
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [detalheCarregando, setDetalheCarregando] = useState(false)
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null)

  const [modalAberto, setModalAberto] = useState(false)
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')

  const hoje = inicioDoDia(new Date())
  const podeVoltar = inicioDoDia(dataSelecionada) > hoje

  async function carregarAgenda(exibirCarregamento = false) {
    try {
      if (exibirCarregamento) {
        setCarregando(true)
      }

      const response = await fetch(
        `${API_URL}/Agendamentos/por-data?data=${formatarDataApi(dataSelecionada)}`
      )

      if (!response.ok) {
        throw new Error('Erro ao carregar agenda')
      }

      setAgendamentos(await response.json())
    } catch (error) {
      console.error('Erro ao carregar agenda:', error)
    } finally {
      if (exibirCarregamento) {
        setCarregando(false)
      }
    }
  }

  useEffect(() => {
    carregarAgenda(true)

    const intervalo = setInterval(() => {
      carregarAgenda()
    }, INTERVALO_ATUALIZACAO)

    return () => {
      clearInterval(intervalo)
    }
  }, [dataSelecionada])

  function alterarDia(dias) {
    const novaData = new Date(dataSelecionada)
    novaData.setDate(novaData.getDate() + dias)

    if (inicioDoDia(novaData) < hoje) return

    setDataSelecionada(novaData)
  }

  async function abrirDetalhes(id) {
    try {
      setDetalheCarregando(true)

      const response = await fetch(
        `${API_URL}/Agendamentos/${id}`
      )

      if (!response.ok) {
        throw new Error('Erro ao carregar agendamento')
      }

      setAgendamentoSelecionado(await response.json())
    } catch (error) {
      console.error(
        'Erro ao carregar detalhes do agendamento:',
        error
      )

      alert('Não foi possível carregar o agendamento.')
    } finally {
      setDetalheCarregando(false)
    }
  }

  function abrirWhatsApp() {
    if (!agendamentoSelecionado) return

    let telefone =
      agendamentoSelecionado.telefoneCliente.replace(/\D/g, '')

    if ([10, 11].includes(telefone.length)) {
      telefone = `55${telefone}`
    }

    const data = new Date(
      agendamentoSelecionado.dataHora
    ).toLocaleDateString('pt-BR')

    const horario = formatarHorario(
      agendamentoSelecionado.dataHora
    )

    const servico =
      agendamentoSelecionado.servico?.nome || 'Serviço'

    const mensagem = [
      `Olá, ${agendamentoSelecionado.nomeCliente}!`,
      '',
      'Passando para confirmar o seu *agendamento* conosco.',
      '',
      `*Data:* ${data}`,
      `*Horário:* ${horario}`,
      `*Serviço:* ${servico}`,
      '',
      'Está tudo certo por aqui.',
      'Estamos te aguardando!'
    ].join('\n')

    window.open(
      `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`,
      '_blank'
    )
  }

  async function confirmarAgendamento() {
    if (!agendamentoSelecionado) return

    try {
      const response = await fetch(
        `${API_URL}/Agendamentos/${agendamentoSelecionado.id}/confirmar`,
        {
          method: 'PATCH'
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao confirmar agendamento')
      }

      setAgendamentoSelecionado({
        ...agendamentoSelecionado,
        confirmado: true
      })

      await carregarAgenda()
    } catch (error) {
      console.error(
        'Erro ao confirmar agendamento:',
        error
      )

      alert('Não foi possível confirmar o agendamento.')
    }
  }

  async function cancelarAgendamento() {
    if (!agendamentoSelecionado) return

    const confirmar = window.confirm(
      `Cancelar o agendamento de ${agendamentoSelecionado.nomeCliente}?`
    )

    if (!confirmar) return

    try {
      const response = await fetch(
        `${API_URL}/Agendamentos/${agendamentoSelecionado.id}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao cancelar agendamento')
      }

      setAgendamentoSelecionado(null)
      await carregarAgenda()
    } catch (error) {
      console.error(
        'Erro ao cancelar agendamento:',
        error
      )

      alert('Não foi possível cancelar o agendamento.')
    }
  }

  function fecharModal() {
    setModalAberto(false)
    setHoraInicio('')
    setHoraFim('')
  }

  async function confirmarBloqueio(event) {
    event.preventDefault()

    if (!horaInicio || !horaFim) return

    const data = formatarDataApi(dataSelecionada)
    const dataHoraInicio = `${data}T${horaInicio}:00`
    const dataHoraFim = `${data}T${horaFim}:00`

    if (new Date(dataHoraInicio) >= new Date(dataHoraFim)) {
      alert(
        'O horário de início deve ser anterior ao horário de fim.'
      )

      return
    }

    try {
      const response = await fetch(
        `${API_URL}/BloqueiosHorario`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dataHoraInicio,
            dataHoraFim
          })
        }
      )

      if (!response.ok) {
        const mensagem = await response.text()
        alert(mensagem)
        return
      }

      fecharModal()
    } catch (error) {
      console.error(
        'Erro ao bloquear horário:',
        error
      )

      alert('Não foi possível bloquear o horário.')
    }
  }

  if (agendamentoSelecionado) {
    return (
      <main className="admin-agenda-page">
        <AdminSidebar paginaAtiva="agenda" />

        <DetalhesAgendamento
          agendamento={agendamentoSelecionado}
          formatarData={formatarDataDetalhe}
          formatarHorario={formatarHorario}
          formatarTelefone={formatarTelefone}
          onVoltar={() => setAgendamentoSelecionado(null)}
          onWhatsApp={abrirWhatsApp}
          onConfirmar={confirmarAgendamento}
          onCancelar={cancelarAgendamento}
        />
      </main>
    )
  }

  return (
    <main className="admin-agenda-page">
      <AdminSidebar paginaAtiva="agenda" />

      <section className="admin-agenda-content">
        <header className="admin-agenda-header">
          <div>
            <span className="admin-agenda-label">
              AGENDA
            </span>

            <h1>Agenda do dia</h1>

            <div className="admin-agenda-data">
              <button
                type="button"
                onClick={() => alterarDia(-1)}
                aria-label="Dia anterior"
                disabled={!podeVoltar}
              >
                ‹
              </button>

              <span>
                {formatarDataTitulo(dataSelecionada)}
              </span>

              <button
                type="button"
                onClick={() => alterarDia(1)}
                aria-label="Próximo dia"
              >
                ›
              </button>
            </div>
          </div>

          <button
            type="button"
            className="admin-bloquear"
            onClick={() => setModalAberto(true)}
          >
            Bloquear horário
          </button>
        </header>

        <section className="admin-agenda-lista">
          {carregando && (
            <p className="admin-agenda-mensagem">
              Carregando agenda...
            </p>
          )}

          {detalheCarregando && (
            <p className="admin-agenda-mensagem">
              Carregando agendamento...
            </p>
          )}

          {!carregando && agendamentos.length === 0 && (
            <div className="admin-agenda-vazia">
              <strong>Nenhum agendamento</strong>

              <span>
                Não existem horários agendados nesta data.
              </span>
            </div>
          )}

          {!carregando &&
            agendamentos.map((agendamento) => (
              <AgendamentoCard
                key={agendamento.id}
                agendamento={agendamento}
                formatarHorario={formatarHorario}
                onAbrir={abrirDetalhes}
              />
            ))}
        </section>
      </section>

      <BloqueioModal
        aberto={modalAberto}
        data={dataSelecionada}
        horaInicio={horaInicio}
        horaFim={horaFim}
        formatarData={formatarDataTitulo}
        onAlterarInicio={setHoraInicio}
        onAlterarFim={setHoraFim}
        onFechar={fecharModal}
        onConfirmar={confirmarBloqueio}
      />
    </main>
  )
}

export default Agenda