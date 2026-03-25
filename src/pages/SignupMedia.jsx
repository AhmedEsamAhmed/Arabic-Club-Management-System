import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { Camera, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const TEAM_ROLES = [
  { value: 'designer', label: 'Designer' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'scriptwriter', label: 'Scriptwriter' },
  { value: 'supervisor', label: 'Supervisor' },
];

export default function SignupMedia() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    teamRole: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.displayName.trim()) e.displayName = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.teamRole) e.teamRole = 'Please select your role';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        displayName: form.displayName.trim(),
        email: form.email,
        userType: 'media',
        teamRole: form.teamRole,
        approved: false,
        pointsTotal: 0,
        createdAt: new Date(),
      });
      toast.success('Account created! Waiting for leader approval.');
      navigate('/pending-approval');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setErrors({ email: 'This email is already registered' });
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
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join Media Team</h1>
          <p className="text-gray-500 mt-1 text-sm">Create your account and wait for approval</p>
        </div>

        <Card>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              value={form.displayName}
              onChange={(e) => set('displayName', e.target.value)}
              placeholder="Your name"
              error={errors.displayName}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              required
            />
            <Select
              label="Team Role"
              value={form.teamRole}
              onChange={(e) => set('teamRole', e.target.value)}
              error={errors.teamRole}
              required
            >
              <option value="">Select your role…</option>
              {TEAM_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="At least 6 characters"
              error={errors.password}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              placeholder="Re-enter password"
              error={errors.confirmPassword}
              required
            />
            <Button type="submit" loading={loading} className="w-full mt-2">
              <UserPlus className="w-4 h-4" />
              Create Account
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already a member?{' '}
          <button onClick={() => navigate('/leader-login')} className="text-indigo-600 font-medium hover:underline">
            Sign In
          </button>
        </p>
      </motion.div>
    </Layout>
  );
}
