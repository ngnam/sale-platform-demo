import { createRouter as _createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/store/user";
import routes from "./router.config";

export function createRouter() {
  const router = _createRouter({ history: createWebHistory(), routes });
  router.beforeEach(async (to) => {
    const userStore = useUserStore();
    const requiresAuth = to.meta?.requiresAuth === true;
    if (requiresAuth && !userStore.isLoggedIn) {
      return { name: "Login", query: { redirect: to.fullPath } };
    }
    if (to.name === "Login" && userStore.isLoggedIn) {
      return { name: "Dashboard" };
    }

    // set document title from meta.title (fallback)
    const title = (to.meta && (to.meta.title as string)) || "App";
    document.title = title;
  });
  return router;
}
