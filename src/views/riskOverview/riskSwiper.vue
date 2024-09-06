<template>
  <div class="mvp-card risk-overview-swiper">
    <h2>最新待处理线索</h2>
    <div class="mvp-card-content" ref="swiperContent">
      <!-- autoplay -->
      <a-carousel
        v-if="!loading && data.length"
        :dots="true"
        dotPosition="right"
        :autoplaySpeed="2000"
        autoplay
      >
        <div class="swiper-wrapper" v-for="item in data" :key="item.desc">
          <div class="swiper-wrapper-header">
            <div class="swiper-wrapper-header-img">
              <img src="@/assets/images/img/clue_icon.svg" alt="" />
            </div>
            <div class="swiper-wrapper-header-title">
              <p class="title-text">
                <span class="title-text-rule">
                  {{ item.ruleName }}
                </span>
                <img
                  v-if="item.level === '1'"
                  src="@/assets/images/img/level_first.svg"
                  class="title-text-img"
                  alt=""
                />
                <img
                  v-if="item.level === '2'"
                  src="@/assets/images/img/level_second.svg"
                  class="title-text-img"
                  alt=""
                />
                <img
                  v-if="item.level === '3'"
                  src="@/assets/images/img/level_third.svg"
                  class="title-text-img"
                  alt=""
                />
                <span
                  class="check-detail"
                  @click="handleCheckDetail(item.flowId)"
                  >去处理>></span
                >
              </p>
              <div class="title-content">
                <a-tooltip placement="left">
                  <template slot="title">
                    <span class="title-text-all">{{ item.customerName }}</span>
                  </template>
                  <div class="title-content-item">
                    <img
                      src="@/assets/images/img/person_icon.svg"
                      class="title-content-item-icon"
                      alt=""
                    />
                    {{ item.customerName }}
                  </div>
                </a-tooltip>
                <a-tooltip placement="left">
                  <template slot="title">
                    <span class="title-text-all">{{ item.customerId }}</span>
                  </template>
                  <div class="title-content-item">
                    <img
                      src="@/assets/images/img/account_icon.svg"
                      class="title-content-item-icon"
                      alt=""
                    />
                    {{ item.customerId }}
                  </div>
                </a-tooltip>
              </div>
            </div>
          </div>
          <div class="swiper-wrapper-text">
            <ul class="swiper-list">
              <li class="swiper-list-item">
                <span class="list-item-label">线索类型：</span>
                <span class="list-item-content">{{ item.categoryName }}</span>
              </li>
              <li class="swiper-list-item">
                <span class="list-item-label">规则名称：</span>
                <a-tooltip placement="left">
                  <template slot="title">
                    <span class="list-item-content">{{ item.ruleName }}</span>
                  </template>
                  <div class="list-item-content">
                    {{ item.ruleName }}
                  </div>
                </a-tooltip>
              </li>
              <li class="swiper-list-item">
                <span class="list-item-label">触发时间：</span>
                <span class="list-item-content">{{ item.createDate }}</span>
              </li>
            </ul>
          </div>
        </div>
      </a-carousel>
      <a-spin
        v-if="loading"
        :spinning="loading"
        class="risk-overview-swiper-loading"
        size="large"
        tip="正在加载"
      />
      <div
        class="risk-overview-swiper-nocontent"
        v-if="!loading && !data.length"
      >
        暂无待处理线索
      </div>
    </div>
  </div>
</template>
<script>
import { Carousel, Spin, Tooltip } from "ant-design-vue";

export default {
  name: "RiskSwiper",
  props: ["data", "loading"],
  data() {
    return {
      textLength: 0,
    };
  },
  components: {
    ACarousel: Carousel,
    ASpin: Spin,
    ATooltip: Tooltip,
  },
  mounted() {
    this.textLength = parseInt(
      (this.$refs.swiperContent.offsetWidth - 32) / 12
    );
    this.textLength = this.textLength * 5 + 10;
  },
  methods: {
    handleCheckDetail(id) {
      this.$router.push({
        name: "riskWarningInfo",
        params: {
          warningId: id,
        },
      });
    },
  },
};
</script>
<style lang="less">
.risk-overview-swiper {
  height: 100%;

  &-loading,
  &-nocontent {
    top: 50%;
    left: 50%;
    position: absolute;
    transform: translate(-50%, -50%);
  }

  .mvp-card-content {
    width: 100%;
    position: relative;
    padding: 10px 0 !important;

    .ant-carousel {
      height: 100%;

      .slick-slider {
        height: 100%;

        .slick-list {
          height: 100% !important;

          .slick-slide {
            height: 60px;
            padding: 0 16px;
            border: none;
            pointer-events: auto;
            transition: all 0.3s;

            &:hover {
              height: 135px;
              background: #f6f8fa;

              .swiper-wrapper {
                &-text {
                  display: -webkit-box;
                }
              }
            }

            & > div {
              height: 100%;
            }

            .swiper-wrapper {
              height: 100%;
              padding: 5px 0;
              border-bottom: 1px dashed #d7dde4;

              &-header {
                width: 100%;
                display: flex;
                line-height: 30px;

                &-img {
                  padding-right: 16px;
                }

                &-title {
                  color: #515a6e;
                  overflow: hidden;
                  position: relative;
                  width: calc(100% - 30px);

                  .title-text {
                    display: flex;
                    height: 24px;
                    line-height: 24px;
                    align-items: center;

                    &-rule {
                      color: #000;
                      font-weight: 600;
                      font-size: 14px;
                      margin-right: 10px;
                      max-width: calc(100% - 105px);
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    }

                    &-img {
                      height: 14px;
                    }
                  }

                  .title-content {
                    display: flex;
                    font-size: 12px;
                    color: #a8a8a8;
                    justify-content: space-between;

                    &-item {
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      width: 50%;
                      display: flex;
                      align-items: center;

                      &-icon {
                        margin-right: 3px;
                        display: inline-block;
                      }
                    }
                  }

                  .check-detail {
                    color: @activeFontColor;
                    cursor: pointer;
                    position: absolute;
                    font-size: 12px;
                    right: 5px;
                  }
                }
              }

              &-text {
                display: none;
                color: #949eac;
                font-size: 12px;
                overflow: hidden;
                line-height: 20px;
                -webkit-line-clamp: 6;
                -webkit-box-orient: vertical;

                .swiper-list {
                  margin-bottom: 0;

                  &-item {
                    display: flex;
                    align-items: center;
                    font-size: 12px;

                    &:not(:last-child) {
                      margin-bottom: 5px;
                    }

                    .list-item-label {
                      width: 62px;
                      color: #373737;
                    }

                    .list-item-content {
                      width: calc(100% - 62px);
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      color: #a8a8a8;
                    }
                  }
                }
              }
            }
          }
        }

        .slick-dots {
          li button {
            background-color: grey !important;
          }
        }
      }
    }
  }
}
</style>
