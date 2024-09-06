<template>
  <div class="mvp-card risk-overview-recognize">
    <h2>当日异常识别</h2>
    <div class="mvp-card-content">
      <table-component
        :columns="columns"
        :dataSource="data"
        :rowKey="(record) => record.id"
        :pagination="pagination"
        :scroll="{ x: 'max-content', y: 'calc(100% - 59px)' }"
      >
        <div slot="actions" slot-scope="record">
          <a
            @click="
              (e) => {
                handleCheck(e, record);
              }
            "
            >查看详情</a
          >
        </div>
      </table-component>
    </div>
  </div>
</template>
<script>
import TableComponent from "@/components/tableComponent";

export default {
  name: "RiskRecognize",
  props: ["data"],
  data() {
    return {
      columns: [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          width: 60,
        },
        {
          title: "线索类别",
          dataIndex: "errorClass",
          key: "errorClass",
          width: 89,
        },
        {
          title: "涉及企业",
          dataIndex: "enterpriseNum",
          key: "enterpriseNum",
          width: 90,
        },
        {
          title: "涉及个人",
          dataIndex: "personNum",
          key: "personNum",
          width: 90,
        },
        {
          title: "操作",
          key: "actions",
          dataIndex: "actions",
          width: 90,
          scopedSlots: { customRender: "actions" },
        },
      ],
      pagination: {
        size: "small",
        current: 1,
        pageSize: 5,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ["5", "10", "15", "20"],
        showTotal: (total, current) => {
          return `共${total}条记录，当前第${Math.ceil(
            current[0] / this.pagination.pageSize
          )}页`;
        },
        onChange: (page, pageSize) => {
          this.pagination.current = page;
          this.pagination.pageSize = pageSize;
        },
        onShowSizeChange: (current, size) => {
          this.pagination.current = current;
          this.pagination.pageSize = size;
        },
      },
    };
  },
  components: {
    TableComponent,
  },
  methods: {
    handleCheck(e, record) {
      e.stopPropagation();
      e.preventDefault();
      this.$router.push({
        name: "riskWarningInfo",
        params: {
          errorType: record.errorClass,
        },
      });
    },
  },
};
</script>
<style lang="less">
.risk-overview-recognize {
  height: 100%;
}
</style>
