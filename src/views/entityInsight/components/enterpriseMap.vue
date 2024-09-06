<template>
  <div class="enterprise-map">
    <div class="enterprise-map-header">企业图谱</div>
    <div class="enterprise-map-content">
      <div class="content-graph">
        <a class="content-graph-img" href="#stock">
          <img
            src="../../../assets/images/img/stock_penetration.png"
            alt="股权穿透图谱"
          />
        </a>
        <a class="content-graph-text" href="#stock">
          <div class="text">股权穿透图谱</div>
        </a>
      </div>
      <div class="content-graph">
        <a class="content-graph-img" href="#guarantee">
          <img
            src="../../../assets/images/img/guarantee_chain.png"
            alt="担保圈链图谱"
          />
        </a>
        <a class="content-graph-text" href="#guarantee">
          <div class="text">担保圈链图谱</div>
        </a>
      </div>
      <div class="content-graph">
        <a class="content-graph-img" href="#fund">
          <img
            src="../../../assets/images/img/fund_transaction.png"
            alt="资金交易图谱"
          />
        </a>
        <a class="content-graph-text" href="#fund">
          <div class="text">资金交易图谱</div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "EnterpriseMap",
  data() {
    return {};
  },
  components: {},
  methods: {},
};
</script>

<style lang="less" scoped>
.enterprise-map {
  min-height: 260px;
  padding: 0 16px;

  .enterprise-map-header {
    width: 80px;
    height: 28px;
    font-size: 20px;
    font-weight: 600;
    opacity: 1;
  }
  .enterprise-map-content {
    padding: 15px 0;
    display: flex;
    width: 70%;
    min-width: 650px;
    max-width: 800px;

    .content-graph {
      width: 240px;
      height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-right: 20px;
      border: 1px solid #e7edf1;

      &-img {
        overflow: hidden;
        text-align: center;
        display: inline-block;
        padding: 16px;

        img {
          width: 208px;
          height: 128px;
        }
        .text {
          width: 240px;
          height: 40px;
          background: #f1f7fb;
          border: 1px solid #e7edf1;
          opacity: 1;
          border-radius: 0px;
        }
      }

      &-text {
        text-align: center;
        line-height: 40px;
        color: #000;

        .text {
          width: 240px;
          height: 40px;
          background: #f1f7fb;
          border: 1px solid #e7edf1;
          opacity: 1;
          border-radius: 0px;
        }
      }
    }

    .content-graph::after {
      content: attr(data-desc);
      display: inline;
      font-size: 14px;
      color: #333;
      line-height: 22px;
    }
  }
}
</style>
