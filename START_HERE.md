# 🚀 Start Here - Internal Reports Portal

Welcome to the Internal Reports Portal! This guide will help you get started quickly.

## 📋 What This Project Does

A complete web application that:
- Displays reports from your Google Sheets with beautiful charts
- Lets users upload photos to Google Drive with automatic organization
- Provides admin controls for managing users and content
- Works on mobile and desktop
- Deploys for FREE on Vercel

## 🎯 Choose Your Path

### 1️⃣ I Want to Run This Locally (Development)

**Time Required**: ~15 minutes

**Follow This Guide**: [QUICK_START.md](QUICK_START.md)

**What You'll Need**:
- Node.js installed
- MongoDB Atlas account (free)
- Google Cloud service account setup
- 15 minutes

### 2️⃣ I Want to Deploy to Production

**Time Required**: ~30 minutes

**Follow This Guide**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

**What You'll Need**:
- Everything from path 1️⃣
- GitHub account
- Vercel account (free)
- 30 minutes

### 3️⃣ I Want to Understand the Project

**Time Required**: ~10 minutes reading

**Read This Guide**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

**What You'll Learn**:
- Complete feature list
- Technology stack
- Architecture overview
- API endpoints

### 4️⃣ I Need Detailed Setup Instructions

**Time Required**: ~45 minutes reading + setup

**Read This Guide**: [README.md](README.md)

**What You'll Get**:
- Complete setup from scratch
- Google Cloud configuration
- MongoDB setup
- Troubleshooting tips

## 📁 Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **START_HERE.md** | You are here! Navigation guide | First time seeing the project |
| **QUICK_START.md** | Fast local setup | Want to run locally ASAP |
| **README.md** | Complete documentation | Need detailed setup help |
| **DEPLOYMENT_CHECKLIST.md** | Step-by-step deployment | Ready to deploy to Vercel |
| **PROJECT_SUMMARY.md** | Technical overview | Want to understand the project |
| **ACTUAL_SHEETS_CONFIG.md** | Your Google Sheets setup | Configuring Google Sheets |
| **postman_collection.json** | API testing | Testing API endpoints |

## 🔑 Critical Files (NEVER COMMIT TO GITHUB)

These files contain secrets and should NEVER be committed:

- `backend/.env` - Backend environment variables
- `frontend/.env` - Frontend environment variables
- Any `*service-account*.json` files - Google service account keys

These are already in `.gitignore` - keep them there!

## ⚡ Quick Commands Reference

### Development
```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Run backend (from backend folder)
npm run dev

# Run frontend (from frontend folder)
npm run dev

# Bootstrap admin user (from backend folder)
npm run bootstrap
```

### Production
```bash
# Build frontend (from frontend folder)
npm run build

# Preview production build (from frontend folder)
npm run preview
```

## 🔐 Your Credentials

### Service Account Email
```
data-pasting@data-pasting-470703.iam.gserviceaccount.com
```

Make sure to share ALL Google Sheets and your Drive folder with this email!

### Google Sheets

1. **Budget vs Achievement**
   - ID: `1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw`
   - [Open Sheet](https://docs.google.com/spreadsheets/d/1WIJOkAHouWkXVXhsa04dCvHkG6ESrqI91If7OkQbAXw/)

2. **180 Days Stock**
   - ID: `1j37Y6g3pnMWtwe2fjTe1JTT32aRLS0Z1YPjl3v657Cc`
   - [Open Sheet](https://docs.google.com/spreadsheets/d/1j37Y6g3pnMWtwe2fjTe1JTT32aRLS0Z1YPjl3v657Cc/)

3. **OT Cost**
   - ID: `1SVGTDzzEPd2q9JgU_l9NI7PQVbf3bv5bCNvR8e2Oyho`
   - [Open Sheet](https://docs.google.com/spreadsheets/d/1SVGTDzzEPd2q9JgU_l9NI7PQVbf3bv5bCNvR8e2Oyho/)

4. **Standard Item Stock**
   - ID: `1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk`
   - [Open Sheet](https://docs.google.com/spreadsheets/d/1fnOSIWQa_mbfMHdgPatjYEIhG3kQlzPy0djHG8TOszk/)

See [ACTUAL_SHEETS_CONFIG.md](ACTUAL_SHEETS_CONFIG.md) for configuration details.

## 🆘 Common Issues & Solutions

### "Google Sheets not loading"
→ Check that you shared the sheet with the service account email (Editor permission)

### "File upload fails"
→ Check that you shared the Drive folder with the service account email (Editor permission)

### "Cannot login"
→ Make sure you ran `npm run bootstrap` from the backend folder

### "MongoDB connection error"
→ Check your MONGODB_URI in the .env file and verify IP whitelist in MongoDB Atlas

### "Module not found"
→ Run `npm install` in both backend and frontend folders

## 🎓 Learning Path

If you're new to MERN stack or this project:

1. **Day 1**: Read PROJECT_SUMMARY.md → Understand what we built
2. **Day 2**: Follow QUICK_START.md → Get it running locally
3. **Day 3**: Explore the code → Understand how it works
4. **Day 4**: Follow DEPLOYMENT_CHECKLIST.md → Deploy to production
5. **Day 5**: Customize it → Make it your own!

## 📞 Need Help?

1. **Check the docs**:
   - [README.md](README.md) - Detailed setup and troubleshooting
   - [QUICK_START.md](QUICK_START.md) - Fast setup guide
   - [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Technical details

2. **Common Issues**:
   - Check `.env` files are configured correctly
   - Verify Google Sheets are shared with service account
   - Check MongoDB Atlas allows connections
   - Review Vercel logs for deployment issues

3. **Test the API**:
   - Import `postman_collection.json` into Postman
   - Test each endpoint individually
   - Check responses for error messages

## 🎉 Ready to Start?

### For Local Development
```bash
# 1. Clone/navigate to the project
cd internal-reports-portal

# 2. Follow the Quick Start guide
open QUICK_START.md
```

### For Production Deployment
```bash
# 1. Ensure local development works first
# 2. Follow the Deployment Checklist
open DEPLOYMENT_CHECKLIST.md
```

### For Understanding the Project
```bash
# Read the project summary
open PROJECT_SUMMARY.md
```

## 📊 Project Stats

- **Total Files**: ~50
- **Lines of Code**: ~5,000
- **Tech Stack**: MERN + Google APIs
- **Deployment**: Vercel (Free)
- **Database**: MongoDB Atlas (Free)
- **Storage**: Google Drive (Free)

## ✅ Next Steps

- [ ] Read QUICK_START.md
- [ ] Set up Google Cloud service account
- [ ] Create MongoDB Atlas cluster
- [ ] Configure .env files
- [ ] Run `npm run bootstrap`
- [ ] Start development servers
- [ ] Test the application
- [ ] Deploy to Vercel (when ready)

---

**Good luck! 🚀**

If you follow the guides step-by-step, you'll have this running in no time!
