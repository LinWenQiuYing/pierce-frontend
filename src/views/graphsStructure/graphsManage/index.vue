<template>
  <div class="graph-manage">
    <List
      v-if="!isCreateShow"
      ref="graphList"
      @isCreateShowChanged="isCreateShowChanged"
    />
    <create-graph
      v-if="isCreateShow"
      @isCreateShowChanged="isCreateShowChanged"
    />
  </div>
</template>
<script>
import List from "./list";
import CreateGraph from "./createGraph";

export default {
  name: "GraphsManage",
  data() {
    return {
      isCreateShow: false,
    };
  },
  components: {
    CreateGraph,
    List,
  },
  methods: {
    isCreateShowChanged(value, isSearch) {
      this.isCreateShow = value;
      if (isSearch) {
        this.$refs.graphList.onReset();
      }
    },
  },
};
</script>
<style lang="less">
.graph-manage {
  height: 100%;

  .table-list-top-item {
    width: calc((100% - 96px) / 4);
  }
}
</style>
