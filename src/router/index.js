import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";
import { cloneDeep } from "lodash";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { message } from "ant-design-vue";

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const layout = () => import(/* webpackChunkName: "layout" */ "@/layout/layout");

const pierceLogin = () =>
  import(/* webpackChunkName: "login" */ "@/views/pierceLogin/pierceLogin");

const riskOverview = () =>
  import(/* webpackChunkName: "risk-overview" */ "@/views/riskOverview");
const entityInsight = () =>
  import(/* webpackChunkName: "entity-insight" */ "@/views/entityInsight");
const enterpriseInsight = () =>
  import(
    /* webpackChunkName: "enterprise-insight" */ "@/views/entityInsight/enterpriseInsight"
  );
const personInsight = () =>
  import(
    /* webpackChunkName: "person-insight" */ "@/views/entityInsight/personInsight"
  );
const employeeInsight = () =>
  import(
    /* webpackChunkName: "employee-insight" */ "@/views/entityInsight/employeeInsight"
  );
const affairGraph = () =>
  import(/* webpackChunkName: "affair-graph" */ "@/views/affairGraph");
const affairGraphSearch = () =>
  import(
    /* webpackChunkName: "affair-graph-search" */ "@/views/affairGraph/graphSearch"
  );
const affairGraphAnalysis = () =>
  import(
    /* webpackChunkName: "affair-graph-details" */ "@/views/affairGraph/graphAnalysis"
  );
const riskWarning = () =>
  import(/* webpackChunkName: "risk-warning" */ "@/views/riskWarning");
const riskWarningInfo = () =>
  import(
    /* webpackChunkName: "risk-warning-info" */ "@/views/riskWarning/riskWarningInfo"
  );
const riskWarningStatistics = () =>
  import(
    /* webpackChunkName: "risk-warning-statistics" */ "@/views/riskWarning/riskWarningStatistics"
  );
const configManage = () =>
  import(/* webpackChunkName: "config-manage" */ "@/views/configManage");
const modelsManage = () =>
  import(
    /* webpackChunkName: "models-manage" */ "@/views/configManage/modelsManage"
  );
const rostersManage = () =>
  import(
    /* webpackChunkName: "names-manage" */ "@/views/configManage/namesManage"
  );
const rulesManage = () =>
  import(
    /* webpackChunkName: "warning-rules" */ "@/views/configManage/warningRules"
  );
const templatesManage = () =>
  import(
    /* webpackChunkName: "templates-manage" */ "@/views/configManage/templatesManage"
  );
const rightsManage = () =>
  import(/* webpackChunkName: "rights-manage" */ "@/views/rightsManage");
const organizationManage = () =>
  import(
    /* webpackChunkName: "organization-manage" */ "@/views/rightsManage/organizationManage"
  );
const rolesManage = () =>
  import(
    /* webpackChunkName: "roles-manage" */ "@/views/rightsManage/rolesManage"
  );
const usersManage = () =>
  import(
    /* webpackChunkName: "users-manage" */ "@/views/rightsManage/usersManage"
  );
const resourcesManage = () =>
  import(
    /* webpackChunkName: "resources-manage" */ "@/views/rightsManage/resourcesManage"
  );
const graphsStructure = () =>
  import(/* webpackChunkName: "graphs-manage" */ "@/views/graphsStructure");
const graphsManage = () =>
  import(
    /* webpackChunkName: "graphs-manage" */ "@/views/graphsStructure/graphsManage"
  );
const blueprintManage = () =>
  import(
    /* webpackChunkName: "graphs-manage" */ "@/views/graphsStructure/blueprintManage"
  );

Vue.use(VueRouter);

// 重复点菜单报错问题
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

export const baseRoutes = [
  {
    path: "/",
    name: "layout",
    component: layout,
    redirect: "risk-overview",
    children: [
      {
        path: "risk-overview",
        name: "riskOverview",
        component: riskOverview,
        meta: {
          keepAlive: false, // 不需要被缓存
        },
      },
      {
        path: "entity-insight",
        name: "entityInsight",
        component: entityInsight,
        children: [
          {
            path: "enterprise",
            name: "enterpriseInsight",
            component: enterpriseInsight,
            meta: {
              keepAlive: true,
            },
          },
          {
            path: "person",
            name: "personInsight",
            component: personInsight,
            meta: {
              keepAlive: true,
            },
          },
          {
            path: "employee",
            name: "employeeInsight",
            component: employeeInsight,
            meta: {
              keepAlive: true,
            },
          },
        ],
      },
      {
        path: "risk-warning",
        name: "riskWarning",
        component: riskWarning,
        children: [
          {
            path: "info",
            name: "riskWarningInfo",
            component: riskWarningInfo,
            meta: {
              keepAlive: true,
            },
          },
          {
            path: "statistics",
            name: "riskWarningStatistics",
            component: riskWarningStatistics,
            meta: {
              keepAlive: true,
            },
          },
        ],
      },
      {
        path: "affair-graph",
        component: affairGraph,
        children: [
          {
            path: "",
            name: "affairGraphSearch",
            component: affairGraphSearch,
            meta: {
              keepAlive: true,
            },
          },
          {
            path: "details",
            name: "affairGraphAnalysis",
            component: affairGraphAnalysis,
            meta: {
              keepAlive: true,
            },
          },
        ],
      },
      {
        path: "config-manage",
        name: "configManage",
        component: configManage,
        children: [
          {
            path: "rules",
            name: "rulesManage",
            component: rulesManage,
            meta: {
              keepAlive: true,
            },
          },
          {
            path: "models",
            name: "modelsManage",
            component: modelsManage,
            meta: {
              keepAlive: true,
            },
          },
          {
            path: "names",
            name: "rostersManage",
            component: rostersManage,
            meta: {
              keepAlive: true,
            },
          },
          {
            path: "templates",
            name: "templatesManage",
            component: templatesManage,
            meta: {
              keepAlive: true,
            },
          },
        ],
      },
      {
        path: "rights-manage",
        name: "rightsManage",
        component: rightsManage,
        children: [
          {
            path: "organization",
            name: "organizationManage",
            component: organizationManage,
            meta: {
              keepAlive: true,
            },
          },
          {
            path: "users",
            name: "root_mn_sm_user_query",
            component: usersManage,
            meta: {
              keepAlive: true,
            },
          },
          {
            path: "roles",
            name: "root_mn_sm_roles_query",
            component: rolesManage,
            meta: {
              keepAlive: true,
            },
          },
          {
            path: "resources",
            name: "root_mn_sm_resource_query",
            component: resourcesManage,
            meta: {
              keepAlive: true,
            },
          },
        ],
      },
      {
        path: "graphs-structure",
        name: "graphsStructure",
        component: graphsStructure,
        children: [
          {
            path: "graphs",
            name: "graphsManage",
            component: graphsManage,
            meta: {
              keepAlive: true,
            },
          },
          {
            path: "blueprint",
            name: "blueprintManage",
            component: blueprintManage,
            meta: {
              keepAlive: true,
            },
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    name: "pierceLogin",
    component: pierceLogin,
  },
  {
    path: "*",
    redirect: "/",
  },
];

// 根据用户权限配置路由
const restRoutes = [];
const routes = cloneDeep(baseRoutes);

routes[0].children.map((item) => {
  if (item.name) {
    const flag = store.state.rightsOptions.userRights[`${item.name}`];
    if (flag) {
      if (item.children && item.children.length) {
        const carr = [];
        item.children.map((citem) => {
          const cflag = store.state.rightsOptions.userRights[`${citem.name}`];
          if (cflag) {
            carr.push(citem);
          }
        });
        item.children = carr;
      }
      restRoutes.push(item);
    }
  } else {
    const flag = store.state.rightsOptions.userRights["affairGraph"];
    if (flag) {
      restRoutes.push(item);
    }
  }
});

const finalRoutes = [
  {
    path: "/",
    name: "layout",
    component: layout,
    redirect:
      restRoutes[0].children && restRoutes[0].children.length
        ? restRoutes[0].children[0].path === ""
          ? `${restRoutes[0].path}`
          : `${restRoutes[0].path}/${restRoutes[0].children[0].path}`
        : restRoutes[0].path,
    children: restRoutes,
  },
  {
    path: "/login",
    name: "pierceLogin",
    component: pierceLogin,
  },
  {
    path: "*",
    redirect: "/",
  },
];

export const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes: finalRoutes,
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // next();
  NProgress.start();

  if (
    store.state.rightsOptions.userInfo &&
    store.state.rightsOptions.userInfo.token
  ) {
    if (to.path === "/login") {
      next(false);
    } else {
      next();
    }
  } else {
    if (to.path === "/login") {
      next();
    } else {
      message.error("登陆超时，请重新登陆！", 2);
      next({
        name: "pierceLogin",
        params: {
          target: window.location.pathname,
        },
      });
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});
