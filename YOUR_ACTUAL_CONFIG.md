# Your Actual Configuration Values

## ✅ Database (MongoDB Atlas)
```
MONGODB_URI=mongodb+srv://ranak_db_user:0ZLG4HwmUjUag2no@khurramsirreport.qiqwl8e.mongodb.net/?appName=KhurramSirReport
```

## ✅ Google Drive Folder
- **Folder ID**: `1LJd7e7amhWE3rQ-qLVgy3Q9F_CHjr2ff`
- **URL**: https://drive.google.com/drive/folders/1LJd7e7amhWE3rQ-qLVgy3Q9F_CHjr2ff
```
GOOGLE_DRIVE_FOLDER_ID=1LJd7e7amhWE3rQ-qLVgy3Q9F_CHjr2ff
```

## ✅ Service Account Email
```
data-pasting@data-pasting-470703.iam.gserviceaccount.com
```

## ✅ Google Sheets Configurations

### 1. Monthly Budget vs Achievement
- **Sheet ID**: `1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw`
- **URL**: https://docs.google.com/spreadsheets/d/1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw/
- **Tab Name**: `Nov- Automation`
- **Range**: `B:K50`

### 2. 180 Days Stock
- **Sheet ID**: `1j37Y6g3pnMWtwe2fjTe1JTT32aRLS0Z1YPjl3v657Cc`
- **URL**: https://docs.google.com/spreadsheets/d/1j37Y6g3pnMWtwe2fjTe1JTT32aRLS0Z1YPjl3v657Cc/
- **Tab Name**: `dashboard`
- **Range**: `B2:B24`

### 3. OT Cost
- **Sheet ID**: `1SVGTDzzEPd2q9JgU_l9NI7PQVbf3bv5bCNvR8e2Oyho`
- **URL**: https://docs.google.com/spreadsheets/d/1SVGTDzzEPd2q9JgU_l9NI7PQVbf3bv5bCNvR8e2Oyho/
- **Tab Name**: `26-Oct to 25-Nov`
- **Range**: `B5:K50`

### 4. Standard Item Stock - Metal
- **Sheet ID**: `1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk`
- **URL**: https://docs.google.com/spreadsheets/d/1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk/
- **Tab Name**: `Metal`
- **Range**: `A:H16`

### 5. Standard Item Stock - Zipper
- **Sheet ID**: `1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk`
- **URL**: https://docs.google.com/spreadsheets/d/1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk/
- **Tab Name**: `Zipper`
- **Range**: `A:H16`

---

## 📝 Setup Steps

### 1. Copy Environment File
```bash
cd backend
cp .env.production.example .env
```

### 2. Edit `.env` file and add:

```env
# MongoDB (ALREADY CORRECT)
MONGODB_URI=mongodb+srv://ranak_db_user:0ZLG4HwmUjUag2no@khurramsirreport.qiqwl8e.mongodb.net/?appName=KhurramSirReport

# JWT Secret - GENERATE A RANDOM STRING
JWT_SECRET=put_any_random_string_here_at_least_32_characters_long

# Google Service Account JSON - GET FROM GOOGLE CLOUD
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Google Drive Folder (ALREADY CORRECT)
GOOGLE_DRIVE_FOLDER_ID=1LJd7e7amhWE3rQ-qLVgy3Q9F_CHjr2ff

# NOT NEEDED ANYMORE (managed in database)
GOOGLE_SHEETS_CONFIG={}

# Admin Login
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeThisPassword123!

# Environment
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 3. Share All Sheets with Service Account

For EACH Google Sheet, click **Share** and add:
```
data-pasting@data-pasting-470703.iam.gserviceaccount.com
```
With **Editor** permission.

### 4. Share Drive Folder

Share this folder with the service account:
https://drive.google.com/drive/folders/1LJd7e7amhWE3rQ-qLVgy3Q9F_CHjr2ff

### 5. Install and Run

```bash
# Backend
cd backend
npm install
npm run bootstrap
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### 6. Login and Configure Sheets

1. Open http://localhost:5173
2. Login with admin credentials
3. Go to **Admin** → **Sheet Config** tab
4. All configurations are already set up!
5. Click "Test Connection" on each to verify

---

## 🎯 NEW FEATURE: Admin Sheet Configuration

You can now **change sheet links, tab names, and ranges** directly in the admin panel!

**Steps:**
1. Login to the app
2. Go to **Admin** → **Sheet Config** tab
3. Click **Edit** on any configuration
4. Update:
   - Google Sheet URL (ID will auto-extract)
   - Tab name
   - Range
5. Click **Test Connection** to verify
6. Click **Update**

Changes take effect immediately - no code changes needed!

---

## 🔒 What You Still Need

### Only ONE thing left to do manually:

**Get Google Service Account JSON Key**

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Select project: `data-pasting-470703`
3. Go to **IAM & Admin** → **Service Accounts**
4. Find: `data-pasting@data-pasting-470703.iam.gserviceaccount.com`
5. Click → **Keys** tab
6. **Add Key** → **Create New Key** → **JSON**
7. Download the JSON file
8. Copy entire contents and paste in `.env` as one line:
   ```
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"data-pasting-470703",...entire JSON here...}
   ```

That's it! Everything else is configured.
