<template>
  <div class="risk-overview-header">
    <div
      class="risk-overview-header-item"
      v-for="(item, index) in data"
      :key="index"
    >
      <div class="item-left">
        <img
          v-if="index === 0"
          src="@/assets/images/img/icon-jinridanbao.png"
          alt=""
          class="item-left-icon"
        />
        <img
          v-if="index === 1"
          src="@/assets/images/img/icon-jinrizijin.png"
          alt=""
          class="item-left-icon"
        />
        <img
          v-if="index === 2"
          src="@/assets/images/img/icon-benyuedanbao.png"
          alt=""
          class="item-left-icon"
        />
        <img
          v-if="index === 3"
          src="@/assets/images/img/icon-benyuezijin.png"
          alt=""
          class="item-left-icon"
        />
        <div class="item-left-text">
          <div class="item-left-text-title">
            <span class="title-text">{{ item.title }}</span>
            <span class="title-num">{{ item.num }}</span>
          </div>
        </div>
      </div>
      <div class="item-right">
        <span class="item-right-top">
          {{ item.title.slice(0, 2) === "今日" ? "较昨日" : "较上月" }}
        </span>
        <span class="item-right-bottom">
          <a-icon :type="item.change > 0 ? 'caret-up' : 'caret-down'" />
          {{ Math.abs(item.change) + "%" }}
        </span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "RiskStatistics",
  props: ["data"],
  components: {},
  data() {
    return {};
  },
  methods: {},
};
</script>
<style lang="less" scoped>
.risk-overview-header {
  grid-column-start: 1;
  grid-column-end: 5;
  grid-row-start: 1;
  grid-row-end: 2;
  z-index: 10;
  display: grid;
  border-radius: 5px;
  gap: 16px;
  height: 100%;
  grid-template-columns: repeat(4, minmax(200px, 1fr));
  grid-template-rows: minmax(84px, 1fr);

  &-item {
    display: flex;
    padding: 12px;
    font-size: 14px;
    border-radius: 5px;
    align-items: center;
    flex-direction: row;
    justify-content: space-evenly;
    background: @contentColor;

    .item-left {
      width: 70%;
      height: 100%;
      display: flex;
      min-width: 140px;
      align-items: center;

      &-icon {
        width: 36px;
        height: 36px;
        margin-right: 10px;
      }

      &-text {
        line-height: 30px;

        @media screen and (min-width: 1487px) {
          .item-left-text {
            &-title {
              span {
                display: block;
              }
            }
          }
        }
        &-title {
          color: @primaryTextColor;

          .title-text {
            font-size: 14px;
          }

          .title-num {
            font-weight: 600;
            font-size: 20px;
            margin-left: 2px;
          }
        }
      }
    }

    .item-right {
      width: 30%;
      height: 70%;
      display: flex;
      min-width: 60px;
      line-height: 25px;
      flex-direction: column;
      justify-content: center;
      border-left: 1px solid #e6e6e6;

      span {
        text-align: right;
      }

      .item-right-bottom {
        color: #19be6b;
      }
    }
  }
}
</style>
