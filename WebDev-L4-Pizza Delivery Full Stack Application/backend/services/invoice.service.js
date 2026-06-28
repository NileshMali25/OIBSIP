const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Generates a professional invoice PDF for a paid order
 * @param {Object} order - The order document from MongoDB
 * @param {Object} user - The user document who placed the order
 * @returns {Promise<string>} - The file name of the generated PDF
 */
exports.generateInvoicePDF = async (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const invoicesDir = path.join(__dirname, '../uploads/invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `invoice_${order._id}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- 1. HEADER (Invoice Info) ---
      doc
        .fillColor('#e63946')
        .fontSize(24)
        .text('🍕 Pizza Delivery Inc.', 50, 50, { align: 'left' });

      doc
        .fillColor('#333')
        .fontSize(10)
        .text('123 Pizzeria Blvd, Food Court', 200, 50, { align: 'right' })
        .text('Phone: +91 98765 43210', 200, 65, { align: 'right' })
        .text('Email: orders@pizzadelivery.com', 200, 80, { align: 'right' });

      // Draw a line
      doc
        .moveTo(50, 110)
        .lineTo(550, 110)
        .strokeColor('#ccc')
        .lineWidth(1)
        .stroke();

      // --- 2. CUSTOMER & ORDER METADATA ---
      doc
        .fillColor('#000')
        .fontSize(14)
        .text('INVOICE', 50, 130, { bold: true });

      doc
        .fontSize(10)
        .fillColor('#555')
        .text(`Invoice No: INV-${order._id.toString().substring(18).toUpperCase()}`, 50, 150)
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 165)
        .text(`Payment Status: ${order.paymentStatus}`, 50, 180);

      doc
        .fillColor('#000')
        .fontSize(11)
        .text('Bill To:', 350, 130, { bold: true });

      doc
        .fontSize(10)
        .fillColor('#555')
        .text(user.name, 350, 145)
        .text(`Phone: ${user.phone}`, 350, 160)
        .text(`${order.address.street}`, 350, 175)
        .text(`${order.address.city}, ${order.address.state} - ${order.address.zip}`, 350, 190);

      // --- 3. ITEMS TABLE HEADER ---
      const tableTop = 230;
      doc
        .fillColor('#000')
        .fontSize(10)
        .text('Item Description', 50, tableTop, { bold: true })
        .text('Quantity', 300, tableTop, { bold: true, align: 'center' })
        .text('Rate (₹)', 400, tableTop, { bold: true, align: 'right' })
        .text('Amount (₹)', 500, tableTop, { bold: true, align: 'right' });

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .strokeColor('#999')
        .lineWidth(1)
        .stroke();

      // --- 4. TABLE ROWS ---
      let y = tableTop + 25;
      
      order.items.forEach((item, index) => {
        let pizzaName = '';
        let pizzaDetails = '';
        
        if (item.pizza) {
          pizzaName = item.pizza.name;
          pizzaDetails = item.pizza.description.substring(0, 45) + '...';
        } else if (item.customPizza) {
          pizzaName = 'Custom Pizza';
          const { base, sauce, cheese, vegetables } = item.customPizza;
          pizzaDetails = `Crust: ${base}, Sauce: ${sauce}, Cheese: ${cheese}\nVeggies: ${vegetables.join(', ')}`;
        }

        // Print Main Name
        doc
          .fillColor('#000')
          .text(pizzaName, 50, y, { bold: true });
        
        // Print Details
        doc
          .fillColor('#666')
          .fontSize(9)
          .text(pizzaDetails, 50, y + 12);

        // Print Qty, Rate, Total
        doc
          .fillColor('#000')
          .fontSize(10)
          .text(item.quantity.toString(), 300, y, { align: 'center' })
          .text(item.price.toFixed(2), 400, y, { align: 'right' })
          .text((item.price * item.quantity).toFixed(2), 500, y, { align: 'right' });

        // Calculate height offset based on text length
        const detailsHeight = item.customPizza ? 25 : 15;
        y += 20 + detailsHeight;

        // Draw light divider line
        doc
          .moveTo(50, y - 5)
          .lineTo(550, y - 5)
          .strokeColor('#eee')
          .lineWidth(0.5)
          .stroke();
      });

      // --- 5. SUMMARY DETAILS ---
      y += 10;
      const subtotal = order.amount - order.tax - order.deliveryCharge + order.discountAmount;
      
      doc.text('Subtotal:', 350, y, { align: 'right' });
      doc.text(`₹${subtotal.toFixed(2)}`, 500, y, { align: 'right' });
      y += 15;

      if (order.discountAmount > 0) {
        doc.fillColor('#e63946').text(`Discount (${order.couponCode}):`, 350, y, { align: 'right' });
        doc.text(`-₹${order.discountAmount.toFixed(2)}`, 500, y, { align: 'right' });
        y += 15;
      }

      doc.fillColor('#000').text('GST (5%):', 350, y, { align: 'right' });
      doc.text(`₹${order.tax.toFixed(2)}`, 500, y, { align: 'right' });
      y += 15;

      doc.text('Delivery Fee:', 350, y, { align: 'right' });
      doc.text(`₹${order.deliveryCharge.toFixed(2)}`, 500, y, { align: 'right' });
      y += 20;

      // Draw Grand Total Box
      doc
        .rect(340, y - 5, 210, 30)
        .fill('#f8f9fa')
        .stroke('#e63946');

      doc
        .fillColor('#e63946')
        .fontSize(12)
        .text('Grand Total:', 350, y + 3, { bold: true })
        .text(`₹${order.amount.toFixed(2)}`, 500, y + 3, { bold: true, align: 'right' });

      // --- 6. FOOTER ---
      doc
        .fillColor('#555')
        .fontSize(10)
        .text('Thank you for ordering with us! We hope to serve you again soon.', 50, 700, { align: 'center', italic: true });

      doc.end();

      writeStream.on('finish', () => {
        resolve(fileName);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};
