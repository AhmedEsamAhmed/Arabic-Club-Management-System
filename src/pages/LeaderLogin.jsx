import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Shield, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeaderLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const docRef = doc(db, 'users', uid);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        // Create leader profile if first time
        await setDoc(docRef, {
          displayName: 'Ahmed',
          email: cred.user.email,
          userType: 'leader',
          approved: true,
          pointsTotal: 0,
          createdAt: new Date(),
        });
      } else if (snap.data().userType !== 'leader') {
        toast.error('This account is not a leader account');
        await auth.signOut();
        setLoading(false);
        return;
      }

      toast.success('Welcome back, Leader!');
      navigate('/events');
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto pt-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Leader Login</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in with your leader credentials</p>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ahmed@example.com"
              error={errors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              required
            />
            <Button type="submit" loading={loading} className="w-full mt-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </form>
        </Card>
      </motion.div>
    </Layout>
  );
}
