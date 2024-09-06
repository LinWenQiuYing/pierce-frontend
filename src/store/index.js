import Vue from "vue";
import Vuex from "vuex";
import { getUserInfo, getUserRights } from "@/utils/common.js";
import { setTheme } from "@/assets/theme/theme";

Vue.use(Vuex);
localStorage.setItem("isClear", false);
const isClear = localStorage.getItem("isClear");
if (isClear == "false") {
  // LocalStorage.removeItem("userInfo");
  // LocalStorage.removeItem("userRights");
  setTheme("light");
  // localStorage.setItem("isClear", true);
}

const rightsOptions = {
  namespaced: true,
  state: {
    userInfo: getUserInfo() || {},
    userRights: getUserRights() || {
      riskOverview: true,
      entityInsight: true,
      enterpriseInsight: true,
      personInsight: true,
      employeeInsight: true,
      riskWarning: true,
      riskWarningInfo: true,
      riskWarningStatistics: true,
      affairGraph: true,
      configManage: true,
      rulesManage: true,
      modelsManage: true,
      creatGraph: true,
      graphManage: true,
      schemaManage: true,
      templatesManage: true,
      rostersManage: true,
      rightsManage: true,
      organizationManage: true,
      root_mn_sm_user_query: true,
      root_mn_sm_roles_query: true,
      root_mn_sm_resource_query: true,
      pierceLogin: true,
    },
    userBaseRights: {},
    resourceList: [],
    agencys: [],
    users: [],
    theme: localStorage.getItem("theme") || "light",
    collapsed: false,
  },
  mutations: {
    setAgencys(state, value) {
      state.agencys = value;
    },
    setUsers(state, value) {
      state.users = value;
    },
    setUserInfo(state, value) {
      state.userInfo = value;
    },
    setUserRights(state, value) {
      state.userRights = value;
    },
    setUserBaseRights(state, value) {
      state.userBaseRights = value;
    },
    setResourceList(state, value) {
      state.resourceList = value;
    },
    setTheme(state, value) {
      state.theme = value;
      setTheme(value);
    },
    setCollapsed(state, value) {
      state.collapsed = value;
    },
  },
  actions: {},
  getters: {},
};

const graphOptions = {
  namespaced: true,
  state: {
    firstNode: JSON.parse(sessionStorage.getItem("firstNode")) || {},
    searchVertex: JSON.parse(sessionStorage.getItem("searchVertex")) || [],
    // branchId: sessionStorage.getItem("branchId") || undefined, // branchId为原业务中的branchId，与kg有关
    graphId: sessionStorage.getItem("graphId") || undefined, // graphId为图的自身id
    // blueprintId: sessionStorage.getItem("blueprintId") || undefined, // blueprintId为图的蓝图id--------已弃用
    schemaId: sessionStorage.getItem("schemaId") || undefined, // schemaId为图的蓝图id
    graphSource: sessionStorage.getItem("graphSource") || undefined, // graphSource为图的来源, 0:kg, 1:本地
    searchNames: [], // 图谱探索搜索的对象名称集合
    sentence: undefined,
    layoutKey: "breadthfirst",
    graphFields: {}, // 图谱的点边及对应属性
  },
  mutations: {
    setFirstNode(state, node) {
      state.firstNode = node;
    },
    setSearchVertex(state, nodes) {
      state.searchVertex = nodes;
    },
    // setBranchId(state, value) {
    //   state.branchId = value;
    // },
    setGraphId(state, value) {
      state.graphId = value;
    },
    // setBlueprintId(state, value) {
    //   state.blueprintId = value;
    // },
    setSchemaId(state, value) {
      state.schemaId = value;
    },
    setGraphSource(state, value) {
      state.graphSource = value;
    },
    setSearchNames(state, value) {
      state.searchNames = value;
    },
    setSentence(state, value) {
      state.sentence = value;
    },
    setLayoutKey(state, value) {
      state.layoutKey = value;
    },
    setGraphFields(state, value) {
      state.graphFields = value;
    },
  },
  actions: {},
  getters: {},
};

export default new Vuex.Store({
  modules: {
    rightsOptions,
    graphOptions,
  },
});
