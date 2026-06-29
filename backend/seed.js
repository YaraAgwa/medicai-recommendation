const bcrypt = require('bcryptjs');
const { connect, collections, client } = require('./database');
const { doctorTranslations, questions } = require('./seed-content');

const doctors = [
  { name: 'Dr. Sarah Johnson', email: 'sarah.j@medicai.com', specialty: 'Cardiology', hospital: 'City Heart Center', experience_years: 15, bio: 'Board-certified cardiologist specializing in heart disease prevention and hypertension management.' },
  { name: 'Dr. Michael Chen', email: 'michael.c@medicai.com', specialty: 'Neurology', hospital: 'NeuroCare Institute', experience_years: 12, bio: 'Expert in neurological disorders, migraines, and epilepsy treatment.' },
  { name: 'Dr. Emily Rodriguez', email: 'emily.r@medicai.com', specialty: 'Pediatrics', hospital: "Children's Medical Center", experience_years: 10, bio: 'Dedicated pediatrician with focus on child wellness and vaccinations.' },
  { name: 'Dr. James Wilson', email: 'james.w@medicai.com', specialty: 'Orthopedics', hospital: 'Bone & Joint Clinic', experience_years: 18, bio: 'Orthopedic surgeon specializing in sports injuries and joint replacement.' },
  { name: 'Dr. Lisa Park', email: 'lisa.p@medicai.com', specialty: 'Dermatology', hospital: 'Skin Health Clinic', experience_years: 8, bio: 'Dermatologist focused on acne, eczema, and cosmetic dermatology.' },
  { name: 'Dr. Robert Ahmed', email: 'robert.a@medicai.com', specialty: 'General Medicine', hospital: 'Community Health Hospital', experience_years: 20, bio: 'Family medicine physician with broad clinical experience across all ages.' },
  { name: 'Dr. Anna Kowalski', email: 'anna.k@medicai.com', specialty: 'Psychiatry', hospital: 'Mind Wellness Center', experience_years: 14, bio: 'Psychiatrist specializing in anxiety, depression, and stress disorders.' },
  { name: 'Dr. David Thompson', email: 'david.t@medicai.com', specialty: 'Gastroenterology', hospital: 'Digestive Health Institute', experience_years: 11, bio: 'GI specialist treating IBS, acid reflux, and liver conditions.' },
  { name: 'Dr. Fatima Al-Hassan', email: 'fatima.h@medicai.com', specialty: 'Oncology', hospital: 'Cancer Care Center', experience_years: 16, bio: 'Oncologist focused on early detection and personalized cancer treatment plans.' },
  { name: 'Dr. Thomas Wright', email: 'thomas.w@medicai.com', specialty: 'Endocrinology', hospital: 'Hormone Health Clinic', experience_years: 13, bio: 'Endocrinologist treating diabetes, thyroid disorders, and hormonal imbalances.' },
  { name: 'Dr. Priya Sharma', email: 'priya.s@medicai.com', specialty: 'Pulmonology', hospital: 'Lung & Respiratory Center', experience_years: 9, bio: 'Pulmonologist specializing in asthma, COPD, and sleep apnea.' },
  { name: 'Dr. Carlos Mendez', email: 'carlos.m@medicai.com', specialty: 'Urology', hospital: 'Urology Associates', experience_years: 17, bio: 'Urologist with expertise in kidney stones and urinary tract health.' },
  { name: 'Dr. Yuki Tanaka', email: 'yuki.t@medicai.com', specialty: 'Cardiology', hospital: 'Metro Cardiac Hospital', experience_years: 11, bio: 'Interventional cardiologist specializing in arrhythmias and heart failure.' },
  { name: 'Dr. Helen Okafor', email: 'helen.o@medicai.com', specialty: 'Pediatrics', hospital: 'Sunrise Children Hospital', experience_years: 7, bio: 'Pediatrician passionate about newborn care and childhood nutrition.' },
  { name: 'Dr. Mark Stevens', email: 'mark.s@medicai.com', specialty: 'Orthopedics', hospital: 'Sports Medicine Center', experience_years: 14, bio: 'Sports medicine specialist treating athletes and active adults.' },
  { name: 'Dr. Nora Ibrahim', email: 'nora.i@medicai.com', specialty: 'Dermatology', hospital: 'Clear Skin Institute', experience_years: 10, bio: 'Dermatologist expert in psoriasis, rosacea, and skin allergy testing.' },
  { name: 'Dr. Kevin Brooks', email: 'kevin.b@medicai.com', specialty: 'Psychiatry', hospital: 'Behavioral Health Partners', experience_years: 12, bio: 'Psychiatrist treating PTSD, OCD, and mood disorders in adults.' },
  { name: 'Dr. Sophie Laurent', email: 'sophie.l@medicai.com', specialty: 'Gastroenterology', hospital: 'Paris Digestive Clinic', experience_years: 9, bio: 'GI doctor focused on celiac disease, Crohn\'s disease, and nutrition.' },
  { name: 'Dr. Omar Khalil', email: 'omar.k@medicai.com', specialty: 'General Medicine', hospital: 'Al-Noor Medical Center', experience_years: 22, bio: 'Senior family physician with decades of community healthcare experience.' },
  { name: 'Dr. Rachel Green', email: 'rachel.g@medicai.com', specialty: 'Neurology', hospital: 'Brain & Spine Center', experience_years: 15, bio: 'Neurologist specializing in stroke recovery and Parkinson\'s disease.' },
];

const patients = [
  { name: 'John Smith', email: 'john.s@example.com', age: 42, gender: 'Male', phone: '555-0101' },
  { name: 'Maria Garcia', email: 'maria.g@example.com', age: 28, gender: 'Female', phone: '555-0102' },
  { name: 'Ahmed Hassan', email: 'ahmed.h@example.com', age: 35, gender: 'Male', phone: '555-0103' },
  { name: 'Sarah Lee', email: 'sarah.l@example.com', age: 31, gender: 'Female', phone: '555-0104' },
  { name: 'David Brown', email: 'david.b@example.com', age: 55, gender: 'Male', phone: '555-0105' },
  { name: 'Fatima Ali', email: 'fatima.a@example.com', age: 24, gender: 'Female', phone: '555-0106' },
];

const translationMap = Object.fromEntries(
  doctorTranslations.map((t) => [t.email, t])
);

const password = bcrypt.hashSync('password123', 10);

async function seed() {
  await connect();
  const Users = collections.users();
  const Questions = collections.questions();
  const Answers = collections.answers();

  console.log('Seeding database...');

  // Fresh start so re-running the seed is idempotent.
  await Promise.all([
    Users.deleteMany({}),
    Questions.deleteMany({}),
    Answers.deleteMany({}),
  ]);

  const idByEmail = {};

  for (const doc of doctors) {
    const tr = translationMap[doc.email] || {};
    const { insertedId } = await Users.insertOne({
      email: doc.email,
      password,
      role: 'doctor',
      name: doc.name,
      created_at: new Date(),
      profile: {
        specialty: doc.specialty,
        license_number: `LIC-${doc.email}`,
        experience_years: doc.experience_years,
        bio: doc.bio,
        bio_ar: tr.bio_ar || null,
        hospital: doc.hospital,
        hospital_ar: tr.hospital_ar || null,
      },
    });
    idByEmail[doc.email] = insertedId;
  }

  for (const pat of patients) {
    const { insertedId } = await Users.insertOne({
      email: pat.email,
      password,
      role: 'patient',
      name: pat.name,
      created_at: new Date(),
      profile: {
        age: pat.age,
        gender: pat.gender,
        medical_history: null,
        phone: pat.phone,
      },
    });
    idByEmail[pat.email] = insertedId;
  }

  let questionCount = 0;
  let answerCount = 0;

  for (const q of questions) {
    const patientId = idByEmail[q.patient];
    if (!patientId) continue;

    const { insertedId } = await Questions.insertOne({
      patient_id: patientId,
      title: q.title,
      title_ar: q.title_ar || null,
      body: q.body,
      body_ar: q.body_ar || null,
      category: q.category,
      created_at: new Date(),
    });
    questionCount++;

    for (const a of q.answers || []) {
      const userId = idByEmail[a.user];
      if (!userId) continue;
      await Answers.insertOne({
        question_id: insertedId,
        user_id: userId,
        body: a.body,
        body_ar: a.body_ar || null,
        created_at: new Date(),
      });
      answerCount++;
    }
  }

  const doctorCount = await Users.countDocuments({ role: 'doctor' });
  const patientCount = await Users.countDocuments({ role: 'patient' });

  console.log('Seed complete! Demo accounts use password: password123');
  console.log(`Doctors: ${doctorCount} | Patients: ${patientCount} | Questions: ${questionCount} | Answers: ${answerCount}`);
  console.log('Bilingual content: English + Arabic (switch language in app)');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => client.close());
