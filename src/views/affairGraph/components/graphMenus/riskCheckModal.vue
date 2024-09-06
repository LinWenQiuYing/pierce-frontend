<template>
  <div>
    <a-modal
      :width="490"
      :mask="false"
      title="线索检测"
      :closable="true"
      @cancel="onCancel"
      :destroyOnClose="true"
      class="risk-check-modal"
      :visible="showRiskCheck"
    >
      <template slot="footer">
        <a-button @click="onCancel">取消</a-button>
        <a-button
          type="primary"
          @click="onConfirm"
          :loading="searchLoading"
          :disabled="isDisabled"
        >
          确认
        </a-button>
      </template>
      <div class="risk-check-modal-title">选中实体</div>
      <p class="risk-check-modal-item">
        类型：
        <span class="risk-check-modal-item-type">{{ searchType }}</span>
      </p>
      <p class="risk-check-modal-item">
        名称：
        <span class="risk-check-modal-item-name">{{ searchName }}</span>
      </p>
      <div class="risk-check-modal-title">风险异常</div>
      <div class="risk-check-modal-options">
        <risk-check-option
          :option="riskOption"
          @ruleValueChange="ruleValueChange"
        />
      </div>
    </a-modal>
    <a-modal
      class="risk-check-result-modal"
      :title="'搜索结果（' + pathData.length + '个）'"
      :width="500"
      :mask="false"
      :closable="true"
      :visible="resultModalVisible"
      @cancel="onResultModalCancel"
      :destroyOnClose="true"
    >
      <template slot="footer">
        <div class="search-result-modal-footer">
          <div class="footer-right">
            <a-button @click="onResetCheck">
              <a-icon type="redo" :rotate="-90" /> 重置
            </a-button>
            <a-button
              type="primary"
              :disabled="!checkedList.length"
              @click="showResults('replace')"
            >
              覆盖
            </a-button>
            <a-button
              type="primary"
              :disabled="!checkedList.length"
              @click="showResults('addition')"
            >
              新增
            </a-button>
          </div>
        </div>
      </template>
      <table-component
        :columns="columns"
        :data-source="pathData"
        :row-selection="rowSelection"
        :pagination="pagination"
        class="result-table"
      >
        <div slot="content" slot-scope="record" class="table-slot">
          <a-tooltip placement="topLeft">
            <template slot="title">
              <span>{{ record.content }}</span>
            </template>
            <span>{{ record.content }}</span>
          </a-tooltip>
        </div>
        <span slot="dataType" slot-scope="record" class="result-input-text">
          {{ record.dataType }}
        </span>
      </table-component>
    </a-modal>
  </div>
</template>
<script>
import RiskCheckOption from "./riskCheckOption";
import TableComponent from "@/components/tableComponent";
import { mapState, mapMutations } from "vuex";
import { Button, Tooltip } from "ant-design-vue";
import { checkThreshold, CYTO_FIT_PADDING } from "@/utils/graph.js";
import { nanoid } from "nanoid";
import {
  getWarningList,
  batchQueryRiskWarningPaths,
} from "@/shared/api/riskWarning";

export default {
  name: "RiskCheckModal",
  props: ["graph", "showRiskCheck", "selectedNodes", "graphNodes"],
  data() {
    return {
      columns: [
        {
          title: "内容",
          dataIndex: "content",
          key: "content",
          width: 327,
          scopedSlots: { customRender: "content" },
        },
        {
          title: "标签",
          dataIndex: "dataType",
          key: "dataType",
          width: 60,
          scopedSlots: { customRender: "dataType" },
        },
      ],
      pagination: {
        size: "small",
        total: 0,
        current: 1,
        pageSize: 15,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ["5", "10", "15", "20"],
        showTotal: (total) => {
          return `共${total}条记录`;
        },
        onChange: (page, pageSize) => {
          this.pagination.current = page;
          this.pagination.pageSize = pageSize;
        },
        onShowSizeChange: (current, size) => {
          this.pagination.current = current;
          this.pagination.pageSize = size;
        },
      },
      pathData: [],
      ruleName: "",
      checkedList: [],
      childrenArr: [],
      searchType: "",
      searchName: "",
      searchTitle: "",
      searchContent: "",
      categoryId: undefined,
      childId: undefined,
      childShow: false,
      searchLoading: false,
      indeterminate: false,
      resultModalVisible: false,
      riskOption: {
        id: nanoid(),
        ruleValue: undefined,
        ruleName: "",
      },
      isDisabled: true,
    };
  },
  components: {
    AButton: Button,
    ATooltip: Tooltip,
    RiskCheckOption,
    TableComponent,
  },
  computed: {
    ...mapState("graphOptions", ["graphFields"]),
    rowSelection() {
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          this.checkedList = selectedRows;
          if (this.checkedList.length === 0) {
            this.indeterminate = false;
          } else if (this.checkedList.length < this.pathData.length) {
            this.indeterminate = true;
          } else {
            this.indeterminate = false;
          }
        },
      };
    },
  },
  mounted() {
    if (this.selectedNodes.length) {
      this.searchType = this.selectedNodes[0].nodeType;
      this.searchName = this.selectedNodes[0].name;
      this.searchId = this.selectedNodes[0].id;
      this.searchTitle =
        this.selectedNodes[0].nodeType === "企业" ? "enterprisename" : "certid";
      this.searchContent = this.selectedNodes[0].name;
    }
  },
  watch: {
    selectedNodes() {
      if (this.selectedNodes.length) {
        this.searchType = this.selectedNodes[0].nodeType;
        this.searchName = this.selectedNodes[0].name;
        this.searchId = this.selectedNodes[0].id;
        this.searchTitle =
          this.selectedNodes[0].nodeType === "企业"
            ? "enterprisename"
            : "certid";
        this.searchContent = this.selectedNodes[0].name;
      }
    },
  },
  methods: {
    ...mapMutations("graphOptions", {
      setSearchVertex: "setSearchVertex",
      setLayoutKey: "setLayoutKey",
    }),
    onCancel() {
      this.$emit("isShowRiskCheckChanged", false);
    },
    onResultModalCancel() {
      this.resultModalVisible = false;
    },
    async onConfirm() {
      this.searchLoading = true;
      try {
        const json = {
          ruleName: this.riskOption.ruleName,
          warningRuleId: this.riskOption.ruleValue,
          customerName: this.searchContent,
          pageNo: 1,
          pageSize: 1000,
        };
        const graphData = await getWarningList(json);
        if (!graphData) {
          this.$message.error("获取线索信息失败");
          return false;
        } else if (graphData.dateList && !graphData.dateList.length) {
          this.$message.info("暂无相关线索");
        } else {
          const pathData = [];
          graphData.dateList.map((item) => {
            pathData.push({
              content: item.warningDetail,
              key: nanoid(),
              dataType: "路径",
              riskId: item.id,
            });
          });
          this.pathData = pathData;
          this.resultModalVisible = true;
        }
      } finally {
        this.searchLoading = false;
      }
    },
    onResetCheck() {
      this.checkedList = [];
      this.indeterminate = false;
    },
    async showResults(type) {
      const resultEdges = [];
      const resultVertices = [];
      this.$emit("canvasLoadingChanged", { loading: true, tip: "正在布局..." });
      // const riskList = ["916393720230846464", "916394982871539712"];
      const riskList = [];
      this.checkedList.map((item) => {
        riskList.push(item.riskId);
      });
      const json = {
        ids: riskList,
      };
      const riskPath = await batchQueryRiskWarningPaths(json);
      const graphData = [];
      Object.keys(riskPath).forEach((key) => {
        graphData.push(...riskPath[key]);
      });
      // 将fieldsMap转换为property
      graphData.map((path) => {
        path.vertices.map((vertex) => {
          if (!vertex.property) {
            vertex.property = {};
            Object.keys(vertex.fieldsMap).forEach((key) => {
              vertex.property[key] = vertex.fieldsMap[key].fieldValue;
            });
          }
        });
        path.edges.map((edge) => {
          if (!edge.property) {
            edge.property = {};
            Object.keys(edge.fieldsMap).forEach((key) => {
              edge.property[key] = edge.fieldsMap[key].fieldValue;
            });
          }
        });
      });
      graphData.map((path) => {
        path.edges.map((edge) => {
          resultEdges.push(edge);
        });
        path.vertices.map((vertex) => {
          resultVertices.push(vertex);
        });
      });
      const elements = [...resultEdges, ...resultVertices];
      const data = {
        replace: false,
        elements,
        referenceNodes: resultVertices,
        anchorNodeIds: [],
        type: "NEIGHBOR",
      };
      const targetNode = resultVertices.filter((vertex) => {
        if (vertex.id === this.selectedNodes[0].id) {
          return vertex;
        }
      });
      let res = null;
      if (type === "replace") {
        this.setSearchVertex([targetNode[0]]);
        sessionStorage.setItem("searchVertex", JSON.stringify([targetNode[0]]));
        this.$graph.datas.clear();
        res = checkThreshold(data, this.$graph, "1", this.graphFields);
      } else {
        res = checkThreshold(data, this.$graph, "1", this.graphFields, true);
      }
      const { nodes, edges } = res;
      if (type === "addition") {
        nodes.forEach((node) => {
          node.selected = true;
          this.$graph.datas.addNode(node);
        });
        edges.forEach((edge) => {
          edge.selected = true;
          this.$graph.datas.addEdge(edge);
        });
      } else {
        this.$graph.datas.setNodes(nodes);
        this.$graph.datas.setEdges(edges);
      }
      this.resultModalVisible = false;
      this.$emit("isShowRiskCheckChanged", false);

      this.$emit("canvasLoadingChanged", {
        loading: false,
        tip: "布局完成",
      });
      this.$nextTick(() => {
        this.setLayoutKey("breadthfirst");
        setTimeout(() => {
          this.$graph.events.changeLayout("breadthfirst");
          this.$graph.cy.animate({
            fit: CYTO_FIT_PADDING,
            duration: 200,
          });
        }, 200);
      });
      const addNodeArr = nodes.map((node) => node.data);
      this.$emit("selectedElesChanged", [], []);
      if (type === "addition") {
        this.$emit("graphNodesChanged", [...this.graphNodes, ...addNodeArr]);
      } else {
        this.$emit("graphNodesChanged", addNodeArr);
      }
    },
    handleSelectChild(value) {
      if (!value) {
        this.childId = undefined;
        return;
      } else {
        this.childId = value.trim();
      }
    },
    filterOption(value, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .indexOf(value.toLowerCase()) >= 0
      );
    },
    // handleAddCheckOptions() {
    //   this.riskOptions.push({
    //     id: nanoid(),
    //     ruleValue: undefined,
    //     ruleName: "",
    //   });
    // },
    // riskOptionsChange(id) {
    //   for (let i = 0; i < this.riskOptions.length; i++) {
    //     const element = this.riskOptions[i];
    //     if (element.id === id) {
    //       this.riskOptions.splice(i, 1);
    //     }
    //   }
    //   if (this.riskOptions[0] && this.riskOptions[0].ruleValue) {
    //     this.isDisabled = false;
    //   } else {
    //     this.isDisabled = true;
    //   }
    // },
    ruleValueChange(id, value, name) {
      if (this.riskOption.id === id) {
        this.riskOption.ruleValue = value;
        this.riskOption.ruleName = name;
      }
      if (this.riskOption.ruleValue) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
    },
  },
};
</script>
<style lang="less">
.risk-check-modal {
  .ant-modal {
    margin: 0;
    top: auto;
    bottom: 0;
    left: 160px;
    height: 600px;
    overflow: hidden;
    padding-bottom: 0;
    position: absolute;
    box-shadow: 0 4px 12px 0 #dbdfee;
  }

  .ant-modal-content {
    height: 100%;
    z-index: 1080;
    background: #fff;

    .ant-modal-header {
      border-bottom: 1px solid #e0e0e0;

      .ant-modal-title {
        font-size: 17px;
        font-weight: 600;
      }
    }

    .ant-modal-body {
      overflow: auto;
      height: calc(100% - 108px);

      .risk-check-modal-title {
        margin-bottom: 15px;
        color: @primaryTextColor;

        .modal-title-text {
          font-weight: 700;
          font-size: 15px;
        }
      }

      .risk-check-modal-item {
        display: flex;
        flex-wrap: wrap;
        color: #949dad;
        margin-bottom: 15px;

        .ant-radio-wrapper {
          margin-right: 0;
          color: #949dad;

          &.ant-radio-wrapper-checked {
            color: #1790fa;
          }

          span {
            font-size: 14px;
          }
        }

        &-type {
          width: 48px;
          height: 22px;
          font-size: 12px;
          color: #1790fa;
          line-height: 20px;
          text-align: center;
          display: inline-block;
          background: #e6f7ff;
          border: 1px solid #91d5ff;
        }

        &-name {
          color: #1790fa;
          overflow: hidden;
          white-space: nowrap;
          display: inline-block;
          text-overflow: ellipsis;
          width: calc(100% - 43px);
        }

        &.fund-error {
          display: block;

          .ant-radio-wrapper {
            display: block;
            margin-bottom: 15px;
          }
        }
      }

      .risk-check-modal-options {
        height: calc(100% - 145px);
        overflow: auto;
      }

      .risk-check-modal-addbtn {
        cursor: pointer;
        color: @activeFontColor;
      }
    }
  }
}

.risk-check-result-modal {
  .ant-modal {
    top: auto;
    bottom: 0;
    margin: 0;
    left: 674px;
    width: 500px;
    height: 600px;
    padding-bottom: 0;
    position: absolute;
  }

  .ant-modal-content {
    height: 100%;

    .ant-modal-header {
      border-bottom: 1px solid #e0e0e0;

      .ant-modal-title {
        font-size: 17px;
        font-weight: 600;
      }
    }

    .ant-modal-body {
      overflow: auto;
      padding: 20px 24px 0;
      height: calc(100% - 108px);

      .result-table {
        .table-slot {
          width: 295px;
          height: 27px;
          overflow: hidden;
          line-height: 27px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }

    .ant-modal-footer {
      padding: 10px 24px;

      .search-result-modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .footer-left {
          .ant-checkbox {
            margin-top: 2px;
          }
        }
      }
    }
  }
}
</style>
