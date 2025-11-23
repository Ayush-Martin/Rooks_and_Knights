import * as adminSalesService from "../../services/adminSalesService.js";
import { generateSalesExcel } from "../../utils/excelUtils.js";
import { generateSalesPdf } from "../../utils/pdfUtils.js";

// Controller to get sales page
export const salesPage = async (req, res) => {
  try {
    const { page, reportType, startDate, endDate } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;

    const { orderList, salesList, totalNoOfList } =
      await adminSalesService.salesList(
        reportType,
        startDate,
        endDate,
        currentPage,
        noOfList,
        skipPages
      );

    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

    res.render("admin/sales", {
      salesList,
      orderList,
      reportType,
      startDate,
      endDate,
      currentPage,
      totalNoOfPages,
    });
  } catch (err) {
    console.log(err);
    res.status("/error");
  }
};

// Controller to download sales report in excel
export const getDownloadSalesExcel = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    const salesList = await adminSalesService.downloadSalesReport(
      reportType,
      startDate,
      endDate
    );

    generateSalesExcel(req, res, salesList, reportType, startDate, endDate);
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

// Controller to download sales report in pdf
export const getDownloadSalesPdf = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    const salesList = await adminSalesService.downloadSalesReport(
      reportType,
      startDate,
      endDate
    );
    generateSalesPdf(req, res, salesList, reportType, startDate, endDate);
  } catch (err) {
    console.error(err);
    res.redirect("/error");
  }
};
