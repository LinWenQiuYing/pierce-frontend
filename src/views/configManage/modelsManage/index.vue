<template>
  <div class="model-manage">
    <div class="model-manage-list" v-if="listShow">
      <TreeList
        listClass="model-manage-list-left"
        treeTitle="模型分类"
        :isCreateRight="userRights.btn_createModelCategory"
        :isDeleteRight="userRights.btn_delModelCategory"
        :list="list"
        :defaultExpandedKeys="['']"
        @addList="addList"
        @addFolder="addFolder"
        @onSelect="onSelect"
        @deleteList="handleDelWarningCategory"
      />
      <TableList
        listClass="model-manage-list-right"
        tableTitle="模型列表"
        :columns="columns"
        :tableValue="modalList"
        :pagination="pagination"
        :tableLoading="searchLoading"
        tableClass="model-table"
        :rowKey="(record) => record.id"
      >
        <template v-slot:searchOptions="{ isFold, handleFold }">
          <div class="table-list-top-item">
            <span class="table-list-top-item-label">模型编号：</span>
            <a-input
              allow-clear
              class="table-list-top-item-input"
              type="text"
              v-model.trim="modelId"
              placeholder="模型编号"
            />
          </div>
          <div class="table-list-top-item">
            <span class="table-list-top-item-label">模型名称：</span>
            <a-input
              allow-clear
              class="table-list-top-item-input"
              type="text"
              v-model.trim="modelName"
              placeholder="模型名称"
            />
          </div>
          <div class="table-list-top-item" v-show="!isFold">
            <span class="table-list-top-item-label">模型分类：</span>
            <a-select
              class="table-list-top-item-input"
              v-model="modelCategory"
              placeholder="模型分类"
              :options="categoryAllOptions"
            />
          </div>
          <div class="table-list-top-item" v-show="!isFold">
            <span class="table-list-top-item-label">生成方式：</span>
            <a-select
              class="table-list-top-item-input"
              v-model="createType"
              placeholder="生成方式"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option :value="1">配置化</a-select-option>
              <a-select-option :value="2">脚本化</a-select-option>
            </a-select>
          </div>
          <div class="table-list-top-item" v-show="!isFold">
            <span class="table-list-top-item-label">模型状态：</span>
            <a-select
              class="table-list-top-item-input"
              v-model="modelState"
              placeholder="请选择状态"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option :value="0">发布</a-select-option>
              <a-select-option :value="1">草稿</a-select-option>
            </a-select>
          </div>
          <!-- <div class="table-list-top-item" v-show="!isFold">
            <span class="table-list-top-item-label">模型描述：</span>
            <a-input
              class="table-list-top-item-input"
              type="text"
              v-model.trim="modelDesc"
              placeholder="描述关键字"
            />
          </div>
          <div class="table-list-top-item" v-show="!isFold"></div> -->
          <div class="table-list-top-item">
            <a-button @click="onReset"> 重置 </a-button>
            <a-button
              type="primary"
              @click="onSearch('init')"
              :loading="searchLoading"
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
            v-if="userRights.btn_createModelByTempId"
            @click="addModelShowChange(true)"
          >
            新建
          </a-button>
        </template>
        <template v-slot:actionsSlot="{ record }">
          <a @click="handleCheck(record)" v-if="userRights.btn_checkModel"
            >查看</a
          >
          <!-- <a @click="copyModel(record)" v-if="userRights.btn_duplicateModel"
            >一键复用</a
          > -->
          <a
            @click="handleCheckTemplate(record)"
            v-if="userRights.btn_checkSelfTemplates"
            >查看所用模板</a
          >
          <a-popover overlayClassName="more-actions">
            <template slot="content">
              <p
                @click="handleEdit(record)"
                :class="record.state === 0 ? 'disabled' : ''"
              >
                编辑
              </p>
              <p @click="handleStop(record)">
                {{ record.state === 0 ? "停用" : "启用" }}
              </p>
              <p
                :class="record.state === 0 ? 'disabled' : ''"
                @click="handleDelete(record)"
              >
                删除
              </p>
            </template>
            <a>更多</a>
          </a-popover>
          <a
            v-if="
              !userRights.btn_checkModel &&
              !userRights.btn_checkSelfTemplates &&
              !userRights.btn_editModel &&
              !userRights.btn_deleteModel &&
              !userRights.btn_startOrStopUsingModel
            "
            class="no-action"
          >
            暂无操作权限
          </a>
        </template>
      </TableList>
    </div>
    <AddModel
      v-if="addModelShow"
      :details="details"
      parentType="model"
      :isSkiped="isSkiped"
      :detailsType="detailsType"
      :categoryOptions="categoryOptions"
      @detailsChanged="detailsChanged"
      @addModelSuccessed="addModelSuccessed"
      @addModelShowChange="addModelShowChange"
      @isListShowChanged="isListShowChanged"
      @isSkipedChanged="isSkipedChanged"
      ref="addModel"
    />
    <Details
      v-if="isTemplateDetailsShow"
      :details="templateDetails"
      detailsType="check"
      @handleCreateModel="handleCreateModel"
      @isListShowChanged="isListShowChanged"
      @isDetailsShowChanged="isDetailsShowChanged"
      @isTemplateDetailsShowChanged="isTemplateDetailsShowChanged"
    />
    <a-modal
      title="添加文件夹"
      :visible="showFolder"
      @ok="okFolder"
      @cancel="cancelFolder"
      okText="确定"
      cancelText="取消"
      centered
      :width="450"
    >
      <a-input
        placeholder="请输入需要添加的文件夹名称"
        v-model.trim="folderName"
      />
    </a-modal>
    <a-modal
      title="添加分类"
      :visible="showList"
      @ok="okList"
      @cancel="cancelList"
      okText="确定"
      cancelText="取消"
      centered
      class="add-sub-menu"
      :width="450"
    >
      <div>
        <a-select v-model="defaultKey" class="select-file">
          <a-select-option
            v-for="item in optionFileName"
            :key="item.key"
            :value="item.key"
          >
            {{ item.title }}
          </a-select-option>
        </a-select>
        <a-input
          placeholder="请输入需要添加的分类名称"
          v-model.trim="listName"
          class="input-file"
        />
      </div>
    </a-modal>
    <a-drawer
      title="模型详情"
      placement="right"
      :closable="false"
      :visible="drawerVisible"
      @close="onDrawerClose"
      :width="modalWidth"
      class="check-drawer"
    >
      <div class="check-drawer-item">
        <span class="check-drawer-item-label">模型编号：</span>
        <div class="check-drawer-item-content">{{ details.code }}</div>
      </div>
      <div class="check-drawer-item">
        <span class="check-drawer-item-label">模型名称：</span>
        <div class="check-drawer-item-content">{{ details.name }}</div>
      </div>
      <div class="check-drawer-item img-content">
        <span class="check-drawer-item-label">模型结构：</span>
        <div
          class="check-drawer-item-content"
          v-if="details.imgString && details.createType === 1"
        >
          <img :src="details.imgString" alt="" />
        </div>
        <span
          class="check-drawer-item-content"
          v-else-if="!details.imgString && details.createType === 1"
          >暂无模型图片</span
        >
        <script-results
          v-else
          :list="dataList"
          ref="scriptResults"
          type="check"
        />
      </div>
      <div class="check-drawer-item">
        <span class="check-drawer-item-label">模型描述：</span>
        <div class="check-drawer-item-content">{{ details.desc }}</div>
      </div>
      <div class="check-drawer-item">
        <span class="check-drawer-item-label">应用规则：</span>
        <div class="check-drawer-item-content">
          <p
            :class="item === '暂无应用' ? 'rules-item no-apply' : 'rules-item'"
            v-for="item in details.rules"
            :key="item"
          >
            {{ item }}
          </p>
        </div>
      </div>
    </a-drawer>
  </div>
</template>
<script>
import AddModel from "./addModel";
import Details from "../templatesManage/details";
import ScriptResults from "./scriptResults";
import TableList from "@/components/tableList";
import TreeList from "../components/treeList";
import { Badge, Button, Input, Popover } from "ant-design-vue";
import {
  getRuleModel,
  editRuleModel,
  delRuleModel,
  getRuleModelDetail,
  getRuleModelDetails,
  deleteWarningCategory,
  addListCategory,
  getCategoryList,
  getTemplateDetails,
} from "@/shared/api/configManage.js";
import { modalConfirm } from "@/utils/common.js";
import { mapState } from "vuex";

export default {
  name: "ModelsManage",
  data() {
    return {
      modelId: "",
      modelState: "",
      modelName: undefined,
      modelCategory: "",
      createType: "",
      searchLoading: false,
      columns: [
        {
          title: "模型编号",
          dataIndex: "code",
          key: "code",
          width: 180,
        },
        {
          title: "模型名称",
          dataIndex: "name",
          key: "name",
          width: 180,
        },
        {
          title: "模型分类",
          dataIndex: "category",
          key: "category",
          width: 120,
        },
        {
          title: "模型描述",
          dataIndex: "desc",
          key: "desc",
          width: 240,
        },
        {
          title: "生成方式",
          dataIndex: "createType",
          key: "createType",
          width: 120,
          customRender: (text) => {
            if (text === 2) {
              return <span class="way-slot-item item-sql">脚本化</span>;
            } else {
              return <span class="way-slot-item item-config">配置化</span>;
            }
          },
        },
        {
          title: "状态",
          dataIndex: "stateText",
          key: "stateText",
          width: 120,
          customRender: (text) => {
            return (
              <a-badge
                color={text === "草稿" ? "#f5222d" : "#52c41a"}
                text={text}
              />
            );
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
      modalList: [],
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
      details: {},
      addModelShow: false,
      process: false, // 表示是否正在过程中，节流作用
      detailsType: undefined,
      list: [
        {
          title: "全部",
          key: "",
          children: [],
        },
      ],
      showList: false,
      showFolder: false,
      folderName: undefined,
      listName: undefined,
      defaultKey: "",
      optionFileName: [{ title: "全部", key: "" }],
      categoryAllOptions: [
        {
          value: "",
          label: "全部",
        },
      ],
      categoryOptions: [],
      modelDesc: undefined,
      drawerVisible: false,
      listShow: true,
      isTemplateDetailsShow: false,
      templateDetails: {},
      dataList: [],
      modalWidth: 0,
      isSkiped: false, // 是否是模板跳转过来的
    };
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
    ABadge: Badge,
    AButton: Button,
    AddModel,
    AInput: Input,
    APopover: Popover,
    Details,
    ScriptResults,
    TableList,
    TreeList,
  },
  computed: {
    ...mapState("rightsOptions", ["userRights"]),
  },
  mounted() {
    this.getCategoryList();
    this.onSearch("init");
  },
  watch: {
    $route(to) {
      if (to.name === "modelsManage" && to.params.isSearch) {
        this.onSearch("init");
      }
    },
  },
  methods: {
    async onSearch(type) {
      if (type === "init") {
        this.$set(this.pagination, "current", 1);
      }
      this.searchLoading = true;
      const json = {
        modelCode: this.modelId === "" ? null : this.modelId,
        modelName: this.modelName === "" ? null : this.modelName,
        categoryId: this.modelCategory ? this.modelCategory : null,
        modelType: this.createType ? this.createType : null,
        desc: this.modelDesc ? this.modelDesc : null,
        status: this.modelState,
        pageSize: this.pagination.pageSize,
        pageNo: this.pagination.current,
      };
      const data = await getRuleModel(json);
      if (!data) {
        this.$message.error("获取模型列表失败");
      } else {
        const tableValue = [];
        data.dateList &&
          data.dateList.map((item) => {
            tableValue.push({
              id: item.id,
              code: item.modelCode,
              name: item.modelName,
              desc: item.desc,
              state: item.status,
              category: item.categoryName,
              createType: item.modelType,
              templateId: item.tempId,
              stateText: item.status === 0 ? "发布" : "草稿",
            });
          });
        this.modalList = tableValue;
        this.$set(this.pagination, "total", data.totalCount);
      }
      this.searchLoading = false;
    },
    onReset() {
      this.modelId = "";
      this.modelState = "";
      this.modelName = "";
      this.modelCategory = "";
      this.createType = "";
      this.modelDesc = undefined;
      this.onSearch("init");
    },
    async handleCheck(record) {
      if (this.process) {
        return false;
      }
      this.process = true;
      const loading = this.$message.loading("正在获取模型详情", 0);
      const json = {
        id: record.id,
      };
      const data = await getRuleModelDetail(json);
      loading();
      this.process = false;
      if (!data) {
        this.$message.error("获取模型详情失败");
        return false;
      }
      if (data.modelType === 1) {
        // 配置化
        record.imgString = data.imgString;
      } else {
        this.dataList = data.detailsDto.paramList.map((item) => ({
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
        const paramValue = JSON.parse(data.paramValue);
        this.dataList.map((item) => {
          if (
            item.type[0] === 2 ||
            (item.type[0] === "Enum" && item.type[1] === 4)
          ) {
            // 字符串
            item.value = paramValue[item.index].slice(
              1,
              paramValue[item.index].length - 1
            );
          } else {
            item.value = paramValue[item.index];
          }
        });
      }
      record.rules =
        data.ruleNameList && data.ruleNameList.length
          ? data.ruleNameList
          : ["暂无应用"];
      this.details = record;
      if (data.modelType === 1) {
        this.modalWidth = 360;
      } else {
        this.modalWidth = 460;
      }
      this.drawerVisible = true;
    },
    async handleCheckTemplate(record) {
      const res = await this.getTemplateDetails(record);
      this.templateDetails = res;
      this.listShow = false;
      this.isTemplateDetailsShow = true;
    },
    async getTemplateDetails(record) {
      const loading = this.$message.loading("正在查询", 0);
      const res = await getTemplateDetails(
        record.templateId,
        record.createType
      );
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
      if (record.state === 0) return false;
      if (this.process) {
        return false;
      }
      this.process = true;
      const loading = this.$message.loading("正在获取模型详情", 0);
      if (record.createType === 1) {
        const res = await getRuleModelDetails(record.id);
        loading();
        this.process = false;
        if (!res.data) {
          this.$message.error("获取模型详情信息失败！");
          return false;
        }
        // 配置化
        const condition = JSON.parse(res.data.condition) || undefined;
        const modelInfo = JSON.parse(res.data.schemaInfo) || undefined;
        if (condition && modelInfo) {
          this.addModelShow = true;
          this.listShow = false;
          const template = {};
          template.matchList = condition.matchList;
          template.rulesGroup = condition.rulesGroup;
          template.sentenceContent = res.data.modelScripts;
          template.modelInfo = modelInfo;
          template.schemaId = res.data.schemaId;
          template.sentenceShow = true;

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
          template.nodeIndex = nodeIndex;
          template.edgeIndex = edgeIndex + 1;
          template.pathIndex = condition.matchList.length - 1;
          const details = record;
          details.template = template;
          details.templateId = res.data.tempId;
          details.templateName = res.data.tempName;
          details.createType = res.data.modelType;
          details.categoryId = res.data.categoryId;
          details.schemaId = res.data.schemaId;
          this.details = details;
        } else {
          this.$message.error("获取模型结构信息失败！");
          return false;
        }
      } else {
        const json = {
          id: record.id,
        };
        const res = await getRuleModelDetail(json);
        loading();
        this.process = false;
        if (!res) {
          this.$message.error("获取模型详情失败！");
          return false;
        }
        this.addModelShow = true;
        this.listShow = false;
        this.$nextTick(() => {
          record.list = res.detailsDto.paramList.map((item) => ({
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
          const paramValue = JSON.parse(res.paramValue);
          record.list.map((item) => {
            if (
              item.type[0] === 2 ||
              (item.type[0] === "Enum" && item.type[1] === 4)
            ) {
              // 字符串
              item.value = paramValue[item.index].slice(
                1,
                paramValue[item.index].length - 1
              );
            } else {
              item.value = paramValue[item.index];
            }
          });
          record.templateName = res.detailsDto.name;
          record.categoryId = res.categoryId;
          this.details = record;
          this.$refs.addModel.list = record.list;
        });
      }
      this.detailsType = "edit";
      this.isSkiped = true;
    },
    handleDelete(record) {
      if (record.state === 0) return false;
      const _that = this;
      const title = `确定要删除 ${record.name} 吗？`;
      const onOk = async () => {
        const json = {
          id: record.id,
        };
        const data = await delRuleModel(json);
        if (data.message === "成功") {
          _that.onSearch("init");
          _that.$message.success("删除成功");
        } else {
          _that.$message.error(`删除失败，${data.message}`);
        }
      };
      modalConfirm(title, _that, onOk);
    },
    async handleStop(record) {
      const _that = this;
      const action = record.state === 0 ? "停用" : "启用";
      const title = `确定要${action} ${record.name} 吗？`;
      const onOk = async () => {
        const json = {
          id: record.id,
          status: record.state === 0 ? 1 : 0,
        };
        const data = await editRuleModel(json);
        if (data.message === "成功") {
          _that.$message.success(`${action}成功`);
          _that.onSearch("init");
        } else {
          _that.$message.error(`${action}失败 ${data.message}`);
        }
      };
      modalConfirm(title, _that, onOk);
    },
    addModelShowChange(value, templateId, templateName, createType, schemaId) {
      this.details = {
        id: undefined,
        name: undefined,
        createType,
        desc: undefined,
        schemaId,
        templateId,
        templateName,
        categoryId: undefined,
        status: undefined,
      };
      this.listShow = !value;
      this.detailsType = "add";
      if (templateId) {
        this.isSkiped = true;
      }
      this.addModelShow = value;
    },
    // async copyModel(record) {
    //   if (this.process) {
    //     return false;
    //   }
    //   this.process = true;
    //   const res = await getRuleModelDetails(record.id);
    //   const condition = JSON.parse(res.data.condition) || undefined;
    //   this.modelInfo = JSON.parse(res.data.schemaInfo) || undefined;
    //   if (res.message === "成功" && condition && this.modelInfo) {
    //     this.addModelShow = true;
    //     const params = {};
    //     params.matchList = condition.matchList;
    //     params.rulesGroup = condition.rulesGroup;
    //     params.sentenceContent = res.data.modelScripts;
    //     params.sentenceShow = true;

    //     // 重置nodeIndex、edgeIndex与pathIndex
    //     let nodeIndex = 0;
    //     let edgeIndex = 0;
    //     this.modelInfo.vertexMetas.map((node) => {
    //       const index = parseInt(node.name.slice(1));
    //       if (index > nodeIndex) {
    //         nodeIndex = index;
    //       }
    //     });
    //     this.modelInfo.edgeMetas.map((edge) => {
    //       const index = parseInt(edge.name.slice(1));
    //       if (index > edgeIndex) {
    //         edgeIndex = index;
    //       }
    //     });
    //     params.nodeIndex = nodeIndex;
    //     params.edgeIndex = edgeIndex + 1;
    //     params.pathIndex = condition.matchList.length - 1;

    //     this.params = params;
    //     this.$nextTick(async () => {
    //       this.$refs.addModel.current = 1;
    //       this.schemaId = res.data.schemaId;
    //       const loading = this.$message.loading("正在获取图谱结构信息", 0);
    //       await this.$refs.addModel.handleSetModel(this.schemaId);
    //       loading();
    //       this.$refs.addModel.handleLock();
    //     });
    //   } else {
    //     this.$message.error("一键复用失败");
    //   }
    //   this.process = false;
    // },
    addModelSuccessed() {
      this.addModelShowChange(false);
      this.onSearch("init");
    },
    detailsChanged(value) {
      this.details = value;
    },
    async onSelect(selectedKeys, e) {
      if (!e.node.isLeaf) {
        e.node.onExpand();
      }
      const target = this.categoryOptions.filter((item) => {
        if (item.value === selectedKeys[0]) {
          return item;
        }
      });
      if (selectedKeys.length) {
        if (target.length) {
          this.defaultKey = target[0].value;
        } else {
          this.defaultKey = "";
        }
      } else {
        this.defaultKey = "";
      }
      const rules = this.categoryAllOptions.filter((item) => {
        if (item.value === selectedKeys[0]) {
          return item;
        }
      });

      // 更新表格内容
      if (rules.length) {
        // 如果rules的长度存在，说明是点击了分类，更新表格内容
        if (rules[0].value === "") {
          this.modelCategory = "";
        }
        if (e.node.isLeaf) {
          this.$set(this.details, "categoryId", rules[0].value);
          this.ruleClass = rules[0].value;
          this.modelCategory = rules[0].value;
        } else {
          this.$set(this.details, "categoryId", undefined);
          this.modelCategory = "";
        }
        this.onSearch("init");
      }
    },
    addList(e, key) {
      e.stopPropagation();
      this.defaultKey = key;
      this.showList = true;
    },
    handleDelWarningCategory(item, e) {
      e.stopPropagation();
      const _that = this;
      const title = `确定要删除 ${item.title} 吗？`;
      const onOk = async () => {
        const json = {
          id: item.key,
        };
        const data = await deleteWarningCategory(json);
        if (data.message === "成功") {
          _that.$message.success("删除成功");
          _that.getCategoryList();
        } else {
          _that.$message.error(`删除失败，${data.message}`);
        }
      };
      modalConfirm(title, _that, onOk);
    },
    async okFolder() {
      if (this.folderName) {
        this.showFolder = false;
        const json = {
          categoryName: this.folderName,
          parentId: -1,
          categoryType: 2,
        };
        const data = await addListCategory(json);
        if (data.message === "成功") {
          this.$message.success("添加成功");
          this.getCategoryList();
        } else {
          this.$message.info(`添加失败 ${data.message}`);
        }
      } else {
        this.$message.warning("文件夹名字不可为空！");
        this.folderName = undefined;
      }
    },
    cancelFolder() {
      this.showFolder = false;
    },
    async okList() {
      if (this.listName !== "" && this.defaultKey !== "") {
        this.showList = false;
        const json = {
          categoryName: this.listName,
          parentId: this.defaultKey === "" ? -1 : this.defaultKey,
          status: 0,
          categoryType: 2,
        };
        const data = await addListCategory(json);
        if (data.message === "成功") {
          this.$message.success("添加成功");
          this.getCategoryList();
        } else {
          this.$message.info(`添加失败 ${data.message}`);
        }
      } else if (this.defaultKey === "") {
        this.$message.warning("请选择添加至哪个文件夹");
      } else {
        this.$message.warning("分类名称不可为空！");
        this.listName = "";
      }
    },
    cancelList() {
      this.showList = false;
    },
    async getCategoryList() {
      const listData = await getCategoryList(2);
      let categoryAllOptions = [
        // 统计全部模型分类 + 全部
        {
          value: "",
          label: "全部",
        },
      ]; // 统计全部模型分类
      const categoryOptions = [];
      if (listData && listData.length) {
        const nowList = [{ title: "全部", key: "" }];
        const list = listData.map((item) => {
          if (item.diff === 0) {
            // diff:区分分类和文件夹，0：文件夹，1：分类
            nowList.push({
              title: item.categoryName,
              key: item.id,
            });
          } else {
            categoryOptions.push({
              value: item.id,
              label: item.categoryName,
            });
          }
          const children = item.children.map((ele) => {
            categoryOptions.push({
              value: ele.id,
              label: ele.categoryName,
            });
            return {
              key: ele.id,
              isLeaf: true,
              title: ele.categoryName,
              scopedSlots: { title: "leaf" },
            };
          });
          return {
            key: item.id,
            isLeaf: item.diff === 0 ? false : true,
            title: item.categoryName,
            children,
            scopedSlots: { title: item.diff === 0 ? "folder" : "leaf" },
          };
        });
        categoryAllOptions = [...categoryAllOptions, ...categoryOptions];
        this.categoryAllOptions = categoryAllOptions;
        this.optionFileName = nowList;
        this.list[0].children = list;
        this.categoryOptions = categoryOptions;
      } else if (listData && !listData.length) {
        this.list = [
          {
            title: "全部",
            key: "",
            children: [],
          },
        ];
        this.$message.info("暂无模型分类，请先添加！");
      } else {
        this.$message.error("获取模型分类失败");
      }
    },
    addFolder(e) {
      e.stopPropagation();
      this.showFolder = true;
    },
    onDrawerClose() {
      this.drawerVisible = false;
    },
    isListShowChanged(value, isSearch) {
      this.listShow = value;
      if (isSearch) {
        this.onSearch("init");
      }
    },
    isDetailsShowChanged(value) {
      this.addModelShow = value;
    },
    isTemplateDetailsShowChanged(value) {
      this.isTemplateDetailsShow = value;
    },
    handleCreateModel(record) {
      this.isTemplateDetailsShow = false;
      this.addModelShowChange(
        true,
        record.id,
        record.name,
        record.createType,
        record.schemaId
      );
    },
    isSkipedChanged(value) {
      this.isSkiped = value;
    },
  },
};
</script>
<style lang="less">
.model-manage {
  height: 100%;
  border-radius: 5px;

  &-list {
    height: 100%;
    display: flex;

    &-left {
      width: 25%;
      margin-right: 24px;
    }

    &-right {
      flex: 1;
      height: 100%;
      border-radius: 5px;
      width: calc(75% - 24px);
    }
  }

  &-top {
    display: flex;
    flex-wrap: wrap;
    background: #fff;
    margin-bottom: 24px;
    transition: all 0.3s;
    padding: 24px 24px 0;
    justify-content: flex-end;

    &-item {
      display: flex;
      margin-right: 16px;
      margin-bottom: 16px;
      align-items: center;
      width: calc((100% - 32px) / 3);

      &:nth-child(3n-1) {
        justify-content: center;
      }
      &:nth-child(3n) {
        margin-right: 0;
        justify-content: flex-end;
      }

      &-label {
        width: 75px;
        text-align: right;
      }

      &-input {
        max-width: 275px;
        width: calc(100% - 75px);
      }

      .fold-btn {
        border: 0 !important;
        color: #1890ff;

        &::after {
          content: none;
        }
      }

      .ant-btn:first-child {
        margin-right: 10px;
      }
    }
  }

  .model-manage-bottom {
    background: #fff;

    .bottom-header {
      height: 54px;
      display: flex;
      padding: 0 16px;
      line-height: 54px;
      align-items: center;
      margin-bottom: 16px;
      justify-content: space-between;
      border-bottom: 1px solid #d9d9d9;

      &-title {
        font-size: 16px;
        font-weight: 600;
        color: @primaryTextColor;
      }

      .add-btn {
        margin-right: 5px;
      }
    }

    .model-table {
      padding: 0 16px;
      height: calc(100% - 70px);

      .way-slot {
        &-item {
          font-size: 12px;
          padding: 2px 10px;
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

      .ant-table-row-cell-break-word,
      .state-text {
        color: #949dad;
      }
    }
  }
}

.add-sub-menu {
  .select-file {
    width: 100%;
    margin-bottom: 10px;
  }
}

.check-drawer {
  .ant-drawer-wrapper-body {
    .ant-drawer-header {
      .ant-drawer-title {
        font-size: 20px;
        font-weight: 600;
      }
    }

    .ant-drawer-body {
      .check-drawer-item {
        display: flex;
        margin-bottom: 16px;
        justify-content: space-between;

        &-label {
          width: 75px;
          display: inline-block;
        }

        &-content {
          color: #949dad;
          width: calc(100% - 75px);

          .rules-item {
            color: @activeFontColor;
            margin-bottom: 10px;

            &.no-apply {
              color: #949dad;
            }
          }
        }

        &.img-content {
          display: block;

          .check-drawer-item-content {
            width: 100%;

            img {
              width: 100%;
              margin-top: 8px;
              border: 1px solid #d9d9d9;
            }
          }
        }

        .script-results {
          margin-top: 16px;
        }
      }
    }
  }
}
</style>
