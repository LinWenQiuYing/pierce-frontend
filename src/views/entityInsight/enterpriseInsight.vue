<template>
  <div class="enterprise-insight">
    <div class="enterprise-insight-content" v-if="noSearch">
      <div class="insight-header" v-if="userRights.btn_queryBusInsight">
        <div class="insight-header-item">
          <span class="item-label">企业搜索：</span>
          <a-input
            placeholder="请输入企业名称或统一社会信用代码"
            v-model="companyName"
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
        :rowKey="(record) => record.id"
        :loading="graphLoading"
        class="enterprise-table"
      >
        <span slot="actions" slot-scope="record">
          <a v-if="userRights.btn_lookBusInsight" @click="checkDetail(record)"
            >查看</a
          >
          <a v-if="userRights.btn_interestBusInsight" @click="focus(record)">{{
            record.isAttention === 0 ? "取消关注" : "关注"
          }}</a>
          <a
            v-if="
              !userRights.btn_interestBusInsight &&
              !userRights.btn_lookBusInsight
            "
            class="no-action"
          >
            暂无操作权限
          </a>
        </span>
        <span slot="operatItems" slot-scope="record">
          <a-tooltip
            placement="topLeft"
            overlayClassName="operatItems-content"
            v-if="record.operatItems"
          >
            <template slot="title">{{ record.operatItems }}</template>
            {{ strReduct(record.operatItems, 20) }}
          </a-tooltip>
        </span>
      </table-component>
    </div>
    <div v-else class="enterprise-insight-content">
      <enterprise-info
        :data="companyData"
        :pageType="pageType"
        :loading="graphLoading"
        @handleReturn="handleReturn"
        @handleSearch="handleSearch"
      ></enterprise-info>
      <risk-detection
        :data="companyData"
        :pageType="pageType"
        :showRiskPart="showRiskPart"
        :itemsOptionsObj="itemsOptionsObj"
        :tagsData="tagsData"
        @changeGraphTitle="changeGraphTitle"
        @changeShowMapPart="changeShowMapPart"
        @changeShowRiskPart="changeShowRiskPart"
        @changeShowGraphPart="changeShowGraphPart"
      ></risk-detection>
      <div
        v-if="showGraphPart || showMapPart"
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
          :eName="customerName"
          title="enterprise"
          :graphData="graphData"
        ></entity-graph>
        <stock-map
          v-if="!graphLoading && showMapPart && stockPathData.edges.length"
          :data="baseInfo"
          :stockData="stockData"
          :pathData="stockPathData"
          @stockPathDataChanged="stockPathDataChanged"
        ></stock-map>
        <a-spin
          v-if="graphLoading"
          :spinning="graphLoading"
          class="enterprise-insight-loading"
          size="large"
        />
        <div
          class="no-graph"
          v-if="
            !graphLoading &&
            (!graphData.nodeData.length || !stockPathData.edges.length)
          "
        >
          <img src="@/assets/images/img/no_content.svg" alt="暂无内容" />
        </div>
      </div>
      <div
        class="enterprise-insight-content-item"
        v-if="showRiskPart && !tagsData[0].data.length"
      >
        <div class="no-graph">
          <img src="@/assets/images/img/empty.png" alt="暂无内容" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import EnterpriseInfo from "./components/enterpriseInfo";
import EntityGraph from "./components/EntityGraph";
import RiskDetection from "./components/riskDetection";
import StockMap from "./components/stockMap";
import TableComponent from "@/components/tableComponent";
import { Button, Input, Radio, Spin, Tooltip } from "ant-design-vue";
import { searchEntitiesFake, getNeighbors } from "@/shared/api/graph.js";
import {
  getWarningList,
  getWaringCountByCustomer,
} from "@/shared/api/riskWarning.js";
import {
  searchCustomerList,
  getUserInfo,
  setCustomerIsAttention,
} from "@/shared/api/user.js";
import { mapState, mapMutations } from "vuex";
import { strReduct } from "@/utils/common.js";
import { find, union, findIndex } from "lodash";
import { circleLayout } from "@/utils/graph.js";

const { Group } = Radio;
const RadioButton = Radio.Button;

export default {
  name: "EnterpriseInsight",
  data() {
    return {
      pageType: "enterpriseInsight",
      companyName: "",
      columns: [
        {
          title: "企业名称",
          dataIndex: "companyName",
          key: "companyName",
          width: 115,
        },
        {
          title: "统一社会信用代码",
          dataIndex: "code",
          key: "code",
          width: 145,
        },
        {
          title: "所属行业",
          dataIndex: "industry",
          key: "industry",
          width: 90,
        },
        {
          title: "地址",
          dataIndex: "area",
          key: "area",
          width: 80,
        },
        {
          title: "经营范围",
          dataIndex: "operatItems",
          key: "operatItems",
          width: 125,
          scopedSlots: { customRender: "operatItems" },
        },
        {
          title: "新增线索",
          dataIndex: "newWarning",
          key: "newWarning",
          sorter: (a, b) => a.newWarning - b.newWarning,
          width: 110,
        },
        {
          title: "一级线索",
          dataIndex: "firstWarning",
          key: "firstWarning",
          sorter: (a, b) => a.firstWarning - b.firstWarning,
          width: 110,
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
          this.pagination.current = current;
          this.pagination.pageSize = size;
          this.getCustomerList("repeat");
        },
      },
      eName: "",
      baseInfo: {},
      noSearch: true,
      stockData: {},
      stockPathData: {
        vertices: [],
        edges: [],
      },
      investPathData: {
        vertices: [],
        edges: [],
      },
      investData: [],
      fundPathData: {
        vertices: [],
        edges: [],
      },
      fundData: {},
      tagsData: [
        {
          title: "风险线索",
          data: [],
          num: 0,
        },
        {
          title: "客户关联图谱",
        },
        {
          title: "股权穿透分析",
        },
      ],
      itemsOptionsObj: [],
      showRiskPart: true,
      showGraphPart: false,
      showMapPart: false,
      graphTitle: "",
      graphData: {
        nodeData: [],
        edgeData: [],
      },
      graphLoading: false,
      customerName: "",
      relationsData: {
        nodeData: [],
        edgeData: [],
      },
      relationsPathData: {
        vertices: [],
        edges: [],
      },
      companyData: {},
      selected: "",
    };
  },
  watch: {
    $route(to) {
      if (to.name === "enterpriseInsight") {
        const enterpriseName = to.params.entName;
        this.handleInit(enterpriseName, "update");
      }
    },
  },
  async mounted() {
    const enterpriseName = this.$route.params.entName;
    this.handleInit(enterpriseName, "init");
  },
  components: {
    AButton: Button,
    AInput: Input,
    ARadioButton: RadioButton,
    ARadioGroup: Group,
    ASpin: Spin,
    ATooltip: Tooltip,
    EnterpriseInfo,
    EntityGraph,
    RiskDetection,
    StockMap,
    TableComponent,
  },
  computed: {
    ...mapState("rightsOptions", ["userInfo", "userRights"]),
    ...mapState("graphOptions", ["firstNode", "graphId"]),
    strReduct() {
      return (str, len) => {
        return strReduct(str, len);
      };
    },
  },
  methods: {
    ...mapMutations("graphOptions", {
      setSearchVertex: "setSearchVertex",
      setFirstNode: "setFirstNode",
    }),
    async handleInit(enterpriseName, type) {
      if (enterpriseName && enterpriseName !== "") {
        this.companyName = enterpriseName;
        await this.getCustomerList("init");
        const json = {
          name: enterpriseName,
          id: this.tableValue[0].id,
        };
        this.handleSearch(json);
      } else if (type === "init") {
        this.getCustomerList("init");
      }
    },
    handleReturn() {
      this.noSearch = true;
      // this.getCustomerList("repeat");
      this.showRiskPart = true;
      this.showGraphPart = false;
      this.showMapPart = false;
    },
    async getCustomerList(type) {
      if (type === "init") {
        this.$set(this.pagination, "current", 1);
      }
      const json = {
        accountId: this.userInfo.userId,
        customerName: this.companyName === "" ? null : this.companyName,
        isInterest: this.selected === "" ? null : this.selected,
        pageNo: this.pagination.current,
        pageSize: this.pagination.pageSize,
      };
      this.graphLoading = true;
      const data = await searchCustomerList(json);
      if (!data) {
        this.$message.error("查询对公客户列表失败");
      } else {
        this.$set(this.pagination, "total", parseInt(data.totalCount));
        const tableValue = [];
        data.dateList.map((item) => {
          tableValue.push({
            companyName: item.customerName,
            code: item.creditCode,
            industry: item.industry,
            area:
              item.province === item.city
                ? item.province
                : item.province + "-" + item.city,
            operatItems: item.businessScope,
            newWarning: item.addWarningCount,
            firstWarning: item.levelWarningCount,
            id: item.id,
            isAttention: item.isInterest, // 0关注 1未关注
          });
        });
        this.tableValue = tableValue;
      }
      this.graphLoading = false;
    },
    async handleSearch(data) {
      this.$message.destroy();
      const loading = this.$message.loading("正在查询", 0);
      const { id, name } = data;
      if (!id || !name) {
        this.$message.warning("请正确选择查询公司名称！");
        return false;
      } else {
        this.customerName = name;
      }
      const json = {
        branchId: this.graphId,
        types: "findVertex",
        names: [name],
        isFuzzy: true, // 是否是模糊查询
        limit: 100,
        isFilterNote: false, // 是否只选有笔记
      };
      this.graphLoading = true;
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
      const companyData = await getUserInfo(id);
      if (!companyData) {
        this.$message.error("获取客户信息失败");
        return false;
      } else {
        this.companyData = companyData;
      }
      const riskNum = await getWaringCountByCustomer(name);
      if (!riskNum) {
        this.$message.error("获取线索数量失败");
      } else {
        this.companyData.riskNum = riskNum.addWarningCount;
        this.companyData.firstNum = riskNum.levelWarningCount;
      }
      this.noSearch = false;

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
        this.eName =
          vdata[0].property.__name || vdata[0].property.enterprisename;
        this.noSearch = false;
        // 担保圈链 && 股权
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
        // 资金交易圈链
        // const json2 = {
        //   branchId: "6260e1b9-1c80-4bcf-acbc-e5fe409e970a", // 资金流向图谱 node53 "a01a6666-818d-408f-b46e-f3c4e1cb9d30"
        //   commonOnly: false,
        //   direction: "both",
        //   edgesFieldsLimitMap: {
        //     交易_企企: [],
        //     交易_企人: [],
        //     交易_人企: [],
        //   },
        //   layers: 1,
        //   nodeTypes: ["个人", "企业"],
        //   types: "findNeighbor",
        //   vertexIDs,
        // };

        // 担保圈链 && 股权 && 对外投资
        const nodeArr3 = []; // 股权节点
        const edgeArr3 = []; // 股权边
        const nodeArr5 = [];
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
          _that.relationsPathData.vertices = pathVertices;
          _that.relationsPathData.edges = pathEdges;

          if (res1 && pathEdges && pathEdges.length > 0) {
            pathEdges.map((edge) => {
              if (
                edge.label === "股东_企企" ||
                edge.label === "股东_人企" ||
                edge.label === "对外投资_企企" ||
                edge.label === "对外投资_人企" ||
                edge.label === "实控人_人企" ||
                edge.label === "实控人_企企"
              ) {
                // 股权
                edgeArr3.push(edge);
                pathVertices.map((vertex) => {
                  if (
                    edge.dstId === vertex.id &&
                    nodeArr3.indexOf(vertex) === -1
                  ) {
                    nodeArr3.push(vertex);
                  }
                  if (
                    edge.srcId === vertex.id &&
                    nodeArr3.indexOf(vertex) === -1
                  ) {
                    nodeArr3.push(vertex);
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
              } else {
                // 个人关系 企业拥有账号 交易 高管 个人拥有账号 担保
                edgeArr6.push(edge);
                pathVertices.map((vertex) => {
                  if (
                    edge.dstId === vertex.id &&
                    nodeArr5.indexOf(vertex) === -1
                  ) {
                    nodeArr5.push(vertex);
                  }
                  if (
                    edge.srcId === vertex.id &&
                    nodeArr5.indexOf(vertex) === -1
                  ) {
                    nodeArr5.push(vertex);
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
              }
            });
          }

          // 股权
          const parents = [];
          const children = [];
          const stockNodeArr = [];
          if (edgeArr3.length > 0) {
            edgeArr3.map((edge) => {
              const scale =
                edge.property.ratio || edge.property.fundedratio || "";
              if (edge.label === "实控人_人企") {
                const name = res1.vertices.filter((item) => {
                  if (item.id === edge.dstId) {
                    stockNodeArr.push(item);
                    return item;
                  }
                });
                if (edge.srcId === vdata[0].id) {
                  parents.push({
                    money: edge.property.money || "",
                    name:
                      name[0].property.__name || name[0].property.name || "",
                    id: edge.dstId,
                    scale: `${((parseFloat(scale) * 10000) / 100).toFixed(2)}`,
                    type: "1",
                    Holding: 0,
                    children: [],
                    isOpen: false,
                  });
                }
              } else if (edge.label === "股东_人企") {
                const name = res1.vertices.filter((item) => {
                  if (item.id === edge.srcId) {
                    stockNodeArr.push(item);
                    return item;
                  }
                });
                if (edge.dstId === vdata[0].id) {
                  parents.push({
                    money: edge.property.money || "",
                    name:
                      name[0].property.__name || name[0].property.name || "",
                    id: edge.srcId,
                    scale: `${((parseFloat(scale) * 10000) / 100).toFixed(2)}`,
                    type: "1",
                    Holding: 0,
                    children: [],
                    isOpen: false,
                  });
                }
              } else {
                if (edge.dstId === vdata[0].id) {
                  for (let i = 0; i < res1.vertices.length; i++) {
                    if (edge.srcId === res1.vertices[i].id) {
                      stockNodeArr.push(res1.vertices[i]);
                      break;
                    }
                  }
                  parents.push({
                    money: edge.property.money || "",
                    name: edge.property.__srcId || "",
                    scale: `${((parseFloat(scale) * 10000) / 100).toFixed(2)}`,
                    type: "0",
                    Holding: 0,
                    children: [],
                    id: edge.srcId,
                    isOpen: false,
                  });
                } else if (edge.srcId === vdata[0].id) {
                  for (let i = 0; i < res1.vertices.length; i++) {
                    if (edge.dstId === res1.vertices[i].id) {
                      stockNodeArr.push(res1.vertices[i]);
                      break;
                    }
                  }
                  children.push({
                    money: edge.property.money || "",
                    name: edge.property.__dstId || "",
                    scale: `${((parseFloat(scale) * 10000) / 100).toFixed(2)}`,
                    type: "0",
                    Holding: 0,
                    children: [],
                    id: edge.dstId,
                    isOpen: false,
                  });
                }
              }
            });
          }
          const chartsData = {
            children,
            name: vdata[0].property.__name || vdata[0].property.enterprisename,
            parents,
          };

          // 保存股权图谱路径
          const pathData4 = {
            edges: edgeArr3,
            vertices: [...stockNodeArr, vdata[0]],
          };
          if (pathData4.edges.length && pathData4.vertices.length) {
            _that.stockPathData = pathData4;
          }
          _that.stockData = chartsData;

          const nodeArr4 = union(nodeArr3, nodeArr5);
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
        name: record.companyName,
        id: record.id,
      };
      this.handleSearch(json);
    },
    async focus(record) {
      const json = {
        id: record.id,
        accountId: this.userInfo.userId,
        interest: record.isAttention ? 0 : 1,
      };
      const data = await setCustomerIsAttention(json);
      const text = record.isAttention ? "关注" : "取消关注";
      if (data.message === "成功") {
        this.$message.success(`${text}成功`);
        this.getCustomerList("init");
      } else {
        this.$message.error(`${text}失败 ${data.message}`);
      }
    },
    stockPathDataChanged(value) {
      this.stockPathData = value;
    },
    handleSkip(type) {
      const nodeData = this.baseInfo;
      let pathData = {};
      switch (type) {
        case "股权穿透分析":
          pathData = this.stockPathData;
          break;
        // case "invest":
        //   pathData = this.investPathData;
        //   break;
        case "客户关联图谱":
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
    changeShowRiskPart(value) {
      this.showRiskPart = value;
    },
    changeShowGraphPart(value) {
      this.showGraphPart = value;
    },
    changeShowMapPart(value) {
      this.showMapPart = value;
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
    checkData(timer, value) {
      if (!this.graphLoading) {
        // 监听this.relationsData, this.guarData两个变量是否更新
        if (value === "客户关联图谱") {
          this.graphData = this.relationsData;
        }
        clearInterval(timer);
      }
    },
  },
};
</script>
<style lang="less">
.enterprise-insight {
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

    .enterprise-table {
      height: calc(100% - 107px);
    }

    &-item {
      width: 100%;
      position: relative;
      padding: 0 16px;

      &:not(:last-child) {
        padding-bottom: 20px;
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
.operatItems-content {
  max-width: 800px;
}
</style>
