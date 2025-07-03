import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Layout/Navbar';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Submissions from './pages/Submissions';
import SubmissionDetail from './pages/SubmissionDetail';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Navigate to="/problems" replace />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/problems/:id" element={<ProblemDetail />} />
                <Route path="/submissions" element={<Submissions />} />
                <Route path="/submission/:id" element={<SubmissionDetail />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;