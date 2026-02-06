import { createContext, useEffect, useState, type ReactNode } from 'react';
import { 
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type UserRole = 'student' | 'psychologist' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  department?: string;
  studentId?: string;
  bio?: string;
  qualifications?: string;
  yearsExperience?: number;
  isAvailable?: boolean;
  preferredLanguage: 'en' | 'fr' | 'ar';
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, displayName: string) => Promise<void>;
  signInWithGoogle: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign up with email/password
  const signUp = async (email: string, password: string, role: UserRole, displayName: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name
    await updateProfile(newUser, { displayName });

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: newUser.uid,
      email: newUser.email!,
      displayName,
      role,
      preferredLanguage: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', newUser.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setProfile(userProfile);
  };

  // Sign in with Google
  const signInWithGoogle = async (role: UserRole) => {
    const provider = new GoogleAuthProvider();
    const { user: googleUser } = await signInWithPopup(auth, provider);

    // Check if profile exists
    const profileDoc = await getDoc(doc(db, 'users', googleUser.uid));
    
    if (!profileDoc.exists()) {
      // Create new profile for Google user
      const userProfile: UserProfile = {
        uid: googleUser.uid,
        email: googleUser.email!,
        displayName: googleUser.displayName || 'User',
        photoURL: googleUser.photoURL || undefined,
        role,
        preferredLanguage: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', googleUser.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setProfile(userProfile);
    } else {
      setProfile(profileDoc.data() as UserProfile);
    }
  };

  // Sign out
  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  // Reset password
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    await setDoc(doc(db, 'users', user.uid), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    setProfile(prev => prev ? { ...prev, ...data, updatedAt: new Date() } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      resetPassword,
      updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Re-export useAuth from the separate file for convenience
export { useAuth } from './useAuth';

