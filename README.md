# Track Mo - University MOA Monitoring System

A Next.js application for tracking and managing university Memorandum of Agreements (MOAs).

## 🚀 Deployment Guide (Vercel)

Follow these steps to successfully deploy this project:

### 1. Firebase Setup
Ensure your Firebase project is ready in the [Firebase Console](https://console.firebase.google.com/):
- Enable **Authentication** (Email/Password and Google).
- Enable **Cloud Firestore**.
- Add the following to **Authentication > Settings > Authorized Domains**:
  - `localhost`
  - `your-project-name.vercel.app` (Once Vercel provides it)

### 2. Vercel Configuration
When importing your project to Vercel, add these **Environment Variables**:

| Variable | Source (Firebase Console) |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Project Settings > General |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Project Settings > General |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project Settings > General |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Project Settings > General |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Project Settings > General |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Project Settings > General |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |

### 3. Build & Deploy
- Vercel will automatically detect the Next.js project.
- The build command is `npm run build`.
- The output directory is `.next`.

## 🛠 Features
- **Role-based Access Control:** Admin, Faculty, and Student roles.
- **Onboarding:** Automated college department selection for new users.
- **Audit Logs:** Immutable tracking of all administrative actions.
- **Real-time Updates:** Powered by Firebase Firestore.
