#!/bin/bash

# Quick Deployment Script for ICLR Rating App
# This script helps prepare and deploy your app

echo "🚀 ICLR Rating App Deployment Script"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the root directory of your project"
    exit 1
fi

echo ""
echo "📋 Prerequisites Check:"
echo "1. Make sure your code is committed and pushed to GitHub"
echo "2. Have your MongoDB connection string ready"
echo "3. Be ready to deploy to Render"
echo ""

read -p "Are you ready to proceed? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🔧 Preparing Frontend..."
cd iclr-react-web-app

echo "✅ Frontend is ready for deployment"
echo ""

echo "🔧 Preparing Backend for Render..."
cd ../iclr-node-server-app

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found. Please create it first."
    exit 1
fi

echo "✅ Backend is ready for Render deployment"
echo ""

echo "📝 Next Steps:"
echo ""
echo "1. 🚀 DEPLOY BACKEND FIRST:"
echo "   - Go to https://render.com"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Set environment variables:"
echo "     * DB_CONNECTION_STRING (your MongoDB URL)"
echo "     * NODE_ENV=production"
echo "     * FRONTEND_URL (will set after frontend deployment)"
echo ""
echo "2. 🌐 DEPLOY FRONTEND:"
echo "   - Choose your preferred hosting platform (Vercel, GitHub Pages, etc.)"
echo "   - Connect your GitHub repo"
echo "   - Set build command: npm run build:production"
echo "   - Set publish directory: build"
echo "   - Set environment variable REACT_APP_API_URL to your Render backend URL"
echo ""
echo "3. 🔗 UPDATE CORS:"
echo "   - In Render dashboard, set FRONTEND_URL to your frontend URL"
echo ""
echo "4. ✅ TEST:"
echo "   - Verify frontend can communicate with backend"
echo "   - Check for CORS issues"
echo ""

echo "🎯 Quick Commands:"
echo "cd iclr-react-web-app && npm run build:production  # Build frontend"
echo "cd iclr-node-server-app && npm start              # Test backend locally"
echo ""

echo "📚 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo "✨ Good luck with your deployment!" 