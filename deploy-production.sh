#!/bin/bash

# 🚀 Shiv Shiva Residency - Production Deployment Script
# This script helps you deploy your PG Management System to production

set -e  # Exit on any error

echo "🏠 Shiv Shiva Residency - Production Deployment"
echo "==============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
check_dependencies() {
    print_step "Checking dependencies..."
    
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "All dependencies are installed!"
}

# Build applications
build_applications() {
    print_step "Building applications for production..."
    
    # Build backend
    print_info "Building backend..."
    cd backend
    npm run build || {
        print_error "Backend build failed!"
        exit 1
    }
    cd ..
    
    # Build frontend
    print_info "Building frontend..."
    cd frontend
    npm run build || {
        print_error "Frontend build failed!"
        exit 1
    }
    cd ..
    
    print_success "Applications built successfully!"
}

# Commit and push to GitHub
push_to_github() {
    print_step "Pushing code to GitHub..."
    
    # Add all changes
    git add .
    
    # Check if there are any changes to commit
    if git diff --staged --quiet; then
        print_info "No changes to commit"
    else
        # Commit changes
        git commit -m "🚀 Production deployment preparations

📁 Added deployment guides and scripts:
- DEPLOYMENT_SETUP.md: Complete step-by-step guide
- importCompleteData.js: MongoDB data import script
- deploy-production.sh: Automated deployment helper

🔧 Ready for production deployment:
- MongoDB Atlas configuration
- Railway backend deployment
- Vercel frontend deployment
- Complete tenant data import"
        
        # Push to GitHub
        git push origin main || {
            print_error "Failed to push to GitHub!"
            exit 1
        }
        
        print_success "Code pushed to GitHub successfully!"
    fi
}

# Display deployment URLs and next steps
show_deployment_instructions() {
    echo ""
    echo "🎉 Production Deployment Preparation Complete!"
    echo "=============================================="
    echo ""
    print_info "Your code is now ready for production deployment!"
    echo ""
    print_step "Next Steps:"
    echo ""
    echo "1. 🗄️  Set up MongoDB Atlas (Cloud Database):"
    echo "   📍 Go to: https://www.mongodb.com/atlas"
    echo "   📝 Follow the guide in DEPLOYMENT_SETUP.md"
    echo ""
    echo "2. 🚂 Deploy Backend to Railway:"
    echo "   📍 Go to: https://railway.app"
    echo "   🔗 Connect your GitHub repo: priyag7242/shivshiva"
    echo "   ⚙️  Set environment variables (see DEPLOYMENT_SETUP.md)"
    echo ""
    echo "3. ⚡ Deploy Frontend to Vercel:"
    echo "   📍 Go to: https://vercel.com"
    echo "   🔗 Connect your GitHub repo: priyag7242/shivshiva"
    echo "   📁 Set root directory to 'frontend'"
    echo ""
    echo "4. 📊 Import Your Data:"
    echo "   🔄 Use the /api/tenants/import/complete endpoint"
    echo "   💳 Generate bills with /api/payments/bills/generate"
    echo ""
    echo "5. 📱 Test Features:"
    echo "   ✅ Professional bill templates"
    echo "   ✅ Auto-fetch phone numbers"
    echo "   ✅ WhatsApp bill sharing"
    echo "   ✅ Complete PG management"
    echo ""
    print_success "Follow DEPLOYMENT_SETUP.md for detailed instructions!"
    echo ""
    print_info "GitHub Repository: https://github.com/priyag7242/shivshiva"
    print_info "Deployment Guide: ./DEPLOYMENT_SETUP.md"
    print_info "Data Import Script: ./backend/src/scripts/importCompleteData.js"
    echo ""
}

# Main execution
main() {
    check_dependencies
    build_applications
    push_to_github
    show_deployment_instructions
    
    print_success "Deployment preparation complete! 🎉"
    print_info "Open DEPLOYMENT_SETUP.md for the complete deployment guide"
}

# Handle script interruption
trap 'print_error "Deployment preparation interrupted!"; exit 1' INT

# Ask for confirmation
echo "This script will:"
echo "1. Build your applications for production"
echo "2. Commit and push changes to GitHub"
echo "3. Prepare deployment instructions"
echo ""
read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    main
else
    print_info "Deployment preparation cancelled"
    exit 0
fi 