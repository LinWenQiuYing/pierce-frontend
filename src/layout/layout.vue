<template>
  <a-layout class="pierce-layout" id="pierce-layout">
    <a-layout-header class="pierce-layout-header">
      <div class="logo" v-if="collapsed" style="width: 64px">
        <icon-svg icon-class="pierce-logo-small" class="pierce-logo" />
      </div>
      <div class="logo" v-else>
        <icon-svg icon-class="pierce-logo" class="pierce-logo" />
      </div>
      <div
        class="pierce-layout-header-right"
        :style="{
          width: collapsed ? 'calc(100% - 64px)' : 'calc(100% - 160px)',
        }"
      >
        <a-tabs
          class="pierce-tabs"
          v-model="activeKey"
          hide-add
          type="editable-card"
          @edit="onEdit"
          @change="handleChangeTab"
        >
          <a-tab-pane
            v-for="pane in panes"
            :key="pane.key"
            :tab="pane.title"
            :closable="pane.closable"
          >
          </a-tab-pane>
        </a-tabs>
        <div class="user-info">
          <div class="info-item time">{{ nowTime }}</div>
          <!-- <a-popover
            overlayClassName="theme-popover"
            trigger="hover"
            placement="bottom"
          >
            <template slot="content">
              <div
                class="theme-popover-item"
                @click="handleChangeTheme(item.value)"
                v-for="item in themeList"
                :key="item.value"
              >
                <p class="item-content">
                  <a-icon v-if="item.value === theme" type="check" />
                  <span class="item-content-text">{{ item.title }}</span>
                </p>
              </div>
            </template>
            <div class="info-item theme">
              <icon-svg icon-class="skin" class="theme-icon" />
            </div>
          </a-popover> -->
          <div class="info-item message">
            <icon-svg alt="消息" class="message-icon" icon-class="bell" />
          </div>
          <a-popover
            overlayClassName="user-info-part"
            trigger="hover"
            placement="bottomRight"
          >
            <template slot="content">
              <div class="logout-btn" @click="logout">退出登录</div>
            </template>
            <div class="info-item user-info-content">{{ userName }}</div>
          </a-popover>
        </div>
      </div>
    </a-layout-header>
    <a-layout class="pierce-layout-content">
      <a-layout-sider
        class="pierce-layout-content-left"
        v-model="collapsed"
        :trigger="null"
        collapsible
        :width="160"
        collapsedWidth="64"
      >
        <a-menu
          theme="dark"
          mode="inline"
          :default-selected-keys="['1']"
          :inline-collapsed="collapsed"
          :selectedKeys="selectedKeys"
          :open-keys="openKeys"
          @openChange="handleOpenChange"
          :inlineIndent="24"
        >
          <a-menu-item
            key="1"
            @click="handleChangeLink('risk-overview', '1', 'menu')"
            v-if="userRights.riskOverview"
          >
            <div class="menu-icon">
              <icon-svg icon-class="icon_riskOverview" />
            </div>
            <span class="menu-text">风险概览</span>
          </a-menu-item>
          <a-sub-menu key="2" v-if="userRights.entityInsight">
            <span slot="title" class="sub-menu-title">
              <div class="menu-icon">
                <icon-svg icon-class="icon_enterpriseInsight" />
              </div>
              <span class="menu-text">合规探查</span>
            </span>
            <a-menu-item
              key="2.1"
              @click="
                handleChangeLink('entity-insight/enterprise', '2.1', 'menu')
              "
              v-if="userRights.enterpriseInsight"
            >
              <span class="menu-text">对公客户探查</span>
            </a-menu-item>
            <a-menu-item
              key="2.2"
              @click="handleChangeLink('entity-insight/person', '2.2', 'menu')"
              v-if="userRights.personInsight"
            >
              <span class="menu-text">个人客户探查</span>
            </a-menu-item>
            <a-menu-item
              key="2.3"
              @click="
                handleChangeLink('entity-insight/employee', '2.3', 'menu')
              "
              v-if="userRights.employeeInsight"
            >
              <span class="menu-text">员工行为分析</span>
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item
            key="4"
            @click="handleChangeLink('affair-graph', '4', 'menu')"
            v-if="userRights.affairGraph"
          >
            <div class="menu-icon">
              <icon-svg icon-class="icon_affairGraph" />
            </div>
            <span class="menu-text">图谱探索</span>
          </a-menu-item>
          <a-sub-menu key="7" v-if="userRights.creatGraph">
            <span slot="title" class="sub-menu-title">
              <div class="menu-icon">
                <icon-svg icon-class="icon_creatGraph" />
              </div>
              <span class="menu-text">图谱构建</span>
            </span>
            <a-menu-item
              key="7.1"
              @click="
                handleChangeLink('graphs-structure/blueprint', '7.1', 'menu')
              "
              v-if="userRights.schemaManage"
            >
              <span class="menu-text">蓝图管理</span>
            </a-menu-item>
            <a-menu-item
              key="7.2"
              @click="
                handleChangeLink('graphs-structure/graphs', '7.2', 'menu')
              "
              v-if="userRights.graphManage"
            >
              <span class="menu-text">图谱管理</span>
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item
            key="8"
            @click="handleChangeLink('config-manage/templates', '8', 'menu')"
            v-if="userRights.templatesManage"
          >
            <div class="menu-icon">
              <icon-svg icon-class="icon_templatesManage" />
            </div>
            <span class="menu-text">模板管理</span>
          </a-menu-item>
          <a-menu-item
            key="9"
            @click="handleChangeLink('config-manage/models', '9', 'menu')"
            v-if="userRights.modelsManage"
          >
            <div class="menu-icon">
              <icon-svg icon-class="icon_modelsManage" />
            </div>
            <span class="menu-text">图谱模型</span>
          </a-menu-item>
          <a-menu-item
            key="10"
            @click="handleChangeLink('config-manage/rules', '10', 'menu')"
            v-if="userRights.rulesManage"
          >
            <div class="menu-icon">
              <icon-svg icon-class="icon_rulesManage" />
            </div>
            <span class="menu-text">图谱规则</span>
          </a-menu-item>
          <a-sub-menu key="3" v-if="userRights.riskWarning">
            <span slot="title" class="sub-menu-title">
              <div class="menu-icon">
                <icon-svg icon-class="icon_riskWarning" />
              </div>
              <span class="menu-text">关联线索</span>
            </span>
            <a-menu-item
              key="3.2"
              @click="
                handleChangeLink('risk-warning/statistics', '3.2', 'menu')
              "
              v-if="userRights.riskWarningStatistics"
            >
              <span class="menu-text">线索概览</span>
            </a-menu-item>
            <a-menu-item
              key="3.1"
              @click="handleChangeLink('risk-warning/info', '3.1', 'menu')"
              v-if="userRights.riskWarningInfo"
            >
              <span class="menu-text">线索列表</span>
            </a-menu-item>
          </a-sub-menu>
          <!-- <a-sub-menu key="5" v-if="userRights.configManage">
            <span slot="title" class="sub-menu-title">
              <div class="menu-icon">
                <icon-svg icon-class="icon_configManage" />
              </div>
              <span class="menu-text">配置管理</span>
            </span>
            <a-menu-item
              key="5.3"
              @click="handleChangeLink('config-manage/graphs', '5.3', 'menu')"
              v-if="userRights.graphsManage"
            >
              <span class="menu-text">图谱管理</span>
            </a-menu-item>
            <a-menu-item
              key="5.4"
              @click="handleChangeLink('config-manage/names', '5.4', 'menu')"
              v-if="userRights.rostersManage"
            >
              <span class="menu-text">名单管理</span>
            </a-menu-item>
          </a-sub-menu> -->
          <a-sub-menu key="6" v-if="userRights.rightsManage">
            <span slot="title" class="sub-menu-title">
              <div class="menu-icon">
                <icon-svg icon-class="icon_rightsManage" />
              </div>
              <span class="menu-text">权限管理</span>
            </span>
            <a-menu-item
              key="6.1"
              @click="
                handleChangeLink('rights-manage/organization', '6.1', 'menu')
              "
              v-if="userRights.organizationManage"
            >
              <span class="menu-text">机构管理</span>
            </a-menu-item>
            <a-menu-item
              key="6.2"
              @click="handleChangeLink('rights-manage/users', '6.2', 'menu')"
              v-if="userRights.root_mn_sm_user_query"
            >
              <span class="menu-text">用户管理</span>
            </a-menu-item>
            <a-menu-item
              key="6.3"
              @click="handleChangeLink('rights-manage/roles', '6.3', 'menu')"
              v-if="userRights.root_mn_sm_roles_query"
            >
              <span class="menu-text">角色管理</span>
            </a-menu-item>
            <a-menu-item
              key="6.4"
              @click="
                handleChangeLink('rights-manage/resources', '6.4', 'menu')
              "
              v-if="userRights.root_mn_sm_resource_query"
            >
              <span class="menu-text">资源管理</span>
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
        <div class="menu-footer">
          <div class="footer-left" v-if="!collapsed">
            <div class="footer-left-img">
              <icon-svg color="#1C5B8F" icon-class="pierce-logo-small" />
            </div>
            <!-- <span class="footer-text" v-if="layoutWidth > 1440"
              >Power by 星环</span
            > -->
            <span class="footer-text">Transwarp</span>
          </div>
          <a-icon
            class="footer-trigger"
            :type="collapsed ? 'menu-unfold' : 'menu-fold'"
            @click="() => setCollapsed(!collapsed)"
          />
        </div>
      </a-layout-sider>
      <a-layout-content class="pierce-layout-content-right">
        <!-- <a-tabs
          class="pierce-tabs"
          v-model="activeKey"
          hide-add
          type="editable-card"
          @edit="onEdit"
          @change="handleChangeTab"
        >
          <a-tab-pane
            v-for="pane in panes"
            :key="pane.key"
            :tab="pane.title"
            :closable="pane.closable"
          >
          </a-tab-pane>
        </a-tabs> -->
        <keep-alive>
          <router-view v-if="$route.meta.keepAlive" :key="$route.path">
            <!-- 这里是会被缓存的视图组件 -->
          </router-view>
        </keep-alive>

        <router-view v-if="!$route.meta.keepAlive">
          <!-- 这里是不被缓存的视图组件 -->
        </router-view>

        <!-- 使用exclude的话会在$router.push方法下失效，不知道原因 -->
        <!-- <keep-alive exclude="GraphAnalysis">
          <router-view></router-view>
        </keep-alive> -->
        <!-- <router-view></router-view> -->
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import moment from "moment";
import { Layout, Menu, Popover, Tabs } from "ant-design-vue";
import { userLogout } from "@/shared/api/login.js";
import { mapState, mapMutations } from "vuex";
import { LocalStorage } from "@/utils/common.js";
import { getResourceList } from "@/shared/api/rightsManage";
import { queryGraphList } from "@/shared/api/configManage.js";

const { Header, Content, Sider } = Layout;
const { Item, SubMenu } = Menu;
const { TabPane } = Tabs;

export default {
  data() {
    return {
      activeKey: "1",
      selectedKeys: [],
      openKeys: [],
      openKeysCopy: [],
      panes: [],
      nowTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      timer: "",
      themeList: [
        {
          title: "明亮",
          value: "light",
        },
        {
          title: "暗黑",
          value: "black",
        },
      ],
      // layoutWidth: 1920,
    };
  },
  computed: {
    ...mapState("graphOptions", ["graphId", "schemaId"]),
    ...mapState("rightsOptions", [
      "userRights",
      "userInfo",
      "theme",
      "collapsed",
    ]),
    userName() {
      return this.userInfo.userName;
    },
  },
  watch: {
    $route(to, from) {
      const url = to.path.slice(1);
      const fromUrl = from.path.slice(1);
      let title = "";
      let selectKey = "0";
      let activeKey = "0";
      switch (url) {
        case "risk-overview":
          title = "风险概览";
          selectKey = "1";
          activeKey = "1";
          this.openKeys = [];
          this.openKeysCopy = [];
          break;
        case "entity-insight/enterprise":
          title = "对公客户探查";
          selectKey = "2.1";
          activeKey = "2.1";
          if (this.collapsed) {
            this.openKeys = [];
          } else {
            this.openKeys = ["2"];
          }
          this.openKeysCopy = ["2"];
          break;
        case "entity-insight/person":
          title = "个人客户探查";
          selectKey = "2.2";
          activeKey = "2.2";
          if (this.collapsed) {
            this.openKeys = [];
          } else {
            this.openKeys = ["2"];
          }
          this.openKeysCopy = ["2"];
          break;
        case "entity-insight/employee":
          title = "员工行为分析";
          selectKey = "2.3";
          activeKey = "2.3";
          if (this.collapsed) {
            this.openKeys = [];
          } else {
            this.openKeys = ["2"];
          }
          this.openKeysCopy = ["2"];
          break;
        case "risk-warning/info":
          title = "线索列表";
          selectKey = "3.1";
          activeKey = "3.1";
          if (this.collapsed) {
            this.openKeys = [];
          } else {
            this.openKeys = ["3"];
          }
          this.openKeysCopy = ["3"];
          break;
        case "risk-warning/statistics":
          title = "线索概览";
          selectKey = "3.2";
          activeKey = "3.2";
          if (this.collapsed) {
            this.openKeys = [];
          } else {
            this.openKeys = ["3"];
          }
          this.openKeysCopy = ["3"];
          break;
        case "affair-graph":
          title = "图谱探索";
          selectKey = "4";
          activeKey = "4";
          this.openKeys = [];
          this.openKeysCopy = [];
          break;
        case "affair-graph/details":
          title = "图谱详情";
          selectKey = "4";
          activeKey = "4.1";
          this.openKeys = [];
          this.openKeysCopy = [];
          break;
        case "config-manage/rules":
          title = "图谱规则";
          selectKey = "10";
          activeKey = "10";
          this.openKeys = [];
          this.openKeysCopy = [];
          break;
        case "config-manage/models":
          title = "图谱模型";
          selectKey = "9";
          activeKey = "9";
          this.openKeys = [];
          this.openKeysCopy = [];
          break;
        case "config-manage/names":
          title = "名单管理";
          selectKey = "5.4";
          activeKey = "5.4";
          if (this.collapsed) {
            this.openKeys = [];
          } else {
            this.openKeys = ["5"];
          }
          this.openKeysCopy = ["5"];
          break;
        case "config-manage/templates":
          title = "模板管理";
          selectKey = "8";
          activeKey = "8";
          this.openKeys = [];
          this.openKeysCopy = [];
          break;
        case "rights-manage/organization":
          title = "机构管理";
          selectKey = "6.1";
          activeKey = "6.1";
          if (this.collapsed) {
            this.openKeys = [];
          } else {
            this.openKeys = ["6"];
          }
          this.openKeysCopy = ["6"];
          break;
        case "rights-manage/users":
          title = "用户管理";
          selectKey = "6.2";
          activeKey = "6.2";
          if (this.collapsed) {
            this.openKeys = [];
          } else {
            this.openKeys = ["6"];
          }
          this.openKeysCopy = ["6"];
          break;
        case "rights-manage/roles":
          title = "角色管理";
          selectKey = "6.3";
          activeKey = "6.3";
          if (this.collapsed) {
            this.openKeys = [];
          } else {
            this.openKeys = ["6"];
          }
          this.openKeysCopy = ["6"];
          break;
        case "rights-manage/resources":
          title = "资源管理";
          selectKey = "6.4";
          activeKey = "6.4";
          if (this.collapsed) {
            this.openKeys = [];
          } else {
            this.openKeys = ["6"];
          }
          this.openKeysCopy = ["6"];
          break;
        case "graphs-structure/blueprint":
          title = "蓝图管理";
          selectKey = "7.1";
          activeKey = "7.1";
          if (this.collapsed) {
            this.openKeys = [];
          } else {
            this.openKeys = ["7"];
          }
          this.openKeysCopy = ["7"];
          break;
        case "graphs-structure/graphs":
          title = "图谱管理";
          selectKey = "7.2";
          activeKey = "7.2";
          if (this.collapsed) {
            this.openKeys = [];
          } else {
            this.openKeys = ["7"];
          }
          this.openKeysCopy = ["7"];
          break;

        default:
          break;
      }
      if (url === "affair-graph/details") {
        // 在图谱详情页阻止浏览器右键事件
        document.oncontextmenu = function () {
          return false;
        };
      } else {
        // 在其他页面放开浏览器右键事件
        document.oncontextmenu = function () {
          return true;
        };
      }
      this.handleUpdataTabs(url, title, selectKey, activeKey, fromUrl);
    },
    collapsed(newValue) {
      if (newValue) {
        this.openKeys = [];
      } else {
        this.openKeys = this.openKeysCopy;
      }
    },
  },
  created() {
    // 放在beforeDestroy中不管用，无奈，放在这里
    this.$bus.$off("clearKeepAlive");
  },
  async mounted() {
    // 注册监听全局的clearKeepAlive方法,可在其他组件中触发此方法
    this.$bus.$on("clearKeepAlive", this.clearKeepAlive);
    await this.getResourceList();
    this.timer = setInterval(() => {
      this.nowTime = moment().format("YYYY-MM-DD HH:mm:ss");
    }, 1000);
    // const that = this;
    // setTimeout(() => {
    //   that.layoutWidth = document.getElementById("pierce-layout").scrollWidth;
    //   window.onresize = () => {
    //     that.layoutWidth = document.getElementById("pierce-layout").scrollWidth;
    //   };
    // }, 100);
    if (!this.graphId || !this.schemaId) {
      await this.getGraphList();
    }
    setTimeout(() => {
      const panes = [];
      switch (this.$route.path) {
        case "/entity-insight/enterprise":
          this.selectedKeys = ["2.1"];
          this.activeKey = "2.1";
          this.openKeys = ["2"];
          this.openKeysCopy = ["2"];
          panes.push({
            title: "对公客户探查",
            key: "2.1",
            path: "entity-insight/enterprise",
            closable: true,
          });
          break;
        case "/entity-insight/person":
          this.selectedKeys = ["2.2"];
          this.activeKey = "2.2";
          this.openKeys = ["2"];
          this.openKeysCopy = ["2"];
          panes.push({
            title: "个人客户探查",
            key: "2.2",
            path: "entity-insight/person",
            closable: true,
          });
          break;
        case "/entity-insight/employee":
          this.selectedKeys = ["2.3"];
          this.activeKey = "2.3";
          this.openKeys = ["2"];
          this.openKeysCopy = ["2"];
          panes.push({
            title: "员工行为分析",
            key: "2.3",
            path: "entity-insight/employee",
            closable: true,
          });
          break;
        case "/risk-warning/info":
          this.selectedKeys = ["3.1"];
          this.activeKey = "3.1";
          this.openKeys = ["3"];
          this.openKeysCopy = ["3"];
          panes.push({
            title: "线索列表",
            key: "3.1",
            path: "risk-warning/info",
            closable: true,
          });
          break;
        case "/risk-warning/statistics":
          this.selectedKeys = ["3.2"];
          this.activeKey = "3.2";
          this.openKeys = ["3"];
          this.openKeysCopy = ["3"];
          panes.push({
            title: "线索概览",
            key: "3.2",
            path: "risk-warning/statistics",
            closable: true,
          });
          break;
        case "/affair-graph":
          this.selectedKeys = ["4"];
          this.activeKey = "4";
          this.openKeys = [];
          this.openKeysCopy = [];
          panes.push({
            title: "图谱探索",
            key: "4",
            path: "affair-graph",
            closable: true,
          });
          break;
        case "/affair-graph/details":
          this.selectedKeys = ["4"];
          this.activeKey = "4.1";
          this.openKeys = [];
          this.openKeysCopy = [];
          panes.push({
            title: "图谱详情",
            key: "4.1",
            path: "affair-graph/details",
            closable: true,
          });
          break;
        case "/config-manage/rules":
          this.selectedKeys = ["10"];
          this.activeKey = "10";
          this.openKeys = [];
          this.openKeysCopy = [];
          panes.push({
            title: "图谱规则",
            key: "10",
            path: "config-manage/rules",
            closable: true,
          });
          break;
        case "/config-manage/models":
          this.selectedKeys = ["9"];
          this.activeKey = "9";
          this.openKeys = [];
          this.openKeysCopy = [];
          panes.push({
            title: "图谱模型",
            key: "9",
            path: "config-manage/models",
            closable: true,
          });
          break;
        case "/config-manage/names":
          this.selectedKeys = ["5.4"];
          this.activeKey = "5.4";
          this.openKeys = ["5"];
          this.openKeysCopy = ["5"];
          panes.push({
            title: "名单管理",
            key: "5.4",
            path: "config-manage/names",
            closable: true,
          });
          break;
        case "/config-manage/templates":
          this.selectedKeys = ["8"];
          this.activeKey = "8";
          this.openKeys = [];
          this.openKeysCopy = [];
          panes.push({
            title: "模板管理",
            key: "8",
            path: "config-manage/templates",
            closable: true,
          });
          break;
        case "/rights-manage/organization":
          this.selectedKeys = ["6.1"];
          this.activeKey = "6.1";
          this.openKeys = ["6"];
          this.openKeysCopy = ["6"];
          panes.push({
            title: "机构管理",
            key: "6.1",
            path: "rights-manage/organization",
            closable: true,
          });
          break;
        case "/rights-manage/users":
          this.selectedKeys = ["6.2"];
          this.activeKey = "6.2";
          this.openKeys = ["6"];
          this.openKeysCopy = ["6"];
          panes.push({
            title: "用户管理",
            key: "6.2",
            path: "rights-manage/users",
            closable: true,
          });
          break;
        case "/rights-manage/roles":
          this.selectedKeys = ["6.3"];
          this.activeKey = "6.3";
          this.openKeys = ["6"];
          this.openKeysCopy = ["6"];
          panes.push({
            title: "角色管理",
            key: "6.3",
            path: "rights-manage/roles",
            closable: true,
          });
          break;
        case "/rights-manage/resources":
          this.selectedKeys = ["6.4"];
          this.activeKey = "6.4";
          this.openKeys = ["6"];
          this.openKeysCopy = ["6"];
          panes.push({
            title: "资源管理",
            key: "6.4",
            path: "rights-manage/resources",
            closable: true,
          });
          break;
        case "/graphs-structure/blueprint":
          this.selectedKeys = ["7.1"];
          this.activeKey = "7.1";
          this.openKeys = ["7"];
          this.openKeysCopy = ["7"];
          panes.push({
            title: "蓝图管理",
            key: "7.1",
            path: "graphs-structure/blueprint",
            closable: true,
          });
          break;
        case "/graphs-structure/graphs":
          this.selectedKeys = ["7.2"];
          this.activeKey = "7.2";
          this.openKeys = ["7"];
          this.openKeysCopy = ["7"];
          panes.push({
            title: "图谱管理",
            key: "7.2",
            path: "graphs-structure/graphs",
            closable: true,
          });
          break;

        default:
          this.selectedKeys = ["1"];
          this.activeKey = "1";
          this.openKeys = [];
          this.openKeysCopy = [];
          panes.push({
            title: "风险概览",
            key: "1",
            path: "risk-overview",
            closable: true,
          });
          break;
      }
      panes[0].closable = false;
      this.panes = panes;
    }, 300);
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  },
  components: {
    ALayout: Layout,
    ALayoutContent: Content,
    ALayoutHeader: Header,
    ALayoutSider: Sider,
    AMenu: Menu,
    AMenuItem: Item,
    APopover: Popover,
    ASubMenu: SubMenu,
    ATabs: Tabs,
    ATabPane: TabPane,
  },
  methods: {
    ...mapMutations("rightsOptions", {
      setUserInfo: "setUserInfo",
      setUserRights: "setUserRights",
      setUserBaseRights: "setUserBaseRights",
      setResourceList: "setResourceList",
      setTheme: "setTheme",
      setCollapsed: "setCollapsed",
    }),
    ...mapMutations("graphOptions", {
      setGraphId: "setGraphId",
      setSchemaId: "setSchemaId",
      setGraphSource: "setGraphSource",
    }),
    onEdit(targetKey, action) {
      this[action](targetKey);
    },
    remove(targetKey) {
      const panes = this.panes;
      for (let i = 0; i < panes.length; i++) {
        if (panes[i].key === targetKey) {
          const { path } = panes[i];
          panes.splice(i, 1);
          this.$bus.$emit("clearKeepAlive", path); // 清除缓存
          if (this.$route.path === `/${path}`) {
            // 想要删除的tab的path为当前路径,则切换router为前一个tab
            if (i === 0) {
              this.selectedKeys = [panes[i].key];
              this.$router.push(`/${panes[i].path}`);
              this.activeKey = panes[i].key;
            } else {
              this.selectedKeys = [panes[i - 1].key];
              this.$router.push(`/${panes[i - 1].path}`);
              this.activeKey = panes[i - 1].key;
            }
          }
          if (panes.length === 1) {
            panes[0].closable = false;
          }
          break;
        }
      }
    },
    handleChangeLink(url, key, type) {
      if (this.$route.path === `/${url}`) {
        // 跳转路由与当前路由相同
        return;
      } else {
        this.selectedKeys = [key];
        this.$router.push(`/${url}`);
      }
      if (type === "menu") {
        // 如果从左侧菜单点击跳转，则清除缓存
        this.$bus.$emit("clearKeepAlive", url);
      }
    },
    handleChangeTab(activeKey) {
      const panes = this.panes;
      let target = {};
      for (let i = 0; i < panes.length; i++) {
        if (panes[i].key === activeKey) {
          target = panes[i];
          break;
        }
      }
      const { path, key } = target;
      this.handleChangeLink(path, key, "tab");
    },
    handleOpenChange(openKeys) {
      this.openKeys = openKeys.slice(-1);
      this.openKeysCopy = this.openKeys;
    },
    handleUpdataTabs(url, title, selectKey, activeKey, fromUrl) {
      if (fromUrl === "") {
        return;
      }
      const panes = this.panes;
      this.selectedKeys = [selectKey];
      // 跳转路由与当前路由不同
      let flag = false; // 表示没有重复路由
      for (let i = 0; i < panes.length; i++) {
        if (title === panes[i].title) {
          // tabs中已经存在
          flag = true;
          this.activeKey = activeKey;
          break;
        }
      }
      if (!flag) {
        // tabs中不存在
        panes.push({
          title,
          key: activeKey,
          path: url,
          closable: true,
        });
        this.panes = panes;
        this.activeKey = activeKey;
      }
      if (panes.length > 1) {
        panes[0].closable = true;
      }
    },
    logout() {
      userLogout(this.userInfo.token);
      LocalStorage.removeItem("userInfo");
      LocalStorage.removeItem("userRights");
      this.setUserInfo({});
      // 重置用户权限
      this.setUserRights({
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
        rostersManage: true,
        rightsManage: true,
        organizationManage: true,
        root_mn_sm_user_query: true,
        root_mn_sm_roles_query: true,
        root_mn_sm_resource_query: true,
        pierceLogin: true,
      });
      this.$router.replace({
        name: "pierceLogin",
        params: {
          target: window.location.pathname,
        },
      });
    },
    async getResourceList() {
      const listData = await getResourceList({
        resCode: "",
        resName: "",
        menuName: "",
      });
      if (!listData) {
        this.$message.error("获取资源列表失败，请重新尝试");
      } else {
        let userRights = new Object();
        const list = listData.map((item) => {
          let children = null;
          userRights[item.resCode] = false;
          if (item.childResources) {
            const result = this.getChildResources(
              item.childResources,
              userRights
            );
            children = result.children;
            userRights = result.userRights;
          }
          return {
            key: item.id,
            isLeaf: false,
            title: item.resName,
            children,
            resName: item.resName,
            resCode: item.resCode,
          };
        });
        this.setResourceList(list);
        this.setUserBaseRights(userRights);
      }
    },
    getChildResources(list, userRights) {
      const arr = list.map((ele) => {
        let children = null;
        userRights[ele.resCode] = false;
        if (ele.childResources) {
          const result = this.getChildResources(ele.childResources, userRights);
          children = result.children;
          userRights = result.userRights;
        }
        return {
          key: ele.id,
          isLeaf:
            ele.childResources && ele.childResources.length ? false : true,
          title: ele.resName,
          children,
          resName: ele.resName,
          resCode: ele.resCode,
        };
      });
      return {
        children: arr,
        userRights: userRights,
      };
    },
    handleChangeTheme(value) {
      this.setTheme(value);
    },
    clearKeepAlive(fullUrl) {
      // 根据fullUrl清除keepAlive
      const target =
        this.$children[0].$children[0].$children[1].$children[0].$children[1]
          .$children[0];
      target.$children.forEach((item) => {
        if (
          item.$vnode.key == `/${fullUrl}` ||
          item.$vnode.data.key == `/${fullUrl}`
        ) {
          this.myDestory(item);
        }
      });
    },
    // 封装清除某个组件的keepAlive状态,并销毁
    myDestory(keepAliveComponent) {
      // 你可以根据自己的业务更改此处的判断逻辑，酌情决定是否摧毁本层缓存。
      if (
        keepAliveComponent.$vnode &&
        keepAliveComponent.$vnode.data.keepAlive
      ) {
        if (
          keepAliveComponent.$vnode.parent &&
          keepAliveComponent.$vnode.parent.componentInstance &&
          keepAliveComponent.$vnode.parent.componentInstance.cache
        ) {
          if (keepAliveComponent.$vnode.componentOptions) {
            let key =
              keepAliveComponent.$vnode.key == null
                ? keepAliveComponent.$vnode.componentOptions.Ctor.cid +
                  (keepAliveComponent.$vnode.componentOptions.tag
                    ? `::${keepAliveComponent.$vnode.componentOptions.tag}`
                    : "")
                : keepAliveComponent.$vnode.key;
            let cache =
              keepAliveComponent.$vnode.parent.componentInstance.cache;
            let keys = keepAliveComponent.$vnode.parent.componentInstance.keys;
            if (cache[key]) {
              if (keys.length) {
                let index = keys.indexOf(key);
                if (index > -1) {
                  keys.splice(index, 1);
                }
              }
              delete cache[key];
            }
          }
        }
      }
      keepAliveComponent.$destroy();
    },
    async getGraphList() {
      const graphList = await queryGraphList();
      const graphOptions = [];
      if (!graphList) {
        this.$message.error("获取可选图谱失败");
      } else {
        graphList.map((graph) => {
          graphOptions.push({
            label: graph.graphChName,
            value: graph.id,
            branchId: graph.branchId,
            schemaId: graph.schemaId,
            graphSource: graph.source,
          });
        });
        if (graphOptions.length) {
          this.setGraphId(graphOptions[0].value);
          this.setSchemaId(graphOptions[0].schemaId);
          this.setGraphSource(graphOptions[0].graphSource);
          sessionStorage.setItem("graphId", graphOptions[0].value);
          sessionStorage.setItem("schemaId", graphOptions[0].schemaId);
          sessionStorage.setItem("graphSource", graphOptions[0].graphSource);
        } else {
          this.$message.error("暂无可用图谱数据");
          this.setGraphId(undefined);
          this.setSchemaId(undefined);
          this.setGraphSource(undefined);
          sessionStorage.setItem("graphId", undefined);
          sessionStorage.setItem("schemaId", undefined);
          sessionStorage.setItem("graphSource", undefined);
        }
      }
    },
  },
};
</script>
<style lang="less">
// 悬浮菜单栏样式
.ant-menu-inline-collapsed-tooltip {
  .ant-tooltip-content {
    .ant-tooltip-arrow {
      &::before {
        background-color: @contentColor;
      }
    }

    .ant-tooltip-inner {
      display: flex;
      align-items: center;
      color: @primaryTextColor;
      background: @contentColor;

      .menu-icon {
        display: flex;
        margin-right: 5px;
        width: 14px;
        height: 14px;
      }
    }
  }
}

// 悬浮提示框样式
.ant-tooltip {
  max-width: 600px;
}

.user-info-part {
  .logout-btn {
    cursor: pointer;
  }
}

.pierce-layout {
  width: 100%;
  height: 100%;
  min-width: 1140px;

  @media screen and (max-width: 1440px) {
    .pierce-layout-header {
      height: 48px;

      &-right {
        height: 48px;

        .pierce-tabs {
          height: 36px;
          margin-top: 12px;
          padding-left: 24px;

          .ant-tabs-bar {
            .ant-tabs-nav-container {
              height: 36px;

              .ant-tabs-tab {
                height: 36px;
                line-height: 36px;

                &.ant-tabs-tab-active {
                  height: 36px;
                }
              }
            }
          }
        }
      }
    }
  }

  &-header {
    padding: 0;
    display: flex;
    align-items: center;
    transition: all 0.3s;
    height: 48px;
    box-shadow: 9px 0px 28px rgba(0, 0, 0, 0.05);
    z-index: 9;

    .logo {
      width: 160px;
      display: flex;
      height: 48px;
      padding: 0px 12px;
      transition: all 0.3s;
      background: @layoutHeaderColor;

      .pierce-logo {
        width: 100%;
        height: 100%;
        color: @logoColor;
      }
    }

    &-right {
      height: 48px;
      display: flex;
      transition: all 0.3s;
      justify-content: space-between;
      background-color: @layoutHeaderColor;
    }

    .user-info {
      margin-right: 50px;
      display: flex;
      align-items: center;

      .info-item {
        height: 20px;
        line-height: 18px;
        margin-right: 16px;
        display: inline-block;
        color: rgba(255, 255, 255, 0.85);

        &.time {
          min-width: 150px;
        }

        &.theme,
        &.message {
          width: 14px;
          cursor: pointer;
        }
      }

      &-content {
        cursor: pointer;
      }
    }

    .pierce-tabs {
      height: 36px;
      display: flex;
      margin-top: 12px;
      padding-left: 24px;
      align-items: center;
      max-width: calc(100% - 330px);

      .ant-tabs-bar {
        margin: 0;
        border: 0;
        width: 100%;
        margin-bottom: 1px;

        .ant-tabs-nav-container {
          height: 36px;

          .ant-tabs-nav-wrap {
            .ant-tabs-tab {
              background: none;
              color: rgba(255, 255, 255, 0.85);
              border-radius: 2px 2px 0 0;
              border-color: rgba(255, 255, 255, 0.2) !important;
              height: 36px;
              line-height: 36px;

              .anticon-close {
                color: rgba(255, 255, 255, 0.45);
              }

              &.ant-tabs-tab-active {
                height: 36px;
                text-shadow: none;
                color: @activeFontColor;
                background: #3a404d;
                border-bottom: 1px solid @layoutHeaderColor !important;
              }
            }
          }

          .ant-tabs-tab-prev,
          .ant-tabs-tab-next {
            color: rgba(255, 255, 255, 0.85);
          }
        }
      }
    }
  }

  &-content {
    position: relative;
    transition: all 0.3s;
    background-color: @mainBackgroundColor;

    &-left {
      transition: all 0.3s;
      background: @contentColor;
      color: @primaryTextColor;
      box-shadow: 9px 0px 28px rgba(0, 0, 0, 0.05);
      z-index: 8;

      .ant-menu {
        width: 100%;
        overflow-y: auto;
        box-shadow: none !important;
        max-height: calc(100% - 52px);
        background: @contentColor !important;

        .ant-menu-item {
          display: flex;
          align-items: center;
          transition: color 0.3s;
          color: @primaryTextColor;

          &:hover {
            background-color: @leftMenuBackgroundColor;
            color: @activeFontColor !important;

            .menu-icon {
              color: @activeFontColor !important;
            }
          }

          &.ant-menu-item-selected {
            background-color: @leftMenuBackgroundColor;
            color: @activeFontColor !important;

            // &::after {
            //   content: "";
            //   width: 3px;
            //   height: 100%;
            //   background: @blue;
            // }

            .menu-icon {
              color: @activeFontColor !important;
            }
          }

          .menu-icon {
            display: flex;
            margin-right: 10px;
            width: 14px;
            height: 14px;
            color: #595959;
          }
        }

        .ant-menu-submenu {
          color: @primaryTextColor;
          transition: color 0.3s;

          .ant-menu-submenu-active:hover {
            background-color: @leftMenuBackgroundColor;
          }

          &.ant-menu-submenu-selected {
            color: @activeFontColor !important;

            .menu-icon {
              color: @activeFontColor !important;
            }
          }

          .ant-menu-submenu-title {
            transition: color 0.3s;

            &:hover {
              color: @primaryTextColor;

              .menu-icon {
                color: @activeFontColor !important;
              }
            }

            .sub-menu-title {
              display: flex;
              align-items: center;

              .menu-icon {
                display: flex;
                margin-right: 10px;
                width: 14px;
                height: 14px;
                color: #595959;
              }
            }

            .ant-menu-submenu-arrow::before,
            .ant-menu-submenu-arrow::after {
              background: @primaryTextColor;
            }
          }

          .ant-menu-sub {
            overflow: hidden;

            .ant-menu-item {
              color: @primaryTextColor;
            }
          }
        }
      }

      .ant-menu-inline-collapsed {
        .ant-menu-item {
          padding: 0 20px !important;
          color: @primaryTextColor;

          .menu-text {
            max-width: 0;
            opacity: 0;
            display: inline-block;
          }
        }

        .ant-menu-submenu {
          color: @primaryTextColor;

          .ant-menu-submenu-title {
            padding: 0 20px !important;

            &:hover {
              color: @primaryTextColor !important;
            }

            .menu-text {
              max-width: 0;
              opacity: 0;
              display: inline-block;
            }
          }
        }
      }

      .menu-footer {
        left: 0;
        right: 0;
        bottom: 0;
        padding: 16px 12px 16px 16px;
        display: flex;
        position: absolute;
        align-items: center;
        justify-content: space-between;

        .footer-left {
          height: 20px;
          display: flex;

          &-img {
            width: 20px;
            height: 100%;
          }

          .footer-text {
            padding-left: 10px;
            color: @primaryTextColor;
          }
        }

        .footer-trigger {
          padding: 0 7px;
          font-size: 18px;
          cursor: pointer;
          transition: color 0.3s;
          color: @primaryTextColor;

          &:hover {
            color: @activeFontColor;
          }
        }
      }
    }

    &-right {
      min-width: 980px;
      transition: all 0.3s;
      padding: 24px;
      background: @mainBackgroundColor;
      min-height: 280px;
      position: relative;

      // .pierce-tabs {
      //   top: 0;
      //   left: 0;
      //   z-index: 10;
      //   height: 50px;
      //   display: flex;
      //   max-width: 100%;
      //   position: absolute;
      //   align-items: center;
      //   transition: all 0.3s;

      //   .ant-tabs-bar {
      //     margin: 0;
      //     border: 0;
      //     width: 100%;
      //     height: 30px;
      //     transition: all 0.3s;
      //     padding-left: 26px;

      //     .ant-tabs-nav-container {
      //       height: 30px;

      //       .ant-tabs-nav-wrap {
      //         .ant-tabs-tab {
      //           height: 30px;
      //           border-radius: 4px;
      //           line-height: 28px;
      //           font-size: 13px;
      //           color: @secondaryTextColor;

      //           &:hover {
      //             color: #40a9ff;
      //           }

      //           &.ant-tabs-tab-active {
      //             color: @activeFontColor;
      //             border-bottom: 1px solid #e8e8e8;
      //           }
      //         }
      //       }
      //     }
      //   }
      // }
    }
  }
}

.theme-popover {
  width: 90px;

  .ant-popover-inner-content {
    padding: 12px 6px;

    .theme-popover-item {
      cursor: pointer;
      text-align: center;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;

      &:hover {
        background: #f2f3f5;
      }

      .item-content {
        width: 46px;
        text-align: right;

        .anticon {
          margin-right: 8px;
          font-size: 10px;
        }

        .item-content-text {
          color: #1d2129;
        }
      }
    }
  }
}

.ant-menu-submenu-popup {
  background: @contentColor !important;

  .ant-menu {
    background: @contentColor !important;
    box-shadow: none !important;

    .ant-menu-item {
      color: @primaryTextColor;
      transition: color 0.3s;

      &:hover {
        background-color: @leftMenuBackgroundColor;
        color: @activeFontColor !important;
      }

      &.ant-menu-item-selected {
        background-color: @leftMenuBackgroundColor;
        color: @activeFontColor !important;

        &::after {
          content: "";
          width: 3px;
          height: 100%;
          background: @blue;
          transform: scaleY(1);
        }
      }
    }
  }
}
</style>
