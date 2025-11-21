import * as adminUserService from "../../services/adminUserService.js";
import { StatusCode } from "../../constants/statusCodes.js";

// Controller to render admin users page
export const usersPage = async (req, res) => {
  try {
    const { search, page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;

    const { userList, totalNoOfList } = await adminUserService.getUsers(
      search,
      currentPage,
      noOfList,
      skipPages
    );
    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

    res.render("admin/users.ejs", {
      userList,
      searchFilter: search || null,
      currentPage,
      totalNoOfPages,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

// Controller to block or unblock user
export const blockUnblockUser = async (req, res) => {
  try {
    const userID = req.params.id;
    const isblocked = req.query.isblocked === "true";
    await adminUserService.blockUnblockUser(userID, isblocked);
    res.status(StatusCode.OK).json({ userID, isblocked });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};
