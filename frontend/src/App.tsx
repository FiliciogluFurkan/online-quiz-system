import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateExam from './pages/CreateExam';
import ExamDetail from './pages/ExamDetail';
import QuestionBank from './pages/QuestionBank';
import AddQuestionsToExam from './pages/AddQuestionsToExam';
import './App.css';

function App() {
  console.log('App component rendered');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/instructor/create-exam" element={<CreateExam />} />
        <Route path="/instructor/exam/:id" element={<ExamDetail />} />
        <Route path="/instructor/questions" element={<QuestionBank />} />
        <Route path="/instructor/exam/:id/add-questions" element={<AddQuestionsToExam />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
