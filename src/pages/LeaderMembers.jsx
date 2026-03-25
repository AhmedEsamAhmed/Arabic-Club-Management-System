import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  collection, query, onSnapshot, updateDoc, doc, orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Users, CheckCircle, XCircle, Clock, Camera, Paintbrush, Video, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_ICONS = {
  designer: Paintbrush,
  photographer: Camera,
  scriptwriter: Video,
  supervisor: Shield,
};

const ROLE_COLORS = {
  designer: 'text-purple-600 bg-purple-50',
  photographer: 'text-blue-600 bg-blue-50',
  scriptwriter: 'text-emerald-600 bg-emerald-50',
  supervisor: 'text-orange-600 bg-orange-50',
};

export default function LeaderMembers() {
  const { userProfile } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending | approved | all

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.userType === 'media');
      setMembers(all);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleApprove = async (uid) => {
    try {
      await updateDoc(doc(db, 'users', uid), { approved: true });
      toast.success('Member approved!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async (uid) => {
    try {
      await updateDoc(doc(db, 'users', uid), { approved: false });
      toast.success('Member rejected');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = members.filter((m) => {
    if (activeTab === 'pending') return !m.approved;
    if (activeTab === 'approved') return m.approved;
    return true;
  });

  const pendingCount = members.filter((m) => !m.approved).length;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Members</h1>
            <p className="text-sm text-gray-500 mt-0.5">{members.length} total · {pendingCount} pending</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'pending', label: 'Pending', count: members.filter((m) => !m.approved).length },
            { value: 'approved', label: 'Approved', count: members.filter((m) => m.approved).length },
            { value: 'all', label: 'All', count: members.length },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center ${
                activeTab === tab.value ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={activeTab === 'pending' ? 'No pending members' : 'No members found'}
            description={activeTab === 'pending' ? 'All media members have been reviewed.' : 'No media members registered yet.'}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((member) => {
              const RoleIcon = ROLE_ICONS[member.teamRole] || Users;
              const roleColor = ROLE_COLORS[member.teamRole] || 'text-gray-600 bg-gray-50';
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                >
                  {/* Avatar & info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                      {member.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{member.displayName}</p>
                      <p className="text-xs text-gray-400 truncate">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${roleColor}`}>
                      <RoleIcon className="w-3.5 h-3.5" />
                      {member.teamRole || 'No role'}
                    </div>
                    <Badge status={member.approved ? 'approved' : 'pending'}>
                      {member.approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span>⭐ {member.pointsTotal || 0} pts</span>
                    <span>{member.createdAt?.toDate?.()?.toLocaleDateString?.() || '—'}</span>
                  </div>

                  <div className="flex gap-2">
                    {!member.approved ? (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleApprove(member.id)}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleReject(member.id)}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleReject(member.id)}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Revoke
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </Layout>
  );
}
