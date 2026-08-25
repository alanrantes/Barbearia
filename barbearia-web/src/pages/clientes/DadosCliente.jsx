import { useState } from 'react'

import '../../styles/clientes/Cliente.css'
import '../../styles/clientes/DadosCliente.css'

function DadosCliente({ onAvancar, onVoltar }) {
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')

  function formatarTelefone(valor) {
    const numeros = valor.replace(/\D/g, '').slice(0, 11)

    if (numeros.length <= 2) {
      return numeros ? `(${numeros}` : ''
    }

    const ddd = numeros.slice(0, 2)
    const numero = numeros.slice(2)
    const divisor = numeros.length === 11 ? 5 : 4

    if (numero.length <= divisor) {
      return `(${ddd}) ${numero}`
    }

    return `(${ddd}) ${numero.slice(0, divisor)}-${numero.slice(divisor)}`
  }

  const telefoneNumeros = telefoneCliente.replace(/\D/g, '')
  const telefoneValido = [10, 11].includes(telefoneNumeros.length)

  const formularioValido =
    nomeCliente.trim() !== '' && telefoneValido

  function continuar() {
    if (!formularioValido) return

    onAvancar(nomeCliente.trim(), telefoneCliente)
  }

  return (
    <main className="dados-page">
      <header className="dados-header">
        <button
          type="button"
          className="dados-voltar"
          onClick={onVoltar}
          aria-label="Voltar"
        >
          ‹
        </button>

        <h1>Seus dados</h1>
      </header>

      <section className="dados-form">
        <div className="dados-campo">
          <label htmlFor="nome">Nome completo</label>

          <input
            id="nome"
            type="text"
            placeholder="Ex.: João Silva"
            value={nomeCliente}
            onChange={(event) => setNomeCliente(event.target.value)}
            autoComplete="name"
          />
        </div>

        <div className="dados-campo">
          <label htmlFor="telefone">WhatsApp</label>

          <input
            id="telefone"
            type="tel"
            inputMode="numeric"
            placeholder="(31) 99999-9999"
            value={telefoneCliente}
            onChange={(event) =>
              setTelefoneCliente(
                formatarTelefone(event.target.value)
              )
            }
            autoComplete="tel"
            maxLength={15}
          />
        </div>
      </section>

      <div className="dados-seguranca">
        <span className="dados-seguranca-icon">♙</span>

        <p>
          Seus dados serão utilizados apenas para este agendamento.
        </p>
      </div>

      <button
        type="button"
        className="dados-confirmar"
        disabled={!formularioValido}
        onClick={continuar}
      >
        CONFIRMAR AGENDAMENTO
      </button>
    </main>
  )
}

export default DadosCliente