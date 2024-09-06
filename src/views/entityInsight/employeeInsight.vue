<template>
  <div class="employee-insight">
    <div class="enterprise-insight-content" v-if="noSearch">
      <div class="insight-header" v-if="userRights.btn_queryStaff">
        <div class="insight-header-item">
          <span class="item-label">员工搜索：</span>
          <a-input
            placeholder="请输入个人姓名/身份证号/内部工号"
            v-model="employeeName"
            class="item-input"
            allow-clear
          />
        </div>
        <div class="insight-header-item">
          <a-button
            type="primary"
            icon="search"
            class="item-btn"
            @click="getCustomerList('init')"
            :loading="graphLoading"
            >搜索</a-button
          >
        </div>
      </div>
      <a-radio-group
        default-value="0"
        button-style="solid"
        v-model="selected"
        class="table-header"
        @change="changeSelected"
      >
        <a-radio-button value=""> 全部对象 </a-radio-button>
        <a-radio-button :value="0"> 关注对象 </a-radio-button>
        <a-radio-button :value="1"> 未关注对象 </a-radio-button>
      </a-radio-group>
      <table-component
        :columns="columns"
        :data-source="tableValue"
        :pagination="pagination"
        :rowKey="(record) => record.code"
        :loading="graphLoading"
        class="employee-table"
      >
        <span slot="actions" slot-scope="record">
          <a v-if="userRights.btn_lookStaff" @click="checkDetail(record)"
            >查看</a
          >
          <a v-if="userRights.btn_interestStaff" @click="focus(record)">{{
            record.isAttention === 0 ? "取消关注" : "关注"
          }}</a>
          <a
            v-if="!userRights.btn_interestStaff && !userRights.btn_lookStaff"
            class="no-action"
          >
            暂无操作权限
          </a>
        </span>
      </table-component>
    </div>
    <div v-else class="enterprise-insight-content">
      <enterprise-info
        :data="personData"
        :pageType="pageType"
        :loading="graphLoading"
        @handleReturn="handleReturn"
        @handleSearch="handleSearch"
      ></enterprise-info>
      <risk-detection
        :data="personData"
        :tagsData="tagsData"
        :pageType="pageType"
        :itemsOptionsObj="itemsOptionsObj"
        :showRiskPart="showRiskPart"
        @changeGraphTitle="changeGraphTitle"
        @changeShowRiskPart="changeShowRiskPart"
        @changeShowGraphPart="changeShowGraphPart"
        @changeShowTablePart="changeShowTablePart"
      ></risk-detection>
      <div
        v-if="showGraphPart"
        class="enterprise-insight-content-item"
        :style="{
          height:
            graphLoading || !graphData.nodeData.length ? '412px' : '690px',
        }"
      >
        <div class="enterprise-insight-content-item-header">
          <p>{{ graphTitle }}</p>
          <div class="map-skip" @click="handleSkip(graphTitle)">
            自主探索<a-icon type="double-right" />
          </div>
        </div>
        <entity-graph
          v-if="!graphLoading && showGraphPart && graphData.nodeData.length"
          :eName="personData.customerName"
          title="employee"
          :graphData="graphData"
        ></entity-graph>
        <a-spin
          v-if="graphLoading"
          :spinning="graphLoading"
          class="enterprise-insight-loading"
          size="large"
        />
        <div
          class="no-graph"
          v-if="!graphLoading && !graphData.nodeData.length"
        >
          <img src="@/assets/images/img/no_content.svg" alt="暂无内容" />
        </div>
      </div>
      <!-- <div class="enterprise-insight-content-item" v-if="showTablePart">
        <div class="enterprise-insight-content-item-header">
          <p>{{ graphTitle }}</p>
          <div class="map-skip" @click="handleSkip(graphTitle)">
            自主探索<a-icon type="double-right" />
          </div>
        </div>
        <person-table
          :tableData="employeePortrait"
          v-if="
            employeePortrait[0].value.length ||
            employeePortrait[1].value.length ||
            employeePortrait[2].value.length
          "
        ></person-table>
        <div
          class="no-graph"
          v-if="
            !employeePortrait[0].value.length &&
            !employeePortrait[1].value.length &&
            !employeePortrait[2].value.length
          "
        >
          <img src="@/assets/images/img/no_content.svg" alt="暂无内容" />
        </div>
      </div>
      <div
        class="enterprise-insight-content-item"
        v-if="showTablePart || (showRiskPart && !tagsData[0].data.length)"
      >
        <div class="no-graph">
          <img src="@/assets/images/img/empty.png" alt="暂无内容" />
        </div>
      </div> -->
    </div>
  </div>
</template>
<script>
import EnterpriseInfo from "./components/enterpriseInfo";
import EntityGraph from "./components/EntityGraph";
// import PersonTable from "./components/personTable";
import RiskDetection from "./components/riskDetection";
import TableComponent from "@/components/tableComponent";
import { Button, Input, Radio, Spin } from "ant-design-vue";
import { mapState } from "vuex";
import { find, findIndex } from "lodash";
import { setStaffIsAttention, getEmployeeList } from "@/shared/api/user.js";
import { searchEntitiesFake, getNeighbors } from "@/shared/api/graph.js";
import { hideIdCode, hidePhoneNumber } from "@/utils/common.js";
import {
  getWarningList,
  getWaringCountByCustomer,
} from "@/shared/api/riskWarning.js";
import { circleLayout } from "@/utils/graph.js";

const { Group } = Radio;
const RadioButton = Radio.Button;

export default {
  name: "EmployeeInsight",
  data() {
    return {
      pageType: "employeeInsight",
      employeeName: undefined,
      employeeId: undefined,
      noSearch: true,
      columns: [
        {
          title: "员工编号",
          dataIndex: "code",
          key: "code",
          width: 90,
        },
        {
          title: "员工姓名",
          dataIndex: "employeeName",
          key: "employeeName",
          width: 90,
        },
        {
          title: "员工职务",
          dataIndex: "employeeTitle",
          key: "employeeTitle",
          width: 90,
        },
        {
          title: "隶属机构",
          dataIndex: "institution",
          key: "institution",
          width: 125,
        },
        {
          title: "隶属部门",
          dataIndex: "department",
          key: "department",
          width: 90,
        },
        {
          title: "联系电话",
          dataIndex: "telephone",
          key: "telephone",
          width: 120,
        },
        {
          title: "证件号码",
          dataIndex: "identity",
          key: "identity",
          width: 170,
        },
        {
          title: "操作",
          dataIndex: "actions",
          key: "actions",
          scopedSlots: { customRender: "actions" },
          width: 104,
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
          this.getCustomerList("repeat");
        },
        onShowSizeChange: (current, size) => {
          this.pagination.pageSize = size;
          this.getCustomerList("repeat");
        },
      },
      employeeData: undefined,
      baseInfo: {},
      tagsData: [
        {
          title: "风险线索",
          data: [],
          num: 0,
        },
        {
          title: "员工关联图谱",
          data: [],
        },
        // {
        //   title: "员工社交画像",
        //   data: [],
        // },
      ],
      itemsOptionsObj: [],
      options: [],
      graphData: {
        nodeData: [],
        edgeData: [],
      },
      graphLoading: false,
      showRiskPart: true,
      showGraphPart: false,
      showTablePart: false,
      graphTitle: "",
      employeePortrait: [
        {
          title: "个人对外投资",
          columns: [
            {
              title: "企业名称",
              dataIndex: "eName",
              key: "eName",
              width: 200,
            },
            {
              title: "成立日期",
              dataIndex: "buildupTime",
              key: "buildupTime",
              width: 110,
            },
            {
              title: "持股比例",
              dataIndex: "ratio",
              key: "ratio",
              width: 100,
            },
            {
              title: "路径",
              dataIndex: "pathData",
              key: "pathData",
              width: 356,
            },
            {
              title: "最新检测日期",
              dataIndex: "updateTime",
              key: "updateTime",
              width: 110,
            },
          ],
          value: [],
          type: "table",
        },
        {
          title: "个人在外任职",
          columns: [
            {
              title: "企业名称",
              dataIndex: "eName",
              key: "eName",
              width: 200,
            },
            {
              title: "成立日期",
              dataIndex: "buildupTime",
              key: "buildupTime",
              width: 110,
            },
            {
              title: "担任职位",
              dataIndex: "position",
              key: "position",
              width: 100,
            },
            {
              title: "路径",
              dataIndex: "pathData",
              key: "pathData",
              width: 356,
            },
            {
              title: "最新检测日期",
              dataIndex: "updateTime",
              key: "updateTime",
              width: 110,
            },
          ],
          value: [],
          type: "table",
        },
      ],
      personData: {},
      relationsData: {
        nodeData: [],
        edgeData: [],
      },
      relationsPathData: {
        vertices: [],
        edges: [],
      },
      selected: "",
    };
  },
  computed: {
    ...mapState("rightsOptions", ["userInfo", "userRights"]),
    ...mapState("graphOptions", ["graphId"]),
  },
  components: {
    AButton: Button,
    AInput: Input,
    ARadioButton: RadioButton,
    ARadioGroup: Group,
    ASpin: Spin,
    EnterpriseInfo,
    EntityGraph,
    // PersonTable,
    RiskDetection,
    TableComponent,
  },
  mounted() {
    this.getCustomerList("init");
  },
  methods: {
    handleReturn() {
      this.noSearch = true;
      this.showRiskPart = true;
      this.showGraphPart = false;
      this.showTablePart = false;
      // this.getCustomerList("init");
    },
    handleChange(value) {
      this.employeeName = value.trim();
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (value.trim() !== "") {
        this.timer = setTimeout(() => {
          this.getEmployeeList(value.trim());
        }, 500);
      } else {
        this.options = [];
      }
    },
    async getCustomerList(type) {
      if (type === "init") {
        this.$set(this.pagination, "current", 1);
      }
      const json = {
        currentUser: this.userInfo.userId,
        key: this.employeeName === "" ? null : this.employeeName,
        isInterest: this.selected === "" ? null : this.selected,
        pageNo: this.pagination.current - 1,
        pageSize: this.pagination.pageSize,
      };
      this.graphLoading = true;
      const data = await getEmployeeList(json);
      if (!data) {
        this.$message.error("查询员工列表失败");
      } else {
        this.$set(this.pagination, "total", parseInt(data.totalCount));
        const tableValue = [];
        data.dateList.map((item) => {
          tableValue.push({
            id: item.id,
            code: item.code,
            employeeName: item.name,
            employeeTitle: item.jobLevel,
            institution: item.belongOrg,
            department: item.belongDept,
            telephone: hidePhoneNumber(item.phoneNo),
            identity: hideIdCode(item.idNum),
            isAttention: item.isInterest, // 0关注 1未关注
            isManager: item.manager,
            violationPoints: item.vioPoint,
            lastYearEvaluation: item.kpiResult,
          });
        });
        this.tableValue = tableValue;
      }
      this.graphLoading = false;
    },
    async handleSearch(data) {
      this.$message.destroy();
      const loading = this.$message.loading("正在查询", 0);
      const { name } = data; // id
      if (!name) {
        // !id ||
        this.$message.warning("请正确选择查询个人名称！");
        return false;
      }
      this.graphLoading = true;

      const json = {
        branchId: this.graphId,
        types: "findVertex",
        names: [name],
        isFuzzy: true, // 是否是模糊查询
        limit: 100,
        isFilterNote: false, // 是否只选有笔记
      };

      const json2 = {
        currentUser: this.userInfo.userId,
        pageNo: 1,
        pageSize: 1000,
        customerName: name,
      };
      const result1 = await getWarningList(json2);
      if (!result1) {
        this.$message.error("获取线索信息失败");
        return false;
      }
      const arr1 = result1.dateList.map((item) => {
        return {
          class: item.warningType,
          pathString: item.warningDetail,
          lastCheckTime: item.triggerTime,
          warningId: item.id,
          customerName: item.customerName,
        };
      });
      const itemsOptionsObj = [];
      const tagsData = this.tagsData;
      tagsData[0].num = arr1.length;
      tagsData[0].data = arr1;
      this.tagsData = tagsData;
      arr1.map((item) => {
        if (!itemsOptionsObj.length) {
          itemsOptionsObj.push({
            name: item.class,
            value: 1,
          });
        } else {
          const index = findIndex(
            itemsOptionsObj,
            (o) => o.name === item.class
          );
          if (index === -1) {
            itemsOptionsObj.push({
              name: item.class,
              value: 1,
            });
          } else {
            itemsOptionsObj[index].value++;
          }
        }
      });
      this.itemsOptionsObj = itemsOptionsObj;

      this.personData = find(this.tableValue, (v) => v.employeeName === name);
      this.personData.customerName = name;
      const riskNum = await getWaringCountByCustomer(name);
      if (!riskNum) {
        this.$message.error("获取线索数量失败");
      } else {
        this.personData.riskNum = riskNum.addWarningCount;
        this.personData.firstNum = riskNum.levelWarningCount;
      }
      // this.employeePortrait = this.personData.employeePortrait; // todo
      this.noSearch = false;

      // this.personData = await getUserInfo(id);
      const res = await searchEntitiesFake(json);
      loading();
      // if (res.message !== "成功") {
      //   this.$message.error(res.message);
      //   return false;
      // }
      // if (!res.data || (res.data && !res.data.length)) {
      //   this.$message.error("获取数据失败，请重试");
      //   return false;
      // }
      const vdata = res.data;
      if (vdata && vdata.length) {
        const vertexIDs = [vdata[0].id];
        this.baseInfo = vdata[0];
        const json1 = {
          branchId: this.graphId,
          commonOnly: false,
          direction: "both",
          edgesFieldsLimitMap: {},
          layers: 1,
          nodeTypes: [],
          types: "findNeighbor",
          vertexIDs,
        };

        // 担保圈链 && 股权 && 对外投资
        const nodeArr4 = [];
        const edgeArr6 = [];
        const _that = this;
        await Promise.all([getNeighbors(json1)]).then(function (res) {
          if (!res) {
            this.$message.error("获取关联节点失败");
            return false;
          }
          const res1 = res[0];
          const data2 = {
            nodeData: [],
            edgeData: [],
          };
          let pathEdges = [];
          let pathVertices = [];
          res1.paths.map((path) => {
            pathEdges = [...pathEdges, ...path.edges];
            pathVertices = [...pathVertices, ...path.vertices];
          });
          _that.relationsPathData.vertices = pathEdges;
          _that.relationsPathData.edges = pathVertices;

          if (res1 && pathEdges && pathEdges.length > 0) {
            pathEdges.map((edge) => {
              edgeArr6.push(edge);
              pathVertices.map((vertex) => {
                if (
                  edge.dstId === vertex.id &&
                  nodeArr4.indexOf(vertex) === -1
                ) {
                  nodeArr4.push(vertex);
                }
                if (
                  edge.srcId === vertex.id &&
                  nodeArr4.indexOf(vertex) === -1
                ) {
                  nodeArr4.push(vertex);
                }
              });
              data2.edgeData.push({
                source: edge.property.__srcId,
                target: edge.property.__dstId,
                label: {
                  value: edge.label,
                },
                lineStyle: {
                  opacity: 1,
                  width: 1,
                  curveness: 0,
                },
              });
            });
          }

          if (nodeArr4.length > 0) {
            let name = "";
            const originPosition = {
              x: 300,
              y: 300,
            };
            const positions = circleLayout(
              originPosition,
              nodeArr4.length > 8 ? (nodeArr4.length * 100) / Math.PI : 240,
              nodeArr4.length
            );
            nodeArr4.map((vertex, index) => {
              if (vertex.label === "企业") {
                name = vertex.property.__name || vertex.property.enterprisename;
              } else if (vertex.label === "个人") {
                name = vertex.property.__name || vertex.property.name;
              } else if (vertex.label === "账号") {
                name = vertex.property.__name || vertex.property.name;
              } else if (vertex.label === "贷款下发机构") {
                name = vertex.property.__name || vertex.property.name;
              }
              const node = find(
                data2.nodeData,
                (v) => v.id === vertex.property.__id
              );
              if (!node) {
                data2.nodeData.push({
                  name,
                  id: vertex.property.__id,
                  category: vertex.label === "企业" ? "enterprise" : "person",
                  x: positions[index].x,
                  y: positions[index].y,
                });
              }
            });
          }
          _that.relationsData = data2;
          _that.graphLoading = false;
        });
      } else {
        this.graphLoading = false;
      }
    },
    checkDetail(record) {
      const json = {
        name: record.employeeName,
        id: record.id,
      };
      this.handleSearch(json);
    },
    changeShowRiskPart(value) {
      this.showRiskPart = value;
    },
    changeShowGraphPart(value) {
      this.showGraphPart = value;
    },
    changeShowTablePart(value) {
      this.showTablePart = value;
    },
    changeGraphTitle(value) {
      this.graphTitle = value;
      this.checkData(null, value);
      const timer = setInterval(() => {
        this.checkData(timer, value);
      }, 100);
    },
    changeSelected(e) {
      this.selected = e.target.value;
      this.getCustomerList("init");
    },
    async focus(record) {
      const json = {
        id: record.id,
        accountId: this.userInfo.userId,
        interest: record.isAttention ? 0 : 1,
      };
      const data = await setStaffIsAttention(json);
      const text = record.isAttention ? "关注" : "取消关注";
      if (data.message === "成功") {
        this.$message.success(`${text}成功`);
        this.getCustomerList("init");
      } else {
        this.$message.error(`${text}失败 ${data.message}`);
      }
    },
    handleSkip(type) {
      const nodeData = this.baseInfo;
      let pathData = {};
      switch (type) {
        case "员工关联图谱":
          pathData = this.relationsPathData;
          break;
        default:
          break;
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
    checkData(timer, value) {
      if (!this.graphLoading) {
        // 监听this.relationsData两个变量是否更新
        if (value === "员工关联图谱") {
          this.graphData = this.relationsData;
        }
        clearInterval(timer);
      }
    },
  },
};
</script>
<style lang="less">
.employee-insight {
  width: 100%;
  height: 100%;
  padding: 24px 0;
  overflow-y: auto;
  background: @contentColor;

  .insight-header {
    display: flex;
    flex-wrap: wrap;
    padding: 0 16px 12px;
    border-bottom: 1px dashed #dbdbdb;

    &-item {
      margin-bottom: 10px;

      &:not(:last-child) {
        margin-right: 16px;
      }

      .item-input {
        width: 350px;
      }
    }
  }
  .enterprise-insight-content {
    height: 100%;
    padding: 0 24px;

    .table-header {
      padding: 10px 0;

      .ant-radio-button-wrapper {
        border: none;

        &:focus-within {
          box-shadow: none;
        }

        &.ant-radio-button-wrapper-checked {
          background: #fff !important;
          color: @activeFontColor !important;
        }

        &:not(:first-child)::before {
          position: absolute;
          top: 5px;
          left: 0px;
          display: block;
          box-sizing: content-box;
          width: 1px;
          height: 20px;
          background-color: #d9d9d9;
          transition: background-color 0.3s;
          content: "";
        }
      }
    }

    .employee-table {
      height: calc(100% - 107px);
    }

    &-item {
      width: 100%;
      position: relative;
      padding: 0 16px;

      &:not(:last-child) {
        padding-bottom: 50px;
      }

      &-header {
        height: 60px;
        display: flex;
        position: relative;
        align-items: center;

        p {
          width: 120px;
          height: 28px;
          font-size: 20px;
          font-weight: 600;
          opacity: 1;
        }

        .map-skip {
          right: 5px;
          cursor: pointer;
          color: @activeFontColor;
          position: absolute;
        }

        .invest-num {
          color: #2362f8;
          padding-left: 10px;
        }
      }

      .enterprise-insight-loading {
        top: 50%;
        left: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
      }

      .no-graph {
        text-align: center;
        height: calc(100% - 60px);

        img {
          height: 100%;
        }
      }
    }
  }
}
</style>
