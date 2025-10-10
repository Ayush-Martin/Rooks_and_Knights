const USER_ROUTES = Object.freeze({
  LOGIN: "/user/login",
});

const OTP_ROUTES = Object.freeze({
  VERIFY_OTP: "/OTP/verifyOTP",
  TIMER: "/OTP/timer",
  RESEND_OTP: "/OTP/resendOTP",
});

const PUBLIC_ROUTES = Object.freeze({
  HOME: "/",
  ERROR: "/error",
});

const ADMIN_ROUTES = Object.freeze({
  LOGIN: "/admin/login",
  DASHBOARD: "/admin",
});

module.exports = { USER_ROUTES, PUBLIC_ROUTES, ADMIN_ROUTES, OTP_ROUTES };
