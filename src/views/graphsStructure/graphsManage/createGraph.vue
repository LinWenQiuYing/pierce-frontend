<template>
  <div class="create-graph">
    <div class="create-graph-header">
      <span class="create-graph-header-title">蓝图选择</span>
      <div class="create-graph-header-btns">
        <a-button @click="handleReturn">返回</a-button>
      </div>
    </div>
    <div class="create-graph-content">
      <div class="content-header">
        <span class="content-header-title">蓝图列表</span>
        <div class="content-header-btns">
          <a-input
            v-model.trim="inputValue"
            class="content-header-btns-input"
            placeholder="请输入蓝图名称"
          >
            <a-icon slot="suffix" type="search" @click="getDataList('init')" />
          </a-input>
          <a-button
            class="header-btn"
            @click="onRefresh('repeat')"
            :icon="searchLoading2 ? 'loading' : 'undo'"
            >刷新</a-button
          >
        </div>
      </div>
      <table-component
        :columns="columns"
        :data-source="tableValue"
        :rowKey="(record) => record.id"
        :pagination="pagination"
        :loading="searchLoading1"
        class="blueprint-table"
        :row-selection="rowSelection"
      >
      </table-component>
    </div>
    <div class="create-graph-footer">
      <a-button class="footer-btn" @click="handleReturn">取消</a-button>
      <a-button
        class="footer-btn"
        type="primary"
        @click="handleCreate"
        :disabled="!selectedRowKeys.length"
        >创建图谱</a-button
      >
    </div>
    <a-modal
      :width="572"
      class="graph-details-info-modal"
      :visible="infoModalShow"
      :destroyOnClose="true"
      @ok="handleOk"
      @cancel="onCancel"
      centered
      title="图谱信息"
    >
      <div class="content-item">
        <span class="content-item-label">图谱名称：</span>
        <a-input
          type="text"
          placeholder="请输入图谱名称"
          class="content-item-input"
          v-model.trim="graphName"
        />
      </div>
      <div class="content-item">
        <span class="content-item-label">图谱描述：</span>
        <a-textArea
          type="text"
          placeholder="请输入图谱描述"
          class="content-item-input"
          v-model.trim="graphDesc"
          :auto-size="{ minRows: 3, maxRows: 5 }"
        />
      </div>
    </a-modal>
  </div>
</template>
<script>
import TableComponent from "@/components/tableComponent";
import { Button, Input } from "ant-design-vue";
import { getUsefulSchema, createGraph } from "@/shared/api/graphsStructure.js";

const { TextArea } = Input;

export default {
  name: "CreateGraph",
  data() {
    return {
      columns: [
        {
          title: "蓝图编号",
          dataIndex: "id",
          key: "id",
          width: 160,
        },
        {
          title: "蓝图名称",
          dataIndex: "name",
          key: "name",
          width: 200,
        },
        {
          title: "蓝图描述",
          dataIndex: "desc",
          key: "desc",
          width: 200,
        },
        {
          title: "创建时间",
          dataIndex: "createDate",
          key: "createDate",
          width: 150,
          sorter: true,
        },
        {
          title: "创建人",
          dataIndex: "createPerson",
          key: "createPerson",
          width: 109,
        },
      ],
      tableValue: [],
      pagination: {
        size: "small",
        total: 0,
        current: 1,
        pageSize: 15,
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
          this.getDataList("repeat");
        },
        onShowSizeChange: (current, size) => {
          this.pagination.current = current;
          this.pagination.pageSize = size;
          this.getDataList("repeat");
        },
      },
      searchLoading1: false, // 表格
      searchLoading2: false, // 刷新按钮
      inputValue: undefined,
      selectedRowKeys: [],
      infoModalShow: false,
      graphName: undefined,
      graphDesc: undefined,
    };
  },
  components: {
    AButton: Button,
    AInput: Input,
    ATextArea: TextArea,
    TableComponent,
  },
  computed: {
    rowSelection() {
      return {
        // columnTitle: "",
        type: "radio",
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys;
        },
      };
    },
  },
  mounted() {
    this.getDataList("init");
  },
  methods: {
    async getDataList(type) {
      if (type === "init") {
        this.$set(this.pagination, "current", 1);
      }
      const json = {
        graphName: this.inputValue === "" ? null : this.inputValue,
        pageNo: this.pagination.current,
        pageSize: this.pagination.pageSize,
      };
      this.searchLoading1 = true;
      const res = await getUsefulSchema(json);
      this.searchLoading1 = false;
      if (res.message !== "成功") {
        this.$message.error("获取图列表失败");
      } else {
        this.$set(this.pagination, "total", parseInt(res.data.totalCount));
        const tableValue = [];
        res.data.dateList.map((item) => {
          tableValue.push({
            id: item.id,
            name: item.graphName,
            desc: item.graphDesc,
            createDate: item.createDate,
            createPerson: item.createUser,
          });
        });
        this.tableValue = tableValue;
      }
    },
    async onRefresh(type) {
      this.searchLoading2 = true;
      await this.getDataList(type);
      this.searchLoading2 = false;
    },
    handleReturn(isSearch) {
      this.$emit("isCreateShowChanged", false, isSearch);
    },
    async handleOk() {
      if (!this.graphName) {
        this.$message.error("请输入图谱名称！");
        return false;
      }
      const json = {
        id: this.selectedRowKeys[0],
        graphName: this.graphName,
        graphDesc: this.graphDesc,
      };
      const loading = this.$message.loading("正在创建图谱", 0);
      const res = await createGraph(json);
      loading();
      if (res.message === "成功") {
        this.$message.success("创建图谱成功！");
        this.handleReturn(true);
      } else {
        this.$message.error(res.message);
      }
      this.onCancel();
    },
    handleCreate() {
      this.infoModalShow = true;
    },
    onCancel() {
      this.infoModalShow = false;
    },
  },
};
</script>
<style lang="less">
.create-graph {
  height: 100%;
  display: flex;
  overflow: auto;
  flex-direction: column;

  &-header {
    top: 0;
    left: 0;
    right: 0;
    z-index: 9;
    height: 74px;
    padding: 24px;
    display: flex;
    position: absolute;
    background: #fff;
    align-items: center;
    justify-content: space-between;

    &-title {
      font-size: 20px;
      font-weight: 600;
    }
  }

  &-content {
    margin-top: 74px;
    height: calc(100% - 126px);
    background: @contentColor;

    .content-header {
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

      &-btns {
        display: flex;

        &-input {
          margin-right: 16px;

          .ant-input {
            border: 1px solid @borderColor;
          }

          .ant-input-suffix {
            right: 0;
            width: 32px;
            height: 32px;
            display: flex;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            border-left: 1px solid @borderColor;
          }
        }
      }
    }

    .blueprint-table {
      padding: 0 24px;
      height: calc(100% - 78px);
    }
  }

  &-footer {
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    display: flex;
    padding: 10px 24px;
    position: absolute;
    background: #fff;
    align-items: center;
    justify-content: flex-end;
  }
}

.graph-details-info-modal {
  .ant-modal-content {
    .ant-modal-header {
      .ant-modal-title {
        font-size: 16px;
        font-weight: 600;
        color: @primaryTextColor;
      }
    }

    .ant-modal-body {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;

      .content-item {
        width: 336px;
        display: flex;

        &:not(:last-child) {
          margin-bottom: 16px;
        }

        &-label {
          width: 80px;
          line-height: 32px;
          color: @primaryTextColor;
        }

        &-input {
          width: calc(100% - 80px);
        }
      }
    }

    .ant-modal-footer {
      padding: 10px 24px;
    }
  }
}
</style>
