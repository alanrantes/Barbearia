function BloqueioModal({
  aberto,
  data,
  horaInicio,
  horaFim,
  formatarData,
  onAlterarInicio,
  onAlterarFim,
  onFechar,
  onConfirmar
}) {
  if (!aberto) return null

  return (
    <div
      className="admin-modal-overlay"
      onClick={onFechar}
    >
      <section
        className="admin-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="admin-modal-header">
          <div>
            <span>BLOQUEIO</span>
            <h2>Bloquear horário</h2>
          </div>

          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <p className="admin-modal-data">
          {formatarData(data)}
        </p>

        <form
          className="admin-bloqueio-form"
          onSubmit={onConfirmar}
        >
          <div className="admin-bloqueio-horarios">
            <div>
              <label htmlFor="horaInicio">
                Início
              </label>

              <input
                id="horaInicio"
                type="time"
                value={horaInicio}
                onChange={(event) =>
                  onAlterarInicio(event.target.value)
                }
                required
              />
            </div>

            <div>
              <label htmlFor="horaFim">
                Fim
              </label>

              <input
                id="horaFim"
                type="time"
                value={horaFim}
                onChange={(event) =>
                  onAlterarFim(event.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="admin-modal-acoes">
            <button
              type="button"
              className="admin-modal-cancelar"
              onClick={onFechar}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="admin-modal-confirmar"
            >
              Bloquear
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default BloqueioModal