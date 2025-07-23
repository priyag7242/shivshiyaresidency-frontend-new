import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import Rooms from './pages/Rooms';
import Payments from './pages/Payments';
import Maintenance from './pages/Maintenance';
import Visitors from './pages/Visitors';
import Login from './pages/Login';
//
// Protected App component that renders after authentication
const ProtectedApp = () => {
  console.log('ProtectedApp rendering');
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route 
          path="/tenants" 
          element={
            <ProtectedRoute permission="tenants:read">
              <Tenants />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rooms" 
          element={
            <ProtectedRoute permission="rooms:read">
              <Rooms />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payments" 
          element={
            <ProtectedRoute permission="payments:read">
              <Payments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/maintenance" 
          element={
            <ProtectedRoute permission="maintenance:read">
              <Maintenance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/visitors" 
          element={
            <ProtectedRoute permission="visitors:read">
              <Visitors />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Layout>
  );
};

// Main App Router component
const AppRouter = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-500 mx-auto mb-4"></div>
          <p className="text-golden-400 text-lg">Loading Shiv Shiva Residency...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <ProtectedApp />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

// Main App component
function App() {
  console.log('API URL:', import.meta.env.VITE_API_URL);
  console.log('All env vars:', import.meta.env);
  
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-900">
          <AppRouter />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 