<template>
  <div class="risk-warning-rules">
    <TreeList
      v-if="!addRuleVisible"
      listClass="rules-left"
      treeTitle="策略规则分类"
      :isCreateRight="userRights.btn_createRuleCategory"
      :isDeleteRight="userRights.btn_delRuleCategory"
      :list="list"
      :defaultExpandedKeys="['0-0']"
      @addList="addList"
      @addFolder="addFolder"
      @onSelect="onSelect"
      @deleteList="handleDelWarningCategory"
    />
    <TableList
      v-if="!addRuleVisible"
      listClass="rules-right"
      tableTitle="规则列表"
      :columns="columns"
      :tableValue="tableValue"
      :pagination="pagination"
      :tableLoading="tableLoading"
      tableClass="rule-table"
      :rowKey="(record) => record.id"
    >
      <template v-slot:searchOptions="{ isFold, handleFold }">
        <div class="table-list-top-item">
          <span class="table-list-top-item-label">规则分类：</span>
          <a-select
            class="table-list-top-item-input"
            :options="warningClassOption"
            v-model="warningClass"
            placeholder="规则分类"
          />
        </div>
        <div class="table-list-top-item">
          <span class="table-list-top-item-label">规则等级：</span>
          <a-select
            v-model="warningLevel"
            placeholder="规则等级"
            class="table-list-top-item-input"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option :value="1">一级</a-select-option>
            <a-select-option :value="2">二级</a-select-option>
            <a-select-option :value="3">三级</a-select-option>
          </a-select>
        </div>
        <div class="table-list-top-item">
          <span class="table-list-top-item-label">规则状态：</span>
          <a-select
            class="table-list-top-item-input"
            v-model="warningState"
            placeholder="规则状态"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option :value="0">上线</a-select-option>
            <a-select-option :value="1">草稿</a-select-option>
          </a-select>
        </div>
        <div class="table-list-top-item" v-show="!isFold">
          <span class="table-list-top-item-label">生成方式：</span>
          <a-select
            class="table-list-top-item-input"
            v-model="warningType"
            placeholder="生成方式"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option :value="1">内置</a-select-option>
            <a-select-option :value="0">自定义</a-select-option>
          </a-select>
        </div>
        <div class="table-list-top-item" v-show="!isFold">
          <span class="table-list-top-item-label">规则名称：</span>
          <a-input
            type="text"
            class="table-list-top-item-input"
            v-model.trim="warningName"
            placeholder="规则名称"
          />
        </div>
        <div class="table-list-top-item" v-show="!isFold">
          <span class="table-list-top-item-label">规则编号：</span>
          <a-input
            type="text"
            class="table-list-top-item-input"
            v-model.trim="warningId"
            placeholder="规则ID/流水号"
          />
        </div>
        <div class="table-list-top-item" v-show="!isFold"></div>
        <div class="table-list-top-item">
          <a-button @click="onReset('init')"> 重置 </a-button>
          <a-button
            type="primary"
            @click="onSearch('init')"
            :loading="tableLoading"
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
          v-if="userRights.btn_createRule"
          @click="handleAddRule"
        >
          新建
        </a-button>
      </template>
      <template v-slot:actionsSlot="{ record }">
        <a @click="detailInfo(record)" v-if="userRights.btn_checkRuleDetail"
          >详情</a
        >
        <a
          v-if="record.status === '草稿' && userRights.btn_updateRule"
          @click="editInfo(record)"
          >编辑</a
        >
        <a-popover overlayClassName="more-actions">
          <template slot="content">
            <p
              @click="startRule(record)"
              v-if="userRights.btn_startOrStopUsingRule"
            >
              {{ record.status === "上线" ? "停用" : "启用" }}
            </p>
            <p
              v-if="record.status === '上线' && userRights.btn_doRuleTask"
              @click="testInfo(record)"
            >
              立即检测
            </p>
            <p @click="checkInfo(record)" v-if="userRights.btn_resultsCheck">
              结果查询
            </p>
            <p
              v-if="
                record.ruleType !== '内置' &&
                record.status === '草稿' &&
                userRights.btn_deleteRule
              "
              @click="handleDelete(record)"
            >
              删除
            </p>
          </template>
          <a>更多</a>
        </a-popover>
      </template>
    </TableList>
    <div class="add-rule-part" v-if="addRuleVisible">
      <div class="add-rule-part-content">
        <p class="add-rule-part-title">{{ addTitle }}</p>
        <div class="rule-content">
          <div class="rule-content-item">
            <p class="rule-content-item-title">
              <span class="require">*</span>
              <span class="text">规则名称</span>
            </p>
            <a-input
              v-if="addTitle === '查看规则'"
              class="rule-content-item-input"
              type="text"
              v-model="checkData.ruleName"
              disabled
              placeholder="请输入规则名称"
            />
            <a-input
              v-else
              class="rule-content-item-input"
              type="text"
              v-model.trim="ruleName"
              placeholder="请输入规则名称"
            />
          </div>
          <div class="rule-content-item">
            <p class="rule-content-item-title">
              <span class="require">*</span>
              <span class="text">规则分类</span>
            </p>
            <a-select
              v-if="addTitle === '新建规则'"
              class="rule-content-item-input"
              v-model="ruleClass"
              placeholder="请选择规则分类"
              :options="ruleTypeOptions"
            >
            </a-select>
            <a-input
              v-else
              class="rule-content-item-input"
              type="text"
              v-model="checkData.ruleCategoryName"
              disabled
              placeholder="规则分类"
            />
          </div>
          <div class="rule-content-item">
            <p class="rule-content-item-title">
              <span class="require">*</span>
              <span class="text">规则等级</span>
            </p>
            <a-select
              v-if="addTitle === '新建规则'"
              class="rule-content-item-input"
              v-model="ruleLevel"
              placeholder="请选择规则等级"
            >
              <a-select-option :value="1">一级</a-select-option>
              <a-select-option :value="2">二级</a-select-option>
              <a-select-option :value="3">三级</a-select-option>
            </a-select>
            <a-input
              v-else
              class="rule-content-item-input"
              type="text"
              v-model="checkData.levelText"
              disabled
              placeholder="规则等级"
            />
          </div>
          <div class="rule-content-item">
            <p class="rule-content-item-title">
              <span class="require">*</span>
              <span class="text">生效日期</span>
            </p>
            <a-range-picker
              v-if="addTitle === '查看规则'"
              v-model="checkData.startStopTime"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              class="rule-content-item-input"
              disabled
            >
              <template slot="suffixIcon">
                <a-icon type="calendar" />
              </template>
            </a-range-picker>
            <a-range-picker
              v-else
              v-model="startStopTime"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              class="rule-content-item-input"
            >
              <template slot="suffixIcon">
                <a-icon type="calendar" />
              </template>
            </a-range-picker>
          </div>
          <div class="rule-content-item">
            <p class="rule-content-item-title">
              <span class="require">*</span>
              <span class="text">检测周期</span>
            </p>
            <div class="rule-content-item-input">
              <a-input
                v-if="addTitle === '查看规则'"
                class="config-num-input"
                type="text"
                v-model="checkData.checkDate"
                disabled
                placeholder="检测周期"
              />
              <a-input-number
                v-else
                type="text"
                v-model.trim="checkNum"
                :min="1"
                :precision="0"
                placeholder="请输入数字"
                class="config-num-input"
              />
              <a-select
                v-if="addTitle === '查看规则'"
                v-model="checkData.cycleUnit"
                placeholder="请选择时间"
                disabled
              >
                <a-select-option :value="0">天</a-select-option>
                <a-select-option :value="1">月</a-select-option>
              </a-select>
              <a-select v-else v-model="checkUnit" placeholder="请选择时间">
                <a-select-option :value="0">天</a-select-option>
                <a-select-option :value="1">月</a-select-option>
              </a-select>
            </div>
          </div>
        </div>
        <p class="content-sub-title">模型选择</p>
        <div class="rule-content">
          <div class="rule-content-item">
            <p class="rule-content-item-title">
              <span class="require">*</span>
              <span class="text">图谱选择</span>
            </p>
            <a-input
              v-if="addTitle === '查看规则'"
              class="rule-content-item-input"
              type="text"
              v-model="checkData.graphChName"
              disabled
              placeholder="请选择应用图谱"
            />
            <a-select
              v-else
              class="rule-content-item-input"
              v-model="graphId"
              placeholder="请选择应用图谱"
              :options="graphOptions"
              @change="onGraphChange"
            >
            </a-select>
          </div>
          <div class="rule-content-item">
            <p class="rule-content-item-title">
              <span class="require">*</span>
              <span class="text">模型选择</span>
            </p>
            <a-input
              v-if="addTitle === '查看规则'"
              class="rule-content-item-input"
              type="text"
              v-model="checkData.ruleModelName"
              disabled
              placeholder="请选择模型"
            />
            <a-auto-complete
              v-else
              allow-clear
              backfill
              :filterOption="filterOption"
              v-model="ruleModel"
              @change="handleSelect"
              placeholder="请选择模型"
              class="rule-content-item-input"
            >
              <template slot="dataSource">
                <a-select-option
                  v-for="item in modelOptions"
                  :key="item.value"
                  :value="item.value"
                  :title="item.label"
                  >{{ item.label }}</a-select-option
                >
              </template>
            </a-auto-complete>
          </div>
        </div>
        <p class="content-sub-title" v-if="checkGraphVisible">
          线索主体选择
          <a-tooltip placement="right" overlayClassName="rule-obj-tooltip">
            <template slot="title">
              <p>选择配置化模型则展示模型结构图</p>
              <p>选择脚本化模型则展示图谱结构图</p>
            </template>
            <icon-svg icon-class="info_circle" class="info-circle" />
          </a-tooltip>
        </p>
        <div class="rule-content" v-if="checkGraphVisible">
          <div class="rule-content-model">
            <div class="rule-content-model-box">
              <SchemaGraph
                :pathData="modelData"
                graphId="model-graph-canvas"
                :isModel="isModel"
                :singleSelect="true"
                @selectedElesChanged="selectedElesChanged"
              />
            </div>
          </div>
          <div class="rule-content-options">
            <div class="rule-objs">
              <p class="rule-objs-title">请选择图中作为线索主体展示的实体</p>
              <!-- <a-input
                v-if="addTitle === '查看规则'"
                class="rule-objs-select"
                type="text"
                v-model="ruleObjs.value"
                disabled
                placeholder="请选择线索主体"
              />
              <a-select
                v-else
                class="rule-objs-select"
                placeholder="请选择线索主体"
                v-model="ruleObjs.value"
                allow-clear
                @change="handleChangeObjs"
                :options="objOptions"
              /> -->
            </div>
            <div
              class="objs-attr-part"
              v-if="!selectedEdges.length || addTitle === '查看规则'"
            >
              <div
                class="objs-attr-part-item"
                v-for="(item, index) in ruleObjs.label"
                :key="index"
              >
                <span class="item-label">{{ item.value }}:</span>
                <a-select
                  show-search
                  filter-option
                  class="item-select"
                  placeholder="请选择主体的属性"
                  v-model="item.attr"
                  allow-clear
                  :options="item.options"
                  :disabled="addTitle === '查看规则'"
                />
              </div>
            </div>
            <div class="objs-attr-tips" v-else-if="addTitle !== '查看规则'">
              请选择图中的实体点
            </div>
          </div>
        </div>
        <!-- <p class="content-sub-title">是否触发关联线索</p>
        <div class="rule-content">
          <span class="rule-content-title">标题：</span>
          <a-checkbox
            :indeterminate="indeterminate"
            :checked="checkAll"
            @change="onCheckAllChange"
            :disabled="addTitle === '查看规则' ? true : false"
            >全选</a-checkbox
          >
          <a-checkbox-group
            v-model="checkedList"
            :options="plainOptions"
            @change="onChange"
            :disabled="addTitle === '查看规则' ? true : false"
          />
        </div> -->
      </div>
      <div class="add-rule-part-btns">
        <a-button @click="handleCancel"> 取消 </a-button>
        <a-button
          v-if="addTitle === '查看规则' && checkData.status === 1"
          type="primary"
          @click="checkToEdit(checkData)"
        >
          编辑
        </a-button>
        <a-button @click="handleReset" v-if="addTitle === '新建规则'">
          重置
        </a-button>
        <a-button
          v-if="addTitle === '编辑规则' || addTitle === '新建规则'"
          type="primary"
          @click="handleconfirm"
        >
          提交
        </a-button>
      </div>
    </div>
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
  </div>
</template>
<script>
import SchemaGraph from "@/views/configManage/components/schemaGraph";
import TableList from "@/components/tableList";
import TreeList from "./components/treeList";
import {
  AutoComplete,
  Button,
  DatePicker,
  Input,
  InputNumber,
  Popover,
  Tooltip,
} from "ant-design-vue";
import {
  getCategoryList,
  addListCategory,
  addOrEditWarningRule,
  searchRuleList,
  queryRuleModelList,
  getWarningRelate,
  deleteSingleRules,
  deleteWarningCategory,
  editWarningRuleStatus,
  getRuleDetails,
  queryGraphList,
  getRuleModelDetails,
  graphPreview,
} from "@/shared/api/configManage.js";
import { getWarningList } from "@/shared/api/riskWarning.js";
import { modalConfirm } from "@/utils/common.js";
import { mapState } from "vuex";
import { findIndex, find } from "lodash";
import { doModelTask } from "@/shared/api/graph.js";
import moment from "moment";

const { RangePicker } = DatePicker;

export default {
  name: "GraphAnalysis",
  data() {
    return {
      list: [
        {
          title: "全部",
          key: "0-0",
          children: [],
        },
      ],
      showList: false,
      showFolder: false,
      folderName: "",
      listName: "",
      columns: [
        {
          title: "规则编号",
          dataIndex: "id",
          key: "id",
          width: 100,
        },
        {
          title: "规则名称",
          dataIndex: "ruleName",
          key: "ruleName",
          width: 100,
        },
        {
          title: "规则分类",
          dataIndex: "ruleCategory",
          key: "ruleCategory",
          width: 90,
        },
        {
          title: "生成方式",
          dataIndex: "ruleType",
          key: "ruleType",
          width: 90,
        },
        {
          title: "状态",
          key: "status",
          dataIndex: "status",
          width: 70,
        },
        {
          title: "最新更新日期",
          key: "lastTime",
          dataIndex: "lastTime",
          width: 120,
        },
        {
          title: "操作",
          key: "actions",
          dataIndex: "actions",
          scopedSlots: { customRender: "actions" },
          width: 98,
        },
      ],
      defaultKey: "0-0", // 当前所选分类
      tableValue: [],
      warningClass: "0-0",
      warningLevel: "",
      warningState: "",
      warningId: "",
      ruleName: "",
      warningClassOption: [
        {
          value: "0-0",
          label: "全部",
        },
      ], // 所有叶子节点的分类 + 全部选项
      ruleModel: undefined,
      ruleClass: undefined,
      ruleLevel: undefined,
      modelOptions: [],
      startStopTime: undefined,
      checkNum: "",
      checkUnit: 0,
      addRuleVisible: false,
      indeterminate: false,
      checkAll: false,
      plainOptions: [],
      checkedList: [],
      ruleTypeOptions: [], // 所有叶子节点的分类（不包括全部选项）
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
      addTitle: "",
      checkData: {},
      tableLoading: false,
      warningName: "",
      warningType: "",
      optionFileName: [], // 所有分类名称
      graphOptions: [],
      graphId: undefined,
      process: false,
      checkGraphVisible: false, // 是否展示选择主体部分
      // objOptions: [], // 作为线索主体展示的实体可选项
      ruleObjs: {
        // value: undefined,
        label: [],
      }, // 作为线索主体展示的实体，可多选
      ruleModelObjs: undefined,
      modelData: {
        edgeMetas: [],
        vertexMetas: [],
      }, // 存放模型结构信息
      propertyData: [], // schema对应节点的property集合
      selectedNodes: [],
      selectedEdges: [],
      customerVos: [], // 保存已存在的线索主体信息
      isModel: true, // 是否是模型图
    };
  },
  components: {
    AAutoComplete: AutoComplete,
    AButton: Button,
    AInput: Input,
    AInputNumber: InputNumber,
    APopover: Popover,
    ARangePicker: RangePicker,
    ATooltip: Tooltip,
    SchemaGraph,
    TableList,
    TreeList,
  },
  computed: {
    ...mapState("rightsOptions", ["userInfo", "userRights"]),
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      // 规则列表
      const listData = await getCategoryList(0);
      const ruleTypeOptions = []; // 统计全部规则分类
      const ruleOptions = [];
      let warningClassOption = [
        // 统计全部规则分类 + 全部
        {
          value: "0-0",
          label: "全部",
        },
      ];
      if (listData && listData.length) {
        const nowList = [{ title: "全部", key: "0-0" }];
        const list = listData.map((item) => {
          if (item.diff === 0) {
            nowList.push({
              title: item.categoryName,
              key: item.id,
            });
          }
          if (!item.children.length) {
            ruleOptions.push({
              value: item.id,
              label: item.categoryName,
            });
          }
          const children = item.children.map((ele) => {
            ruleTypeOptions.push({
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
            isLeaf: item.children.length ? false : true,
            title: item.categoryName,
            children,
            scopedSlots: { title: item.children.length ? "folder" : "leaf" },
          };
        });
        warningClassOption = [
          ...warningClassOption,
          ...ruleTypeOptions,
          ...ruleOptions,
        ];
        this.warningClassOption = warningClassOption;
        this.optionFileName = nowList;
        this.list[0].children = list;
        this.ruleTypeOptions = [...ruleTypeOptions, ...ruleOptions];
      } else {
        this.$message.error("获取规则分类失败");
      }
      this.onSearch("init");

      // 关联线索
      const warningRelate = await getWarningRelate();
      const plainOptions = [];
      if (!warningRelate) {
        this.$message.error("获取关联线索失败");
      } else {
        warningRelate.map((item) => {
          plainOptions.push({
            value: item.id,
            label: item.warningName,
          });
        });
        this.plainOptions = plainOptions;
      }

      // 可选图谱
      const graphList = await queryGraphList();
      const graphOptions = [];
      if (!graphList) {
        this.$message.error("获取可选图谱失败");
      } else {
        graphList.map((graph) => {
          graphOptions.push({
            label: graph.graphChName,
            value: graph.id,
            schemaId: graph.schemaId,
          });
        });
        this.graphOptions = graphOptions;
      }
    },
    async onSelect(selectedKeys, e) {
      if (!e.node.isLeaf) {
        // 如果不是叶子节点，则展开或者收起
        e.node.onExpand();
      }
      const target = this.optionFileName.find(
        (item) => item.key === selectedKeys[0]
      );
      if (selectedKeys.length) {
        if (target) {
          this.defaultKey = target.key;
        } else {
          this.defaultKey = "0-0";
        }
      } else {
        this.defaultKey = "0-0";
      }
      const rules = this.warningClassOption.find(
        (item) => item.value === selectedKeys[0]
      );

      // 更新表格内容
      if (rules) {
        this.onReset("repeat");
        if (rules.value === "0-0") {
          this.warningClass = "0-0";
        }
        if (e.node.isLeaf) {
          this.ruleClass = rules.value;
          this.warningClass = rules.value;
        } else {
          this.ruleClass = undefined;
          this.warningClass = "0-0";
        }
        this.tableLoading = true;
        this.pagination.current = 1;
        const json = {
          currentUser: this.userInfo.userId,
          id: "",
          pageNo: 1,
          pageSize: this.pagination.pageSize,
          ruleStatus: "",
          warningLevel: "",
          warningRuleName: "",
          warningType: "",
          categoryId: rules.value === "0-0" ? "" : rules.value,
        };
        this.getRuleList(json);
      }
    },
    addList(e, key) {
      e.stopPropagation();
      this.defaultKey = key;
      this.showList = true;
    },
    addFolder(e) {
      e.stopPropagation();
      this.showFolder = true;
    },
    async okList() {
      if (this.listName !== "" && this.defaultKey !== "") {
        this.showList = false;
        const json = {
          categoryName: this.listName,
          parentId: this.defaultKey === "0-0" ? -1 : this.defaultKey,
          status: 0,
          categoryType: 0,
        };
        const data = await addListCategory(json);
        if (data.message === "成功") {
          this.$message.success("添加成功");
          this.init();
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
    async okFolder() {
      if (this.folderName !== "") {
        this.showFolder = false;
        const json = {
          categoryName: this.folderName,
          parentId: -1,
          categoryType: 0,
        };
        const data = await addListCategory(json);
        if (data.message === "成功") {
          this.$message.success("添加成功");
          this.init();
        } else {
          this.$message.info(`添加失败 ${data.message}`);
        }
      } else {
        this.$message.warning("文件夹名字不可为空！");
        this.folderName = "";
      }
    },
    cancelFolder() {
      this.showFolder = false;
    },
    async detailInfo(record) {
      this.getRuleDetails("check", record);
    },
    checkToEdit(record) {
      this.ruleName = record.ruleName;
      this.graphId = record.graphId;
      this.ruleClass = record.categoryId;
      this.ruleLevel = record.level;
      this.ruleModel = record.ruleModelId || undefined;
      this.startStopTime = record.startStopTime;
      this.checkNum = record.checkDate;
      this.checkUnit = record.cycleUnit || 0;
      this.addTitle = "编辑规则";
    },
    async editInfo(record) {
      this.getRuleDetails("edit", record);
    },
    async getRuleDetails(type, record) {
      const detailData = await getRuleDetails(record.id);
      if (!detailData) {
        this.$message.error("查询规则详情失败");
        return false;
      }
      this.graphId = detailData.graphId;
      detailData.startStopTime = [
        moment(detailData.effectStartDate || undefined).format("YYYY-MM-DD"),
        moment(detailData.effectEndDate || undefined).format("YYYY-MM-DD"),
      ];
      const checkData = detailData;
      checkData.levelText =
        detailData.level === 1
          ? "一级"
          : detailData.level === 2
          ? "二级"
          : detailData.level === 3
          ? "三级"
          : "";
      checkData.modelId = detailData.ruleModelId;
      // this.checkedList = detailData.relateWaringList.map((item) => item.id);
      // this.checkAll =
      //   this.plainOptions.length === this.checkedList.length ? true : false;
      // this.indeterminate =
      //   this.plainOptions.length > this.checkedList.length &&
      //   this.checkedList.length > 0
      //     ? true
      //     : false;
      const target = find(this.modelOptions, (o) => o.value === record.modelId);
      await this.getModelGraph(record.modelId, target);
      const nodeType = detailData.customerVos.map((item) => {
        return {
          label: item.vertexLabelId,
          attr: item.propertyName,
        };
      });
      this.customerVos = nodeType;
      this.ruleObjs.label = this.getLabel(nodeType);

      if (type === "edit") {
        this.checkToEdit(detailData);
      } else {
        checkData.typeName = detailData.typeName ? detailData.typeName : "全部";
        this.addTitle = "查看规则";
      }
      this.checkData = checkData;
      this.addRuleVisible = true;
      this.getModalList();
    },
    async testInfo(record) {
      const loading = this.$message.loading("正在执行", 0);
      const res = await doModelTask(record.id);
      loading();
      if (res.message === "成功") {
        this.$message.success("执行成功");
      } else {
        this.$message.error(`${res.message}`);
      }
    },
    async checkInfo(record) {
      if (this.process) {
        return false;
      }
      this.process = true;
      const loading = this.$message.loading("正在查询", 0);
      const json = {
        currentUser: this.userInfo.userId,
        pageNo: 1,
        pageSize: 100,
        ruleName: record.ruleName,
        warningRuleId: record.id,
      };
      const data = await getWarningList(json);
      loading();
      this.process = false;
      if (data && data.dateList && data.dateList.length) {
        this.$router.push({
          name: "riskWarningInfo",
          params: {
            ruleName: record.ruleName,
            warningRuleId: record.id,
          },
        });
      } else {
        this.$message.info("暂无线索信息");
      }
    },
    async startRule(record) {
      const json = {
        id: record.id,
        status: record.status === "上线" ? "1" : "0",
      };
      const data = await editWarningRuleStatus(json);
      if (data.message === "成功") {
        const message = record.status === "上线" ? "停用成功" : "启用成功";
        this.$message.success(message);
        this.onSearch("init");
      } else {
        const message =
          record.status === "上线"
            ? `停用失败 ${data.message}`
            : `启用失败 ${data.message}`;
        this.$message.error(message);
      }
    },
    handleDelete(record) {
      const _that = this;
      const title = `确定要删除 ${record.ruleName} 吗？`;
      const onOk = async () => {
        const json = {
          warningRuleId: record.id,
        };
        const data = await deleteSingleRules(json);
        if (data.message === "成功") {
          _that.onSearch("init");
          _that.$message.success("删除成功");
        } else {
          _that.$message.error(`删除失败，${data.message}`);
        }
      };
      modalConfirm(title, _that, onOk);
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
          _that.init();
        } else {
          _that.$message.error(`删除失败，${data.message}`);
        }
      };
      modalConfirm(title, _that, onOk);
    },
    async onSearch(type) {
      this.tableLoading = true;
      if (type === "init") {
        this.$set(this.pagination, "current", 1);
      }
      const json = {
        currentUser: this.userInfo.userId,
        id: this.warningId,
        pageNo: this.pagination.current,
        pageSize: this.pagination.pageSize,
        ruleStatus: this.warningState,
        warningLevel: this.warningLevel,
        warningRuleName: this.warningName,
        warningType: this.warningType,
        categoryId: this.warningClass === "0-0" ? "" : this.warningClass,
      };
      this.getRuleList(json);
      this.ruleClass = undefined;
      this.defaultKey = "0-0";
    },
    async getRuleList(json) {
      const data = await searchRuleList(json);
      if (!data) {
        this.$message.error("获取规则列表失败");
      } else {
        this.$set(this.pagination, "total", parseInt(data.totalCount));
        this.tableValue = data.dateList.map((item) => {
          return {
            ...item,
            ruleType: item.ruleType === "1" ? "内置" : "自定义",
            status: item.ruleStatus === "0" ? "上线" : "草稿",
          };
        });
      }
      this.tableLoading = false;
    },
    onReset(type) {
      this.warningId = "";
      this.warningName = "";
      this.warningState = "";
      this.warningLevel = "";
      this.warningClass = "0-0";
      this.warningType = "";
      this.ruleClass = undefined;
      if (type === "init") {
        this.onSearch("init");
      }
    },
    handleAddRule() {
      this.addRuleVisible = true;
      this.addTitle = "新建规则";
      this.getModalList();
    },
    // onCheckAllChange(e) {
    //   this.indeterminate = false;
    //   this.checkAll = e.target.checked;
    //   this.checkedList = e.target.checked
    //     ? this.plainOptions.map((item) => item.value)
    //     : [];
    // },
    // onChange(checkedList) {
    //   if (checkedList.length === 0) {
    //     this.indeterminate = false;
    //     this.checkAll = false;
    //   } else if (checkedList.length < this.plainOptions.length) {
    //     this.indeterminate = true;
    //     this.checkAll = false;
    //   } else {
    //     this.indeterminate = false;
    //     this.checkAll = true;
    //   }
    // },
    async handleconfirm() {
      if (!this.ruleName) {
        this.$message.warning("请输入规则名称");
        return false;
      }
      if (!this.ruleClass) {
        this.$message.warning("请选择规则分类");
        return false;
      }
      if (!this.ruleLevel) {
        this.$message.warning("请选择规则等级");
        return false;
      }
      if (!this.startStopTime.length) {
        this.$message.warning("请选择生效日期");
        return false;
      }
      if (!this.checkNum) {
        this.$message.warning("请输入检测周期");
        return false;
      }
      if (!this.graphId) {
        this.$message.warning("请选择应用图谱");
        return false;
      }
      const index = findIndex(
        this.modelOptions,
        (o) => o.value === this.ruleModel
      );
      if (!this.ruleModel || index === -1) {
        this.$message.warning("请选择模型");
        return false;
      }
      const propertyVoList = [];
      if (!this.ruleObjs.label.length) {
        // || !this.ruleObjs.value
        this.$message.warning("请选择线索主体");
        return false;
      } else {
        // 校验有没有选择主体的属性
        let flag = false;
        for (let i = 0; i < this.ruleObjs.label.length; i++) {
          const ele = this.ruleObjs.label[i];
          if (!ele.attr) {
            flag = true;
            break;
          }
        }
        if (flag) {
          this.$message.warning("请选择线索主体的属性");
          return false;
        } else {
          this.ruleObjs.label.map((item) => {
            propertyVoList.push({
              propertyName: item.attr,
              vertexLabelId: item.value,
            });
          });
        }
      }
      let json = {
        warningRuleId: this.addTitle === "编辑规则" ? this.checkData.id : "",
        ruleName: this.ruleName,
        level: this.ruleLevel,
        ruleModel: this.ruleModel,
        effectEndDate: this.startStopTime[1],
        effectStartDate: this.startStopTime[0],
        cycleUnit: this.checkUnit,
        dateNum: this.checkNum,
        categoryIds: [this.ruleClass],
        graphId: this.graphId,
        checkStatus: 0,
        propertyVoList,
      };
      const res = await addOrEditWarningRule(json);
      if (res.message === "成功") {
        this.$message.success(
          this.addTitle === "编辑规则" ? "修改成功" : "添加成功"
        );
        this.handleCancel();
        this.onSearch("init");
      } else if (res.message === "图谱、模型不一致请确认") {
        const _that = this;
        const title = `该模型对应的图与当前选择的图不匹配，是否确认当前选择并继续提交？`;
        const onOk = async () => {
          json.checkStatus = 1;
          const data = await addOrEditWarningRule(json);
          if (data.message === "成功") {
            _that.$message.success(
              _that.addTitle === "编辑规则" ? "修改成功" : "添加成功"
            );
            _that.onSearch("init");
          } else {
            _that.$message.info(
              _that.addTitle === "编辑规则"
                ? `修改失败 ${data.message}`
                : `添加失败 ${data.message}`
            );
          }
          _that.handleCancel();
        };
        modalConfirm(title, _that, onOk);
      } else {
        this.$message.info(
          this.addTitle === "编辑规则"
            ? `修改失败 ${res.message}`
            : `添加失败 ${res.message}`
        );
      }
    },
    handleCancel() {
      this.addRuleVisible = false;
      this.handleReset();
    },
    filterOption(inputValue, option) {
      if (option.componentOptions.propsData.title.indexOf(inputValue) !== -1) {
        return true;
      } else {
        return false;
      }
    },
    handleReset() {
      this.checkData = {};
      this.ruleName = "";
      this.graphId = undefined;
      this.ruleClass = undefined;
      this.ruleLevel = undefined;
      this.ruleModel = undefined;
      this.startStopTime = undefined;
      this.checkNum = "";
      this.checkUnit = 0;
      this.checkedList = [];
      this.checkAll = false;
      this.indeterminate = false;
      this.checkGraphVisible = false;
      this.modelData = {
        edgeMetas: [],
        vertexMetas: [],
      };
      this.ruleObjs = {
        value: undefined,
        label: [],
      };
      this.selectedNodes = [];
      this.selectedEdges = [];
    },
    async handleSelect(value) {
      this.ruleModel = value;
      const index = findIndex(this.modelOptions, (o) => o.value === value);
      if (value && index !== -1 && this.graphId) {
        this.getModelGraph(value, this.modelOptions[index]);
        this.ruleObjs.label = [];
      }
    },
    // handleChangeObjs(value) {},
    selectedElesChanged(nodes, edges) {
      this.selectedNodes = nodes;
      this.selectedEdges = edges;
      if (this.addTitle === "新建规则") {
        if (nodes.length) {
          this.ruleObjs.label = this.isModel
            ? this.getLabel(nodes[0].nodeType)
            : this.getLabel([
                {
                  label: nodes[0].nodeType,
                },
              ]);
        }
      } else if (this.addTitle === "编辑规则") {
        if (nodes.length) {
          const arr1 = this.customerVos.map((item) => item.label);
          const arr2 = nodes[0].nodeType.map((item) => item.label);
          const flag = JSON.stringify(arr1) == JSON.stringify(arr2);
          if (flag) {
            this.ruleObjs.label = this.isModel
              ? this.getLabel(this.customerVos)
              : this.getLabel([
                  {
                    label: this.customerVos,
                  },
                ]);
          } else {
            this.ruleObjs.label = this.isModel
              ? this.getLabel(nodes[0].nodeType)
              : this.getLabel([
                  {
                    label: nodes[0].nodeType,
                  },
                ]);
          }
        }
      }
    },
    async getModelGraph(value, target) {
      const type = target && target.modelType;
      const loading = this.$message.loading("正在获取图谱结构信息", 0);
      let res = undefined;
      let schemaInfo = undefined;
      let schemaId = undefined;
      if (type === 2) {
        // 脚本化
        // 2022-6-30讨论结果：用图谱选择的结果作为模型的schemaId
        schemaId = find(
          this.graphOptions,
          (v) => v.value === this.graphId
        ).schemaId;
      } else {
        // 配置化
        res = await getRuleModelDetails(value);
        schemaInfo = JSON.parse(res.data.schemaInfo);
        schemaId = res.data.schemaId;
      }
      let schemaData = undefined;
      const propertyData = [];
      if (schemaId) {
        schemaData = await graphPreview(schemaId);
        if (
          schemaData &&
          schemaData.vertexMetas &&
          schemaData.vertexMetas.length
        ) {
          if (type === 2) {
            // 脚本化
            schemaInfo = schemaData;
          }
          schemaData.vertexMetas.map((vertex) => {
            propertyData.push({
              label: vertex.label,
              property: vertex.property,
            });
          });
          this.propertyData = propertyData;
        } else {
          loading();
          this.schemaData = {};
          this.$message.destroy();
          this.$message.info("暂无图谱结构信息，请重新选择");
          this.checkGraphVisible = false;
          return false;
        }
      } else {
        loading();
        this.schemaData = {};
        this.$message.destroy();
        this.$message.info("暂无图谱结构信息，请重新选择");
        this.checkGraphVisible = false;
        return false;
      }
      if (
        schemaInfo &&
        schemaInfo.vertexMetas &&
        schemaInfo.vertexMetas.length
      ) {
        this.modelData = schemaInfo;
        if (type === 2) {
          this.isModel = false;
        } else {
          this.isModel = true;
        }
        this.checkGraphVisible = true;
        loading();
      } else {
        this.$message.destroy();
        this.$message.info("暂无图谱结构信息");
        this.checkGraphVisible = false;
      }
    },
    getLabel(target) {
      const result = [];
      target.map((item) => {
        const propTarget = find(
          this.propertyData,
          (v) => v.label === item.label
        );
        const options = propTarget.property.map((v) => {
          return {
            value: v,
            label: v,
          };
        });
        result.push({
          value: item.label,
          attr: item.attr || undefined,
          options,
        });
      });
      return result;
    },
    onGraphChange(value) {
      this.graphId = value;
      if (!this.modelData.vertexMetas.length && this.ruleModel) {
        const target = find(
          this.modelOptions,
          (o) => o.value === this.ruleModel
        );
        this.getModelGraph(this.ruleModel, target);
      }
    },
    async getModalList() {
      // 查询模型列表
      const res = await queryRuleModelList();
      const modelOptions = [];
      if (res.message !== "成功" || !res.data) {
        this.$message.error("获取模型失败");
      } else {
        res.data.map((item) => {
          modelOptions.push({
            value: item.id,
            label: item.modelName,
            modelType: item.modelType,
          });
        });
        this.modelOptions = modelOptions;
      }
    },
  },
};
</script>
<style lang="less">
.ant-input-disabled,
.ant-checkbox-disabled > .ant-checkbox-input,
.ant-checkbox-wrapper-disabled > span,
.ant-select-disabled > .ant-select-selection {
  background: #fff !important;
  color: rgba(0, 0, 0, 0.65) !important;
}

.risk-warning-rules {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-between;

  .rules-left {
    width: 25%;
    margin-right: 24px;
  }

  .rules-right {
    flex: 1;
    height: 100%;
    display: flex;
    border-radius: 5px;
    flex-direction: column;
    width: calc(75% - 24px);

    .table-list-top-item {
      width: calc((100% - 96px) / 4);
    }
  }

  .add-rule-part {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 12px;
    position: relative;
    padding-bottom: 56px;
    background: @contentColor;

    &-content {
      height: 100%;
      overflow: auto;

      .content-sub-title {
        .info-circle {
          width: 16px;
          height: 16px;
          margin-left: 6px;
        }
      }
    }

    &-title {
      color: #000;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .rule-content {
      display: flex;
      padding: 0 20px;
      flex-wrap: wrap;
      margin-bottom: 6px;

      &-item {
        width: 25%;
        max-width: 300px;
        margin-right: 5%;
        margin-bottom: 24px;

        &.event-item {
          width: 100%;
          max-width: 100%;

          .config-btns {
            margin: 14px 0;

            &-btn {
              margin-right: 16px;
            }
          }
        }

        &-title {
          color: #000;
          margin-bottom: 10px;

          .require {
            color: #ff3838;
            margin-right: 5px;
          }

          .info-circle {
            width: 14px;
            height: 14px;
            cursor: pointer;
            margin-left: 8px;
          }
        }

        &-input {
          width: 100%;

          .ant-select {
            width: 50%;
          }

          .config-num-input {
            width: calc(50% - 10px);
            margin-right: 10px;
          }
        }
      }

      &-title,
      .ant-checkbox-wrapper {
        margin-right: 8px;
        margin-bottom: 8px;
      }

      .ant-checkbox-group {
        display: contents;
      }

      @media screen and (max-width: 1587px) {
        .rule-content-model {
          width: calc((100% - 20px) / 2);
          padding-top: calc((100% - 20px) / 2 * 0.7 + 30px);
        }
        .rule-content-options {
          width: calc((100% - 20px) / 2);
        }
      }

      @media screen and (min-width: 1587px) {
        .rule-content-model {
          width: 600px;
          padding-top: 450px;
        }
        .rule-content-options {
          width: calc(100% - 620px);
        }
      }

      &-model,
      &-options,
      .rule-objs,
      .rule-objs-title {
        transition: all 0.1s;
      }

      &-model {
        margin-right: 20px;
        position: relative;
        margin-bottom: 24px;

        &-box {
          top: 0;
          width: 100%;
          height: 100%;
          max-height: 450px;
          position: absolute;
        }
      }

      &-options {
        .rule-objs {
          border-bottom: 1px solid #f2f3f5;

          &-title {
            padding-bottom: 8px;
            color: #4e5969;
          }

          &-select {
            width: 100%;
            max-width: 300px;
          }
        }

        .objs-attr-part {
          display: flex;
          padding: 12px 0;
          flex-wrap: wrap;

          &-item {
            height: 32px;
            display: flex;
            max-width: 380px;
            min-width: 260px;
            margin-right: 60px;
            align-items: center;
            margin-bottom: 16px;
            width: calc((100% - 120px) / 2);

            .item-label {
              color: #4e5969;
              padding-right: 5px;
              white-space: nowrap;
            }

            .item-select {
              width: 100%;
            }
          }
        }

        .objs-attr-tips {
          color: #f60001;
          padding: 16px 0;
        }
      }
    }

    .rule-content-upload {
      padding: 0 20px;
      margin-bottom: 30px;

      .ant-upload.ant-upload-drag {
        width: 70%;
        background: #fff;

        .ant-upload-btn {
          .ant-upload-drag-container {
            .csv-file-img {
              color: @activeFontColor;
              padding: 10px;
            }

            .upload-text {
              margin-bottom: 10px;
            }

            .download-text {
              .info-circle {
                margin-right: 6px;
              }

              span:first-child {
                margin-right: 50px;
              }
            }
          }
        }
      }

      .has-files {
        .ant-upload.ant-upload-drag {
          background: #e6f7ff;
        }
      }

      .show-files {
        width: 70%;
        margin-top: 40px;

        &-title {
          height: 32px;
          display: flex;
          padding: 0 12px;
          line-height: 32px;
          margin-bottom: 10px;
          background: #fafafa;
          justify-content: space-between;

          &.fail-title {
            color: #f6001a;
          }

          .action-text {
            width: 72px;
          }

          .action {
            color: #5e5e5e;
          }
        }

        .upload-file {
          height: 27px;
          display: flex;
          padding: 0 17px;
          margin-bottom: 10px;
          justify-content: space-between;

          &-content {
            width: 450px;
            display: flex;
            align-items: center;

            .csv-file-img-line {
              width: 18px;
              height: 18px;
              margin-right: 10px;
            }

            .file-name {
              width: 344px;
              overflow: hidden;
              white-space: nowrap;
              display: inline-block;
              text-overflow: ellipsis;
            }
          }

          .check-action {
            .check-btn {
              color: @activeFontColor;
              cursor: pointer;

              &:not(:last-child) {
                margin-right: 10px;
              }

              &.disabled {
                color: #a5aab3;
                cursor: not-allowed;
              }

              &.fail {
                color: #f6001a;
              }
            }
          }

          .delete-btn {
            color: #f6001a;
            cursor: pointer;
          }
        }
      }
    }

    // .ant-radio-group {
    //   margin-bottom: 30px;

    //   .ant-radio-button-wrapper {
    //     padding: 0;
    //     border: none;
    //     margin: 0 15px;
    //     border-radius: 0;
    //     color: #515a6e;
    //     padding-bottom: 35px;

    //     &.ant-radio-button-wrapper-checked {
    //       border: none;
    //       color: @activeFontColor;
    //       background-color: #fff;
    //       border-bottom: 1px solid @activeFontColor;

    //       &:focus-within {
    //         box-shadow: none;
    //       }
    //     }

    //     &:hover {
    //       color: #2362fb;
    //     }

    //     &::before {
    //       content: none;
    //     }
    //   }
    // }

    &-btns {
      bottom: 0;
      right: 12px;
      padding-left: 6px;
      position: absolute;
      padding-bottom: 12px;

      .ant-btn {
        margin-left: 8px;
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
</style>
