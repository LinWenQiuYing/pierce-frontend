<template>
  <div class="graph-context-menu">
    <right-menu
      :show="rightMenuShow"
      @onMenuClick="onMenuClick"
      :contextMenuData="contextMenuData"
    />
    <a-modal
      class="add-relation-entity-modal"
      :width="500"
      :visible="addRelationEntityShow"
      :closable="false"
      :mask="false"
      :destroyOnClose="true"
      @cancel="onCancel"
    >
      <template slot="footer">
        <a-button key="cancel" @click="onCancel">取消</a-button>
        <a-button
          key="submit"
          type="primary"
          @click="onConfirm"
          :disabled="!relationNode.length && !relationEdge.length"
        >
          确认
        </a-button>
      </template>
      <div class="item-title">
        <span class="title-text">节点类型</span>
        <div class="select-text-part">
          <span class="select-text" @click="handleSelectAll(true, 'node')">
            全选
          </span>
          <span class="select-text" @click="handleSelectAll(false, 'node')">
            重置
          </span>
        </div>
      </div>
      <div class="modal-list">
        <div
          v-for="item in searchNodeAll"
          :key="item"
          :class="
            checkIsActive('node', item) ? 'list-option active' : 'list-option'
          "
          @click="handleSelectOption(item, 'node', checkIsActive('node', item))"
        >
          {{ item }}
        </div>
      </div>
      <div class="item-title">
        <span class="title-text">关系类型</span>
        <div class="select-text-part">
          <span class="select-text" @click="handleSelectAll(true, 'edge')">
            全选
          </span>
          <span class="select-text" @click="handleSelectAll(false, 'edge')">
            重置
          </span>
        </div>
      </div>
      <div class="modal-list">
        <div
          v-for="item in searchEdgeAll"
          :key="item"
          :class="
            checkIsActive('edge', item) ? 'list-option active' : 'list-option'
          "
          @click="handleSelectOption(item, 'edge', checkIsActive('edge', item))"
        >
          {{ item }}
        </div>
      </div>
      <div class="item-title">
        <span class="title-text">方向</span>
      </div>
      <div class="modal-list">
        <a-radio-group @change="handleSelectDirection" :value="directionValue">
          <a-radio value="both">双向</a-radio>
          <a-radio value="out">出向</a-radio>
          <a-radio value="in">入向</a-radio>
        </a-radio-group>
      </div>
      <div class="item-title">
        <span class="title-text">跳数</span>
      </div>
      <div class="modal-list">
        <a-radio-group @change="handleSelectLayer" :value="layerValue">
          <a-radio :value="1">1</a-radio>
          <a-radio :value="2">2</a-radio>
          <a-radio :value="3">3</a-radio>
        </a-radio-group>
      </div>
    </a-modal>
  </div>
</template>
<script>
import Vue from "vue";
import EXPAND_ICON from "@/assets/mark/expand.png";
import CLOSE_ICON from "@/assets/mark/close.png";
import RightMenu from "@/components/rightMenu";
import { checkThreshold, MENU_KEY, addElementFromNode } from "@/utils/graph.js";
import { getNeighbors, handleDirectedAnalysis } from "@/shared/api/graph.js";
import { Button, Radio } from "ant-design-vue";
import { difference, union } from "lodash";
import { mapState } from "vuex";

const { Group } = Radio;

export default {
  name: "GraphContextMenu",
  props: ["graph", "graphNodes", "searchNodeAll", "searchEdgeAll"],
  data() {
    return {
      contextMenuData: {},
      rightMenuShow: false,
      evt: "",
      addRelationEntityShow: false,
      // searchNodeAll: [],
      // searchEdgeAll: [],
      relationNode: [],
      relationEdge: [],
      directionValue: "both",
      layerValue: 1,
    };
  },
  computed: {
    ...mapState("graphOptions", ["graphId", "graphFields"]),
    ...mapState("rightsOptions", ["userRights", "collapsed"]),
  },
  mounted() {
    if (this.$graph) {
      //绑定左键单击事件
      this.$graph.events.on("click", this.onClick);
      //绑定右键点击事件
      this.$graph.events.on("cxtClick", this.onCxtClick);
    }

    // 监听delete删除元素 && 同时防止输入事件冒泡--kgraph组件会监听键盘输入事件，在这里组织冒泡，kgraph就监听不到了
    document.body.addEventListener("keydown", this.handleKeyDown);
  },
  components: {
    AButton: Button,
    ARadio: Radio,
    ARadioGroup: Group,
    RightMenu,
  },
  beforeDestroy() {
    document.body.removeEventListener("keydown", this.handleKeyDown);
    this.$evt = null;
  },
  methods: {
    onClick(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      Vue.prototype.$evt = evt;
      const target = evt.target;
      this.$emit("isCxtClickChanged", false);
      this.handleCloseRightMenu(true);
      if (!target.length) {
        // 在画布上点击了鼠标左键键
        this.$emit("selectedElesChanged", [], []);
        return;
      }
      if (target.isNode()) {
        const clickPosition = evt.position;
        const centerPosition = target.position();
        let subClick = false;
        if (clickPosition && centerPosition) {
          if (target.data().height === 240) {
            subClick =
              Math.abs(clickPosition.x - centerPosition.x) < 25 &&
              Math.abs(clickPosition.y - centerPosition.y - 95) < 25;
          } else {
            subClick =
              Math.abs(clickPosition.x - centerPosition.x) < 16 &&
              Math.abs(clickPosition.y - centerPosition.y - 59) < 16;
          }
        }
        if (subClick) {
          evt.preventDefault();
          const rootId = target.id();
          const json = {
            branchId: this.graphId,
            commonOnly: false,
            direction: "both",
            edgesFieldsLimitMap: {},
            layers: 1,
            nodeTypes: [],
            types: "findNeighbor",
            vertexIDs: [rootId],
          };
          target.data("backgroundImage")[1] === CLOSE_ICON
            ? this.removeNodes([target], this.$graph, this.graphNodes, false)
            : this.fetchNeighbors(this.$graph, target, this.graphNodes, json);
        } else {
          // const currentSelectedNodes =
          //   this.$graph.datas.filter("node:selected");
          // const nodesData = currentSelectedNodes.map((node) => node.data());
          this.$emit("selectedElesChanged", [target.data()], []);
        }
      }
      if (target.isEdge()) {
        this.$emit("selectedElesChanged", [], [target.data()]);
      }
    },
    onCxtClick(evt) {
      evt.originalEvent.cancelBubble = true;
      evt.stopPropagation();
      evt.preventDefault();
      evt.stopImmediatePropagation();
      Vue.prototype.$evt = evt;
      const target = evt.target;
      let currentSelectedNodes = this.$graph.datas.filter("node:selected");
      let currentSelectedEdges = this.$graph.datas.filter("edge:selected");
      this.$emit("isCxtClickChanged", true);
      if (
        target.data().$$type === "defaultEdge" ||
        target.data().$$type === "comb"
      ) {
        currentSelectedNodes.deselect();
        currentSelectedEdges.deselect();
        target.select();
        this.handleCloseRightMenu(true); // 关闭右键菜单
        this.$emit("selectedElesChanged", [], [target.data()]);
        return false;
      } else if (target.data().$$type === "defaultNode") {
        currentSelectedEdges.deselect();
        this.$emit("selectedElesChanged", [target.data()], []);
      } else {
        // 在画布上点击了鼠标右键,而不是在节点上点击右键
        currentSelectedNodes.deselect(); // 取消选择方法
        currentSelectedEdges.deselect();
        currentSelectedNodes = this.$graph.datas.filter("node:selected");
        currentSelectedEdges = this.$graph.datas.filter("edge:selected");
        this.$emit("selectedElesChanged", [], []);
      }
      const nContextMenuData = this.userRights.btn_addRelationEntity
        ? [
            // 只有一个节点时的右击菜单
            {
              title: "添加关联实体",
              key: MENU_KEY.RELATION_ENTITY,
              show: true,
            },
            {
              title: "移除",
              key: MENU_KEY.REMOVE_NODE,
              show: true,
            },
          ]
        : [
            // 只有一个节点时的右击菜单
            {
              title: "移除",
              key: MENU_KEY.REMOVE_NODE,
              show: true,
            },
          ];

      const mContextMenuData = this.userRights.btn_directedAnalysis
        ? [
            // 有多个节点时的右击菜单
            {
              title: "定向分析",
              key: MENU_KEY.DIRECTED_ANALYSIS,
              show: true,
            },
            {
              title: "移除",
              key: MENU_KEY.REMOVE_NODES,
              show: true,
            },
          ]
        : [
            // 有多个节点时的右击菜单
            {
              title: "移除",
              key: MENU_KEY.REMOVE_NODES,
              show: true,
            },
          ];

      const pContextMenuData = [
        // 没有节点时的右击菜单
        {
          title: "清除",
          key: MENU_KEY.CLEAR_ALL_Ele,
          show: true,
        },
      ];
      const menuData = {
        position: {
          x: evt.renderedPosition.x,
          y: evt.renderedPosition.y + 64,
        },
        context: !currentSelectedNodes.length
          ? pContextMenuData
          : currentSelectedNodes.length > 1
          ? mContextMenuData
          : nContextMenuData,
      };
      this.contextMenuData = menuData;
      this.handleCloseRightMenu(false);
    },
    handleKeyDown(e) {
      // kgraph组件会监听键盘输入事件，在这里组织冒泡，kgraph就监听不到了
      e.stopPropagation();
      if (this.$route.name !== "affairGraphAnalysis") return;
      // 因为这里会全局监听，故在此加个路由的限制，只允许在图谱详情页生效
      if (this.$route.name !== "affairGraphAnalysis") return;
      const currentSelectedNodes = this.$graph.datas.filter("node:selected");
      if (e.keyCode === 46 && this.$graph && currentSelectedNodes.length) {
        e.preventDefault();
        this.removeNodes(
          currentSelectedNodes,
          this.$graph,
          this.graphNodes,
          true
        );
      }
      if (e.key === "a" && e.ctrlKey) {
        e.stopPropagation();
        e.preventDefault();
        this.$graph.events.cy.batch(() => {
          this.$graph.events.cy.elements().select();
        });
      }
      if (e.key === "z" && e.ctrlKey) {
        e.stopPropagation();
        e.preventDefault();
        this.$graph.events.history.undo();
      }
      if (e.key === "y" && e.ctrlKey) {
        e.stopPropagation();
        e.preventDefault();
        this.$graph.events.history.redo();
      }
    },
    removeNodes(nodes, graph, graphNodes, type) {
      // type:是否删除当前节点
      let graphNodeData = graph.datas.allNodes(); // 不包含社群节点
      let graphCombs = graph.datas.filter(".default-comb"); // 社群节点
      const cloneEdges = []; // 保存因为社群节点删除而删除的实体节点的相邻边
      const cloneEles = []; // 保存因社群节点删除而删除的实体节点
      const deleteArr = []; // 保存需要删除的社群节点和实体节点
      const deleteArrData = []; // 保存需要删除的实体节点的节点信息，用于更新graphNodes
      let deleteNodeParent = []; // 保存需要删除的实体节点，用于遍历删除其子节点

      graph.events.history.pushSnapshot(graph.cy.json());
      nodes.map((node) => {
        // 选中的、待删除的节点
        if (node.data().nodeType === "社群") {
          // 将社群节点push进删除数组中
          deleteArr.push(node);
          graphNodeData.map((gNode) => {
            const eleJson = gNode.json();
            if (
              eleJson.data.parent === node.id() &&
              deleteArr.indexOf(gNode) === -1
            ) {
              eleJson.data.parent = null;
              gNode.connectedEdges().map((edge) => {
                const edgeJson = edge.json();
                if (cloneEdges.indexOf(edgeJson) === -1) {
                  cloneEdges.push(edgeJson);
                }
              });
              cloneEles.push(eleJson);
            }
          });

          // 更新社群节点信息，用于图谱信息-社群信息展示
          let index = undefined;
          const backgroundColor = node.data().backgroundColor;
          for (let i = 0; i < graphCombs.length; i++) {
            const comb = graphCombs[i];
            if (backgroundColor === comb.data().backgroundColor) {
              index = comb.data().data.colorArr.indexOf(backgroundColor);
              break;
            }
          }
          graphCombs.map((comb) => {
            comb.data().data.colorArr.splice(index, 1);
            comb.data().data.resultIdArr.splice(index, 1);
          });
        } else {
          if (type) {
            deleteNodeParent.push(node.data());
          } else {
            const data = nodes[0].data();
            data.backgroundImage[1] = EXPAND_ICON;
            graph.datas.changeData(nodes[0], data);
          }
          deleteNodeParent = this.getAllNodeParent(
            node.data(),
            deleteNodeParent
          );
          deleteNodeParent.map((dNode) => {
            graphNodeData.map((item) => {
              if (item.id() === dNode.id && deleteArr.indexOf(item) === -1) {
                deleteArr.push(item);
                deleteArrData.push(dNode);
              }
            });
          });
        }
      });
      deleteArr.map((item) => {
        graph.cy.remove(item);
      });
      cloneEles.map((ele) => {
        graph.cy.add(ele);
      });
      cloneEdges.map((edge) => {
        graph.cy.add(edge);
      });
      graphNodeData = graph.datas.allNodes(); // 更新节点信息
      let emptyCombNum = 0;
      graphCombs.map((comb) => {
        // 检查并删除是否有空的社群节点
        let flag = false; // 该社群节点下是否还有子节点，默认没有
        for (let i = 0; i < graphNodeData.length; i++) {
          const eleJson = graphNodeData[i].json();
          if (eleJson.data.parent === comb.id()) {
            flag = true;
            break;
          }
        }
        if (!flag) {
          emptyCombNum += 1;
          graph.cy.remove(comb);
        }
      });
      graphCombs = graph.datas.filter(".default-comb");
      if (!graphCombs.length) {
        this.$emit("selectedElesChanged", [], []);
      }
      graph.events.history.pushSnapshot(graph.cy.json());
      this.$message.success(
        `已移除${deleteArr.length - cloneEles.length + emptyCombNum}个节点`
      );
      // const restNodeArr = difference(graphNodes, deleteArrData);
      // this.$emit("graphNodesChanged", restNodeArr);
    },
    getAllNodeParent(target, arr) {
      const _that = this;
      this.graphNodes.map((node) => {
        if (
          node.parent.id === target.id &&
          arr.indexOf(node) === -1 &&
          node.parent.id !== node.id
        ) {
          arr.push(node);
          arr = _that.getAllNodeParent(node, arr);
        }
      });
      return arr;
    },
    onMenuClick(key) {
      const target = this.$evt.target;
      const datas = this.$graph.datas;
      this.handleCloseRightMenu(true);
      switch (key.key) {
        case MENU_KEY.RELATION_ENTITY:
          this.addRelationEntityShow = true;
          break;
        case MENU_KEY.REMOVE_RELATION_ENTITY:
          this.removeNodes([target], this.$graph, this.graphNodes, false);
          break;
        case MENU_KEY.REMOVE_NODE:
          this.removeNodes(target, this.$graph, this.graphNodes, true);
          break;
        case MENU_KEY.REMOVE_NODES:
          this.removeNodes(
            this.$graph.datas.filter("node:selected"),
            this.$graph,
            this.graphNodes,
            true
          );
          break;
        case MENU_KEY.CLEAR_ALL_Ele:
          datas.clear();
          break;
        case MENU_KEY.DIRECTED_ANALYSIS:
          this.directedAnalysis(this.$graph, target, this.graphNodes);
          break;
        default:
          break;
      }
    },
    async fetchNeighbors(currentGraph, target, currentGraphNode, json) {
      this.$emit("canvasLoadingChanged", { loading: true, tip: "正在布局..." });
      const neighborsData = await getNeighbors(json);
      if (
        neighborsData &&
        neighborsData.paths &&
        neighborsData.paths.length > 0
      ) {
        let parentData = {};
        currentGraphNode.map((cNode) => {
          if (cNode.id === target.id()) {
            parentData = cNode;
          }
        });
        neighborsData.paths.map((path) => {
          path.vertices.map((item) => {
            return (item.parent = parentData);
          });
        });
        let edges = [];
        let vertices = [];
        neighborsData.paths.map((path) => {
          edges = [...edges, ...path.edges];
          vertices = [...vertices, ...path.vertices];
        });

        let elements = [...edges, ...vertices];
        const data = {
          replace: false,
          elements,
          referenceNodes: [...vertices],
          anchorNodeIds: json.vertexIDs,
          type: "NEIGHBOR",
        };

        const res = checkThreshold(data, currentGraph, "1", this.graphFields);
        const { nodes } = res;
        addElementFromNode(target, res, currentGraph.cy);
        const nodeData = target.data();
        nodeData.backgroundImage[1] = CLOSE_ICON;
        this.$graph.datas.changeData(target, nodeData);
        const addNodeArr = nodes.map((node) => node.data);
        const resultArr = union(this.graphNodes, [
          ...currentGraphNode,
          ...addNodeArr,
        ]);
        this.$emit("graphNodesChanged", resultArr);
      } else {
        this.$message.info("无关联实体");
      }
      this.$emit("canvasLoadingChanged", { loading: false, tip: "布局完成" });
    },
    async directedAnalysis(graph, target, currentGraphNode) {
      let currentSelectedNodes = graph.datas.filter("node:selected");
      const directedIdsArr = [];
      currentSelectedNodes.map((item) => {
        directedIdsArr.push(item.id());
      });
      // if (directedIdsArr.length > 2) {
      //   this.$message.info("请只选择两个节点进行定向分析");
      //   currentSelectedNodes.deselect(); // 取消选择方法
      //   currentSelectedNodes = [];
      //   return false;
      // }
      this.$emit("canvasLoadingChanged", { loading: true, tip: "加载中..." });
      const json = {
        branchId: this.graphId,
        maxStep: 3,
        minStep: 1,
        limit: 10,
        types: "directedAnalysis",
        vertexIds: directedIdsArr,
      };
      const neighborsData = await handleDirectedAnalysis(json);
      if (
        neighborsData &&
        neighborsData.paths &&
        neighborsData.paths.length > 0
      ) {
        const resultEdges = [];
        const resultVertices = [];
        neighborsData.paths.map((path) => {
          path.edges.map((edge) => {
            resultEdges.push(edge);
          });
          path.vertices.map((vertex) => {
            resultVertices.push(vertex);
          });
        });
        const elements = [
          ...resultEdges,
          ...resultVertices,
          ...neighborsData.vertices,
        ];
        const data = {
          replace: false,
          elements,
          referenceNodes: [resultVertices, ...neighborsData.vertices],
          anchorNodeIds: json.vertexIds,
          type: "NEIGHBOR",
        };
        const res = checkThreshold(data, graph, "1", this.graphFields, true);
        const { nodes, edges } = res;
        // 定向分析的结果节点与边默认选中
        nodes.map((node) => {
          node.selected = true;
        });
        edges.map((edge) => {
          edge.selected = true;
        });
        this.$message.info(`实体间找到了${neighborsData.paths.length}条路径`);
        addElementFromNode(target, res, graph.cy);
        const addNodeArr = nodes.map((node) => node.data);
        const resultArr = union(this.graphNodes, [
          ...currentGraphNode,
          ...addNodeArr,
        ]);
        this.$emit("graphNodesChanged", resultArr);
      } else {
        this.$message.info("实体间未找到符合要求的路径");
      }
      this.$emit("canvasLoadingChanged", { loading: false, tip: "加载完成" });
    },
    onCancel() {
      this.addRelationEntityShow = false;
    },
    async onConfirm() {
      const target = this.$evt.target;
      this.addRelationEntityShow = false;
      const rootId = target.id();
      const edgeLimitMap = {};
      this.relationEdge.map((item) => {
        edgeLimitMap[item] = [];
      });
      const json = {
        branchId: this.graphId,
        commonOnly: false,
        direction: this.directionValue,
        edgesFieldsLimitMap: edgeLimitMap,
        layers: this.layerValue,
        nodeTypes: this.relationNode,
        types: "findNeighbor",
        vertexIDs: [rootId],
      };
      this.fetchNeighbors(this.$graph, target, this.graphNodes, json);
    },
    handleSelectLayer(e) {
      this.layerValue = e.target.value;
    },
    handleSelectDirection(e) {
      this.directionValue = e.target.value;
    },
    handleSelectOption(content, type, active) {
      if (active) {
        // 取消选中，并把选项从已选择列表移除
        if (type === "node") {
          const nodeArr = this.relationNode.filter((item) => {
            if (item !== content) {
              return item;
            }
          });
          this.relationNode = nodeArr;
        } else {
          const edgeArr = this.relationEdge.filter((item) => {
            if (item !== content) {
              return item;
            }
          });
          this.relationEdge = edgeArr;
        }
      } else {
        // 选中，并把选项加入已选择列表
        if (type === "node") {
          const nodeArr = [...this.relationNode, content];
          this.relationNode = nodeArr;
        } else {
          const edgeArr = [...this.relationEdge, content];
          this.relationEdge = edgeArr;
        }
      }
    },
    handleSelectAll(flag, type) {
      if (flag) {
        if (type === "node") {
          this.relationNode = this.searchNodeAll;
        } else {
          this.relationEdge = this.searchEdgeAll;
        }
      } else {
        if (type === "node") {
          this.relationNode = [];
        } else {
          this.relationEdge = [];
        }
      }
    },
    checkIsActive(type, content) {
      let checkArr = [];
      if (type === "node") {
        checkArr = this.relationNode.filter((item) => {
          if (content === item) {
            return item;
          }
        });
      } else {
        checkArr = this.relationEdge.filter((item) => {
          if (content === item) {
            return item;
          }
        });
      }
      if (checkArr.length) {
        return true;
      } else {
        return false;
      }
    },
    handleCloseRightMenu(flag) {
      this.rightMenuShow = !flag;
    },
  },
};
</script>
<style lang="less">
.add-relation-entity-modal {
  .ant-modal {
    margin: 0;
    top: auto;
    bottom: 0;
    padding: 0;
    left: 160px;
    position: absolute;
  }

  .ant-modal-body {
    font-size: 12px;

    .item-title {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      .title-text {
        font-weight: 700;
      }

      .select-text-part {
        .select-text {
          color: #549be7;
        }

        .select-text:first-child {
          margin-right: 5px;
        }
      }
    }

    .modal-list {
      margin-bottom: 25px;

      .list-option {
        display: inline-block;
        padding: 0 5px;
        margin-right: 5px;
        margin-bottom: 5px;
        border: 1px solid rgba(84, 155, 231, 0.2);
      }

      .list-option.active {
        color: #549be7;
        background-color: rgba(84, 155, 231, 0.2);
      }
    }
  }
}
</style>
