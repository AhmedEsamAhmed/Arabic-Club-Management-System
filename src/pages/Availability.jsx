import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Clock, Save, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function SlotRow({ slot, index, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      <select
        value={slot.day}
        onChange={(e) => onChange(index, 'day', e.target.value)}
        className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <input
        type="time"
        value={slot.from}
        onChange={(e) => onChange(index, 'from', e.target.value)}
        className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <span className="text-gray-400 text-sm">to</span>
      <input
        type="time"
        value={slot.to}
        onChange={(e) => onChange(index, 'to', e.target.value)}
        className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        onClick={() => onRemove(index)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Availability() {
  const { user, userProfile } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, 'availability', user.uid));
        if (snap.exists()) {
          setSlots(snap.data().slots || []);
        }
      } catch {
        // First time — empty
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const addSlot = () => {
    setSlots((prev) => [...prev, { day: 'Monday', from: '09:00', to: '17:00' }]);
  };

  const updateSlot = (index, key, value) => {
    setSlots((prev) => prev.map((s, i) => i === index ? { ...s, [key]: value } : s));
  };

  const removeSlot = (index) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'availability', user.uid), {
        uid: user.uid,
        displayName: userProfile?.displayName || '',
        slots,
        updatedAt: new Date(),
      });
      toast.success('Availability saved!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Availability</h1>
            <p className="text-sm text-gray-500 mt-0.5">Set your available time slots for the leader</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={addSlot}>
              <Plus className="w-4 h-4" />
              Add Slot
            </Button>
            <Button size="sm" loading={saving} onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>

        <Card>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No availability slots set</p>
              <p className="text-sm text-gray-400 mb-4">Add your available time slots so the leader can schedule tasks.</p>
              <Button onClick={addSlot} variant="secondary">
                <Plus className="w-4 h-4" />
                Add First Slot
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {slots.map((slot, i) => (
                <SlotRow
                  key={i}
                  slot={slot}
                  index={i}
                  onChange={updateSlot}
                  onRemove={removeSlot}
                />
              ))}
              <Button onClick={addSlot} variant="ghost" className="w-full mt-2 border border-dashed border-gray-300">
                <Plus className="w-4 h-4" />
                Add Another Slot
              </Button>
            </div>
          )}
        </Card>

        {slots.length > 0 && (
          <div className="mt-4 bg-indigo-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-indigo-800 mb-2">Your Schedule Summary</h3>
            <div className="space-y-1">
              {DAYS.filter((d) => slots.some((s) => s.day === d)).map((day) => (
                <div key={day} className="flex items-center gap-2 text-sm text-indigo-700">
                  <span className="font-medium w-24">{day}</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {slots.filter((s) => s.day === day).map((s, i) => (
                      <span key={i} className="bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full text-xs">
                        {s.from} – {s.to}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
}
