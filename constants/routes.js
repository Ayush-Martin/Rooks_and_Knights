const USER_ROUTES = Object.freeze({
  LOGIN: "/user/login",
});

const PUBLIC_ROUTES = Object.freeze({
  HOME: "/",
  ERROR: "/error",
});

const ADMIN_ROUTES = Object.freeze({
  LOGIN: "/admin/login",
  DASHBOARD: "/admin",
});

module.exports = { USER_ROUTES, PUBLIC_ROUTES, ADMIN_ROUTES };
