import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { LoginPage } from './pages/LoginPage';
import { ScorePage } from './pages/ScorePage';

function App() {
  const { session, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="mark">RF</span>
          <span>{t.brand}</span>
        </div>

        <div className="session-pill">
          <button
            type="button"
            className="lang-toggle"
            onClick={toggleLanguage}
            aria-label="Cambiar idioma / Switch language"
          >
            {language === 'es' ? 'ES · EN' : 'EN · ES'}
          </button>

          {session && (
            <>
              <span className={`role-badge${session.role === 'admin' ? ' admin' : ''}`}>
                {session.role === 'admin' ? t.role.admin : t.role.user}
              </span>
              <button type="button" className="btn-ghost" onClick={logout}>
                {t.logout}
              </button>
            </>
          )}
        </div>
      </header>

      <main className="center-stage">{session ? <ScorePage /> : <LoginPage />}</main>

      <footer className="footer-note">{t.footer}</footer>
    </div>
  );
}

export default App;
