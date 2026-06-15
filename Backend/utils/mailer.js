const nodemailer = require('nodemailer');

// Setup transporter configuration
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host: host,
      port: parseInt(port),
      secure: port === '465', // true for 465, false for other ports
      auth: {
        user: user,
        pass: pass
      }
    });
  }

  // Null object pattern / mock transporter if credentials are missing
  return {
    sendMail: async (options) => {
      console.log('--- MAIL SIMULATION (No SMTP Configured) ---');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body (HTML): \n${options.html}`);
      console.log('-------------------------------------------');
      return { messageId: 'simulated-id-' + Date.now() };
    }
  };
};

// Generic mail sender
const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Personal Finance Manager" <noreply@financemanager.com>',
    to,
    subject,
    html
  };

  return await transporter.sendMail(mailOptions);
};

// HTML Email Templates
const templates = {
  registrationSuccess: (name) => ({
    subject: 'Welcome to Personal Finance Manager!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Welcome, ${name}!</h2>
        <p>Thank you for registering on <strong>Personal Finance Manager</strong>.</p>
        <p>Take control of your money, track your expenses, build budgets, and hit your savings goals with ease!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `
  }),

  passwordReset: (resetUrl) => ({
    subject: 'Password Reset Request - Personal Finance Manager',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #dc2626; text-align: center;">Reset Your Password</h2>
        <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
        <p>To reset your password, click the button below. This link is valid for 10 minutes:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="word-break: break-all; color: #64748b; font-size: 14px;">If the button does not work, copy and paste this link in your browser: <br>${resetUrl}</p>
        <p style="color: #64748b; font-size: 12px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `
  }),

  budgetExceeded: (category, limit, spent) => ({
    subject: `🚨 Alert: Budget Limit Exceeded for ${category}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #dc2626; text-align: center;">Budget Exceeded Alert</h2>
        <p>This is to notify you that you have exceeded your monthly budget limit for <strong>${category}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f8fafc;">
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Category</th>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${category}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Monthly Limit</th>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e293b;">$${limit.toFixed(2)}</td>
          </tr>
          <tr style="background-color: #fee2e2;">
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; color: #991b1b;">Amount Spent</th>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #991b1b;">$${spent.toFixed(2)}</td>
          </tr>
        </table>
        <p>We recommend adjusting your expenses or increasing the budget limits on your dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/budgets" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Manage Budgets</a>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `
  }),

  monthlySummary: (name, month, stats) => ({
    subject: `📊 Your Financial Summary for ${month}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Monthly Financial Summary - ${month}</h2>
        <p>Hello ${name}, here is your personal financial overview for the past month:</p>
        <div style="display: flex; justify-content: space-between; margin: 20px 0; gap: 10px;">
          <div style="flex: 1; padding: 15px; background-color: #ecfdf5; border-radius: 6px; text-align: center;">
            <span style="font-size: 12px; color: #065f46; font-weight: bold;">TOTAL INCOME</span>
            <div style="font-size: 20px; color: #047857; font-weight: bold; margin-top: 5px;">$${stats.totalIncome.toFixed(2)}</div>
          </div>
          <div style="flex: 1; padding: 15px; background-color: #fef2f2; border-radius: 6px; text-align: center;">
            <span style="font-size: 12px; color: #991b1b; font-weight: bold;">TOTAL EXPENSES</span>
            <div style="font-size: 20px; color: #b91c1c; font-weight: bold; margin-top: 5px;">$${stats.totalExpense.toFixed(2)}</div>
          </div>
          <div style="flex: 1; padding: 15px; background-color: #eff6ff; border-radius: 6px; text-align: center;">
            <span style="font-size: 12px; color: #1e40af; font-weight: bold;">TOTAL SAVINGS</span>
            <div style="font-size: 20px; color: #1d4ed8; font-weight: bold; margin-top: 5px;">$${stats.totalSavings.toFixed(2)}</div>
          </div>
        </div>
        <p>Savings Rate: <strong>${stats.savingsRate.toFixed(1)}%</strong> of your income.</p>
        <p>Keep up the good work and continue managing your finances wisely!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Insights</a>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  templates
};
