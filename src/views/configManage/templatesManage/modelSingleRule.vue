<template>
  <div
    :class="
      isFold
        ? 'model-rule-content-main close'
        : currentFuncValue.length
        ? 'model-rule-content-main open'
        : 'model-rule-content-main'
    "
    :style="{
      '--funcIndex': funcIndex * 138 + 22 + timeIndex * 65 + 'px',
    }"
  >
    <div class="model-single-rule">
      <div
        class="model-single-rule-item"
        v-for="(item, index) in ruleList.conditionList"
        :key="item.id"
        :ref="`func${index}`"
        @mouseenter="onMouse(index, 'enter')"
        @mouseleave="onMouse(index, 'leave')"
      >
        <a-select
          allow-clear
          v-if="item.type === 1"
          class="single-rule-input"
          :options="conditionOptions"
          :value="item.value"
          placeholder="请选择运算符"
          @change="
            (e) => {
              onAttributeChange(index, e, item.type);
            }
          "
          :disabled="disabled"
        />
        <a-input-number
          v-if="item.type === 2 && item.inputType === 'ValueInteger'"
          class="single-rule-input"
          :value="item.value"
          placeholder="请输入值"
          :precision="0"
          @change="
            (e) => {
              onAttributeChange(index, e, item.type, 'int');
            }
          "
          :disabled="disabled"
        />
        <a-input-number
          v-if="item.type === 2 && item.inputType === 'ValueDouble'"
          class="single-rule-input"
          :value="item.value"
          placeholder="请输入值"
          @change="
            (e) => {
              onAttributeChange(index, e, item.type, 'double');
            }
          "
          :disabled="disabled"
        />
        <a-input
          type="text"
          v-if="item.type === 2 && item.inputType === 'ValueString'"
          class="single-rule-input"
          :value="item.value"
          placeholder="请输入值"
          @change="
            (e) => {
              onAttributeChange(index, e.currentTarget.value, item.type);
            }
          "
          :disabled="disabled"
        />
        <a-date-picker
          v-if="item.type === 2 && item.inputType === 'ValueTime'"
          :value="getTime(item.value)"
          show-time
          class="single-rule-input"
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择值"
          @change="
            (e) => {
              onAttributeChange(index, e, item.type);
            }
          "
          :disabled="disabled"
        />
        <a-select
          allow-clear
          v-if="item.type === 3"
          class="single-rule-input"
          :value="item.objValue"
          placeholder="请选择变量"
          @change="
            (e) => {
              onAttributeChange(index, e, item.type, 'obj');
            }
          "
          :disabled="disabled"
        >
          <a-select-option
            v-for="item in variableList"
            :key="item.name"
            :value="item.name"
            :title="item.name"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
        <a-auto-complete
          allow-clear
          backfill
          filterOption
          v-if="item.type === 3"
          class="single-rule-input"
          :value="item.value"
          placeholder="请选择属性"
          @change="
            (e) => {
              onAttributeChange(index, e, item.type, 'value');
            }
          "
          :disabled="disabled"
        >
          <template slot="dataSource">
            <a-select-option
              v-for="item in item.rulesOptions"
              :key="item.value"
              :value="item.value"
              :title="item.label"
              >{{ item.label }}</a-select-option
            >
          </template>
        </a-auto-complete>
        <a-auto-complete
          allow-clear
          backfill
          filterOption
          v-if="item.type === 4"
          class="single-rule-input"
          :value="item.value.funcName"
          placeholder="请选择函数"
          @change="
            (e) => {
              onAttributeChange(index, e, item.type);
            }
          "
          :disabled="disabled"
        >
          <template slot="dataSource">
            <a-select-option
              v-for="item in funcList"
              :key="item.value"
              :value="item.value"
              :title="item.label"
              >{{ item.label }}</a-select-option
            >
          </template>
        </a-auto-complete>
        <div
          v-if="item.type === 4 && item.value.funcName"
          class="single-rule-icon"
        >
          <a-icon
            :type="item.value.funcIcon"
            v-if="disabled"
            class="disabled"
          />
          <a-icon
            v-else
            :type="item.value.funcIcon"
            @click="handleChangeFuncFold(index)"
          />
        </div>
        <a-icon
          v-if="item.isHover && !disabled"
          @click="handleDeleteCondition(index)"
          class="model-single-rule-item-close"
          type="close-circle"
        />
      </div>
      <a-cascader
        allow-clear
        v-model="typeValue"
        :options="typeOptions"
        placeholder="语句类型"
        class="type-options"
        @change="handleSelectType"
        :disabled="disabled"
      />
      <a-tooltip placement="top">
        <template slot="title">
          <span>删除当前条件</span>
        </template>
        <a-icon
          v-if="!ruleList.isParam && !disabled"
          type="delete"
          @click="deleteRule([...value])"
        />
        <a-icon
          v-else-if="!ruleList.isParam && disabled"
          type="delete"
          class="disabled"
        />
      </a-tooltip>
      <a-tooltip placement="top">
        <template slot="title">
          <span>重置当前条件</span>
        </template>
        <a-icon
          type="sync"
          @click="
            resetRule(
              [...value, funcIndex - ruleList.propertyNum],
              ruleList.isParam
            )
          "
          v-if="ruleList.conditionList.length && !disabled"
        />
        <a-icon
          type="sync"
          v-else-if="ruleList.conditionList.length && disabled"
          class="disabled"
        />
      </a-tooltip>
      <a-tooltip placement="top">
        <template slot="title">
          <span>复制当前条件到下一行</span>
        </template>
        <a-icon
          type="copy"
          v-if="ruleList.conditionList.length && !ruleList.isParam && !disabled"
          @click="copyRule([...value])"
        />
        <a-icon
          type="copy"
          v-else-if="
            ruleList.conditionList.length && !ruleList.isParam && disabled
          "
          class="disabled"
        />
      </a-tooltip>
    </div>
    <div
      :class="
        isFold
          ? 'function-box close'
          : currentFuncValue.length
          ? 'function-box open'
          : 'function-box'
      "
    >
      <div
        class="single-rule-function"
        v-for="(param, index) in currentFuncValue"
        :key="param.id"
      >
        <div
          class="single-rule-function-item"
          v-if="param.types === 'single'"
          :style="{ left: funcIndex * 138 + timeIndex * 65 + 'px' }"
        >
          <keep-alive>
            <model-single-rule
              :list="param"
              :funcList="funcList"
              :conditionOptions="conditionOptions"
              :value="[...value, funcIndex - ruleList.propertyNum, index]"
              :originList="originList"
              :variableList="variableList"
              :schemaData="schemaData"
              @deleteRule="deleteRule"
              @resetRule="resetRule"
              @listChange="listChange"
              @onAttributeChange="onAttributeChange"
            />
          </keep-alive>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  AutoComplete,
  Cascader,
  DatePicker,
  Input,
  InputNumber,
  Tooltip,
} from "ant-design-vue";
import { nanoid } from "nanoid";
import { find, findIndex } from "lodash";
import moment from "moment";

export default {
  name: "ModelSingleRule",
  props: [
    "list",
    "value",
    "funcList",
    "conditionOptions",
    "originList",
    "schemaData",
    "variableList",
    "disabled",
  ],
  data() {
    return {
      ruleList: this.list,
      typeValue: undefined,
      typeOptions: [
        {
          label: "属性",
          value: 3,
        },
        {
          label: "函数",
          value: 4,
        },
        {
          label: "运算符",
          value: 1,
        },
        {
          label: "值",
          value: 2,
          children: [
            {
              value: "ValueInteger",
              label: "整数",
            },
            {
              value: "ValueDouble",
              label: "浮点数",
            },
            {
              value: "ValueString",
              label: "字符串",
            },
            {
              value: "ValueTime",
              label: "时间",
            },
          ],
        },
      ],
      currentFuncValue: [],
      funcIndex: 0,
      timeIndex: 0,
      isFold: false,
      currentFuncIndex: undefined,
    };
  },
  components: {
    AAutoComplete: AutoComplete,
    ACascader: Cascader,
    ADatePicker: DatePicker,
    AInput: Input,
    AInputNumber: InputNumber,
    ATooltip: Tooltip,
  },
  mounted() {
    for (let i = 0; i < this.ruleList.conditionList.length; i++) {
      const element = this.ruleList.conditionList[i];
      if (element.type === 4) {
        const funcIcon = element.value.funcIcon;
        if (funcIcon === "down-circle") {
          const currentFuncValue = element.value.funcValue;
          this.handleSet(currentFuncValue, i);
          break;
        }
      }
    }
  },
  watch: {
    list() {
      this.ruleList = this.list;
    },
  },
  methods: {
    handleSelectType(value) {
      this.typeValue = value;
      if (value.length) {
        let singleRule = {
          id: nanoid(),
          type: value[0],
          value: undefined,
          isHover: false,
        };
        if (value[0] === 4) {
          singleRule.value = {
            funcName: undefined,
            funcValue: [],
            funcIcon: "up-circle",
          };
        } else if (value[0] === 3) {
          singleRule.objValue = undefined;
          singleRule.rulesOptions = [];
          this.ruleList.propertyNum++;
        } else if (value[0] === 2) {
          if (value[1]) {
            singleRule.inputType = value[1];
          } else {
            return false;
          }
        }
        this.ruleList.conditionList.push(singleRule);
        this.listChange(this.ruleList, this.value, this.ruleList.isParam);
      }
    },
    onAttributeChange(index, value, type, obj) {
      let paramsNum = 1;
      switch (type) {
        case 2:
          // 常量
          if (obj === "int") {
            // 整数
            if (/^-?\d+$/.test(value) || value === "-") {
              this.ruleList.conditionList[index].value = value;
            } else {
              this.ruleList.conditionList[index].value = 0;
            }
          } else if (obj === "double") {
            // 浮点数
            if (
              /^(([^0][0-9]+|0)\.([0-9]{1,2}))$/.test(value) ||
              /^-?\d+$/.test(value) ||
              value === "-" ||
              String(value).indexOf(".") !== -1
            ) {
              // 小数或整数，则保留两位小数 || 刚输入-号或者含有小数点
              this.ruleList.conditionList[index].value = value;
            } else {
              this.ruleList.conditionList[index].value = 0.0;
            }
          } else {
            this.ruleList.conditionList[index].value = value;
          }
          break;
        case 3:
          // 属性
          if (obj === "obj") {
            // 属性的对象， 即变量
            this.ruleList.conditionList[index].objValue = value;

            // 动态生成变量对应的属性选项
            let targetList = [];
            let propertyList = [];
            const rulesOptions = [];
            this.ruleList.conditionList[index].value = undefined;
            if (value) {
              if (value.indexOf("E") === -1) {
                // 点
                targetList = this.schemaData.vertexMetas;
              } else {
                // 边
                targetList = this.schemaData.edgeMetas;
              }

              const targetLabels = find(
                this.variableList,
                (ele) => ele.name === value
              ).label;

              targetLabels.map((targetLabel) => {
                const property = find(
                  targetList,
                  (ele) => ele.label === targetLabel.label
                ).property;
                propertyList = [...propertyList, ...property];
              });
              propertyList.map((prop) => {
                const item = {
                  label: prop,
                  value: prop,
                };
                const index = findIndex(
                  rulesOptions,
                  (o) => o.value === item.value
                );
                if (index === -1) {
                  rulesOptions.push(item);
                }
              });
              this.ruleList.conditionList[index].rulesOptions = rulesOptions;
            }
          } else {
            // 属性本身的值
            this.ruleList.conditionList[index].value = value;
          }
          break;
        case 4:
          // 函数
          if (value) {
            this.ruleList.conditionList[index].value.funcName = value;
            const obj = find(this.funcList, (v) => v.value === value);
            if (obj) {
              paramsNum = find(
                this.funcList,
                (ele) => ele.value === value
              ).paramsNum;
              paramsNum = parseInt(paramsNum);
              this.ruleList.conditionList[index].value.funcValue = [];
              for (let i = 0; i < paramsNum; i++) {
                this.ruleList.conditionList[index].value.funcValue.push({
                  id: nanoid(),
                  conditionList: [],
                  isParam: true,
                  types: "single",
                  propertyNum: 0,
                });
              }
              this.handleChangeFuncFold(index, "unfold");
            } else {
              this.handleChangeFuncFold(index, "fold");
            }
          } else {
            this.ruleList.conditionList[index].value.funcName = undefined;
            this.handleChangeFuncFold(index, "fold");
          }
          break;

        default:
          this.ruleList.conditionList[index].value = value;
          break;
      }
      this.listChange(this.ruleList, this.value, this.ruleList.isParam);
    },
    listChange(list, value, isParam) {
      this.$emit("listChange", list, value, isParam);
    },
    deleteRule(key) {
      this.$emit("deleteRule", key);
    },
    resetRule(key, isParam) {
      this.$emit("resetRule", key, isParam);
    },
    handleChangeFuncFold(index, type) {
      let funcIcon = this.ruleList.conditionList[index].value.funcIcon;
      let currentFuncValue = [];
      if (type) {
        if (type === "unfold") {
          this.isFold = false;
          funcIcon = "down-circle";
          currentFuncValue = this.ruleList.conditionList[index].value.funcValue;
        } else {
          this.isFold = true;
          funcIcon = "up-circle";
        }
      } else {
        if (funcIcon === "up-circle") {
          this.isFold = false;
          funcIcon = "down-circle";
          currentFuncValue = this.ruleList.conditionList[index].value.funcValue;
        } else {
          this.isFold = true;
          funcIcon = "up-circle";
        }
      }
      this.ruleList.conditionList[index].value.funcIcon = funcIcon;
      if (this.isFold) {
        setTimeout(() => {
          this.handleSet(currentFuncValue, index);
        }, 300);
      } else {
        this.handleSet(currentFuncValue, index);
      }
    },
    handleFoldParam(index, list) {
      list.conditionList.map((item, num) => {
        if (item.type === 4 && num !== index) {
          item.value.funcIcon = "up-circle";
        }

        if (item.type === 4 && item.value.funcValue.length) {
          // 递归改变funcIcon
          item.value.funcValue.map((cell) => {
            this.handleFoldParam(undefined, cell);
          });
        }
      });
    },
    handleSet(currentFuncValue, index) {
      this.currentFuncIndex = index;
      this.currentFuncValue = currentFuncValue;
      this.handleFoldParam(index, this.ruleList);
      let timeIndex = 0;
      let propertyNum = 0;
      this.ruleList.conditionList.map((item, num) => {
        if (num < index) {
          if (item.type === 2 && item.inputType === "ValueTime") {
            timeIndex++;
          } else if (item.type === 3) {
            propertyNum++;
          }
        }
      });
      this.timeIndex = timeIndex;
      this.funcIndex = index + propertyNum;
    },
    onMouse(index, type) {
      this.ruleList.conditionList.map((condition, num) => {
        if (type === "enter") {
          if (num === index) {
            condition.isHover = true;
          } else {
            condition.isHover = false;
          }
        } else {
          condition.isHover = false;
        }
      });
    },
    handleDeleteCondition(index) {
      const type = this.ruleList.conditionList[index].type; // condition的type: 1-运算符、2-常量值、3-属性 4-函数
      if (index < this.currentFuncIndex) {
        switch (type) {
          case 2:
            // 常量值
            if (this.ruleList.conditionList[index].inputType === "ValueTime") {
              // 时间常量
              this.timeIndex -= 1;
            }
            this.funcIndex -= 1;
            break;
          case 3:
            // 属性
            this.funcIndex -= 2;
            break;

          default:
            this.funcIndex -= 1;
            this.currentFuncIndex -= 1;
            break;
        }
      } else if (this.currentFuncIndex === index) {
        this.currentFuncValue = [];
      }
      this.ruleList.conditionList.splice(index, 1);
    },
    copyRule(key) {
      this.$emit("copyRule", key);
    },
    getTime(value) {
      return moment(value);
    },
  },
};
</script>
<style lang="less">
.model-rule-content-main {
  position: relative;

  &::before {
    top: 38px;
    left: var(--funcIndex);
    content: "";
    position: absolute;
    height: calc(100% - 64px);
    border-left: 1px solid #d9d9d9;
  }

  &.open::before {
    animation: lineOpen 0.3s linear;
  }

  &.close::before {
    animation: lineClose 0.3s linear;
  }

  .model-single-rule {
    display: flex;
    align-items: center;
    padding-bottom: 10px;

    &-item {
      display: flex;
      align-items: center;
      position: relative;

      .single-rule-input {
        width: 130px;
        margin-right: 8px;
      }

      .single-rule-icon {
        position: absolute;
        top: 24px;
        left: 16px;
        color: @activeFontColor;
        background: #fff;
        z-index: 10;

        .anticon {
          display: block;
        }
      }

      &-close {
        position: absolute;
        right: 4px;
        top: -6px;
        background: #fff;
        color: @activeFontColor;
        font-size: 12px;
        cursor: pointer;
        z-index: 9;
      }
    }

    .type-options {
      width: 130px;

      .ant-cascader-input {
        user-select: none;
      }
    }

    .anticon-copy {
      color: @activeFontColor;
      font-size: 16px;
      margin-left: 10px;
      cursor: pointer;
    }
  }

  .function-box {
    &.open {
      animation: funcOpen 0.3s linear;
    }

    &.close {
      animation: funcClose 0.3s linear;
    }
  }

  .single-rule-function {
    &-item {
      padding: 10px 0 0 48px;
      position: relative;

      &::before {
        top: 26px;
        content: "";
        left: 22px;
        width: 26px;
        height: 14px;
        position: absolute;
        border-top: 1px solid #d9d9d9;
      }
    }
  }
}
@keyframes lineOpen {
  0% {
    height: 0;
  }
  50% {
    height: calc((100% - 64px) / 2);
  }
  100% {
    height: calc(100% - 64px);
  }
}

@keyframes lineClose {
  0% {
    height: calc(100% - 64px);
  }
  50% {
    height: calc((100% - 64px) / 2);
  }
  100% {
    height: 0;
  }
}

@keyframes funcOpen {
  0% {
    transform: scale(0, 0);
  }
  50% {
    transform: scale(0.5, 0.5);
  }
  100% {
    transform: scale(1, 1);
  }
}

@keyframes funcClose {
  0% {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(0.5, 0.5);
  }
  100% {
    transform: scale(0, 0);
  }
}
</style>
