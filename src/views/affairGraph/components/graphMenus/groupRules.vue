<template>
  <div
    ref="main"
    :class="
      Array.isArray(ruleList[ruleList.length - 1]) &&
      ruleList[ruleList.length - 1].length > 1
        ? 'rules-content-main short'
        : 'rules-content-main'
    "
    :style="{
      '--mainHeight': domHeight + 'px',
      '--mainTop': domHeight / 2 + 26 + 'px',
    }"
  >
    <div v-for="(item, index) in ruleList" :key="item.id">
      <div
        v-if="Array.isArray(item)"
        :class="
          ruleList.length < 3
            ? 'rules-content-header no-before'
            : 'rules-content-header'
        "
      >
        <a-icon type="folder" />
        <span class="header-tips">
          规则组
          <a-icon
            :type="ruleList[index].length > 1 ? 'caret-up' : 'caret-down'"
          />
        </span>
        <a-icon
          type="plus-square"
          @click="addRules('single', [...value, index])"
        />
        <a-icon
          type="folder-add"
          @click="addRules('multi', [...value, index])"
        />
        <a-icon type="delete" @click="deleteRule([...value, index])" />
      </div>
      <group-rules
        v-if="Array.isArray(item)"
        :list="ruleList[index]"
        :originList="originList"
        :value="[...value, index]"
        :floor="floor + 1"
        :rulesOptions="rulesOptions"
        :conditionOptions="conditionOptions"
        @onAttributeChange="onAttributeChange"
      />
      <div
        v-else-if="item.types === 'single'"
        :class="ruleList.length < 3 ? 'rules-single no-before' : 'rules-single'"
      >
        <a-icon type="file" />
        <a-select
          show-search
          filter-option
          placeholder="请选择"
          :value="ruleList[index].attribute"
          :options="rulesOptions"
          class="rule-options"
          @change="
            (e) => {
              onAttributeChange('attribute', [...value, index], e);
            }
          "
        />
        <a-select
          placeholder="请选择"
          :value="ruleList[index].condition"
          :options="conditionOptions"
          class="condition-options"
          @change="
            (e) => {
              onAttributeChange('condition', [...value, index], e);
            }
          "
        />
        <a-input
          type="text"
          placeholder="请输入"
          class="rules-single-input"
          v-model="ruleList[index].value"
          @change="
            (e) => {
              onAttributeChange(
                'value',
                [...value, index],
                e.currentTarget.value
              );
            }
          "
        />
        <a-icon type="delete" @click="deleteRule([...value, index])" />
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
import { Input } from "ant-design-vue";
import { cloneDeep } from "lodash";
import { nanoid } from "nanoid";

export default {
  name: "GroupRules",
  props: [
    "list",
    "originList",
    "value",
    "floor",
    "rulesOptions",
    "conditionOptions",
  ],
  data() {
    return {
      ruleList: cloneDeep(this.list),
      domHeight: 0,
    };
  },
  mounted() {
    this.domHeight = this.$refs.main.offsetHeight;
  },
  watch: {
    list() {
      this.ruleList = cloneDeep(this.list);
    },
    ruleList() {
      setTimeout(() => {
        const height = this.$refs.main.offsetHeight;
        let targetArr = [];
        let lastHeight = 0;
        if (
          Array.isArray(this.ruleList[this.ruleList.length - 1]) &&
          this.ruleList[this.ruleList.length - 1].length > 1
        ) {
          targetArr = this.ruleList[this.ruleList.length - 1];
          lastHeight = this.getArrChildNum(targetArr, 0, 0);
        }
        this.domHeight = height - (lastHeight + 1) * 52;
      }, 50);
    },
  },
  components: {
    AInput: Input,
  },
  methods: {
    addRules(type, key) {
      const rulesArr = this.originList;
      const resultRulesArr = this.updateRulesGroup(key, rulesArr);
      if (type === "single") {
        const singleItem = {
          id: nanoid(),
          attribute: undefined,
          attributeControl: "value",
          attributeType: "string",
          condition: undefined,
          isFunction: false,
          types: "single",
          value: undefined,
        };
        resultRulesArr.push(singleItem);
      } else {
        resultRulesArr.push([
          {
            id: nanoid(),
            types: "relations",
            relations: "且",
            label: this.ruleList[0].label,
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
          if (index < key.length - 1) {
            parentArr = parentArr[num];
          }
        });
      }
      parentArr.splice(key[key.length - 1], 1);
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
      this.$emit("onAttributeChange", "relations", key, parentArr[0].relations);
    },
    onAttributeChange(type, key, value) {
      this.$emit("onAttributeChange", type, key, value);
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
  },
};
</script>
<style lang="less">
.rules-content-main {
  padding: 0 10px;
  position: relative;

  &:not(:first-child) {
    padding: 0 35px;
  }

  &::before {
    top: 26px;
    content: "";
    position: absolute;
    height: calc(100% - 52px);
    border-left: 1px solid #d9d9d9;
  }

  &.short {
    .and-or {
      top: calc(var(--mainTop));
    }

    &::before {
      height: var(--mainHeight);
    }
  }

  &:first-child::before {
    left: -4px;
  }

  &:not(:first-child)::before {
    left: 21px;
  }

  .rules-single {
    width: 530px;
    display: flex;
    padding: 10px 0;
    align-items: center;
    padding-left: 10px;
    position: relative;

    &::before {
      top: 25px;
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

    .anticon-file {
      font-size: 16px;
      color: #949dad;
    }

    .rule-options {
      width: 160px;
      margin: 0 5px;
    }

    .condition-options {
      width: 120px;
      margin: 0 5px;
    }

    .rules-single-input {
      width: 160px;
      margin: 0 5px;
    }

    .anticon-delete {
      color: @activeFontColor;
      font-size: 16px;
      margin-left: 10px;
    }
  }

  .rules-content-header {
    display: flex;
    padding: 14px 0;
    align-items: center;
    padding-left: 10px;
    position: relative;

    &::before {
      top: 25px;
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
    }

    .anticon-plus-square,
    .anticon-delete {
      color: @activeFontColor;
      font-size: 18px;
      padding: 0 5px;
    }

    .anticon-folder-add {
      color: @activeFontColor;
      font-size: 21px;
      padding: 0 5px;
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

    &.first {
      left: -14px;
    }
  }
}
</style>
