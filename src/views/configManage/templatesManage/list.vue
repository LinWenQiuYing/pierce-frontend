<template>
  <TableList
    listClass="template-list"
    tableTitle="模板列表"
    :columns="columns"
    :tableValue="tableValue"
    :pagination="pagination"
    :tableLoading="tableLoading"
    tableClass="template-table"
    :rowKey="(record) => record.code"
  >
    <template v-slot:searchOptions="{ isFold, handleFold }">
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">模板编号：</span>
        <a-input
          allow-clear
          class="table-list-top-item-input"
          type="text"
          v-model.trim="templateId"
          placeholder="模板编号"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">模板名称：</span>
        <a-input
          allow-clear
          class="table-list-top-item-input"
          type="text"
          v-model.trim="templateName"
          placeholder="模板名称"
        />
      </div>
      <div class="table-list-top-item" v-show="!isFold">
        <span class="table-list-top-item-label">创建方式：</span>
        <a-select
          class="table-list-top-item-input"
          v-model="createType"
          placeholder="创建方式"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option :value="1">配置化</a-select-option>
          <a-select-option :value="2">脚本化</a-select-option>
        </a-select>
      </div>
      <div class="table-list-top-item" v-show="!isFold">
        <span class="table-list-top-item-label">模板描述：</span>
        <a-input
          allow-clear
          class="table-list-top-item-input"
          type="text"
          v-model.trim="templateDesc"
          placeholder="模板描述"
        />
      </div>
      <div class="table-list-top-item" v-show="!isFold">
        <span class="table-list-top-item-label">模板状态：</span>
        <a-select
          class="table-list-top-item-input"
          v-model="templateState"
          placeholder="模板状态"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option :value="0">启用</a-select-option>
          <a-select-option :value="1">停用</a-select-option>
        </a-select>
      </div>
      <div class="table-list-top-item">
        <a-button @click="onReset"> 重置 </a-button>
        <a-button
          type="primary"
          @click="onSearch('init')"
          :loading="tableLoading"
          v-if="userRights.btn_queryTemplateByPage"
        >
          查询
        </a-button>
        <a-button class="fold-btn" @click="handleFold">
          {{ isFold ? "展开" : "收起" }}
          <a-icon :type="isFold ? 'down' : 'up'" />
        </a-button>
      </div>
    </template>
    <template v-slot:tableBtns>
      <a-button @click="onSearch('repeat')" icon="sync">刷新</a-button>
      <a-button
        class="add-btn"
        icon="file-add"
        type="primary"
        @click="handleAdd"
      >
        新建
      </a-button>
    </template>
    <template v-slot:actionsSlot="{ record }">
      <a @click="handleCheck(record)" v-if="userRights.btn_getTemplateDetails"
        >查看</a
      >
      <a
        @click="handleCreateModel(record)"
        v-if="userRights.btn_createModelByTempId"
        >创建模型</a
      >
      <a-popover overlayClassName="more-actions">
        <template slot="content">
          <p
            @click="handleEdit(record)"
            :class="record.status === 0 ? 'disabled' : ''"
            v-if="userRights.btn_editTemplate"
          >
            编辑
          </p>
          <p
            @click="startTemplate(record)"
            v-if="userRights.btn_updateTemplateStatus"
          >
            {{ record.status === 0 ? "停用" : "启用" }}
          </p>
          <p
            :class="record.status === 0 ? 'disabled' : ''"
            @click="handleDelete(record)"
            v-if="userRights.btn_delTemplate"
          >
            删除
          </p>
        </template>
        <a>更多</a>
      </a-popover>
      <a
        v-if="
          !userRights.btn_createModelByTempId &&
          !userRights.btn_getTemplateDetails &&
          !userRights.btn_updateTemplateStatus &&
          !userRights.btn_delTemplate &&
          !userRights.btn_editTemplate
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
import { Button, Input, Popover, Tooltip } from "ant-design-vue";
import { mapState } from "vuex";
import {
  delTemplate,
  queryTemplateByPage,
  updateTemplateStatus,
  getTemplateDetails,
} from "@/shared/api/configManage.js";
import { modalConfirm, strReduct } from "@/utils/common.js";

export default {
  name: "TemplateList",
  data() {
    return {
      templateId: undefined,
      templateState: "",
      templateName: undefined,
      templateDesc: undefined,
      createType: "",
      tableLoading: false,
      columns: [
        {
          title: "模板编号",
          dataIndex: "code",
          key: "code",
          width: 200,
        },
        {
          title: "模板名称",
          dataIndex: "name",
          key: "name",
          width: 200,
        },
        {
          title: "模板描述",
          dataIndex: "desc",
          key: "desc",
          width: 300,
          // customRender: (text, record, index) => {
          //   if (text) {
          //     return (
          //       <a-tooltip placement="topLeft" overlayClassName="desc-content">
          //         <template slot="title">{text}</template>
          //         {strReduct(text, 16)}
          //       </a-tooltip>
          //     );
          //   } else {
          //     return text;
          //   }
          // },
        },
        {
          title: "创建方式",
          dataIndex: "createType",
          key: "createType",
          width: 100,
          customRender: (text, record, index) => {
            if (text === 1) {
              return <span class="way-slot-item item-config">配置化</span>;
            } else {
              return <span class="way-slot-item item-sql">脚本化</span>;
            }
          },
        },
        {
          title: "创建时间",
          dataIndex: "createDate",
          key: "createDate",
          width: 200,
        },
        {
          title: "创建人",
          dataIndex: "createPerson",
          key: "createPerson",
          width: 120,
        },
        {
          title: "模板状态",
          dataIndex: "stateText",
          key: "stateText",
          width: 100,
          customRender: (text, record, index) => {
            if (text === "启用") {
              return (
                <a class="status-cell">
                  <span class="publish dot"></span>
                  <span class="status-text">{text}</span>
                </a>
              );
            } else {
              return (
                <a class="status-cell">
                  <span class="draft dot"></span>
                  <span class="status-text">{text}</span>
                </a>
              );
            }
          },
        },
        {
          title: "操作",
          dataIndex: "actions",
          key: "actions",
          width: 200,
          scopedSlots: { customRender: "actions" },
          fixed: "right",
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
          this.onSearch("repeat");
        },
        onShowSizeChange: (current, size) => {
          this.pagination.current = current;
          this.pagination.pageSize = size;
          this.onSearch("repeat");
        },
      },
      isFold: false,
      tableHeight: 0,
    };
  },
  computed: {
    ...mapState("rightsOptions", ["userRights"]),
    strReduct() {
      return (str, len) => {
        return strReduct(str, len);
      };
    },
  },
  components: {
    AButton: Button,
    AInput: Input,
    APopover: Popover,
    // eslint-disable-next-line vue/no-unused-components
    ATooltip: Tooltip,
    TableList,
  },
  mounted() {
    this.onSearch("init");
  },
  methods: {
    async onSearch(type) {
      this.tableLoading = true;
      if (type === "init") {
        this.$set(this.pagination, "current", 1);
      }
      const json = {
        name: this.templateName,
        code: this.templateId,
        desc: this.templateDesc,
        createType: this.createType,
        status: this.templateState,
        pageNo: this.pagination.current,
        pageSize: this.pagination.pageSize,
      };
      const data = await queryTemplateByPage(json);
      if (!data) {
        this.$message.error("获取模板列表失败！");
      } else {
        this.$set(this.pagination, "total", parseInt(data.totalCount));
        const tableValue = [];
        data.dateList.map((item) => {
          tableValue.push({
            id: item.id,
            code: item.code,
            name: item.name,
            desc: item.desc,
            status: item.status,
            createType: item.createType,
            stateText: item.status === 0 ? "启用" : "停用",
            createDate: item.createDate || item.updateDate,
            createPerson: item.createUser,
            schemaId: item.schemaid,
          });
        });
        this.tableValue = tableValue;
      }
      this.tableLoading = false;
    },
    async handleCheck(record) {
      const res = await this.getTemplateDetails(record);
      if (res) {
        this.$emit("detailsChanged", res);
        this.$emit("isListShowChanged", false);
        this.$emit("isDetailsShowChanged", true);
        this.$emit("detailsTypeChanged", "check");
      }
    },
    async getTemplateDetails(record) {
      const loading = this.$message.loading("正在查询", 0);
      const res = await getTemplateDetails(record.id, record.createType);
      loading();
      if (!res) {
        this.$message.error("模板获取失败，请重试！");
        return false;
      } else {
        if (res.createType === 1) {
          // 配置化
          const condition = JSON.parse(res.condition) || undefined;
          const modelInfo = JSON.parse(res.schemaInfo) || undefined;
          if (condition && modelInfo) {
            res.matchList = condition.matchList;
            res.rulesGroup = condition.rulesGroup;
            res.sentenceContent = res.templateScript;
            res.modelInfo = modelInfo;

            // 重置nodeIndex、edgeIndex与pathIndex
            let nodeIndex = 0;
            let edgeIndex = 0;
            modelInfo.vertexMetas.map((node) => {
              const index = parseInt(node.name.slice(1));
              if (index > nodeIndex) {
                nodeIndex = index;
              }
            });
            modelInfo.edgeMetas.map((edge) => {
              const index = parseInt(edge.name.slice(1));
              if (index > edgeIndex) {
                edgeIndex = index;
              }
            });
            res.nodeIndex = nodeIndex;
            res.edgeIndex = edgeIndex + 1;
            res.pathIndex = condition.matchList.length - 1;
          } else {
            this.$message.error("获取模型结构失败！");
          }
        } else {
          res.data = res.paramList.map((item, index) => ({
            id: index,
            index: item.paramName,
            type:
              item.paramType < 3 ? [item.paramType] : ["Enum", item.paramType],
            content: item.paramDesc,
            example:
              item.paramType < 3
                ? item.paramEg
                : item.enums.map((ele, index) => ({
                    index: index + 1,
                    text: ele.paramValue,
                    content: ele.paramDesc,
                  })),
          }));
        }
      }
      return res;
    },
    async handleEdit(record) {
      if (record.status === 0) return false;
      const res = await this.getTemplateDetails(record);
      this.$emit("detailsChanged", res);
      this.$emit("isListShowChanged", false);
      this.$emit("isDetailsShowChanged", true);
      this.$emit("detailsTypeChanged", "edit");
    },
    handleDelete(record) {
      if (record.status === 0) return false;
      const _that = this;
      const title = `确定要删除 ${record.name} 吗？`;
      const onOk = async () => {
        const json = {
          id: record.id,
        };
        const data = await delTemplate(json);
        if (data.message === "成功") {
          _that.$message.success("删除成功");
          _that.onSearch("init");
        } else {
          _that.$message.error(`删除失败，${data.message}`);
        }
      };
      modalConfirm(title, _that, onOk);
    },
    async startTemplate(record) {
      const _that = this;
      const action = record.status === 0 ? "停用" : "启用";
      const title = `确定要${action} ${record.name} 吗？`;
      const onOk = async () => {
        const json = {
          id: record.id,
          status: record.status === 0 ? 1 : 0,
        };
        const data = await updateTemplateStatus(json);
        if (data.message === "成功") {
          _that.$message.success(`${action}成功`);
          _that.onSearch("init");
        } else {
          _that.$message.error(`${action}失败 ${data.message}`);
        }
      };
      modalConfirm(title, _that, onOk);
    },
    onReset() {
      this.templateId = undefined;
      this.templateState = "";
      this.templateName = undefined;
      this.createType = "";
      this.templateDesc = undefined;
      this.onSearch("init");
    },
    handleAdd() {
      const details = {
        id: undefined,
        name: undefined,
        desc: undefined,
        data: [],
        schemaId: undefined,
        templateScript: undefined,
        createType: 2,
      };
      this.$emit("detailsChanged", details);
      this.$emit("isListShowChanged", false);
      this.$emit("isDetailsShowChanged", true);
      this.$emit("detailsTypeChanged", "add");
    },
    async handleCreateModel(record) {
      this.$emit("isListShowChanged", false);
      this.$emit("isDetailsShowChanged", false);
      this.$emit("handleCreateModel", record);
      this.$emit("getCategoryList");
    },
  },
};
</script>
<style lang="less" scoped>
.template-list {
  .table-list-bottom {
    .template-table {
      .status-cell {
        display: flex;
        align-items: center;

        .dot {
          opacity: 1;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 8px;
          display: inline-block;
        }

        .publish {
          background: #19be6b;
        }

        .draft {
          background: #a5aab3;
        }
      }

      .ant-table-row-cell-break-word,
      .status-text {
        color: #949dad;
      }

      .way-slot {
        &-item {
          font-size: 12px;
          padding: 2px 10px;
        }
      }

      .item-config {
        color: @cyan;
        background: #e6fffb;
        border: 1px solid #87e8de;
      }

      .item-sql {
        color: @blue;
        background: #e6f7ff;
        border: 1px solid #91d5ff;
      }
    }
  }
}
</style>
