import { Router } from "@vaadin/router";

const router = new Router(document.querySelector(".root"));
router.setRoutes([
  { path: "/", component: "home-page" },
  { path: "/login", component: "login-page" },
  { path: "/password", component: "password-page" },
  { path: "/user-data", component: "user-data-page" },
  { path: "/user-pets", component: "user-pets-page" },
  { path: "/report", component: "report-page" },
  { path: "/edit", component: "edit-page" },
]);
