# Agri-Lifeline – Digital Farm Management Portal

An interactive farm management platform designed to monitor Maximum Residue Limits (MRL) and Antimicrobial Usage (AMU) in livestock. This system empowers farmers to maintain strict regulatory compliance using hands-free voice data logging and guarantees data integrity through an immutable sequential cryptographic ledger.

---

## 🚀 Key Engineering Accomplishments

### Hands-Free Voice Entry
Implemented an audio-processing layer utilizing the browser's native Web Speech API, optimized with a custom JavaScript Regex Fallback Parser to guarantee error-free data extraction even under unstable network conditions.

### Cryptographic Ledger Tracking
Developed a sequential SHA-256 block hashing script (`crypto-js`) that links each log payload to the signature of the previous entry, providing transparent, tamper-resistant data audit trails.

### Real-Time Compliance Alerts
Built a mathematical alert engine that tracks individual batch administration dates against specific drug withdrawal periods, visually highlighting safety restrictions dynamically.

### Relational Storage Core
Architected a modular backend using Supabase (PostgreSQL) with structured indexing, optimizing historical compliance trends and lookups.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Lucide Icons
- **Backend & Database:** Supabase (PostgreSQL)
- **Security & Encryption:** SHA-256 Hashing via `crypto-js`
- **Audio Pipeline:** Web Speech API

---

## 💻 Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/RakshithaDShastry/agri-lifeline.git
cd agri-lifeline
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env.local` file

Add the following:

```env
VITE_SUPABASE_URL=https://safdvpplqvklqfxquwaz.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key-here
```

Replace `your-publishable-key-here` with your actual Supabase **Anon/Public Key**.

### 4. Run the development server

```bash
npm run dev
```

The application should now be running locally.