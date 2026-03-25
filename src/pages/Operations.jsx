import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, query, onSnapshot, addDoc, updateDoc, doc,
  serverTimestamp, where, getDocs, orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Tabs from '../components/ui/Tabs';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  ClipboardList, Plus, Calendar, User, Edit2,
  Paintbrush, Camera, FileText, Video, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const ROLE_TABS = [
  { value: 'all', label: 'All' },
  { value: 'designer', label: 'Designer' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'scriptwriter', label: 'Scriptwriter' },
  { value: 'supervisor', label: 'Supervisor' },
];

const TASK_TYPES = [
  { value: 'poster', label: 'Poster', role: 'designer' },
  { value: 'video_script', label: 'Video Script', role: 'scriptwriter' },
  { value: 'video_shooting', label: 'Video Shooting', role: 'photographer' },
  { value: 'video_edit', label: 'Video Edit', role: 'supervisor' },
  { value: 'coverage', label: 'Coverage', role: 'photographer' },
  { value: 'other', label: 'Other', role: '' },
];

const ROLE_ICONS = { designer: Paintbrush, photographer: Camera, scriptwriter: FileText, supervisor: Shield };

function TaskCard({ task, onEdit, isLeader }) {
  const RoleIcon = ROLE_ICONS[task.role] || ClipboardList;
  const deadline = task.deadline?.toDate ? task.deadline.toDate() : (task.deadline ? new Date(task.deadline) : null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <RoleIcon className="w-4 h-4 text-gray-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{task.title}</p>
            {task.eventName && (
              <p className="text-xs text-gray-400 truncate">{task.eventName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge status={task.status}>
            {task.status?.replace('_', ' ')}
          </Badge>
          {isLeader && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {task.assignedName && (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" /> {task.assignedName}
          </span>
        )}
        {deadline && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {deadline.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
          </span>
        )}
        <span className="text-indigo-600 font-medium">⭐ {task.points || 0} pts</span>
        {task.role && (
          <span className="capitalize bg-gray-100 px-1.5 py-0.5 rounded">{task.role}</span>
        )}
      </div>

      {task.notes && (
        <p className="mt-2 text-xs text-gray-400 line-clamp-2 border-t border-gray-50 pt-2">{task.notes}</p>
      )}
    </motion.div>
  );
}

export default function Operations() {
  const { userProfile } = useAuth();
  const isLeader = userProfile?.userType === 'leader';
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [roleTab, setRoleTab] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [mediaMembers, setMediaMembers] = useState([]);
  const [events, setEvents] = useState([]);

  // Task form state
  const [form, setForm] = useState({
    title: '', type: 'poster', role: 'designer', eventId: '', points: 10,
    assignedTo: '', deadline: '', notes: '', status: 'pending'
  });
  const [saving, setSaving] = useState(false);
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'tasks'), orderBy('createdAt', 'desc')),
      (snap) => {
        setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (!isLeader) return;
    // Load approved media members
    const unsub = onSnapshot(
      query(collection(db, 'users'), where('userType', '==', 'media'), where('approved', '==', true)),
      (snap) => setMediaMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, [isLeader]);

  useEffect(() => {
    if (!isLeader) return;
    const unsub = onSnapshot(
      query(collection(db, 'events'), orderBy('date', 'desc')),
      (snap) => setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, [isLeader]);

  const filtered = tasks.filter((t) => {
    if (statusTab !== 'all' && t.status !== statusTab) return false;
    if (roleTab !== 'all' && t.role !== roleTab) return false;
    return true;
  });

  const resetForm = () => setForm({
    title: '', type: 'poster', role: 'designer', eventId: '', points: 10,
    assignedTo: '', deadline: '', notes: '', status: 'pending'
  });

  const handleTypeChange = (type) => {
    const found = TASK_TYPES.find((t) => t.value === type);
    const POINTS = { poster: 10, video_script: 10, video_shooting: 12, video_edit: 15, coverage: 10 };
    setForm((f) => ({
      ...f,
      type,
      role: found?.role || f.role,
      points: POINTS[type] || f.points,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const assignedMember = mediaMembers.find((m) => m.id === form.assignedTo);
      const selectedEvent = events.find((ev) => ev.id === form.eventId);

      const taskData = {
        title: form.title,
        type: form.type,
        role: form.role,
        points: Number(form.points) || 0,
        eventId: form.eventId || null,
        eventName: selectedEvent?.name || null,
        assignedTo: form.assignedTo || null,
        assignedName: assignedMember?.displayName || null,
        deadline: form.deadline ? new Date(form.deadline) : null,
        notes: form.notes,
        status: 'pending',
        pointsAwarded: false,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'tasks'), taskData);

      // Send notification if assigned
      if (form.assignedTo) {
        await addDoc(collection(db, 'notifications'), {
          uid: form.assignedTo,
          title: 'New Task Assigned',
          body: `You have been assigned: ${form.title}`,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      toast.success('Task created!');
      setShowCreate(false);
      resetForm();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const assignedMember = mediaMembers.find((m) => m.id === form.assignedTo);
      const prevTask = editTask;

      await updateDoc(doc(db, 'tasks', editTask.id), {
        title: form.title,
        role: form.role,
        points: Number(form.points) || 0,
        assignedTo: form.assignedTo || null,
        assignedName: assignedMember?.displayName || null,
        deadline: form.deadline ? new Date(form.deadline) : null,
        notes: form.notes,
        status: form.status,
      });

      // Notify on new assignment
      if (form.assignedTo && form.assignedTo !== prevTask.assignedTo) {
        await addDoc(collection(db, 'notifications'), {
          uid: form.assignedTo,
          title: 'Task Assigned to You',
          body: `You have been assigned: ${form.title}`,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      toast.success('Task updated!');
      setEditTask(null);
      resetForm();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (task) => {
    setEditTask(task);
    const dl = task.deadline?.toDate ? task.deadline.toDate() : (task.deadline ? new Date(task.deadline) : null);
    setForm({
      title: task.title || '',
      type: task.type || 'poster',
      role: task.role || 'designer',
      eventId: task.eventId || '',
      points: task.points || 10,
      assignedTo: task.assignedTo || '',
      deadline: dl ? dl.toISOString().split('T')[0] : '',
      notes: task.notes || '',
      status: task.status || 'pending',
    });
  };

  const TaskForm = ({ onSubmit, isEdit }) => (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input label="Task Title" value={form.title} onChange={(e) => setF('title', e.target.value)} required />
      {!isEdit && (
        <Select label="Task Type" value={form.type} onChange={(e) => handleTypeChange(e.target.value)}>
          {TASK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Select label="Role" value={form.role} onChange={(e) => setF('role', e.target.value)}>
          <option value="designer">Designer</option>
          <option value="photographer">Photographer</option>
          <option value="scriptwriter">Scriptwriter</option>
          <option value="supervisor">Supervisor</option>
        </Select>
        <Input label="Points" type="number" min={0} value={form.points} onChange={(e) => setF('points', e.target.value)} />
      </div>
      {isEdit && (
        <Select label="Status" value={form.status} onChange={(e) => setF('status', e.target.value)}>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      )}
      {!isEdit && (
        <Select label="Event" value={form.eventId} onChange={(e) => setF('eventId', e.target.value)}>
          <option value="">No event</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.name}</option>
          ))}
        </Select>
      )}
      <Select label="Assign To" value={form.assignedTo} onChange={(e) => setF('assignedTo', e.target.value)}>
        <option value="">Unassigned</option>
        {mediaMembers.map((m) => (
          <option key={m.id} value={m.id}>{m.displayName} ({m.teamRole})</option>
        ))}
      </Select>
      <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => setF('deadline', e.target.value)} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setF('notes', e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Additional notes…"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={() => { setShowCreate(false); setEditTask(null); resetForm(); }}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>{isEdit ? 'Update Task' : 'Create Task'}</Button>
      </div>
    </form>
  );

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Operations</h1>
            <p className="text-sm text-gray-500 mt-0.5">{tasks.length} total tasks</p>
          </div>
          {isLeader && (
            <Button onClick={() => { resetForm(); setShowCreate(true); }}>
              <Plus className="w-4 h-4" /> New Task
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="space-y-3 mb-6">
          <Tabs tabs={STATUS_TABS} activeTab={statusTab} onChange={setStatusTab} />
          <Tabs tabs={ROLE_TABS} activeTab={roleTab} onChange={setRoleTab} />
        </div>

        {/* Tasks grid */}
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No tasks found"
            description="No tasks match the current filters."
            action={isLeader ? (
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4" /> Create Task
              </Button>
            ) : null}
          />
        ) : (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filtered.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={openEdit} isLeader={isLeader} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} title="Create New Task" size="lg">
        <TaskForm onSubmit={handleCreate} isEdit={false} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTask} onClose={() => { setEditTask(null); resetForm(); }} title="Edit Task" size="lg">
        <TaskForm onSubmit={handleUpdate} isEdit={true} />
      </Modal>
    </Layout>
  );
}
