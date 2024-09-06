<template>
  <div class="enterprise-defection">
    <div class="defection-tabs">
      <div class="tabs-image">
        <img src="@/assets/images/img/risk_detection.png" />
      </div>
      <a-radio-group :value="selected">
        <a-radio-button
          v-for="(item, index) in tagsData"
          :key="item.title"
          :value="index"
          @click="changeSelected(index)"
        >
          <p class="radio-label">{{ item.title }}</p>
          <p class="selection-num" v-if="item.num || item.num >= 0">
            {{ item.num }}
          </p>
        </a-radio-button>
      </a-radio-group>
    </div>
    <div
      class="defection-content"
      v-if="showRiskPart && tagsData[0].data.length"
    >
      <div class="content-box">
        <div
          class="content-box-item"
          v-for="(item, index) in itemsOptionsObj"
          :key="item.name"
        >
          <div class="content-box-item-group" @click="handleChangeData(index)">
            <div class="box-text">
              <span>{{ item.name }}</span>
              <span class="num">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="showRiskPart && tagsData[0].data.length"
      class="defection-table"
      :style="{ height: showData.length > 5 ? '414px' : 'auto' }"
    >
      <p class="defection-table-header">{{ tableHeader }}</p>
      <table-component
        :columns="columns"
        :data-source="showData"
        :pagination="pagination"
        :rowKey="(record) => record.warningId"
        class="risk-table"
      >
        <span slot="pathString" slot-scope="record">
          <a-tooltip
            placement="topLeft"
            overlayClassName="pathString-content"
            v-if="record.pathString"
          >
            <template slot="title">{{ record.pathString }}</template>
            {{ strReduct(record.pathString, 150) }}
          </a-tooltip>
        </span>
        <span slot="actions" slot-scope="record">
          <a @click="checkDetail(record)">路径探索</a>
        </span>
      </table-component>
    </div>
  </div>
</template>

<script>
import TableComponent from "@/components/tableComponent";
import { Radio, Tooltip } from "ant-design-vue";
import { getWarningPath } from "@/shared/api/riskWarning.js";
import { mapState, mapMutations } from "vuex";
import { strReduct } from "@/utils/common.js";

const { Group, Button } = Radio;

export default {
  name: "RiskDetection",
  props: ["data", "tagsData", "pageType", "itemsOptionsObj", "showRiskPart"],
  data() {
    return {
      selected: 0,
      columns: [
        {
          title: "风险类型",
          dataIndex: "class",
          key: "class",
          width: 120,
        },
        {
          title: "路径",
          dataIndex: "pathString",
          key: "pathString",
          width: 507,
          scopedSlots: { customRender: "pathString" },
        },
        {
          title: "最近检测日期",
          dataIndex: "lastCheckTime",
          key: "lastCheckTime",
          width: 120,
        },
        {
          title: "操作",
          dataIndex: "actions",
          key: "actions",
          width: 100,
          scopedSlots: { customRender: "actions" },
        },
      ],
      pagination: {
        size: "small",
        current: 1,
        pageSize: 5,
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
        },
        onShowSizeChange: (current, size) => {
          this.pagination.current = current;
          this.pagination.pageSize = size;
        },
      },
      searchSentenceOptions: [],
      itemsArr: [],
      showData: [],
      tableHeader: "",
      process: false,
    };
  },
  components: {
    ARadioGroup: Group,
    ARadioButton: Button,
    ATooltip: Tooltip,
    TableComponent,
  },
  computed: {
    ...mapState("rightsOptions", ["userInfo"]),
    strReduct() {
      return (str, len) => {
        return strReduct(str, len);
      };
    },
  },
  mounted() {
    this.showData = this.tagsData[0].data;
    this.tableHeader = "风险线索";
  },
  watch: {
    data() {
      if (!this.pageType) {
        this.init();
      }
    },
  },
  methods: {
    ...mapMutations("graphOptions", {
      setFirstNode: "setFirstNode",
    }),
    handleChangeData(index) {
      this.tableHeader =
        (this.itemsOptionsObj[index] && this.itemsOptionsObj[index].name) || "";
      const showData = [];
      this.tagsData[0].data.map((item) => {
        if (item.class === this.tableHeader) {
          showData.push(item);
        }
      });
      this.showData = showData;
    },
    async checkDetail(record) {
      if (this.process) {
        return false;
      }
      this.process = true;
      const loading = this.$message.loading("正在获取路径信息", 0);
      const pathData = {
        vertices: [],
        edges: [],
      };
      let nodeData = {};
      const json = {
        id: record.warningId,
        customerName: record.customerName,
      };
      const data = await getWarningPath(json);
      loading();
      this.process = false;
      if (!data) {
        this.$message.error("获取线索路径信息失败，请重新尝试");
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
      this.$router.push({
        name: "affairGraphAnalysis",
        params: {
          nodeData,
          pathData,
          isSkip: true,
        },
      });
    },
    changeSelected(value) {
      this.selected = value;
      switch (this.pageType) {
        case "personInsight":
          if (this.selected === 0) {
            this.showData = this.tagsData[this.selected].data;
            this.tableHeader =
              (this.itemsOptionsObj[0] && this.itemsOptionsObj[0].name) || "";
            this.handleChangeData(0);
            this.$emit("changeShowGraphPart", false);
            this.$emit("changeShowTablePart", false);
            this.$emit("changeShowRiskPart", true);
          } else if (this.selected === 1) {
            this.$emit("changeShowTablePart", false);
            this.$emit("changeShowRiskPart", false);
            this.$emit("changeShowGraphPart", true);
            this.$emit("changeGraphTitle", "客户关联图谱");
          } else {
            this.$emit("changeShowGraphPart", false);
            this.$emit("changeShowRiskPart", false);
            this.$emit("changeShowTablePart", true);
          }
          break;
        case "employeeInsight":
          if (this.selected === 0) {
            this.showData = this.tagsData[this.selected].data;
            this.tableHeader =
              (this.itemsOptionsObj[0] && this.itemsOptionsObj[0].name) || "";
            this.handleChangeData(0);
            this.$emit("changeShowGraphPart", false);
            this.$emit("changeShowTablePart", false);
            this.$emit("changeShowRiskPart", true);
          } else {
            this.$emit("changeShowTablePart", false);
            this.$emit("changeShowRiskPart", false);
            this.$emit("changeShowGraphPart", true);
            this.$emit("changeGraphTitle", "员工关联图谱");
          }
          //  else if (this.selected === 6) {
          //   this.$emit("changeShowGraphPart", false);
          //   this.$emit("changeShowRiskPart", false);
          //   this.$emit("changeShowTablePart", true);
          //   this.$emit("changeGraphTitle", "员工社交画像");
          // }
          break;
        default:
          if (this.selected === 0) {
            this.showData = this.tagsData[this.selected].data;
            this.tableHeader = "风险线索";
            this.$emit("changeShowGraphPart", false);
            this.$emit("changeShowMapPart", false);
            this.$emit("changeShowRiskPart", true);
          } else if (this.selected === 1) {
            this.$emit("changeShowMapPart", false);
            this.$emit("changeShowRiskPart", false);
            this.$emit("changeShowGraphPart", true);
            this.$emit("changeGraphTitle", "客户关联图谱");
          } else {
            this.$emit("changeShowGraphPart", false);
            this.$emit("changeShowRiskPart", false);
            this.$emit("changeShowMapPart", true);
            this.$emit("changeGraphTitle", "股权穿透分析");
          }
          break;
      }
    },
  },
};
</script>

<style lang="less">
.enterprise-defection {
  background: #fff;
  min-height: 78px;
  padding-bottom: 20px;

  .defection-tabs {
    height: 56px;
    display: flex;
    padding: 0 10px;
    border: 1px solid #e7edf1;

    .tabs-image {
      display: flex;
      align-items: center;
      padding-right: 10px;
    }

    .ant-radio-group {
      .ant-radio-button-wrapper {
        width: 150px;
        border: none;
        height: auto;
        height: 100%;
        border-radius: 0;
        padding-top: 3px;
        text-align: center;
        position: relative;

        &:focus-within {
          box-shadow: none;
        }

        span:nth-child(2) {
          display: flex;
          line-height: 26px;
          flex-direction: column;
          justify-content: center;
          position: absolute;
          width: 100%;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);

          .radio-label {
            color: #515a6e;
          }

          .selection-num {
            color: #f6001a;
          }
        }

        &.ant-radio-button-wrapper-checked {
          border-left: 1px solid #e7edf1;
          border-right: 1px solid #e7edf1;

          &::before {
            left: 0;
            top: -1px;
            width: 149px;
            content: "";
            height: 1px;
            display: block;
            padding: 1px 0;
            position: absolute;
            box-sizing: content-box;
            background-color: @activeFontColor;
            transition: none;
          }

          &::after {
            left: 0;
            bottom: -1px;
            width: 149px;
            content: "";
            height: 1px;
            display: block;
            position: absolute;
            box-sizing: content-box;
            background-color: #fff;
            transition: none;
          }
        }
      }
    }
  }

  .defection-content {
    position: relative;
    background: #fff;
    height: 120px;

    .content-box {
      height: 60px;
      width: 80%;
      min-width: 600px;
      background: #fff;
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.16);
      opacity: 1;
      border-radius: 4px;
      margin-top: 30px;
      position: absolute;
      left: 10%;
      display: flex;
      justify-content: space-around;
      padding: 15px;

      &-item {
        width: calc((100% - 2px) / 3);
        display: flex;
        align-items: center;
        justify-content: space-around;

        &:not(:last-of-type) {
          border-right: 1px solid #e8e8e8;
        }

        &-group {
          width: 100%;
          display: flex;
          cursor: pointer;
          align-items: center;
          justify-content: space-around;
        }
      }

      .box-text {
        text-align: center;

        .num {
          margin-left: 5px;
        }
      }

      .ant-divider {
        height: 30px;
      }
    }
  }
  .defection-table {
    padding: 0 16px;
    height: calc(100% - 186px);

    &-header {
      color: @activeFontColor;
      padding: 10px 0;
    }

    .risk-table {
      height: 100%;
      padding-top: 0 !important;

      .ant-table-placeholder {
        .ant-empty-normal {
          margin: 0;
        }
      }
    }
  }
}

.pathString-content {
  .ant-tooltip-content {
    width: 620px;
    height: 300px;
    overflow: auto;
  }
}
</style>
