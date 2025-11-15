# Internal Reports Portal

A full-stack MERN application for managing and displaying internal reports with Google Sheets integration and Google Drive file storage.

## Features

- **Authentication**: JWT-based authentication with admin and viewer roles
- **Google Sheets Integration**: Display data from multiple Google Sheets as interactive reports with charts
- **Google Drive Storage**: Upload and manage files stored in Google Drive
- **Interactive Dashboard**: View KPIs and charts for quick insights
- **Report Management**: Six different report types with filtering, charts, and CSV export
- **File Uploads**: Upload photos/documents with automatic date tracking (yesterday by default)
- **Admin Panel**: Manage sections, subsections, users, and uploaded files
- **Responsive Design**: Built with Tailwind CSS for mobile and desktop

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- React Router
- Recharts (charts/graphs)
- React Dropzone (file uploads)
- Axios (API calls)
- Dayjs (date handling)

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- Google APIs (Sheets + Drive)
- JWT authentication
- Multer (file handling)
- bcryptjs (password hashing)

### Deployment
- GitHub (version control)
- Vercel (frontend + backend hosting)
- MongoDB Atlas (database)
- Google Cloud (Sheets & Drive APIs)

## Project Structure

```
internal-reports-portal/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── services/         # Google Sheets/Drive services
│   │   ├── models/           # MongoDB models
│   │   ├── middlewares/      # Auth & validation
│   │   ├── utils/            # Utilities
│   │   └── index.js          # Entry point
│   ├── scripts/
│   │   └── bootstrap-admin.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # React pages
│   │   ├── components/       # Reusable components
│   │   ├── api/              # API client
│   │   ├── hooks/            # Custom hooks
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (free tier)
- Google Cloud account
- GitHub account
- Vercel account (free)

### 1. Google Cloud Setup

#### Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "internal-reports")
3. Enable the following APIs:
   - Google Sheets API
   - Google Drive API

#### Create Service Account

1. Navigate to **IAM & Admin > Service Accounts**
2. Click **Create Service Account**
3. Name it (e.g., "reports-service-account")
4. Click **Create and Continue**
5. Skip granting roles (optional)
6. Click **Done**

#### Generate Service Account Key

1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key > Create New Key**
4. Select **JSON**
5. Click **Create** - a JSON file will download
6. **IMPORTANT**: Keep this file secure and never commit it to GitHub!

#### Share Google Sheets and Drive Folder

1. Open your Google Sheets documents
2. Click **Share**
3. Add the service account email (found in the JSON file as `client_email`)
4. Grant **Editor** permission
5. Create a Google Drive folder for uploads
6. Share the folder with the same service account email with **Editor** permission
7. Get the folder ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

### 2. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user (username + password)
4. Whitelist all IPs (0.0.0.0/0) for development, or specific IPs for production
5. Get your connection string (looks like `mongodb+srv://username:password@cluster.mongodb.net/`)

### 3. Local Development Setup

#### Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd internal-reports-portal

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### Configure Backend Environment

Create `backend/.env` file:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/internal-reports?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Google Service Account (paste entire JSON content as one line)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# Google Drive Folder ID
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_from_drive_url

# Google Sheets Configuration
GOOGLE_SHEETS_CONFIG={"budget_vs_achievement":{"sheetId":"1AbC123...","range":"Budget!A1:Z100"},"stock_180":{"sheetId":"1AbC123...","range":"Stock180!A1:Z200"},"ot_report":{"sheetId":"1AbC123...","range":"OT!A1:Z100"},"production_zippers":{"sheetId":"1AbC123...","range":"Zippers!A1:Z100"},"production_metal":{"sheetId":"1AbC123...","range":"Metal!A1:Z100"},"quality":{"sheetId":"1AbC123...","range":"Quality!A1:Z100"}}

# Bootstrap Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeThisStrongPassword123!

# Server
NODE_ENV=development
PORT=5000

# CORS
FRONTEND_URL=http://localhost:5173
```

**Note**: For `GOOGLE_SHEETS_CONFIG`, update the `sheetId` values with your actual Google Sheets IDs and adjust the `range` values based on your sheet structure.

#### Configure Frontend Environment

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

#### Bootstrap Admin User

```bash
cd backend
npm run bootstrap
```

This creates the initial admin user and default sections.

#### Run Development Servers

Open two terminal windows:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application at `http://localhost:5173`

Default login:
- Email: (from ADMIN_EMAIL in .env)
- Password: (from ADMIN_PASSWORD in .env)

### 4. Deployment to Vercel

#### Prepare GitHub Repository

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

**IMPORTANT**: Make sure `.env` files are in `.gitignore`!

#### Deploy Backend

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`
5. Add Environment Variables (copy from your local `.env`):
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GOOGLE_SERVICE_ACCOUNT_JSON`
   - `GOOGLE_DRIVE_FOLDER_ID`
   - `GOOGLE_SHEETS_CONFIG`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `NODE_ENV=production`
   - `FRONTEND_URL=<your-frontend-vercel-url>` (will add after frontend deployment)
6. Click **Deploy**
7. Note the deployment URL (e.g., `https://your-backend.vercel.app`)

#### Deploy Frontend

1. In Vercel Dashboard, click **Add New Project**
2. Import the same GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add Environment Variable:
   - `VITE_API_URL=https://your-backend.vercel.app/api`
5. Click **Deploy**
6. After deployment, copy the frontend URL

#### Update Backend Environment

1. Go to backend project in Vercel
2. Settings > Environment Variables
3. Update `FRONTEND_URL` with your frontend URL
4. Redeploy the backend

#### Run Bootstrap on Production

Option 1 - Via Vercel Function:
1. Create a temporary API endpoint that runs the bootstrap script
2. Call it once via browser or Postman
3. Remove the endpoint after use

Option 2 - Connect to MongoDB Atlas directly:
```bash
# Use MongoDB Compass or mongosh to create admin user manually
```

### 5. Google Sheets Configuration

Your Google Sheets should have data in the following format:

#### Budget vs Achievement Sheet
```
Month       | Budget | Achievement | Variance
----------- | ------ | ----------- | --------
January     | 100000 | 95000       | -5000
February    | 110000 | 105000      | -5000
...
```

#### Stock 180 Sheet
```
Date        | Stock Level | Days | Status
----------- | ----------- | ---- | ------
2024-01-01  | 5000        | 180  | Good
2024-01-02  | 4950        | 179  | Good
...
```

Adjust the `range` parameter in `GOOGLE_SHEETS_CONFIG` to match your actual data range.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user (admin only)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Reports
- `GET /api/reports/keys` - Get all report keys
- `GET /api/reports/:reportKey` - Get report data
- `POST /api/reports/refresh` - Refresh cached data (admin only)

### Uploads
- `POST /api/uploads` - Upload files
- `GET /api/uploads` - Get uploads (with filters)
- `GET /api/uploads/:id` - Get upload by ID
- `GET /api/uploads/:id/download` - Download file
- `DELETE /api/uploads/:id` - Delete upload (admin only)

### Sections
- `GET /api/sections` - Get all sections
- `POST /api/sections` - Create section (admin only)
- `PUT /api/sections/:id` - Update section (admin only)
- `DELETE /api/sections/:id` - Delete section (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## Usage

1. **Login**: Use admin credentials to access the portal
2. **Dashboard**: View KPIs and quick links
3. **Reports**: Navigate to specific reports via sidebar
   - Apply date filters
   - View charts and tables
   - Export to CSV
4. **Upload**: Upload photos/documents
   - Select section and subsection
   - Choose files (drag & drop supported)
   - Set date (defaults to yesterday)
5. **Admin Panel** (admin only):
   - Manage sections and subsections
   - Create/edit/delete users
   - View and delete uploaded files

## Features in Detail

### Auto-Date for Uploads
- When uploading, the "Yesterday" option automatically sets the date to `today - 1 day`
- This implements the `DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)` or `today()-1` concept

### Caching
- Report data from Google Sheets is cached for 5 minutes to reduce API calls
- Admins can manually refresh cache via the "Refresh" button

### Security
- JWT tokens with 7-day expiry
- HttpOnly cookies
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Service account credentials stored in environment variables (never in code)

## Troubleshooting

### Google Sheets Not Loading
- Verify service account has Editor access to the sheet
- Check `GOOGLE_SHEETS_CONFIG` format and sheet IDs
- Ensure Google Sheets API is enabled in Google Cloud

### File Upload Fails
- Verify service account has Editor access to the Drive folder
- Check `GOOGLE_DRIVE_FOLDER_ID` is correct
- Ensure Google Drive API is enabled
- Check file size (max 10MB)

### Authentication Issues
- Clear browser cookies and localStorage
- Check `JWT_SECRET` is set in environment variables
- Verify MongoDB connection

### Vercel Deployment Issues
- Check all environment variables are set correctly
- Ensure service account JSON is properly formatted (one line, no line breaks)
- Check Vercel logs for specific errors

## License

MIT

## Support

For issues and questions, please create an issue in the GitHub repository.
