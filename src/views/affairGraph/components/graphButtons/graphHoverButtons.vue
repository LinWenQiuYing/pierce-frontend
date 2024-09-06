<template>
  <div class="graph-hover-buttons">
    <div
      v-for="button in topHoverButtons"
      :key="button.title"
      class="graph-hover-item"
      @click="showModal(button.title, button.type)"
      @mouseenter="onMouse(button.title, 'enter')"
      @mouseleave="onMouse(button.title, 'leave')"
    >
      <div class="graph-hover-button" v-if="userRights[`btn_${button.type}`]">
        <span
          class="graph-hover-button-title"
          :style="{ display: button.isHover ? 'inline-block' : 'none' }"
        >
          {{ button.title }}
        </span>
        <span
          class="graph-hover-button-icon"
          :style="{
            backgroundColor: button.isClick
              ? '#1890ff'
              : button.isHover
              ? '#1890ff'
              : '#fff',
          }"
        >
          <img
            :src="
              button.isClick
                ? button.activeIcon
                : button.isHover
                ? button.activeIcon
                : button.icon
            "
            alt=""
          />
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";

export default {
  name: "GraphHoverButtons",
  props: ["selectedNodes", "entitySearchOption"],
  data() {
    return {
      topHoverButtons: [
        {
          title: "场景查询",
          icon: require("@/assets/images/img/scene_search.png"),
          activeIcon: require("@/assets/images/img/scene_search_active.png"),
          type: "sceneSearch",
          isHover: false,
          isClick: false,
        },
        {
          title: "线索检测",
          icon: require("@/assets/images/img/risk_check.png"),
          activeIcon: require("@/assets/images/img/risk_check_active.png"),
          type: "riskCheck",
          isHover: false,
          isClick: false,
        },
        {
          title: "子图筛选",
          icon: require("@/assets/images/img/sift.png"),
          activeIcon: require("@/assets/images/img/sift_active.png"),
          type: "siftEdge",
          isHover: false,
          isClick: false,
        },
        {
          title: "社群发现",
          icon: require("@/assets/images/img/group_found.png"),
          activeIcon: require("@/assets/images/img/group_found_active.png"),
          type: "groupFound",
          isHover: false,
          isClick: false,
        },
      ],
    };
  },
  computed: {
    ...mapState("rightsOptions", ["userRights"]),
  },
  components: {},
  methods: {
    showModal(title, type) {
      switch (type) {
        case "riskCheck":
          if (this.selectedNodes.length) {
            if (this.selectedNodes.length > 1) {
              this.$message.error("请只选择一个企业或者个人节点");
            } else {
              if (
                this.selectedNodes[0].nodeType === "企业" ||
                this.selectedNodes[0].nodeType === "个人"
              ) {
                this.$emit("isShowRiskCheckChanged", true);
              } else {
                this.$message.error("请选择一个企业或者个人节点");
              }
            }
          } else {
            // this.$emit("isShowRiskCheckChanged", true);
            this.$message.error("请先选择一个企业或者个人节点");
          }
          break;
        case "siftEdge":
          this.$emit("isShowSiftEdgeChanged", true);
          break;
        case "groupFound":
          this.$emit("isShowGroupFoundChanged", true);
          break;
        case "sceneSearch":
          if (this.entitySearchOption.length) {
            this.$emit("isShowSceneSearchChanged", true);
          } else {
            this.$message.error("获取图谱数据中，请稍后重试", 1);
          }
          break;
        default:
          break;
      }
      for (let i = 0; i < this.topHoverButtons.length; i++) {
        const element = this.topHoverButtons[i];
        if (title === element.title) {
          element.isClick = true;
        } else {
          element.isClick = false;
        }
      }
    },
    onMouse(title, type) {
      for (let i = 0; i < this.topHoverButtons.length; i++) {
        const element = this.topHoverButtons[i];
        if (title === element.title) {
          element.isHover = type === "enter" ? true : false;
        } else {
          element.isHover = false;
        }
      }
    },
  },
};
</script>
<style lang="less" scoped>
.graph-hover-buttons {
  left: 24px;
  top: 59px;
  display: flex;
  position: absolute;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  .graph-hover-button {
    width: 32px;
    height: 32px;
    display: flex;
    font-size: 22px;
    cursor: pointer;
    overflow: hidden;
    color: #485378;
    border-radius: 3px;
    background: #fff;
    margin-bottom: 10px;
    align-items: center;
    transition: width 0.2s;
    box-shadow: 2px 4px 8px 0 rgba(193, 212, 235, 0.5);

    &-icon {
      width: 32px;
      height: 32px;
      padding: 2px;
      display: flex;
      color: #7e88ab;
      align-items: center;
      justify-content: center;

      img {
        width: 28px;
      }
    }

    &-title {
      display: none;
      font-size: 12px;
      overflow: hidden;
      text-align: center;
      white-space: nowrap;
      width: calc(100% - 32px);
    }

    &:hover {
      width: 100px;
      transition: width 0.2s;

      .pierce-hover-button-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      span {
        display: flex;
      }
    }
  }
}
</style>
