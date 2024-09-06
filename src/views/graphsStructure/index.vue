<template>
  <div class="graphs-structure">
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: "GraphsStructure",
  data() {
    return {};
  },
  methods: {},
};
</script>
<style lang="less" scoped>
.graphs-structure {
  height: 100%;
  width: 100%;
  overflow: auto;
}
</style>
