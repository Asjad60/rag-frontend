import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import WidgetEmbed from './pages/WidgetEmbed';
import WidgetStudio from './pages/WidgetStudio';

function AppRoutes() {
  const userId = localStorage.getItem('userId');

  return (
    <Routes>
      {/* Standalone Public Route for Iframe Embedding (No dashboard background) */}
      <Route path="/widget-embed" element={<WidgetEmbed />} />

      {/* Main SaaS Dashboard Routes */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500 selection:text-white relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900 pointer-events-none"></div>

            <div className="relative z-10 min-h-screen">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={userId ? <Onboarding /> : <Navigate to="/login" />} />
                <Route path="/dashboard" element={userId ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/widget" element={userId ? <WidgetStudio /> : <Navigate to="/login" />} />
                <Route path="/" element={<Navigate to={userId ? "/dashboard" : "/login"} />} />
              </Routes>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
