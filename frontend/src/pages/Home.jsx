import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ALL_SPECIALTIES, translateSpecialty } from '../utils/specialties';
import './Home.css';

export default function Home() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <span className="hero-badge">🏥 {t('appName')}</span>
          <h1>{t('home.heroTitle')}</h1>
          <p className="hero-sub">{t('home.heroSub')}</p>
          <div className="hero-actions">
            {user ? (
              <>
                {user.role === 'patient' && (
                  <Link to="/ask" className="btn btn-patient">{t('home.askQuestion')}</Link>
                )}
                <Link to="/questions" className="btn btn-primary">{t('home.browseQuestions')}</Link>
                <Link to="/doctors" className="btn btn-outline">{t('home.findDoctors')}</Link>
              </>
            ) : (
              <>
                <Link to="/register/patient" className="btn btn-patient">{t('home.joinPatient')}</Link>
                <Link to="/register/doctor" className="btn btn-doctor">{t('home.joinDoctor')}</Link>
                <Link to="/questions" className="btn btn-outline">{t('home.browseQuestions')}</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features container">
        <div className="feature-card card card-hover">
          <div className="feature-icon patient-icon">👤</div>
          <h3>{t('home.forPatients')}</h3>
          <p>{t('home.forPatientsDesc')}</p>
          <Link to="/login/patient" className="feature-link">{t('home.patientLoginLink')}</Link>
        </div>
        <div className="feature-card card card-hover">
          <div className="feature-icon doctor-icon">🩺</div>
          <h3>{t('home.forDoctors')}</h3>
          <p>{t('home.forDoctorsDesc')}</p>
          <Link to="/login/doctor" className="feature-link">{t('home.doctorLoginLink')}</Link>
        </div>
        <div className="feature-card card card-hover">
          <div className="feature-icon community-icon">💬</div>
          <h3>{t('home.communityAnswers')}</h3>
          <p>{t('home.communityDesc')}</p>
          <Link to="/questions" className="feature-link">{t('home.viewQuestions')}</Link>
        </div>
      </section>

      <section className="specialties container">
        <h2>{t('home.doctorSpecialties')}</h2>
        <div className="specialty-tags">
          {ALL_SPECIALTIES.slice(0, 8).map((s) => (
            <Link key={s} to={`/doctors?specialty=${encodeURIComponent(s)}`} className="specialty-tag">
              {translateSpecialty(t, s)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
