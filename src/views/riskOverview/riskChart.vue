<template>
  <div ref="riskChart" class="risk-overview-chart mvp-card">
    <h2>企业关注情况</h2>
    <div class="mvp-card-content">
      <div class="data-chart" ref="riskDataChart"></div>
      <div class="date-choice-tab">
        <div>
          <div :class="activedChoice['year']" @click="changeDateChoice('year')">
            年
          </div>
          <div
            :class="activedChoice['month']"
            @click="changeDateChoice('month')"
          >
            月
          </div>
          <div :class="activedChoice['day']" @click="changeDateChoice('day')">
            日
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "RiskChart",
  props: ["data"],
  data() {
    return {
      curChart: "",
      activedChoice: {
        year: "actived-choice",
        month: "",
        day: "",
      },
      dateChoice: "year",
      seriesName: "当年新增关注企业数量",
    };
  },
  computed: {
    actualData() {
      return this.data.get(this.dateChoice) || [];
    },
  },
  mounted() {
    if (!this.actualData || !this.actualData.length) return;
    // 解决页面初始化时，echarts获取宽度失败导致图表过宽的问题
    // 1539为风险概览页body的最小宽度
    const width =
      document.body.clientWidth > 1539 ? document.body.clientWidth : 1539;
    this.$refs.riskChart.style.width = (width - 336) * 0.75 + 29 + "px";
    setTimeout(() => {
      this.$refs.riskChart.style.width = "100%";
      this.initChart();
    }, 0);
    const f = () => {
      this.curChart.resize();
    };
    window.addEventListener("resize", f);
  },
  beforeDestroy() {
    this.curChart.clear();
    const f = () => {
      this.curChart.resize();
    };
    window.removeEventListener("resize", f);
  },
  methods: {
    initChart() {
      this.curChart = this.$echarts.init(this.$refs.riskDataChart);
      this.curChart.setOption({
        textStyle: {
          fontFamily: '"PingFang SC Regular", "Microsoft YaHei", SimSun, arial',
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          top: "2%",
          right: "center",
        },
        xAxis: {
          type: "category",
          name: "时间",
          nameLocation: "end",
          data: this.actualData[0],
        },
        yAxis: [
          {
            type: "value",
            name: "数量",
            nameLocation: "end",
          },
        ],
        grid: {
          top: "20%",
          left: "2%",
          right: "9%",
          bottom: "10%",
          containLabel: true,
        },
        series: [
          {
            name: this.seriesName,
            type: "bar",
            barWidth: "15%",
            data: this.actualData[2],
            seriesLayoutBy: "row",
            symbol: "none",
            smooth: true,
            itemStyle: {
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                // 前4个参数用于配置渐变色的起止位置, 这4个参数依次对应右/下/左/上四个方位. 而0 0 0 1则代表渐变色从正上方开始.
                // 第5个参数则是一个数组, 用于配置颜色的渐变过程. 包含offset和color两个参数. offset的范围是0 ~ 1, 用于表示位置, color表示颜色
                { offset: 0, color: "#68ccff" },
                { offset: 1, color: "#1495eb" },
              ]),
            },
            emphasis: {
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "#1495eb" },
                  { offset: 1, color: "#68ccff" },
                ]),
              },
            },
          },
          {
            name: "累计关注企业数量",
            type: "line",
            symbol: "emptyCircle",
            symbolSize: 10,
            data: this.actualData[1],
            color: "#30cb84",
          },
        ],
      });
    },
    changeDateChoice(choice) {
      this.activedChoice[this.dateChoice] = "";
      this.dateChoice = choice;
      this.activedChoice[choice] = "actived-choice";
      let name = "";
      switch (choice) {
        case "month":
          name = "当月新增关注企业数量";
          break;
        case "day":
          name = "当日新增关注企业数量";
          break;
        default:
          name = "当年新增关注企业数量";
          break;
      }
      this.seriesName = name;
      this.initChart();
    },
  },
};
</script>
<style lang="less" scoped>
.risk-overview-chart {
  width: 100%;
  height: 100%;
  position: relative;

  .data-chart {
    width: 100%;
    height: 100%;
  }

  .date-choice-tab {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 14px;
    right: 6%;
    width: 142px;
    height: 32px;
    border-radius: 5px;

    div {
      height: 90%;
      width: 80%;
      display: grid;
      flex-direction: column;
      grid-template-columns: 1fr 1fr 1fr;
      grid-gap: 7%;
      div {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: auto;
        cursor: pointer;
      }
    }

    .actived-choice {
      border-radius: 4px;
      background-color: @contentColor;
      color: @activeFontColor;
    }
  }
}
</style>
