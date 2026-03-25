import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, query, where, onSnapshot, updateDoc, doc,
  orderBy, deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const markRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => updateDoc(doc(db, 'notifications', n.id), { read: true })));
    toast.success('All marked as read');
  };

  const deleteNotif = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up! Notifications will appear here when you receive them."
          />
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {notifications.map((notif) => {
                const time = notif.createdAt?.toDate ? notif.createdAt.toDate() : new Date();
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={clsx(
                      'flex items-start gap-4 p-4 rounded-xl border transition-colors',
                      notif.read
                        ? 'bg-white border-gray-100'
                        : 'bg-indigo-50 border-indigo-200'
                    )}
                  >
                    <div className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      notif.read ? 'bg-gray-100' : 'bg-indigo-600'
                    )}>
                      <Bell className={clsx('w-5 h-5', notif.read ? 'text-gray-400' : 'text-white')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={clsx('text-sm font-semibold', notif.read ? 'text-gray-700' : 'text-gray-900')}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{notif.body}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {time.toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notif.read && (
                        <button
                          onClick={() => markRead(notif.id)}
                          title="Mark as read"
                          className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-100 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotif(notif.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </Layout>
  );
}
