//Requiring modules
require("dotenv").config();
const express = require("express");
const app = express();
const nocache = require("nocache");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const passport = require("passport");
const morgan = require("morgan");
require("./config/passport");

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
app.use(morgan("dev"));

//Routers
const userRouter = require("./routers/userRoute");
const OTPRouter = require("./routers/OTPRouter");
const adminRouter = require("./routers/adminRouter");
const homeRouter = require("./routers/homeRouter");
const shopRouter = require("./routers/shopRouter");
const cartRouter = require("./routers/cartRouter");
const wishlistRouter = require("./routers/wishlistRouter");
const addressRouter = require("./routers/addressRouter");
const orderRouter = require("./routers/orderRouter");
const walletRouter = require("./routers/walletRouter");

//Database
const connectDb = require("./config/database");
const { errorHandler } = require("./middlewares/errorHandlerMiddlware");
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

app.use(errorHandler);
