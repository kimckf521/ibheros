---
description: Deploy the Next.js application to Vercel
---

# Deploy to Vercel

Vercel is the optimal platform for Next.js applications, offering zero-config deployments, automatic HTTPS, and global CDN.

1.  **Install Vercel CLI:**
    ```bash
    npm i -g vercel
    ```

2.  **Login to Vercel:**
    ```bash
    vercel login
    ```

3.  **Deploy:**
    Run the deploy command and follow the prompts. Use default settings for most questions.
    ```bash
    vercel
    ```

4.  **Production Deployment:**
    Once you are happy with the preview, deploy to production:
    ```bash
    vercel --prod
    ```

5.  **Environment Variables:**
    If you have environment variables (like API keys), add them in the Vercel dashboard under "Settings" > "Environment Variables".
