# 🚀 Vayunex Inventory - Deployment Guide

## Git Repository
**Primary Remote:** https://github.com/vayunex-solution/Vayu-inv.git

## Project Structure
```
vayunex/
├── src/                    # Backend source code
├── database/               # Database scripts
├── scripts/                # Utility scripts
├── index.js                # Backend entry point
├── package.json            # Backend dependencies
├── .cpanel.yml             # cPanel auto-deployment
├── .env                    # Backend environment (DO NOT COMMIT)
└── vayunex-ui/             # Frontend (React + Vite)
    ├── src/                # Frontend source
    ├── dist/               # Production build (auto-generated)
    └── .env                # Frontend environment
```

## Deployment URLs
| Component | URL |
|-----------|-----|
| Backend API | https://inv-api.vayunexsolution.com |
| Frontend | https://inventory.vayunexsolution.com |

## cPanel Node.js App Configuration
| Setting | Value |
|---------|-------|
| Node.js version | 18.x or 20.x |
| Application mode | Production |
| Application root | inv-api.vayunexsolution.com |
| Startup file | index.js |

## Environment Variables (Backend .env)
```env
NODE_ENV=production
PORT=3002
DB_HOST=65.108.76.42
DB_PORT=3306
DB_USER=vayunexs_inventory_user
DB_PASSWORD=yash00725
DB_NAME=vayunexs_inventory_db
JWT_SECRET=vayunex_inventory_secret_key_2024_secure_token
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=mail.vayunexsolution.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@vayunexsolution.com
SMTP_PASS=yash00725
FROM_EMAIL="Vayu-Inventory <no-reply@vayunexsolution.com>"
```

## Frontend Build Commands
```bash
cd vayunex-ui
# Update .env for production
echo "VITE_API_URL=https://inv-api.vayunexsolution.com" > .env
npm run build
```

## Git Push Command
```bash
git add .
git commit -m "your message"
git push vayunex main
```

## Auto Deployment (.cpanel.yml)
When you push to git, cPanel automatically:
1. Copies backend files to `/home/vayunexs/inv-api.vayunexsolution.com/`
2. Copies frontend dist to `/home/vayunexs/inventory.vayunexsolution.com/`

## Test Accounts
- Email: yashkr4748@gmail.com
- Password: yash00725
