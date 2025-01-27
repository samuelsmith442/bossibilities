# Deploying to Hostinger

## Pre-deployment Steps

1. Login to Hostinger control panel
2. Create a new hosting plan if you haven't already
3. Note down your hosting credentials:
   - FTP/SSH hostname
   - Username
   - Password

## Deployment Steps

1. **Connect via SSH**
   ```bash
   ssh username@your-hostname
   ```

2. **Clone the Repository**
   ```bash
   cd public_html
   git clone https://github.com/samuelsmith442/bossibilities.git
   cd bossibilities
   ```

3. **Install Dependencies**
   ```bash
   npm install
   npm install pm2 -g
   ```

4. **Set Environment Variables**
   - Copy `.env.production` to `.env`
   ```bash
   cp .env.production .env
   ```

5. **Start the Application**
   ```bash
   pm2 start pm2.config.js --env production
   pm2 save
   ```

6. **Configure Node.js App**
   - Go to Hostinger control panel
   - Navigate to "Websites" > Your Website > "Node.js"
   - Enable Node.js
   - Set the following:
     - Node.js version: 18.x
     - Application URL: your-domain.com
     - Application root: public_html/bossibilities
     - Application startup file: server.js
     - Save changes

7. **Configure Domain (Testing)**
   - Create a subdomain for testing (e.g., test.your-domain.com)
   - Point it to your Node.js application
   - Wait for DNS propagation (can take up to 24 hours)

## Testing

1. Visit your test subdomain (e.g., test.your-domain.com)
2. Test all functionality:
   - Home page loading
   - Navigation
   - eBook preview
   - Payment processing
   - PDF viewer

## Troubleshooting

1. **Check Logs**
   ```bash
   pm2 logs bossibilities
   ```

2. **Restart Application**
   ```bash
   pm2 restart bossibilities
   ```

3. **Check Node.js Status**
   ```bash
   pm2 status
   ```

## Going Live

After testing is successful:
1. Update your main domain's DNS settings
2. Point it to your Node.js application
3. Monitor the application for any issues

## Backup Plan

Keep the Render.com deployment active until the Hostinger deployment is confirmed working.
