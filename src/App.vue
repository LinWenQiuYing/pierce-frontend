<template>
  <div id="app">
    <a-config-provider :locale="locale">
      <router-view></router-view>
    </a-config-provider>
  </div>
</template>

<script>
import Vue from "vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import {
  Checkbox,
  ConfigProvider,
  Drawer,
  Empty,
  Icon,
  Modal,
  Select,
  Table,
} from "ant-design-vue";
import { mapState, mapMutations } from "vuex";
// 粒子特效
import VueParticles from "vue-particles";

const { Option } = Select;

Vue.use(Checkbox);
Vue.use(Drawer);
Vue.use(Empty);
Vue.use(Icon);
Vue.use(Modal);
Vue.use(Option);
Vue.use(Select);
Vue.use(Table);
Vue.use(VueParticles);

export default {
  name: "App",
  computed: {
    ...mapState("rightsOptions", ["userInfo", "theme"]),
  },
  data() {
    return {
      locale: zhCN,
    };
  },
  components: {
    AConfigProvider: ConfigProvider,
  },
  mounted() {
    this.initTheme();
  },
  methods: {
    ...mapMutations("rightsOptions", {
      setTheme: "setTheme",
    }),
    initTheme() {
      const theme = localStorage.getItem("theme") || "light";
      this.setTheme(theme);
    },
  },
};
</script>
<style lang="less">
@import "./assets/theme/index.less";
</style>
