import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/Home.vue";
import CalendarIndex from "../views/CalendarIndex.vue";
// Middlewares
import onlyGuests from "./middlewares/onlyGuests";
import store from "../store";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/f",
    name: "files.index",
    component: () => import("../views/files/FilesIndex.vue"),
  },
  {
    path: "/c",
    name: "calendars.index",
    component: CalendarIndex,
  },
  {
    path: "/c/:uuid",
    name: "calendars.show",
    component: () => import("../views/CalendarShow.vue"),
  },
  {
    path: "/c/:uuid/edit",
    name: "calendars.edit",
    component: () => import("../views/CalendarEdit.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/auth/Login.vue"),
    beforeEnter: [onlyGuests],
  },
  {
    path: "/registration",
    name: "registration",
    component: () => import("../views/auth/Registration.vue"),
    beforeEnter: [onlyGuests],
  },

  {
    path: "/password-recovery",
    name: "password-recovery",
    component: () => import("../views/auth/PasswordRecoveryView.vue"),
    beforeEnter: [onlyGuests],
  },
  // 404 page by default to any route match
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("../views/errors/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
