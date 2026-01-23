// Send test emails to multiple recipients
require('dotenv').config();
const { sendWelcomeEmail } = require('./src/services/email/email.service');

const testEmails = [
    { email: 'ved327@gmail.com', username: 'Ved Kumar' },
    { email: 'sandeep327hr@gmail.com', username: 'Sandeep Singh' },
    { email: 'yashkr4748@gmail.com', username: 'Yash Kumar' }
];

const sendAllEmails = async () => {
    console.log('🚀 Sending welcome emails to all recipients...\n');
    
    for (const user of testEmails) {
        console.log(`📧 Sending to: ${user.email}`);
        const result = await sendWelcomeEmail(user);
        
        if (result.success) {
            console.log(`   ✅ Success! Message ID: ${result.messageId}\n`);
        } else {
            console.log(`   ❌ Failed: ${result.error}\n`);
        }
        
        // Wait 2 seconds between emails
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('✨ All emails sent!');
};

sendAllEmails().catch(console.error);
