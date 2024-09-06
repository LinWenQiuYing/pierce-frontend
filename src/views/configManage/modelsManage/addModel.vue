<template>
  <div class="add-model" id="add-model" ref="addModel">
    <div class="add-model-header">
      <span class="add-model-header-title">
        {{
          detailsType === "add"
            ? "新建模型"
            : detailsType === "edit"
            ? `模型编辑（${details.id}）`
            : `模型详情（${details.id}）`
        }}
      </span>
      <div class="add-model-header-btns">
        <a-button @click="onCancel('repeat')"> 返回 </a-button>
      </div>
    </div>
    <div
      id="add-model-content"
      class="add-model-content"
      :style="{
        height: detailsType !== 'check' ? 'calc(100% - 24px)' : '100%',
        paddingBottom: detailsType !== 'check' ? '24px' : '0px',
      }"
    >
      <div class="content-header">
        <span class="content-header-title">基本信息</span>
      </div>
      <div class="content-top">
        <div class="content-top-item">
          <div class="item-box">
            <span class="item-label">模型名称：</span>
            <a-input
              allow-clear
              class="item-input"
              placeholder="模型名称"
              v-model.trim="details.name"
              :disabled="detailsType !== 'add'"
            />
          </div>
          <div class="item-box">
            <span class="item-label">模型分类：</span>
            <a-select
              class="item-input"
              placeholder="模型分类"
              :options="typeOptions"
              v-model="details.categoryId"
            />
          </div>
        </div>
        <div class="content-top-item">
          <div class="item-box">
            <span class="item-label">模板选择：</span>
            <span
              class="item-btn"
              @click="handleSelectTemplate"
              v-if="detailsType !== 'check' && selectItem.length"
              >{{ selectItem[0].name }}</span
            >
            <span
              class="item-btn"
              @click="handleSelectTemplate"
              v-else-if="detailsType !== 'check' && details.templateName"
              >{{ details.templateName }}</span
            >
            <span class="item-btn" @click="handleSelectTemplate" v-else
              >模板选择</span
            >
          </div>
        </div>
        <div class="content-top-item">
          <div class="item-box textarea">
            <span class="item-label">模型描述：</span>
            <a-textArea
              allow-clear
              type="text"
              :auto-size="{ minRows: 4, maxRows: 4 }"
              class="item-input"
              placeholder="模型描述"
              v-model.trim="details.desc"
            />
          </div>
        </div>
      </div>
      <div class="content-header">
        <span class="content-header-title" v-if="details.createType === 2"
          >脚本展示</span
        >
        <span class="content-header-title" v-else-if="details.createType === 1"
          >配置化展示</span
        >
        <span class="content-header-title" v-else>配置详情</span>
      </div>
      <!-- 模板构建开始 -->
      <config-template
        v-if="details.createType === 1 && templateReady"
        ref="configTemplate"
        type="model"
        :selectItem="selectItem"
        :details="details.template"
        :detailsType="detailsType"
        @detailsChanged="detailsChanged"
      />
      <div
        class="script-content"
        v-else-if="details.createType === 2 && templateReady"
      >
        <script-results :list="list" ref="scriptResults" type="add" />
      </div>
      <div
        class="no-content"
        v-else-if="details.templateName && !templateReady"
      >
        <a-spin size="large" />
      </div>
      <div class="no-content" v-else>
        <img src="@/assets/images/img/customize.svg" alt="" />
      </div>
      <!-- 模板构建结束 -->
      <!-- 完成页开始 -->
    </div>
    <div class="content-footer" v-if="detailsType !== 'check'">
      <div class="content-footer-btns">
        <a-button @click="onCancel('repeat')"> 取消 </a-button>
        <a-button
          type="primary"
          @click="handleConfirm"
          v-if="detailsType === 'edit'"
        >
          提交
        </a-button>
        <a-button type="primary" @click="handleConfirm" v-else>
          生成模型
        </a-button>
      </div>
    </div>
    <a-modal
      :width="648"
      :visible="successModalShow"
      :destroyOnClose="true"
      centered
      class="success-model-modal"
      :closable="false"
      :maskClosable="false"
      :footer="null"
    >
      <div class="success-model-modal-content">
        <img src="@/assets/images/img/success.svg" class="content-img" alt="" />
        <p class="content-text">{{ modalTitle }}</p>
        <a-button type="primary" @click="onSuccessCancel"> 确定 </a-button>
      </div>
    </a-modal>
    <a-modal
      :width="900"
      :visible="templateModalShow"
      :destroyOnClose="true"
      @cancel="onTemplateCancel"
      centered
      class="template-modal"
      :closable="true"
      title="模板选择"
    >
      <template slot="footer">
        <a-button key="reset" @click="onTemplateCancel"> 取消 </a-button>
        <a-button key="submit" type="primary" @click="handleSubmit">
          确定
        </a-button>
      </template>
      <div class="template-modal-content">
        <div class="content-options">
          <div class="content-options-item">
            <span class="item-label">模板编号：</span>
            <a-input
              allow-clear
              class="item-input"
              placeholder="模板编号"
              v-model.trim="templateId"
            />
          </div>
          <div class="content-options-item">
            <span class="item-label">模板名称：</span>
            <a-input
              allow-clear
              class="item-input"
              placeholder="模板名称"
              v-model.trim="templateName"
            />
          </div>
          <div class="content-options-item">
            <span class="item-label">生成方式：</span>
            <a-select
              class="item-input"
              v-model="createType"
              placeholder="生成方式"
              templateDesc
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option :value="1">配置化</a-select-option>
              <a-select-option :value="2">脚本化</a-select-option>
            </a-select>
          </div>
          <!-- <div class="content-options-item">
            <span class="item-label">模板描述：</span>
            <a-input
              allow-clear
              class="item-input"
              placeholder="请输入关键词"
              v-model.trim="templateDesc"
            />
          </div> -->
          <div class="content-options-item">
            <a-button key="reset" @click="onResetSearch"> 重置 </a-button>
            <a-button key="submit" type="primary" @click="onSearch('init')">
              查询
            </a-button>
          </div>
        </div>
        <keep-alive>
          <a-table
            :columns="columns"
            :data-source="tableValue"
            :rowKey="(record) => record.id"
            :pagination="pagination"
            :row-selection="rowSelection"
            class="template-modal-table"
            :loading="tableLoading"
            bordered
          >
            <div slot="desc" slot-scope="text" class="table-slot">
              <a-tooltip placement="topLeft" v-if="text">
                <template slot="title">
                  <span>{{ text }}</span>
                </template>
                <span>{{ strReduct(text, 20) }}</span>
              </a-tooltip>
            </div>
          </a-table>
        </keep-alive>
      </div>
    </a-modal>
  </div>
</template>
<script>
import ConfigTemplate from "../templatesManage/configTemplate";
import ScriptResults from "./scriptResults";
import { Button, Input, Spin, Tooltip } from "ant-design-vue";
import { find, cloneDeep } from "lodash";
import {
  queryTemplateByPage,
  getTemplateDetails,
  createModelByTempId,
  saveModelImg,
  updateRuleModel,
  getCategoryList,
} from "@/shared/api/configManage.js";
import { strReduct } from "@/utils/common.js";

const { TextArea } = Input;

export default {
  name: "AddModel",
  props: [
    "detailsType",
    "details",
    "categoryOptions",
    "parentType",
    "isSkiped",
  ],
  data() {
    return {
      disabled: true,
      selectItem: [],
      tableValue: [],
      tableLoading: false,
      pagination: {
        size: "small",
        total: 0,
        current: 1,
        pageSize: 5,
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
          title: "创建方式",
          dataIndex: "createTypeText",
          key: "createTypeText",
          width: 100,
        },
        {
          title: "描述",
          dataIndex: "desc",
          key: "desc",
          width: 280,
          scopedSlots: { customRender: "desc" },
        },
      ],
      templateModalShow: false,
      selectedRowKeys: [],
      templateId: undefined,
      templateName: undefined,
      createType: undefined,
      templateDesc: undefined,
      list: this.details.list || [],
      typeOptions: cloneDeep(this.categoryOptions) || [],
      templateReady: false,
      successModalShow: false,
      modalTitle: "",
    };
  },
  components: {
    AButton: Button,
    AInput: Input,
    ASpin: Spin,
    ATextArea: TextArea,
    ATooltip: Tooltip,
    ConfigTemplate,
    ScriptResults,
  },
  mounted() {
    console.log("list", this.details.list);
    this.onSearch("init");
    if (!this.categoryOptions || !this.categoryOptions.length) {
      this.getCategoryList();
    }
  },
  computed: {
    rowSelection() {
      return {
        columnTitle: "选择",
        columnWidth: 70,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys;
        },
        type: "radio",
      };
    },
    strReduct() {
      return (str, len) => {
        return strReduct(str, len);
      };
    },
  },
  watch: {
    details: {
      handler(newValue) {
        this.details = newValue;
      },
      deep: true,
    },
  },
  methods: {
    onCancel(type) {
      this.$emit("addModelShowChange", false);
      if (type === "init") {
        this.$emit("isListShowChanged", true, true);
      } else {
        this.$emit("isListShowChanged", true);
      }
    },
    currentChanged(value) {
      this.current = value;
    },
    handleSelectTemplate() {
      this.templateModalShow = true;
    },
    async handleConfirm() {
      if (!this.details.name) {
        this.$message.error("请输入模型名称！");
        return false;
      }
      if (!this.details.categoryId) {
        this.$message.error("请选择模型分类！");
        return false;
      }
      if (!this.details.templateId) {
        this.$message.error("请选择模板！");
        return false;
      }
      const json = {
        id: this.details.templateId,
        categoryId: this.details.categoryId,
        modelQuery: {},
        // 模型分类
      };
      let flag = false;
      if (this.details.createType === 2) {
        // 脚本化
        const map = {};
        for (let i = 0; i < this.$refs.scriptResults.dataList.length; i++) {
          const element = this.$refs.scriptResults.dataList[i];
          if (!element.value) {
            this.$message.error("请完整填写脚本！");
            flag = true;
            break;
          } else {
            if (
              element.type[0] === 2 ||
              (element.type[0] === "Enum" && element.type[1] === 4)
            ) {
              // 字符串
              element.value = `'${element.value}'`;
            }
            map[element.index] = element.value;
          }
        }

        json.modelName = this.details.name;
        json.modelDesc = this.details.desc;
        json.map = map;
      } else {
        // 配置化
        if (!this.$refs.configTemplate.sentenceContent) {
          this.$message.error("请生成语句！");
          return false;
        }
        const cy = this.$refs.configTemplate.$refs.modelGraph.$schema2.cy;
        const payload = {
          modelName: this.modelName,
          imgString: cy.png({
            bg: "#F8FBFF",
            maxWidth: 310,
          }),
        };
        const preview = await saveModelImg(payload);
        if (!preview.data) {
          this.$message.error("上传模型图片失败，请重试");
          return false;
        }

        const modelInfo = {
          vertexMetas: [],
          edgeMetas: [],
        };
        const condition = {
          matchList: this.$refs.configTemplate.matchList,
          rulesGroup: this.$refs.configTemplate.rulesGroup,
        };
        cy.nodes((node) => {
          const nodeData = node.data();
          modelInfo.vertexMetas.push({
            x: node.json().position.x,
            y: node.json().position.y,
            id: nodeData.id,
            label: nodeData.label,
            name: nodeData.name,
            property: {},
            nodeType: nodeData.nodeType,
            icon: nodeData.icon,
          });
        });
        cy.edges((edge) => {
          const edgeData = edge.data();
          modelInfo.edgeMetas.push({
            srcId: edgeData.source,
            dstId: edgeData.target,
            id: edgeData.id,
            label: edgeData.label,
            name: edgeData.name,
            property: {},
            nodeType: edgeData.nodeType,
          });
        });

        json.modelQuery.modelName = this.details.name;
        json.modelQuery.path = preview.data;
        json.modelQuery.modelScripts =
          this.$refs.configTemplate.sentenceContent;
        json.modelQuery.desc = this.details.desc;
        json.modelQuery.schemaId = this.details.template.schemaId;
        json.modelQuery.schemaInfo = JSON.stringify(modelInfo); // 模型结构-点边信息
        json.modelQuery.condition = JSON.stringify(condition); // match和where条件
      }

      if (!flag) {
        let res = undefined;
        const loading = this.$message.loading(
          this.detailsType === "edit" ? "正在修改" : "正在创建",
          0
        );
        if (this.detailsType === "edit") {
          json.id = this.details.id;
          res = await updateRuleModel(json);
        } else {
          res = await createModelByTempId(json);
        }
        loading();
        if (res.message === "成功") {
          this.modalTitle =
            this.detailsType === "edit" ? "模型修改成功！" : "模型创建成功！";
          this.successModalShow = true;
        } else {
          this.$message.error(`${res.message}`);
        }
      }
    },
    async handleSubmit(type) {
      if (this.selectedRowKeys.length) {
        let target = undefined;
        if (type === "no-select") {
          target = {
            id: this.details.templateId,
            name: this.details.templateName,
            createType: this.details.createType,
          };
        } else {
          target = find(
            this.tableValue,
            (v) => v.id === this.selectedRowKeys[0]
          );
        }
        this.selectItem = [target];
        const res = await this.getTemplateDetails(target);
        const templateCopy = cloneDeep(this.details.template);
        const template = res;
        template.sentenceContent =
          (templateCopy && templateCopy.sentenceContent) || null;
        template.sentenceShow =
          (templateCopy && templateCopy.sentenceShow) || false;
        this.$set(this.details, "template", template);
        this.$set(this.details, "templateId", target.id);
        this.$set(this.details, "createType", target.createType);
        this.$emit("detailsChanged", this.details);
        console.log("this.details", this.details);
        this.templateReady = true;
        this.onTemplateCancel();
      } else {
        this.$message.error("请选择一个模板！");
      }
    },
    onTemplateCancel() {
      this.templateModalShow = false;
    },
    onSuccessCancel() {
      this.successModalShow = false;
      this.onCancel("init");
      if (this.parentType === "template") {
        this.$router.push({
          name: "modelsManage",
          params: {
            isSearch: true,
          },
        });
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
          if (this.detailsType === "add") {
            console.warn("res.paramList", res.paramList);
            this.list = res.paramList.map((item) => ({
              index: item.paramName,
              type:
                item.paramType < 3
                  ? [item.paramType]
                  : ["Enum", item.paramType],
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
      }
      return res;
    },
    onResetSearch() {
      this.templateId = undefined;
      this.templateName = undefined;
      this.createType = undefined;
      this.templateDesc = undefined;
      this.onSearch("init");
    },
    async onSearch(type) {
      this.searchLoading = true;
      if (type === "init") {
        this.$set(this.pagination, "current", 1);
      }
      const json = {
        name: this.templateName,
        code: this.templateId,
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
            createTypeText: item.createType === 2 ? "脚本化" : "配置化",
            stateText: item.status === 0 ? "启用" : "停用",
            createDate: item.createDate || item.updateDate,
            createPerson: item.createUser,
            schemaId: item.schemaid,
          });
        });
        this.tableValue = tableValue;
        if (this.isSkiped) {
          this.selectedRowKeys = [this.details.templateId];
          this.handleSubmit("no-select");
          this.$emit("isSkipedChanged", false);
        }
      }
      this.searchLoading = false;
    },
    detailsChanged(value) {
      this.$emit("detailsChanged", value);
    },
    async getCategoryList() {
      const listData = await getCategoryList(2);
      const typeOptions = [];
      if (listData && listData.length) {
        listData.map((item) => {
          if (item.diff === 1) {
            // diff:区分分类和文件夹，0：文件夹，1：分类
            typeOptions.push({
              value: item.id,
              label: item.categoryName,
            });
          }
          item.children.map((ele) => {
            typeOptions.push({
              value: ele.id,
              label: ele.categoryName,
            });
          });
        });
        this.typeOptions = typeOptions;
      } else if (listData && !listData.length) {
        this.$message.info("暂无模型分类，请先添加！");
      } else {
        this.$message.error("获取模型分类失败");
      }
    },
  },
};
</script>
<style lang="less">
.add-model {
  display: flex;
  height: 100%;
  border-radius: 5px;
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
    display: flex;
    overflow: auto;
    padding-top: 74px;
    flex-direction: column;

    .content-top {
      margin-bottom: 24px;
      background: #fff;
      padding: 12px 16px 8px;

      &-item {
        display: flex;
        margin-bottom: 16px;

        .item-box {
          display: flex;
          max-width: 360px;
          line-height: 35px;
          margin-right: 100px;
          width: calc(50% - 22.5px);

          &:nth-child(2) {
            margin-right: 0;
          }

          &.textarea {
            width: 100%;
            margin-right: 0;
            max-width: 820px;
          }
        }

        .item-label {
          width: 75px;

          &.long-label {
            width: 90px;
          }
        }

        .item-btn {
          color: @blue;
          cursor: pointer;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;

          &.long-btn {
            width: calc(100% - 90px);
          }
        }

        .item-input,
        .item-text {
          width: calc(100% - 75px);

          .anticon-close-circle {
            top: 50%;
            margin-top: 0;
            transform: translateY(-50%);
          }
        }
      }
    }

    .content-header {
      height: 56px;
      padding: 0 16px;
      line-height: 56px;
      background: #fff;
      border-bottom: 1px solid #d9d9d9;

      &-title {
        font-size: 16px;
        font-weight: 600;
        color: @primaryTextColor;
      }

      &-radio {
        .svg-icon {
          width: 16px;
          margin-bottom: 2px;
        }

        .ant-radio-button-wrapper {
          user-select: none;

          &:hover {
            .svg-icon {
              fill: @blue !important;
            }
          }
        }
      }
    }

    .no-content {
      flex-grow: 1;
      display: flex;
      background: #fff;
      align-items: center;
      justify-content: center;
      height: calc(100% - 368px);
    }

    .script-content {
      flex: 1;
      background: #fff;
      padding: 24px 48px;
    }

    .config-template-config {
      flex: 1;
    }
  }

  .content-footer {
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    height: 53px;
    display: flex;
    padding: 0 24px;
    line-height: 52px;
    position: absolute;
    background: #fff;
    align-items: center;
    justify-content: flex-end;

    .ant-btn {
      margin-left: 8px;
    }
  }
}

.template-modal {
  .ant-modal-content {
    .ant-modal-body {
      padding: 24px 24px 0;
    }
  }

  &-content {
    .content-options {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 16px;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid @dividersColor;

      &-item {
        display: flex;
        margin-right: 24px;
        margin-bottom: 16px;
        align-items: center;
        color: @primaryTextColor;
        width: calc((100% - 72px) / 4);

        &:last-child {
          margin-right: 0;
          justify-content: flex-end;

          .ant-btn {
            margin-left: 10px;
          }
        }

        .item-label {
          width: 75px;
        }

        .item-input {
          width: calc(100% - 75px);
        }
      }
    }

    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 12px;
    }
  }
}

.success-model-modal-content {
  text-align: center;
  padding: 30px 24px 24px;

  .content-img {
    width: 70px;
    height: 70px;
    margin-bottom: 30px;
  }

  .content-text {
    height: 28px;
    font-size: 20px;
    line-height: 28px;
    padding-left: 16px;
    margin-bottom: 60px;
    color: @primaryTextColor;
  }
}
</style>
