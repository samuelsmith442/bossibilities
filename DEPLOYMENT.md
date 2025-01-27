# Deployment Guide for Bossibilities

## Architecture Overview
- Frontend (Static files) -> Hostinger
- Backend (Node.js API) -> Render.com
- Storage (eBook) -> AWS S3

## 1. Backend Deployment (Render.com)
1. Login to Render.com
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - Name: bossibilities
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   AWS_ACCESS_KEY_ID=[Your AWS Access Key]
   AWS_SECRET_ACCESS_KEY=[Your AWS Secret Key]
   AWS_REGION=us-east-2
   AWS_BUCKET_NAME=bossibilities
   ```
6. Deploy the service
7. Note down your Render.com URL (e.g., https://bossibilities.onrender.com)

## 2. Frontend Deployment (Hostinger)
1. Login to Hostinger control panel
2. Create a new hosting plan if needed
3. Upload frontend files via FTP:
   - index.html
   - about.html
   - contact.html
   - ebook.html
   - viewer.html
   - css/
   - js/
   - images/

4. Update js/config.js with your Render.com URL:
   ```javascript
   production: {
       apiUrl: 'https://bossibilities.onrender.com' // Your Render.com URL
   }
   ```

## 3. Testing
1. Test the frontend on Hostinger subdomain
2. Verify all API calls are reaching Render.com backend
3. Test eBook preview functionality
4. Test Stripe payment integration

## 4. Domain Configuration
1. Point your domain to Hostinger's nameservers
2. Configure CORS on Render.com to allow requests from your domain
3. Update Stripe webhook URLs if needed

## 5. Going Live
1. Final testing with production domain
2. Monitor error logs
3. Test payment flow end-to-end

## Troubleshooting
- Frontend issues: Check Hostinger logs
- Backend issues: Check Render.com logs
- Storage issues: Check AWS S3 logs

## Backup
Keep development environment configured for quick rollback if needed.
