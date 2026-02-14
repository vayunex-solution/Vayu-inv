require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Mock user
const user = {
    name: 'Yash Test',
    email: 'yashkr4748@gmail.com'
};
const resetLink = 'https://inventory.vayunexsolution.com/reset-password?token=TEST_TOKEN_123';

(async () => {
    console.log('🚀 Starting Email Test...');
    console.log('SMTP Config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        secure: process.env.SMTP_SECURE
    });

    try {
        // 1. Check Template
        const templatePath = path.join(process.cwd(), 'src', 'services', 'email', 'templates', 'reset-password.html');
        console.log(`📂 Checking template at: ${templatePath}`);
        
        if (!fs.existsSync(templatePath)) {
            console.error('❌ Template NOT FOUND!');
            return;
        }
        console.log('✅ Template found.');

        // 2. Read Template
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = template
            .replace(/{{username}}/g, user.name)
            .replace(/{{email}}/g, user.email)
            .replace(/{{resetLink}}/g, resetLink)
            .replace(/{{year}}/g, new Date().getFullYear());

        // 3. Send Email
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        console.log('📧 Sending email...');
        const info = await transporter.sendMail({
            from: process.env.FROM_EMAIL || '"Vayunex Debug" <no-reply@vayunexsolution.com>',
            to: user.email,
            subject: 'Test Reset Password Email',
            html: template
        });

        console.log('✅ Email Sent!');
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Error Sending Email:', error);
    }
})();
