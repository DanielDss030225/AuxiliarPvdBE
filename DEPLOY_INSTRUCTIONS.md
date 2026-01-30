# How to Deploy to Vercel

1. **Push to GitHub/GitLab/Bitbucket**:
   - Ensure this project is pushed to a git repository.

2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click "Add New..." -> "Project".
   - Import your repository.

3. **Configure Project**:
   - **Framework Preset**: Next.js (should be auto-detected).
   - **Root Directory**: `backend` (Important! since the Next.js app is in a subdirectory).
   - **Build Command**: `next build` (default).
   - **Output Directory**: `.next` (default).
   - **Install Command**: `npm install` (default).

4. **Deploy**:
   - Click "Deploy".
   - Vercel will build and deploy your API.

5. **Verify**:
   - Visit `https://your-project.vercel.app/api/hello` to verify the API response.
