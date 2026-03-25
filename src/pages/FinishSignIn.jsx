import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FinishSignIn() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking | needEmail | signing | done | error
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem('emailForSignIn');
      if (storedEmail) {
        completeSignIn(storedEmail);
      } else {
        setStatus('needEmail');
      }
    } else {
      setStatus('error');
      setErrorMsg('Invalid or expired sign-in link.');
    }
  }, []);

  const completeSignIn = async (emailToUse) => {
    setStatus('signing');
    try {
      const cred = await signInWithEmailLink(auth, emailToUse, window.location.href);
      window.localStorage.removeItem('emailForSignIn');

      const uid = cred.user.uid;
      const docRef = doc(db, 'users', uid);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        await setDoc(docRef, {
          displayName: emailToUse.split('@')[0],
          email: emailToUse,
          userType: 'department',
          approved: true,
          pointsTotal: 0,
          createdAt: new Date(),
        });
      }

      setStatus('done');
      toast.success('Signed in successfully!');
      setTimeout(() => navigate('/events'), 1500);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
      toast.error('Failed to sign in');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    completeSignIn(email);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto pt-8">
        <Card>
          {status === 'checking' || status === 'signing' ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <LoadingSpinner size="lg" />
              <p className="text-gray-500 text-sm">Completing sign-in…</p>
            </div>
          ) : status === 'done' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900">Signed in! Redirecting…</p>
            </motion.div>
          ) : status === 'error' ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-gray-700 font-medium">Sign-in Failed</p>
              <p className="text-sm text-gray-500">{errorMsg}</p>
              <Button variant="secondary" onClick={() => navigate('/department-enter')}>
                Try Again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-gray-900">Confirm your email</h2>
                <p className="text-sm text-gray-500 mt-1">Enter the email you used to request the sign-in link.</p>
              </div>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
              <Button type="submit" className="w-full">Complete Sign In</Button>
            </form>
          )}
        </Card>
      </div>
    </Layout>
  );
}
