# Deployment Guide

This guide will help you deploy the AI Invoice Generator to production.

## Architecture

- **Frontend**: React + Vite (deployed to Netlify)
- **Backend**: Flask (deployed to Render or Railway)
- **Database**: MySQL (use PlanetScale, Railway MySQL, or Render MySQL)

## Frontend Deployment (Netlify)

### Step 1: Prepare Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set production API URL:
```bash
# Create .env.production file
echo "VITE_API_URL=https://your-backend-api.com" > .env.production
```

3. Build the project:
```bash
npm run build
```

### Step 2: Deploy to Netlify

**Option A: Via Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**Option B: Via Git**
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy!

### Step 3: Configure Netlify

The `netlify.toml` file is already configured with:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirects for React Router

## Backend Deployment (Render)

### Step 1: Prepare Backend

1. Create a PostgreSQL database on Render (or use external MySQL)
2. Update `render.yaml` with your database credentials

### Step 2: Deploy to Render

**Option A: Via Render CLI**
```bash
npm install -g render-cli
render login
render deploy
```

**Option B: Via Git**
1. Push your code to GitHub
2. Connect your repository to Render
3. Select "Web Service"
4. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
   - Environment Variables:
     - `DB_HOST`: your database host
     - `DB_USER`: your database user
     - `DB_PASSWORD`: your database password
     - `DB_NAME`: your database name

### Step 3: Configure Database

For MySQL on Render:
1. Create a MySQL database in Render
2. Add the connection details as environment variables
3. The app will auto-create tables on first run

## Backend Deployment (Railway)

### Step 1: Prepare Backend

1. Create a Railway account
2. Install Railway CLI: `npm install -g @railway/cli`

### Step 2: Deploy to Railway

```bash
cd backend
railway login
railway init
railway up
```

### Step 3: Add MySQL Database

```bash
railway add mysql
```

### Step 4: Configure Environment Variables

Railway will automatically provide database credentials. Add them as environment variables:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## Database Options

### PlanetScale (Recommended for MySQL)

1. Create a free PlanetScale account
2. Create a database
3. Get connection string
4. Add credentials to your deployment platform environment variables

### Railway MySQL

Railway provides managed MySQL databases that work seamlessly with Railway deployments.

### Render MySQL

Render offers PostgreSQL by default. For MySQL, use an external service like PlanetScale.

## Environment Variables

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-api.com
```

### Backend (Environment Variables)
```
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=invoice_db
```

## Complete Deployment Workflow

1. **Deploy Backend First**
   - Deploy to Render or Railway
   - Set up MySQL database
   - Configure environment variables
   - Note the backend URL

2. **Deploy Frontend**
   - Update `.env.production` with backend URL
   - Deploy to Netlify
   - Test the connection

3. **Test Everything**
   - Create a test invoice
   - Download PDF
   - Verify QR code generation
   - Check database storage

## Troubleshooting

### CORS Issues
If you get CORS errors, ensure your backend has CORS enabled for your frontend domain.

### Database Connection
- Check database credentials in environment variables
- Ensure database is accessible from your backend
- Verify database exists and tables are created

### Build Failures
- Check Node.js version (use 18 or higher)
- Verify all dependencies are installed
- Check build logs for specific errors

### PDF Generation Issues
- Ensure ReportLab is installed on the backend
- Check file permissions for QR codes directory

## Free Tier Limits

- **Netlify**: 100GB bandwidth/month, 300 minutes build time
- **Render**: Free tier with limited resources
- **Railway**: $5 free credit/month
- **PlanetScale**: Free tier with 5GB storage

## Custom Domain

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Update DNS records

### Render/Railway
1. Go to project settings
2. Add custom domain
3. Update DNS records

## Monitoring

- **Netlify**: Built-in analytics and logs
- **Render**: Metrics and logs in dashboard
- **Railway**: Built-in monitoring and logs

## Security Best Practices

1. Never commit `.env` files
2. Use environment variables for sensitive data
3. Enable HTTPS (automatic on Netlify/Render/Railway)
4. Use strong database passwords
5. Regularly update dependencies
6. Implement rate limiting on API endpoints
