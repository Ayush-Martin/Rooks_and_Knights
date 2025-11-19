import exceljs from "exceljs";

export const generateSalesExcel = async (
  req,
  res,
  salesList,
  reportType,
  startDate,
  endDate
) => {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet("Sales_Report");

  worksheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Product Name", key: "productName", width: 20 },
    { header: "Quantity", key: "quantity", width: 10 },
    { header: "Email", key: "email", width: 30 },
    { header: "Price", key: "price", width: 15 },
    { header: "Discount", key: "discount", width: 15 },
    { header: "Amount Paid", key: "amountPaid", width: 15 },
    { header: "Payment Method", key: "paymentMethod", width: 15 },
  ];

  salesList.forEach((sale) => {
    worksheet.addRow({
      date: sale.createdAt.toLocaleDateString(),
      productName: sale.productDetails.productName,
      quantity: sale.products.quantity,
      email: sale.userDetails.email,
      price: sale.products.price,
      discount: sale.products.discount,
      amountPaid: sale.products.amountPaid,
      paymentMethod: sale.paymentMethod,
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=sales_report_${
      reportType != "custom" ? reportType : startDate + "_" + endDate
    }.xlsx`
  );

  await workbook.xlsx.write(res);
};
