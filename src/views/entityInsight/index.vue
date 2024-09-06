<template>
  <div class="entity-insight">
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: "EntityInsight",
  data() {
    return {};
  },
  mounted() {},
  methods: {},
};
</script>
<style lang="less" scoped>
.entity-insight {
  width: 100%;
  height: 100%;
  overflow: auto;
  border-radius: 5px;
}
</style>
