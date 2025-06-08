# Interactive Venn Diagram Dashboard

A beautiful, interactive dashboard for categorizing companies using a three-way Venn diagram. Built with vanilla JavaScript, featuring real-time collaboration and persistent data storage.

## Features

- **Interactive Venn Diagram**: Drag and drop companies between categories
- **Geometric Controls**: Adjust circle radius and positioning with perfect alignment
- **Real-time Collaboration**: Multiple users can edit simultaneously 
- **Persistent Storage**: Data saved to Firebase Firestore with localStorage fallback
- **Responsive Design**: Works on desktop and mobile devices
- **Company Management**: Add new companies with logo URLs and portfolio status

## Categories

- **HRIS** (Human Resources Information Systems)
- **Payroll & Benefits**
- **Expense Management & Finance**

## Setup Instructions

### 1. Firebase Setup (Required for multi-user persistence)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Get your Firebase config from Project Settings
5. Update `firebase-config.js` with your credentials:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### 2. Firestore Security Rules

In Firebase Console > Firestore > Rules, set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. Deploy to Netlify

1. Push code to GitHub repository
2. Connect repository to Netlify
3. Deploy with these settings:
   - Build command: (leave empty)
   - Publish directory: `/` (root)
4. Update `firebase-config.js` with your actual Firebase credentials
5. Redeploy

## Local Development

1. Clone the repository
2. Update Firebase configuration
3. Serve with any local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
4. Open http://localhost:8000

## Usage

- **Drag Companies**: Click and drag company logos to move them between categories
- **Add Companies**: Click "+ Add Company" to add new companies
- **Adjust Circles**: Use the radius and distance sliders to resize and reposition circles
- **Perfect Alignment**: Click "Perfect Alignment" for geometrically perfect positioning
- **Portfolio Companies**: Red borders indicate portfolio companies

## Technical Details

- **Framework**: Vanilla JavaScript (no dependencies)
- **Storage**: Firebase Firestore + localStorage fallback
- **Real-time**: Firebase onSnapshot listeners
- **Responsive**: CSS Grid and Flexbox
- **Graphics**: SVG with dynamic positioning

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - Feel free to use for any purpose! 