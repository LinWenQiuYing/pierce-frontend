<template>
  <div class="saved-search">
    <a-radio-group
      default-value="0"
      button-style="solid"
      v-model="selected"
      @change="changeSelected"
    >
      <a-radio-button value="0" v-if="userRights.btn_childEntitySearch">
        实体查询
      </a-radio-button>
      <a-radio-button value="1" v-if="userRights.btn_childSentenceSearch">
        语句查询
      </a-radio-button>
    </a-radio-group>
    <table-component
      :columns="columns"
      :data-source="showData"
      :scroll="{ x: 'max-content', y: 'calc(100% - 39px)' }"
      :rowKey="(record) => record.id"
      :customRow="handleClickRow"
      :pagination="pagination"
      class="saved-table"
    >
      <div slot="name" slot-scope="record" class="table-name">
        <a-tooltip placement="topLeft">
          <template slot="title">
            <span>{{ record.name }}</span>
          </template>
          {{ record.name }}
        </a-tooltip>
      </div>
      <div slot="cqlContext" slot-scope="record" class="table-cqlContext">
        <a-tooltip placement="topLeft" overlayClassName="sentence-content">
          <template slot="title">
            <span>{{ record.cqlContext }}</span>
          </template>
          查询内容
        </a-tooltip>
      </div>
      <div slot="actions" slot-scope="record" class="table-actions">
        <a
          @click="
            (e) => {
              handleDelete(e, record);
            }
          "
          v-if="
            (selected === '0' && userRights.btn_deleteEntitySearch) ||
            (selected === '1' && userRights.btn_deleteSentenceSearch)
          "
          >删除</a
        >
        <a
          @click="
            (e) => {
              handleSearch(e, record);
            }
          "
          v-if="
            (selected === '0' && userRights.btn_executeEntitySearch) ||
            (selected === '1' && userRights.btn_executeSentenceSearch)
          "
          >执行查询</a
        >
        <a
          v-if="
            (selected === '0' &&
              !userRights.btn_deleteEntitySearch &&
              !userRights.btn_executeEntitySearch) ||
            (selected === '1' &&
              !userRights.btn_deleteSentenceSearch &&
              !userRights.btn_executeSentenceSearch)
          "
          class="no-action"
        >
          暂无操作权限
        </a>
      </div>
    </table-component>
    <search-result-modal
      v-if="resultModalVisible"
      :data="resData"
      :resultModalVisible="resultModalVisible"
      @showResults="showResults"
      @resultModalVisibleChanged="resultModalVisibleChanged"
    />
  </div>
</template>
<script>
import SearchResultModal from "./searchResultModal";
import TableComponent from "@/components/tableComponent";
import { Radio, Tooltip } from "ant-design-vue";
import {
  handleSentenceSearch,
  advancedSearch,
  deleteSavedSentence,
  deleteSavedEntity,
} from "@/shared/api/graph.js";
import { checkThreshold, CYTO_FIT_PADDING } from "@/utils/graph.js";
import { nanoid } from "nanoid";
import { mapState, mapMutations } from "vuex";
import { modalConfirm } from "@/utils/common.js";

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

export default {
  name: "SavedSearch",
  props: ["savedSentenceData", "savedEntityData", "graphNodes"],
  data() {
    return {
      columns: [
        {
          title: "名称",
          dataIndex: "name",
          key: "name",
          width: 200,
          scopedSlots: { customRender: "name" },
        },
        {
          title: "创建时间",
          dataIndex: "createTime",
          key: "createTime",
          width: 180,
        },
        {
          title: "查询内容",
          dataIndex: "cqlContext",
          key: "cqlContext",
          width: 90,
          scopedSlots: { customRender: "cqlContext" },
        },
        {
          title: "操作",
          key: "actions",
          dataIndex: "actions",
          scopedSlots: { customRender: "actions" },
          width: 128,
        },
      ],
      dataType: "",
      resData: [],
      resultModalVisible: false,
      showData: [],
      pagination: {
        size: "small",
        total: 0,
        current: 1,
        pageSize: 10,
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
      selected: "0",
      isSearch: false,
    };
  },
  components: {
    SearchResultModal,
    ATooltip: Tooltip,
    ARadioGroup: RadioGroup,
    ARadioButton: RadioButton,
    TableComponent,
  },
  computed: {
    ...mapState("graphOptions", ["graphId", "graphFields"]),
    ...mapState("rightsOptions", ["userRights"]),
  },
  mounted() {
    this.showData = this.savedEntityData;
  },
  watch: {
    savedSentenceData(newValue) {
      this.savedSentenceData = newValue;
      this.showData = this.savedSentenceData;
      this.selected = "1";
    },
    savedEntityData(newValue) {
      this.savedEntityData = newValue;
      this.showData = this.savedEntityData;
      this.selected = "0";
    },
  },
  methods: {
    ...mapMutations("graphOptions", {
      setSearchVertex: "setSearchVertex",
      setLayoutKey: "setLayoutKey",
    }),
    handleClickRow(record) {
      return {
        on: {
          click: () => {
            this.resultModalVisible = false;
            if (this.selected === "1") {
              this.$emit("sentenceContentChanged", record.cqlContext);
              this.$emit("handleChangeActiveKey", "2");
            } else if (this.selected === "0") {
              // console.log("record", record, record.cqlContext);
              // this.$emit("entityRulesChanged", record.cqlContext);
              // this.$emit("handleChangeActiveKey", "1");
            }
          },
        },
      };
    },
    handleDelete(e, record) {
      e.stopPropagation();
      const _that = this;
      const title = `确定要删除 ${record.name} 吗？`;
      const onOk = () => {
        if (_that.selected === "1") {
          const restArr = _that.savedSentenceData.filter((item) => {
            if (record.id !== item.id) {
              return item;
            }
          });
          _that.$emit("savedSentenceDataChanged", restArr);
          deleteSavedSentence(record.id);
        } else {
          const restArr = _that.savedEntityData.filter((item) => {
            if (record.id !== item.id) {
              return item;
            }
          });
          _that.$emit("savedEntityDataChanged", restArr);
          deleteSavedEntity(record.id);
        }
        _that.$message.success("删除成功");
      };
      modalConfirm(title, _that, onOk);
    },
    async handleSearch(e, record) {
      e.stopPropagation();
      // if (this.isSearch) return false;
      // this.isSearch = true;
      this.$message.destroy();
      const loading = this.$message.loading("正在查询", 0);
      if (this.selected === "1") {
        // 语句查询
        const dataJson = {
          graphId: this.graphId,
          queryString: record.cqlContext,
          queryType: "StatementSearch",
        };
        const graphData = await handleSentenceSearch(dataJson);
        loading();
        if (!graphData) {
          this.$message.warning("输入的查询语句有误，请重新输入");
          return false;
        }
        if (graphData.paths.length > 0) {
          this.dataType = "路径";
          this.$message.success("查询成功");
          const pathArr = [];
          graphData.paths.map((path) => {
            let pathString = "";
            const arrLength = path.vertices.length;
            path.vertices.map((vertex, index) => {
              if (index === arrLength - 1) {
                pathString += vertex.userId;
              } else {
                pathString +=
                  vertex.userId + "->" + path.edges[index].label + "->";
              }
            });
            pathArr.push({
              content: pathString,
              key: nanoid(),
              dataType: "路径",
              path,
            });
          });
          this.resData = pathArr;
          this.resultModalVisible = true;
        } else if (graphData.vertices.length) {
          this.dataType = "节点";
          this.$message.success("查询成功");
          this.resData = graphData.vertices.map((item) => {
            return {
              ...item,
              key: item.id,
              dataType: item.label,
            };
          });
          this.resultModalVisible = true;
        } else if (graphData.edges.length) {
          this.dataType = "路径";
          const pathArr = [];
          this.$message.success("查询成功");
          let pathString = "";
          const arrLength = graphData.vertices.length;
          graphData.vertices.map((vertex, index) => {
            if (index === arrLength - 1) {
              pathString += vertex.userId;
            } else {
              pathString +=
                vertex.userId + "->" + graphData.edges[index].label + "->";
            }
          });
          pathArr.push({
            content: pathString,
            dataType: "路径",
            key: nanoid(),
            path: {
              vertices: graphData.vertices,
              edges: graphData.edges,
            },
          });
          this.resData = pathArr;
          this.resultModalVisible = true;
        } else {
          this.$message.info("未找到符合要求的节点或路径");
        }
      } else if (this.selected === "0") {
        const conditions = record.conditions;
        conditions[0].orderByCondition = {
          attribute: "",
          attributeType: "",
          orderByType: "ASC",
        };
        const json = {
          branchId: this.graphId,
          conditions,
          desc: record.cqlContext,
          elementType: "vertex",
          filterNote: false,
          id: this.graphId,
          limit: record.maxCount,
          queryType: "AdvancedSearch",
          tags: [],
        };
        const res = await advancedSearch(json);
        loading();
        if (res && res.vertices && res.vertices.length > 0) {
          this.$message.success("查询成功");
          this.resData = res.vertices;
          this.dataType = "节点";
          this.resData = res.vertices.map((item) => {
            return {
              ...item,
              key: item.id,
              dataType: item.label,
            };
          });
          this.resultModalVisible = true;
        } else {
          this.$message.info("未找到符合要求的实体");
        }
      } else {
        loading();
        this.$message.error("查询有误");
      }
      this.isSearch = false;
    },
    showResults(type, checkedList) {
      this.$emit("canvasLoadingChanged", { loading: true, tip: "正在布局..." });
      let res = {};
      if (this.selected === "1") {
        if (this.dataType === "路径") {
          const resultEdges = [];
          const resultVertices = [];
          const graphData = checkedList.map((item) => {
            return item.path;
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
            referenceNodes: [resultVertices],
            anchorNodeIds: [],
            type: "NEIGHBOR",
          };
          if (type === "replace") {
            this.setSearchVertex([resultVertices[0]]);
            sessionStorage.setItem(
              "searchVertex",
              JSON.stringify([resultVertices[0]])
            );
            this.$graph.datas.clear();
          }
          res = checkThreshold(data, this.$graph, "1", this.graphFields);
          if (type === "addition") {
            res.nodes.forEach((node) => {
              node.selected = true;
              this.$graph.datas.addNode(node);
            });
            res.edges.forEach((edge) => {
              edge.selected = true;
              this.$graph.datas.addEdge(edge);
            });
          } else {
            this.$graph.datas.setNodes(res.nodes);
            this.$graph.datas.setEdges(res.edges);
          }
        } else if (this.dataType === "节点") {
          let elements = [...checkedList];
          const data = {
            replace: false,
            elements,
            referenceNodes: [],
            anchorNodeIds: [],
            type: "NEIGHBOR",
          };
          if (type === "replace") {
            this.setSearchVertex([elements[0]]);
            sessionStorage.setItem(
              "searchVertex",
              JSON.stringify([elements[0]])
            );
            this.$graph.datas.clear();
          }
          res = checkThreshold(data, this.$graph, "1", this.graphFields);
          if (type === "addition") {
            res.nodes.forEach((node) => {
              node.selected = true;
              this.$graph.datas.addNode(node);
            });
          } else {
            this.$graph.datas.setNodes(res.nodes);
          }
        }
      } else if (this.selected === "0") {
        let elements = [...checkedList];
        const data = {
          replace: false,
          elements,
          referenceNodes: [],
          anchorNodeIds: [],
          type: "NEIGHBOR",
        };
        if (type === "replace") {
          this.setSearchVertex([elements[0]]);
          sessionStorage.setItem("searchVertex", JSON.stringify([elements[0]]));
          this.$graph.datas.clear();
        }
        res = checkThreshold(data, this.$graph, "1", this.graphFields);
        if (type === "addition") {
          res.nodes.forEach((node) => {
            node.selected = true;
            this.$graph.datas.addNode(node);
          });
        } else {
          this.$graph.datas.setNodes(res.nodes);
        }
      }
      this.resultModalVisible = false;
      this.$emit("isShowSceneSearchChanged", false);
      this.$emit("selectedElesChanged", [], []);

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
      const addNodeArr = res.nodes.map((node) => node.data);
      if (type === "addition") {
        this.$emit("graphNodesChanged", [...this.graphNodes, ...addNodeArr]);
      } else {
        this.$emit("graphNodesChanged", addNodeArr);
      }
    },
    changeSelected(e) {
      this.selected = e.target.value;
      this.showData =
        this.selected === "0" ? this.savedEntityData : this.savedSentenceData;
    },
    resultModalVisibleChanged(value) {
      this.resultModalVisible = value;
    },
  },
};
</script>
<style lang="less">
.saved-search {
  height: 100%;

  .ant-radio-group {
    width: 100%;
    height: 34px;
    display: flex;
    background: #fdfdfd;
    border-top: 1px solid #e4e7ed;
    border-bottom: 1px solid #e4e7ed;

    .ant-radio-button-wrapper {
      border: none;
      height: 32px;
      line-height: 32px;
      color: #515a6e;
      border-radius: 0;
      background: #fdfdfd;

      &.ant-radio-button-wrapper-checked {
        height: 34px;
        border: none;
        margin-top: -1px;
        color: #2362fb;
        background-color: #fff;
        border-top: 1px solid #2362fb;

        &:focus-within {
          box-shadow: none;
        }

        &:not(.ant-radio-button-wrapper-disabled)::before {
          top: 0;
          height: 30px;
          background: none;
        }

        &::after {
          content: "";
          top: -1px;
          right: 0;
          width: 1px;
          height: 100%;
          display: block;
          padding: 1px 0;
          position: absolute;
          background-color: #d9d9d9;
          transition: background-color 0.3s;
        }
      }

      &:hover {
        color: #2362fb;
      }

      &:not(:first-child)::before {
        top: -2px;
        border-left: 1px solid #e4e7ed;
      }

      &:first-child::after {
        content: none;
      }
    }
  }

  .saved-table {
    padding: 24px 16px 0;
    height: calc(100% - 34px);

    .ant-table-row-cell-break-word {
      .table-name,
      .table-cqlContext,
      .table-action {
        width: 100%;
        height: 27px;
        overflow: hidden;
        line-height: 27px;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .table-name {
        width: 173px;
      }
    }
  }
}
.sentence-content {
  max-width: 800px;
}
</style>
