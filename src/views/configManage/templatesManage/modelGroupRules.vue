<template>
  <div
    ref="main"
    :class="[
      'model-rules-content-main',
      {
        'no-before': ruleList.length < 3,
        'no-after':
          !Array.isArray(ruleList.at(-1)) || ruleList.at(-1).length < 2,
      },
    ]"
  >
    <div v-for="(item, index) in ruleList" :key="item.id" class="rules-content">
      <div
        :class="
          ruleList.length < 3
            ? 'rules-content-header no-before'
            : 'rules-content-header'
        "
        v-if="Array.isArray(item)"
      >
        <a-icon type="folder" />
        <span class="header-tips">
          规则组
          <a-icon
            :type="ruleList[index].length > 1 ? 'caret-up' : 'caret-down'"
          />
        </span>
        <a-tooltip placement="top">
          <template slot="title">
            <span>新建规则</span>
          </template>
          <a-icon type="plus-square" v-if="disabled" class="disabled" />
          <a-icon
            type="plus-square"
            v-else
            @click="addRules('single', [...value, index])"
          />
        </a-tooltip>
        <a-tooltip placement="top">
          <template slot="title">
            <span>新建规则组</span>
          </template>
          <a-icon type="folder-add" v-if="disabled" class="disabled" />
          <a-icon
            type="folder-add"
            v-else
            @click="addRules('multi', [...value, index])"
          />
        </a-tooltip>
        <a-tooltip placement="top">
          <template slot="title">
            <span>删除当前规则组</span>
          </template>
          <a-icon type="delete" v-if="disabled" class="disabled" />
          <a-icon type="delete" v-else @click="deleteRule([...value, index])" />
        </a-tooltip>
        <a-tooltip placement="top">
          <template slot="title">
            <span>复制当前规则组到下一行</span>
          </template>
          <a-icon
            type="copy"
            v-if="ruleList[index].length > 1 && disabled"
            class="disabled"
          />
          <a-icon
            type="copy"
            v-else-if="ruleList[index].length > 1 && !disabled"
            @click="copyRule([...value, index])"
          />
        </a-tooltip>
      </div>
      <model-group-rules
        v-if="Array.isArray(item)"
        :list="ruleList[index]"
        :originList="originList"
        :value="[...value, index]"
        :floor="floor + 1"
        :variableList="variableList"
        :schemaData="schemaData"
        :conditionOptions="conditionOptions"
        :funcList="funcList"
        :disabled="disabled"
      />
      <div
        v-else-if="item.types === 'single'"
        :class="ruleList.length < 3 ? 'rules-single no-before' : 'rules-single'"
      >
        <model-single-rule
          :list="ruleList[index]"
          :funcList="funcList"
          :conditionOptions="conditionOptions"
          :originList="originList"
          :value="[...value, index]"
          :variableList="variableList"
          :schemaData="schemaData"
          :disabled="disabled"
          @listChange="listChange"
          @deleteRule="deleteRule"
          @copyRule="copyRule"
          @resetRule="resetRule"
        />
      </div>
      <div
        v-else-if="disabled"
        :class="[
          'and-or',
          floor === 0 ? 'first' : '',
          disabled ? 'disabled' : '',
        ]"
        :style="{ display: ruleList.length > 2 ? 'block' : 'none' }"
      >
        {{ ruleList[index].relations }}
      </div>
      <div
        v-else
        :class="floor === 0 ? 'and-or first' : 'and-or'"
        :style="{ display: ruleList.length > 2 ? 'block' : 'none' }"
        @click="onRelationChange([...value, index])"
      >
        {{ ruleList[index].relations }}
      </div>
    </div>
  </div>
</template>
<script>
import ModelSingleRule from "./modelSingleRule";
import { Tooltip } from "ant-design-vue";
import { nanoid } from "nanoid";
import { cloneDeep } from "lodash";

export default {
  name: "ModelGroupRules",
  props: [
    "list",
    "originList",
    "value",
    "floor",
    "conditionOptions",
    "funcList",
    "schemaData",
    "variableList",
    "disabled",
  ],
  data() {
    return {
      ruleList: this.list,
    };
  },
  mounted() {},
  watch: {
    list() {
      this.ruleList = this.list;
    },
  },
  components: {
    ATooltip: Tooltip,
    ModelSingleRule,
  },
  methods: {
    addRules(type, key) {
      const rulesArr = this.originList;
      const resultRulesArr = this.updateRulesGroup(key, rulesArr);
      if (type === "single") {
        const singleItem = {
          id: nanoid(),
          conditionList: [],
          isParam: false,
          propertyNum: 0,
          types: "single",
        };
        resultRulesArr.push(singleItem);
      } else {
        resultRulesArr.push([
          {
            id: nanoid(),
            types: "relations",
            relations: "且",
          },
        ]);
      }
      this.ruleList = rulesArr;
    },
    updateRulesGroup(key, rulesArr) {
      if (key.length) {
        let resultArr = rulesArr[key[0]];
        if (key.length > 1) {
          key.map((num, index) => {
            if (index > 0) {
              resultArr = resultArr[num];
            }
          });
        }
        return resultArr;
      } else {
        return rulesArr;
      }
    },
    deleteRule(key) {
      let parentArr = this.originList;
      if (key.length > 1) {
        key.map((num, index) => {
          if (index < key.length - 2) {
            parentArr = parentArr[num];
          }
        });
        if (key.at(-1) === parentArr.at(-2).length - 1) {
          // 删除规则组
          parentArr.splice(key.at(-2), 1);
        } else {
          // 删除单个规则
          parentArr[key.at(-2)].splice(key.at(-1), 1);
        }
      } else {
        parentArr.splice(key[0], 1);
      }
    },
    onRelationChange(key) {
      let parentArr = this.originList;
      if (key.length > 1) {
        key.map((num, index) => {
          if (index < key.length - 1) {
            parentArr = parentArr[num];
          }
        });
      }
      if (parentArr[0].relations === "且") {
        parentArr[0].relations = "或";
      } else {
        parentArr[0].relations = "且";
      }
      this.ruleList = parentArr;
    },
    getArrChildNum(arr, num, floor) {
      arr.map((item, index) => {
        if (floor > 0) {
          if (Array.isArray(item)) {
            num = this.getArrChildNum(item, num, floor + 1);
          } else {
            num = num + 1;
          }
        } else {
          if (index > 0) {
            if (Array.isArray(item)) {
              num = this.getArrChildNum(item, num, floor + 1);
            } else {
              num = num + 1;
            }
          }
        }
      });
      return num;
    },
    listChange(list, value, isParam) {
      let parentArr = this.originList;
      if (isParam) {
        value.map((num, index) => {
          if (index < value.length - 1) {
            if (Array.isArray(parentArr[num])) {
              // 规则组
              parentArr = parentArr[num];
            } else if (parentArr[num].type === 4) {
              // 函数
              parentArr = parentArr[num].value.funcValue;
            } else {
              parentArr = parentArr[num].conditionList;
            }
          }
        });
        parentArr.splice(value.at(-1), 1, list);
      } else {
        if (value.length > 1) {
          value.map((num, index) => {
            if (index < value.length - 2) {
              parentArr = parentArr[num];
            }
          });
          parentArr[value.at(-2)].splice(value.at(-1), 1, list);
        } else {
          parentArr.splice(value[0], 1, list);
        }
      }
    },
    resetRule(key, isParam) {
      // tips：使用splice会使数据响应式更新
      let parentArr = this.originList;
      if (isParam) {
        key.map((num, index) => {
          if (index < key.length - 2) {
            if (Array.isArray(parentArr)) {
              // 重置函数本身
              parentArr = parentArr[num];
            } else {
              parentArr = parentArr.conditionList[num].value.funcValue;
            }
          }
        });
        parentArr.splice(key.at(-2), 1, {
          id: nanoid(),
          conditionList: [],
          isParam: true,
          propertyNum: 0,
          types: "single",
        });
      } else {
        key.map((num, index) => {
          if (index < key.length - 2) {
            parentArr = parentArr[num];
          }
        });
        parentArr.splice(key.at(-2), 1, {
          id: nanoid(),
          conditionList: [],
          isParam: false,
          propertyNum: 0,
          types: "single",
        });
      }
    },
    copyRule(key) {
      let parentArr = this.originList;
      let target = null;
      if (key.length > 1) {
        key.map((num, index) => {
          if (index < key.length - 2) {
            parentArr = parentArr[num];
          }
        });
        if (key.at(-1) === parentArr.at(-2).length - 1) {
          // 复制规则组
          target = cloneDeep(parentArr[key.at(-2)]);
          parentArr.splice(key.at(-2), 0, target);
        } else {
          // 复制单个规则
          target = cloneDeep(parentArr[key.at(-2)][key.at(-1)]);
          if (!Array.isArray(target)) {
            target.id = nanoid();
          }
          parentArr[key.at(-2)].splice(key.at(-1), 0, target);
        }
      } else {
        target = cloneDeep(parentArr[key[0]]);
        if (!Array.isArray(target)) {
          target.id = nanoid();
        }
        parentArr.splice(key[0], 0, target);
      }
    },
  },
};
</script>
<style lang="less">
.model-rules-content-main {
  padding: 0 35px;
  position: relative;
  margin-bottom: 14px;

  &::before {
    left: 21px;
    top: 26px;
    content: "";
    position: absolute;
    height: calc(100% - 51px);
    border-left: 1px solid #d9d9d9;
  }

  &::after {
    left: 21px;
    top: calc(100% - 26px);
    content: "";
    position: absolute;
    width: 35px;
    height: 14px;
    border-top: 1px solid #d9d9d9;
  }

  &.no-before {
    &::before {
      height: 0;
    }
    &::after {
      width: 0;
    }
  }

  &.no-after {
    &::after {
      width: 0;
    }
  }

  &:first-child::before {
    left: 21px;
  }

  .rules-single {
    display: flex;
    align-items: center;
    padding-top: 10px;
    padding-left: 10px;
    position: relative;

    &::before {
      top: 26px;
      content: "";
      left: -14px;
      width: 24px;
      height: 14px;
      position: absolute;
      border-top: 1px solid #d9d9d9;
    }

    &.no-before {
      &::before {
        width: 0;
      }
    }

    .anticon-delete,
    .anticon-sync {
      color: @activeFontColor;
      font-size: 16px;
      margin-left: 10px;
    }

    .disabled {
      cursor: not-allowed;
      color: @disabledColor;
    }
  }

  .rules-content-header {
    display: flex;
    padding: 14px 0;
    align-items: center;
    padding-left: 10px;
    position: relative;
    height: 52px;

    &::before {
      top: 26px;
      content: "";
      left: -13px;
      width: 22px;
      height: 14px;
      position: absolute;
      border-top: 1px solid #d9d9d9;
    }

    &.no-before {
      &::before {
        width: 0;
      }
    }

    .anticon-folder {
      font-size: 18px;
      color: #949dad;
    }

    .header-tips {
      color: #949dad;
      padding: 0 10px;
      font-size: 16px;
      user-select: none;
    }

    .anticon-plus-square,
    .anticon-delete,
    .anticon-copy {
      color: @activeFontColor;
      font-size: 18px;
      padding: 0 5px;
    }

    .anticon-folder-add {
      color: @activeFontColor;
      font-size: 21px;
      padding: 0 5px;
    }

    .disabled {
      cursor: not-allowed;
      color: @disabledColor;
    }
  }

  .and-or {
    top: 50%;
    width: 20px;
    z-index: 99;
    left: 12px;
    height: 20px;
    cursor: pointer;
    font-size: 10px;
    line-height: 18px;
    border-radius: 50%;
    background: #fff;
    position: absolute;
    text-align: center;
    border: 1px solid #549be7;
    transform: translateY(-50%);
    transition: all 0.1s;
    user-select: none;

    &.disabled {
      cursor: not-allowed;
      color: @disabledColor;
    }
  }
}
</style>
