//Importing modules
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import nocache from "nocache";
import cookieParser from "cookie-parser";
import session from "express-session";
import methodOverride from "method-override";
import flash from "connect-flash";
import passport from "passport";
import morgan from "morgan";
import "./config/passport.js";

const app = express();

//Setting view engine
app.set("view engine", "ejs");
app.locals.title = process.env.APP_TITLE;
app.locals.domain = process.env.APP_DOMAIN;

//Middlewares
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use("/public", express.static("public")); //setting public folder
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(nocache());
app.use(morgan("dev"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: process.env.COOKIE_VALID_MINUTES * 60 * 1000,
      secure: false,
      httpOnly: true,
      sameSite: "strict",
    },
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Routers
import userRouter from "./routers/userRoute.js";
import OTPRouter from "./routers/OTPRouter.js";
import adminRouter from "./routers/adminRouter.js";
import homeRouter from "./routers/homeRouter.js";
import shopRouter from "./routers/shopRouter.js";
import cartRouter from "./routers/cartRouter.js";
import wishlistRouter from "./routers/wishlistRouter.js";
import addressRouter from "./routers/addressRouter.js";
import orderRouter from "./routers/orderRouter.js";
import walletRouter from "./routers/walletRouter.js";

//Database
import connectDb from "./config/database.js";
connectDb();

//Running Server
app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});

app.get("/sampleAccount", (req, res) => {
  res.render("sampleAccount");
});

//Using Routers
app.use("/user", userRouter);
app.use("/OTP", OTPRouter);
app.use("/admin", adminRouter);
app.use("/", homeRouter);
app.use("/shop", shopRouter);
app.use("/cart", cartRouter);
app.use("/wishlist", wishlistRouter);
app.use("/address", addressRouter);
app.use("/order", orderRouter);
app.use("/wallet", walletRouter);

app.get("/error", (req, res) => {
  res.status(500).render("serverError");
});

app.use((req, res, next) => {
  res.status(404).render("404");
});
