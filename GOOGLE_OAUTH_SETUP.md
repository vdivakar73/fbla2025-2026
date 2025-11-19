# Google OAuth Setup Instructions

To enable Google Sign-In for Charlotte-Mecklenburg Schools students, you need to set up Google OAuth credentials.

## Steps to Set Up:

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project (or select existing)
- Click "Select a project" at the top
- Click "NEW PROJECT"
- Name it: "AKHS Lost and Found"
- Click "CREATE"

### 3. Enable Google Identity Services
- In the left sidebar, go to "APIs & Services" > "Library"
- Search for "Google Identity"
- Click "Google Identity Toolkit API"
- Click "ENABLE"

### 4. Create OAuth Credentials
- Go to "APIs & Services" > "Credentials"
- Click "CREATE CREDENTIALS" > "OAuth client ID"
- If prompted, configure the OAuth consent screen:
  - Choose "External" user type
  - Fill in:
    - App name: "Ardrey Kell Lost & Found"
    - User support email: Your email
    - Developer contact: Your email
  - Click "SAVE AND CONTINUE" through the scopes and test users

### 5. Configure OAuth Client ID
- Application type: "Web application"
- Name: "AKHS Lost & Found Web Client"
- Authorized JavaScript origins:
  - `https://akhslostnfound.com`
  - `http://localhost:8080` (for testing)
- Authorized redirect URIs:
  - `https://akhslostnfound.com`
  - `https://akhslostnfound.com/login.html`
- Click "CREATE"

### 6. Copy Your Client ID
- You'll see a popup with your Client ID (looks like: `123456789-abc123def456.apps.googleusercontent.com`)
- Copy this Client ID

### 7. Update login.html
- Open `login.html`
- Find the line: `data-client_id="YOUR_GOOGLE_CLIENT_ID"`
- Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID

### 8. Test It
- Save and push changes to GitHub
- Wait for deployment
- Visit your login page
- You should see a "Sign in with Google" button
- Only @cms.k12.nc.us emails will be allowed

## Security Notes:
- The system will ONLY accept emails ending in `@cms.k12.nc.us`
- Students can sign in with their school Google accounts
- No passwords are stored for Google sign-ins
- Automatic account creation for new CMS students

## Support:
If you encounter issues, check:
1. Client ID is correct in login.html
2. Domain is authorized in Google Cloud Console
3. OAuth consent screen is configured
4. Google Identity API is enabled
