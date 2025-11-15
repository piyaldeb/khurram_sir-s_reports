# Deployment Checklist for Vercel

## Pre-Deployment Checklist

### Google Cloud Setup
- [ ] Google Cloud project created
- [ ] Google Sheets API enabled
- [ ] Google Drive API enabled
- [ ] Service account created
- [ ] Service account JSON key downloaded and saved securely
- [ ] Service account email: `data-pasting@data-pasting-470703.iam.gserviceaccount.com`

### Google Sheets Sharing
- [ ] Budget vs Achievement sheet shared with service account (Editor)
- [ ] 180 Days Stock sheet shared with service account (Editor)
- [ ] OT Cost sheet shared with service account (Editor)
- [ ] Standard Item Stock sheet shared with service account (Editor)
- [ ] All other sheets shared with service account (Editor)

### Google Drive Setup
- [ ] Drive folder created for uploads
- [ ] Drive folder shared with service account (Editor)
- [ ] Drive folder ID copied from URL

### MongoDB Atlas
- [ ] Free tier cluster created
- [ ] Database user created
- [ ] Password saved securely
- [ ] IP whitelist configured (0.0.0.0/0 for testing, specific IPs for production)
- [ ] Connection string copied

### GitHub Repository
- [ ] Repository created on GitHub
- [ ] Local git initialized
- [ ] `.gitignore` file includes `.env` and service account files
- [ ] Code committed to main branch
- [ ] Code pushed to GitHub
- [ ] Verified no secrets in repository

## Vercel Backend Deployment

### Step 1: Create Project
- [ ] Logged into Vercel
- [ ] Clicked "Add New Project"
- [ ] Selected GitHub repository
- [ ] Named project: `internal-reports-backend`

### Step 2: Configure Build Settings
- [ ] Framework Preset: **Other**
- [ ] Root Directory: **backend**
- [ ] Build Command: `npm install` (or leave empty)
- [ ] Output Directory: (leave empty)
- [ ] Install Command: `npm install`

### Step 3: Add Environment Variables
Copy these from your local `backend/.env`:

- [ ] `MONGODB_URI` = `mongodb+srv://...`
- [ ] `JWT_SECRET` = `your_secret_key_here`
- [ ] `GOOGLE_SERVICE_ACCOUNT_JSON` = `{"type":"service_account",...}` (entire JSON as one line)
- [ ] `GOOGLE_DRIVE_FOLDER_ID` = `your_folder_id`
- [ ] `GOOGLE_SHEETS_CONFIG` = `{"budget_vs_achievement":{...}}` (see ACTUAL_SHEETS_CONFIG.md)
- [ ] `ADMIN_EMAIL` = `admin@example.com`
- [ ] `ADMIN_PASSWORD` = `your_secure_password`
- [ ] `NODE_ENV` = `production`
- [ ] `FRONTEND_URL` = (leave blank for now, will add after frontend deployment)

### Step 4: Deploy
- [ ] Click **Deploy**
- [ ] Wait for deployment to complete
- [ ] Copy deployment URL (e.g., `https://internal-reports-backend.vercel.app`)
- [ ] Test health endpoint: `https://your-backend.vercel.app/api/health`

## Vercel Frontend Deployment

### Step 1: Create Project
- [ ] In Vercel, click "Add New Project"
- [ ] Select same GitHub repository
- [ ] Named project: `internal-reports-frontend`

### Step 2: Configure Build Settings
- [ ] Framework Preset: **Vite**
- [ ] Root Directory: **frontend**
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### Step 3: Add Environment Variables
- [ ] `VITE_API_URL` = `https://your-backend.vercel.app/api`

### Step 4: Deploy
- [ ] Click **Deploy**
- [ ] Wait for deployment to complete
- [ ] Copy deployment URL (e.g., `https://internal-reports-frontend.vercel.app`)

## Post-Deployment Configuration

### Update Backend with Frontend URL
- [ ] Go to backend project in Vercel
- [ ] Settings > Environment Variables
- [ ] Add/Update: `FRONTEND_URL` = `https://your-frontend.vercel.app`
- [ ] Redeploy backend (Deployments > three dots > Redeploy)

### Bootstrap Production Database
Choose one method:

**Method 1: Temporary Bootstrap Endpoint (Recommended)**
- [ ] Add temporary route in backend to run bootstrap script
- [ ] Deploy backend
- [ ] Visit the endpoint once
- [ ] Remove the route
- [ ] Redeploy backend

**Method 2: MongoDB Direct Access**
- [ ] Connect to MongoDB Atlas with Compass or mongosh
- [ ] Manually create admin user with bcrypt hash
- [ ] Manually create default sections

### Test Production Deployment
- [ ] Visit frontend URL
- [ ] Login with admin credentials
- [ ] Check Dashboard loads
- [ ] Navigate to each report and verify data loads
- [ ] Test file upload
- [ ] Test all admin functions
- [ ] Test logout and login again

## Security Hardening (Production)

### MongoDB Atlas
- [ ] Remove 0.0.0.0/0 IP whitelist
- [ ] Add specific Vercel IP ranges (or keep 0.0.0.0/0 if using serverless)
- [ ] Enable MongoDB Atlas audit logs
- [ ] Set up automated backups
- [ ] Enable encryption at rest

### Vercel
- [ ] Enable password protection if needed (Vercel settings)
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Review deployment logs for errors

### Google Cloud
- [ ] Review service account permissions
- [ ] Enable audit logging
- [ ] Set up billing alerts (optional)

### Application
- [ ] Change default admin password after first login
- [ ] Create individual user accounts (don't share admin)
- [ ] Review uploaded files regularly
- [ ] Monitor API usage in Google Cloud console

## Monitoring Setup

### Vercel
- [ ] Set up deployment notifications (Slack/Email)
- [ ] Review analytics dashboard
- [ ] Check function logs regularly

### MongoDB Atlas
- [ ] Set up monitoring alerts
- [ ] Review performance metrics
- [ ] Enable slow query logging

### Google Cloud
- [ ] Review API quotas
- [ ] Set up quota alerts
- [ ] Monitor Sheets/Drive API usage

## Backup Strategy

- [ ] MongoDB Atlas automated backups enabled
- [ ] Exported service account JSON stored securely offline
- [ ] Environment variables documented securely
- [ ] Code backed up to GitHub
- [ ] Created restore procedure documentation

## Custom Domain Setup (Optional)

### If using custom domain:
- [ ] Domain purchased
- [ ] DNS configured
- [ ] Added to Vercel project
- [ ] SSL certificate auto-generated by Vercel
- [ ] Updated `FRONTEND_URL` in backend environment
- [ ] Redeployed backend

## Final Checks

- [ ] All team members can log in
- [ ] All reports display correct data
- [ ] File uploads work correctly
- [ ] Admin functions work (create users, sections, etc.)
- [ ] CSV export works
- [ ] Refresh reports function works
- [ ] Mobile responsiveness checked
- [ ] Different browsers tested (Chrome, Firefox, Safari, Edge)

## Documentation

- [ ] Shared login credentials with team (securely)
- [ ] Documented any custom configuration
- [ ] Created internal user guide (if needed)
- [ ] Saved all environment variables in secure location (password manager)

## Ongoing Maintenance

### Weekly
- [ ] Check Vercel deployment logs for errors
- [ ] Review uploaded files

### Monthly
- [ ] Review user access (remove inactive users)
- [ ] Check MongoDB Atlas usage
- [ ] Review Google API usage and costs
- [ ] Update dependencies if needed

### As Needed
- [ ] Add new report sheets to configuration
- [ ] Update Google Sheets ranges if data structure changes
- [ ] Scale MongoDB cluster if needed (upgrade from free tier)

## Rollback Plan

If something goes wrong:

1. **Immediate Rollback**
   - [ ] In Vercel, go to Deployments
   - [ ] Find last working deployment
   - [ ] Click "Promote to Production"

2. **Database Rollback**
   - [ ] Use MongoDB Atlas point-in-time restore
   - [ ] Restore to last known good state

3. **Code Rollback**
   - [ ] Revert git commit locally
   - [ ] Force push to GitHub
   - [ ] Trigger new Vercel deployment

## Support Contacts

- **Vercel Support**: https://vercel.com/support
- **MongoDB Atlas Support**: https://support.mongodb.com/
- **Google Cloud Support**: https://cloud.google.com/support

## Notes

- Vercel free tier limits: 100GB bandwidth/month, 100 hours serverless function execution
- MongoDB Atlas free tier: 512MB storage, shared CPU
- Google Sheets API: 500 requests per 100 seconds per project
- Google Drive API: 1000 requests per 100 seconds per user

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Production URLs**:
- Frontend: _____________
- Backend: _____________
