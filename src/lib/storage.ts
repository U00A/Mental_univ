import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads an audio blob to Firebase Storage and returns the download URL.
 * Paths are structured as: `audio_messages/{userId}/{timestamp}.webm`
 */
export async function uploadAudio(userId: string, audioBlob: Blob): Promise<string> {
  const timestamp = Date.now();
  const storageRef = ref(storage, `audio_messages/${userId}/${timestamp}.webm`);
  
  const snapshot = await uploadBytes(storageRef, audioBlob);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

/**
 * Uploads an image file to Firebase Storage and returns the download URL.
 * Paths are structured as: `images/{userId}/{timestamp}.{extension}`
 */
export async function uploadImage(userId: string, file: File): Promise<string> {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  const storageRef = ref(storage, `images/${userId}/${timestamp}.${extension}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * Paths are structured as: `files/{userId}/{timestamp}_{filename}`
 */
export async function uploadFile(userId: string, file: File): Promise<string> {
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storageRef = ref(storage, `files/${userId}/${timestamp}_${safeFileName}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}
