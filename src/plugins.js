import * as echarts from "echarts";
import { message, Modal } from "ant-design-vue";
import bus from "./utils/bus";

export default {
  install(Vue) {
    Vue.prototype.$echarts = echarts;
    Vue.prototype.$message = message;
    Vue.prototype.$confirm = Modal.confirm;
    Vue.prototype.$bus = bus;
  },
};
