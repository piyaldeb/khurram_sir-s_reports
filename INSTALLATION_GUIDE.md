# Complete Installation Guide

## Prerequisites Installation

### 1. Install Node.js

**Windows:**
1. Download from https://nodejs.org/ (LTS version)
2. Run installer
3. Verify installation:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

**Mac:**
```bash
# Using Homebrew
brew install node

# Verify
node --version
npm --version
```

**Linux:**
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts

# Verify
node --version
npm --version
```

### 2. Install Git

**Windows:**
1. Download from https://git-scm.com/download/win
2. Run installer with default options

**Mac:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt-get install git  # Ubuntu/Debian
sudo yum install git      # CentOS/RHEL
```

Verify:
```bash
git --version
```

### 3. Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with Google/email
4. Create organization (any name)
5. Create project (e.g., "Internal Reports")
6. Build a Database → Free tier (M0)
7. Choose cloud provider and region (closest to you)
8. Cluster name: "Cluster0" (default)
9. Create cluster (takes ~5 minutes)

### 4. Set Up MongoDB Database

1. In MongoDB Atlas, click "Connect"
2. "Add a connection IP address" → "Allow access from anywhere" (0.0.0.0/0)
3. Create database user:
   - Username: `reportsadmin` (or your choice)
   - Password: Generate secure password and save it!
4. Choose "Connect your application"
5. Copy connection string:
   ```
   mongodb+srv://reportsadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password

### 5. Set Up Google Cloud

#### Create Project
1. Go to https://console.cloud.google.com/
2. Create new project: "internal-reports"
3. Enable billing (free tier, no charges for our usage)

#### Enable APIs
1. In Google Cloud Console, search "APIs"
2. Click "Enable APIs and Services"
3. Search and enable:
   - Google Sheets API
   - Google Drive API

#### Create Service Account
1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: "reports-service"
4. Click "Create and Continue"
5. Skip role selection → "Continue"
6. Click "Done"

#### Create Service Account Key
1. Click on the created service account
2. Go to "Keys" tab
3. "Add Key" → "Create New Key"
4. Select "JSON"
5. Click "Create"
6. **IMPORTANT**: Save this file securely! Never share or commit to Git!

The JSON file looks like:
```json
{
  "type": "service_account",
  "project_id": "data-pasting-470703",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "data-pasting@data-pasting-470703.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 6. Share Google Sheets

For EACH Google Sheet:
1. Open the Google Sheet
2. Click "Share" (top right)
3. Enter: `data-pasting@data-pasting-470703.iam.gserviceaccount.com`
4. Set permission: **Editor**
5. Uncheck "Notify people"
6. Click "Share"

Sheets to share:
- Budget vs Achievement: https://docs.google.com/spreadsheets/d/1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw/
- 180 Days Stock: https://docs.google.com/spreadsheets/d/1j37Y6g3pnMWtwe2fjTe1JTT32aRLS0Z1YPjl3v657Cc/
- OT Cost: https://docs.google.com/spreadsheets/d/1SVGTDzzEPd2q9JgU_l9NI7PQVbf3bv5bCNvR8e2Oyho/
- Standard Item Stock: https://docs.google.com/spreadsheets/d/1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk/

### 7. Create Google Drive Folder

1. Go to https://drive.google.com/
2. Click "New" → "New folder"
3. Name: "Internal Reports Uploads"
4. Right-click folder → "Share"
5. Enter: `data-pasting@data-pasting-470703.iam.gserviceaccount.com`
6. Set permission: **Editor**
7. Click "Share"
8. Open folder and copy ID from URL:
   ```
   https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz
                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                           This is your folder ID
   ```

## Project Installation

### Step 1: Download/Clone Project

If you have the project as a ZIP:
```bash
# Extract ZIP and navigate into folder
cd internal-reports-portal
```

If you're cloning from GitHub:
```bash
git clone <your-repo-url>
cd internal-reports-portal
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install all required packages (takes ~2 minutes).

Expected output:
```
added 200+ packages in 1m
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

Expected output:
```
added 300+ packages in 1m
```

### Step 4: Configure Backend

Create `backend/.env` file:

```bash
cd ../backend
# On Windows, use: type nul > .env
# On Mac/Linux, use: touch .env
```

Edit `backend/.env` and add:

```env
# MongoDB - replace with YOUR connection string
MONGODB_URI=mongodb+srv://reportsadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/internal-reports?retryWrites=true&w=majority

# JWT Secret - generate a random string
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long_random_string

# Google Service Account - paste entire JSON as ONE LINE
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"data-pasting-470703","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"data-pasting@data-pasting-470703.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# Google Drive Folder - replace with YOUR folder ID
GOOGLE_DRIVE_FOLDER_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz

# Google Sheets Config - all one line
GOOGLE_SHEETS_CONFIG={"budget_vs_achievement":{"sheetId":"1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw","range":"Sheet1!A1:Z1000"},"stock_180":{"sheetId":"1j37Y6g3pnMWtwe2fjTe1JTT32aRLS0Z1YPjl3v657Cc","range":"Sheet1!A1:Z1000"},"ot_report":{"sheetId":"1SVGTDzzEPd2q9JgU_l9NI7PQVbf3bv5bCNvR8e2Oyho","range":"Sheet1!A1:Z1000"},"production_zippers":{"sheetId":"1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk","range":"Sheet1!A1:Z500"},"production_metal":{"sheetId":"1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk","range":"Sheet2!A1:Z500"},"quality":{"sheetId":"1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk","range":"Sheet3!A1:Z500"}}

# Admin credentials for first login
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeThisStrongPassword123!

# Environment
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**Important Notes:**
- Replace `YOUR_PASSWORD` with your MongoDB password
- Replace `YOUR_FOLDER_ID` with your Drive folder ID
- Keep `GOOGLE_SERVICE_ACCOUNT_JSON` on ONE line (no line breaks)
- Update sheet ranges if your data is in different cells

### Step 5: Configure Frontend

Create `frontend/.env` file:

```bash
cd ../frontend
# On Windows: type nul > .env
# On Mac/Linux: touch .env
```

Edit `frontend/.env` and add:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 6: Bootstrap Database

Create admin user and default sections:

```bash
cd ../backend
npm run bootstrap
```

Expected output:
```
Connected to MongoDB
Admin user created successfully
Email: admin@example.com
Default sections created

Bootstrap completed successfully!
```

If you see "Admin user already exists", that's fine!

### Step 7: Start Development Servers

Open TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
[nodemon] starting `node src/index.js`
Connected to MongoDB
Server running on port 5000
Environment: development
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

### Step 8: Access Application

1. Open browser: http://localhost:5173
2. Login with:
   - Email: `admin@example.com`
   - Password: `ChangeThisStrongPassword123!`
3. You should see the dashboard!

## Verification Checklist

After installation, verify everything works:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:5173
- [ ] Can login with admin credentials
- [ ] Dashboard loads
- [ ] Reports menu shows 6 reports
- [ ] Can view at least one report (data loads from Google Sheets)
- [ ] Can navigate to Upload page
- [ ] Can navigate to Admin page
- [ ] Admin > Sections shows default sections

## Troubleshooting

### "Cannot find module" Error

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### "MongoDB connection error"

**Problem**: Cannot connect to MongoDB

**Solutions:**
1. Check MONGODB_URI is correct
2. Verify password has no special characters (URL encode if needed)
3. Check MongoDB Atlas allows connections from 0.0.0.0/0
4. Try pinging: `ping cluster0.xxxxx.mongodb.net`

### "Google Sheets API error"

**Problem**: Reports don't load

**Solutions:**
1. Verify Google Sheets API is enabled in Google Cloud
2. Check sheets are shared with service account email
3. Verify service account JSON is correct in .env
4. Check sheet IDs in GOOGLE_SHEETS_CONFIG match your sheets

### "Port already in use"

**Problem**: Port 5000 or 5173 already in use

**Solution:**
```bash
# Windows - find and kill process
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# Mac/Linux - find and kill process
lsof -i :5000
kill -9 <pid>

# Or change port in .env
PORT=5001  # For backend
```

### Frontend Shows Blank Page

**Problem**: White screen in browser

**Solutions:**
1. Check browser console for errors (F12)
2. Verify VITE_API_URL in frontend/.env
3. Check backend is running
4. Clear browser cache (Ctrl+Shift+Delete)

### Cannot Login

**Problem**: "Invalid credentials" error

**Solutions:**
1. Verify you ran `npm run bootstrap`
2. Check ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env
3. Check MongoDB connection is working
4. Try creating user manually via MongoDB Compass

## Next Steps

Once everything is working:

1. **Change Admin Password**:
   - Login to the app
   - Go to Admin > Users
   - Edit your user and change password

2. **Create Team Users**:
   - Go to Admin > Users
   - Add users for your team members
   - Use "viewer" role for regular users

3. **Customize Sections**:
   - Go to Admin > Sections
   - Add your specific sections/subsections
   - Delete defaults if not needed

4. **Test Upload**:
   - Go to Upload page
   - Select a section
   - Upload a test image
   - Verify it appears in Admin > Uploads

5. **Verify Reports**:
   - Navigate through all 6 reports
   - Check data loads correctly
   - Test date filters
   - Try CSV export

6. **Prepare for Deployment**:
   - Read DEPLOYMENT_CHECKLIST.md
   - Set up GitHub repository
   - Create Vercel account

## Development Tips

### Useful Commands

```bash
# Backend
npm run dev       # Start dev server with auto-reload
npm start         # Start production server
npm run bootstrap # Create admin user

# Frontend
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build

# Both
npm install       # Install dependencies
npm update        # Update dependencies
```

### File Watching

Both dev servers auto-reload on file changes. If they don't:
1. Save the file
2. Check terminal for errors
3. Try manual restart (Ctrl+C, then restart)

### Environment Variables

Remember to restart the server after changing .env files:
1. Stop server (Ctrl+C)
2. Start again (npm run dev)

## Getting Help

If you're stuck:

1. **Check Documentation**:
   - README.md - Complete guide
   - QUICK_START.md - Quick reference
   - TROUBLESHOOTING section above

2. **Check Logs**:
   - Backend terminal for API errors
   - Browser console (F12) for frontend errors
   - MongoDB Atlas logs
   - Google Cloud logs

3. **Common Issues**:
   - 90% of issues are .env configuration
   - Check all IDs, emails, passwords
   - Verify all services are accessible
   - Ensure permissions are set correctly

Good luck! 🚀
