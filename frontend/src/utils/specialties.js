export const CATEGORIES = [
  'General', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics',
  'Dermatology', 'Psychiatry', 'Gastroenterology',
  'Oncology', 'Endocrinology', 'Pulmonology', 'Urology',
];

export const ALL_SPECIALTIES = [
  'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics',
  'Dermatology', 'General Medicine', 'Psychiatry', 'Gastroenterology',
  'Oncology', 'Endocrinology', 'Pulmonology', 'Urology',
];

export function translateSpecialty(t, name) {
  if (!name) return '';
  return t(`specialties.${name}`, { defaultValue: name });
}
