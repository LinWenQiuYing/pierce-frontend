<template>
  <div>
    <div class="fund-graph-header">
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
    <div ref="graph" class="transaction-graph"></div>
    <a-modal
      class="fund-fullscreen-modal"
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
      <div ref="fullscreen" class="fullscreen-transaction-graph"></div>
      <a-button @click="onRefresh" class="refresh-btn">
        <a-icon type="sync" :spin="loading" /> 刷新
      </a-button>
    </a-modal>
  </div>
</template>

<script>
import { Button } from "ant-design-vue";

export default {
  name: "FundTransaction",
  props: ["data", "fundData"],
  data() {
    return {
      eName: this.data.property.__name || this.data.property.enterprisename,
      showfullscreen: false,
      loading: false,
      myChart: "",
    };
  },
  mounted() {
    setTimeout(() => {
      this.initGraph("init");
    }, 0);
    const f = () => {
      this.curChart.resize();
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
  components: {
    AButton: Button,
  },
  methods: {
    initGraph(type) {
      if (type === "init") {
        if (
          !this.$refs.graph ||
          (!this.fundData.edgeData.length && !this.fundData.nodeData.length)
        )
          return;
        this.myChart = this.$echarts.init(this.$refs.graph);
      } else {
        if (
          !this.$refs.fullscreen ||
          (!this.fundData.edgeData.length && !this.fundData.nodeData.length)
        )
          return;
        this.myChart = this.$echarts.init(this.$refs.fullscreen);
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
              width: 60,
              show: true,
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
            edgeSymbol: ["circle", "arrow"],
            edgeSymbolSize: [1, 10],
            edgeLabel: {
              fontSize: 12,
              show: true,
              color: "#82A7C4",
              formatter: function (params) {
                if (params.data.label.value) {
                  return params.data.label.value;
                } else {
                  return null;
                }
              },
              verticalAlign: "middle",
              backgroundColor: "#fff",
            },
            lineStyle: {
              width: 1,
              opacity: 1,
              curveness: 0,
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
            data: this.fundData.nodeData,
            links: this.fundData.edgeData,
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
.fund-graph-header {
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
.transaction-graph {
  height: 560px;
  border: 1px solid #e4edf4;
}

.fund-fullscreen-modal {
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

        .fullscreen-transaction-graph {
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
