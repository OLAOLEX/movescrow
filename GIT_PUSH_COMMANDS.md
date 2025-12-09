# Git Commands to Push Changes

## If repository is already initialized:

```bash
# Navigate to project directory
cd c:\MOVESCROW

# Check current status
git status

# Add all changed files
git add .

# Or add specific files
git add sitemap.xml
git add robots.txt
git add index.html
git add vercel.json
git add SEO_FIXES.md

# Commit changes
git commit -m "Update website to use www subdomain and fix SEO issues"

- Updated all URLs to use www.movescrow.com
- Fixed sitemap.xml 404 error
- Added proper robots.txt
- Configured www redirect in vercel.json
- Enhanced SEO meta tags and structured data
- Resolved merge conflict in vercel.json"

# Push to remote repository (for private repo)
git push origin main
# OR if your default branch is master:
# git push origin master

# If you need to set upstream for first push:
# git push -u origin main
```

## If repository needs to be initialized:

```bash
# Navigate to project directory
cd c:\MOVESCROW

# Initialize git repository
git init

# Add remote repository (replace with your actual repo URL)
# For HTTPS:
git remote add origin https://github.com/username/repository-name.git
# OR for SSH:
# git remote add origin git@github.com:username/repository-name.git

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Movescrow project with SEO fixes and www subdomain"

# Push to remote (will prompt for credentials if private repo)
git push -u origin main
```

## For Private Repository Authentication:

### Option 1: HTTPS (requires username/password or token)
```bash
# You'll be prompted for credentials when pushing
git push origin main

# Or use personal access token:
# When prompted for password, paste your GitHub Personal Access Token
```

### Option 2: SSH (recommended for private repos)
```bash
# First, set up SSH key (if not already done)
# Then use SSH URL for remote:
git remote set-url origin git@github.com:username/repository-name.git
git push origin main
```

### Option 3: Credential Manager (Windows)
```bash
# Configure Git Credential Manager
git config --global credential.helper manager-core

# Then push normally - it will store credentials securely
git push origin main
```

## Check current remote:
```bash
git remote -v
```

## If you need to change remote URL:
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/username/repository-name.git
```

