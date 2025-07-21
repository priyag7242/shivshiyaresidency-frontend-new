#!/bin/bash

# 🚀 Shiv Shiva Residency - Production Deployment Script
# This script automates the deployment process for both frontend and backend

set -e  # Exit on any error

echo "🏠 Starting Shiv Shiva Residency Deployment..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed. Aborting."; exit 1; }
    command -v npm >/dev/null 2>&1 || { print_error "npm is required but not installed. Aborting."; exit 1; }
    command -v git >/dev/null 2>&1 || { print_error "git is required but not installed. Aborting."; exit 1; }
    
    print_success "All dependencies are installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Build applications
build_applications() {
    print_status "Building applications for production..."
    
    # Build backend
    print_status "Building backend..."
    cd backend
    npm run build
    cd ..
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    print_success "Applications built successfully"
}

# Test builds
test_builds() {
    print_status "Testing builds..."
    
    # Check if backend build exists
    if [ ! -d "backend/dist" ]; then
        print_error "Backend build failed - dist directory not found"
        exit 1
    fi
    
    # Check if frontend build exists
    if [ ! -d "frontend/dist" ]; then
        print_error "Frontend build failed - dist directory not found"
        exit 1
    fi
    
    print_success "Build tests passed"
}

# Environment setup
setup_environment() {
    print_status "Setting up environment files..."
    
    # Check backend .env
    if [ ! -f "backend/.env" ]; then
        print_warning "Backend .env file not found. Creating from example..."
        cp backend/.env.example backend/.env
        print_warning "Please update backend/.env with your production settings"
    fi
    
    # Check frontend .env
    if [ ! -f "frontend/.env" ]; then
        print_warning "Frontend .env file not found. Creating from example..."
        cp frontend/.env.example frontend/.env
        print_warning "Please update frontend/.env with your production settings"
    fi
    
    print_success "Environment setup complete"
}

# Git operations
prepare_git() {
    print_status "Preparing Git repository..."
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_warning "Not a git repository. Initializing..."
        git init
        git remote add origin https://github.com/priyag7242/shivshiva.git
    fi
    
    # Stage all changes
    git add .
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        print_warning "No changes to commit"
    else
        print_status "Committing changes..."
        git commit -m "Production deployment - $(date '+%Y-%m-%d %H:%M:%S')"
        print_success "Changes committed"
    fi
    
    print_success "Git repository prepared"
}

# Deployment instructions
show_deployment_instructions() {
    echo ""
    echo "🚀 Deployment Instructions"
    echo "========================="
    echo ""
    echo "Your application is now ready for deployment!"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. 🗄️  Database Setup (MongoDB Atlas):"
    echo "   • Create account at https://cloud.mongodb.com"
    echo "   • Create free cluster"
    echo "   • Get connection string"
    echo "   • Update MONGODB_URI in environment variables"
    echo ""
    echo "2. 🔧 Backend Deployment (Railway):"
    echo "   • Visit https://railway.app"
    echo "   • Connect your GitHub repository"
    echo "   • Select 'backend' folder as root"
    echo "   • Set environment variables:"
    echo "     - NODE_ENV=production"
    echo "     - PORT=5000"
    echo "     - MONGODB_URI=your-mongodb-connection-string"
    echo "     - JWT_SECRET=your-secure-secret"
    echo "     - FRONTEND_URL=https://your-app.vercel.app"
    echo ""
    echo "3. 🌐 Frontend Deployment (Vercel):"
    echo "   • Visit https://vercel.com"
    echo "   • Import your GitHub repository"
    echo "   • Set root directory to 'frontend'"
    echo "   • Set environment variables:"
    echo "     - VITE_API_BASE_URL=https://your-backend.railway.app/api"
    echo "     - VITE_NODE_ENV=production"
    echo ""
    echo "4. 🔗 Final Steps:"
    echo "   • Test your deployed application"
    echo "   • Update any hardcoded URLs"
    echo "   • Set up monitoring (optional)"
    echo ""
    echo "📚 For detailed instructions, see DEPLOYMENT.md"
    echo ""
    echo "🎉 Your Shiv Shiva Residency PG Management System is ready to go live!"
}

# Main execution
main() {
    check_dependencies
    setup_environment
    install_dependencies
    build_applications
    test_builds
    prepare_git
    show_deployment_instructions
    
    print_success "Deployment preparation complete! 🎉"
}

# Handle script interruption
trap 'print_error "Deployment interrupted!"; exit 1' INT

# Run main function
main 