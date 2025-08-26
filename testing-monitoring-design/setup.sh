#!/bin/bash

echo "🚀 Setting up ICLR Backend Testing Suite..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Artillery globally
echo "🔫 Installing Artillery globally..."
npm install -g artillery

# Create results directory
mkdir -p results

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file and set your RENDER_BASE_URL"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and set your RENDER_BASE_URL"
echo "2. Run tests with: ./scripts/run-all-tests.sh"
echo "3. Or run individual tests:"
echo "   - Speed test: npm run speed-test"
echo "   - Load test: npm run load-test:render"
echo "   - Health check: ./scripts/run-all-tests.sh --health-only"
echo ""
echo "For help: ./scripts/run-all-tests.sh --help"
