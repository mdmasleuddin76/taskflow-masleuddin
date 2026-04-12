import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// 1. Import all your pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Project from './pages/Project';
import ProjectDetail from './pages/ProjectDetail';
// import ProjectBoard from './pages/ProjectBoard'; // We'll build this next!

// 2. Create the Security Guard (Protected Route)
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  // If the user isn't logged in, kick them back to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If they are logged in, let them see the page
  return children;
};

// 3. Define the Map (The App Component)
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC ROUTES (Anyone can see these) --- */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <Project />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/projects/:id" 
            element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}