# MindWell - El Taref University Mental Wellness Platform

A secure, confidential web application connecting students experiencing mental health challenges with licensed psychologists.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Firestore)
- **Auth**: Firebase Authentication
- **Icons**: Lucide React

## Getting Started

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it (e.g., "mindwell-platform")
4. Enable Google Analytics (optional)
5. Wait for project creation

### 2. Set Up Firebase Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider
4. Enable **Google** provider (optional)

### 3. Set Up Firestore Database

1. Go to **Build → Firestore Database**
2. Click "Create database"
3. Start in **test mode** (we'll add security rules later)
4. Choose your region (e.g., europe-west1 for Algeria)

### 4. Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Under "Your apps", click the web icon (`</>`)
3. Register with a nickname (e.g., "mindwell-web")
4. Copy the `firebaseConfig` object

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### 6. Run the Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── contexts/        # React contexts (Auth)
├── lib/             # Firebase config
├── pages/           # Page components
│   ├── auth/        # Login, Register
│   ├── Home.tsx     # Landing page
│   ├── Dashboard.tsx
│   └── Onboarding.tsx
└── index.css        # Global styles + Tailwind
```

## Features (Phase 1 - MVP)

- [x] User authentication (Email + Google)
- [x] Role selection (Student/Psychologist)
- [x] Onboarding flow
- [x] Role-based dashboards
- [ ] Psychologist profiles & listing
- [ ] Appointment booking
- [ ] Real-time messaging
- [ ] Video consultations

## Firestore Security Rules (Production)

Add these rules in **Firestore → Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Psychologists are publicly readable
    match /psychologists/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    // Appointments require authentication
    match /appointments/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Deployment

### Firebase Hosting (Free)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Vercel (Alternative)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

## License

MIT License - El Taref University
