/**
 * Email Service
 * Handles sending emails using nodemailer
 */
const nodemailer = require('nodemailer');
const logger = require('../../core/logger');
const fs = require('fs');
const path = require('path');

/**
 * Create nodemailer transporter
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

/**
 * Send email
 * @param {Object} options - Email options
 * @returns {Promise<Object>}
 */
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.FROM_EMAIL || '"Vayunex" <no-reply@vayunexsolution.com>',
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully to ${options.to}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error(`Email sending failed: ${error.message}`);
        return { success: false, error: error.message };
    }
};

/**
 * Send welcome email to new user
 * @param {Object} user - User object
 * @returns {Promise<Object>}
 */
const sendWelcomeEmail = async (user) => {
    try {
        // Load template - use absolute path from project root
        const templatePath = path.join(process.cwd(), 'src', 'services', 'email', 'templates', 'welcome.html');

        // Check if template exists
        if (!fs.existsSync(templatePath)) {
            logger.error(`Welcome email template not found at: ${templatePath}`);
            return { success: false, error: 'Email template not found' };
        }

        let template = fs.readFileSync(templatePath, 'utf-8');

        // Replace placeholders
        template = template
            .replace(/{{username}}/g, user.username)
            .replace(/{{email}}/g, user.email)
            .replace(/{{loginUrl}}/g, 'https://inv-api.vayunexsolution.com')
            .replace(/{{year}}/g, new Date().getFullYear());

        const result = await sendEmail({
            to: user.email,
            subject: 'Welcome to Vayunex Inventory System! 🎉',
            html: template
        });

        return result;
    } catch (error) {
        logger.error(`Welcome email failed: ${error.message}`);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendEmail,
    sendWelcomeEmail
};
