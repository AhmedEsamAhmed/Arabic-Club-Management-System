import { motion } from 'framer-motion';
import { Clock, LogOut } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function PendingMediaApproval() {
  const { signOut, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/');
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto pt-16 text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Clock className="w-12 h-12 text-amber-500" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Awaiting Approval</h1>
        <p className="text-gray-500 mb-2">
          Hi <strong>{userProfile?.displayName}</strong>! Your account is pending approval from the club leader.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          You'll get access once the leader reviews and approves your account. This usually takes a short while.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
          <h3 className="font-semibold text-amber-800 mb-2">What happens next?</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• The leader will review your registration</li>
            <li>• Your role: <strong>{userProfile?.teamRole}</strong></li>
            <li>• Once approved, you'll have full access to the system</li>
          </ul>
        </div>

        <Button variant="secondary" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </motion.div>
    </Layout>
  );
}
