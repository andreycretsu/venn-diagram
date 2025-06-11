# Cloud Autosave Setup Guide

This app supports automatic cloud saving of your canvas data using Supabase. Follow these steps to enable it:

## Option 1: Supabase (Recommended - Free Tier Available)

### Step 1: Create a Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project (free tier includes 500MB database)

### Step 2: Create the Database Table
1. In your Supabase dashboard, go to **SQL Editor**
2. Run this SQL command:

```sql
CREATE TABLE IF NOT EXISTS canvas_data (
    id text PRIMARY KEY DEFAULT 'shared-canvas',
    cards jsonb DEFAULT '[]'::jsonb,
    connections jsonb DEFAULT '[]'::jsonb,
    settings jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE canvas_data;

-- Insert initial row
INSERT INTO canvas_data (id) VALUES ('shared-canvas')
ON CONFLICT (id) DO NOTHING;

-- Create RLS policy to allow anonymous access (optional)
ALTER TABLE canvas_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access" ON canvas_data
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
```

### Step 3: Get Your API Keys
1. Go to **Settings** → **API**
2. Copy your:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - Anon/Public Key (safe to use in frontend)

### Step 4: Update Your App
1. Open `index.html`
2. Find the Supabase configuration (around line 470):

```javascript
const supabaseConfig = {
    url: 'YOUR_SUPABASE_URL',
    key: 'YOUR_ANON_KEY'
};
```

3. Replace with your actual values

## Option 2: Alternative Storage Solutions

### Netlify Functions + FaunaDB
If you're hosting on Netlify, you can use Netlify Functions with FaunaDB:
- Free tier: 100K read ops, 50K write ops per month
- Setup guide: [Netlify + FaunaDB](https://docs.netlify.com/integrations/databases/faunadb/)

### Firebase Realtime Database
- Free tier: 1GB storage, 10GB/month transfer
- Real-time sync built-in
- Setup guide: [Firebase Web Setup](https://firebase.google.com/docs/web/setup)

### Local Storage Only (Current Fallback)
If cloud storage isn't configured, the app automatically falls back to browser localStorage:
- Data persists on the same device/browser
- No sync between devices
- 5-10MB storage limit

## Features When Autosave is Enabled

✅ **Automatic Saving**: Changes save every 3 seconds
✅ **Real-time Sync**: Multiple users can collaborate
✅ **Cross-device**: Access your canvas from any device
✅ **Offline Support**: Works offline, syncs when online
✅ **Version History**: Supabase tracks all changes

## Testing Your Setup

1. Open the app in your browser
2. Check the status indicator (top-right):
   - 🟢 "Cloud autosave active" = Working!
   - 🔴 "Local storage only" = Check your config

3. Make some changes (drag cards, add connections)
4. Open the app in another browser/device
5. You should see the same canvas!

## Troubleshooting

**"Supabase connection failed"**
- Check your URL and API key
- Ensure the table was created
- Check Supabase dashboard for errors

**"Table does not exist"**
- Run the SQL command in Step 2
- Check you're in the right project

**Changes not syncing**
- Check browser console for errors
- Ensure you're online
- Try refreshing the page

## Security Notes

- The anon key is safe to expose in frontend code
- For production apps, consider adding authentication
- Enable RLS (Row Level Security) for better control
- Never expose your service_role key! 