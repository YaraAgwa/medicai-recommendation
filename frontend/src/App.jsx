import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import PatientLogin from './pages/PatientLogin';
import DoctorLogin from './pages/DoctorLogin';
import PatientRegister from './pages/PatientRegister';
import DoctorRegister from './pages/DoctorRegister';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import AskQuestion from './pages/AskQuestion';
import Doctors from './pages/Doctors';
import DoctorProfile from './pages/DoctorProfile';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import MyAppointments from './pages/MyAppointments';
import Favorites from './pages/Favorites';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login/patient" element={<PatientLogin />} />
        <Route path="login/doctor" element={<DoctorLogin />} />
        <Route path="register/patient" element={<PatientRegister />} />
        <Route path="register/doctor" element={<DoctorRegister />} />
        <Route path="questions" element={<Questions />} />
        <Route path="questions/:id" element={<QuestionDetail />} />
        <Route path="ask" element={<AskQuestion />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/:id" element={<DoctorProfile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="favorites" element={<Favorites />} />
      </Route>
    </Routes>
  );
}
