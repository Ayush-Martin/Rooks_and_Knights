import userCollection from "../models/userModel.js";
import jwt from "jsonwebtoken";

// Middleware for routes where the user must be authenticated (GET requests)
export const checkUserAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).redirect("/user/login");
    }

    // Verify JWT token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) {
        return res.status(403).redirect("/user/login");
      }

      req.email = user.email;
      req.userID = user._id;

      let userData = await userCollection.findOne({ email: req.email });

      // Check if the user is blocked
      if (userData && userData.isblocked) {
        return res.status(403).redirect("/user/login");
      }

      next(); // Proceed to the next middleware or route handler
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

// Middleware for routes where the user must be authenticated (POST requests)
export const validUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        authError: "You must login first to continue",
        errorRedirect: `<a href="/user/login">Login here</a>`,
      });
    }

    // Verify JWT token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) {
        return res.status(403).json({
          authError: "You must login first to continue",
          errorRedirect: `<a href="/user/login">Login here</a>`,
        });
      }

      console.log(user);
      req.email = user.email;
      req.userID = user._id;

      let userData = await userCollection.findOne({ email: req.email });

      // Check if the user is blocked
      if (userData.isblocked) {
        return res.status(403).json({
          error: "You are blocked",
          errorRedirect: `<a href="/user/login">Login here</a>`,
        });
      }

      next(); // Proceed to the next middleware or route handler
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Middleware for routes where the user should NOT be authenticated
export const checkUserAlreadyAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(); // No token, proceed to the next middleware or route handler
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) {
        return next(); // Invalid token, proceed to the next middleware or route handler
      }

      req.email = user.email;

      let userExist = await userCollection.findOne({ email: req.email });

      if (userExist && userExist.isblocked) {
        return next(); // User is blocked, proceed to the next middleware or route handler
      }

      // User is authenticated and not blocked, redirect to the home page
      res.redirect("/");
    });
  } catch (err) {
    console.log(err);
    return next();
  }
};

//used to get user data in shop page
export const getUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next();
    }

    // Verify JWT token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) {
        return next();
      }

      req.email = user.email;
      req.userID = user._id;

      next(); // Proceed to the next middleware or route handler
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/error");
  }
};
