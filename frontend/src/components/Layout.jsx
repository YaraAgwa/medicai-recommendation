import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import './Layout.css';

export default function Layout() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  const navLinks = (
    <>
      <Link to="/questions" onClick={closeMenu}>{t('nav.questions')}</Link>
      <Link to="/doctors" onClick={closeMenu}>{t('nav.doctors')}</Link>
      {user?.role === 'patient' && (
        <Link to="/ask" onClick={closeMenu}>{t('nav.askQuestion')}</Link>
      )}
      {user?.role === 'patient' && (
        <Link to="/favorites" onClick={closeMenu}>
          {t('nav.favorites', { defaultValue: 'Favorites' })}
        </Link>
      )}
      {user && (
        <Link to="/appointments" onClick={closeMenu}>
          {t('nav.appointments', { defaultValue: 'Appointments' })}
        </Link>
      )}
    </>
  );

  const authLinks = !loading && (
    user ? (
      <>
        <Link to="/dashboard" onClick={closeMenu}>{t('nav.dashboard')}</Link>
        <Link to="/profile" onClick={closeMenu}>{t('nav.profile')}</Link>
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
          {t('nav.logout')}
        </button>
      </>
    ) : (
      <>
        <Link to="/login/patient" className="nav-pill nav-pill-patient" onClick={closeMenu}>
          {t('nav.patientLogin')}
        </Link>
        <Link to="/login/doctor" className="nav-pill nav-pill-doctor" onClick={closeMenu}>
          {t('nav.doctorLogin')}
        </Link>
      </>
    )
  );

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <Link to="/" className="logo" onClick={closeMenu}>
              <span className="logo-icon">+</span>
              {t('appName')}
            </Link>

            <nav className="nav-desktop">
              {navLinks}
              {authLinks}
            </nav>

            <div className="nav-actions">
              <ThemeToggle />
              <LanguageSwitcher />
              <button
                type="button"
                className="menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          <nav className={`nav-mobile ${menuOpen ? 'open' : ''}`}>
            {navLinks}
            <div className="nav-mobile-divider" />
            {authLinks}
          </nav>
        </div>
      </header>

      <main className="main" key={location.pathname}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <p className="footer-brand">{t('appName')}</p>
          <p>{t('footer.tagline')}</p>
          <p className="disclaimer">{t('footer.disclaimer')}</p>
        </div>
      </footer>
    </div>
  );
}
