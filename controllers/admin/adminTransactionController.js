import * as transactionService from "../../services/transactionService.js";

export const transactionsPage = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;

    const { transactionList, totalNoOfList } =
      await transactionService.allTransactionsList(
        currentPage,
        noOfList,
        skipPages
      );
    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

    res.render("admin/transactions", {
      transactionList,
      currentPage,
      totalNoOfPages,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};
