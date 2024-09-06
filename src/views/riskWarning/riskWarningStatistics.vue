<template>
  <div class="risk-warning-statistics">
    <div class="risk-warning-statistics-top">
      <div class="risk-warning-statistics-top-item">
        <div class="risk-warning-statistics-top-item-top">
          <span class="item-title">当月新增线索数量</span>
          <a-icon type="info-circle" />
        </div>
        <div class="risk-warning-statistics-top-item-middle">
          <span class="item-num">1,650</span>
          <div class="item-change">
            <div class="item-change-year">
              <span class="item-change-year-text">同比变化</span>
              <a-icon type="caret-up" />
              <span class="item-change-year-num">2.34%</span>
            </div>
            <div class="item-change-ring">
              <span class="item-change-ring-text">环比变化</span>
              <a-icon type="caret-down" />
              <span class="item-change-ring-num">2.34%</span>
            </div>
          </div>
        </div>
        <div class="risk-warning-statistics-top-item-bottom">
          <span class="bottom-left">累计线索数量</span>
          <span class="bottom-right">12,423</span>
        </div>
      </div>
      <div class="risk-warning-statistics-top-item">
        <div class="risk-warning-statistics-top-item-top">
          <span class="item-title">待处理线索</span>
          <a-icon type="info-circle" />
        </div>
        <div class="risk-warning-statistics-top-item-middle">
          <span class="item-num">1,846</span>
        </div>
        <div class="risk-warning-statistics-top-item-bottom">
          <span class="bottom-left">日新增线索</span>
          <span class="bottom-right">12,423</span>
        </div>
      </div>
      <div class="risk-warning-statistics-top-item">
        <div class="risk-warning-statistics-top-item-top">
          <span class="item-title">关注中线索</span>
          <a-icon type="info-circle" />
        </div>
        <div class="risk-warning-statistics-top-item-middle">
          <span class="item-num">560</span>
        </div>
        <div class="risk-warning-statistics-top-item-bottom">
          <span class="bottom-left">日新增线索</span>
          <span class="bottom-right">12,423</span>
        </div>
      </div>
      <div class="risk-warning-statistics-top-item">
        <div class="risk-warning-statistics-top-item-top">
          <span class="item-title">风险企业占比</span>
          <a-icon type="info-circle" />
        </div>
        <div class="risk-warning-statistics-top-item-middle">
          <span class="item-num">78%</span>
          <div class="item-change progress">
            <a-progress :percent="50" :show-info="false" />
          </div>
        </div>
        <div class="risk-warning-statistics-top-item-bottom">
          <div class="bottom-last-left">
            <span class="bottom-last-left-text">周同比</span>
            <a-icon type="caret-up" />
            <span class="bottom-last-left-num">2.34%</span>
          </div>
          <div class="bottom-last-right">
            <span class="bottom-last-right-text">日环比</span>
            <a-icon type="caret-down" />
            <span class="bottom-last-right-num">2.34%</span>
          </div>
        </div>
      </div>
    </div>
    <div class="risk-warning-statistics-middle">
      <div class="risk-warning-statistics-middle-left">
        <div class="risk-warning-statistics-middle-left-header">
          <a-radio-group
            class="type-radios"
            default-value="1"
            button-style="solid"
            v-model="typeSelected"
          >
            <a-radio-button value="1"> 风险线索 </a-radio-button>
            <a-radio-button value="2"> 关注中线索 </a-radio-button>
          </a-radio-group>
          <a-radio-group
            class="unit-radios"
            default-value="3"
            button-style="solid"
            v-model="unitSelected"
            @change="unitChange"
          >
            <a-radio-button value="1"> 周 </a-radio-button>
            <a-radio-button value="2"> 月 </a-radio-button>
            <a-radio-button value="3"> 年 </a-radio-button>
          </a-radio-group>
        </div>
        <div
          class="risk-warning-statistics-middle-left-content"
          ref="warningDataChart"
        ></div>
      </div>
      <div class="risk-warning-statistics-middle-right">
        <div class="risk-warning-statistics-middle-right-header">
          <a-range-picker v-model="startStopTime" class="time-input">
            <template slot="suffixIcon">
              <a-icon type="calendar" />
            </template>
          </a-range-picker>
        </div>
        <div class="risk-warning-statistics-middle-right-content">
          <div class="content-text">线索类型排名</div>
          <div class="content-list">
            <div
              class="content-list-item"
              v-for="(item, index) in typeList"
              :key="item.id"
            >
              <div class="content-list-item-left">
                <img
                  src="@/assets/images/img/first.png"
                  alt="icon"
                  class="type-icon"
                  v-if="index === 0"
                />
                <img
                  src="@/assets/images/img/second.png"
                  alt="icon"
                  class="type-icon"
                  v-else-if="index === 1"
                />
                <img
                  src="@/assets/images/img/third.png"
                  alt="icon"
                  class="type-icon"
                  v-else-if="index === 2"
                />
                <span class="type-index" v-else>{{ index + 1 }}</span>
                <span class="type-name">{{ item.name }}</span>
              </div>
              <span class="content-list-item-right">{{ item.num }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="risk-warning-statistics-bottom-left">
      <div class="bottom-title">当日线索</div>
      <div class="bottom-content">
        <div class="bottom-content-top">
          <div class="bottom-content-top-item">
            <p class="item-title">新增线索<a-icon type="info-circle" /></p>
            <div class="item-content">
              <span class="item-content-left">1,650</span>
              <div class="item-content-right">
                <span class="item-content-right-text">同比变化</span>
                <a-icon type="caret-up" />
                <span class="item-content-right-num">2.34%</span>
              </div>
            </div>
          </div>
          <div class="bottom-content-top-item">
            <p class="item-title">覆盖企业数量<a-icon type="info-circle" /></p>
            <div class="item-content">
              <span class="item-content-left">867</span>
              <a-progress :percent="26.2" />
            </div>
          </div>
        </div>
        <div class="bottom-content-table">
          <table-component
            :columns="columns"
            :data-source="warningList"
            :rowKey="(record) => record.id"
            :pagination="pagination"
            class="risk-statistics-table"
          >
            <span slot="actions" slot-scope="record">
              <a @click="handleDelete(e, record)">删除</a>
              <a @click="handleSearch(e, record)">执行查询</a>
            </span>
          </table-component>
        </div>
      </div>
    </div>
    <div class="risk-warning-statistics-bottom-right">
      <div class="bottom-title">月度线索分布</div>
      <div class="bottom-content">
        <a-radio-group
          class="category-radios"
          default-value="1"
          button-style="solid"
          v-model="categorySelected"
          @change="categoryChange"
        >
          <a-radio-button value="1"> 行业分布 </a-radio-button>
          <a-radio-button value="2"> 区域分布 </a-radio-button>
          <a-radio-button value="3"> 线索状态 </a-radio-button>
          <a-radio-button value="4"> 线索级别 </a-radio-button>
        </a-radio-group>
        <div ref="statisticsPiechart" class="statistics-piechart"></div>
      </div>
    </div>
  </div>
</template>
<script>
import TableComponent from "@/components/tableComponent";
import { DatePicker, Progress, Radio } from "ant-design-vue";

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { RangePicker } = DatePicker;

export default {
  name: "RiskWarningStatistics",
  data() {
    return {
      dataJson: {
        riskChart: new Map([
          [
            "3",
            [
              ["2016", "2017", "2018", "2019", "2020", "2021"],
              [39, 47, 56, 72, 90, 111],
            ],
          ],
          [
            "2",
            [
              [
                "2021-04",
                "2021-05",
                "2021-06",
                "2021-07",
                "2021-08",
                "2021-09",
              ],
              [95, 99, 102, 107, 110, 111],
            ],
          ],
          [
            "1",
            [
              ["08-28", "08-29", "08-30", "08-31", "09-01", "09-02"],
              [109, 109, 109, 110, 111, 111],
            ],
          ],
        ]),
        pieChart: new Map([
          [
            "4",
            [
              { value: 125, name: "制造业", ratio: "5.6%" },
              { value: 735, name: "能源", ratio: "33.0%" },
              { value: 580, name: "金融", ratio: "26.1%" },
              { value: 484, name: "通信", ratio: "21.8%" },
              { value: 300, name: "互联网", ratio: "13.5%" },
            ],
          ],
          [
            "3",
            [
              { value: 125, name: "制造业", ratio: "5.6%" },
              { value: 735, name: "能源", ratio: "33.0%" },
              { value: 580, name: "金融", ratio: "26.1%" },
              { value: 484, name: "通信", ratio: "21.8%" },
              { value: 300, name: "互联网", ratio: "13.5%" },
            ],
          ],
          [
            "2",
            [
              { value: 125, name: "制造业", ratio: "5.6%" },
              { value: 735, name: "能源", ratio: "33.0%" },
              { value: 580, name: "金融", ratio: "26.1%" },
              { value: 484, name: "通信", ratio: "21.8%" },
              { value: 300, name: "互联网", ratio: "13.5%" },
            ],
          ],
          [
            "1",
            [
              { value: 125, name: "制造业", ratio: "5.6%" },
              { value: 735, name: "能源", ratio: "33.0%" },
              { value: 580, name: "金融", ratio: "26.1%" },
              { value: 484, name: "通信", ratio: "21.8%" },
              { value: 300, name: "互联网", ratio: "13.5%" },
            ],
          ],
        ]),
      },
      typeSelected: "1",
      unitSelected: "3",
      categorySelected: "1",
      curChart: "",
      pieChart: "",
      startStopTime: undefined,
      typeList: [
        {
          id: 2,
          url: require("@/assets/images/img/happy.png"),
          name: "在外经商办企业",
          num: 9,
          color: "#D56E20",
        },
        {
          id: 0,
          url: require("@/assets/images/img/happy.png"),
          name: "疑似参与非法集资",
          num: 4,
          color: "#F28526",
        },
        {
          id: 3,
          url: require("@/assets/images/img/happy.png"),
          name: "违规流向",
          num: 3,
        },
        {
          id: 5,
          url: require("@/assets/images/img/happy.png"),
          name: "与供应商资金往来",
          num: 3,
        },
        {
          id: 4,
          url: require("@/assets/images/img/happy.png"),
          name: "与信贷客户资金往来",
          num: 2,
        },
        {
          id: 1,
          url: require("@/assets/images/img/happy.png"),
          name: "疑似充当资金掮客",
          num: 1,
          color: "#4F7EEF",
        },
        {
          id: 6,
          url: require("@/assets/images/img/happy.png"),
          name: "资金回流",
          num: 1,
        },
        // {
        //   id: 7,
        //   url: require("@/assets/images/img/happy.png"),
        //   name: "多保一",
        //   num: 142,
        // },
        // {
        //   id: 8,
        //   url: require("@/assets/images/img/happy.png"),
        //   name: "一保多",
        //   num: 89,
        // },
      ],
      pagination: {
        size: "small",
        current: 1,
        pageSize: 15,
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
      columns: [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          width: 63,
        },
        {
          title: "风险类型",
          dataIndex: "errorType",
          key: "errorType",
          width: 210,
        },
        {
          title: "新增线索",
          dataIndex: "newWarning",
          key: "newWarning",
          width: 90,
        },
        {
          title: "一级线索",
          dataIndex: "firstWarning",
          key: "firstWarning",
          width: 90,
        },
        {
          title: "操作",
          dataIndex: "actions",
          key: "actions",
          width: 90,
          scopedSlots: { customRender: "actions" },
        },
      ],
      warningList: [],
      total: 2224,
    };
  },
  components: {
    AProgress: Progress,
    ARadioButton: RadioButton,
    ARadioGroup: RadioGroup,
    ARangePicker: RangePicker,
    TableComponent,
  },
  computed: {
    actualData() {
      return this.dataJson.riskChart.get(this.unitSelected) || [];
    },
    pieData() {
      return this.dataJson.pieChart.get(this.categorySelected) || [];
    },
  },
  mounted() {
    if (!this.actualData || !this.actualData.length) return;
    setTimeout(() => {
      this.initChart();
      this.initPieChart();
    }, 0);
    const f = () => {
      this.curChart.resize();
      this.pieChart.resize();
    };
    window.addEventListener("resize", f);
  },
  beforeDestroy() {
    this.curChart.clear();
    this.pieChart.clear();
    const f = () => {
      this.curChart.resize();
      this.pieChart.resize();
    };
    window.removeEventListener("resize", f);
  },
  methods: {
    initChart() {
      this.curChart = this.$echarts.init(this.$refs.warningDataChart);
      this.curChart.setOption({
        textStyle: {
          fontFamily: '"PingFang SC Regular", "Microsoft YaHei", SimSun, arial',
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          top: "2%",
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
          top: 50,
          left: 10,
          right: 10,
          bottom: 10,
          containLabel: true,
        },
        series: [
          {
            name: "风险线索数量",
            type: "bar",
            symbol: "none",
            data: this.actualData[1],
            smooth: true,
            barWidth: "56",
            itemStyle: {
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
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
        ],
      });
    },
    initPieChart() {
      this.pieChart = this.$echarts.init(this.$refs.statisticsPiechart);
      this.pieChart.setOption({
        textStyle: {
          fontFamily: '"PingFang SC Regular", "Microsoft YaHei", SimSun, arial',
        },
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(50,50,50,0.7)",
          textStyle: {
            color: "#fff",
          },
          formatter: function (params) {
            let color = params.color; //图例颜色
            let htmlStr = "<div>";
            htmlStr += params.seriesName + "<br/>";
            //为了保证和原来的效果一样，这里自己实现了一个点的效果
            htmlStr +=
              "<span style='display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 5px; background: " +
              color +
              "'></span>";
            htmlStr +=
              params.name +
              "：" +
              params.value +
              "&nbsp &nbsp" +
              params.data.ratio;
            htmlStr += "</div>";
            return htmlStr;
          },
        },
        legend: {
          top: "center",
          right: "5%",
          orient: "vertical",
          icon: "circle",
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            lineHeight: 30,
            fontSize: 16,
            color: "#949dad",
            rich: {
              a: {
                width: 80,
                fontSize: 16,
                padding: [0, 0, 0, 10],
              },
              b: {
                width: 60,
                fontSize: 16,
              },
            },
          },
          formatter: (name) => {
            let arr = [];
            for (let i = 0; i < this.pieData.length; i++) {
              if (this.pieData[i].name === name) {
                arr = [
                  "{a|" + this.pieData[i].name + "}",
                  "{b|" + this.pieData[i].ratio + "}",
                  this.pieData[i].value,
                ];
              }
            }
            return arr.join("");
          },
        },
        series: [
          {
            name: "月度风险分布",
            type: "pie",
            radius: ["50%", "70%"],
            data: this.pieData,
            avoidLabelOverlap: true,
            width: "55%",
            label: {
              show: true,
              position: "center",
              formatter:
                "{total|月度线索总数}" + "\n\r" + "{active|" + this.total + "}",
              rich: {
                total: {
                  fontSize: 14,
                  fontFamily:
                    '"PingFang SC Regular", "Microsoft YaHei", SimSun, arial',
                  color: "#949dad",
                  lineHeight: 30,
                },
                active: {
                  fontFamily:
                    '"PingFang SC Regular", "Microsoft YaHei", SimSun, arial',
                  fontSize: 30,
                  color: "#333",
                },
              },
            },
            emphasis: {
              label: {
                //中间文字显示
                show: true,
              },
            },
            lableLine: {
              show: false,
              tooltip: {
                show: false,
              },
            },
          },
        ],
      });
    },
    unitChange(e) {
      this.unitSelected = e.target.value;
      this.initChart();
    },
    categoryChange(e) {
      this.categorySelected = e.target.value;
      this.initPieChart();
    },
  },
};
</script>
<style lang="less">
@media screen and (max-width: 1920px) {
  .risk-warning-statistics {
    grid-template-rows: minmax(150px, 1.5fr) minmax(337.5px, 3.375fr) minmax(
        375px,
        3.75fr
      );

    .bottom-title {
      height: 50px;
      line-height: 50px;
    }

    .bottom-content {
      height: calc(100% - 50px);
    }

    .risk-warning-statistics-bottom-left {
      .bottom-content {
        &-top {
          height: 100px;

          &-item {
            margin: 16px 0 18px;

            .item-content {
              .ant-progress {
                width: calc(100% - 120px);
              }
            }
          }
        }

        &-table {
          height: calc(100% - 100px);
        }
      }
    }

    .risk-warning-statistics-bottom-right {
      .category-radios {
        .ant-radio-button-wrapper {
          padding: 0 10px;
        }
      }
    }
  }
}

@media screen and (min-width: 1920px) {
  .risk-warning-statistics {
    grid-template-rows: minmax(200px, 2fr) minmax(450px, 4.5fr) minmax(
        500px,
        5fr
      );

    .bottom-title {
      height: 60px;
      line-height: 60px;
    }

    .bottom-content {
      height: calc(100% - 60px);
    }

    .risk-warning-statistics-bottom-left {
      .bottom-content {
        &-top {
          height: 140px;

          &-item {
            margin: 20px 0 40px;

            .item-title {
              font-size: 16px;
              margin-bottom: 15px;
            }

            .item-content {
              .ant-progress {
                width: calc(100% - 130px);
              }
            }
          }
        }

        &-table {
          height: calc(100% - 140px);
        }
      }
    }

    .risk-warning-statistics-bottom-right {
      .category-radios {
        font-size: 16px;
      }
    }
  }
}
.risk-warning-statistics {
  gap: 20px;
  height: 100%;
  display: grid;
  overflow-y: auto;
  border-radius: 5px;
  grid-template-columns: repeat(8, minmax(100px, 1fr));
  // grid-template-rows: minmax(200px, 2fr) minmax(450px, 4.5fr) minmax(500px, 5fr);
  // grid-template-rows: minmax(150px, 1.5fr) minmax(337.5px, 3.375fr) minmax(
  //     375px,
  //     3.75fr
  //   );

  &-top {
    gap: 20px;
    z-index: 10;
    height: 100%;
    display: grid;
    grid-row-end: 2;
    grid-row-start: 1;
    grid-column-end: 9;
    grid-column-start: 1;
    border-radius: 10px;
    grid-template-rows: minmax(80px, 1fr);
    grid-template-columns: repeat(4, minmax(200px, 1fr));

    &-item {
      background: #fff;
      border-radius: 5px;

      &-top {
        display: flex;
        height: 28.5%;
        color: #000;
        padding: 0 16px;
        font-size: 16px;
        font-weight: 500;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #eaeaec;

        .anticon-info-circle {
          color: #949dad;
        }
      }

      &-middle {
        height: 44%;
        display: flex;
        margin: 0 16px;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #eaeaec;

        .item-num {
          width: 50%;
          font-size: 28px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .item-change {
          width: 50%;
          display: flex;
          min-width: 120px;
          max-width: 150px;
          color: #949dad;
          flex-direction: column;

          &.progress {
            width: 70%;
            max-width: 200px;
          }

          &-year,
          &-ring {
            display: flex;
            align-items: center;
            justify-content: space-around;
          }

          &-year {
            .anticon-caret-up,
            &-num {
              color: #19be6b;
            }
          }

          &-ring {
            .anticon-caret-down,
            &-num {
              color: #f6001a;
            }
          }
        }
      }

      &-bottom {
        height: 27.5%;
        display: flex;
        padding: 0 16px;
        align-items: center;
        justify-content: space-between;

        .bottom-left {
          color: #949dad;
        }

        .bottom-right {
          color: #505a71;
          font-weight: bold;
          font-family: DIN Alternate;
        }

        .bottom-last-left,
        .bottom-last-right {
          width: 50%;
          display: flex;
          max-width: 120px;
          color: #949dad;
          overflow: hidden;
          white-space: nowrap;
          align-items: center;
          text-overflow: ellipsis;
          justify-content: space-around;

          &-text {
            color: #949dad;
            font-weight: normal;
          }

          .anticon-caret-up,
          &-num {
            color: #19be6b;
          }
        }

        .bottom-right {
          color: #505a71;
          font-weight: bold;
          text-align: right;
          font-family: DIN Alternate;

          .anticon-caret-down,
          &-num {
            color: #f6001a;
            font-weight: normal;
          }
        }
      }
    }
  }

  &-middle {
    display: flex;
    padding: 8px 0;
    grid-row-end: 3;
    grid-row-start: 2;
    background: #fff;
    border-radius: 5px;
    grid-column-end: 9;
    grid-column-start: 1;

    &-left {
      width: 75%;
      height: 100%;

      &-header {
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #e8eaec;

        .type-radios {
          .ant-radio-button-wrapper {
            padding: 0;
            border: none;
            margin: 0 15px;
            font-size: 16px;
            border-radius: 0;
            color: #515a6e;
            font-weight: 600;
            padding-bottom: 35px;

            &.ant-radio-button-wrapper-checked {
              border: none;
              color: @activeFontColor;
              background-color: #fff;
              border-bottom: 1px solid @activeFontColor;

              &:focus-within {
                box-shadow: none;
              }
            }

            &:hover {
              color: #2362fb;
            }

            &::before {
              content: none;
            }
          }
        }
      }

      &-content {
        height: calc(100% - 60px);
        width: 100%;
      }
    }

    &-right {
      width: 25%;
      height: 100%;

      &-header {
        height: 60px;
        display: flex;
        padding-left: 20px;
        align-items: center;
        border-bottom: 1px solid #e8eaec;

        .time-input {
          width: 240px;
        }
      }

      &-content {
        overflow: auto;
        padding-left: 20px;
        padding-right: 16px;
        height: calc(100% - 60px);

        .content-text {
          height: 30px;
          color: #333;
          font-size: 15px;
          line-height: 30px;
          margin-bottom: 10px;
        }

        .content-list {
          &-item {
            display: flex;
            color: #949dad;
            margin-bottom: 8px;
            justify-content: space-between;

            &:first-child {
              color: #f28526;
            }

            &:nth-child(2) {
              color: #5271e5;
            }

            &:nth-child(3) {
              color: #d56e20;
            }

            &-left {
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              width: calc(100% - 45px);

              .type-index {
                width: 20px;
                height: 22px;
                color: #fff;
                font-size: 12px;
                line-height: 22px;
                text-align: center;
                display: inline-block;
                background: url("../../assets/images/img/forth.png") no-repeat
                  center;
              }

              .type-icon,
              .type-index {
                margin-right: 10px;
              }
            }

            &-right {
              width: 45px;
              text-align: right;
            }
          }
        }
      }
    }
  }

  &-bottom-left {
    display: flex;
    grid-row-end: 4;
    grid-row-start: 3;
    background: #fff;
    border-radius: 5px;
    grid-column-end: 6;
    grid-column-start: 1;
    flex-direction: column;

    .bottom-content {
      &-top {
        display: flex;
        padding: 0 20px;

        &-item {
          width: 50%;

          &:first-child {
            padding-right: 40px;
            border-right: 1px solid #e8eaec;
          }

          &:last-child {
            padding-left: 40px;
          }

          .item-title {
            display: flex;
            color: #595959;
            align-items: center;

            .anticon-info-circle {
              margin-left: 10px;
              color: #949dad;
            }
          }

          .item-content {
            display: flex;
            justify-content: space-between;

            &-left {
              color: #333;
              font-size: 30px;
            }

            &-right {
              margin-top: 20px;
              color: #949dad;

              .anticon-caret-up,
              &-num {
                color: #19be6b;
                margin-left: 8px;
              }
            }

            .ant-progress {
              margin-top: 20px;
            }
          }
        }
      }

      &-table {
        padding: 0 16px;

        .risk-statistics-table {
          .ant-table-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            height: calc(100% - 48px);

            .ant-empty-normal {
              margin: 0;
            }
          }
        }
      }
    }
  }

  &-bottom-right {
    display: flex;
    grid-row-end: 4;
    grid-row-start: 3;
    background: #fff;
    border-radius: 5px;
    grid-column-end: 9;
    grid-column-start: 6;
    flex-direction: column;

    .bottom-content {
      .category-radios {
        padding: 0 8px;
        margin-top: 15px;
      }

      .statistics-piechart {
        height: calc(100% - 47px);
      }
    }
  }

  .bottom-title {
    width: 100%;
    padding: 0 16px;
    font-size: 16px;
    color: #333;
    border-bottom: 1px solid #e8eaec;
  }

  .unit-radios,
  .category-radios {
    .ant-radio-button-wrapper {
      border: 0;

      &::before {
        content: none;
      }

      &.ant-radio-button-wrapper-checked {
        color: @activeFontColor;
        background: #fff;

        &:focus-within {
          box-shadow: none;
        }
      }
    }
  }
}
</style>
