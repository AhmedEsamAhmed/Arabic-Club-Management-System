import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import LeaderLogin from './pages/LeaderLogin';
import DepartmentEnter from './pages/DepartmentEnter';
import FinishSignIn from './pages/FinishSignIn';
import SignupMedia from './pages/SignupMedia';
import PendingMediaApproval from './pages/PendingMediaApproval';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import LeaderMembers from './pages/LeaderMembers';
import Operations from './pages/Operations';
import MyTasks from './pages/MyTasks';
import Notifications from './pages/Notifications';
import Availability from './pages/Availability';
import Leaderboard from './pages/Leaderboard';
import WeeklyLeaderboard from './pages/WeeklyLeaderboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/leader-login" element={<LeaderLogin />} />
          <Route path="/department-enter" element={<DepartmentEnter />} />
          <Route path="/finish-sign-in" element={<FinishSignIn />} />
          <Route path="/signup-media" element={<SignupMedia />} />

          {/* Protected: pending approval */}
          <Route
            path="/pending-approval"
            element={
              <ProtectedRoute>
                <PendingMediaApproval />
              </ProtectedRoute>
            }
          />

          {/* Protected: any authenticated user */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations"
            element={
              <ProtectedRoute>
                <Operations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weekly-leaderboard"
            element={
              <ProtectedRoute>
                <WeeklyLeaderboard />
              </ProtectedRoute>
            }
          />

          {/* Protected: media only */}
          <Route
            path="/my-tasks"
            element={
              <ProtectedRoute requiredRole="media" requireApproved>
                <MyTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/availability"
            element={
              <ProtectedRoute requiredRole="media" requireApproved>
                <Availability />
              </ProtectedRoute>
            }
          />

          {/* Protected: leader only */}
          <Route
            path="/leader-members"
            element={
              <ProtectedRoute requiredRole="leader">
                <LeaderMembers />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
