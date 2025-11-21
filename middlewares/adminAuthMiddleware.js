import jwt from "jsonwebtoken";
import * as adminService from "../services/adminService.js";

// Middleware to check if the user is already authenticated
export const checkAdminAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).redirect("/admin/login");
  }

  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const adminData = await adminService.findAdminByEmail(user.email);

    if (!adminData) {
      return res.status(403).redirect("/admin/login");
    }

    req.email = user.email;
    next();
  } catch (err) {
    console.log(err);
    return res.status(403).redirect("/admin/login");
  }
};

export const validAdmin = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ validationError: true, redirectUrl: "/admin/login" });
  }

  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const adminData = await adminService.findAdminByEmail(user.email);

    if (!adminData) {
      return res
        .status(403)
        .json({ validationError: true, redirectUrl: "/admin/login" });
    }

    req.email = user.email;
    next();
  } catch (err) {
    console.log(err);
    return res
      .status(403)
      .json({ validationError: true, redirectUrl: "/admin/login" });
  }
};

// Middleware to check if the user is already authenticated
export const checkAdminAldreadyAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.email = user.email;

    const adminData = await adminService.findAdminByEmail(req.email);

    if (!adminData) {
      return next();
    }

    return res.redirect("/admin");
  } catch (err) {
    console.log(err);
    return next();
  }
};
