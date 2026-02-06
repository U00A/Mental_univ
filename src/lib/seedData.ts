import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const initialPsychologists = [
  {
    displayName: 'Dr. Amina Mansouri',
    email: 'a.mansouri@mindwell.dz',
    role: 'psychologist',
    title: 'Senior Clinical Psychologist',
    bio: 'Specializing in Evidence-Based Psychotherapy (CBT & EMDR) with a focus on student mental health and trauma recovery.',
    qualifications: 'Doctorate in Clinical Psychology, Algiers University 2',
    yearsExperience: 12,
    specializations: ['CBT', 'EMDR', 'Anxiety Disorders', 'Academic Success'],
    isAvailable: true,
    rating: 4.9,
    reviewCount: 156,
    preferredLanguage: 'en',
    photoURL: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=256&h=256&auto=format&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    displayName: 'Dr. Reda Kellouche',
    email: 'r.kellouche@mindwell.dz',
    role: 'psychologist',
    title: 'Consultant Psychiatrist',
    bio: 'Comprehensive psychiatric evaluation and therapy, dedicated to adolescent and young adult mental health.',
    qualifications: 'Medical Doctor, Specialized in Psychiatry',
    yearsExperience: 15,
    specializations: ['Psychiatry', 'Stress Management', 'Depression'],
    isAvailable: true,
    rating: 4.8,
    reviewCount: 94,
    preferredLanguage: 'fr',
    photoURL: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=256&h=256&auto=format&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    displayName: 'Dr. Kenza Belabed',
    email: 'k.belabed@mindwell.dz',
    role: 'psychologist',
    title: 'Counseling Psychologist',
    bio: 'Focused on helping students navigate life transitions, building resilience and self-compassion.',
    qualifications: 'MSc in Counseling Psychology',
    yearsExperience: 7,
    specializations: ['Life Transitions', 'Self-Esteem', 'Relationship Counseling'],
    isAvailable: true,
    rating: 4.7,
    reviewCount: 68,
    preferredLanguage: 'ar',
    photoURL: 'https://images.unsplash.com/photo-1594824464562-0143acd63405?q=80&w=256&h=256&auto=format&fit=crop',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const initialResources = [
  {
    title: 'The Student Guide to Stress Management',
    description: 'Scientifically backed techniques to maintain mental well-being during intense academic periods.',
    category: 'stress',
    type: 'article',
    duration: 12,
    createdAt: new Date(),
  },
  {
    title: 'Mindfulness for Academic Focus',
    description: 'A 10-minute guided meditation designed to enhance concentration and reduce cognitive fatigue.',
    category: 'meditation',
    type: 'audio',
    duration: 10,
    createdAt: new Date(),
  },
  {
    title: 'Navigating Social Anxiety at University',
    description: 'Expert advice on managing social stressors and building meaningful connections in a campus environment.',
    category: 'anxiety',
    type: 'video',
    duration: 15,
    createdAt: new Date(),
  },
  {
    title: 'Building Resilience in Research',
    description: 'Specialized content for postgraduate students dealing with isolation and research-related stress.',
    category: 'overall-health',
    type: 'article',
    duration: 20,
    createdAt: new Date(),
  }
];

export async function seedDatabase() {
  console.log('Starting database seeding...');
  
  // Seed Psychologists
  // Note: For psychologists, we ideally want them to have specific UIDs if they are also auth users,
  // but for the "Listing" page, we can just add them to the 'users' collection with role 'psychologist'
  for (const psych of initialPsychologists) {
    try {
      await addDoc(collection(db, 'users'), {
        ...psych,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`Added psychologist: ${psych.displayName}`);
    } catch (e) {
      console.error('Error adding psychologist:', e);
    }
  }

  // Seed Resources
  for (const resource of initialResources) {
    try {
      await addDoc(collection(db, 'resources'), {
        ...resource,
        createdAt: serverTimestamp(),
      });
      console.log(`Added resource: ${resource.title}`);
    } catch (e) {
      console.error('Error adding resource:', e);
    }
  }

  console.log('Seeding complete!');
  return true;
}
