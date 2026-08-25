import '../../styles/clientes/Home.css'

function Home({ onAvancar }) {
  return (
    <main className="home">
      <div className="home-overlay" />

      <section className="home-content">
        <span className="home-label">AGENDAMENTO ONLINE</span>

        <h1>
          Seu horário,
          <br />
          <span>do seu jeito.</span>
        </h1>

        <p>
          Agende de forma rápida
          <br />
          e sem complicação.
        </p>

        <button className="home-button" onClick={onAvancar}>
          AGENDAR AGORA
        </button>
      </section>
    </main>
  )
}

export default Home