# Quick Start Guide

## Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] MongoDB Atlas account created
- [ ] Google Cloud project created with Sheets & Drive APIs enabled
- [ ] Service account created and JSON key downloaded
- [ ] All Google Sheets shared with `data-pasting@data-pasting-470703.iam.gserviceaccount.com`
- [ ] Google Drive folder created and shared with service account

## Installation (5 minutes)

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend Environment

Create `backend/.env` file with these values:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/internal-reports?retryWrites=true&w=majority

# Generate a random string for JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long

# Paste your entire service account JSON (get from Google Cloud)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"data-pasting-470703",...}

# Your Google Drive folder ID (get from folder URL)
GOOGLE_DRIVE_FOLDER_ID=YOUR_DRIVE_FOLDER_ID

# Google Sheets configuration (see ACTUAL_SHEETS_CONFIG.md for your specific config)
GOOGLE_SHEETS_CONFIG={"budget_vs_achievement":{"sheetId":"1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw","range":"Sheet1!A1:Z1000"},"stock_180":{"sheetId":"1j37Y6g3pnMWtwe2fjTe1JTT32aRLS0Z1YPjl3v657Cc","range":"Sheet1!A1:Z1000"},"ot_report":{"sheetId":"1SVGTDzzEPd2q9JgU_l9NI7PQVbf3bv5bCNvR8e2Oyho","range":"Sheet1!A1:Z1000"},"production_zippers":{"sheetId":"1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk","range":"Sheet1!A1:Z500"},"production_metal":{"sheetId":"1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk","range":"Sheet2!A1:Z500"},"quality":{"sheetId":"1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk","range":"Sheet3!A1:Z500"}}

# Admin credentials for first login
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourSecurePassword123!

# Environment
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 3. Configure Frontend Environment

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Bootstrap Database

```bash
cd backend
npm run bootstrap
```

This creates the admin user and default sections.

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access the Application

Open browser: http://localhost:5173

Login with:
- Email: admin@example.com (or your ADMIN_EMAIL)
- Password: YourSecurePassword123! (or your ADMIN_PASSWORD)

## First Steps After Login

1. **Verify Google Sheets Integration**
   - Go to Dashboard
   - Check if charts are loading
   - Navigate to Reports menu and test each report

2. **Test File Upload**
   - Go to Upload page
   - Select a section/subsection
   - Upload a test image
   - Verify it appears in Admin > Uploads

3. **Create Additional Users**
   - Go to Admin > Users tab
   - Create viewer accounts for your team

4. **Customize Sections**
   - Go to Admin > Sections tab
   - Add/edit sections and subsections as needed

## Troubleshooting

### Google Sheets Not Loading
```
Error: "Failed to fetch sheet data"
```
**Fix:**
1. Verify service account email has Editor access to sheets
2. Check GOOGLE_SHEETS_CONFIG sheet IDs are correct
3. Verify sheet tab names match the range (e.g., "Sheet1!A1:Z100")

### File Upload Fails
```
Error: "Failed to upload file"
```
**Fix:**
1. Verify service account has Editor access to Drive folder
2. Check GOOGLE_DRIVE_FOLDER_ID is correct
3. Ensure Google Drive API is enabled

### Cannot Login
```
Error: "Invalid credentials"
```
**Fix:**
1. Verify you ran `npm run bootstrap`
2. Check MongoDB connection is successful
3. Use exact email/password from .env file

### Backend Won't Start
```
Error: "MongoDB connection error"
```
**Fix:**
1. Verify MONGODB_URI is correct
2. Check MongoDB Atlas allows connections from your IP
3. Verify database user credentials

## Next Steps

- **Production Deployment**: See README.md section on Vercel deployment
- **Customize Reports**: Update GOOGLE_SHEETS_CONFIG ranges to match your data
- **Add More Sheets**: Edit GOOGLE_SHEETS_CONFIG to add more reports
- **Backup**: Set up MongoDB Atlas automated backups

## Important Security Notes

- Never commit `.env` files to GitHub
- Never commit service account JSON files
- Use strong passwords for admin accounts
- Enable 2FA on MongoDB Atlas and Google Cloud
- Regularly review user access in Admin panel

## Support

For detailed setup instructions, see [README.md](README.md)

For API documentation, import [postman_collection.json](postman_collection.json) into Postman
