import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ALL_SPECIALTIES, translateSpecialty } from '../utils/specialties';

export default function DoctorRegister() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', specialty: '', license_number: '',
    experience_years: '', bio: '', hospital: '',
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
      await register('doctor', {
        ...form,
        experience_years: form.experience_years ? parseInt(form.experience_years) : null,
      });
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
          <h1 className="page-title">{t('auth.doctorRegisterTitle')}</h1>
          <p className="page-subtitle">{t('auth.doctorRegisterSub')}</p>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('auth.fullName')}</label>
              <input value={form.name} onChange={update('name')} required placeholder={t('auth.doctorNamePlaceholder')} />
            </div>
            <div className="form-group">
              <label>{t('auth.email')}</label>
              <input type="email" value={form.email} onChange={update('email')} required />
            </div>
            <div className="form-group">
              <label>{t('auth.password')}</label>
              <input type="password" value={form.password} onChange={update('password')} required minLength={6} />
            </div>
            <div className="form-group">
              <label>{t('auth.specialty')}</label>
              <select value={form.specialty} onChange={update('specialty')} required>
                <option value="">{t('auth.selectSpecialty')}</option>
                {ALL_SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{translateSpecialty(t, s)}</option>
                ))}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>{t('auth.licenseNumber')}</label>
                <input value={form.license_number} onChange={update('license_number')} />
              </div>
              <div className="form-group">
                <label>{t('auth.yearsExperience')}</label>
                <input type="number" value={form.experience_years} onChange={update('experience_years')} min={0} />
              </div>
            </div>
            <div className="form-group">
              <label>{t('auth.hospitalClinic')}</label>
              <input value={form.hospital} onChange={update('hospital')} />
            </div>
            <div className="form-group">
              <label>{t('auth.bio')}</label>
              <textarea value={form.bio} onChange={update('bio')} placeholder={t('auth.bioPlaceholder')} />
            </div>
            <button type="submit" className="btn btn-doctor" style={{ width: '100%' }} disabled={loading}>
              {loading ? t('auth.creatingAccount') : t('auth.registerDoctor')}
            </button>
          </form>
          <p className="auth-footer">
            {t('auth.hasAccount')} <Link to="/login/doctor">{t('auth.doctorLoginTitle')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
