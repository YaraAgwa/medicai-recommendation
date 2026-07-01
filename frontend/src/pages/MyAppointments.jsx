import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function MyAppointments() {
  const { user, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [busy, setBusy] = useState(true);

  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

  const load = () => {
    api('/appointments/mine')
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setBusy(false));
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  if (!loading && !user) return <Navigate to="/" replace />;
  if (loading || busy) return <div className="loading container">{t('common.loading')}</div>;

  const cancel = async (id) => {
    try {
      await api(`/appointments/${id}/cancel`, { method: 'PATCH' });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="page-header">
        <h1 className="page-title">
          {t('appointments.myTitle', { defaultValue: 'My Appointments' })}
        </h1>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-state">
          {t('appointments.none', { defaultValue: 'You have no appointments yet.' })}
        </div>
      ) : (
        appointments.map((a) => (
          <div key={a.id} className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <strong>{a.other_name}</strong>
                {a.other_specialty && (
                  <span className="badge badge-doctor" style={{ marginInlineStart: '0.5rem' }}>
                    {a.other_specialty}
                  </span>
                )}
                <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {new Date(a.date).toLocaleString(locale)}
                </p>
                {a.reason && <p style={{ marginTop: '0.35rem' }}>{a.reason}</p>}
              </div>
              <div style={{ textAlign: 'end' }}>
                <span className={`badge ${a.status === 'confirmed' ? 'badge-patient' : ''}`}>
                  {t(`appointments.status_${a.status}`, { defaultValue: a.status })}
                </span>
                {a.status === 'confirmed' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => cancel(a.id)}>
                      {t('appointments.cancel', { defaultValue: 'Cancel' })}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
