import { useEffect, useState } from 'react'

import API_URL from './services/api'

import Home from './pages/clientes/Home'
import Servicos from './pages/clientes/Servicos'
import Agendamento from './pages/clientes/Agendamento'
import Horarios from './pages/clientes/Horarios'
import DadosCliente from './pages/clientes/DadosCliente'
import Confirmacao from './pages/clientes/Confirmacao'

import Agenda from './pages/admin/Agenda'
import ServicosAdmin from './pages/admin/ServicosAdmin'

function App() {
  const [rota, setRota] = useState(window.location.pathname)
  const [etapa, setEtapa] = useState('home')

  const [agendamento, setAgendamento] = useState({
    servico: null,
    data: '',
    horario: '',
    nomeCliente: '',
    telefoneCliente: ''
  })

  useEffect(() => {
    function atualizarRota() {
      setRota(window.location.pathname)
    }

    window.addEventListener('popstate', atualizarRota)

    return () => {
      window.removeEventListener('popstate', atualizarRota)
    }
  }, [])

  /* ADMIN */

  if (rota === '/admin/servicos') {
    return <ServicosAdmin />
  }

  if (rota === '/admin') {
    return <Agenda />
  }

  /* CLIENTE */

  if (etapa === 'servicos') {
    return (
      <Servicos
        onVoltar={() => setEtapa('home')}
        onSelecionar={(servico) => {
          setAgendamento((anterior) => ({
            ...anterior,
            servico
          }))

          setEtapa('agendamento')
        }}
      />
    )
  }

  if (etapa === 'agendamento') {
    return (
      <Agendamento
        onVoltar={() => setEtapa('servicos')}
        onAvancar={(data) => {
          setAgendamento((anterior) => ({
            ...anterior,
            data,
            horario: ''
          }))

          setEtapa('horarios')
        }}
      />
    )
  }

  if (etapa === 'horarios') {
    return (
      <Horarios
        servico={agendamento.servico}
        data={agendamento.data}
        onVoltar={() => setEtapa('agendamento')}
        onAvancar={(horario) => {
          setAgendamento((anterior) => ({
            ...anterior,
            horario
          }))

          setEtapa('dados')
        }}
      />
    )
  }

  if (etapa === 'dados') {
    return (
      <DadosCliente
        onVoltar={() => setEtapa('horarios')}
        onAvancar={async (nomeCliente, telefoneCliente) => {
          try {
            const response = await fetch(
              `${API_URL}/Agendamentos`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  nomeCliente,
                  telefoneCliente,
                  dataHora: agendamento.horario,
                  servicoId: agendamento.servico.id
                })
              }
            )

            if (!response.ok) {
              const mensagem = await response.text()

              alert(
                mensagem ||
                  'Não foi possível realizar o agendamento.'
              )

              return
            }

            setAgendamento((anterior) => ({
              ...anterior,
              nomeCliente,
              telefoneCliente
            }))

            setEtapa('confirmacao')
          } catch (error) {
            console.error(
              'Erro ao realizar agendamento:',
              error
            )

            alert(
              'Não foi possível realizar o agendamento. Tente novamente.'
            )
          }
        }}
      />
    )
  }

  if (etapa === 'confirmacao') {
    return (
      <Confirmacao
        agendamento={agendamento}
        onVoltar={() => {
          setAgendamento({
            servico: null,
            data: '',
            horario: '',
            nomeCliente: '',
            telefoneCliente: ''
          })

          setEtapa('home')
        }}
      />
    )
  }

  return (
    <Home
      onAvancar={() => setEtapa('servicos')}
    />
  )
}

export default App