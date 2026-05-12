import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Cases from './pages/Cases.jsx';
import CaseDetail from './pages/CaseDetail.jsx';
import MapPage from './pages/MapPage.jsx';
import Ledger from './pages/Ledger.jsx';
import Community from './pages/Community.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Wallet from './pages/Wallet.jsx';
import Volunteer from './pages/Volunteer.jsx';
import Admin from './pages/Admin.jsx';
import { useAuth } from './context/AuthContext.jsx';

function Private({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function App() {
  const { loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/ledger" element={<Ledger />} />
        <Route path="/community" element={<Community />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <Private>
              <Profile />
            </Private>
          }
        />
        <Route
          path="/wallet"
          element={
            <Private>
              <Wallet />
            </Private>
          }
        />
        <Route
          path="/volunteer"
          element={
            <Private>
              <Volunteer />
            </Private>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute admin>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
