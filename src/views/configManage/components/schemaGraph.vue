<template>
  <div class="schema-graph" ref="schemaGraph">
    <a-spin
      :spinning="canvasLoading.loading"
      class="schema-graph-loading"
      :tip="canvasLoading.tip"
    />
    <div :id="graphId" class="schema-graph-canvas"></div>
    <div class="layout">
      <label class="layout-title">布局样式:</label>
      <a-select
        class="layout-select"
        v-model="layoutKey"
        @select="changeLayout"
        dropdown-class-name="global-selectOption"
      >
        <a-select-option
          v-for="item in layoutOptions"
          :key="item.key"
          :title="item.value"
          :value="item.value"
        >
          {{ item.key }}({{ item.value }})
        </a-select-option>
      </a-select>
    </div>
    <div class="adapt-screen" @click="handleFit">
      <a-icon type="fullscreen" />
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import KGraph from "@sophon/kgraph";
import {
  checkThreshold,
  CYTON_MAX_ZOOM,
  CYTON_MIN_ZOOM,
  addElementFromNode,
} from "@/utils/graph.js";
import { Spin } from "ant-design-vue";
import { findIndex, cloneDeep } from "lodash";
import { mapState, mapMutations } from "vuex";
import { getGraphFields } from "@/shared/api/graphsStructure.js";

export default {
  name: "SchemaGraph",
  props: [
    "graphId",
    "pathData",
    "target",
    "addVertices",
    "addEdges",
    "isModel",
    "isReset",
    "selectedNodes",
    "selectedEdges",
    "singleSelect",
    "schemaId",
  ],
  data() {
    return {
      canvasLoading: { loading: true, tip: "正在布局..." },
      rightMenuShow: false,
      stepSizeIndex: 0,
      graphObj: this.graphId === "model-graph-canvas" ? "$schema2" : "$schema1",
      layoutKey: "breadthfirst",
      layoutOptions: [
        {
          key: "环形弹簧内置布局",
          value: "cise",
        },
        {
          key: "广度优先布局",
          value: "breadthfirst",
        },
        {
          key: "网格布局",
          value: "grid",
        },
        {
          key: "有向无环图树布局",
          value: "dagre",
        },
        {
          key: "环形布局",
          value: "circle",
        },
        {
          key: "同心圆布局",
          value: "concentric",
        },
        {
          key: "复合弹簧内置布局",
          value: "cose",
        },
        {
          key: "约束布局",
          value: "cola",
        },
        {
          key: "随机布局",
          value: "random",
        },
      ],
    };
  },
  components: {
    ASpin: Spin,
  },
  watch: {
    isReset(newValue) {
      if (newValue) {
        this.$schema2.datas.clear();
        this.createGraph();
      }
    },
    pathData(newValue) {
      this.pathData = newValue;
      if (this.pathData.vertexMetas.length) {
        this.initGraph();
        this.createGraph();
      }
    },
  },
  async mounted() {
    if (this.pathData.vertexMetas.length) {
      if (this.graphSource === 0) {
        // kg
        await this.getGraphFields(this.graphId);
      } else {
        // 本地
        await this.getGraphFields(this.schemaId);
      }
      this.initGraph();
      this.createGraph();
    }
  },
  beforeDestroy() {
    this[`${this.graphObj}`].events.dispose();
    this.$evt = null;
    this[`${this.graphObj}`] = null;
    document.body.removeEventListener("keydown", this.handleKeyDown);
  },
  computed: {
    ...mapState("graphOptions", ["graphFields"]),
  },
  methods: {
    ...mapMutations("graphOptions", {
      setGraphFields: "setGraphFields",
    }),
    initGraph() {
      const schema = new KGraph({
        containerId: this.graphId,
        initData: [],
        layout: "breadthfirst",
        maxZoom: CYTON_MAX_ZOOM,
        minZoom: CYTON_MIN_ZOOM,
      });
      if (this.graphId === "model-graph-canvas") {
        Vue.prototype.$schema2 = schema;
        //绑定左键单击事件
        this.$schema2.events.on("click", this.onClick);
        //绑定右键点击事件
        this.$schema2.events.on("cxtClick", this.onCxtClick);
      } else {
        Vue.prototype.$schema1 = schema;
      }
      document.body.addEventListener("keydown", this.handleKeyDown);
    },
    createGraph() {
      const graphData = this.pathData;
      const resultEdges = graphData.edgeMetas;
      const resultVertices = graphData.vertexMetas;
      const elements = [...resultEdges, ...resultVertices];
      const data = {
        replace: false,
        elements,
        referenceNodes: [resultVertices],
        anchorNodeIds: [],
        type: "NEIGHBOR",
      };
      const { nodes, edges } = checkThreshold(
        data,
        this[`${this.graphObj}`],
        "1",
        this.graphFields,
        false,
        true
      );

      // 设置文本宽度，超过则换行
      this[`${this.graphObj}`].cy
        .style()
        .selector(".default-node")
        .css({
          color: "rgba(0, 0, 0, 0.85)",
          "text-opacity": 1,
          "text-wrap": "wrap",
          "text-max-width": "420",
          "text-overflow-wrap": "anywhere",
          label: "data(label)",
          "background-color": "#fff",
          "font-weight": 500,
          "border-color": "#ECF9FF",
          "border-width": "5px",
          "font-size": 32,
        })
        .selector(".default-node:selected")
        .css({
          color: "#1890ff",
        })
        .selector("edge")
        .css({
          color: "rgba(0, 0, 0, 0.85)",
          "text-opacity": 1,
          label: "data(label)",
          "text-wrap": "wrap",
          "text-max-width": "420",
          "text-overflow-wrap": "anywhere",
          "font-weight": 500,
          "font-size": 32,
          "control-point-step-size": this.isModel ? 200 : 120, // 普通边之间的距离
          "loop-direction": "0deg", // 单位为弧度rad/deg 默认是-90deg
          "loop-sweep": "90deg", // 单位为角度deg
        })
        .selector("edge:loop")
        .css({
          "control-point-step-size": 200, // 循环/自环边之间得距离
        })
        .selector("edge:selected")
        .css({
          color: "#1890ff",
        })
        .update();

      nodes.forEach((node) => {
        this[`${this.graphObj}`].datas.addNode(node);
      });
      edges.forEach((edge) => {
        this[`${this.graphObj}`].datas.addEdge(edge);
      });
      if (this.isModel && graphData.vertexMetas[0].x != 0) {
        // 如果是【一键复用】或者【规则选择模型】过来的，则会包含坐标信息，此时只需适应窗口就好
        this.handleFit();
      } else {
        this.changeLayout(this.layoutKey);
      }
      this.canvasLoading = { loading: false, tip: "布局完成" };
    },
    addEdge() {
      let targetNode = undefined;
      this.$schema2.datas.allNodes().map((node) => {
        if (node.id() === this.target) {
          targetNode = node;
        }
      });
      const elements = [...this.addEdges, ...this.addVertices];
      const data = {
        replace: false,
        elements,
        referenceNodes: [...this.addVertices],
        anchorNodeIds: [],
        type: "NEIGHBOR",
      };
      const res = checkThreshold(
        data,
        this.$schema2,
        "1",
        this.graphFields,
        false,
        true
      );
      addElementFromNode(targetNode, res, this.$schema2.cy, true);
      this.$emit("resetAddElements");
    },
    changeLayout(value) {
      if (!this.isModel) {
        const layout = this[`${this.graphObj}`].cy.layout({
          name: value,
          avoidOverlap: true, // 防止节点重叠，如果没有足够的空间可能会溢出
          maximal: true, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
          fit: true, // whether to fit the viewport to the graph
          directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
          circle: false, // put depths in concentric circles if true, put depths top down if false
          grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
          spacingFactor: 4, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
          nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
          depthSort: undefined, // a sorting function to order nodes at equal depth. e.g. function(a, b){ return a.data('weight') - b.data('weight') }
          transform: function (node, position) {
            return position;
          }, // transform a given node position. Useful for changing flow direction in discrete layouts
        });

        layout.run();
      } else {
        this[`${this.graphObj}`].events.changeLayout(value);
      }
      this.handleFit();
    },
    handleFit() {
      if (this.isModel) {
        if (this[`${this.graphObj}`].datas.allNodes().length <= 2) {
          const width = this.$refs.schemaGraph.offsetWidth;
          const height = this.$refs.schemaGraph.offsetHeight;
          let fit = undefined;
          if (height >= 600) {
            if (width >= 600) {
              fit = 200;
            } else if (400 <= width && width < 600) {
              fit = 150;
            } else if (350 <= width && width < 400) {
              fit = 100;
            } else {
              fit = width / 5 + 30;
            }
          } else if (400 <= height && height < 600) {
            if (width >= 350) {
              fit = 110;
            } else {
              fit = width / 5 + 30;
            }
          } else if (350 <= height && height < 400) {
            if (width >= 350) {
              fit = 80;
            } else {
              fit = width / 5 + 10;
            }
          } else {
            if (width >= 350) {
              fit = 70;
            } else {
              fit = width / 5;
            }
          }
          this[`${this.graphObj}`].cy.fit(fit);
        } else {
          this[`${this.graphObj}`].cy.fit(30);
        }
      } else {
        this[`${this.graphObj}`].cy.fit(30);
      }
    },
    handleKeyDown(e) {
      // 阻止事件冒泡，导致页面其他地方无法输入
      e.stopPropagation();
    },
    removeEles() {
      const currentSelectedNodes =
        this[`${this.graphObj}`].datas.filter("node:selected");
      const currentSelectedEdges =
        this[`${this.graphObj}`].datas.filter("edge:selected");
      currentSelectedEdges.map((item) => {
        this[`${this.graphObj}`].cy.remove(item);
      });
      currentSelectedNodes.map((item) => {
        this[`${this.graphObj}`].cy.remove(item);
      });
    },
    onClick(evt) {
      const flag = evt.originalEvent.ctrlKey; // 判断是否按了ctrl键
      const target = evt.target;
      if (!target.length) {
        // 在画布上点击了鼠标左键键
        this.$emit("selectedElesChanged", [], []);
      } else if (flag && !this.singleSelect) {
        // 按了ctrl键，并且不是单选情况
        let selectedNodes = cloneDeep(this.selectedNodes);
        let selectedEdges = cloneDeep(this.selectedEdges);
        setTimeout(() => {
          if (target.isEdge()) {
            const index = findIndex(
              selectedEdges,
              (o) => o.id === target.data().id
            );
            if (index === -1) {
              selectedEdges = [...selectedEdges, target.data()];
            } else {
              selectedEdges.splice(index, 1);
            }
            this.$emit("selectedElesChanged", selectedNodes, selectedEdges);
          } else {
            const index = findIndex(
              selectedNodes,
              (o) => o.id === target.data().id
            );
            if (index === -1) {
              selectedNodes = [...selectedNodes, target.data()];
            } else {
              selectedNodes.splice(index, 1);
            }
            this.$emit("selectedElesChanged", selectedNodes, selectedEdges);
          }
        }, 50);
      } else {
        // 单选情况
        const currentSelectedNodes =
          this[`${this.graphObj}`].datas.filter("node:selected");
        const currentSelectedEdges =
          this[`${this.graphObj}`].datas.filter("edge:selected");
        currentSelectedNodes.deselect();
        currentSelectedEdges.deselect();
        if (target.isEdge()) {
          this.$emit("selectedElesChanged", [], [target.data()]);
        } else {
          this.$emit("selectedElesChanged", [target.data()], []);
        }
      }
    },
    onCxtClick(evt) {
      const target = evt.target;
      const currentSelectedNodes =
        this[`${this.graphObj}`].datas.filter("node:selected");
      const currentSelectedEdges =
        this[`${this.graphObj}`].datas.filter("edge:selected");
      currentSelectedNodes.deselect();
      currentSelectedEdges.deselect();
      if (target.data().$$type === "defaultEdge") {
        target.select();
        this.$emit("selectedElesChanged", [], [target.data()]);
      } else if (target.data().$$type === "defaultNode") {
        target.select();
        this.$emit("selectedElesChanged", [target.data()], []);
      } else {
        // 在画布上点击了鼠标右键,而不是在节点上点击右键
        this.$emit("selectedElesChanged", [], []);
      }
    },
    async getGraphFields(schemaId) {
      const res = await getGraphFields(schemaId);
      if (res.message === "成功" && res.data) {
        this.setGraphFields(res.data);
      } else if (res.message === "成功" && !res.data) {
        this.setGraphFields({});
      } else {
        this.setGraphFields({});
        this.$message.error(res.message);
      }
    },
  },
};
</script>
<style lang="less">
.schema-graph {
  width: 100%;
  height: 100%;
  padding-top: 30px;
  position: relative;

  &-loading {
    left: 50%;
    top: 50%;
    z-index: 1041;
    position: absolute;
    transform: translate(-50%, -50%);
  }

  &-canvas {
    width: 100%;
    height: 100%;
    background: #f8fbff;
  }

  .adapt-screen,
  .layout {
    position: absolute;
    display: flex;
    align-items: center;
    cursor: pointer;
    justify-content: flex-end;

    &-label,
    &-title {
      color: #9da9c2;
      user-select: none;
    }

    &-label {
      padding-left: 6px;
    }
  }

  .adapt-screen {
    top: 1px;
    right: 12px;
  }

  .layout {
    width: calc(100% - 40px);
    top: 0px;
    right: 40px;

    &-select {
      width: calc(100% - 66px);
      max-width: 220px;
      color: #c5c8ce;
      margin-left: 5px;

      .ant-select-selection {
        height: 25px;

        .ant-select-selection__rendered {
          line-height: 23px;

          .ant-select-selection-selected-value {
            height: 23px;
          }
        }
      }
    }
  }
}
</style>
