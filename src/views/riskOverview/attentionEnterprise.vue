<template>
  <div class="risk-overview-attention mvp-card">
    <h2>重点关注企业</h2>
    <div class="mvp-card-content">
      <table-component
        :columns="columns"
        :dataSource="data"
        :rowKey="(record) => record.id"
        :pagination="pagination"
        :scroll="{ x: 'max-content', y: 'calc(100% - 59px)' }"
      >
        <div slot="guar" slot-scope="record">
          {{ record.guar ? "是" : "否" }}
        </div>
        <div slot="fund" slot-scope="record">
          {{ record.fund ? "是" : "否" }}
        </div>
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
  name: "AttentionEnterprise",
  props: ["data"],
  data() {
    return {
      columns: [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          width: 61,
        },
        {
          title: "企业名称",
          dataIndex: "enterpriseName",
          key: "enterpriseName",
          width: 111,
        },
        {
          title: "担保",
          dataIndex: "isGuaranteeError",
          key: "isGuaranteeError",
          scopedSlots: { customRender: "guar" },
          width: 66,
        },
        {
          title: "资金流向",
          dataIndex: "isFundError",
          key: "isFundError",
          scopedSlots: { customRender: "fund" },
          width: 91,
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
        name: "enterpriseInsight",
        params: {
          entName: record.enterpriseName,
        },
      });
    },
  },
};
</script>
<style lang="less">
.risk-overview-attention {
  height: 100%;
}
</style>
