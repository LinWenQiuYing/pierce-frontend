<template>
  <svg
    :class="svgClass"
    :style="{ fill: iconColor }"
    aria-hidden="true"
    @click="handleClick"
  >
    <use :xlink:href="iconName" />
  </svg>
</template>

<script>
export default {
  name: "IconSvg",
  props: {
    iconClass: {
      type: String,
      required: true,
    },
    color: {
      type: String,
    },
    className: {
      type: String,
      default: "",
    },
  },
  watch: {},
  computed: {
    iconName() {
      return `#icon-${this.iconClass}`;
    },
    svgClass() {
      return this.className ? this.className : "svg-icon";
    },
    iconColor() {
      if (this.color) {
        return this.color;
      } else {
        return "";
      }
    },
  },
  mounted() {},
  methods: {
    handleClick() {
      this.$emit("click");
    },
  },
};
</script>

<style lang="less" scoped>
.svg-icon {
  width: 100%;
  height: 100%;
  vertical-align: middle;
  fill: currentColor;
  overflow: hidden;

  &:focus {
    outline: none;
  }
}
</style>
