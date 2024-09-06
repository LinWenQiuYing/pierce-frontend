<template>
  <div class="risk-check-option">
    <div class="risk-check-option-item">
      <span class="risk-check-option-item-label">规则分类：</span>
      <a-cascader
        v-model="category"
        :options="categoryList"
        placeholder="请选择规则分类"
        class="risk-check-option-item-input"
      />
    </div>
    <div class="risk-check-option-item">
      <span class="risk-check-option-item-label">规则名称：</span>
      <a-input
        type="text"
        v-model.trim="ruleName"
        placeholder="请输入规则名称"
        class="risk-check-option-item-input"
      />
    </div>
    <div class="risk-check-option-item">
      <a-button class="risk-check-option-item-btn" @click="reset">
        <a-icon type="redo" :rotate="-90" /> 重置
      </a-button>
      <a-button
        class="risk-check-option-item-btn"
        type="primary"
        @click="getRuleList"
        :icon="buttonIcon"
      >
        搜索
      </a-button>
    </div>
    <div class="risk-check-option-item">
      <span class="risk-check-option-item-label">规则选择：</span>
      <a-select
        class="risk-check-option-item-input"
        v-model="option.ruleValue"
        @change="handleChangeRuleValue"
        placeholder="请选择规则"
      >
        <a-select-option
          v-for="item in ruleList"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </a-select-option>
      </a-select>
    </div>
    <!-- <div class="risk-check-option-item">
      <div class="risk-check-option-item-delete" @click="deleteOption">
        <a-icon type="delete" />删除
      </div>
    </div> -->
  </div>
</template>
<script>
import { Button, Cascader, Input } from "ant-design-vue";
import { getCategoryList, searchRuleList } from "@/shared/api/configManage.js";
import { find } from "lodash";
import { mapState } from "vuex";

export default {
  name: "RiskCheckOption",
  props: ["option"],
  data() {
    return {
      category: undefined,
      ruleName: "",
      categoryList: [],
      ruleList: [],
      buttonIcon: "search",
    };
  },
  components: {
    AButton: Button,
    ACascader: Cascader,
    AInput: Input,
  },
  computed: {
    ...mapState("rightsOptions", ["userInfo"]),
  },
  mounted() {
    this.getCategoryList();
    this.getRuleList();
  },
  methods: {
    reset() {
      this.category = undefined;
      this.ruleName = "";
      this.getRuleList();
    },
    async getCategoryList() {
      const listData = await getCategoryList(0);
      if (!listData) {
        this.$message.error("获取规则分类失败");
      } else {
        const categoryList = [];
        listData.map((item) => {
          let children = [];
          if (item.children.length) {
            item.children.map((child) => {
              children.push({
                label: child.categoryName,
                value: child.id,
                children: child.children.length ? child.children : [],
              });
            });
          }
          categoryList.push({
            label: item.categoryName,
            value: item.id,
            children: children.length ? children : [],
          });
        });
        this.categoryList = categoryList;
      }
    },
    async getRuleList() {
      this.buttonIcon = "loading";
      const json = {
        currentUser: this.userInfo.userId,
        pageNo: 1,
        pageSize: 1000,
        categoryId: this.category ? this.category.at(-1) : null,
        warningRuleName: this.ruleName,
      };
      const data = await searchRuleList(json);
      if (!data) {
        this.$message.error("获取规则列表失败");
      } else {
        const ruleList = [];
        data.dateList.map((item) => {
          ruleList.push({
            category: item.ruleCategory,
            label: item.ruleName,
            value: item.id,
          });
        });
        this.ruleList = ruleList;
      }
      this.handleChangeRuleValue(undefined);
      this.buttonIcon = "search";
    },
    // deleteOption() {
    //   this.$emit("riskOptionsChange", this.option.id);
    // },
    handleChangeRuleValue(value) {
      const target = find(this.ruleList, (v) => v.value === value);
      const label = (target && target.label) || "";
      this.$emit("ruleValueChange", this.option.id, value, label);
    },
  },
};
</script>
<style lang="less">
.risk-check-option {
  padding: 16px 10px;
  background: #fafafa;
  margin-bottom: 16px;

  &-item {
    overflow: hidden;

    &:not(:last-child) {
      margin-bottom: 16px;
    }

    &-label {
      width: 75px;
      color: #93979f;
      display: inline-block;
    }

    &-btn {
      margin-left: 16px;
      float: right;

      .ant-btn-dashed {
        color: #93979f;
      }
    }

    &-input {
      width: calc(100% - 75px);
    }

    &-delete {
      float: right;
      display: flex;
      cursor: pointer;
      color: #d9d9d9;
      align-items: center;

      .anticon-delete {
        margin-right: 5px;
      }
    }
  }
}
</style>
