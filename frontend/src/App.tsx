import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { ScorePage } from './pages/ScorePage';

function App() {
  const { session, logout } = useAuth();

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="mark">RF</span>
          <span>Riesgo Financiero</span>
        </div>
        {session && (
          <div className="session-pill">
            <span className={`role-badge${session.role === 'admin' ? ' admin' : ''}`}>
              {session.role === 'admin' ? 'Administrador' : 'Usuario'}
            </span>
            <button type="button" className="btn-ghost" onClick={logout}>
              Cerrar sesion
            </button>
          </div>
        )}
      </header>

      <main className="center-stage">{session ? <ScorePage /> : <LoginPage />}</main>

      <footer className="footer-note">
        Prueba tecnica &middot; consulta de riesgo financiero (MVP)
      </footer>
    </div>
  );
}

export default App;
