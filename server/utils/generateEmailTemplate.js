const generateEmailTemplate = (type, data) => {
    switch (type) {
      case 'emailVerification': {
        const { verificationUrl, firstName } = data;
        return {
          subject: 'Verify Your Email Address',
          message: `
            <p>Hello ${firstName || 'User'},</p>
            <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
            <a href="${verificationUrl}" style="background-color: #007BFF; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>If the button above does not work, please copy and paste the following URL into your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>Best Regards,</p>
            <p>NEW BILLING SYSTEM</p>
          `,
        };
      }
  
      case 'resendVerification': {
        const { verificationUrl, firstName } = data;
        return {
          subject: 'Resend Email Verification',
          message: `
            <p>Hello ${firstName || 'User'},</p>
            <p>You requested to resend the email verification link. Please verify your email address by clicking the link below:</p>
            <a href="${verificationUrl}" style="background-color: #007BFF; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>If the button above does not work, please copy and paste the following URL into your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>Best Regards,</p>
            <p>NEW BILLING SYSTEM</p>
          `,
        };
      }
  
      default:
        throw new Error('Invalid email template type');
    }
  };
  
  module.exports = generateEmailTemplate;
  