import { useState } from 'react'

function AdminSidebar({ paginaAtiva }) {
  const [menuAberto, setMenuAberto] = useState(false)

  function navegar(caminho) {
    setMenuAberto(false)

    window.history.pushState({}, '', caminho)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <>
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>✂</span>

          <div>
            <span>BARBEARIA</span>
            <strong>TRADIÇÃO</strong>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            type="button"
            className={paginaAtiva === 'agenda' ? 'ativo' : ''}
            onClick={() => navegar('/admin')}
          >
            Agenda
          </button>

          <button
            type="button"
            className={paginaAtiva === 'servicos' ? 'ativo' : ''}
            onClick={() => navegar('/admin/servicos')}
          >
            Serviços
          </button>
        </nav>
      </aside>

      <header className="admin-mobile-header">
        <button
          type="button"
          className="admin-menu-toggle"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
        >
          ☰
        </button>

        <div className="admin-mobile-brand">
          <span>BARBEARIA</span>
          <strong>TRADIÇÃO</strong>
        </div>
      </header>

      {menuAberto && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setMenuAberto(false)}
        >
          <aside
            className="admin-mobile-menu"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="admin-mobile-menu-header">
              <div className="admin-brand">
                <span>✂</span>

                <div>
                  <span>BARBEARIA</span>
                  <strong>TRADIÇÃO</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
              >
                ×
              </button>
            </header>

            <nav className="admin-mobile-nav">
              <button
                type="button"
                className={
                  paginaAtiva === 'agenda'
                    ? 'ativo'
                    : ''
                }
                onClick={() => navegar('/admin')}
              >
                Agenda
              </button>

              <button
                type="button"
                className={
                  paginaAtiva === 'servicos'
                    ? 'ativo'
                    : ''
                }
                onClick={() =>
                  navegar('/admin/servicos')
                }
              >
                Serviços
              </button>
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}

export default AdminSidebar