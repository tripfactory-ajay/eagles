// Eagles App — Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCJXOlSMyFlrcnQ2air1h1dbhFqLxXzOdI",
  authDomain: "orn-wiki.firebaseapp.com",
  databaseURL: "https://orn-wiki-default-rtdb.europe-west1.firebaseapp.com",
  projectId: "orn-wiki",
  storageBucket: "orn-wiki.firebasestorage.app",
  messagingSenderId: "25736842668",
  appId: "1:25736842668:web:754f9cf6268e2a5552fe09"
};

// ============================================================
// HARDCODED FAMILY ACCOUNTS
// Add each person in Firebase Auth with these emails + passwords
// Then they select their name from the login screen — no typing needed
// ============================================================
const FAMILY_ACCOUNTS = {
  "demo-raj-001": {
    email: "raj@kumar.family",
    password: "Eagles2025!",
    displayName: "Raj Kumar"
  },
  "demo-fiona-002": {
    email: "fiona@kumar.family",
    password: "Eagles2025!",
    displayName: "Fiona Kumar"
  },
  "demo-natasha-003": {
    email: "natasha@kumar.family",
    password: "Eagles2025!",
    displayName: "Natasha Kumar"
  },
  "demo-tanya-004": {
    email: "tanya@kumar.family",
    password: "Eagles2025!",
    displayName: "Tanya Kumar"
  }
};

// Fallback demo credentials (for testing)
const DEMO_CREDENTIALS = { email: "demo@eagles.app", password: "Eagles2025!" };
