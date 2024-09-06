import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import { router } from "./router";
import store from "./store";
import cise from "cytoscape-cise";
import KGraph from "@sophon/kgraph";
import plugins from "./plugins";
import IconSvg from "@/components/IconSvg";
import doitUIWeb from "doit-ui-web";
import "doit-ui-web/lib/doituiweb.css";

// 导入图片预加载方法以及图片列表
import { imgsPreloader } from "./utils/imgPreloader.js";
import imgPreloaderList from "./utils/imgPreloaderList.js";

Vue.config.productionTip = false;

document.title = "Transwarp Pierce";

KGraph.registerStyle("node", {
  "background-fit": ["none", "none"],
  "background-image": "data(backgroundImage)",
  "background-position-x": ["50%", "50%"],
  "background-position-y": ["50%", "100%"],
});
KGraph.extend(cise);

Vue.use(plugins);
Vue.use(doitUIWeb);

// 注册到全局组件
Vue.component("icon-svg", IconSvg);

// 将./svg下不包括子目录的所有后缀名.svg的文件赋值给变量req
const requireContext = require.context("./assets/images/svg", false, /\.svg$/);
// 函数 全部导入
const importAll = (r) => r.keys().map(r);

importAll(requireContext);

// new Vue({
//   router,
//   store,
//   render: (h) => h(App),
// }).$mount("#app");

(async () => {
  await imgsPreloader(imgPreloaderList);
  //关闭加载弹框
  document.querySelector(".app-loading").style.display = "none";
  new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount("#app");
})();
