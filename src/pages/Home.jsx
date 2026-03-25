import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Camera, Users, ChevronRight, Star, Calendar, Trophy } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function RoleCard({ icon: Icon, title, description, color, onClick }) {
  return (
    <motion.button
      variants={item}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group`}
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <div className="flex items-center text-sm font-medium text-indigo-600 group-hover:gap-2 transition-all gap-1">
        Get started <ChevronRight className="w-4 h-4" />
      </div>
    </motion.button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        {/* Hero */}
        <div className="text-center mb-12 pt-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200"
          >
            <Star className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold text-gray-900 mb-3"
          >
            Arabic Club
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-500"
          >
            Media & Department Management System
          </motion.p>
        </div>

        {user ? (
          // Authenticated user view
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.div variants={item}>
              <button
                onClick={() => navigate('/events')}
                className="w-full text-left bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <Calendar className="w-8 h-8 text-indigo-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Events</h3>
                <p className="text-sm text-gray-500">View all club events and details</p>
              </button>
            </motion.div>
            <motion.div variants={item}>
              <button
                onClick={() => navigate('/operations')}
                className="w-full text-left bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <Shield className="w-8 h-8 text-emerald-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Operations</h3>
                <p className="text-sm text-gray-500">Manage and track tasks</p>
              </button>
            </motion.div>
            <motion.div variants={item}>
              <button
                onClick={() => navigate('/leaderboard')}
                className="w-full text-left bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <Trophy className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Leaderboard</h3>
                <p className="text-sm text-gray-500">See top performing members</p>
              </button>
            </motion.div>
          </motion.div>
        ) : (
          // Role selection
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RoleCard
              icon={Shield}
              title="Leader"
              description="Full system access: manage events, tasks, and approve members."
              color="bg-indigo-600"
              onClick={() => navigate('/leader-login')}
            />
            <RoleCard
              icon={Camera}
              title="Media Member"
              description="Join the media team. Manage your tasks and update progress."
              color="bg-emerald-600"
              onClick={() => navigate('/signup-media')}
            />
            <RoleCard
              icon={Users}
              title="Department"
              description="Access club information and submit event requirements."
              color="bg-amber-500"
              onClick={() => navigate('/department-enter')}
            />
          </motion.div>
        )}

        {/* Stats / info strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { label: 'Events', value: '∞' },
            { label: 'Media Members', value: '🎬' },
            { label: 'Points System', value: '✨' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl py-4 border border-gray-100 shadow-sm">
              <p className="text-2xl font-bold text-indigo-600">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </Layout>
  );
}
