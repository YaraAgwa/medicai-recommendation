import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function DoctorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, 'doctor');
      navigate('/dashboard');
    } catch (err) {
      setError(t(`errors.${err.message}`, { defaultValue: err.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="auth-card">
        <div className="card">
          <div style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>🩺</div>
          <h1 className="page-title">{t('auth.doctorLoginTitle')}</h1>
          <p className="page-subtitle">{t('auth.doctorLoginSub')}</p>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('auth.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>{t('auth.password')}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-doctor" style={{ width: '100%' }} disabled={loading}>
              {loading ? t('auth.signingIn') : t('auth.signInDoctor')}
            </button>
          </form>
          <p className="auth-footer">
            {t('auth.noAccount')} <Link to="/register/doctor">{t('auth.registerDoctor')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
