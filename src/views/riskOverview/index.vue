<template>
  <div class="risk-overview">
    <risk-statistics :data="dataJson.topMessage" />
    <div class="risk-overview-middle-echart">
      <risk-chart :data="dataJson.riskChart" />
    </div>
    <div class="risk-overview-middle-swiper">
      <risk-swiper :data="latestList" :loading="listLoading" />
    </div>
    <div class="risk-overview-bottom-left">
      <risk-recognize :data="dataJson.todayEvents" />
    </div>
    <div class="risk-overview-bottom-right">
      <attention-enterprise :data="dataJson.focusEnterprise" />
    </div>
  </div>
</template>
<script>
import AttentionEnterprise from "@/views/riskOverview/attentionEnterprise";
import RiskChart from "@/views/riskOverview/riskChart";
import RiskRecognize from "@/views/riskOverview/riskRecognize";
import RiskStatistics from "@/views/riskOverview/riskStatistics";
import RiskSwiper from "@/views/riskOverview/riskSwiper";
import dataJson from "@/shared/riskOverviewData.ts";
import { getLatestList } from "@/shared/api/riskWarning.js";

export default {
  name: "RiskOverview",
  data() {
    return {
      dataJson,
      latestList: [],
      listLoading: true,
    };
  },
  components: {
    AttentionEnterprise,
    RiskChart,
    RiskRecognize,
    RiskStatistics,
    RiskSwiper,
  },
  mounted() {
    this.getLatestList();
  },
  methods: {
    async getLatestList() {
      this.listLoading = true;
      const dataList = await getLatestList();
      if (!dataList) {
        this.$message.error("获取最新待处理线索失败");
      } else {
        const latestList = [];
        dataList.map((item) => {
          latestList.push({
            ...item,
            levelValue:
              item.level === "1"
                ? "一级"
                : item.level === "2"
                ? "二级"
                : "三级",
          });
        });
        this.latestList = latestList;
      }
      this.listLoading = false;
    },
  },
};
</script>
<style lang="less">
.risk-overview {
  display: grid;
  height: 100%;
  overflow-y: auto;
  border-radius: 5px;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(200px, 1fr));
  grid-template-rows: minmax(81px, 0.9fr) minmax(360px, 4fr) minmax(270px, 3fr);

  &-middle-echart {
    grid-column-start: 1;
    grid-column-end: 4;
    grid-row-start: 2;
    grid-row-end: 3;
    z-index: 10;
  }

  &-middle-swiper {
    grid-column-start: 4;
    grid-column-end: 5;
    grid-row-start: 2;
    grid-row-end: 3;
    z-index: 10;
  }

  &-bottom-left {
    grid-column-start: 1;
    grid-column-end: 3;
    grid-row-start: 3;
    grid-row-end: 4;
    z-index: 10;
  }

  &-bottom-right {
    grid-column-start: 3;
    grid-column-end: 5;
    grid-row-start: 3;
    grid-row-end: 4;
    z-index: 10;
  }
}
</style>
