<template>
  <div class="top-tool-bar">
    <div class="top-tool-bar-right">
      <div class="canvas-tool-items">
        <label class="layout-title">布局样式：</label>
        <a-select
          class="layout-select"
          :value="layoutKey"
          @select="changeLayout"
          dropdown-class-name="global-selectOption"
        >
          <a-select-option
            v-for="item in layoutOptions"
            :key="item.key"
            :title="item.value"
            :value="item.value"
          >
            {{ item.key }}({{ item.value }})
          </a-select-option>
        </a-select>
      </div>
      <div class="canvas-tool-items" @click="handleFit">
        <a-icon type="fullscreen" />
        <span class="canvas-tool-label">适合屏幕</span>
      </div>
      <div class="canvas-tool-items">
        <label class="layout-title">
          {{ `${Math.round(canvasRatio * 100)}%` }}
        </label>
      </div>
    </div>
  </div>
</template>
<script>
import useCiseLayout from "@/utils/useCiseLayout.js";
import { CYTO_FIT_PADDING } from "@/utils/graph.js";
import { mapState, mapMutations } from "vuex";

export default {
  name: "TopToolbar",
  data() {
    return {
      layoutOptions: [
        {
          key: "环形弹簧内置布局",
          value: "cise",
        },
        {
          key: "广度优先布局",
          value: "breadthfirst",
        },
        {
          key: "网格布局",
          value: "grid",
        },
        {
          key: "有向无环图树布局",
          value: "dagre",
        },
        {
          key: "环形布局",
          value: "circle",
        },
        {
          key: "同心圆布局",
          value: "concentric",
        },
        {
          key: "复合弹簧内置布局",
          value: "cose",
        },
        {
          key: "约束布局",
          value: "cola",
        },
        {
          key: "随机布局",
          value: "random",
        },
      ],
      canvasRatio: 1,
    };
  },
  computed: {
    ...mapState("graphOptions", ["searchVertex", "layoutKey"]),
  },
  mounted() {
    if (this.$graph) {
      this.$graph.events.on("onZoom", this.onZoom);
    }
  },
  components: {},
  methods: {
    ...mapMutations("graphOptions", {
      setLayoutKey: "setLayoutKey",
    }),
    changeLayout(value) {
      this.setLayoutKey(value);
      this.$emit("isCloseGraphDetail", true);
      this.$emit("isCloseGraphMenu", true);
      this.$emit("canvasLoadingChanged", { loading: true, tip: "正在布局..." });
      setTimeout(() => {
        value === "cise"
          ? useCiseLayout(this.$graph, this.searchVertex)
          : this.$graph.events.changeLayout(value);
        this.$emit("canvasLoadingChanged", { loading: false, tip: "布局完成" });
        this.handleFit();
      }, 100);
    },
    handleFit() {
      this.$graph.cy.animate({
        fit: CYTO_FIT_PADDING,
        duration: 200,
      });
      this.$emit("isCloseGraphDetail", true);
      this.$emit("isCloseGraphMenu", true);
    },
    onZoom(value) {
      if (value) {
        this.canvasRatio = value;
      }
    },
    initLayoutKey() {
      this.setLayoutKey("breadthfirst");
    },
  },
};
</script>
<style lang="less" scoped>
.top-tool-bar {
  top: 12px;
  left: 0;
  right: 0;
  width: 100%;
  height: 40px;
  display: flex;
  font-size: 14px;
  position: absolute;
  padding-left: 20px;
  align-items: center;
  border-radius: 10px;
  justify-content: flex-end;

  &-left {
    align-items: center;
    color: #485378;
    display: flex;
    flex: 1;
    justify-content: flex-start;

    .return-btn {
      cursor: pointer;
    }
  }

  &-right {
    align-items: center;
    display: flex;
    justify-content: flex-end;
    padding-right: 24px;

    .canvas-tool-items {
      align-items: center;
      color: #485378;
      display: flex;
      height: 28px;
      cursor: pointer;

      &:not(:last-child) {
        margin-right: 25px;
      }

      .layout-title {
        color: #9da9c2;
      }

      .layout-select {
        width: 240px;
        margin-left: 0;
        color: #c5c8ce;
      }

      .canvas-tool-label {
        font-size: 14px;
        color: #9da9c2;
        user-select: none;
        padding-left: 10px;
      }
    }
  }
}
</style>
