<template>
  <div>
    <div class="show-graph-header">
      <span class="header-left">{{ eName }}</span>
      <div class="header-right">
        <a-button
          class="header-right-btn"
          @click="shipFullscreen"
          icon="fullscreen"
        >
          全屏
        </a-button>
        <a-button class="header-right-btn" icon="cloud-download">
          保存
        </a-button>
      </div>
    </div>
    <div ref="graph" class="content-graph" :id="`${title}-graph`"></div>
    <a-modal
      class="graph-fullscreen-modal"
      width="100%"
      :visible="showfullscreen"
      :closable="true"
      :destroyOnClose="true"
      @cancel="onCancel"
      :mask="true"
      :centered="true"
      :title="eName"
      :footer="null"
    >
      <div
        ref="fullscreen"
        class="fullscreen-graph"
        :id="`${title}-fullscreen`"
      ></div>
      <a-button @click="onRefresh" class="refresh-btn">
        <a-icon type="sync" :spin="loading" /> 刷新
      </a-button>
    </a-modal>
  </div>
</template>

<script>
import { Button } from "ant-design-vue";

export default {
  name: "EntityGraph",
  props: ["eName", "graphData", "title"],
  data() {
    return {
      showfullscreen: false,
      loading: false,
      myChart: "",
    };
  },
  components: {
    AButton: Button,
  },
  mounted() {
    setTimeout(() => {
      this.initGraph("init");
    }, 0);
    const f = () => {
      this.myChart.resize();
    };
    window.addEventListener("resize", f);
  },
  beforeDestroy() {
    this.myChart.clear();
    const f = () => {
      this.myChart.resize();
    };
    window.removeEventListener("resize", f);
  },
  watch: {
    graphData(newData, oldData) {
      this.graphData = newData;
      this.initGraph("init");
    },
  },
  methods: {
    initGraph(type) {
      if (type === "init") {
        if (
          !this.$refs.graph ||
          (!this.graphData.edgeData.length && !this.graphData.nodeData.length)
        )
          return;
        this.myChart = this.$echarts.init(
          document.getElementById(`${this.title}-graph`)
        );
      } else {
        if (
          !this.$refs.fullscreen ||
          (!this.graphData.edgeData.length && !this.graphData.nodeData.length)
        )
          return;
        this.myChart = this.$echarts.init(
          document.getElementById(`${this.title}-fullscreen`)
        );
      }
      const option = {
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove",
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: "quinticInOut",
        series: [
          {
            type: "graph",
            layout: "",
            roam: true,
            label: {
              show: true,
              width: 60,
              color: "#fff",
              fontSize: 13,
              overflow: "break",
              formatter: function (params) {
                if (params.data.name.length > 12) {
                  return params.data.name.slice(0, 11) + "...";
                } else {
                  return params.data.name;
                }
              },
            },
            edgeSymbol: ["none", "arrow"],
            edgeSymbolSize: [0, 10],
            edgeLabel: {
              fontSize: 12,
              show: true,
              color: "#82A7C4",
              verticalAlign: "middle",
              backgroundColor: "#fff",
              formatter: function (params) {
                if (params.data.label.value) {
                  return params.data.label.value;
                } else {
                  return null;
                }
              },
            },
            // 如果节点有分类的话可以通过data[i].category指定每个节点的类目,类目的样式会被应用到节点样式上,图例也可以基于categories名字展现和筛选。
            categories: [
              {
                name: "enterprise",
                itemStyle: {
                  color: {
                    type: "linear",
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: "rgba(176, 217, 234, 1)", // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: "rgba(69, 129, 234, 1)", // 100% 处的颜色
                      },
                    ],
                    global: false, // 缺省为 false
                  },
                },
                symbolSize: 75,
              },
              {
                name: "person",
                itemStyle: {
                  color: {
                    type: "linear",
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: "rgba(251, 216, 221, 1)", // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: "rgba(247, 28, 64, 1)", // 100% 处的颜色
                      },
                    ],
                    global: false, // 缺省为 false
                  },
                },
                symbolSize: 60,
              },
            ],
            lineStyle: {
              opacity: 1,
              width: 1,
              curveness: 0,
            },
            data: this.graphData.nodeData,
            links: this.graphData.edgeData,
          },
        ],
      };
      this.myChart.setOption(option);
    },
    shipFullscreen() {
      this.showfullscreen = true;
      setTimeout(() => {
        this.initGraph("fullscreen");
      }, 500);
    },
    onCancel() {
      this.showfullscreen = false;
    },
    onRefresh() {
      this.initGraph("fullscreen");
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 500);
    },
  },
};
</script>

<style lang="less">
.show-graph-header {
  height: 50px;
  display: flex;
  padding: 0 16px;
  align-items: center;
  background: #fdfdfd;
  border: 1px solid #e4edf4;
  justify-content: space-between;

  .header-left {
    font-size: 16px;
  }

  .header-right {
    &-btn {
      color: @activeFontColor;
      border: none;
      font-size: 16px;
      background: #fdfdfd;

      .anticon {
        font-size: 18px;
      }
    }
  }
}
.content-graph {
  height: 560px;
  border: 1px solid #e4edf4;
}
.graph-fullscreen-modal {
  .ant-modal {
    height: 100%;
    padding: 0;

    &-content {
      height: 100%;

      .ant-modal-header {
        .ant-modal-title {
          font-weight: 600;
        }
      }

      .ant-modal-body {
        position: relative;
        height: calc(100% - 55px);

        .fullscreen-graph {
          height: 100%;
        }
        .refresh-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
        }
      }
    }
  }
}
</style>
