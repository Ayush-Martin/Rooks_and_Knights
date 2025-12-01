import pdfkit from "pdfkit";
import crypto from "crypto";

export const generateInvoice = (req, res, order) => {
  const date = new Date();
  const doc = new pdfkit();
  const invoiceNumber = crypto.randomInt(1000, 9999);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice_${invoiceNumber}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(18).text("Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`);
  doc.text(`Date: ${date.toLocaleDateString()}`);
  doc.moveDown();

  doc.fontSize(14).text("Billing Information", { underline: true });
  doc.fontSize(12).text(`Name: ${order.userID.username}`);
  doc.text(
    `Address: ${order.address.addressTitle}, ${order.address.state}, ${order.address.city}, ${order.address.streetAddress}, ${order.address.pinCode}`
  );
  doc.moveDown();

  doc.fontSize(14).text("Seller Information", { underline: true });
  doc.fontSize(12).text(`Business Name: Rooks & Knights`);
  doc.text(`Email: ayushmartin06@gmail.com`);
  doc.moveDown();

  const columnWidths = {
    productName: 120,
    unitPrice: 80,
    quantity: 60,
    discount: 80,
    finalPrice: 100,
  };

  const tableTop = doc.y; // Start the table at the current y position
  const rowHeight = 20;
  let y = tableTop;

  function drawTableHeader() {
    doc
      .fontSize(10)
      .text("Product Name", 50, y, { width: columnWidths.productName });
    doc.text("Unit Price", 200, y, {
      width: columnWidths.unitPrice,
      align: "center",
    });
    doc.text("Quantity", 300, y, {
      width: columnWidths.quantity,
      align: "center",
    });
    doc.text("Discount", 400, y, {
      width: columnWidths.discount,
      align: "center",
    });
    doc.text("Final Price", 450, y, {
      width: columnWidths.finalPrice,
      align: "center",
    });

    y += rowHeight;
    doc.moveTo(50, y).lineTo(600, y).stroke();
    y += 5;
  }

  function drawProductRows(products) {
    products.forEach((product) => {
      doc
        .fontSize(10)
        .text(product.productID.productName, 50, y, {
          width: columnWidths.productName,
        });
      doc.text(`Rs.${product.price}`, 200, y, {
        width: columnWidths.unitPrice,
        align: "center",
      });
      doc.text(product.quantity, 300, y, {
        width: columnWidths.quantity,
        align: "center",
      });
      doc.text(`Rs.${product.discount}`, 400, y, {
        width: columnWidths.discount,
        align: "center",
      });
      doc.text(`Rs.${product.amountPaid}`, 450, y, {
        width: columnWidths.finalPrice,
        align: "center",
      });

      y += rowHeight;

      if (y > doc.page.height - doc.page.margins.bottom - rowHeight) {
        doc.addPage();
        y = tableTop;
        drawTableHeader();
      }
    });
  }

  drawTableHeader();
  drawProductRows(order.products);

  y += rowHeight * 2;
  doc.fontSize(12).text(`Base Price: Rs. ${order.basePrice}`, 50, y);
  doc.text(`Total Discount: Rs. ${order.discount}`, 50, y + rowHeight);
  doc.text(`Total Tax: Rs. ${order.taxAmmount}`, 50, y + 2 * rowHeight);
  doc.text(
    `Delivery Charge: Rs. ${order.deliveryCharge}`,
    50,
    y + 3 * rowHeight
  );
  doc.text(`Total Amount: Rs. ${order.totalAmmount}`, 50, y + 4 * rowHeight);

  doc.end();
};

export const generateSalesPdf = (
  req,
  res,
  salesList,
  reportType,
  startDate,
  endDate
) => {
  const doc = new pdfkit();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=sales_report_${
      reportType !== "custom" ? reportType : startDate + "_" + endDate
    }.pdf`
  );

  doc.pipe(res);

  doc.fontSize(18).text("Sales Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Total Sales: ${salesList.length}`);
  doc
    .fontSize(12)
    .text(
      `Total Order Amount: Rs. ${parseInt(
        salesList.reduce(
          (acc, curr) => acc + Number(curr.products.amountPaid),
          0
        )
      ).toLocaleString()}`
    );
  doc
    .fontSize(12)
    .text(
      `Total Discount : Rs. ${parseInt(
        salesList.reduce((acc, curr) => acc + Number(curr.products.discount), 0)
      ).toLocaleString()}`
    );
  doc.moveDown();

  const columnWidths = {
    date: 50,
    productName: 90,
    quantity: 40,
    email: 120,
    price: 50,
    discount: 50,
    amountPaid: 60,
    paymentMethod: 60,
  };

  const tableTop = 200;
  const rowHeight = 12;
  let y = tableTop;

  function drawTableHeader() {
    doc.fontSize(8).text("Date", 50, y, { width: columnWidths.date });
    doc.text("Product Name", 100, y, { width: columnWidths.productName });
    doc.text("Quantity", 190, y, {
      width: columnWidths.quantity,
      align: "center",
    });
    doc.text("Email", 230, y, { width: columnWidths.email });
    doc.text("Price", 350, y, { width: columnWidths.price, align: "center" });
    doc.text("Discount", 400, y, {
      width: columnWidths.discount,
      align: "center",
    });
    doc.text("Amount Paid", 450, y, {
      width: columnWidths.amountPaid,
      align: "center",
    });
    doc.text("Payment Method", 510, y, {
      width: columnWidths.paymentMethod,
      align: "center",
    });

    y += rowHeight;
    doc.moveTo(50, y).lineTo(620, y).stroke();
    y += 5;
  }

  drawTableHeader();

  salesList.forEach((sale) => {
    doc
      .fontSize(6)
      .text(sale.createdAt.toLocaleDateString(), 50, y, {
        width: columnWidths.date,
      });
    doc.text(sale.productDetails.productName, 100, y, {
      width: columnWidths.productName,
    });
    doc.text(sale.products.quantity, 190, y, {
      width: columnWidths.quantity,
      align: "center",
    });
    doc.text(sale.userDetails.email, 230, y, { width: columnWidths.email });
    doc.text(sale.products.price, 350, y, {
      width: columnWidths.price,
      align: "center",
    });
    doc.text(sale.products.discount, 400, y, {
      width: columnWidths.discount,
      align: "center",
    });
    doc.text(sale.products.amountPaid, 450, y, {
      width: columnWidths.amountPaid,
      align: "center",
    });
    doc.text(sale.paymentMethod, 510, y, {
      width: columnWidths.paymentMethod,
      align: "center",
    });

    y += rowHeight;

    if (y > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = tableTop;
      drawTableHeader();
    }
  });

  doc.end();
};
