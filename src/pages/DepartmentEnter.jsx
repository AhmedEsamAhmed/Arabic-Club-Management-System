import { useState } from 'react';
import { motion } from 'framer-motion';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Users, Mail, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ACTION_CODE_SETTINGS = {
  url: `${window.location.origin}/finish-sign-in`,
  handleCodeInApp: true,
};

export default function DepartmentEnter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await sendSignInLinkToEmail(auth, email, ACTION_CODE_SETTINGS);
      window.localStorage.setItem('emailForSignIn', email);
      setSent(true);
      toast.success('Sign-in link sent! Check your email.');
    } catch (err) {
      toast.error(err.message);
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
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Department Entry</h1>
          <p className="text-gray-500 mt-1 text-sm">Enter your email to receive a sign-in link</p>
        </div>

        <Card>
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-4 py-4"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Check your email!</h3>
                <p className="text-sm text-gray-500">
                  We sent a sign-in link to <strong>{email}</strong>.<br />
                  Click the link to access the system.
                </p>
              </div>
              <Button variant="secondary" onClick={() => setSent(false)} size="sm">
                Send to different email
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSend} className="flex flex-col gap-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="department@example.com"
                required
              />
              <Button type="submit" loading={loading} className="w-full">
                <Mail className="w-4 h-4" />
                Send Sign-in Link
              </Button>
            </form>
          )}
        </Card>
      </motion.div>
    </Layout>
  );
}
