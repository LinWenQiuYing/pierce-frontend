<template>
  <div class="person-table">
    <div class="person-table-content">
      <div
        class="person-table-content-item"
        v-for="item in tableData"
        :key="item.title"
      >
        <div class="item-header" v-if="item.value.length">
          {{ item.title }}
        </div>
        <table-component
          v-if="item.type === 'table' && item.value.length"
          :columns="item.columns"
          :data-source="item.value"
          :rowKey="(record) => record.id"
          :pagination="false"
        >
        </table-component>
        <div
          v-if="item.type === 'tab' && item.value.length"
          class="person-tabs"
        >
          <div v-for="cell in item.value" :key="cell.text" class="person-tab">
            {{ cell.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import TableComponent from "@/components/tableComponent";

export default {
  name: "PersonTable",
  props: ["tableData"],
  data() {
    return {};
  },
  components: {
    TableComponent,
  },
  methods: {},
};
</script>
<style lang="less" scoped>
.person-table {
  padding-bottom: 50px;

  &-content {
    &-item {
      .item-header {
        color: @activeFontColor;
        padding: 10px 0;
      }

      .ant-table-wrapper {
        padding-top: 0 !important;
      }

      .person-tabs {
        display: flex;

        .person-tab {
          height: 40px;
          padding: 0 16px;
          line-height: 40px;
          text-align: center;
          margin-right: 16px;
          border-radius: 5px;
          border: 1px solid #eee;
          color: rgba(0, 0, 0, 0.65);
          box-shadow: 0px 0px 5px rgba(0, 0, 0, 10%);
        }
      }
    }
  }
}
</style>
