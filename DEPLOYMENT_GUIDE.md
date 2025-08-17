# Deployment Guide: Frontend and Backend on Render

## Frontend Deployment

### 1. Prepare Your Frontend

Your React app is configured with:
- Build script in `package.json`

### 2. Deploy Your Frontend

Choose your preferred hosting platform:

#### Option A: Deploy via Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Connect your GitHub repository
4. Set the root directory to `iclr-react-web-app`
5. Set build command: `npm run build:production`
6. Set output directory: `build`
7. Set environment variables:
   - `REACT_APP_API_URL`: Your Render backend URL
   - `REACT_APP_ENVIRONMENT`: `production`
8. Deploy!

#### Option B: Deploy via GitHub Pages
1. In your GitHub repository settings, enable GitHub Pages
2. Set source to GitHub Actions
3. Create a GitHub Actions workflow for building and deploying
4. Set environment variables in the workflow

#### Option C: Deploy via Render (Static Site)
1. Go to [render.com](https://render.com)
2. Create new Static Site
3. Connect your GitHub repository
4. Set root directory to `iclr-react-web-app`
5. Set build command: `npm run build:production`
6. Set publish directory: `build`

### 3. Update Backend CORS
After getting your frontend URL, update the `FRONTEND_URL` in your Render backend environment variables.

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
4. **Important**: Render will automatically detect the `render.yaml` configuration
5. The `rootDir: iclr-node-server-app` setting tells Render to:
   - Use the `iclr-node-server-app` subdirectory
   - Run `npm install` from that directory
   - Run `npm start` from that directory
6. Configure the service:
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
- `FRONTEND_URL`: Your frontend URL
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
FRONTEND_URL=https://your-frontend-url.com
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
   - Deploy on your chosen platform

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