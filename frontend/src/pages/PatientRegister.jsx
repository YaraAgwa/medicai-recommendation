import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function PatientRegister() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', age: '', gender: '', phone: '', medical_history: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register('patient', { ...form, age: form.age ? parseInt(form.age) : null });
      navigate('/dashboard');
    } catch (err) {
      setError(t(`errors.${err.message}`, { defaultValue: err.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="card">
          <h1 className="page-title">{t('auth.patientRegisterTitle')}</h1>
          <p className="page-subtitle">{t('auth.patientRegisterSub')}</p>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('auth.fullName')}</label>
              <input value={form.name} onChange={update('name')} required />
            </div>
            <div className="form-group">
              <label>{t('auth.email')}</label>
              <input type="email" value={form.email} onChange={update('email')} required />
            </div>
            <div className="form-group">
              <label>{t('auth.password')}</label>
              <input type="password" value={form.password} onChange={update('password')} required minLength={6} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>{t('auth.age')}</label>
                <input type="number" value={form.age} onChange={update('age')} min={1} max={120} />
              </div>
              <div className="form-group">
                <label>{t('auth.gender')}</label>
                <select value={form.gender} onChange={update('gender')}>
                  <option value="">{t('auth.select')}</option>
                  <option value="Male">{t('auth.male')}</option>
                  <option value="Female">{t('auth.female')}</option>
                  <option value="Other">{t('auth.other')}</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>{t('auth.phone')}</label>
              <input value={form.phone} onChange={update('phone')} />
            </div>
            <div className="form-group">
              <label>{t('auth.medicalHistory')}</label>
              <textarea value={form.medical_history} onChange={update('medical_history')} placeholder={t('auth.medicalHistoryPlaceholder')} />
            </div>
            <button type="submit" className="btn btn-patient" style={{ width: '100%' }} disabled={loading}>
              {loading ? t('auth.creatingAccount') : t('auth.registerPatient')}
            </button>
          </form>
          <p className="auth-footer">
            {t('auth.hasAccount')} <Link to="/login/patient">{t('auth.patientLoginTitle')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
