<template>
  <div class="enterprise-info">
    <div class="info-image">
      <img :src="iconData" alt="企业" />
    </div>
    <div class="info-content">
      <div class="info-content-name">
        <div class="name-text">
          {{ data.customerName }}
        </div>
        <div class="name-tags" v-if="isEnterprise">存续</div>
        <div @click="isAttention" class="attention">
          <img
            v-if="attention"
            src="@/assets/images/img/star_active.png"
            alt=""
          />
          <img v-else src="@/assets/images/img/star_inactive.png" alt="" />
        </div>
        <div class="name-update" @click="handleRefrash">
          <a-icon type="sync" :spin="loading" />刷新
        </div>
        <div class="name-return" @click="handleReturn">返回</div>
      </div>
      <div class="info-content-tags">
        <div class="name-label" v-if="isEnterprise">
          <div class="name-label-item">新四板</div>
        </div>
        <div class="name-label" v-if="isEnterprise">
          <div class="name-label-item">高新技术企业</div>
        </div>
        <div class="name-label" v-if="isEnterprise">
          <div class="name-label-item">科技型企业</div>
        </div>
        <div class="warning-label">
          <div class="warning-label-item">
            <img src="@/assets/images/img/risk_warning.png" /> 新增线索
            {{ data.riskNum }}条
            <a-icon type="caret-right" />
          </div>
        </div>
        <div class="warning-label">
          <div class="warning-label-item">
            <img src="@/assets/images/img/first_warning.png" /> 一级线索
            {{ data.firstNum }}条
            <a-icon type="caret-right" />
          </div>
        </div>
      </div>
      <div class="info-content-desc" v-if="isEnterprise">
        <div class="info-content-desc-content">
          <span class="desc-item" v-for="(item, index) in tags" :key="index">
            #{{ item }}
          </span>
        </div>
        <div class="desc-more">更多<a-icon type="double-right" /></div>
      </div>
      <div class="info-content-details">
        <div
          :class="pageType ? 'details-item' : 'details-item enterprise-item'"
          v-for="item in actualData"
          :key="item.label"
        >
          <span class="details-item-label">{{ item.label }}：</span>
          <span
            class="details-item-value"
            :style="{
              color:
                item.label === '法人代表' || item.label === '官网'
                  ? '#1890ff'
                  : '#949dad',
            }"
            >{{ item.value }}</span
          >
          <!-- <div v-if="item.label === '经营范围' && item.value" class="desc-more">
            更多<a-icon type="double-right" />
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import iconSeries from "@/assets/theme/iconSeries";
import {
  setCustomerIsAttention,
  setPersonalIsAttention,
  setStaffIsAttention,
} from "@/shared/api/user.js";
import { mapState } from "vuex";

export default {
  name: "EnterpriseInfo",
  props: ["data", "pageType", "loading"],
  components: {},
  data() {
    return {
      isEnterprise: true,
      iconPath: 0,
      iconTheme: JSON.parse(iconSeries.lightIcon),
      attention: this.data.isAttention ? false : true,
      tags: [
        "企业服务",
        "数据分析",
        "数据可视化",
        "数据处理",
        "物联网应用",
        "物联网",
        "知名FA",
        "工具",
        "审计",
      ],
      actualData: [],
    };
  },
  computed: {
    ...mapState("rightsOptions", ["userInfo"]),
    iconData: function () {
      if (this.isEnterprise) {
        return this.iconTheme[0].company[this.iconPath];
      } else {
        return this.iconTheme[0].person[this.iconPath];
      }
    },
  },
  mounted() {
    this.isEnterprise =
      this.pageType === "personInsight" || this.pageType === "employeeInsight"
        ? false
        : true;
    if (this.pageType === "personInsight") {
      this.actualData = [
        {
          label: "客户编号",
          value: this.data.code,
        },
        {
          label: "手机号",
          value: this.data.phoneNumber,
        },
        {
          label: "身份证号",
          value: this.data.idNum,
        },
        {
          label: "管户机构",
          value: this.data.manageOrg,
        },
        {
          label: "是否本行员工",
          value: this.data.isStaff ? "是" : "否",
        },
        {
          label: "是否黑名单个人",
          value: this.data.isOnBlackList ? "是" : "否",
        },
        {
          label: "客户等级",
          value: this.data.level,
        },
        {
          label: "是否高净值客户",
          value: this.data.isHighNetWorth ? "是" : "否",
        },
        {
          label: "投资风险承受等级",
          value: this.data.riskToleranceLevel,
        },
      ];
    } else if (this.pageType === "employeeInsight") {
      this.actualData = [
        {
          label: "员工编号",
          value: this.data.code,
        },
        {
          label: "员工职务",
          value: this.data.employeeTitle,
        },
        {
          label: "隶属机构",
          value: this.data.institution,
        },
        {
          label: "隶属部门",
          value: this.data.department,
        },
        {
          label: "联系电话",
          value: this.data.telephone,
        },
        {
          label: "证件号码",
          value: this.data.identity,
        },
        {
          label: "是否客户经理",
          value: this.data.isManager ? "是" : "否",
        },
        {
          label: "违规积分",
          value: this.data.violationPoints,
        },
        {
          label: "上年度考评结果",
          value: this.data.lastYearEvaluation,
        },
      ];
    } else {
      this.actualData = [
        {
          label: "法人代表",
          value: this.data.juridicalPerson,
        },
        {
          label: "统一社会信用代码",
          value: this.data.creditCode,
        },
        {
          label: "注册资本",
          value: this.data.regCapital,
        },
        {
          label: "公司类型",
          value: this.data.customerType,
        },
        {
          label: "官网",
          value: this.data.website,
        },
        {
          label: "营业期限",
          value: this.data.businessTerm,
        },
        {
          label: "登记机关",
          value: this.data.regOrgan,
        },
        {
          label: "地址",
          value:
            this.data.province === this.data.city
              ? this.data.province
              : this.data.province + this.data.city,
        },
        {
          label: "邮编",
          value: this.data.custOrgId,
        },
        {
          label: "经营范围",
          value: this.data.businessScope,
        },
      ];
    }
  },
  watch: {
    data(newValue) {
      this.data = newValue;
      if (this.pageType === "personInsight") {
        this.actualData = [
          {
            label: "客户编号",
            value: this.data.personId,
          },
          {
            label: "手机号",
            value: this.data.phoneNumber,
          },
          {
            label: "身份证号",
            value: this.data.code,
          },
          {
            label: "管户机构",
            value: this.data.manageOrg,
          },
          {
            label: "是否本行员工",
            value: this.data.isStaff ? "是" : "否",
          },
          {
            label: "是否黑名单个人",
            value: this.data.isOnBlackList ? "是" : "否",
          },
          {
            label: "客户等级",
            value: this.data.level,
          },
          {
            label: "是否高净值客户",
            value: this.data.isHighNetWorth ? "是" : "否",
          },
          {
            label: "投资风险承受等级",
            value: this.data.riskToleranceLevel,
          },
        ];
      } else if (this.pageType === "employeeInsight") {
        this.actualData = [
          {
            label: "员工编号",
            value: this.data.employeeId,
          },
          {
            label: "员工职务",
            value: this.data.employeeTitle,
          },
          {
            label: "隶属机构",
            value: this.data.institution,
          },
          {
            label: "隶属部门",
            value: this.data.department,
          },
          {
            label: "联系电话",
            value: this.data.telephone,
          },
          {
            label: "证件号码",
            value: this.data.identity,
          },
          {
            label: "是否客户经理",
            value: this.data.isManager ? "是" : "否",
          },
          {
            label: "违规积分",
            value: this.data.violationPoints,
          },
          {
            label: "上年度考评结果",
            value: this.data.lastYearEvaluation,
          },
        ];
      } else {
        this.actualData = [
          {
            label: "法人代表",
            value: this.data.juridicalPerson,
          },
          {
            label: "统一社会信用代码",
            value: this.data.creditCode,
          },
          {
            label: "注册资本",
            value: this.data.regCapital,
          },
          {
            label: "公司类型",
            value: this.data.customerType,
          },
          {
            label: "官网",
            value: this.data.website,
          },
          {
            label: "营业期限",
            value: this.data.businessTerm,
          },
          {
            label: "登记机关",
            value: this.data.regOrgan,
          },
          {
            label: "地址",
            value:
              this.data.province === this.data.city
                ? this.data.province
                : this.data.province + this.data.city,
          },
          {
            label: "邮编",
            value: this.data.custOrgId,
          },
          {
            label: "经营范围",
            value: this.data.businessScope,
          },
        ];
      }
    },
  },
  methods: {
    handleRefrash() {
      const json = {
        name: this.data.customerName,
        id: this.data.id,
      };
      this.$emit("handleSearch", json);
    },
    handleReturn() {
      this.$emit("handleReturn");
    },
    async isAttention() {
      this.attention = !this.attention;
      const json = {
        id: this.data.id,
        accountId: this.userInfo.userId,
        interest: this.attention ? 0 : 1,
      };
      let data = undefined;
      switch (this.pageType) {
        case "employeeInsight":
          data = await setStaffIsAttention(json);
          break;
        case "personInsight":
          data = await setPersonalIsAttention(json);
          break;
        default:
          data = await setCustomerIsAttention(json);
          break;
      }
      const text = this.attention ? "关注" : "取消关注";
      if (data.message === "成功") {
        this.$message.success(`${text}成功`);
      } else {
        this.$message.error(`${text}失败 ${data.message}`);
      }
    },
  },
};
</script>

<style scoped lang="less">
.enterprise-info {
  z-index: 10;
  background: #fff;
  display: grid;
  grid-template-columns: minmax(64px, 0.64fr) minmax(680px, 6.8fr);
  grid-template-rows: minmax(150px, 1fr);
  gap: 20px;
  padding: 20px;

  .info-image {
    width: 100%;
    height: 0;
    padding-bottom: 100%;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 16%);
    position: relative;

    img {
      width: 80%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .info-content {
    &-name {
      display: flex;
      height: 37px;
      position: relative;
      align-items: center;

      .name-text {
        font-size: 24px;
        font-weight: 600;
      }

      .name-tags {
        height: 25px;
        width: 55px;
        padding: 0 5px;
        text-align: center;
        line-height: 20px;
        margin-left: 20px;
        border-radius: 2px;
        background: #fff;
        color: rgb(157, 223, 173);
        border: 2px solid rgb(157, 223, 173);
      }

      .attention {
        height: 25px;
        width: 55px;
        color: #fff;
        cursor: pointer;
        margin-left: 20px;

        img {
          width: 16px;
          height: 16px;
        }
      }

      .name-update {
        right: 70px;
        width: 75px;
        height: 32px;
        color: #fff;
        display: flex;
        padding: 0 5px;
        cursor: pointer;
        border-radius: 2px;
        position: absolute;
        align-items: center;
        background: @activeFontColor;
        justify-content: center;
        border: 1px dashed rgb(165, 165, 167);

        .anticon-sync {
          margin-right: 5px;
        }
      }

      .name-return {
        right: 0;
        width: 60px;
        height: 32px;
        cursor: pointer;
        color: #606568;
        line-height: 32px;
        position: absolute;
        text-align: center;
        border: 1px dashed #eee;
      }
    }

    &-tags {
      display: flex;

      .name-label,
      .warning-label {
        height: 20px;
        padding: 0 8px;
        font-size: 12px;
        color: rgb(95, 179, 255);
        margin: 12px 6px 0 3px;
        border-radius: 2px;
        text-align: center;
        white-space: nowrap;
        display: inline-block;
        line-height: 1.5714285714;
        background-color: rgb(230, 247, 255);
        border: 1px solid rgb(198, 234, 255);

        &:first-child {
          margin-left: 0;
        }
      }

      .warning-label {
        color: rgb(255, 127, 130);
        background-color: rgb(255, 238, 242);
        border: 1px solid rgb(255, 201, 200);

        .warning-label-item {
          img {
            width: 14px;
            height: 14px;
          }
        }
      }
    }

    &-desc {
      display: flex;
      margin-top: 15px;
      flex-wrap: wrap;

      .desc-item {
        color: rgb(191, 191, 191);
      }
    }

    .desc-more {
      margin-left: 8px;
      cursor: pointer;
      color: @activeFontColor;
    }

    &-details {
      margin-top: 16px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
      grid-template-rows: repeat(2, 35px);

      .details-item {
        display: flex;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &-label {
          color: #606568;
        }

        &-value {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        // &.enterprise-item:last-child {
        //   grid-column-start: 1;
        //   grid-column-end: 4;
        // }
      }
    }
  }
}
</style>
