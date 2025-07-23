import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function logUserAction(uid, accion, detalles = {}) {
  if (!uid) {
    console.warn('Intento de registrar accion sin UID');
    return;
  }
  try {
    await addDoc(collection(db, 'logs'), {
      uid,
      accion,
      detalles,
      fecha: Timestamp.now()
    });
  } catch (err) {
    console.error('Error al registrar accion', err);
  }
}

