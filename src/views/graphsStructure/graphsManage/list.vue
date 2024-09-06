<template>
  <TableList
    tableTitle="图谱列表"
    :columns="columns"
    :tableValue="tableValue"
    :pagination="pagination"
    :tableLoading="searchLoading3"
    tableClass="template-table"
    :rowKey="(record) => record.id"
    isDefaultFold
  >
    <template v-slot:searchOptions>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">图谱编号：</span>
        <a-input
          class="table-list-top-item-input"
          type="text"
          v-model.trim="graphId"
          placeholder="请输入图编号"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">图谱名称：</span>
        <a-input
          class="table-list-top-item-input"
          type="text"
          v-model.trim="graphName"
          placeholder="请输入图名称"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">图谱状态：</span>
        <a-select
          class="table-list-top-item-input"
          v-model="graphState"
          placeholder="请选择状态"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="0">启用</a-select-option>
          <a-select-option value="1">停用</a-select-option>
          <a-select-option value="3">创建中</a-select-option>
          <a-select-option value="4">创建失败</a-select-option>
        </a-select>
      </div>
      <div class="table-list-top-item">
        <a-button @click="onReset">重置</a-button>
        <a-button
          type="primary"
          @click="onSearch('init')"
          :loading="searchLoading1"
          v-if="userRights.btn_graphQuery"
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
        >刷新</a-button
      >
      <a-button
        class="header-btn"
        icon="file-add"
        type="primary"
        @click="handleAdd"
        v-if="userRights.btn_graphCreate"
      >
        新建
      </a-button>
    </template>
    <template v-slot:actionsSlot="{ record }">
      <a
        @click="handleSkip(record)"
        v-if="record.state !== '4'"
        :class="record.state === '3' ? 'disabled' : ''"
        >探索</a
      >
      <a @click="handleRetry(record)" v-else-if="userRights.btn_graphCreate"
        >重试</a
      >
      <a
        v-if="userRights.btn_graphUpdateStatus"
        @click="handleStop(record)"
        :class="record.state !== '0' && record.state !== '1' ? 'disabled' : ''"
        >{{ record.state === "0" ? "停用" : "启用" }}</a
      >
      <a
        @click="handleCheckEdition(record)"
        :class="record.state !== '0' && record.state !== '1' ? 'disabled' : ''"
        v-if="userRights.btn_graphVersion"
        >版本</a
      >
      <a-popover overlayClassName="more-actions">
        <template slot="content">
          <p
            :class="
              record.state === '1' || record.state === '4' ? '' : 'disabled'
            "
            @click="handleDelete(record)"
            v-if="userRights.btn_graphDelete"
          >
            删除
          </p>
          <p
            @click="handleSetStrategy(record)"
            :class="
              record.state !== '0' && record.state !== '1' ? 'disabled' : ''
            "
            v-if="userRights.btn_graphUpdate"
          >
            更新策略
          </p>
          <p
            @click="checkUpdateDetail(record, 'init')"
            :class="
              record.state !== '0' && record.state !== '1' ? 'disabled' : ''
            "
            v-if="userRights.btn_graphUpdateDetail"
          >
            更新详情
          </p>
        </template>
        <a>更多</a>
      </a-popover>
      <a
        v-if="
          !userRights.btn_graphCreate &&
          !userRights.btn_graphUpdateStatus &&
          !userRights.btn_graphVersion &&
          !userRights.btn_graphDelete &&
          !userRights.btn_graphUpdate &&
          !userRights.btn_graphUpdateDetail
        "
        class="no-action"
      >
        暂无操作权限
      </a>
    </template>
    <template v-slot:otherPart>
      <a-modal
        centered
        :width="630"
        :footer="null"
        title="历史版本"
        @cancel="onCancel"
        class="edition-modal"
        :destroyOnClose="true"
        :visible="editionModalShow"
      >
        <div class="edition-modal-content">
          <table-component
            :columns="columns2"
            :data-source="tableValue2"
            :rowKey="(record) => record.id"
            :row-selection="rowSelection"
            :pagination="pagination2"
            :loading="searchLoading4"
            class="edition-table"
            border
          >
            <div class="edition-slot" slot="edition" slot-scope="record">
              <span class="edition-slot-text">
                {{ record.edition.value }}
              </span>
              <span class="edition-slot-label" v-if="record.edition.isCurrent">
                当前版本
              </span>
            </div>
            <span slot="actions" slot-scope="record">
              <a
                @click="handleDeleteEdition(record)"
                :class="pagination2.total === 1 ? 'disabled' : ''"
                >删除</a
              >
            </span>
          </table-component>
          <div class="edition-modal-content-footer">
            <a-button class="footer-btn" @click="onCancel">取消</a-button>
            <a-button
              class="footer-btn"
              type="primary"
              @click="handleSelected"
              v-if="userRights.btn_selectGraphBranch"
              >回溯至该版本</a-button
            >
          </div>
        </div>
      </a-modal>
      <a-modal
        centered
        :width="580"
        okText="确定"
        @ok="handleOk"
        class="strategy-modal"
        :destroyOnClose="true"
        @cancel="onStrategyCancel"
        :visible="strategyModalShow"
      >
        <template slot="title">
          <span class="strategy-modal-title" ref="title">更新策略配置</span>
          <a-tooltip
            placement="right"
            :getPopupContainer="() => $refs.title"
            overlayClassName="strategy-modal-tooltip"
          >
            <template slot="title">
              <span>后台更新任务执行时，“立即更新”选项不可用</span>
            </template>
            <icon-svg icon-class="info_circle" class="info-circle" />
          </a-tooltip>
        </template>
        <div class="strategy-modal-content">
          <a-radio-group
            name="strategyGroup"
            v-model="strategyValue"
            class="strategy-group"
          >
            <a-radio :value="0">暂不更新</a-radio>
            <a-radio :value="3" :disabled="isDisabled">立即更新</a-radio>
            <a-radio :value="2">周期更新</a-radio>
          </a-radio-group>
          <div class="strategy-modal-content-box" v-if="strategyValue === 2">
            <a-radio-group
              name="cycleGroup"
              v-model="cycleValue"
              class="cycle-group"
            >
              <a-radio :value="1">
                <span class="cycle-group-title">固定周期更新</span>
                <a-select
                  class="cycle-group-input"
                  v-model="value1"
                  placeholder="请选择"
                >
                  <a-select-option :value="1">每月第一天</a-select-option>
                  <a-select-option :value="4">每月最后一天</a-select-option>
                  <a-select-option :value="5">每周一</a-select-option>
                  <a-select-option :value="6">每周日</a-select-option>
                </a-select>
              </a-radio>
              <a-radio :value="2">
                <span class="cycle-group-title">自定义周期更新</span>
                <a-input-number
                  :min="1"
                  :precision="0"
                  v-model="value2"
                  placeholder="请输入"
                  class="cycle-group-input left"
                  :parser="(value) => (/^\d+$/.test(value) ? value : 1)"
                />
                <a-select
                  class="cycle-group-input right"
                  v-model="value3"
                  placeholder="请选择"
                >
                  <a-select-option :value="0">天</a-select-option>
                  <a-select-option :value="1">周</a-select-option>
                  <a-select-option :value="2">月</a-select-option>
                </a-select>
              </a-radio>
            </a-radio-group>
            <div class="box-item">
              <span class="cycle-group-title">选择生效时间段</span>
              <a-range-picker
                v-model="value4"
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                class="cycle-group-input"
              >
                <template slot="suffixIcon">
                  <a-icon type="calendar" />
                </template>
              </a-range-picker>
            </div>
          </div>
        </div>
      </a-modal>
      <a-modal
        centered
        :width="734"
        okText="确定"
        title="更新详情"
        @ok="handleConfirm"
        :destroyOnClose="true"
        class="update-detail-modal"
        @cancel="onUpdateDetailCancel"
        :visible="updateDetailModalShow"
      >
        <div class="update-detail-modal-content">
          <p class="header-title">当前版本号：{{ details.edition }}</p>
          <p class="table-title">更新记录：</p>
          <table-component
            :columns="columns3"
            :data-source="tableValue3"
            :rowKey="(record) => record.id"
            :pagination="pagination3"
            :loading="searchLoading4"
            class="update-table"
            border
          >
            <div class="result-slot" slot="result" slot-scope="record">
              <span class="result-slot-text" v-if="record.result === 0"
                ><a-icon type="loading" class="blue" />更新中...</span
              >
              <span class="result-slot-text" v-else-if="record.result === 1"
                ><img
                  src="@/assets/images/img/error.svg"
                  alt=""
                />更新失败</span
              >
              <span class="result-slot-text" v-else
                ><img
                  src="@/assets/images/img/success.svg"
                  alt=""
                />更新成功</span
              >
            </div>
          </table-component>
        </div>
      </a-modal>
    </template>
  </TableList>
</template>
<script>
import TableComponent from "@/components/tableComponent";
import TableList from "@/components/tableList";
import {
  Badge,
  Button,
  DatePicker,
  Input,
  InputNumber,
  Popover,
  Radio,
  Tooltip,
} from "ant-design-vue";
import {
  queryGraphByPage,
  updateStatus,
  deleteGraphTable,
} from "@/shared/api/configManage.js";
import {
  queryGraphVersion,
  graphUpdateDetail,
  delGraphBranch,
  updateGraphTable,
  selectGraphBranch,
  getGraphState,
  createGraph,
} from "@/shared/api/graphsStructure.js";
import { modalConfirm } from "@/utils/common.js";
import { mapState, mapMutations } from "vuex";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Group } = Radio;

export default {
  name: "GraphsManageList",
  data() {
    return {
      graphId: "",
      graphState: "",
      graphName: "",
      searchLoading1: false, // 查询按钮
      searchLoading2: false, // 刷新按钮
      searchLoading3: false, // 表格
      searchLoading4: false, // 弹窗内表格
      columns: [
        {
          title: "图谱编号",
          dataIndex: "id",
          key: "id",
          width: 120,
        },
        {
          title: "图谱名称",
          dataIndex: "name",
          key: "name",
          width: 140,
        },
        {
          title: "版本号",
          dataIndex: "edition",
          key: "edition",
          width: 100,
        },
        {
          title: "图谱描述",
          dataIndex: "desc",
          key: "desc",
          width: 170,
        },
        {
          title: "生成时间",
          dataIndex: "createDate",
          key: "createDate",
          width: 120,
          sorter: true,
        },
        {
          title: "图谱状态",
          dataIndex: "stateText",
          key: "stateText",
          width: 105,
          scopedSlots: { customRender: "state" },
          customRender: (text, record) => {
            return (
              <a-badge
                color={
                  record.state === "0"
                    ? "#52C41A"
                    : record.state === "1"
                    ? "rgba(0, 0, 0, 0.25)"
                    : record.state === "3"
                    ? "#FA8C16"
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
      columns2: [
        {
          title: "版本号",
          dataIndex: "edition",
          key: "edition",
          width: 258,
          scopedSlots: { customRender: "edition" },
        },
        {
          title: "生成时间",
          dataIndex: "time",
          key: "time",
          width: 180,
          sorter: true,
        },
        {
          title: "操作",
          dataIndex: "actions",
          key: "actions",
          width: 76,
          scopedSlots: { customRender: "actions" },
        },
      ],
      columns3: [
        {
          title: "开始时间",
          dataIndex: "startTime",
          key: "startTime",
          width: 180,
          sorter: true,
        },
        {
          title: "结束时间",
          dataIndex: "endTime",
          key: "endTime",
          width: 180,
          sorter: true,
        },
        {
          title: "结果",
          dataIndex: "result",
          key: "result",
          width: 120,
          scopedSlots: { customRender: "result" },
        },
        {
          title: "版本号",
          dataIndex: "edition",
          key: "edition",
          width: 200,
        },
      ],
      tableValue: [],
      tableValue2: [],
      tableValue3: [],
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
      pagination2: {
        size: "small",
        total: 0,
        current: 1,
        pageSize: 5,
        onChange: (page, pageSize) => {
          this.pagination2.current = page;
          this.pagination2.pageSize = pageSize;
          this.getGraphEdition("repeat");
        },
      },
      pagination3: {
        size: "small",
        total: 0,
        current: 1,
        pageSize: 5,
        onChange: (page, pageSize) => {
          this.pagination3.current = page;
          this.pagination3.pageSize = pageSize;
          this.checkUpdateDetail(this.details, "repeat");
        },
      },
      editionModalShow: false,
      strategyModalShow: false,
      updateDetailModalShow: false,
      strategyValue: 0,
      cycleValue: 1,
      isDisabled: false,
      value1: undefined,
      value2: undefined,
      value3: 0,
      value4: [],
      details: {},
      selectedRowKeys: [],
    };
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
    ABadge: Badge,
    AButton: Button,
    AInput: Input,
    AInputNumber: InputNumber,
    APopover: Popover,
    ARadio: Radio,
    ARadioGroup: Group,
    ARangePicker: RangePicker,
    ATooltip: Tooltip,
    TableComponent,
    TableList,
  },
  mounted() {
    this.getDataList("init");
  },
  computed: {
    ...mapState("rightsOptions", ["userRights"]),
    rowSelection() {
      return {
        // columnTitle: "",
        type: "radio",
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys;
        },
      };
    },
  },
  methods: {
    ...mapMutations("graphOptions", {
      setGraphId: "setGraphId",
      setSchemaId: "setSchemaId",
      setGraphSource: "setGraphSource",
    }),
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
          this.$message.error("请输入正确的图谱编号！");
          return false;
        }
      }

      const json = {
        id: this.graphId === "" ? null : this.graphId,
        graphName: this.graphName === "" ? null : this.graphName,
        status: this.graphState,
        pageNo: this.pagination.current,
        pageSize: this.pagination.pageSize,
        // source: 1, // pierce自己构建的图谱
      };
      this.searchLoading3 = true;
      let data = null;
      try {
        data = await queryGraphByPage(json);
      } catch (error) {
        console.log(error);
      }
      this.searchLoading3 = false;
      if (!data) {
        this.$message.destroy();
        this.$message.error("获取图列表失败");
      } else {
        this.$set(this.pagination, "total", parseInt(data.totalCount));
        const tableValue = [];
        data.dateList.map((item) => {
          tableValue.push({
            id: item.id,
            name: item.graphChName,
            desc: item.graphDesc,
            state: item.status,
            edition: item.version,
            stateText:
              item.status === "0"
                ? "已启用"
                : item.status === "1"
                ? "已停用"
                : item.status === "3"
                ? "创建中"
                : "创建失败",
            ruleList: item.ruleList.length ? item.ruleList : ["暂无应用"],
            createDate: item.createDate,
            updateStrategyStatus: item.updateStrategyStatus,
            effectStartDate: item.effectStartDate,
            effectEndDate: item.effectEndDate,
            cycleUnit: item.cycleUnit,
            checkDate: item.checkDate,
            branchId: item.branchId,
            schemaId: item.schemaId,
            graphSource: item.source,
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
      if (record.state !== "1" && record.state !== "4") return false;
      const _that = this;
      const title = `确定要删除 ${record.name} 吗？`;
      const onOk = async () => {
        const json = {
          id: record.id,
        };
        const data = await deleteGraphTable(json);
        if (data.message === "成功") {
          _that.getDataList("init");
          _that.$message.success("删除成功");
        } else {
          _that.$message.error(`删除失败，${data.message}`);
        }
      };
      modalConfirm(title, _that, onOk);
    },
    async handleStop(record) {
      if (record.state !== "0" && record.state !== "1") return false;
      const _that = this;
      const action = record.state === "0" ? "停用" : "启用";
      const title = `确定要${action} ${record.name} 吗？`;
      const onOk = async () => {
        const json = {
          id: record.id,
          status: record.state === "0" ? "1" : "0",
        };
        const data = await updateStatus(json);
        if (data.message === "成功") {
          _that.$message.success(`${action}成功`);
          _that.getDataList("init");
        } else {
          _that.$message.error(`${action}失败 ${data.message}`);
        }
      };
      modalConfirm(title, _that, onOk);
    },
    handleAdd() {
      this.$emit("isCreateShowChanged", true);
    },
    handleSkip(record) {
      this.setGraphId(record.id);
      this.setSchemaId(record.schemaId);
      this.setGraphSource(record.graphSource);
      sessionStorage.setItem("graphId", record.id);
      sessionStorage.setItem("schemaId", record.schemaId);
      sessionStorage.setItem("graphSource", record.graphSource);
      this.$router.push({
        name: "affairGraphAnalysis",
        params: {
          isSkip: true,
        },
      });
    },
    async handleRetry(record) {
      const json = {
        id: record.schemaId,
        graphName: record.name,
        graphDesc: record.desc,
      };
      const loading = this.$message.loading("正在重试", 0);
      const res = await createGraph(json);
      loading();
      if (res.message === "成功") {
        this.getDataList("init");
      } else {
        this.$message.error(res.message);
      }
    },
    async handleCheckEdition(record) {
      if (record.state !== "0" && record.state !== "1") return;
      this.details = record;
      const loading = this.$message.loading("正在查询", 0);
      await this.getGraphEdition("init");
      loading();
      this.editionModalShow = true;
    },
    async getGraphEdition(type) {
      if (type === "init") {
        this.$set(this.pagination2, "current", 1);
      }
      const json = {
        id: this.details.id,
        pageNo: this.pagination2.current,
        pageSize: this.pagination2.pageSize,
      };
      const res = await queryGraphVersion(json);
      if (res.message === "成功") {
        const tableValue2 = [];
        res.data.dateList.map((item) => {
          if (item.checkBox) {
            this.selectedRowKeys = [item.id];
          }
          tableValue2.push({
            id: item.id,
            edition: {
              value: item.version,
              isCurrent: item.checkBox,
            },
            time: item.createDate,
          });
        });
        this.tableValue2 = tableValue2;
        this.$set(this.pagination2, "total", parseInt(res.data.totalCount));
      } else {
        this.tableValue2 = [];
        this.$message.error(res.message);
      }
    },
    onCancel() {
      this.editionModalShow = false;
    },
    async handleSelected() {
      if (this.selectedRowKeys[0] === this.details.branchId) {
        // 版本未改变，直接关闭弹窗
        this.onCancel();
      } else {
        const json = {
          id: this.details.id,
          graphChName: this.details.name,
          branchId: this.selectedRowKeys[0],
        };
        const loading = this.$message.loading("正在回溯至该版本", 0);
        const res = await selectGraphBranch(json);
        loading();
        if (res.message === "成功") {
          this.$message.success("回溯成功！");
          this.onCancel();
        } else {
          this.$message.error(res.message);
        }
      }
    },
    async handleDeleteEdition(record) {
      if (this.pagination2.total === 1) return false;
      const loading = this.$message.loading("正在删除", 0);
      const res = await delGraphBranch(record.id);
      loading();
      if (res.message === "成功") {
        this.$message.success("历史版本删除成功！");
        this.getGraphEdition("init");
      } else {
        this.$message.error(res.message);
      }
    },
    async handleOk() {
      let updateStrategyStatus = undefined;
      if (this.strategyValue === 2) {
        // 周期更新
        if (this.cycleValue === 1) {
          // 固定周期
          if (!this.value1) {
            this.$message.error("请选择固定周期更新时间！");
            return false;
          } else {
            updateStrategyStatus = this.value1;
          }
        } else {
          // 自定义周期
          updateStrategyStatus = this.cycleValue;
          if (!this.value2) {
            this.$message.error("请输入自定义周期检测时间！");
            return false;
          }
        }
        if (!this.value4 || !this.value4.length) {
          this.$message.error("请选择生效时间段！");
          return false;
        }
      } else {
        updateStrategyStatus = this.strategyValue;
      }
      const json = {
        id: this.details.id,
        updateStrategyStatus,
        effectStartDate: this.value4[0],
        effectEndDate: this.value4[1],
        cycleUnit: this.value3,
        checkDate: this.value2,
      };
      const loading = this.$message.loading("正在设置", 0);
      const res = await updateGraphTable(json);
      loading();
      if (res.message === "成功") {
        this.$message.success("设置更新策略成功！");
        this.onStrategyCancel();
        this.getDataList("init");
      } else {
        this.$message.error(res.message);
      }
    },
    onStrategyCancel() {
      this.strategyModalShow = false;
      this.strategyValue = 0;
      this.cycleValue = 1;
      this.value1 = undefined;
      this.value2 = undefined;
      this.value3 = 0;
      this.value4 = [];
    },
    async handleSetStrategy(record) {
      if (record.state !== "0" && record.state !== "1") return;
      this.details = record;
      const loading = this.$message.loading("正在查询", 0);
      const res = await getGraphState(record.id);
      loading();
      if (res.data !== 0) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
      if (!record.effectEndDate || !record.effectStartDate) {
        this.value4 = [];
      } else {
        this.value4 = [
          moment(record.effectStartDate).format("YYYY-MM-DD"),
          moment(record.effectEndDate).format("YYYY-MM-DD"),
        ];
      }
      if (
        record.updateStrategyStatus === 1 ||
        record.updateStrategyStatus === 4 ||
        record.updateStrategyStatus === 5 ||
        record.updateStrategyStatus === 6
      ) {
        this.strategyValue = 2;
        this.cycleValue = 1;
        this.value1 = record.updateStrategyStatus;
      } else {
        this.strategyValue = record.updateStrategyStatus;
        if (record.updateStrategyStatus === 2) {
          this.strategyValue = 2;
          this.cycleValue = 2;
          this.value2 = record.checkDate;
          this.value3 = record.cycleUnit;
        }
      }
      this.strategyModalShow = true;
    },
    handleConfirm() {
      this.onUpdateDetailCancel();
    },
    onUpdateDetailCancel() {
      this.updateDetailModalShow = false;
    },
    async checkUpdateDetail(record, type) {
      if (record.state !== "0" && record.state !== "1") return;
      if (type === "init") {
        this.$set(this.pagination3, "current", 1);
      }
      this.details = record;
      const json = {
        id: record.id,
        pageNo: this.pagination3.current,
        pageSize: this.pagination3.pageSize,
      };
      const loading = this.$message.loading("正在查询", 0);
      const res = await graphUpdateDetail(json);
      loading();
      if (res.message !== "成功") {
        this.$message.error(res.message);
        return false;
      }
      const tableValue3 = [];
      res.data.dateList.map((item) => {
        tableValue3.push({
          id: item.id,
          startTime: item.startDate,
          endTime: item.endDate,
          result: item.status,
          edition: item.version,
        });
      });
      this.tableValue3 = tableValue3;
      this.updateDetailModalShow = true;
    },
  },
};
</script>
<style lang="less">
.edition-modal {
  .ant-modal-title {
    font-weight: 600;
  }

  .ant-modal-body {
    padding: 0;
  }
  &-content {
    .edition-table {
      padding: 24px 24px 8px;

      .edition-slot {
        &-text {
          font-size: 14px;
          margin-right: 10px;
          color: @primaryTextColor;
        }

        &-label {
          color: @blue;
          padding: 0 8px;
          font-size: 12px;
          line-height: 20px;
          background: #e6f7ff;
          border: 1px solid #91d5ff;
        }
      }
    }

    &-footer {
      width: 100%;
      height: 52px;
      display: flex;
      padding: 0 24px;
      align-items: center;
      justify-content: flex-end;
      border-top: 1px solid @dividersColor;

      .footer-btn {
        &:first-child {
          margin-right: 8px;
        }
      }
    }
  }
}

.strategy-modal {
  .ant-modal-title {
    font-weight: 600;

    .info-circle {
      width: 12px;
      height: 12px;
      cursor: pointer;
      margin-left: 12px;
    }
  }

  &-tooltip {
    max-width: 320px;
  }

  &-content {
    .strategy-group {
      width: 100%;
      display: flex;
      justify-content: center;

      .ant-radio-wrapper {
        margin-right: 56px;
        color: @secondaryTextColor;

        &:last-child {
          margin-right: 0;
        }

        &.ant-radio-wrapper-checked {
          color: @primaryTextColor;
        }
      }
    }

    &-box {
      padding: 24px;
      margin-top: 24px;
      background: @backgroundColor;

      .cycle-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;

        .ant-radio-wrapper {
          width: 100%;
          margin-right: 0;
          margin-bottom: 16px;
        }

        &-title {
          width: 100px;
          margin-right: 24px;
          display: inline-block;
          color: @primaryTextColor;
        }

        &-input {
          width: 256px;

          &.left {
            width: 156px;
            margin-right: 8px;
          }

          &.right {
            width: 92px;
          }
        }
      }

      .box-item {
        padding-left: 24px;
      }
    }
  }
}

.update-detail-modal {
  .ant-modal-title {
    font-weight: 600;
  }

  .ant-modal-body {
    padding: 24px 24px 8px;
  }

  &-content {
    .header-title {
      color: @blue;
      font-size: 12px;
      margin-bottom: 16px;
    }

    .table-title {
      font-size: 12px;
      margin-bottom: 8px;
      color: @secondaryTextColor;
    }

    .update-table {
      .result-slot {
        &-text {
          .anticon,
          img {
            margin-right: 12px;

            &.blue {
              color: @blue;
            }
          }
        }
      }
    }
  }
}
</style>
