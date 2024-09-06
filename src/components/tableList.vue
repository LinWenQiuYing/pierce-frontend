<template>
  <div :class="[listClass, 'table-list']" ref="tableList">
    <div class="table-list-top" :style="{ height: isFold ? '80px' : '128px' }">
      <slot
        name="searchOptions"
        :isFold="isFold"
        :handleFold="handleFold"
      ></slot>
    </div>

    <div
      class="table-list-bottom"
      :style="{ height: isFold ? 'calc(100% - 104px)' : 'calc(100% - 152px)' }"
    >
      <div class="bottom-header">
        <span class="bottom-header-title">{{ tableTitle }}</span>
        <div class="bottom-header-btns">
          <slot name="tableBtns"></slot>
        </div>
      </div>
      <table-component
        :columns="columns"
        :data-source="tableValue"
        :rowKey="rowKey"
        :pagination="pagination"
        :loading="tableLoading"
        :class="[tableClass, 'bottom-table']"
        :rowSelection="rowSelection"
        :scroll="{ x: 'max-content', y: `${tableHeight}px` }"
      >
        <!-- 其他表格columns里的slot尽量写在columns里，因为actions比较复杂，并且重复率高，故单独拿出来 -->
        <span slot="actions" slot-scope="record">
          <slot name="actionsSlot" :record="record"></slot>
        </span>
      </table-component>
    </div>
    <slot name="otherPart"></slot>
  </div>
</template>
<script>
import TableComponent from "./tableComponent";
import { mapState } from "vuex";

export default {
  name: "TableList",
  props: {
    // 当前组件的类名
    listClass: {
      type: String,
      default: () => "",
    },
    // 表格类名
    tableClass: {
      type: String,
      default: () => "",
    },
    tableTitle: {
      type: String,
      default: () => "",
    },
    columns: {
      type: Array,
      default: () => [],
    },
    tableValue: {
      type: Array,
      default: () => [],
    },
    tableLoading: {
      type: Boolean,
      default: () => false,
    },
    rowKey: {
      type: [String, Function],
      default: () => (record) => record.key,
    },
    pagination: {
      type: Object,
      default: () => ({
        size: "small",
        total: 0,
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ["5", "10", "15", "20"],
      }),
    },
    rowSelection: {
      type: Object,
      default: () => null,
    },
    isDefaultFold: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      isFold: false,
      tableHeight: 0,
      clientHeight: 0,
    };
  },
  computed: {
    ...mapState("rightsOptions", ["userRights"]),
  },
  components: {
    TableComponent,
  },
  mounted() {
    if (this.isDefaultFold) {
      this.isFold = this.isDefaultFold;
    }
    setTimeout(() => {
      const that = this;
      that.clientHeight = that.$refs.tableList.clientHeight;
      that.tableHeight = that.clientHeight - 349;
      window.onresize = () => {
        that.clientHeight = that.$refs.tableList.clientHeight;
      };
    }, 100);
  },
  watch: {
    isFold(newValue) {
      this.isFold = newValue;
      if (this.isFold) {
        this.tableHeight = this.clientHeight - 301;
      } else {
        this.tableHeight = this.clientHeight - 349;
      }
    },
    clientHeight(newValue) {
      this.clientHeight = newValue;
      if (this.isFold) {
        this.tableHeight = this.clientHeight - 301;
      } else {
        this.tableHeight = this.clientHeight - 349;
      }
    },
  },
  methods: {
    handleFold() {
      this.isFold = !this.isFold;
    },
  },
};
</script>
<style lang="less">
.table-list {
  height: 100%;

  &-top {
    padding: 24px 24px 8px;
    display: flex;
    flex-wrap: wrap;
    background: #fff;
    margin-bottom: 24px;
    transition: all 0.3s;
    justify-content: space-between;

    &-item {
      display: flex;
      margin-bottom: 16px;
      align-items: center;
      justify-content: flex-start;
      width: calc((100% - 64px) / 3); // 默认一行三个，可添加覆盖样式

      &:last-child {
        justify-content: flex-end;
      }

      &-label {
        width: 75px;
      }

      &-input {
        // max-width: 400px;
        width: calc(100% - 75px);

        .ant-input {
          padding-right: 30px;
        }
      }

      .fold-btn {
        border: 0 !important;
        color: #1890ff;
        padding: 0;

        &::after {
          content: none;
        }
      }

      .ant-btn {
        &:not(:last-child) {
          margin-right: 10px;
        }
      }
    }
  }

  &-bottom {
    background: #fff;
    transition: all 0.3s;

    .bottom-header {
      height: 54px;
      display: flex;
      padding: 0 24px;
      line-height: 54px;
      align-items: center;
      margin-bottom: 24px;
      justify-content: space-between;
      border-bottom: 1px solid #d9d9d9;

      &-title {
        font-size: 16px;
        font-weight: 600;
        color: @primaryTextColor;
      }

      .ant-btn {
        &:not(:last-child) {
          margin-right: 8px;
        }
      }
    }

    .bottom-table {
      padding: 0 24px;
      height: calc(100% - 78px);
    }
  }
}
</style>
