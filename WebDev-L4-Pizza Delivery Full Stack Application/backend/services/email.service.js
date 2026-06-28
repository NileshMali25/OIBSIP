const nodemailer = require('nodemailer');

// Simple log fallback for development/local testing
const logEmailFallback = (type, email, data) => {
  console.log(`
============================================================
[EMAIL MOCK SERVICE] - FALLBACK LOG
============================================================
To: ${email}
Type: ${type}
Data: ${JSON.stringify(data, null, 2)}
============================================================
  `);
};

exports.sendWelcomeEmail = async (email, name) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    return logEmailFallback('WELCOME EMAIL', email, { name });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🍕 Welcome to Pizza Delivery!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #e63946; text-align: center;">Welcome to Pizza Delivery, ${name}!</h2>
          <p>Thank you for signing up. Your account has been successfully created and verified.</p>
          <p>You can now order delicious, fresh, hot pizzas, build your own custom pizzas, and track your orders in real time!</p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL}" style="background-color: #e63946; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Order Now</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Pizza Delivery Inc. 123 Pizzeria Blvd</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error.message);
  }
};

exports.sendOtpEmail = async (email, otp) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    return logEmailFallback('OTP VERIFICATION EMAIL', email, { otp });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🍕 Your Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #e63946; text-align: center;">Verify Your Email Address</h2>
          <p>Thank you for registering. Please use the following 6-digit One-Time Password (OTP) to complete your signup process:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e63946; padding: 10px 20px; background-color: #f8f9fa; border: 1px dashed #e63946; border-radius: 5px;">${otp}</span>
          </div>
          <p style="color: #ff4d4d; font-weight: bold;">Note: This OTP is valid for 10 minutes only.</p>
          <p>If you did not initiate this registration, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Pizza Delivery Inc. 123 Pizzeria Blvd</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP verification email:', error.message);
  }
};

exports.sendResetPasswordEmail = async (email, otp) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    return logEmailFallback('PASSWORD RESET EMAIL', email, { otp });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🍕 Password Reset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #e63946; text-align: center;">Reset Your Password</h2>
          <p>We received a request to reset your password. Please use the following 6-digit One-Time Password (OTP) to complete your password reset process:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e63946; padding: 10px 20px; background-color: #f8f9fa; border: 1px dashed #e63946; border-radius: 5px;">${otp}</span>
          </div>
          <p style="color: #ff4d4d; font-weight: bold;">Note: This OTP is valid for 10 minutes only.</p>
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Pizza Delivery Inc. 123 Pizzeria Blvd</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending reset email:', error.message);
  }
};

exports.sendOrderConfirmationEmail = async (email, order) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    return logEmailFallback('ORDER CONFIRMATION EMAIL', email, { orderId: order._id, amount: order.amount });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const itemsListHtml = order.items.map(item => {
      const pizzaName = item.pizza ? item.pizza.name : 'Custom Pizza';
      const details = item.customPizza ? 
        `(Base: ${item.customPizza.base}, Sauce: ${item.customPizza.sauce}, Cheese: ${item.customPizza.cheese}, Veggies: ${item.customPizza.vegetables.join(', ')})` : 
        '';
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${pizzaName} ${details}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `🍕 Order Confirmed! - #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #4caf50; text-align: center;">Thank You For Your Order!</h2>
          <p>We are preparing your delicious pizza. Your order ID is <strong>#${order._id}</strong>.</p>
          
          <h3 style="border-bottom: 2px solid #e63946; padding-bottom: 5px; color: #e63946;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
              <tr>
                <td colspan="2" style="padding: 10px; font-weight: bold; text-align: right;">Subtotal:</td>
                <td style="padding: 10px; text-align: right;">₹${(order.amount - order.tax - order.deliveryCharge + order.discountAmount).toFixed(2)}</td>
              </tr>
              ${order.discountAmount > 0 ? `
              <tr>
                <td colspan="2" style="padding: 10px; font-weight: bold; text-align: right; color: #e63946;">Discount (${order.couponCode}):</td>
                <td style="padding: 10px; text-align: right; color: #e63946;">-₹${order.discountAmount.toFixed(2)}</td>
              </tr>` : ''}
              <tr>
                <td colspan="2" style="padding: 10px; font-weight: bold; text-align: right;">GST (5%):</td>
                <td style="padding: 10px; text-align: right;">₹${order.tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 10px; font-weight: bold; text-align: right;">Delivery Fee:</td>
                <td style="padding: 10px; text-align: right;">₹${order.deliveryCharge.toFixed(2)}</td>
              </tr>
              <tr style="background-color: #f8f9fa; font-size: 16px; font-weight: bold;">
                <td colspan="2" style="padding: 10px; text-align: right;">Grand Total:</td>
                <td style="padding: 10px; text-align: right; color: #e63946;">₹${order.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="border-bottom: 2px solid #e63946; padding-bottom: 5px; color: #e63946; margin-top: 30px;">Delivery Address</h3>
          <p>${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.zip}</p>

          <p>You can track the progress of your order in real-time on your dashboard!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Pizza Delivery Inc. 123 Pizzeria Blvd</p>
        </div>
      `
    };

    const fs = require('fs');
    const path = require('path');
    const invoicePath = path.join(__dirname, '../uploads/invoices', `invoice_${order._id}.pdf`);
    if (fs.existsSync(invoicePath)) {
      mailOptions.attachments = [{
        filename: `invoice_${order._id}.pdf`,
        path: invoicePath
      }];
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending order confirmation email:', error.message);
  }
};

exports.sendLowStockAlertEmail = async (adminEmail, items) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    return logEmailFallback('LOW STOCK ALERT EMAIL', adminEmail, { itemsCount: items.length, items });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const itemsTableRows = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.itemName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.category}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: red; font-weight: bold;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.minimumQuantity}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: '⚠️ CRITICAL: Low Stock Inventory Alert!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #d9534f; text-align: center;">⚠️ Low Stock Level Alert</h2>
          <p>The following items in your pizza ingredients inventory have fallen below their warning thresholds:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: left;">Item Name</th>
                <th style="padding: 10px; text-align: center;">Category</th>
                <th style="padding: 10px; text-align: center;">Current Qty</th>
                <th style="padding: 10px; text-align: center;">Threshold</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableRows}
            </tbody>
          </table>
          <p>Please restock these items immediately to ensure continuous order fulfillment.</p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL}/admin/inventory" style="background-color: #d9534f; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Manage Stock</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Pizza System Automated Administrator Service</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending low stock alert email:', error.message);
  }
};
