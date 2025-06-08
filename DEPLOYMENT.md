# Deployment Guide

## Quick Deploy to Netlify

### Option 1: One-Click Deploy (Easiest)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/andreycretsu/venn-diagram)

### Option 2: Manual Netlify Deploy

1. **Fork/Clone the Repository**
   ```bash
   git clone https://github.com/andreycretsu/venn-diagram.git
   cd venn-diagram
   ```

2. **Go to Netlify**
   - Visit [netlify.com](https://www.netlify.com/)
   - Sign up/login with GitHub

3. **Connect Repository**
   - Click "New site from Git"
   - Choose GitHub
   - Select your forked repository
   - Deploy settings:
     - Build command: (leave empty)
     - Publish directory: `/` (root)
   - Click "Deploy site"

4. **Get Your Site URL**
   - Netlify will provide a URL like `https://amazing-name-123456.netlify.app`
   - You can customize this in Site settings > Change site name

## Enable Multi-User Persistence (Firebase)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "venn-dashboard")
4. Disable Google Analytics (not needed)
5. Click "Create project"

### Step 2: Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select a location (choose closest to your users)

### Step 3: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Web" icon (</>)
4. Register app name (e.g., "venn-dashboard")
5. Copy the config object

### Step 4: Update Firebase Config

1. In your repository, edit `firebase-config.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id"
};
```

### Step 5: Set Firestore Security Rules

1. In Firebase Console > Firestore > Rules
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to the dashboard document
    match /dashboards/main {
      allow read, write: if true;
    }
  }
}
```

3. Click "Publish"

### Step 6: Redeploy

1. Commit and push your Firebase config changes:
   ```bash
   git add firebase-config.js
   git commit -m "Add Firebase configuration"
   git push origin main
   ```

2. Netlify will automatically redeploy

## Verification

### Test Local Storage Mode
- Visit your site
- You should see "Local Mode" in bottom-right corner
- Data saves only for that browser

### Test Firebase Mode
- After Firebase setup, you should see "Connected" in bottom-right
- Open site in multiple browsers/devices
- Changes should sync in real-time

## Custom Domain (Optional)

1. In Netlify dashboard > Domain settings
2. Click "Add custom domain"
3. Follow DNS instructions from your domain provider

## Troubleshooting

### Firebase Not Working
- Check browser console for errors
- Verify all Firebase config values are correct
- Ensure Firestore rules allow read/write
- Check if site is served over HTTPS (required for Firebase)

### Site Not Loading
- Check if all files are in repository root
- Verify netlify.toml is properly configured
- Check Netlify deploy logs for errors

### Data Not Syncing
- Ensure multiple users have "Connected" status
- Check browser network tab for Firestore requests
- Verify Firestore security rules

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your Firebase configuration
3. Ensure you're using HTTPS (required for Firebase)
4. Check Netlify deploy logs

The app will work in "Local Mode" even without Firebase, storing data in browser localStorage. 