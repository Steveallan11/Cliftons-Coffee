# GitHub Upload Instructions for Clifton's Coffee Shop

## 📦 Files Ready for Download

Your complete project has been packaged into:
- **cliftons-coffee-shop-github-upload.zip** (22MB)

## 🚀 How to Upload to GitHub

### Option 1: Create New Repository (Recommended)

1. **Download the ZIP file** from the workspace
2. **Extract the ZIP file** on your computer
3. **Go to GitHub.com** and sign in to your account
4. **Click the "+" button** in the top right corner
5. **Select "New repository"**
6. **Repository settings:**
   - Repository name: `cliftons-coffee-shop`
   - Description: `Coffee shop website with menu management, booking system, and admin dashboard`
   - Set to **Public** or **Private** (your choice)
   - ✅ Check "Add a README file"
   - ✅ Check "Add .gitignore" and select "Node"
7. **Click "Create repository"**

8. **Upload your files:**
   - Click "uploading an existing file" link
   - Drag and drop all the extracted files from the ZIP
   - OR click "choose your files" and select all files/folders
   - **Important:** Upload the contents of the `cliftons-coffee-shop` folder, not the folder itself

9. **Commit the files:**
   - Add commit message: "Initial commit with updated opening hours and contact info"
   - Click "Commit changes"

### Option 2: Command Line (Advanced Users)

1. **Extract the ZIP file** on your computer
2. **Open terminal/command prompt** in the extracted `cliftons-coffee-shop` folder
3. **Initialize git and add files:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit with updated opening hours and contact info"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/cliftons-coffee-shop.git
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your actual GitHub username)

## 📋 What's Included

✅ **Source Code:**
- Complete React application with TypeScript
- All components and pages
- Updated opening hours and contact information
- Admin dashboard with menu, events, and blog management
- Stripe payment integration for event tickets

✅ **Backend (Supabase):**
- Database migrations
- Edge functions for all features
- Authentication and storage setup

✅ **Configuration:**
- Package.json with all dependencies
- Tailwind CSS configuration
- TypeScript configuration
- Build scripts

✅ **Assets:**
- All menu item images
- Hero section images
- Static menu data

## ⚠️ Important Notes

1. **Environment Variables:** The `.env.example` file shows what environment variables you'll need. You'll need to set up:
   - Supabase credentials
   - Stripe API keys
   - Admin password

2. **Node Modules:** The `node_modules` folder is excluded from the ZIP (as it should be). Run `npm install` or `pnpm install` after uploading to GitHub.

3. **Build Files:** The `dist` folder is also excluded. GitHub Pages or Vercel will build your project automatically.

## 🌐 Deployment Options After GitHub Upload

- **Vercel:** Connect your GitHub repo to Vercel for automatic deployments
- **Netlify:** Connect your GitHub repo to Netlify
- **GitHub Pages:** Enable GitHub Pages in your repository settings

## 📞 Updated Information Included

✅ Opening Hours:
- Monday-Tuesday: CLOSED
- Wednesday-Friday: 8:30 AM - 4:30 PM  
- Saturday-Sunday: 8:00 AM - 4:00 PM

✅ Contact Information:
- Phone & WhatsApp: 07361 258652

---

**Need Help?** If you run into any issues with the GitHub upload process, feel free to ask for assistance!