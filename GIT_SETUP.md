# Git Setup Commands - Complete Guide

## Step-by-Step Git Commands

### 1. Navigate to Project Directory
```powershell
cd c:\MOVESCROW
```

### 2. Initialize Git Repository
```powershell
git init
```

### 3. Check Current Status
```powershell
git status
```

### 4. Add Remote Repository

**Option A: HTTPS (recommended for public repos)**
```powershell
git remote add origin https://github.com/yourusername/your-repo-name.git
```

**Option B: SSH (if you have SSH keys set up)**
```powershell
git remote add origin git@github.com:yourusername/your-repo-name.git
```

**If remote already exists and you need to change it:**
```powershell
# Check current remote
git remote -v

# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/yourusername/your-repo-name.git
```

### 5. Add All Files to Git
```powershell
git add .
```

**Or add specific files/folders:**
```powershell
git add web/
git add .gitignore
git add README.md
```

### 6. Create Initial Commit
```powershell
git commit -m "Initial commit: Movescrow project with web files moved to root"
```

**Or with a more detailed message:**
```powershell
git commit -m "Move web files to root and update SEO

- Moved all files from mobile/web to root web folder
- Updated all URLs to use www.movescrow.com
- Fixed sitemap.xml 404 error
- Added proper robots.txt
- Configured www redirect in vercel.json
- Enhanced SEO meta tags and structured data"
```

### 7. Set Default Branch (if needed)
```powershell
git branch -M main
```

**Or if your repository uses 'master':**
```powershell
git branch -M master
```

### 8. Push to GitHub

**First time push (sets upstream):**
```powershell
git push -u origin main
```

**If branch is 'master':**
```powershell
git push -u origin master
```

**Subsequent pushes:**
```powershell
git push
```

---

## Complete One-Liner Commands (Copy & Paste)

### For New Repository:
```powershell
cd c:\MOVESCROW && git init && git remote add origin https://github.com/yourusername/your-repo-name.git && git add . && git commit -m "Initial commit: Movescrow project" && git branch -M main && git push -u origin main
```

### For Existing Repository (Already Initialized):
```powershell
cd c:\MOVESCROW && git add . && git commit -m "Move web files to root and update SEO" && git push origin main
```

---

## Authentication for Public Repository

### HTTPS Authentication:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)

**To create Personal Access Token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Select scopes: `repo` (for private repos) or just `public_repo` for public repos
4. Copy token and use as password when pushing

### SSH Authentication (Alternative):
```powershell
# Check if SSH key exists
ls ~/.ssh/id_rsa.pub

# If not, generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add SSH key to GitHub
# Copy content of ~/.ssh/id_ed25519.pub and add to GitHub → Settings → SSH keys

# Change remote to SSH
git remote set-url origin git@github.com:yourusername/your-repo-name.git
```

---

## Troubleshooting

### If you get "fatal: remote origin already exists":
```powershell
git remote remove origin
git remote add origin https://github.com/yourusername/your-repo-name.git
```

### If you get "fatal: refusing to merge unrelated histories":
```powershell
git pull origin main --allow-unrelated-histories
```

### If you need to force push (use with caution):
```powershell
git push -u origin main --force
```

### Check current branch:
```powershell
git branch
```

### Switch branch:
```powershell
git checkout main
# or
git checkout -b main
```

---

## Verify Everything Worked

```powershell
# Check remote is set correctly
git remote -v

# Check branch
git branch

# Check status
git status

# View commit history
git log --oneline
```

---

## Quick Reference

```powershell
# Initialize
git init

# Add remote
git remote add origin https://github.com/USERNAME/REPO.git

# Add files
git add .

# Commit
git commit -m "Your commit message"

# Push
git push -u origin main
```

