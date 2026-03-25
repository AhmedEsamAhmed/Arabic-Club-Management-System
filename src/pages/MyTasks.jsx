import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Tabs from '../components/ui/Tabs';
import { CheckSquare, Calendar, Clock, FileText, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function MyTasks() {
  const { user, userProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ status: '', progress: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'tasks'),
      where('assignedTo', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const filtered = tasks.filter((t) => statusTab === 'all' || t.status === statusTab);

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      status: task.status || 'pending',
      progress: task.progress || '',
      notes: task.notes || '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'tasks', editTask.id), {
        status: form.status,
        progress: form.progress,
        notes: form.notes,
        updatedAt: new Date(),
      });
      toast.success('Task updated!');
      setEditTask(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Hello {userProfile?.displayName} — {stats.total} tasks assigned to you
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-700', bg: 'bg-gray-100' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-100' },
            { label: 'In Progress', value: stats.in_progress, color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: 'Completed', value: stats.completed, color: 'text-emerald-700', bg: 'bg-emerald-100' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className={`text-xs font-medium ${s.color} mt-0.5`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <Tabs tabs={STATUS_TABS} activeTab={statusTab} onChange={setStatusTab} className="mb-6" />

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks here"
            description={statusTab === 'all' ? 'No tasks have been assigned to you yet.' : `No ${statusTab.replace('_', ' ')} tasks.`}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((task) => {
              const deadline = task.deadline?.toDate ? task.deadline.toDate() : (task.deadline ? new Date(task.deadline) : null);
              const overdue = deadline && deadline < new Date() && task.status !== 'completed';

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{task.title}</h3>
                      {task.eventName && (
                        <p className="text-xs text-gray-400">{task.eventName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Badge status={task.status}>{task.status?.replace('_', ' ')}</Badge>
                      <button
                        onClick={() => openEdit(task)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                    {deadline && (
                      <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : ''}`}>
                        <Calendar className="w-3 h-3" />
                        {overdue && '⚠ '}
                        {deadline.toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    <span className="text-indigo-600 font-medium">⭐ {task.points || 0} pts</span>
                    <span className="capitalize">{task.role}</span>
                  </div>

                  {task.progress && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Number(task.progress) || 0)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {task.notes && (
                    <p className="text-xs text-gray-400 flex items-start gap-1 border-t border-gray-50 pt-2">
                      <FileText className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      {task.notes}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Update Task">
        {editTask && (
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-semibold text-gray-800">{editTask.title}</p>
              {editTask.eventName && <p className="text-gray-500 text-xs">{editTask.eventName}</p>}
            </div>
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </Select>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Progress (%)</label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.progress || 0}
                onChange={(e) => setForm((f) => ({ ...f, progress: e.target.value }))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0%</span>
                <span className="font-medium text-indigo-600">{form.progress || 0}%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Notes / Update</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Add your progress notes…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setEditTask(null)}>Cancel</Button>
              <Button type="submit" loading={saving}>Save Update</Button>
            </div>
          </form>
        )}
      </Modal>
    </Layout>
  );
}
