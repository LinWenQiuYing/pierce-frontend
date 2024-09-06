<template>
  <div class="blueprint-manage">
    <List
      v-if="!isDetailsShow"
      ref="list"
      @detailsChanged="detailsChanged"
      @isDetailsShowChanged="isDetailsShowChanged"
    />
    <Details
      v-if="isDetailsShow"
      :details="details"
      ref="details"
      :detailsType="detailsType"
      @isDetailsShowChanged="isDetailsShowChanged"
    />
  </div>
</template>
<script>
import List from "./list";
import Details from "./details";

export default {
  name: "BlueprintManage",
  data() {
    return {
      details: {},
      isDetailsShow: false,
      detailsType: undefined,
    };
  },
  components: {
    Details,
    List,
  },
  mounted() {},
  methods: {
    isDetailsShowChanged(value, type, isSearch) {
      this.detailsType = type;
      this.isDetailsShow = value;
      if (value) {
        this.$nextTick(() => {
          this.$refs.details.getDataBase();
        });
      }
      if (isSearch) {
        this.$nextTick(() => {
          this.$refs.list.onReset();
        });
      }
    },
    detailsChanged(value) {
      this.details = value;
    },
  },
};
</script>
<style lang="less">
.blueprint-manage {
  height: 100%;

  .table-list-top-item {
    width: calc((100% - 96px) / 4);
  }
}
</style>
