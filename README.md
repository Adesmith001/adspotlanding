# Adspot - Premium Billboard Marketplace

> Transform Lagos into your canvas

A production-ready, premium web application connecting billboard owners directly with advertisers in Nigeria. Built with React, TypeScript, Firebase, and designed following Airbnb's aesthetic excellence, Steve Jobs' minimalist philosophy, and Elon Musk's bold vision.

## 🚀 Features

### Authentication System

- ✅ Email/Password signup and login
- ✅ Google Sign-In integration
- ✅ Phone number authentication (Nigerian numbers)
- ✅ Password reset functionality
- ✅ Protected routes
- ✅ Redux state management

### Core Features (In Progress)

- 🔄 Homepage with stunning hero section
- 🔄 Geolocation-based search
- 🔄 Google Maps integration
- 🔄 Browse listings (grid + map view)
- 🔄 Detailed listing pages
- 🔄 Listing creation flow for owners
- 🔄 Owner dashboard
- 🔄 Advertiser dashboard
- 🔄 Real-time messaging
- 🔄 Booking system

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Authentication & Database**: Firebase (Auth + Firestore)
- **Maps**: Google Maps JavaScript API
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Firebase project ([Create one](https://console.firebase.google.com))
- Google Maps API key ([Get one](https://developers.google.com/maps))

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** methods:
   - Email/Password
   - Google Sign-In
   - Phone (optional)
3. Create a **Firestore Database** (start in test mode for development)
4. Get your Firebase configuration

### Step 3: Environment Variables

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Fill in your Firebase and Google Maps credentials in `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Step 4: Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 🔥 Firebase Security Rules

### Firestore Rules (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Listings collection
    match /listings/{listingId} {
      allow read: if true; // Public read
      allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }

    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.advertiserId ||
         request.auth.uid == resource.data.ownerId);
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.advertiserId ||
         request.auth.uid == resource.data.ownerId);
    }
  }
}
```

Deploy rules:

```bash
firebase deploy --only firestore:rules
```

## 📁 Project Structure

```
adspot-landing/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable components
│   │   ├── ui/            # UI components (Button, Input, Card, etc.)
│   │   ├── auth/          # Auth components (ProtectedRoute)
│   │   └── layout/        # Layout components (to be added)
│   ├── pages/             # Page components
│   │   ├── Home.tsx       # Homepage with hero section
│   │   ├── Login.tsx      # Login page
│   │   ├── Signup.tsx     # Signup page
│   │   └── ...            # More pages to come
│   ├── services/          # External services
│   │   ├── firebase.ts    # Firebase config
│   │   └── auth.service.ts # Auth service
│   ├── store/             # Redux store
│   │   ├── index.ts       # Store configuration
│   │   └── authSlice.ts   # Auth state slice
│   ├── types/             # TypeScript types
│   │   └── user.types.ts  # User types
│   ├── hooks/             # Custom hooks
│   │   └── useRedux.ts    # Typed Redux hooks
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── .env.example           # Environment variables template
├── package.json
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## 🎨 Design Philosophy

This application embodies three design philosophies:

### Airbnb - Premium & Trustworthy

- Clean, spacious layouts
- Beautiful photography
- Subtle shadows and depth
- Trust signals throughout
- Smooth user flows

### Steve Jobs - Simple & Elegant

- Extreme simplicity
- Generous white space
- Beautiful typography (Inter font)
- Intuitive navigation
- "Less but better"

### Elon Musk - Bold & Visionary

- Ambitious messaging
- Futuristic vision
- Emphasis on disruption
- Grand impact statements
- Focus on scale

## 🧪 Testing the Authentication System

### Email/Password Authentication

1. Go to `/signup`
2. Select your role (Advertiser or Billboard Owner)
3. Fill in the signup form
4. Click "Create Account"
5. You'll be redirected to the homepage logged in

### Google Sign-In

1. Click "Continue with Google" on signup or login
2. Select your Google account
3. You'll be automatically signed in

### Password Reset

1. On the login page, click "Forgot your password?"
2. Enter your email
3. Check your email for the reset link

## 🚧 What's Next

The authentication system is complete! Next phases include:

1. **Homepage Enhancement**: Add search bar, featured listings
2. **Listings Features**: Create, browse, and view billboards
3. **Google Maps Integration**: Location search and map views
4. **Dashboards**: Owner and advertiser management panels
5. **Messaging System**: Real-time chat between users
6. **Booking Flow**: Complete booking and payment system

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🌍 Nigerian Localization

- NGN currency formatting (to be implemented)
- Lagos as default location
- Nigerian phone number validation (`+234` or `0` prefix)
- Mobile-first responsive design

## 🤝 Contributing

This is a production-ready application built for Nigerian billboard marketplace. For questions or support, please create an issue in the repository.

## 📄 License

MIT License - feel free to use this project as a template for your own marketplace applications!

---

**Built with ❤️ for Nigeria's outdoor advertising industry**
