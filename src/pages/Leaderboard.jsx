import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Trophy, Medal, Star } from 'lucide-react';
import clsx from 'clsx';

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('userType', '==', 'media'),
      where('approved', '==', true)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.pointsTotal || 0) - (a.pointsTotal || 0));
      setMembers(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-200">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-sm text-gray-500 mt-1">Lifetime points ranking for all media members</p>
        </div>

        {/* Top 3 podium */}
        {!loading && members.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center text-white text-lg font-bold mb-2 shadow-md">
                {members[1]?.displayName?.[0]?.toUpperCase()}
              </div>
              <p className="text-xs font-semibold text-gray-700 mb-1 max-w-[80px] text-center truncate">{members[1]?.displayName}</p>
              <p className="text-sm font-bold text-gray-600">{members[1]?.pointsTotal || 0} pts</p>
              <div className="mt-2 bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-t-lg">2nd</div>
              <div className="h-16 w-20 bg-gray-200 rounded-b-lg flex items-center justify-center">🥈</div>
            </motion.div>
            {/* 1st */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-18 h-18 w-[72px] h-[72px] bg-amber-400 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2 shadow-lg shadow-amber-200">
                {members[0]?.displayName?.[0]?.toUpperCase()}
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1 max-w-[90px] text-center truncate">{members[0]?.displayName}</p>
              <p className="text-base font-bold text-amber-600">{members[0]?.pointsTotal || 0} pts</p>
              <div className="mt-2 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-t-lg">1st 👑</div>
              <div className="h-24 w-24 bg-amber-400 rounded-b-lg flex items-center justify-center">🥇</div>
            </motion.div>
            {/* 3rd */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-orange-300 rounded-full flex items-center justify-center text-white text-lg font-bold mb-2 shadow-md">
                {members[2]?.displayName?.[0]?.toUpperCase()}
              </div>
              <p className="text-xs font-semibold text-gray-700 mb-1 max-w-[80px] text-center truncate">{members[2]?.displayName}</p>
              <p className="text-sm font-bold text-orange-600">{members[2]?.pointsTotal || 0} pts</p>
              <div className="mt-2 bg-orange-300 text-white text-xs font-bold px-3 py-1 rounded-t-lg">3rd</div>
              <div className="h-10 w-20 bg-orange-300 rounded-b-lg flex items-center justify-center">🥉</div>
            </motion.div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No rankings yet"
            description="Media members will appear here once they earn points by completing tasks."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span className="w-10 text-center">Rank</span>
              <span className="flex-1">Member</span>
              <span>Role</span>
              <span className="w-20 text-right">Points</span>
            </div>
            {members.map((member, idx) => {
              const rank = idx + 1;
              const isMe = member.id === user?.uid;
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={clsx(
                    'flex items-center gap-4 px-4 py-3.5 border-b border-gray-50 last:border-0 transition-colors',
                    isMe && 'bg-indigo-50 border-indigo-100'
                  )}
                >
                  <div className="w-10 flex items-center justify-center">
                    <RankBadge rank={rank} />
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={clsx(
                      'w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                      rank === 1 ? 'bg-amber-400' : rank === 2 ? 'bg-gray-400' : rank === 3 ? 'bg-orange-400' : 'bg-indigo-500'
                    )}>
                      {member.displayName?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={clsx('text-sm font-semibold truncate', isMe ? 'text-indigo-700' : 'text-gray-900')}>
                        {member.displayName} {isMe && <span className="text-xs font-normal">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{member.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 capitalize hidden sm:block">{member.teamRole || '—'}</span>
                  <div className="w-20 text-right">
                    <span className={clsx(
                      'text-sm font-bold',
                      rank === 1 ? 'text-amber-600' : rank <= 3 ? 'text-orange-600' : isMe ? 'text-indigo-600' : 'text-gray-700'
                    )}>
                      {member.pointsTotal || 0}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">pts</span>
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
