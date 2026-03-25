const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getMYTDate, isoWeekKeyFromMYT } = require('./weekKey');

admin.initializeApp();
const db = admin.firestore();

const POINTS_MAP = {
  poster: 10,
  video_script: 10,
  video_shooting: 12,
  video_edit: 15,
  coverage: 10,
};

exports.onTaskComplete = functions.firestore
  .document('tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const taskId = context.params.taskId;

    // Only award when status changes to 'completed'
    if (before.status === after.status) return null;
    if (after.status !== 'completed') return null;
    if (after.pointsAwarded === true) return null;
    if (!after.assignedTo) return null;

    const points = POINTS_MAP[after.type] || 0;
    if (points === 0) return null;

    const uid = after.assignedTo;
    const weekKey = isoWeekKeyFromMYT(getMYTDate(new Date()));

    const ledgerRef = db.collection('pointsLedger').doc();
    const userRef = db.collection('users').doc(uid);
    const taskRef = change.after.ref;

    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const currentPoints = userSnap.exists ? (userSnap.data().pointsTotal || 0) : 0;

      tx.update(userRef, { pointsTotal: currentPoints + points });
      tx.update(taskRef, { pointsAwarded: true });
      tx.set(ledgerRef, {
        uid,
        taskId,
        eventId: after.eventId || null,
        taskType: after.type || null,
        points,
        weekKey,
        awardedAt: admin.firestore.FieldValue.serverTimestamp(),
        awardedBy: 'system',
      });
    });

    return null;
  });
