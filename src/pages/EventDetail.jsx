import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  doc, getDoc, updateDoc, collection, addDoc, query,
  where, getDocs, writeBatch, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  Calendar, MapPin, ArrowLeft, Upload, CheckSquare,
  Paperclip, Zap, FileText, Video, Camera, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const REQUIREMENT_TASKS = {
  poster: [{ type: 'poster', title: 'Design Event Poster', role: 'designer', points: 10 }],
  video: [
    { type: 'video_script', title: 'Write Video Script', role: 'scriptwriter', points: 10 },
    { type: 'video_shooting', title: 'Video Shooting', role: 'photographer', points: 12 },
    { type: 'video_edit', title: 'Video Editing', role: 'supervisor', points: 15 },
  ],
  coverage: [{ type: 'coverage', title: 'Event Coverage/Photography', role: 'photographer', points: 10 }],
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [requirements, setRequirements] = useState({ poster: false, video: false, coverage: false });
  const fileRef = useRef();
  const isLeader = userProfile?.userType === 'leader';

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const snap = await getDoc(doc(db, 'events', id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setEvent(data);
          setRequirements(data.requirements || { poster: false, video: false, coverage: false });
          // Load attachments from Storage
          const listRef = ref(storage, `events/${id}`);
          try {
            const res = await listAll(listRef);
            const urls = await Promise.all(
              res.items.map(async (item) => ({
                name: item.name,
                url: await getDownloadURL(item),
              }))
            );
            setAttachments(urls);
          } catch {
            // Storage may be empty or not configured
          }
        }
      } catch (err) {
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRequirementChange = async (key, value) => {
    if (!isLeader) return;
    const updated = { ...requirements, [key]: value };
    setRequirements(updated);
    try {
      await updateDoc(doc(db, 'events', id), { requirements: updated });
    } catch {
      toast.error('Failed to update requirements');
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const storageRef = ref(storage, `events/${id}/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      'state_changed',
      (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => { toast.error(err.message); setUploading(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setAttachments((prev) => [...prev, { name: file.name, url }]);
        setUploading(false);
        setUploadProgress(0);
        toast.success('File uploaded!');
      }
    );
  };

  const handleGenerateTasks = async () => {
    const selected = Object.entries(requirements).filter(([, v]) => v).map(([k]) => k);
    if (selected.length === 0) {
      toast.error('Select at least one requirement');
      return;
    }
    setGenerating(true);
    try {
      const batch = writeBatch(db);
      for (const req of selected) {
        const tasks = REQUIREMENT_TASKS[req] || [];
        for (const task of tasks) {
          const taskRef = doc(collection(db, 'tasks'));
          batch.set(taskRef, {
            ...task,
            eventId: id,
            eventName: event.name,
            status: 'pending',
            assignedTo: null,
            assignedName: null,
            deadline: null,
            notes: '',
            pointsAwarded: false,
            createdAt: serverTimestamp(),
          });
        }
      }
      // Mark event tasksGenerated
      const eventRef = doc(db, 'events', id);
      batch.update(eventRef, { tasksGenerated: true });
      await batch.commit();
      setEvent((prev) => ({ ...prev, tasksGenerated: true }));
      toast.success('Tasks generated successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="text-center py-24">
          <p className="text-gray-500">Event not found.</p>
          <Button onClick={() => navigate('/events')} variant="secondary" className="mt-4">Back to Events</Button>
        </div>
      </Layout>
    );
  }

  const date = event.date?.toDate ? event.date.toDate() : new Date(event.date);

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back */}
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </button>

        {/* Event Header */}
        <div className="bg-indigo-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-3">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-indigo-200 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {date.toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                {event.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                )}
              </div>
              {event.description && (
                <p className="mt-3 text-indigo-100 text-sm">{event.description}</p>
              )}
            </div>
            {event.tasksGenerated && (
              <span className="bg-emerald-400 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 flex-shrink-0">
                <Check className="w-3.5 h-3.5" /> Tasks Generated
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requirements */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                Requirements
              </h2>
            </div>
            <div className="space-y-3">
              {[
                { key: 'poster', label: 'Poster', icon: FileText, desc: '1 task: Design Event Poster (10pts)' },
                { key: 'video', label: 'Video', icon: Video, desc: '3 tasks: Script, Shooting, Editing (37pts)' },
                { key: 'coverage', label: 'Coverage / Photography', icon: Camera, desc: '1 task: Event Coverage (10pts)' },
              ].map(({ key, label, icon: Icon, desc }) => (
                <label
                  key={key}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                    requirements[key]
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${!isLeader ? 'cursor-default' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={requirements[key]}
                    onChange={(e) => handleRequirementChange(key, e.target.checked)}
                    disabled={!isLeader}
                    className="mt-0.5 w-4 h-4 text-indigo-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900 text-sm">{label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {isLeader && (
              <Button
                onClick={handleGenerateTasks}
                loading={generating}
                disabled={event.tasksGenerated}
                className="w-full mt-5"
                variant={event.tasksGenerated ? 'secondary' : 'primary'}
              >
                <Zap className="w-4 h-4" />
                {event.tasksGenerated ? 'Tasks Already Generated' : 'Generate Tasks from Requirements'}
              </Button>
            )}
          </Card>

          {/* Attachments */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                Attachments
              </h2>
              <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload className="w-3.5 h-3.5" />
                Upload
              </Button>
            </div>

            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />

            {uploading && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Uploading…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {attachments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No attachments yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                  >
                    <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate group-hover:text-indigo-600">{att.name}</span>
                  </a>
                ))}
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </Layout>
  );
}
