const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF invoice for an order
 * @param {Object} order - The populated order object
 * @returns {Promise<string>} - The local path to the generated PDF
 */
const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const invoicesDir = path.join(__dirname, '..', '..', 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir);
      }

      const filePath = path.join(invoicesDir, `invoice_${order._id}.pdf`);
      const doc = new PDFDocument({ margin: 50 });

      doc.pipe(fs.createWriteStream(filePath));

      // Header
      doc.fontSize(20).text('ATTYER INVOICE', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(10)
         .text(`Order ID: ${order._id}`)
         .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
         .moveDown();

      // Shipping Address
      doc.text('Shipping Address:')
         .text(order.shippingAddress.name)
         .text(`${order.shippingAddress.street}`)
         .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`)
         .text(`Phone: ${order.shippingAddress.phone}`)
         .moveDown();

      // Items Table Header
      doc.text('Item', 50, 250)
         .text('Size', 250, 250)
         .text('Qty', 300, 250)
         .text('Price', 400, 250, { width: 90, align: 'right' });
      
      doc.moveTo(50, 265).lineTo(500, 265).stroke();

      let yPos = 280;
      order.orderItems.forEach(item => {
        doc.text(item.name.substring(0, 30), 50, yPos)
           .text(item.size, 250, yPos)
           .text(item.quantity.toString(), 300, yPos)
           .text(`Rs ${item.price}`, 400, yPos, { width: 90, align: 'right' });
        yPos += 20;
      });

      doc.moveTo(50, yPos + 10).lineTo(500, yPos + 10).stroke();

      // Totals
      yPos += 30;
      doc.text('Items Price:', 300, yPos).text(`Rs ${order.itemsPrice}`, 400, yPos, { width: 90, align: 'right' });
      yPos += 20;
      doc.text('Shipping:', 300, yPos).text(`Rs ${order.shippingPrice}`, 400, yPos, { width: 90, align: 'right' });
      yPos += 20;
      doc.text('GST:', 300, yPos).text(`Rs ${order.gstBreakdown.totalGst}`, 400, yPos, { width: 90, align: 'right' });
      yPos += 20;
      if (order.discountAmount > 0) {
        doc.text('Discount:', 300, yPos).text(`- Rs ${order.discountAmount}`, 400, yPos, { width: 90, align: 'right' });
        yPos += 20;
      }
      doc.fontSize(12).font('Helvetica-Bold').text('Total Price:', 300, yPos).text(`Rs ${order.totalPrice}`, 400, yPos, { width: 90, align: 'right' });

      // Footer
      doc.fontSize(10).font('Helvetica')
         .text('Thank you for shopping with ATTYER!', 50, 700, { align: 'center', width: 500 });

      doc.end();

      doc.on('end', () => {
        resolve(filePath);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateInvoice;
