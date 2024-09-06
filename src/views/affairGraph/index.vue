<template>
  <div class="affair-graph">
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: "AffairGraph",
  data() {
    return {};
  },
  methods: {},
};
</script>
<style lang="less" scoped>
.affair-graph {
  width: 100%;
  height: 100%;
  display: flex;
  border-radius: 5px;
  justify-content: center;
  background: @contentColor;
}
</style>
