import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateExam from './pages/CreateExam';
import ExamDetail from './pages/ExamDetail';
import QuestionBank from './pages/QuestionBank';
import AddQuestionsToExam from './pages/AddQuestionsToExam';
import TakeExam from './pages/TakeExam';
import ExamResult from './pages/ExamResult';
import ExamResults from './pages/ExamResults';
import './App.css';

function App() {
  console.log('App component rendered');
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/exam/:id" element={<TakeExam />} />
          <Route path="/student/result/:studentExamId" element={<ExamResult />} />
          <Route path="/instructor" element={<InstructorDashboard />} />
          <Route path="/instructor/create-exam" element={<CreateExam />} />
          <Route path="/instructor/exam/:id" element={<ExamDetail />} />
          <Route path="/instructor/exam/:id/results" element={<ExamResults />} />
          <Route path="/instructor/result/:studentExamId" element={<ExamResult />} />
          <Route path="/instructor/questions" element={<QuestionBank />} />
          <Route path="/instructor/exam/:id/add-questions" element={<AddQuestionsToExam />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
