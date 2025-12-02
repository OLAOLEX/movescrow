#!/bin/bash

# Movescrow Website Deployment Script
# This script helps you deploy the website to GitHub

echo "🚀 Movescrow Website Deployment"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Add all files
echo "📝 Adding files to Git..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Deploy Movescrow coming soon landing page"

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo ""
    echo "⚠️  No remote repository found!"
    echo "Please create a GitHub repository and run:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/movescrow-website.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to vercel.com and import your repository"
echo "2. Configure domain in Vercel dashboard"
echo "3. Update DNS records at your domain registrar"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions."

