<template>
  <TableList
    listClass="risk-warning-info"
    tableTitle="线索列表"
    :columns="columns"
    :tableValue="tableValue"
    :row-selection="rowSelection"
    :pagination="pagination"
    :tableLoading="searchLoading3"
    tableClass="info-table"
    :rowKey="(record) => record.riskFlowId"
  >
    <template v-slot:searchOptions="{ isFold, handleFold }">
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">线索类型：</span>
        <a-select
          class="table-list-top-item-input"
          v-model="warningClass"
          :options="warningClassList"
          placeholder="线索类型"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">线索等级：</span>
        <a-select
          class="table-list-top-item-input"
          v-model="warningLevel"
          placeholder="线索等级"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option :value="1">一级</a-select-option>
          <a-select-option :value="2">二级</a-select-option>
          <a-select-option :value="3">三级</a-select-option>
        </a-select>
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">线索状态：</span>
        <a-select
          class="table-list-top-item-input"
          v-model="warningState"
          placeholder="线索状态"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option :value="0">待处理</a-select-option>
          <a-select-option :value="1">已处理</a-select-option>
          <a-select-option :value="2">已忽略</a-select-option>
        </a-select>
      </div>
      <div class="table-list-top-item" v-show="!isFold">
        <span class="table-list-top-item-label">选择日期：</span>
        <a-range-picker
          class="table-list-top-item-input"
          v-model="defaultTime"
          format="YYYY-MM-DD"
        >
          <template slot="suffixIcon">
            <a-icon type="calendar" />
          </template>
        </a-range-picker>
      </div>
      <div class="table-list-top-item" v-show="!isFold">
        <span class="table-list-top-item-label">线索搜索：</span>
        <a-input
          type="text"
          class="table-list-top-item-input"
          v-model.trim="warningId"
          placeholder="线索ID/流水号"
          allow-clear
        />
      </div>
      <div class="table-list-top-item" v-show="!isFold">
        <span class="table-list-top-item-label">客户名称：</span>
        <a-input
          type="text"
          class="table-list-top-item-input"
          v-model.trim="customerName"
          placeholder="客户名称"
          allow-clear
        />
      </div>
      <div class="table-list-top-item" v-show="!isFold">
        <span class="table-list-top-item-label">规则搜索：</span>
        <a-input
          type="text"
          class="table-list-top-item-input"
          v-model.trim="warningRule"
          placeholder="规则名称"
          allow-clear
        />
      </div>
      <div class="table-list-top-item">
        <a-button @click="onReset"> 重置 </a-button>
        <a-button
          type="primary"
          @click="onSearch('init')"
          :loading="searchLoading1"
          v-if="userRights.btn_searchClue"
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
      <a-button
        @click="handleDownload"
        icon="download"
        v-if="userRights.btn_downloadClue"
      >
        下载
      </a-button>
      <a-button
        class="header-btn"
        @click="handleRefresh('repeat')"
        :icon="searchLoading2 ? 'loading' : 'undo'"
        >刷新</a-button
      >
    </template>
    <template v-slot:actionsSlot="{ record }">
      <a v-if="userRights.btn_lookWarning" @click="handleCheck(record)">查看</a>
      <a
        :class="record.state === '已忽略' ? 'disabled' : ''"
        v-if="userRights.btn_handleClue"
        @click="handleSet(record)"
        >处理</a
      >
      <a v-if="userRights.btn_clueExploration" @click="handleSkip(record)"
        >探索</a
      >
      <a
        :class="record.state === '已忽略' ? 'disabled' : ''"
        v-if="userRights.btn_clueNeglect"
        @click="handleIgnore(record)"
        >忽视</a
      >
      <a
        v-if="
          !userRights.btn_lookWarning &&
          !userRights.btn_handleClue &&
          !userRights.btn_clueExploration &&
          !userRights.btn_clueNeglect
        "
        class="no-action"
      >
        暂无操作权限
      </a>
    </template>
    <template v-slot:otherPart>
      <a-drawer
        :title="modalTitle"
        placement="right"
        :closable="false"
        :visible="warningDetailsVisible"
        @close="onDetailsModalCancel"
        width="1000"
        class="info-details-modal"
      >
        <div class="info-details-top">
          <div class="info-left">
            <div class="info-left-top">
              <div class="info-image">
                <!-- <img src="" alt=""> -->
              </div>
              <div class="info-name">
                <div class="info-name-top">
                  <span class="top-text">{{ checkedRow.customerName }}</span>
                  <img src="@/assets/images/img/star_yellow.png" alt="" />
                  <a-button-group>
                    <a-button
                      :disabled="checkIndex === 0"
                      @click="handleChangeEnterprise('left', checkIndex)"
                    >
                      <a-icon type="left" />
                    </a-button>
                    <a-button
                      :disabled="checkIndex === tableValue.length - 1"
                      @click="handleChangeEnterprise('right', checkIndex)"
                    >
                      <a-icon type="right" />
                    </a-button>
                  </a-button-group>
                </div>
                <div class="info-name-bottom">
                  <span class="info-name-bottom-title">线索ID：</span>
                  <span class="info-name-bottom-content">{{
                    checkedRow.riskFlowId
                  }}</span>
                </div>
              </div>
            </div>
            <div class="info-left-bottom">
              <div class="info-left-bottom-item">
                <p class="item-title">线索类型：</p>
                <p class="item-content">{{ checkedRow.type }}</p>
              </div>
              <div class="info-left-bottom-item">
                <p class="item-title">线索状态：</p>
                <p
                  :class="
                    checkedRow.state === '待处理'
                      ? 'to-handle item-content'
                      : checkedRow.state === '已处理'
                      ? 'handled item-content'
                      : 'ignored item-content'
                  "
                >
                  {{ checkedRow.state }}
                </p>
              </div>
              <div class="info-left-bottom-item">
                <p class="item-title">最新触发时间：</p>
                <p class="item-content">
                  {{ checkedRow.last_time }}
                </p>
              </div>
            </div>
          </div>
          <div class="info-right" v-if="modalTitle === '线索详情'">
            <a-button
              class="info-right-btn"
              type="dashed"
              :disabled="checkedRow.state === '已忽略'"
              @click="handleIgnore(checkedRow)"
            >
              <a-icon type="stop" />忽略
            </a-button>
            <a-button
              class="info-right-btn"
              type="primary"
              :disabled="checkedRow.state === '已忽略'"
              @click="ChecktoSet"
            >
              <a-icon type="edit" />编辑
            </a-button>
          </div>
          <div class="info-right" v-if="modalTitle === '线索处理'">
            <a-button
              class="info-right-btn"
              type="dashed"
              @click="onDetailsModalCancel"
            >
              取消
            </a-button>
            <a-button class="info-right-btn" type="primary" @click="handleSave">
              <a-icon type="save" />保存
            </a-button>
          </div>
        </div>
        <div class="info-details-bottom">
          <div class="info-details-bottom-left">
            <div class="bottom-header left-header">
              <span class="bottom-header-title">线索处理</span>
            </div>
            <div class="left-content">
              <div class="left-content-item">
                <span class="left-content-item-label">线索信号描述：</span>
                <div class="left-content-item-content">
                  <span class="warning-desc">{{
                    checkedRow.descriptions
                  }}</span>
                </div>
              </div>
              <div class="left-content-item">
                <span class="left-content-item-label">线索等级：</span>
                <div class="left-content-item-content">
                  <span v-if="modalTitle === '线索详情'">{{
                    checkedRow.level
                  }}</span>
                  <a-select
                    v-if="modalTitle === '线索处理'"
                    v-model="checkedRow.levelValue"
                    placeholder="线索等级"
                    style="width: 120px"
                  >
                    <a-select-option :value="1">一级</a-select-option>
                    <a-select-option :value="2">二级</a-select-option>
                    <a-select-option :value="3">三级</a-select-option>
                  </a-select>
                </div>
              </div>
              <div class="left-content-item">
                <span class="left-content-item-label">备注：</span>
                <div class="left-content-item-content">
                  <a-list
                    v-if="checkedRow.remarks && checkedRow.remarks.length"
                    item-layout="horizontal"
                    :data-source="checkedRow.remarks"
                  >
                    <a-list-item slot="renderItem" slot-scope="item">
                      <a-list-item-meta :description="item.content">
                        <a slot="title">{{ item.name }}</a>
                        <!-- <a-avatar slot="avatar" :src="item.src" /> -->
                      </a-list-item-meta>
                    </a-list-item>
                  </a-list>
                  <p v-else>暂无备注</p>
                  <span
                    v-if="modalTitle === '线索处理' && !remarkInputShow"
                    class="add-remarks-btn"
                    @click="handleAddRemark"
                  >
                    <a-icon type="form" />备注
                  </span>
                  <a-textArea
                    v-if="modalTitle === '线索处理' && remarkInputShow"
                    v-model.trim="addRemarkContent"
                    class="item-content-input"
                    :auto-size="{ minRows: 3, maxRows: 4 }"
                  />
                </div>
              </div>
              <div class="left-content-item">
                <span class="left-content-item-label">状态：</span>
                <div class="left-content-item-content">
                  <span v-if="modalTitle === '线索详情'">{{
                    checkedRow.state
                  }}</span>
                  <a-select
                    v-if="modalTitle === '线索处理'"
                    v-model="eidtType"
                    style="width: 120px"
                  >
                    <a-select-option value="待处理">待处理</a-select-option>
                    <a-select-option value="已处理">已处理</a-select-option>
                  </a-select>
                </div>
              </div>
              <div class="left-content-item">
                <span class="left-content-item-label">线索设置：</span>
                <div class="left-content-item-content">
                  <div
                    v-if="
                      modalTitle === '线索详情' && !checkedRow.warningConfig
                    "
                  >
                    <p>暂未设置忽略周期</p>
                  </div>
                  <div
                    v-if="modalTitle === '线索详情' && checkedRow.warningConfig"
                  >
                    <p>已设置最近一段时间周期范围内不再更新该企业的线索信息</p>
                    <div>
                      <span>忽略周期：</span>
                      <span>{{
                        checkedRow.warningConfigNum +
                          checkedRow.ignoreTimeUnitStr || "暂未设置"
                      }}</span>
                    </div>
                  </div>
                  <div v-if="modalTitle === '线索处理'">
                    <p>是否最近一段时间周期范围内不再更新该企业的线索信息？</p>
                    <a-radio-group v-model="warningConfig">
                      <a-radio :value="1">是</a-radio>
                      <a-radio :value="0">否</a-radio>
                    </a-radio-group>
                    <div v-if="warningConfig">
                      <span>忽略周期：</span>
                      <a-input-number
                        class="warning-config-input"
                        v-model.trim="warningConfigNum"
                        placeholder="请输入数字"
                        :disabled="modalTitle === '线索详情'"
                        :min="1"
                        :precision="0"
                      />
                      <a-select
                        v-model="warningConfigUnit"
                        style="width: 120px"
                        :disabled="modalTitle === '线索详情'"
                      >
                        <a-select-option :value="0">天</a-select-option>
                        <a-select-option :value="1">月</a-select-option>
                      </a-select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="info-details-bottom-right">
            <div class="bottom-header">
              <span class="bottom-header-title">操作记录</span>
            </div>
            <div
              class="right-content"
              v-if="checkedRow.actions && checkedRow.actions.length"
            >
              <div
                class="right-content-item"
                v-for="(item, index) in checkedRow.actions"
                :key="index"
              >
                <div class="right-content-item-time">
                  <span class="time-dot"></span>
                  <span>{{ item.time }}</span>
                </div>
                <div class="right-content-item-box">
                  <div class="user-avatar">
                    <img :src="item.avatar" alt="" />
                  </div>
                  <div class="box-right">
                    <div class="user-name">
                      {{ item.operateUser || "匿名" }}
                    </div>
                    <div
                      class="user-action"
                      v-for="(cell, index) in item.list"
                      :key="index"
                    >
                      <span>{{ cell.contentType }}：</span>
                      <span
                        >{{ cell.content[0] }} -> {{ cell.content[1] }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="right-content" v-else>
              <p class="no-record">暂无记录</p>
            </div>
          </div>
        </div>
      </a-drawer>
      <a-modal
        class="ignore-modal"
        :width="560"
        :visible="showIgnoreModal"
        :closable="false"
        :destroyOnClose="true"
        @ok="confirmIgnore"
        @cancel="onCancel"
        :mask="true"
        :centered="true"
      >
        <p class="ignore-modal-title">
          <a-icon type="exclamation-circle" />是否忽略当前线索？
        </p>
        <p class="ignore-modal-tips">
          是否最近一段时间内都不再更新该企业的线索信息？忽略之后，您在接下来的一段时间内将不会再收到该企业的线索信息！
        </p>
        <div class="ignore-modal-config">
          <span>忽略周期：</span>
          最近
          <a-input-number
            class="ignore-config-input"
            v-model.trim="warningConfigNum"
            placeholder="请输入数字"
            :min="1"
            :precision="0"
          />
          <a-select v-model="warningConfigUnit" class="ignore-config-input">
            <a-select-option :value="0">天</a-select-option>
            <a-select-option :value="1">月</a-select-option>
          </a-select>
        </div>
      </a-modal>
    </template>
  </TableList>
</template>
<script>
import TableList from "@/components/tableList";
import moment from "moment";
import {
  Badge,
  Button,
  DatePicker,
  Input,
  InputNumber,
  List,
  Radio,
} from "ant-design-vue";
import {
  getWarningList,
  warningDetailCheck,
  warningDetailEdit,
  warningIgnore,
  getWarningPath,
  queryGraphByRiskId,
} from "@/shared/api/riskWarning";
import { getCategoryList } from "@/shared/api/configManage.js";
import { mapState, mapMutations } from "vuex";

const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;
const { Group } = Button;
const { TextArea } = Input;
const { Item } = List;
const { Meta } = Item;

export default {
  name: "RiskWarningInfo",
  data() {
    return {
      warningState: "",
      warningClass: "",
      warningLevel: "",
      decisionResult: "0",
      defaultTime: [],
      warningId: "",
      customerName: "",
      columns: [
        {
          title: "线索ID/流水号",
          dataIndex: "riskFlowId",
          key: "riskFlowId",
          width: 240,
        },
        {
          title: "客户名称",
          dataIndex: "customerName",
          key: "customerName",
          width: 240,
        },
        {
          title: "客户号",
          dataIndex: "ecode",
          key: "ecode",
          width: 180,
        },
        {
          title: "线索类型",
          dataIndex: "type",
          key: "type",
          width: 120,
        },
        {
          title: "规则名称",
          dataIndex: "descriptions",
          key: "descriptions",
          width: 180,
        },
        {
          title: "线索等级",
          dataIndex: "level",
          key: "level",
          sorter: (a, b) => a.levelValue - b.levelValue,
          width: 120,
        },
        {
          title: "最新触发时间",
          dataIndex: "last_time",
          key: "last_time",
          width: 190,
        },
        {
          title: "线索状态",
          dataIndex: "state",
          key: "state",
          customRender: (text) => {
            return (
              <a-badge
                color={
                  text === "待处理"
                    ? "#FA8C16"
                    : text === "已处理"
                    ? "#52C41A"
                    : "rgba(0, 0, 0, 0.25)"
                }
                text={text}
              />
            );
          },
          width: 100,
        },
        {
          title: "操作",
          key: "actions",
          dataIndex: "actions",
          fixed: "right",
          scopedSlots: { customRender: "actions" },
          width: 190,
        },
      ],
      tableValue: [],
      warningDetailsVisible: false,
      remarks: "",
      dialogStyle: {
        position: "absolute",
        top: "20px",
        right: "20px",
        height: "calc(100% - 20px)",
      },
      pagination: {
        size: "small",
        total: 0,
        current: parseInt(sessionStorage.getItem("warningInfoCurrent")) || 1,
        pageSize: parseInt(sessionStorage.getItem("warningInfoPageSize")) || 10,
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
          sessionStorage.setItem("warningInfoCurrent", page);
          sessionStorage.setItem("warningInfoPageSize", pageSize);
          this.getAllList("replace");
        },
        onShowSizeChange: (current, size) => {
          this.pagination.current = current;
          this.pagination.pageSize = size;
          sessionStorage.setItem("warningInfoCurrent", current);
          sessionStorage.setItem("warningInfoPageSize", size);
          this.getAllList("replace");
        },
      },
      activeBtn: "",
      checkIndex: 0,
      modalTitle: "",
      remarkInputShow: false,
      addRemarkContent: "",
      warningConfig: 0,
      warningConfigNum: 1,
      warningConfigUnit: 0,
      showIgnoreModal: false,
      warningClassList: [
        {
          value: "",
          label: "全部",
        },
      ],
      checkedRow: {
        customerName: "",
        state: null,
        level: null,
        levelValue: null,
        descriptions: "",
        last_time: null,
        riskFlowId: null,
        type: null,
        id: null,
      },
      eidtType: null,
      searchLoading1: false, // 查询按钮
      searchLoading2: false, // 刷新按钮
      searchLoading3: false, // 表格
      errorType: "",
      saving: false,
      warningRule: "",
      warningRuleId: "",
      process: false,
    };
  },
  components: {
    ABadge: Badge,
    AButton: Button,
    AButtonGroup: Group,
    AInput: Input,
    AInputNumber: InputNumber,
    AList: List,
    AListItem: Item,
    AListItemMeta: Meta,
    ARadio: Radio,
    ARadioGroup: RadioGroup,
    ARangePicker: RangePicker,
    ATextArea: TextArea,
    TableList,
  },
  computed: {
    ...mapState("rightsOptions", ["userInfo", "userRights"]),
    ...mapState("graphOptions", ["firstNode"]),
    rowSelection() {
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          console.log(
            `selectedRowKeys: ${selectedRowKeys}`,
            "selectedRows: ",
            selectedRows
          );
        },
      };
    },
  },
  async mounted() {
    const listData = await getCategoryList(0);
    const ruleTypeOptions = []; // 统计全部规则分类
    const ruleOptions = [];
    if (listData && listData.length) {
      listData.map((item) => {
        if (!item.children.length) {
          ruleOptions.push({
            value: item.id,
            label: item.categoryName,
          });
        }
        item.children.map((ele) => {
          ruleTypeOptions.push({
            value: ele.id,
            label: ele.categoryName,
          });
        });
      });
      this.warningClassList = [
        ...this.warningClassList,
        ...ruleTypeOptions,
        ...ruleOptions,
      ];
    } else {
      this.$message.error("获取规则分类信息失败");
    }
    const errorType = this.$route.params.errorType;
    const warningId = this.$route.params.warningId;
    const ruleName = this.$route.params.ruleName;
    const warningRuleId = this.$route.params.warningRuleId;
    if (errorType) {
      for (let i = 0; i < this.warningClassList.length; i++) {
        const element = this.warningClassList[i];
        if (element.label === errorType) {
          this.warningClass = element.value;
          break;
        }
      }
    }
    if (warningId) {
      this.warningId = warningId;
    }
    if (ruleName) {
      this.warningRule = ruleName;
    }
    if (warningRuleId) {
      this.warningRuleId = warningRuleId;
    }
    this.getAllList("init");
  },
  watch: {
    $route(to) {
      if (to.name === "riskWarningInfo") {
        const errorType = this.$route.params.errorType;
        const warningId = this.$route.params.warningId;
        const ruleName = this.$route.params.ruleName;
        const warningRuleId = this.$route.params.warningRuleId;
        if (errorType) {
          for (let i = 0; i < this.warningClassList.length; i++) {
            const element = this.warningClassList[i];
            if (element.label === errorType) {
              this.warningClass = element.value;
              break;
            }
          }
        }
        if (warningId) {
          this.warningId = warningId;
        }
        if (ruleName) {
          this.warningRule = ruleName;
        }
        if (warningRuleId) {
          this.warningRuleId = warningRuleId;
        }
        if (errorType || warningId || ruleName || warningRuleId) {
          this.getAllList("init");
        }
      }
    },
  },
  methods: {
    ...mapMutations("graphOptions", {
      setFirstNode: "setFirstNode",
      setGraphId: "setGraphId",
      setSchemaId: "setSchemaId",
      setGraphSource: "setGraphSource",
    }),
    async getAllList(type) {
      if (this.defaultTime.length) {
        this.defaultTime[0] = this.defaultTime[0].utcOffset(8).startOf("day");
        this.defaultTime[1] = this.defaultTime[1].utcOffset(8).endOf("day");
      }
      if (type === "init") {
        this.$set(this.pagination, "current", 1);
      }
      const json = {
        beginDate:
          this.defaultTime.length && this.defaultTime[0]
            ? this.defaultTime[0]._d
            : null,
        currentUser: this.userInfo.userId,
        endDate:
          this.defaultTime.length && this.defaultTime[1]
            ? this.defaultTime[1]._d
            : null,
        id: null,
        pageNo: this.pagination.current,
        pageSize: this.pagination.pageSize,
        riskFlowId: this.warningId,
        customerName: this.customerName,
        ruleName: this.warningRule,
        warningRuleId: this.warningRuleId,
        riskStatus: this.warningState,
        warningLevel: this.warningLevel,
        warningType: this.warningClass,
      };
      this.searchLoading3 = true;
      let resArr = await getWarningList(json);
      this.searchLoading3 = false;
      if (!resArr) {
        this.$message.error("获取线索信息失败");
        return false;
      }
      this.$set(this.pagination, "total", parseInt(resArr.totalCount));
      const tableValue = [];
      for (let i = 0; i < resArr.dateList.length; i++) {
        let data = {};
        data.riskFlowId = resArr.dateList[i].riskFlowId;
        data.customerName = resArr.dateList[i].customerName;
        data.type = resArr.dateList[i].warningType;
        data.descriptions = resArr.dateList[i].desc;
        data.level =
          resArr.dateList[i].warningLevel === 1
            ? "一级"
            : resArr.dateList[i].warningLevel === 2
            ? "二级"
            : "三级";
        data.levelValue = resArr.dateList[i].warningLevel;
        data.last_time = resArr.dateList[i].triggerTime;
        data.state =
          resArr.dateList[i].status === 1
            ? "已处理"
            : resArr.dateList[i].status === 2
            ? "已忽略"
            : "待处理";
        data.remarks = [];
        data.config = [];
        data.actions = [];
        data.warningDetail = resArr.dateList[i].warningDetail;
        data.id = resArr.dateList[i].id;
        data.ecode = resArr.dateList[i].customerId;
        tableValue.push(data);
      }
      this.tableValue = tableValue;
    },
    async handleRefresh(type) {
      this.searchLoading2 = true;
      await this.getAllList(type);
      this.searchLoading2 = false;
    },
    async onSearch(type) {
      this.searchLoading1 = true;
      await this.getAllList(type);
      this.searchLoading1 = false;
    },
    handleCheck(record) {
      this.modalTitle = "线索详情";
      this.checkDetail(record);
    },
    async handleSkip(record) {
      if (this.process) {
        return false;
      }
      this.process = true;
      const pathData = {
        vertices: [],
        edges: [],
      };
      let nodeData = {};
      const loading = this.$message.loading("正在获取路径信息", 0);
      const json = {
        id: record.id,
        customerName: record.customerName,
      };
      const data = await getWarningPath(json);
      loading();
      this.process = false;
      if (!data) {
        this.$message.error("获取线索信息路径失败");
        return false;
      }
      data.map((item) => {
        pathData.vertices = [...item.vertices, ...pathData.vertices];
        pathData.edges = [...item.edges, ...pathData.edges];
      });
      pathData.vertices.map((vertex) => {
        if (!vertex.property) {
          vertex.property = {};
          Object.keys(vertex.fieldsMap).forEach((key) => {
            vertex.property[key] = vertex.fieldsMap[key].fieldValue;
          });
        }
      });
      pathData.edges.map((edge) => {
        if (!edge.property) {
          edge.property = {};
          Object.keys(edge.fieldsMap).forEach((key) => {
            edge.property[key] = edge.fieldsMap[key].fieldValue;
          });
        }
      });
      for (let i = 0; i < pathData.vertices.length; i++) {
        const element = pathData.vertices[i];
        if (element.property.__name === record.customerName) {
          nodeData = element;
          break;
        }
      }
      if (!nodeData.id) {
        nodeData = pathData.vertices[0];
      }
      this.setFirstNode(nodeData);
      const res = await queryGraphByRiskId(record.id);
      if (res.message === "成功" && res.data) {
        this.setGraphId(res.data.id); // 取id为图id
        this.setSchemaId(res.data.bluePrintId); // 取blueprintId为schemaId
        this.setGraphSource(res.data.source); // 取source为graphSource
        sessionStorage.setItem("graphId", res.data.id);
        sessionStorage.setItem("schemaId", res.data.bluePrintId);
        sessionStorage.setItem("graphSource", res.data.source);
      } else {
        this.$message.error("获取该线索对应图谱失败");
        return false;
      }
      this.$router.push({
        name: "affairGraphAnalysis",
        params: {
          nodeData,
          pathData,
          isSkip: true,
        },
      });
    },
    async handleSave() {
      if (this.saving) return false;
      this.saving = true;
      let info = {
        customerName: this.checkedRow.customerName,
        desc: this.checkedRow.desc,
        riskFlowId: this.checkedRow.riskFlowId,
        status:
          this.warningConfig === 1 ? 2 : this.eidtType === "待处理" ? 0 : 1,
        statusStr: "",
        triggerTime: moment().format("YYYY-MM-DD hh:mm:ss"),
        warningLevel: this.checkedRow.levelValue,
        warningType: this.checkedRow.type,
        id: this.checkedRow.id,
        ignore: this.warningConfig,
        ignoreNum: this.warningConfigNum,
        ignoreTimeUnit: this.warningConfigUnit,
        memo: this.addRemarkContent,
      };
      const data = await warningDetailEdit(info);
      if (data.message === "成功") {
        this.$message.success("修改成功");
        this.onDetailsModalCancel();
        this.getAllList("init");
      } else {
        this.$message.error(`修改失败 ${data.message}`);
      }
      this.saving = false;
    },
    ChecktoSet() {
      this.modalTitle = "线索处理";
      this.eidtType = this.checkedRow.state;
      this.remarkInputShow = false;
      this.warningDetailsVisible = true;
    },
    handleSet(record) {
      if (record.state === "已忽略") return false;
      this.remarkInputShow = false;
      this.modalTitle = "线索处理";
      this.checkDetail(record);
    },
    async checkDetail(record) {
      const loading = this.$message.loading("正在获取线索详情", 0);
      for (let i = 0; i < this.tableValue.length; i++) {
        if (record.riskFlowId === this.tableValue[i].riskFlowId) {
          this.checkIndex = i;
          break;
        }
      }
      this.eidtType = record.state;
      const checkedRow = {
        customerName: "",
        state: null,
        level: null,
        levelValue: null,
        descriptions: "",
        last_time: null,
        riskFlowId: null,
        type: null,
        id: null,
      };
      checkedRow.id = record.id;
      checkedRow.customerName = record.customerName;
      checkedRow.state = record.state;
      checkedRow.level = record.level;
      checkedRow.levelValue = record.levelValue;
      checkedRow.descriptions =
        record.descriptions + "\n" + record.warningDetail;
      checkedRow.desc = record.descriptions;
      checkedRow.last_time = record.last_time.split(" ")[0];
      checkedRow.riskFlowId = record.riskFlowId;
      checkedRow.type = record.type;
      let res = await warningDetailCheck(record.id);
      if (!res) {
        loading();
        this.$message.error("获取线索详情失败");
        return false;
      }
      checkedRow.warningConfig = res.ignore || 0;
      checkedRow.warningConfigNum = res.ignoreNum;
      checkedRow.warningConfigUnit = res.ignoreTimeUnit;
      checkedRow.ignoreTimeUnitStr = res.ignoreTimeUnitStr;
      this.warningConfig = res.ignore || 0;
      this.warningConfigNum = res.ignoreNum || 1;
      this.warningConfigUnit = res.ignoreTimeUnit || 0;
      let actionList = [];
      for (let i = 0; i < res.records.length; i++) {
        let arrList = {};
        arrList.time = res.records[i].time;
        arrList.riskWarningId = res.records[i].riskWarningId;
        arrList.operateUser = res.records[i].operateUser;
        const content = JSON.parse(res.records[i].content);
        const contentList = [];
        if (res.records[i].content !== "{}") {
          Object.keys(content).forEach((key) => {
            if (key === "status") {
              content[key].map((num, index) => {
                let text = "";
                switch (num) {
                  case 1:
                    text = "已处理";
                    break;
                  case 0:
                    text = "待处理";
                    break;
                  default:
                    text = "已忽略";
                    break;
                }
                content[key][index] = text;
              });
            }
            contentList.push(content[key]);
          });
          const contentType = res.records[i].contentType.split("-");
          const list = [];
          contentType.map((item, index) => {
            list.push({
              contentType: item,
              content: contentList[index],
            });
          });
          arrList.list = list;
          actionList.unshift(arrList);
        }
      }
      checkedRow.actions = actionList;
      const remarks = [];
      res.dealMemos.map((item) => {
        if (item.trim() !== "") {
          remarks.push({
            name: "",
            content: item,
            src: "",
          });
        }
      });
      checkedRow.remarks = remarks;
      this.checkedRow = checkedRow;
      loading();
      this.warningDetailsVisible = true;
    },
    handleIgnore(record) {
      if (record.state === "已忽略") return false;
      this.showIgnoreModal = true;
      this.$set(this.checkedRow, "id", record.riskFlowId);
    },
    async confirmIgnore() {
      this.showIgnoreModal = false;
      let info = {
        currentUser: this.userInfo.userId,
        ignore: 1,
        num: this.warningConfigNum,
        unit: this.warningConfigUnit,
        eventId: this.checkedRow.id,
      };
      const data = await warningIgnore(info);
      if (data.message === "成功") {
        this.$message.success("设置忽略成功");
        this.onDetailsModalCancel();
        this.getAllList("init");
      } else {
        this.$message.error(`设置忽略失败 ${data.message}`);
      }
    },
    onCancel() {
      this.showIgnoreModal = false;
    },
    onDetailsModalCancel() {
      this.warningDetailsVisible = false;
      this.checkedRow = {};
      this.addRemarkContent = "";
      this.warningConfig = 0;
      this.warningConfigNum = 1;
      this.warningConfigUnit = 0;
    },
    onReset() {
      this.warningId = "";
      this.customerName = "";
      this.warningRule = "";
      this.warningClass = "";
      this.warningState = "";
      this.warningLevel = "";
      this.defaultTime = [];
      this.getAllList("init");
    },
    handleDownload() {
      console.log("handleDownload");
    },
    handleChangeEnterprise(type, index) {
      if (type === "left") {
        index -= 1;
      } else {
        index += 1;
      }
      if (this.modalTitle === "线索处理") {
        this.handleSet(this.tableValue[index]);
      } else {
        this.handleCheck(this.tableValue[index]);
      }
    },
    handleAddRemark() {
      this.remarkInputShow = true;
    },
  },
};
</script>
<style lang="less">
.risk-warning-info {
  width: 100%;
  height: 100%;
  overflow: auto;
  border-radius: 5px;
  position: relative;

  .table-list-top-item {
    width: calc((100% - 96px) / 4 - 16px);

    &:nth-child(4n) {
      width: calc((100% - 96px) / 4 + 48px);
    }
  }
}
.info-details-modal {
  .ant-drawer-content-wrapper {
    padding: 0;
    bottom: 0;
    top: 0 !important;
    right: 0 !important;

    .ant-drawer-content {
      height: 100%;

      .ant-drawer-header {
        .ant-drawer-title {
          font-weight: 600;
          font-size: 18px;
        }
      }

      .ant-drawer-body {
        padding: 0;
        overflow: auto;
        background: #f8fbff;
        height: calc(100% - 55px);

        .info-details-top {
          height: 190px;
          position: relative;
          background: #fff;
          margin-bottom: 20px;
          padding: 36px 24px 0 24px;

          .info-left {
            width: 70%;
            height: 100%;
            display: inline-block;

            &-top {
              overflow: hidden;
              margin-bottom: 25px;

              .info-image {
                width: 62px;
                height: 62px;
                float: left;
                margin-right: 18px;
                border: 1px solid #eee;
              }

              .info-name {
                width: calc(100% - 80px);
                float: right;

                &-top {
                  padding: 4px 0;
                  display: flex;
                  align-items: center;

                  .top-text {
                    font-size: 18px;
                    font-weight: 600;
                    color: #000;
                    margin-right: 10px;
                  }

                  img {
                    width: 15px;
                    height: 15px;
                  }

                  .ant-btn-group {
                    margin-left: 20px;

                    .ant-btn {
                      height: 22px;
                      padding: 0 8px;
                    }
                  }
                }

                &-bottom {
                  font-size: 16px;

                  &-title {
                    color: #515a6e;
                  }

                  &-content {
                    color: #949dad;
                  }
                }
              }
            }

            &-bottom {
              display: flex;

              &-item {
                margin-right: 100px;
                font-size: 16px;

                .item-title {
                  color: #515a6e;
                }

                .item-content {
                  color: #949dad;
                }
                .to-handle {
                  color: #fa8c16;
                }

                .handled {
                  color: #52c41a;
                }

                .ignored {
                  color: @disabledColor;
                }
              }
            }
          }

          .info-right {
            top: 45px;
            right: 24px;
            position: absolute;

            &-btn {
              margin-left: 10px;
              height: 36px;
            }
          }
        }

        .info-details-bottom {
          height: calc(100% - 230px);
          display: flex;
          justify-content: space-between;

          &-left {
            width: 65%;
            height: 100%;
            background: #fff;
          }

          &-right {
            margin-right: 20px;
            background: #fff;
            width: calc(35% - 40px);
          }

          .bottom-header {
            background: #fdfdfd;
            border: 2px solid #e7e7e9;
            border-left: none;
            height: 40px;

            &.left-header {
              padding: 0 16px;
              border-left: 2px solid #e7e7e9;

              .bottom-header-title {
                border-left: 2px solid #e7e7e9;
              }
            }

            &-title {
              line-height: 37px;
              padding: 0 24px;
              font-size: 16px;
              margin-top: -2px;
              font-weight: 600;
              background: #fff;
              display: inline-block;
              border-top: 3px solid @activeFontColor;
              border-right: 2px solid #e7e7e9;
            }
          }

          .left-content {
            padding: 24px;
            height: calc(100% - 40px);
            overflow: auto;

            &-item {
              display: flex;
              line-height: 32px;
              margin-bottom: 10px;

              &-label {
                width: 100px;
                color: #515a6e;
              }

              &-content {
                width: calc(100% - 100px);
                color: #949dad;
                max-height: 180px;
                overflow: auto;

                .ant-radio-group {
                  margin-bottom: 10px;
                }

                .item-content-input.ant-input {
                  color: #949dad;
                }

                .warning-config-input {
                  width: 120px;
                  margin: 0 10px;
                }

                .ant-list-split {
                  &:not(:last-child) {
                    margin-bottom: 10px;
                  }

                  .ant-list-item {
                    border-bottom: none;
                    padding: 6px 0;

                    .ant-list-item-meta-content {
                      display: flex;
                    }
                  }
                }

                .add-remarks-btn {
                  cursor: pointer;
                  color: @activeFontColor;

                  .anticon-form {
                    margin-right: 5px;
                  }
                }

                .warning-desc {
                  white-space: break-spaces;
                }
              }
            }
          }

          .right-content {
            padding: 24px;
            overflow: auto;
            position: relative;
            height: calc(100% - 40px);

            .no-record {
              top: 50%;
              left: 50%;
              position: absolute;
              transform: translate(-50%, -50%);
            }

            &-item {
              padding-top: 10px;

              &-time {
                width: 190px;
                height: 28px;
                font-size: 13px;
                padding: 0 10px;
                color: #666867;
                line-height: 28px;
                text-align: center;
                border-radius: 14px;
                background: #f1f5fb;

                .time-dot {
                  width: 10px;
                  height: 10px;
                  margin-right: 5px;
                  border-radius: 50%;
                  background: #666867;
                  display: inline-block;
                }
              }

              &-box {
                display: flex;
                padding-top: 16px;
                padding-left: 30px;
                position: relative;

                .user-avatar {
                  width: 24px;
                  height: 24px;
                  margin-right: 24px;
                  border-radius: 12px;
                  border: 1px solid #eee;

                  &::before {
                    top: 0;
                    left: 41px;
                    content: "";
                    width: 1px;
                    height: 16px;
                    position: absolute;
                    background: #e1e7e3;
                  }
                }

                &:not(:last-child) .user-avatar::after {
                  top: 41px;
                  left: 41px;
                  content: "";
                  width: 1px;
                  position: absolute;
                  background: #e1e7e3;
                  height: calc(100% - 40px);
                }

                .box-right {
                  width: calc(100% - 48px);

                  .user-name {
                    color: #000;
                    margin-bottom: 10px;
                  }

                  .user-action {
                    overflow: auto;
                    color: #949dad;
                    max-height: 100px;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.ignore-modal {
  &-title {
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    margin-bottom: 18px;

    .anticon-exclamation-circle {
      color: #faad14;
      font-size: 20px;
      margin-right: 10px;
    }
  }

  &-tips {
    padding-left: 30px;
    line-height: 22px;
    margin-bottom: 40px;
  }

  &-config {
    padding-left: 30px;

    .ignore-config-input {
      width: 120px;
      margin-right: 10px;
    }
  }

  .ant-modal-footer {
    border: none;
    padding: 24px;
  }
}
</style>
