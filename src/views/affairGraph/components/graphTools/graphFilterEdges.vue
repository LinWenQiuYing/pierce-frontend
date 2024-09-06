<template>
  <a-modal
    class="graph-filter-modal"
    :width="560"
    :visible="showSiftEdge"
    :closable="true"
    :mask="false"
    :destroyOnClose="true"
    @cancel="onCancel"
    title="子图选择"
  >
    <template slot="footer">
      <a-button type="dashed" @click="onCancel">取消</a-button>
      <a-button @click="onReset">重置</a-button>
      <a-button
        @click="fetchNeighbors('new')"
        type="primary"
        :disabled="!relationEdge.length && !relationNode.length"
      >
        确认
      </a-button>
    </template>
    <div class="graph-filter-content">
      <single-multiple-select
        title="节点"
        :value="relationNode"
        className="node-types"
        :options="searchNodeAll"
        @onChange="onNodeChange"
      />
      <single-multiple-select
        title="关系"
        :value="relationEdge"
        className="edge-types"
        :options="searchEdgeAll"
        @onChange="onEdgeChange"
      />
    </div>
  </a-modal>
</template>
<script>
import SingleMultipleSelect from "./singleMultipleSelect";
import { Button } from "ant-design-vue";
import { mapState } from "vuex";

export default {
  name: "GraphFilterEdges",
  props: ["showSiftEdge", "searchNodeAll", "searchEdgeAll", "graphNodes"],
  data() {
    return {
      relationNode: [],
      relationEdge: [],
    };
  },
  components: {
    AButton: Button,
    SingleMultipleSelect,
  },
  computed: {
    ...mapState("graphOptions", ["firstNode"]),
  },
  methods: {
    onCancel() {
      this.$emit("isShowSiftEdgeChanged", false);
    },
    onReset() {
      this.relationNode = [];
      this.relationEdge = [];
      this.fetchNeighbors("reset");
    },
    onNodeChange(value) {
      this.relationNode = value;
    },
    onEdgeChange(value) {
      this.relationEdge = value;
    },
    fetchNeighbors(type) {
      this.$emit("canvasLoadingChanged", { loading: true, tip: "正在布局..." });
      this.$emit("isShowSiftEdgeChanged", false);
      if (type === "reset") {
        this.$emit("isHappenSiftEdgeChanged", false);
      } else {
        this.$emit("isHappenSiftEdgeChanged", true);
      }
      const _graph = this.$graph;
      const _firstNode = this.firstNode;
      if (_graph && _firstNode) {
        const relationNodeArr =
          type === "reset"
            ? this.searchNodeAll
            : this.relationNode.length
            ? this.relationNode
            : this.searchNodeAll;
        const relationEdgeArr =
          type === "reset"
            ? this.searchEdgeAll
            : this.relationEdge.length
            ? this.relationEdge
            : this.searchEdgeAll;
        _graph.datas.allElements().map((ele) => {
          const data = ele.data();
          data.opacity = 0.2;
          _graph.datas.changeData(ele, data);
        });

        let target = undefined;
        const nodeArr = _graph.datas.allNodes().filter((item) => {
          // nodeArr表示符合实体属性要求的节点
          if (item.data().id === _firstNode.id) {
            target = item;
            _graph.datas.changeData(item, this.changeOpacity(item));
          }
          if (relationNodeArr.indexOf(item.data().nodeType) > -1) {
            return item;
          }
        });
        const targetNodes = []; // 存放nodeArr中满足关系属性的点
        nodeArr.map((node) => {
          node.connectedEdges().map((edge) => {
            if (
              relationEdgeArr.indexOf(edge.data().nodeType) > -1 &&
              targetNodes.indexOf(node) === -1
            ) {
              edge.connectedNodes().map((nodeObj) => {
                if (relationNodeArr.indexOf(nodeObj.data().nodeType) > -1) {
                  targetNodes.push(nodeObj);
                }
              });
            }
          });
        });
        const restNodeArr = []; // restNodeArr表示nodeArr中满足关系属性的且不在targetNodes中的点
        // targetNodes.map((node) => {
        //   node.connectedEdges().map((edge: any) => {
        //     if (relationEdgeArr.indexOf(edge.data().nodeType) > -1) {
        //       edge.connectedNodes().map((nodeObj: any) => {
        //         if (
        //           targetNodes.indexOf(nodeObj) === -1 &&
        //           restNodeArr.indexOf(nodeObj) === -1
        //         ) {
        //           restNodeArr.push(nodeObj);
        //         }
        //       });
        //     }
        //   });
        // });
        const currentNodeArr = [...targetNodes, ...restNodeArr];
        if (currentNodeArr.length !== 0) {
          this.showWholeGraph(currentNodeArr, _graph, target);
        }
      }
      this.$emit("canvasLoadingChanged", { loading: false, tip: "布局完成" });
    },
    changeOpacity(ele) {
      const data = ele.data();
      data.opacity = 1;
      return data;
    },
    showWholeGraph(currentNodeArr, graph, target) {
      const parentNodes = [];
      currentNodeArr.map((currentNode) => {
        graph.datas.changeData(currentNode, this.changeOpacity(currentNode));
        if (currentNode.id() !== target.id()) {
          // 对集合中的元素执行A*搜索算法。这将查找从根节点到目标节点的最短路径。
          const aStar = graph.cy.elements().aStar({
            root: target,
            goal: currentNode,
          });
          if (aStar.found) {
            aStar.path.map((ele, index) => {
              if (index % 2 === 0) {
                // 点
                if (parentNodes.indexOf(ele) === -1) {
                  parentNodes.push(ele);
                  graph.datas.changeData(ele, this.changeOpacity(ele));
                }
              }
            });
          }
        }
      });
      const currentNodeIds = [...currentNodeArr, ...parentNodes];
      const currentNodeIdArr = currentNodeIds.map((node) => node.data().id);
      parentNodes.map((pNode) => {
        pNode.connectedEdges().map((edgeObj) => {
          if (
            currentNodeIdArr.indexOf(edgeObj.data().source) > -1 &&
            currentNodeIdArr.indexOf(edgeObj.data().target) > -1
          ) {
            graph.datas.changeData(edgeObj, this.changeOpacity(edgeObj));
          }
        });
      });
    },
  },
};
</script>
<style lang="less">
.graph-filter-modal {
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
      padding: 0;
      overflow: auto;
      height: calc(100% - 107px);
      border-bottom: 1px solid #e0e0e0;

      .graph-filter-content {
        height: 100%;
        overflow: auto;
        padding: 16px 24px;

        .node-types,
        .edge-types {
          .content {
            .ant-checkbox-group {
              display: flex;
              flex-wrap: wrap;

              .ant-checkbox-wrapper {
                display: flex;
                width: 150px;

                .ant-checkbox {
                  height: 16px;
                  margin-top: 3px;
                }
              }
            }
          }
        }
      }
    }

    .ant-modal-footer {
      background: #fff;
      border: none;

      .ant-btn {
        border-radius: 0;

        &:not(:last-child) {
          margin-right: 20px;
        }
      }
    }
  }
}
</style>
