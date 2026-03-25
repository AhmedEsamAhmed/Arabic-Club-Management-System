import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, LogIn, UserPlus, Calendar, ClipboardList, CheckSquare,
  Bell, Users, Trophy, CalendarDays, Menu, X, LogOut, ChevronRight,
  Star, Clock, Shield
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

function NavItem({ to, icon: Icon, label, badge, onClick }) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-medium"
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        {badge > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{label}</span>
          {badge > 0 && (
            <span className={clsx(
              'text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold',
              isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
            )}>
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function NavGroup({ label, children }) {
  return (
    <div className="mb-4">
      <p className="px-3 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', user.uid),
      where('read', '==', false)
    );
    const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));
    return unsub;
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
    onClose?.();
  };

  const initials = userProfile?.displayName
    ? userProfile.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  const roleColors = {
    leader: 'bg-indigo-100 text-indigo-700',
    media: 'bg-emerald-100 text-emerald-700',
    department: 'bg-amber-100 text-amber-700',
  };

  const roleLabel = {
    leader: 'Leader',
    media: userProfile?.teamRole || 'Media',
    department: 'Department',
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex flex-col lg:translate-x-0 lg:static lg:z-auto shadow-lg lg:shadow-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-none">Arabic Club</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto sidebar-scroll">
          {!user ? (
            <NavGroup label="Welcome">
              <NavItem to="/" icon={Home} label="Home" />
              <NavItem to="/leader-login" icon={LogIn} label="Leader Login" />
              <NavItem to="/signup-media" icon={UserPlus} label="Media Signup" />
              <NavItem to="/department-enter" icon={Shield} label="Department Entry" />
            </NavGroup>
          ) : (
            <>
              <NavGroup label="Overview">
                <NavItem to="/" icon={Home} label="Home" />
              </NavGroup>

              <NavGroup label="Events">
                <NavItem to="/events" icon={Calendar} label="Events" />
              </NavGroup>

              <NavGroup label="Operations">
                <NavItem to="/operations" icon={ClipboardList} label="Operations" />
                {userProfile?.userType === 'media' && userProfile?.approved && (
                  <>
                    <NavItem to="/my-tasks" icon={CheckSquare} label="My Tasks" />
                    <NavItem to="/availability" icon={Clock} label="Availability" />
                  </>
                )}
              </NavGroup>

              <NavGroup label="Social">
                <NavItem to="/notifications" icon={Bell} label="Notifications" badge={unreadCount} />
                <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" />
                <NavItem to="/weekly-leaderboard" icon={CalendarDays} label="Weekly Board" />
              </NavGroup>

              {userProfile?.userType === 'leader' && (
                <NavGroup label="Leader Tools">
                  <NavItem to="/leader-members" icon={Users} label="Members" />
                </NavGroup>
              )}
            </>
          )}
        </nav>

        {/* User profile / footer */}
        {user && (
          <div className="border-t border-gray-100 p-3">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userProfile?.displayName || user.email}
                </p>
                <span className={clsx(
                  'text-xs px-1.5 py-0.5 rounded-full font-medium',
                  roleColors[userProfile?.userType] || 'bg-gray-100 text-gray-600'
                )}>
                  {roleLabel[userProfile?.userType] || userProfile?.userType || '—'}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
}
