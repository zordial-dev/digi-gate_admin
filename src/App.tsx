import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Organisations from '@/pages/Organisations';
import Visitors from '@/pages/Visitors';
import Visits from '@/pages/Visits';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/*"
                element={
                  <div className="flex min-h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <main className="p-6">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/org" element={<Organisations />} />
                          <Route path="/visitors" element={<Visitors />} />
                          <Route path="/visits" element={<Visits />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                }
              />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;