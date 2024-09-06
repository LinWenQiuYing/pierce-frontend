<template>
  <TableList
    tableTitle="蓝图列表"
    :columns="columns"
    :tableValue="tableValue"
    :pagination="pagination"
    :tableLoading="searchLoading3"
    tableClass="blueprint-table"
    :rowKey="(record) => record.id"
    isDefaultFold
  >
    <template v-slot:searchOptions>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">蓝图编号：</span>
        <a-input
          class="table-list-top-item-input"
          type="text"
          allow-clear
          v-model.trim="graphId"
          placeholder="请输入图编号"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">蓝图名称：</span>
        <a-input
          class="table-list-top-item-input"
          type="text"
          allow-clear
          v-model.trim="graphName"
          placeholder="请输入图名称"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">蓝图状态：</span>
        <a-select
          class="table-list-top-item-input"
          v-model="graphState"
          placeholder="请选择状态"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option :value="0">草稿</a-select-option>
          <a-select-option :value="1">构图失败</a-select-option>
          <a-select-option :value="2">构图成功</a-select-option>
        </a-select>
      </div>
      <div class="table-list-top-item">
        <a-button @click="onReset">重置</a-button>
        <a-button
          type="primary"
          @click="onSearch('init')"
          :loading="searchLoading1"
          v-if="userRights.btn_schemaQuery"
        >
          查询
        </a-button>
      </div>
    </template>
    <template v-slot:tableBtns>
      <a-button
        class="header-btn"
        @click="onRefresh('repeat')"
        :icon="searchLoading2 ? 'loading' : 'undo'"
        v-if="userRights.btn_schemaQuery"
        >刷新</a-button
      >
      <a-button
        class="header-btn"
        icon="file-add"
        type="primary"
        @click="handleAdd"
        v-if="userRights.btn_schemaCreateOrEdit"
      >
        新建
      </a-button>
    </template>
    <template v-slot:actionsSlot="{ record }">
      <a @click="handleCheck(record)" v-if="userRights.btn_schemaDetail"
        >查看</a
      >
      <a
        v-if="userRights.btn_schemaCreateOrEdit"
        @click="handleEdit(record)"
        :class="record.state === 2 ? 'disabled' : ''"
        >编辑</a
      >
      <a @click="handleCopy(record)" v-if="userRights.btn_schemaCreateOrEdit"
        >复制</a
      >
      <a
        @click="handleDelete(record)"
        v-if="userRights.btn_schemaDelete"
        :class="record.state === 2 ? 'disabled' : ''"
        >删除</a
      >
      <a
        v-if="
          !userRights.btn_schemaDetail &&
          !userRights.btn_schemaCreateOrEdit &&
          !userRights.btn_schemaDelete
        "
        class="no-action"
      >
        暂无操作权限
      </a>
    </template>
  </TableList>
</template>
<script>
import TableList from "@/components/tableList";
import { Badge, Button, Input } from "ant-design-vue";
import {
  querySchemaList,
  deleteSchema,
  getSchemaDetail,
} from "@/shared/api/graphsStructure.js";
import { modalConfirm } from "@/utils/common.js";
import { mapState } from "vuex";

export default {
  name: "BlueprintManageList",
  data() {
    return {
      graphId: "",
      graphState: "",
      graphName: "",
      searchLoading1: false, // 查询按钮
      searchLoading2: false, // 刷新按钮
      searchLoading3: false, // 表格
      columns: [
        {
          title: "蓝图编号",
          dataIndex: "id",
          key: "id",
          width: 130,
        },
        {
          title: "蓝图名称",
          dataIndex: "name",
          key: "name",
          width: 150,
        },
        {
          title: "蓝图描述",
          dataIndex: "desc",
          key: "desc",
          width: 160,
        },
        {
          title: "创建时间",
          dataIndex: "createDate",
          key: "createDate",
          width: 120,
          sorter: true,
        },
        {
          title: "创建人",
          dataIndex: "createPerson",
          key: "createPerson",
          width: 100,
        },
        {
          title: "状态",
          dataIndex: "stateText",
          key: "stateText",
          width: 105,
          customRender: (text, record) => {
            return (
              <a-badge
                color={
                  record.state === 2
                    ? "#52C41A"
                    : record.state === 0
                    ? "rgba(0, 0, 0, 0.25)"
                    : "#F5222D"
                }
                text={text}
              />
            );
          },
        },
        {
          title: "操作",
          dataIndex: "actions",
          key: "actions",
          width: 114,
          scopedSlots: { customRender: "actions" },
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
      isDetailsShow: false,
    };
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
    ABadge: Badge,
    AButton: Button,
    AInput: Input,
    TableList,
  },
  mounted() {
    this.getDataList("init");
  },
  computed: {
    ...mapState("rightsOptions", ["userRights"]),
  },
  methods: {
    async onSearch(type) {
      this.searchLoading1 = true;
      await this.getDataList(type);
      this.searchLoading1 = false;
    },
    async onRefresh(type) {
      this.searchLoading2 = true;
      await this.getDataList(type);
      this.searchLoading2 = false;
    },
    async getDataList(type) {
      if (type === "init") {
        this.$set(this.pagination, "current", 1);
      }
      if (this.graphId) {
        const reg = /^[0-9]*$/;
        const flag = reg.test(this.graphId);
        if (!flag) {
          this.$message.error("请输入正确的蓝图编号！");
          return false;
        }
      }
      const json = {
        id: this.graphId === "" ? null : this.graphId,
        graphName: this.graphName === "" ? null : this.graphName,
        status: this.graphState,
        pageNo: this.pagination.current,
        pageSize: this.pagination.pageSize,
      };
      this.searchLoading3 = true;
      let res = null;
      try {
        res = await querySchemaList(json);
      } catch (error) {
        console.log(error);
      }
      this.searchLoading3 = false;
      if (!res) {
        this.$message.destroy();
        this.$message.error("获取蓝图列表失败");
      } else {
        this.$set(this.pagination, "total", parseInt(res.data.totalCount));
        const tableValue = [];
        res.data.dateList.map((item) => {
          tableValue.push({
            id: item.id,
            name: item.graphName,
            desc: item.graphDesc,
            state: item.status,
            stateText:
              item.status === 0
                ? "草稿"
                : item.status === 1
                ? "构图失败"
                : "构图成功",
            createDate: item.createDate,
            createPerson: item.createUser,
          });
        });
        this.tableValue = tableValue;
      }
    },
    onReset() {
      this.graphId = "";
      this.graphState = "";
      this.graphName = "";
      this.getDataList("init");
    },
    handleDelete(record) {
      if (record.state === 2) return false;
      const _that = this;
      const title = `确定要删除 ${record.name} 吗？`;
      const onOk = async () => {
        const data = await deleteSchema(record.id);
        if (data.message === "成功") {
          _that.getDataList("init");
          _that.$message.success("删除成功");
        } else {
          _that.$message.error(`删除失败，${data.message}`);
        }
      };
      modalConfirm(title, _that, onOk);
    },
    handleEdit(record) {
      this.getGraphDetails(record, "edit");
    },
    handleAdd() {
      this.$emit("detailsChanged", {});
      this.$emit("isDetailsShowChanged", true, "add");
    },
    handleCheck(record) {
      this.getGraphDetails(record, "check");
    },
    async getGraphDetails(record, type) {
      const loading = this.$message.loading("正在查询", 0);
      const res = await getSchemaDetail(record.id);
      loading();
      if (res.message === "成功") {
        const graphData = this.getGraphData(res);
        res.data.graphData = graphData;
        res.data.sourceValue = res.data.dsName;
        res.data.databaseValue = res.data.dataSourceId;
        this.$emit("detailsChanged", res.data);
        this.$emit("isDetailsShowChanged", true, type);
      } else {
        this.$message.error(res.message);
      }
    },
    getGraphData(res) {
      const graphData = {
        nodes: res.data.graphVertex.map((node) => {
          let keyValue = undefined;
          const attrValue = [];
          const attrValueAll = [];
          const tableValue = [];
          node.fields.map((item, index) => {
            attrValue.push(item.tableName + "_" + item.fieldName);
            attrValueAll.push({
              key: item.tableName + "_" + item.fieldName,
              label: item.fieldName,
              parent: item.tableName,
              type: item.fieldType,
            });
            tableValue.push({
              id: index,
              tableName: item.tableName,
              fieldName: item.fieldName,
              isShow: item.fieldDisplay === "1" ? true : false,
              key: item.tableName + "_" + item.fieldName,
              showName: item.fieldAlias,
              type: item.fieldType,
            });
            if (item.isPk) {
              keyValue = item.tableName + "_" + item.fieldName;
            }
          });
          const iconValue = (node.icon && node.icon.split(",")) || undefined;
          let fill = null;
          let stroke = null;
          let lineWidth = 0;
          let icon = node.icon
            ? {
                show: true,
              }
            : {
                show: false,
              }; // 如果有图标，则赋值true，如果没有图标，则先赋值false，然后在下面判断结束后更改为true ———— 解决编辑或复制时更换不了图标的bug
          if (node.baseStyle === "2") {
            fill = "#fff";
            stroke = node.color;
            lineWidth = 1.5;
            if (icon && icon.show) {
              icon.width = node.size;
              icon.height = node.size;
              icon.img =
                iconValue.length === 4
                  ? require(`@/assets/theme/${iconValue[0]}/${iconValue[1]}/${iconValue[2]}/${iconValue[3]}.svg`)
                  : null;
            } else {
              // 解决编辑或复制时更换不了图标的bug
              icon.show = true;
            }
          } else if (node.baseStyle === "3") {
            if (icon && icon.show) {
              icon.width = node.size;
              icon.height = node.size;
              icon.img =
                iconValue.length === 4
                  ? require(`@/assets/theme/${iconValue[0]}/${iconValue[1]}/${iconValue[2]}/${iconValue[3]}.svg`)
                  : null;
            } else {
              // 解决编辑或复制时更换不了图标的bug
              icon.show = true;
            }
          } else {
            fill = node.color;
            stroke = node.color;
            lineWidth = 0;
            if (icon && icon.show) {
              icon.width = node.size;
              icon.height = node.size;
              icon.img =
                iconValue.length === 4
                  ? require(`@/assets/theme/${iconValue[0]}/${iconValue[1]}/${iconValue[2]}/${iconValue[3]}.svg`)
                  : null;
            } else {
              // 解决编辑或复制时更换不了图标的bug
              icon.show = true;
            }
          }
          return {
            type: "circle",
            id: node.id,
            label: node.label,
            size: node.size,
            icon,
            style: {
              fill,
              stroke,
              lineWidth,
            },
            data: {
              attrValue,
              attrValueAll,
              colorValue: node.color,
              iconValue,
              inputValue: node.label,
              keyValue,
              sizeValue: node.size,
              styleValue: node.baseStyle,
              tableValue,
            },
          };
        }),
        edges: res.data.graphEdge.map((edge) => {
          let keyValue = undefined;
          const attrValue = [];
          const attrValueAll = [];
          const tableValue = [];
          edge.fields.map((item, index) => {
            attrValue.push(item.tableName + "_" + item.fieldName);
            attrValueAll.push({
              key: item.tableName + "_" + item.fieldName,
              label: item.fieldName,
              parent: item.tableName,
              type: item.fieldType,
            });
            tableValue.push({
              id: index,
              tableName: item.tableName,
              fieldName: item.fieldName,
              startOrEnd:
                item.analyzedFrom === "0"
                  ? "start"
                  : item.analyzedFrom === "1"
                  ? "end"
                  : "",
              isShow: item.fieldDisplay === "1" ? true : false,
              key: item.tableName + "_" + item.fieldName,
              showName: item.fieldAlias,
              type: item.fieldType,
            });
            if (item.isPk) {
              keyValue = item.tableName + "_" + item.fieldName;
            }
          });
          return {
            type: "line",
            id: edge.id,
            label: edge.label,
            source: edge.srcFieldId,
            target: edge.dstFieldId,
            style: {
              stroke: edge.color,
              lineWidth: edge.size,
              lineDash: edge.baseStyle === "2" ? [5, 5] : [],
            },
            data: {
              attrValue,
              attrValueAll,
              colorValue: edge.color,
              inputValue: edge.label,
              keyValue,
              sizeValue: edge.size,
              styleValue: edge.baseStyle,
              tableValue,
            },
          };
        }),
      };
      return graphData;
    },
    async handleCopy(record) {
      const loading = this.$message.loading("正在查询", 0);
      const res = await getSchemaDetail(record.id);
      loading();
      const details = {};
      if (res.message === "成功") {
        const graphData = this.getGraphData(res);
        details.dataSourceId = res.data.dataSourceId;
        details.databaseValue = res.data.databaseValue;
        details.graphData = graphData;
        details.id = "";
        this.$emit("detailsChanged", details);
        this.$emit("isDetailsShowChanged", true, "copy");
      } else {
        this.$message.error(res.message);
      }
    },
  },
};
</script>
<style lang="less">
.blueprint-manage {
  height: 100%;

  &-top {
    display: flex;
    padding: 24px;
    margin-bottom: 24px;
    background: @contentColor;

    &-item {
      display: flex;
      margin-right: 36px;
      align-items: center;
      width: calc((100% - 108px) / 4);

      &:nth-child(4) {
        margin-right: 0;
        justify-content: flex-end;
      }

      &-label {
        width: 75px;
      }

      &-input {
        max-width: 275px;
        width: calc(100% - 75px);
      }

      .ant-btn:first-child {
        margin-right: 12px;
      }
    }
  }

  &-bottom {
    height: calc(100% - 104px);
    background: @contentColor;

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

      .header-btn {
        &:not(:last-child) {
          margin-right: 8px;
        }
      }
    }

    .graph-table {
      padding: 0 24px;
      height: calc(100% - 78px);

      .ant-table-row-cell-break-word,
      .state-text {
        color: #949dad;
      }
    }
  }
}
</style>
