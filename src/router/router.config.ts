// src/router/router.config.ts
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/Login.vue"),
    meta: { title: "Sign in", bread: false },
  },
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    meta: { requiresAuth: true, title: "Dashboard", bread: true },
    children: [
      {
        path: "",
        name: "dashboard",
        component: () => import("@/views/dashboard/Index.vue"),
        meta: { title: "Overview", bread: true },
      },
      {
        path: "/lead",
        component: () => import("@/views/leads/index.vue"),
        name: "lead management",
        meta: {
          title: "Lead Management",
          bread: true,
        },
        children: [
          {
            path: "/lead/create",
            name: "lead create",
            component: () => import("@/views/leads-create/index.vue"),
            meta: {
              title: "Tạo mới khách hàng",
              bread: true,
              backToRouter: "lead management",
            },
          },
          {
            path: "/lead/:id/edit",
            name: "lead edit",
            component: () => import("@/views/leads-update/index.vue"),
            meta: {
              title: "Chỉnh sửa khách hàng",
              bread: true,
              backToRouter: "lead management",
            },
          },
        ],
      },
      {
        path: "/apps",
        component: () => import("@/views/apps/index.vue"),
        name: "apps management",
        meta: {
          title: "Apps Management",
          bread: true,
        },
        children: [
          {
            path: "/apps/create",
            name: "apps create",
            component: () => import("@/views/apps-create/index.vue"),
            meta: {
              title: "Apps Management - Tạo hồ sơ YCBH",
              bread: true,
            },
          },
        ],
      },
      {
        path: "/quotes",
        component: () => import("@/views/quotes/index.vue"),
        name: "quotes management",
        meta: {
          title: "Quotes Management",
          bread: true,
        },
        children: [
          {
            path: "/quotes/create",
            name: "QuoteCreate",
            component: () => import("@/views/quotes-create/index.vue"),
            meta: {
              title: "Tạo báo giá hồ sơ YCBH",
              bread: true,
              backToRouter: 'apps management'
            },
          },
        ],
      },
      {
        path: "/illustration",
        component: () => import("@/views/illustration/index.vue"),
        name: "illustration management",
        meta: {
          title: "Illustration Management",
          bread: true,
        },
        children: [
          {
            path: "/illustration/create",
            name: "illustration create",
            component: () => import("@/views/illustration-create/index.vue"),
            meta: {
              title: "Tạo bảng minh hoạ",
              bread: true,
            },
          },
        ],
      },
      {
        path: "/master/product-plan",
        component: () => import("@/views/productPlan/index.vue"),
        name: "productPlan",
        meta: {
          title: "Master data - Sản phẩm bảo hiểm",
          bread: true,
        },
        children: [
          {
            path: "/master/product-plans/:planId/versions",
            name: "PlanVersions",
            component: () => import("@/views/planVersion/index.vue"),
            props: (route) => ({ planId: String(route.params.planId) }),
            meta: {
              title: "Cấu hình phiên bản định phí",
              bread: true,
              backToRouter: "productPlan",
            },
          },
          {
            path: "/master/product-plans/:planId/pricing-versions",
            name: "PricingVersions",
            component: () => import("@/views/pricingVersion/index.vue"),
            // pass planId as prop so component can use defineProps or useRoute
            props: (route) => ({ planId: String(route.params.planId) }),
            meta: {
              title: "Quản lý phiên bản định phí",
              bread: true,
              backToRouter: "productPlan",
            },
          },
          {
            path: "/master/product-plans/:planId/benefits",
            name: "ProductBenefits",
            component: () => import("@/views/productBenefit/index.vue"),
            // pass planId as prop so component can use defineProps or useRoute
            props: (route) => ({ planId: String(route.params.planId) }),
            meta: {
              title: "Quản lý quyền lợi bảo hiểm",
              bread: true,
              backToRouter: "productPlan",
            },
          },
          // <-- Insert ProductBenefitDetail route here
          {
            path: "/master/product-plans/:planId/benefits/:benefitId",
            name: "ProductBenefitDetail",
            component: () =>
              import("@/views/productBenefit/ProductBenefitDetail/index.vue"),
            props: (route) => ({
              planId: String(route.params.planId),
              benefitId: String(route.params.benefitId),
            }),
            meta: {
              title: "Chi tiết quyền lợi sản phẩm",
              bread: true,
              backToRouter: "productPlan",
            },
          },
        ],
      },
      {
        path: "/master/term-rate",
        name: "term-rate",
        component: () => import("@/views/termRate/index.vue"),
        meta: {
          title: "Bảng biểu phí BH (tháng)",
          bread: true,
          backToRouter: "productPlan",
        },
      },
      {
        path: "/master/term-rate/seed",
        name: "TermRateSeed",
        component: () => import("@/views/termRate/seed/index.vue"),
        meta: {
          title: "Seed Term Rates",
          bread: true,
          backToRouter: "term-rate",
        },
      },
      {
        path: "/master/rider-master",
        name: "RiderMaster",
        component: () => import("@/views/riderMaster/index.vue"),
        meta: {
          title: "Rider Master",
          bread: true,
        },
      },
      {
        path: "/master/rider-rate",
        name: "RiderRate",
        component: () => import("@/views/riderRate/index.vue"),
        meta: {
          title: "Rider rate",
          bread: true,
        },
      },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

export default routes;
