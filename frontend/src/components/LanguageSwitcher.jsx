import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
  };

  return (
    <button
      type="button"
      className="lang-switcher"
      onClick={toggleLanguage}
      title={t('common.language')}
      aria-label={t('common.language')}
    >
      {i18n.language === 'ar' ? 'EN' : 'عربي'}
    </button>
  );
}
