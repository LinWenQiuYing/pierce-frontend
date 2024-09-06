<template>
  <div class="risk-warning">
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: "RiskWarning",
  data() {
    return {};
  },
  methods: {},
};
</script>
<style lang="less" scoped>
.risk-warning {
  height: 100%;
  width: 100%;
}
</style>
