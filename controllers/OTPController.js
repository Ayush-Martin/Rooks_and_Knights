//utils
import * as OTPService from "../services/OTPService.js";
import { StatusCode } from "../constants/statusCodes.js";

// Controller to get OTP verification page
export const verifyOTPPage = (req, res) => {
  res.render("OTP/verifyOTP", {
    email: req.session.email,
  });
};

// Controller to handle OTP verification
export const verifyOTP = async (req, res) => {
  const { OTP } = req.body;

  try {
    const result = await OTPService.verifyOTP(req.session.email, OTP);

    if (result.success) {
      req.session.isOTPVerified = true;
      req.session.save();
      res
        .status(StatusCode.OK)
        .json({ successRedirect: req.session.OTPVerificationRedirect });
    } else {
      res.status(StatusCode.BAD_REQUEST).json({ error: result.message });
    }
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

//handle resend otp
export const resendOTP = async (req, res) => {
  const email = req.session.email;

  try {
    await OTPService.resendOTP(email);

    req.session.email = email;
    req.session.save();

    res.redirect("/OTP/verifyOTP");
  } catch (err) {
    console.log(err);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).render("/serverError");
  }
};
