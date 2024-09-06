<template>
  <a-modal
    :class="[modalClass, simpleClass]"
    :visible="visible"
    v-bind="$props"
    :footer="footer"
    :bodyStyle="{
      padding: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="ant-modal-body" :style="bodyStyle" ref="antdBody">
      <slot></slot>
    </div>
  </a-modal>
</template>
<script>
import props from "./modalProps.js";

export default {
  name: "DragModal",
  mixins: [props],
  props: {
    //容器的类名
    modalClass: {
      type: String,
      default: () => {
        return "modal-box";
      },
    },
    visible: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    title: {
      type: String,
      default: () => {
        return null;
      },
    },
    width: {
      type: [String, Number],
      default: () => {
        return "50%";
      },
    },
    footer: {
      type: Boolean,
      default: () => {
        return undefined;
      },
    },
  },
  data() {
    return {
      mouseDownX: 0,
      mouseDownY: 0,
      deltaX: 0,
      deltaY: 0,
      sumX: 0,
      sumY: 0,
      header: null,
      contain: null,
      modalContent: null,
      onmousedown: false,
      bodyWidth: this.width,
      bodyHeight: 400,
    };
  },
  computed: {
    simpleClass() {
      return Math.random().toString(36).substring(2);
    },
  },
  watch: {
    visible() {
      this.$nextTick(() => {
        this.initialEvent(this.visible);
        this.bodyWidth = this.width;
        this.bodyHeight = 400;
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initialEvent(this.visible);
    });
  },
  created() {},
  beforeDestory() {
    this.removeMove();
    window.removeEventListener("mouseup", this.removeUp, false);
  },
  methods: {
    handleOk(e) {
      this.resetNum();
      this.$emit("ok", e);
    },
    handleCancel(e) {
      this.resetNum();
      this.$emit("cancel", e);
    },
    resetNum() {
      this.mouseDownX = 0;
      this.mouseDownY = 0;
      this.deltaX = 0;
      this.deltaY = 0;
      this.sumX = 0;
      this.sumY = 0;
    },
    handleMove(event) {
      const delta1X = event.pageX - this.mouseDownX;
      const delta1Y = event.pageY - this.mouseDownY;
      this.deltaX = delta1X;
      this.deltaY = delta1Y;
      this.modalContent.style.transform = `translate(${delta1X + this.sumX}px,${
        this.deltaY + this.sumY
      }px)`;
    },
    initialEvent(visible) {
      // pageX, pageY鼠标的位置， layerX, layerY元素相对于父元素的当前鼠标位置
      if (visible) {
        setTimeout(() => {
          window.removeEventListener("mouseup", this.removeUp, false);
          this.contain = document.getElementsByClassName(this.simpleClass)[0];
          this.header =
            this.contain.getElementsByClassName("ant-modal-header")[0];
          this.modalContent =
            this.contain.getElementsByClassName("ant-modal-content")[0];
          this.modalContent.style.left = 0;
          this.modalContent.style.transform = "translate(0px,0px)";
          this.header.style.cursor = "move";
          this.header.onmousedown = (e) => {
            this.onmousedown = true;
            this.mouseDownX = e.pageX;
            this.mouseDownY = e.pageY;
            document.body.onselectstart = () => false;
            window.addEventListener("mousemove", this.handleMove, false);
          };
          window.addEventListener("mouseup", this.removeUp, false);

          this.modalContent.onmouseup = (e) => {
            const onresize =
              e.target === this.modalContent
                ? 0
                : e.target === this.$refs.antdBody
                ? 1
                : 2;
            if (onresize === 0) {
              const ratio = e.offsetX / (e.offsetY - 55);
              if (ratio >= 1.472) {
                this.$refs.antdBody.style.height = e.offsetY - 55 + "px";
                this.$refs.antdBody.style.width =
                  (e.offsetY - 55) * 1.472 + "px";
              } else {
                this.$refs.antdBody.style.width = e.offsetX + "px";
                this.$refs.antdBody.style.height = e.offsetX / 1.472 + "px";
              }
              this.bodyWidth = parseFloat(
                this.$refs.antdBody.style.width.slice(0, -2)
              );
              this.bodyHeight = parseFloat(
                this.$refs.antdBody.style.height.slice(0, -2)
              );
            } else if (onresize === 1) {
              const ratio = e.offsetX / e.offsetY;
              if (ratio >= 1.472) {
                this.$refs.antdBody.style.height = e.offsetY + "px";
                this.$refs.antdBody.style.width = e.offsetY * 1.472 + "px";
              } else {
                this.$refs.antdBody.style.width = e.offsetX + "px";
                this.$refs.antdBody.style.height = e.offsetX / 1.472 + "px";
              }
              this.bodyWidth = parseFloat(
                this.$refs.antdBody.style.width.slice(0, -2)
              );
              this.bodyHeight = parseFloat(
                this.$refs.antdBody.style.height.slice(0, -2)
              );
            }
          };
        }, 0);
      }
    },
    removeMove() {
      window.removeEventListener("mousemove", this.handleMove, false);
    },
    removeUp(e) {
      document.body.onselectstart = () => true;
      if (
        this.onmousedown &&
        !(e.pageX === this.mouseDownX && e.pageY === this.mouseDownY)
      ) {
        this.onmousedown = false;
        this.sumX = this.sumX + this.deltaX;
        this.sumY = this.sumY + this.deltaY;
      }
      this.removeMove();
    },
  },
};
</script>
<style lang="less" scoped></style>
