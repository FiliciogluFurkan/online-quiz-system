import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import MyResults from './pages/MyResults';
import NotificationList from './pages/NotificationList';
import InstructorDashboard from './pages/InstructorDashboard';
import CategoryManagement from './pages/CategoryManagement';
import AdminDashboard from './pages/AdminDashboard';
import AdminExamDetail from './pages/AdminExamDetail';
import CreateExam from './pages/CreateExam';
import ExamDetail from './pages/ExamDetail';
import ExamPreview from './pages/ExamPreview';
import ExamStatistics from './pages/ExamStatistics';
import QuestionBank from './pages/QuestionBank';
import BulkImport from './pages/BulkImport';
import AddQuestionsToExam from './pages/AddQuestionsToExam';
import TakeExam from './pages/TakeExam';
import ExamResult from './pages/ExamResult';
import ExamResults from './pages/ExamResults';
import ManualGrading from './pages/ManualGrading';
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
          <Route path="/student/my-results" element={<MyResults />} />
          <Route path="/student/notifications" element={<NotificationList />} />
          <Route path="/student/exam/:id" element={<TakeExam />} />
          <Route path="/student/result/:studentExamId" element={<ExamResult />} />
          <Route path="/instructor" element={<InstructorDashboard />} />
          <Route path="/instructor/create-exam" element={<CreateExam />} />
          <Route path="/instructor/exam/:id" element={<ExamDetail />} />
          <Route path="/instructor/exam/:id/preview" element={<ExamPreview />} />
          <Route path="/instructor/exam/:id/results" element={<ExamResults />} />
          <Route path="/instructor/exam/:id/statistics" element={<ExamStatistics />} />
          <Route path="/instructor/result/:studentExamId" element={<ExamResult />} />
          <Route path="/instructor/grade/:studentExamId" element={<ManualGrading />} />
          <Route path="/instructor/questions" element={<QuestionBank />} />
          <Route path="/instructor/bulk-import" element={<BulkImport />} />
          <Route path="/instructor/categories" element={<CategoryManagement />} />
          <Route path="/instructor/exam/:id/add-questions" element={<AddQuestionsToExam />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/exam/:id" element={<AdminExamDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
