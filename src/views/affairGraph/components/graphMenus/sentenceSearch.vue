<template>
  <div class="sentence-search">
    <div class="sentence-search-content">
      <span class="language-text">查询语法：</span>
      <a-select :value="sentenceLanguage" :options="languageOptions" />
      <a-textArea
        allow-clear
        type="text"
        :auto-size="{ minRows: 15, maxRows: 15 }"
        class="sentence-search-input"
        @pressEnter="handleEnter"
        @change="handleChange"
        v-model.trim="sentenceContent"
      />
      <span class="input-tips">按Shift+Enter执行</span>
      <div class="log-content" v-show="logContentShow">{{ logContent }}</div>
      <div class="sentence-search-button">
        <a-button class="search-button" @click="saveInput" type="primary">
          <a-icon type="cloud-download" /> 保存
        </a-button>
        <a-button
          type="primary"
          class="search-button"
          @click="searchInput"
          :loading="searchLoading"
          icon="search"
        >
          查询
        </a-button>
      </div>
    </div>
    <a-modal
      class="search-modal"
      :width="400"
      :visible="saveSearchVisible"
      :closable="false"
      :destroyOnClose="true"
      @cancel="onCancel"
      :footer="null"
      :mask="false"
      centered
      title="保存查询"
    >
      <div class="search-modal-content">
        <label> 名称： </label>
        <a-input
          autoComplete="off"
          v-model.trim="nameValue"
          class="search-modal-input"
        />
        <div class="modal-save-button">
          <a-button @click="onCancel">取消</a-button>
          <a-button
            v-if="userRights.btn_saveSentenceSearch"
            html-type="submit"
            type="primary"
            @click="saveSearch"
            >保存</a-button
          >
        </div>
      </div>
    </a-modal>
    <search-result-modal
      v-if="resultModalVisible"
      :data="resData"
      @showResults="showResults"
      :resultModalVisible="resultModalVisible"
      @resultModalVisibleChanged="resultModalVisibleChanged"
    />
  </div>
</template>
<script>
import SearchResultModal from "./searchResultModal";
import { Button, Input } from "ant-design-vue";
import { checkThreshold, CYTO_FIT_PADDING } from "@/utils/graph.js";
import {
  handleSentenceSearch,
  handleSaveSentence,
  cypherGrammarVerify,
} from "@/shared/api/graph.js";
import { nanoid } from "nanoid";
import { mapState, mapMutations } from "vuex";

const { TextArea } = Input;

export default {
  name: "SentenceSearch",
  props: ["graphNodes", "savedSentenceData"],
  data() {
    return {
      searchLoading: false,
      saveSearchVisible: false,
      rules: [
        {
          required: true,
        },
      ],
      resultModalVisible: false,
      nameValue: "",
      sentenceLanguage: "cypher",
      languageOptions: [
        {
          value: "cypher",
          label: "cypher",
        },
      ],
      sentenceContent: "",
      resData: [],
      dataType: "",
      logContent: "",
      logContentShow: false,
    };
  },
  components: {
    AButton: Button,
    AInput: Input,
    ATextArea: TextArea,
    SearchResultModal,
  },
  computed: {
    ...mapState("graphOptions", ["graphId", "sentence", "graphFields"]),
    ...mapState("rightsOptions", ["userRights"]),
  },
  mounted() {
    this.sentenceContent = this.sentence || "";
  },
  methods: {
    ...mapMutations("graphOptions", {
      setSearchVertex: "setSearchVertex",
      setSentence: "setSentence",
      setLayoutKey: "setLayoutKey",
    }),
    handleEnter(e) {
      const { key, shiftKey } = e;
      if (key === "Enter" && shiftKey === true) {
        e.preventDefault();
        this.sentenceContent = e.currentTarget.value;
        this.setSentence(this.sentenceContent);
        this.searchInput();
      }
    },
    handleChange(e) {
      this.sentenceContent = e.currentTarget.value;
      this.setSentence(this.sentenceContent);
    },
    saveInput() {
      if (!this.sentenceContent || !this.sentenceContent) {
        this.$message.error("请输入查询语句");
        this.sentenceContent = "";
        this.setSentence(undefined);
      } else {
        this.saveSearchVisible = true;
      }
    },
    async searchInput() {
      if (!this.sentenceContent) {
        this.$message.error("请输入查询语句");
        this.logContentShow = false;
        this.logContent = "";
      } else {
        const loading = this.$message.loading("正在查询", 0);
        try {
          this.searchLoading = true;
          // 语法检测
          // const payload = {
          //   cypher: this.sentenceContent,
          // };
          // const res = await cypherGrammarVerify(payload);
          // if (!res.data.length) {
          //   if (this.logContentShow) {
          //     this.logContent = "语法正确";
          //   }
          const dataJson = {
            graphId: this.graphId,
            queryString: this.sentenceContent,
            queryType: "StatementSearch",
          };
          const graphData = await handleSentenceSearch(dataJson);
          loading();
          if (!graphData) {
            this.$message.warning("输入的查询语句有误，请重新输入");
            return false;
          }
          if (graphData.paths.length) {
            this.dataType = "路径";
            const pathArr = [];
            this.$message.success("查询成功");
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
                dataType: "路径",
                key: nanoid(),
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
          } else if (graphData.edges.length && graphData.vertices.length) {
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
          // } else {
          //   loading();
          //   this.logContent = "error：" + res.data[0].detail;
          //   this.logContentShow = true;
          //   this.$message.error("cypher语句语法存在问题，请修正后再重试！");
          // }
        } finally {
          this.searchLoading = false;
        }
      }
    },
    onCancel() {
      this.saveSearchVisible = false;
      this.nameValue = "";
    },
    async saveSearch() {
      if (this.nameValue === "") {
        this.$message.warning("请输入保存的名称");
        return false;
      }
      let sentenceArr = this.savedSentenceData;
      const flag = sentenceArr.filter((item) => {
        if (item.name === this.nameValue) {
          return item;
        }
      });
      if (!flag.length) {
        const myDate = new Date();
        const date = myDate.toLocaleDateString();
        const hours = myDate.getHours();
        const minutes = myDate.getMinutes();
        const seconds = myDate.getSeconds();
        const timestamp = `${date} ${hours}:${minutes}:${seconds}`;
        const arrItem = {
          id: nanoid(),
          name: this.nameValue,
          createTime: timestamp,
          cqlContext: this.sentenceContent,
        };
        sentenceArr = [...this.savedSentenceData, arrItem];
        const postData = {
          name: this.nameValue,
          cqlContext: this.sentenceContent,
          graphId: this.graphId,
        };
        const res = await handleSaveSentence(postData);
        if (res.message === "成功") {
          this.$message.success("保存成功");
          this.$emit("savedSentenceDataChanged", sentenceArr);
        } else {
          this.$message.error(`${res.message}`);
        }
        this.onCancel();
      } else {
        this.$message.error("保存的名称重复");
      }
    },
    showResults(type, checkedList) {
      this.$emit("canvasLoadingChanged", { loading: true, tip: "正在布局..." });
      let res = {};
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
    resultModalVisibleChanged(value) {
      this.resultModalVisible = value;
    },
  },
};
</script>
<style lang="less">
.sentence-search {
  height: 100%;

  &-content {
    height: 100%;
    padding: 0 24px;

    .language-text {
      color: #949dad;
      margin-right: 10px;
    }

    .ant-select {
      margin-bottom: 16px;
    }

    .input-tips {
      float: right;
      color: #262626;
      margin-top: 16px;
    }

    .log-content {
      height: 140px;
      overflow: auto;
      padding: 4px 11px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      margin-top: 50px;
    }

    .sentence-search-input {
      .anticon-close-circle {
        top: 50%;
        transform: translateY(-50%);
      }
    }

    .sentence-search-button {
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      position: absolute;
      padding: 16px 24px 0;
      justify-content: right;
      border-top: 1px solid #e0e0e0;

      .search-button {
        &:first-child {
          margin-right: 10px;
        }
      }
    }
  }
}

.search-modal {
  .ant-modal-content {
    .ant-modal-header {
      background-color: #e5f1ff;

      .ant-modal-title {
        font-weight: 600;
      }
    }

    .search-modal-input {
      width: calc(100% - 48px);
    }

    .modal-save-button {
      width: 100%;
      margin-top: 20px;
      text-align: center;

      .ant-btn {
        margin-right: 10px;
      }
    }
  }
}
</style>
