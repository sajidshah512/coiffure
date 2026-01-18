
// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // 1. Create a transporter (using Gmail for example, but use your own SMTP)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
            // Add connection timeout and debug options
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 10000,
            debug: true, // Enable debug logging
            logger: true, // Enable logger
        });

        // 2. Verify connection before sending
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('SMTP connection verified successfully.');

        // 3. Define email options
        const mailOptions = {
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            html: options.message,
        };

        // 4. Send the email
        console.log('Sending email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);

        return info;
    } catch (error) {
        console.error('Error in sendEmail function:');
        console.error('Error code:', error.code);
        console.error('Error errno:', error.errno);
        console.error('Error syscall:', error.syscall);
        console.error('Error address:', error.address);
        console.error('Error port:', error.port);
        console.error('Full error:', error);
        throw error; // Re-throw to be handled by the caller
    }
};

module.exports = sendEmail; 