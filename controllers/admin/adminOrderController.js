import * as adminOrderService from "../../services/adminOrderService.js";
import { StatusCode } from "../../constants/statusCodes.js";

// Controller ot get orders page
export const ordersPage = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;
    const { orders, totalNoOfList } = await adminOrderService.getOrders(
      currentPage,
      noOfList,
      skipPages
    );
    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

    res.render("admin/orders", { orders, currentPage, totalNoOfPages });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

// Controller to render specific order page
export const orderPage = async (req, res) => {
  try {
    const orderID = req.params.id;
    const { order } = await adminOrderService.getOrder(orderID);

    res.render("admin/viewEditOrder", { order });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

// Controller to change order product status
export const updateOrderProductStatus = async (req, res) => {
  try {
    const productOrderID = req.params.id;
    const { orderID, status, productID, quantity } = req.body;
    const updatedOrder = await adminOrderService.changeProductStatus(
      productOrderID,
      orderID,
      status,
      productID,
      quantity
    );

    res
      .status(StatusCode.OK)
      .json({ success: true, orderStatus: updatedOrder.orderStatus });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};
