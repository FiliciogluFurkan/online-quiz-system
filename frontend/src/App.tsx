import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TopBar } from './components/academic-ui';
import ProtectedRoute from './components/ProtectedRoute';
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
  return (
    <AuthProvider>
      <BrowserRouter>
        <TopBar />
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Student routes */}
          <Route path="/student" element={<ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/my-results" element={<ProtectedRoute roles={['STUDENT']}><MyResults /></ProtectedRoute>} />
          <Route path="/student/notifications" element={<ProtectedRoute roles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}><NotificationList /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute roles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}><NotificationList /></ProtectedRoute>} />
          <Route path="/student/exam/:id" element={<ProtectedRoute roles={['STUDENT']}><TakeExam /></ProtectedRoute>} />
          <Route path="/student/result/:studentExamId" element={<ProtectedRoute roles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}><ExamResult /></ProtectedRoute>} />

          {/* Instructor routes */}
          <Route path="/instructor" element={<ProtectedRoute roles={['INSTRUCTOR']}><InstructorDashboard /></ProtectedRoute>} />
          <Route path="/instructor/create-exam" element={<ProtectedRoute roles={['INSTRUCTOR']}><CreateExam /></ProtectedRoute>} />
          <Route path="/instructor/exam/:id/edit" element={<ProtectedRoute roles={['INSTRUCTOR']}><CreateExam /></ProtectedRoute>} />
          <Route path="/instructor/exam/:id" element={<ProtectedRoute roles={['INSTRUCTOR']}><ExamDetail /></ProtectedRoute>} />
          <Route path="/instructor/exam/:id/preview" element={<ProtectedRoute roles={['INSTRUCTOR']}><ExamPreview /></ProtectedRoute>} />
          <Route path="/instructor/exam/:id/results" element={<ProtectedRoute roles={['INSTRUCTOR']}><ExamResults /></ProtectedRoute>} />
          <Route path="/instructor/exam/:id/statistics" element={<ProtectedRoute roles={['INSTRUCTOR']}><ExamStatistics /></ProtectedRoute>} />
          <Route path="/instructor/result/:studentExamId" element={<ProtectedRoute roles={['INSTRUCTOR']}><ExamResult /></ProtectedRoute>} />
          <Route path="/instructor/grade/:studentExamId" element={<ProtectedRoute roles={['INSTRUCTOR']}><ManualGrading /></ProtectedRoute>} />
          <Route path="/instructor/questions" element={<ProtectedRoute roles={['INSTRUCTOR']}><QuestionBank /></ProtectedRoute>} />
          <Route path="/instructor/bulk-import" element={<ProtectedRoute roles={['INSTRUCTOR']}><BulkImport /></ProtectedRoute>} />
          <Route path="/instructor/categories" element={<ProtectedRoute roles={['INSTRUCTOR']}><CategoryManagement /></ProtectedRoute>} />
          <Route path="/instructor/exam/:id/add-questions" element={<ProtectedRoute roles={['INSTRUCTOR']}><AddQuestionsToExam /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/exam/:id" element={<ProtectedRoute roles={['ADMIN']}><AdminExamDetail /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
