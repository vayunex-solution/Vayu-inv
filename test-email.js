// Test email sending
require('dotenv').config();
const { sendWelcomeEmail } = require('./src/services/email/email.service');

const testEmail = async () => {
    console.log('Testing email service...');
    console.log('SMTP Config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        secure: process.env.SMTP_SECURE
    });

    const result = await sendWelcomeEmail({
        email: 'yashyr0725@gmail.com',
        username: 'Test User'
    });

    console.log('Email result:', result);
};

testEmail().catch(console.error);
