# Deployment Guide: Frontend on Netlify, Backend on Render

## Frontend Deployment on Netlify

### 1. Prepare Your Frontend

Your React app is already configured with:
- `netlify.toml` - Netlify configuration
- Build script in `package.json`

### 2. Deploy to Netlify

#### Option A: Deploy via Netlify UI
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build:production`
   - Publish directory: `build`
5. Set environment variables:
   - `REACT_APP_API_URL`: Your Render backend URL
   - `REACT_APP_ENVIRONMENT`: `production`
6. Deploy!

#### Option B: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd iclr-react-web-app
netlify deploy --prod
```

### 3. Update Backend CORS
After getting your Netlify URL, update the `FRONTEND_URL` in your Render backend environment variables.

## Backend Deployment on Render

### 1. Prepare Your Backend

Your Node.js app is configured with:
- `render.yaml` - Render configuration
- Proper CORS setup in `App.js`

### 2. Deploy to Render

#### Option A: Deploy via Render UI
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: `iclr-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free (or paid if needed)

#### Option B: Deploy via render.yaml
1. Push your code with `render.yaml` to GitHub
2. In Render, create a new service from your repo
3. Render will automatically detect and use the `render.yaml` configuration

### 3. Set Environment Variables
In Render dashboard, set these environment variables:
- `DB_CONNECTION_STRING`: Your MongoDB connection string
- `FRONTEND_URL`: Your Netlify frontend URL
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will override this)

### 4. Update Frontend API URL
After getting your Render backend URL, update the frontend build command:
```bash
# In iclr-react-web-app/package.json, update the build:production script
"build:production": "REACT_APP_API_URL=https://your-actual-backend-name.onrender.com REACT_APP_ENVIRONMENT=production GENERATE_SOURCEMAP=false react-scripts build"
```

## Environment Variables Summary

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend-name.onrender.com
REACT_APP_ENVIRONMENT=production
```

### Backend (Render Environment Variables)
```
DB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/iclr_2024
FRONTEND_URL=https://your-frontend-name.netlify.app
NODE_ENV=production
PORT=10000
```

## Deployment Steps Summary

1. **Deploy Backend First**:
   - Push code to GitHub
   - Deploy on Render
   - Get backend URL

2. **Update Frontend Configuration**:
   - Update `package.json` build script with backend URL
   - Deploy on Netlify

3. **Update Backend CORS**:
   - Set `FRONTEND_URL` in Render environment variables

4. **Test**:
   - Verify frontend can communicate with backend
   - Check CORS issues are resolved

## Troubleshooting

### Common Issues:
- **CORS errors**: Ensure `FRONTEND_URL` is set correctly in backend
- **Build failures**: Check Node.js version compatibility
- **Environment variables**: Verify all required vars are set in both platforms
- **Database connection**: Ensure MongoDB connection string is correct

### Useful Commands:
```bash
# Test backend locally
cd iclr-node-server-app
npm start

# Test frontend locally
cd iclr-react-web-app
npm start

# Build frontend for production
npm run build:production
``` 