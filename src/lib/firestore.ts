// Firestore data services for the MindWell platform
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  setDoc,
  deleteDoc,
  limit as limitQuery,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// ============ TYPES ============

export interface Psychologist {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio: string;
  qualifications: string;
  yearsExperience: number;
  specializations: string[];
  isAvailable: boolean;
  rating?: number;
  reviewCount?: number;
  title: string; // e.g. "Clinical Psychologist"
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'audio';
  duration: number; // minutes
  thumbnailUrl?: string;
  contentUrl?: string; // link to pdf or video
  createdAt: Date;
  color?: string;
}

export interface Appointment {
  id?: string;
  studentId: string;
  psychologistId: string;
  studentName: string;
  psychologistName: string;  date: Date;
  time: string;
  duration: number; // minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: 'video' | 'chat' | 'in-person';
  notes?: string;
  preSessionConcerns?: string;
  goals?: string;
  followUpNotes?: string;
  homework?: string[];
  createdAt: Date;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type ReactionType = 'like' | 'love' | 'care' | 'support' | 'sad' | 'angry';

export interface MessageReaction {
  userId: string;
  type: ReactionType;
  timestamp: Date;
}

export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  participants: string[]; // For secure server-side filtering
  content: string; // fallback text for audio/stickers
  type: 'text' | 'audio' | 'sticker' | 'image' | 'file';
  audioUrl?: string;
  duration?: string; // e.g. "0:45"
  stickerUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  imageUrl?: string;
  timestamp: Date;
  read: boolean;
  isCrisis?: boolean;
  status?: MessageStatus;
  edited?: boolean;
  editedAt?: Date;
  deleted?: boolean;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
    type: Message['type'];
  };
  reactions?: MessageReaction[];
}

export interface MoodEntry {
  id?: string;
  userId: string;
  mood: 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good';
  notes?: string;
  date: Date;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  memberCount: number;
  category: string;
}

export interface Post {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string; // Usually "Anonymous" or "Community Member"
  title: string;
  content: string;
  createdAt: Date;
  commentCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface TherapyGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  progress: number; // 0-100
  milestones: { label: string; completed: boolean }[];
  createdAt: Date;
  targetDate?: Date;
  category?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: MoodEntry['mood'];
  tags: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SymptomEntry {
  id: string;
  userId: string;
  answers: { question: string; rating: number }[];
  score: number; // Overall wellness score 0-100
  notes?: string;
  date: Date;
}

export interface MatchingPreferences {
  userId: string;
  personality: 'introvert' | 'extrovert' | 'ambivert';
  communicationStyle: 'direct' | 'empathetic' | 'balanced';
  concerns: string[]; // e.g., ['anxiety', 'depression', 'academic-stress']
  preferredGender?: 'male' | 'female' | 'no-preference';
  languagePreference?: string;
  updatedAt: Date;
}

export interface TypingStatus {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
  currentConversationId?: string;
}

export interface FavoritePsychologist {
  id: string;
  userId: string;
  psychologistId: string;
  addedAt: Date;
}

// ============ PSYCHOLOGISTS ============

export async function getPsychologists(): Promise<Psychologist[]> {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'psychologist'),
    where('isAvailable', '==', true)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  } as Psychologist));
}

export async function getPsychologistById(uid: string): Promise<Psychologist | null> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { uid: docSnap.id, ...docSnap.data() } as Psychologist;
  }
  return null;
}

export async function getUserData(uid: string) {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { uid: docSnap.id, ...docSnap.data() };
  }
  return null;
}

// ============ APPOINTMENTS ============

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'appointments'), {
    ...appointment,
    date: Timestamp.fromDate(appointment.date),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getAppointments(userId: string, role: 'student' | 'psychologist'): Promise<Appointment[]> {
  const field = role === 'student' ? 'studentId' : 'psychologistId';
  const q = query(
    collection(db, 'appointments'),
    where(field, '==', userId),
    orderBy('date', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate(),
      createdAt: data.createdAt?.toDate(),
    } as Appointment;
  });
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const docRef = doc(db, 'appointments', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      date: data.date?.toDate(),
      createdAt: data.createdAt?.toDate(),
    } as Appointment;
  }
  return null;
}

export async function updateAppointmentStatus(
  appointmentId: string, 
  status: Appointment['status']
): Promise<void> {
  const docRef = doc(db, 'appointments', appointmentId);
  await updateDoc(docRef, { status });
}

export async function cancelAppointment(appointmentId: string): Promise<void> {
  await updateAppointmentStatus(appointmentId, 'cancelled');
}

export async function updateAppointmentPrep(
  appointmentId: string,
  prep: { preSessionConcerns?: string; goals?: string }
): Promise<void> {
  const docRef = doc(db, 'appointments', appointmentId);
  await updateDoc(docRef, { ...prep });
}

export async function updateAppointmentNotes(
  appointmentId: string,
  data: { followUpNotes?: string; homework?: string[]; status?: Appointment['status'] }
): Promise<void> {
  const docRef = doc(db, 'appointments', appointmentId);
  await updateDoc(docRef, { ...data });
}

// ============ MESSAGES ============

export function subscribeToMessages(
  conversationId: string, 
  callback: (messages: Message[]) => void
) {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate(),
      } as Message;
    });
    callback(messages);
  });
}

export async function sendMessage(
  message: Omit<Message, 'id' | 'timestamp' | 'read' | 'participants' | 'status'> & { isCrisis?: boolean }
): Promise<string> {
  const participants = message.conversationId.split('_');
  const docRef = await addDoc(collection(db, 'messages'), {
    ...message,
    participants,
    timestamp: Timestamp.now(),
    read: false,
    status: 'sent',
    type: message.type || 'text',
    reactions: [],
  });
  return docRef.id;
}

export function getConversationId(userId1: string, userId2: string): string {
  // Always sort to ensure consistent conversation ID
  return [userId1, userId2].sort().join('_');
}

export async function getConversations(userId: string) {
  // Secure server-side filtering using participants array
  const q = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId),
    orderBy('timestamp', 'desc')
  );
  
  const snapshot = await getDocs(q);
  const convIds = new Set<string>();
  const lastMessages: { [key: string]: Message } = {};
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const msg = { 
      id: doc.id, 
      ...data, 
      timestamp: data.timestamp?.toDate() 
    } as Message;

    if (!convIds.has(msg.conversationId)) {
      convIds.add(msg.conversationId);
      lastMessages[msg.conversationId] = msg;
    }
  });

  return Array.from(convIds).map(id => ({
    id,
    lastMessage: lastMessages[id],
    otherUserId: id.split('_').find(uid => uid !== userId)
  }));
}

export async function wipeDemoData(): Promise<void> {
  const collectionsToClear = ['appointments', 'messages', 'moodEntries', 'resources'];
  
  for (const collName of collectionsToClear) {
    const snapshot = await getDocs(collection(db, collName));
    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, collName, d.id)));
    await Promise.all(deletePromises);
  }

  const usersSnapshot = await getDocs(collection(db, 'users'));
  for (const userDoc of usersSnapshot.docs) {
    const safetySnapshot = await getDocs(collection(db, 'users', userDoc.id, 'safetyPlan'));
    const deletePromises = safetySnapshot.docs.map(d => deleteDoc(doc(db, 'users', userDoc.id, 'safetyPlan', d.id)));
    await Promise.all(deletePromises);
  }
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  const docRef = doc(db, 'messages', messageId);
  await updateDoc(docRef, { read: true, status: 'read' });
}

export async function updateMessageStatus(messageId: string, status: MessageStatus): Promise<void> {
  const docRef = doc(db, 'messages', messageId);
  await updateDoc(docRef, { status });
}

export async function editMessage(messageId: string, newContent: string): Promise<void> {
  const docRef = doc(db, 'messages', messageId);
  await updateDoc(docRef, { 
    content: newContent, 
    edited: true, 
    editedAt: Timestamp.now() 
  });
}

export async function deleteMessage(messageId: string): Promise<void> {
  const docRef = doc(db, 'messages', messageId);
  await updateDoc(docRef, { deleted: true, content: 'This message was deleted' });
}

export async function addReaction(messageId: string, userId: string, type: ReactionType): Promise<void> {
  const docRef = doc(db, 'messages', messageId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    const reactions = data.reactions || [];
    
    // Remove existing reaction from this user
    const filteredReactions = reactions.filter((r: any) => r.userId !== userId);
    
    // Add new reaction
    filteredReactions.push({
      userId,
      type,
      timestamp: Timestamp.now()
    });
    
    await updateDoc(docRef, { reactions: filteredReactions });
  }
}

export async function removeReaction(messageId: string, userId: string): Promise<void> {
  const docRef = doc(db, 'messages', messageId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    const reactions = data.reactions || [];
    const filteredReactions = reactions.filter((r: any) => r.userId !== userId);
    await updateDoc(docRef, { reactions: filteredReactions });
  }
}

export function subscribeToTypingStatus(
  conversationId: string, 
  userId: string,
  callback: (isTyping: boolean) => void
) {
  const q = query(
    collection(db, 'typingStatus'),
    where('conversationId', '==', conversationId),
    where('userId', '!=', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const now = new Date();
    const fiveSecondsAgo = new Date(now.getTime() - 5000);
    
    const isAnyoneTyping = snapshot.docs.some(doc => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate();
      return data.isTyping && timestamp && timestamp > fiveSecondsAgo;
    });
    
    callback(isAnyoneTyping);
  });
}

export async function setTypingStatus(
  conversationId: string, 
  userId: string, 
  isTyping: boolean
): Promise<void> {
  const docId = `${conversationId}_${userId}`;
  const docRef = doc(db, 'typingStatus', docId);
  await setDoc(docRef, {
    userId,
    conversationId,
    isTyping,
    timestamp: Timestamp.now()
  });
}

export function subscribeToUserPresence(userId: string, callback: (presence: UserPresence | null) => void) {
  const docRef = doc(db, 'presence', userId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        userId,
        isOnline: data.isOnline,
        lastSeen: data.lastSeen?.toDate(),
        currentConversationId: data.currentConversationId
      });
    } else {
      callback(null);
    }
  });
}

export async function updateUserPresence(
  userId: string, 
  isOnline: boolean, 
  currentConversationId?: string
): Promise<void> {
  const docRef = doc(db, 'presence', userId);
  await setDoc(docRef, {
    userId,
    isOnline,
    lastSeen: Timestamp.now(),
    currentConversationId: currentConversationId || null
  }, { merge: true });
}

export async function getUnreadMessageCount(userId: string, conversationId: string): Promise<number> {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    where('receiverId', '==', userId),
    where('read', '==', false)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function searchMessages(conversationId: string, searchTerm: string): Promise<Message[]> {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'desc')
  );
  
  const snapshot = await getDocs(q);
  const messages = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      timestamp: data.timestamp?.toDate(),
    } as Message;
  });
  
  // Client-side filtering for search
  return messages.filter(msg => 
    msg.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !msg.deleted
  );
}

// ============ MOOD ENTRIES ============

export async function logMood(entry: Omit<MoodEntry, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'moodEntries'), {
    ...entry,
    date: Timestamp.fromDate(entry.date),
  });
  return docRef.id;
}

export async function getMoodHistory(userId: string, days: number = 30): Promise<MoodEntry[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const q = query(
    collection(db, 'moodEntries'),
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    orderBy('date', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate(),
    } as MoodEntry;
  });
}
// ============ SAFETY PLAN ============

export interface SafetyPlanContact {
  name: string;
  relation: string;
  phone: string;
}

export interface SafetyPlanData {
  warningSigns: string[];
  copingStrategies: string[];
  socialDistractions: string[];
  emergencyContacts: SafetyPlanContact[];
  professionalSupport: SafetyPlanContact[];
  environmentSafety: string[];
  lastUpdated?: Date;
}

export async function saveSafetyPlan(userId: string, plan: SafetyPlanData): Promise<void> {
  const docRef = doc(db, 'users', userId, 'safetyPlan', 'current');
  await setDoc(docRef, {
    ...plan,
    lastUpdated: Timestamp.now(),
  }, { merge: true });
}

export async function getSafetyPlan(userId: string): Promise<SafetyPlanData | null> {
  const docRef = doc(db, 'users', userId, 'safetyPlan', 'current');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      lastUpdated: data.lastUpdated?.toDate(),
    } as SafetyPlanData;
  }
  return null;
}

// ============ RESOURCES ============

export async function getResources(category: string = 'all'): Promise<Resource[]> {
  let q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
  
  if (category !== 'all') {
    q = query(q, where('category', '==', category));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
    } as Resource;
  });
}

// ============ STATS ============

export interface PlatformStats {
  studentsCount: number;
  psychologistsCount: number;
  sessionsCount: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  // In a real production app, you might use a counter document or cloud function
  // For now, we'll do an aggregation query or fetch and count
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
  
  const students = usersSnapshot.docs.filter(d => d.data().role === 'student').length;
  const psychologists = usersSnapshot.docs.filter(d => d.data().role === 'psychologist').length;
  const sessions = appointmentsSnapshot.docs.filter(d => d.data().status === 'completed').length;
  
  return {
    studentsCount: students,
    psychologistsCount: psychologists,
    sessionsCount: sessions
  };
}

// ============ COMMUNITY ============

export async function getCommunities(): Promise<Community[]> {
  const snapshot = await getDocs(collection(db, 'communities'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Community));
}

export async function getPostsByCommunity(communityId: string): Promise<Post[]> {
  const q = query(
    collection(db, 'posts'),
    where('communityId', '==', communityId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
    } as Post;
  });
}

export async function getPostById(postId: string): Promise<Post | null> {
  const docRef = doc(db, 'posts', postId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
    } as Post;
  }
  return null;
}

export async function createPost(post: Omit<Post, 'id' | 'createdAt' | 'commentCount'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'posts'), {
    ...post,
    commentCount: 0,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'comments'), {
    ...comment,
    createdAt: Timestamp.now(),
  });
  
  // Increment comment count on the post
  const postRef = doc(db, 'posts', comment.postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    await updateDoc(postRef, {
      commentCount: (postSnap.data().commentCount || 0) + 1
    });
  }
  
  return docRef.id;
}

export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  const q = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
    } as Comment;
  });
}

// ============ ANALYTICS & INSIGHTS ============

export async function getTherapyGoals(userId: string): Promise<TherapyGoal[]> {
  const q = query(
    collection(db, 'therapyGoals'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      targetDate: data.targetDate?.toDate(),
    } as TherapyGoal;
  });
}

export async function saveTherapyGoal(goal: Omit<TherapyGoal, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'therapyGoals'), {
    ...goal,
    createdAt: Timestamp.now(),
    targetDate: goal.targetDate ? Timestamp.fromDate(goal.targetDate) : null,
  });
  return docRef.id;
}

export async function updateTherapyGoal(goalId: string, updates: Partial<TherapyGoal>): Promise<void> {
  const docRef = doc(db, 'therapyGoals', goalId);
  await updateDoc(docRef, { ...updates });
}

export async function logSymptomEntry(entry: Omit<SymptomEntry, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'symptomEntries'), {
    ...entry,
    date: Timestamp.fromDate(entry.date),
  });
  return docRef.id;
}

export async function getSymptomHistory(userId: string, days: number = 30): Promise<SymptomEntry[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const q = query(
    collection(db, 'symptomEntries'),
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate(),
    } as SymptomEntry;
  });
}

// ============ COMMUNITY SEEDING ============

export async function seedCommunities(): Promise<void> {
  const communities = [
    { 
      name: 'Exam Anxiety Support', 
      description: 'A safe space to share stress and tips about upcoming finals and academic pressure.', 
      icon: 'BookOpen', 
      memberCount: 124, 
      category: 'Academic' 
    },
    { 
      name: 'ADHD Peer Group', 
      description: 'Discussing strategies, challenges, and wins while navigating university with ADHD.', 
      icon: 'Zap', 
      memberCount: 89, 
      category: 'Peer Support' 
    },
    { 
      name: 'First-Year Experience', 
      description: 'Connecting freshman students to share the transition to university life.', 
      icon: 'GraduationCap', 
      memberCount: 256, 
      category: 'Lifestyle' 
    },
    { 
      name: 'Mindfulness & Meditation', 
      description: 'Daily check-ins and shared experiences with calming practices.', 
      icon: 'Wind', 
      memberCount: 167, 
      category: 'Mental Health' 
    },
    { 
      name: 'Social Anxiety Circle', 
      description: 'Anonymous support for navigating social situations and making friends.', 
      icon: 'UserPlus', 
      memberCount: 142, 
      category: 'Peer Support' 
    }
  ];

  for (const comm of communities) {
    const q = query(collection(db, 'communities'), where('name', '==', comm.name));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      await addDoc(collection(db, 'communities'), comm);
    }
  }
}

// ============ MATCHING & FAVORITES ============

export async function saveMatchingPreferences(prefs: Omit<MatchingPreferences, 'updatedAt'>): Promise<void> {
  const docRef = doc(db, 'users', prefs.userId, 'preferences', 'matching');
  await setDoc(docRef, {
    ...prefs,
    updatedAt: Timestamp.now(),
  }, { merge: true });
}

export async function getMatchingPreferences(userId: string): Promise<MatchingPreferences | null> {
  const docRef = doc(db, 'users', userId, 'preferences', 'matching');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      updatedAt: data.updatedAt?.toDate(),
    } as MatchingPreferences;
  }
  return null;
}

export async function addFavorite(userId: string, psychologistId: string): Promise<string> {
  const docRef = await addDoc(collection(db, 'favorites'), {
    userId,
    psychologistId,
    addedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function removeFavorite(userId: string, psychologistId: string): Promise<void> {
  const q = query(
    collection(db, 'favorites'),
    where('userId', '==', userId),
    where('psychologistId', '==', psychologistId)
  );
  const snapshot = await getDocs(q);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, 'favorites', docSnap.id));
  }
}

export async function getFavorites(userId: string): Promise<FavoritePsychologist[]> {
  const q = query(
    collection(db, 'favorites'),
    where('userId', '==', userId),
    orderBy('addedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      addedAt: data.addedAt?.toDate(),
    } as FavoritePsychologist;
  });
}

export async function isFavorite(userId: string, psychologistId: string): Promise<boolean> {
  const q = query(
    collection(db, 'favorites'),
    where('userId', '==', userId),
    where('psychologistId', '==', psychologistId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function getMatchedPsychologists(userId: string): Promise<Psychologist[]> {
  const prefs = await getMatchingPreferences(userId);
  if (!prefs) return [];

  const all = await getPsychologists();

  // Weighted scoring for each psychologist
  const scored = all.map(p => {
    let score = 0;

    // Check specialization overlap with user concerns
    const concernOverlap = prefs.concerns.filter(c => 
      p.specializations.some(s => s.toLowerCase().includes(c.toLowerCase()))
    ).length;
    score += concernOverlap * 10;

    // Bonus for experience
    if (p.yearsExperience >= 5) score += 5;

    return { psychologist: p, score };
  });

  // Sort by score descending, return top matches
  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.score > 0).map(s => s.psychologist);
}

// ============ JOURNAL ============

export async function createJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'journalEntries'), {
    ...entry,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getJournalEntries(userId: string, limit?: number): Promise<JournalEntry[]> {
  let q = query(
    collection(db, 'journalEntries'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  if (limit) {
    q = query(q, limitQuery(limit));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as JournalEntry;
  });
}

export async function updateJournalEntry(entryId: string, updates: Partial<JournalEntry>): Promise<void> {
  const docRef = doc(db, 'journalEntries', entryId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  await deleteDoc(doc(db, 'journalEntries', entryId));
}

// ============ WELLNESS ============

export interface SleepEntry {
  id: string;
  userId: string;
  date: Date;
  bedTime: string;
  wakeTime: string;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  notes: string;
  createdAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  participants: string[];
  startDate: Date;
  endDate: Date;
  type: 'sleep' | 'meditation' | 'exercise';
}

export async function addSleepEntry(entry: Omit<SleepEntry, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'sleepEntries'), {
    ...entry,
    date: Timestamp.fromDate(entry.date),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getSleepEntries(userId: string, days: number = 7): Promise<SleepEntry[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const q = query(
    collection(db, 'sleepEntries'),
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    orderBy('date', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate(),
      createdAt: data.createdAt?.toDate(),
    } as SleepEntry;
  });
}

export async function getChallenges(): Promise<Challenge[]> {
  const q = query(
    collection(db, 'challenges'),
    where('endDate', '>=', Timestamp.now()),
    orderBy('endDate', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startDate: data.startDate?.toDate(),
      endDate: data.endDate?.toDate(),
    } as Challenge;
  });
}

export async function joinChallenge(challengeId: string, userId: string): Promise<void> {
  const docRef = doc(db, 'challenges', challengeId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    const participants = data.participants || [];
    
    if (!participants.includes(userId)) {
      await updateDoc(docRef, {
        participants: [...participants, userId]
      });
    }
  }
}
