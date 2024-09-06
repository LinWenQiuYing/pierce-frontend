<template>
  <div class="foreign-invest-table">
    <a-table
      :columns="columns"
      :data-source="tableValue"
      size="small"
      :pagination="pagination"
      :rowKey="(record) => record.index"
      :scroll="{ x: 'max-content', y: 'calc(100% - 39px)' }"
      :bordered="false"
    >
      <span slot="actions" slot-scope="text">
        <div :class="text === '存续' ? 'green' : 'red'">{{ text }}</div>
      </span>
      <div slot="name" slot-scope="name">
        <div class="company-name">
          <div class="company-name-img">{{ name[0] }}</div>
          <div class="company-name-text">
            <p>{{ name[1] }}</p>
            <div>股权结构 ></div>
          </div>
        </div>
      </div>
      <div slot="legalRepresent" slot-scope="name">
        <div class="company-name">
          <a-avatar icon="user" />
          <div class="company-name-text">
            <p>{{ name[0] }}</p>
            <div>{{ name[1] }} ></div>
          </div>
        </div>
      </div>
    </a-table>
  </div>
</template>

<script>
import { Avatar } from "ant-design-vue";
export default {
  name: "ForeignInvest",
  props: ["investData", "pathData"],
  data() {
    return {
      columns: [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          width: 45,
        },
        {
          title: "被投资企业名称",
          dataIndex: "name",
          key: "name",
          scopedSlots: { customRender: "name" },
          width: 220,
        },
        {
          title: "法人代表",
          dataIndex: "legalRepresent",
          key: "legalRepresent",
          scopedSlots: { customRender: "legalRepresent" },
          width: 130,
        },
        {
          title: "注册资本",
          dataIndex: "registerCap",
          key: "registerCap",
          width: 95,
          sorter: (a, b) => a.registerCap - b.registerCap,
        },
        {
          title: "投资比例",
          dataIndex: "investRatio",
          key: "investRatio",
          width: 80,
        },
        {
          title: "投资数额",
          dataIndex: "investAmount",
          key: "investAmount",
          width: 95,
          sorter: (a, b) => a.investAmount - b.investAmount,
        },
        {
          title: "成立日期",
          dataIndex: "establishDate",
          key: "establishDate",
          width: 102,
        },
        {
          title: "状态",
          dataIndex: "actions",
          key: "actions",
          width: 45,
          scopedSlots: { customRender: "actions" },
        },
      ],
      tableValue: [
        {
          index: 1,
          name: ["智慧云", "南京智慧云人工智能科技有限公司"],
          legalRepresent: ["王海波", "任职9家企业"],
          registerCap: "200万",
          investRatio: "100%",
          investAmount: "200万",
          establishDate: "2021-09-11",
          actions: "存续",
        },
        {
          index: 2,
          name: ["九数云章", "南京九数云章信息科技有限公司"],
          legalRepresent: ["王海波", "任职9家企业"],
          registerCap: "2000万",
          investRatio: "98.234%",
          investAmount: "2000万",
          establishDate: "2021-09-11",
          actions: "存续",
        },
        {
          index: 3,
          name: ["智云兴禾", "南京智云兴禾信息科技有限公司"],
          legalRepresent: ["林鑫", "任职1家企业"],
          registerCap: "120万",
          investRatio: "34%",
          investAmount: "120万",
          establishDate: "2021-09-11",
          actions: "注销",
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
    AAvatar: Avatar,
  },
  mounted() {},
  methods: {},
};
</script>

<style scoped lang="less">
.foreign-invest-table {
  .green {
    color: #27ba4a;
  }
  .red {
    color: #f6001a;
  }
  .company-name {
    display: flex;
    align-items: center;

    .company-name-img {
      width: 46px;
      height: 46px;
      border-radius: 5px;
      background: rgb(208, 175, 157);
      line-height: 20px;
      text-align: center;
      color: #fff;
      padding: 3px;
    }
    .company-name-text {
      margin-left: 10px;
      p {
        color: @activeFontColor;
        text-align: left;
      }
      div {
        color: #fb9329;
        text-align: left;
        margin-top: 5px;
      }
    }
  }
}
</style>
