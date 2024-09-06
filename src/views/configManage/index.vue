<template>
  <div class="config-manage" id="config-manage">
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: "ConfigManage",
  data() {
    return {};
  },
  methods: {},
};
</script>
<style lang="less" scoped>
.config-manage {
  height: 100%;
  width: 100%;
  overflow: auto;
}
</style>
