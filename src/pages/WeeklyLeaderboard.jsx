import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { getWeekKeyMYT } from '../lib/weekKeyMYT';
import Layout from '../components/Layout';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CalendarDays, Trophy } from 'lucide-react';
import clsx from 'clsx';

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
}

export default function WeeklyLeaderboard() {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentWeek = getWeekKeyMYT();

  useEffect(() => {
    const q = query(
      collection(db, 'pointsLedger'),
      where('weekKey', '==', currentWeek)
    );
    const unsub = onSnapshot(q, (snap) => {
      // Aggregate points by uid
      const map = {};
      snap.docs.forEach((d) => {
        const { uid, points } = d.data();
        if (!map[uid]) map[uid] = { uid, points: 0, tasks: 0 };
        map[uid].points += points || 0;
        map[uid].tasks += 1;
      });

      // Convert to array and sort
      const arr = Object.values(map).sort((a, b) => b.points - a.points);
      setWeeklyData(arr);
      setLoading(false);
    });
    return unsub;
  }, [currentWeek]);

  // Fetch user display names
  const [userNames, setUserNames] = useState({});
  useEffect(() => {
    if (weeklyData.length === 0) return;
    const uids = weeklyData.map((w) => w.uid);
    const fetchNames = async () => {
      const names = {};
      for (const uid of uids) {
        try {
          const snap = await getDoc(doc(db, 'users', uid));
          if (snap.exists()) {
            names[uid] = snap.data().displayName || uid;
          }
        } catch {
          names[uid] = uid;
        }
      }
      setUserNames(names);
    };
    fetchNames();
  }, [weeklyData]);

  // Parse week key display
  const [year, week] = currentWeek.split('-W');
  const weekDisplay = `Week ${week}, ${year}`;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-200">
            <CalendarDays className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Leaderboard</h1>
          <div className="inline-flex items-center gap-1.5 mt-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
            <CalendarDays className="w-3.5 h-3.5" />
            {weekDisplay} · Malaysia Time
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : weeklyData.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No activity this week"
            description={`No tasks have been completed this week (${weekDisplay}). Points will appear here as tasks are completed.`}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">This Week's Rankings</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{weekDisplay}</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span className="w-8 text-center">Rank</span>
              <span className="flex-1">Member</span>
              <span className="w-16 text-center">Tasks</span>
              <span className="w-20 text-right">Points</span>
            </div>
            {weeklyData.map((entry, idx) => {
              const rank = idx + 1;
              const isMe = entry.uid === user?.uid;
              const name = userNames[entry.uid] || entry.uid;
              return (
                <motion.div
                  key={entry.uid}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={clsx(
                    'flex items-center gap-4 px-4 py-4 border-b border-gray-50 last:border-0',
                    isMe && 'bg-indigo-50'
                  )}
                >
                  <div className="w-8 flex items-center justify-center">
                    <RankBadge rank={rank} />
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={clsx(
                      'w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                      rank === 1 ? 'bg-amber-400' : rank === 2 ? 'bg-gray-400' : rank === 3 ? 'bg-orange-400' : 'bg-indigo-500'
                    )}>
                      {name?.[0]?.toUpperCase()}
                    </div>
                    <p className={clsx('text-sm font-semibold truncate', isMe ? 'text-indigo-700' : 'text-gray-900')}>
                      {name} {isMe && <span className="text-xs font-normal text-indigo-500">(you)</span>}
                    </p>
                  </div>
                  <div className="w-16 text-center">
                    <span className="text-sm font-medium text-gray-600">{entry.tasks}</span>
                    <span className="text-xs text-gray-400 ml-0.5">tasks</span>
                  </div>
                  <div className="w-20 text-right">
                    <span className={clsx(
                      'text-sm font-bold',
                      rank === 1 ? 'text-amber-600' : rank <= 3 ? 'text-orange-600' : isMe ? 'text-indigo-600' : 'text-gray-700'
                    )}>
                      +{entry.points}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">pts</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          Points are awarded by the system when tasks are completed. Week resets every Monday at 00:00 MYT.
        </p>
      </motion.div>
    </Layout>
  );
}
