<template>
  <a-modal
    class="group-found-modal"
    :width="400"
    :visible="showGroupFound"
    :closable="true"
    :mask="false"
    :destroyOnClose="true"
    @cancel="onCancel"
    title="社群发现"
  >
    <template slot="footer">
      <a-button @click="onCancel">取消</a-button>
      <a-button @click="onReset">重置</a-button>
      <a-button
        @click="onConfirm"
        type="primary"
        :disabled="!entityName || !ruleName"
      >
        确认
      </a-button>
    </template>
    <a-tooltip placement="right">
      <template slot="title">
        <span>通过概念类别和属性手动定义社群</span>
      </template>
      <a-icon type="question-circle" />
    </a-tooltip>
    <div class="group-found-type">
      <p class="content-text">概念类型</p>
      <a-select
        placeholder="请选择"
        v-model="entityName"
        :options="entityOptions"
        @change="onTypeChange"
        class="type-options"
      />
    </div>
    <div class="group-found-type">
      <p class="content-text">社群分组</p>
      <a-select
        show-search
        filter-option
        placeholder="请先选择概念类型"
        v-model="ruleName"
        :options="rulesOptions"
        @change="onRuleChange"
        class="type-options"
      />
    </div>
    <div class="group-found-type" v-if="matchRuleVisible">
      <p class="content-text">社群匹配规则</p>
      <a-radio-group @change="onMatchRuleChange" :value="matchRule">
        <a-space direction="vertical">
          <a-radio :value="1">整体匹配</a-radio>
          <a-radio :value="2">前缀匹配</a-radio>
          <a-radio :value="3">后缀匹配</a-radio>
          <a-radio :value="4">关键词匹配</a-radio>
          <!-- <a-radio :value="5">自定义宏</a-radio> -->
        </a-space>
      </a-radio-group>
    </div>
    <div class="group-found-type" v-if="intMatchRuleVisible">
      <p class="content-text">最大社群数量</p>
      <a-input-number
        v-model.trim="groupNum"
        :min="1"
        :max="100"
        :precision="0"
      />
    </div>
    <a-input-number
      v-model.trim="matchValue"
      :min="1"
      :max="100"
      :precision="0"
      v-if="matchNumberVisible"
    />
    <a-input
      placeholder="多个关键词用逗号隔开"
      v-model.trim="keyWordsString"
      v-if="keyWordMatchVisible"
    />
  </a-modal>
</template>
<script>
import {
  Button,
  Input,
  InputNumber,
  Radio,
  Space,
  Tooltip,
} from "ant-design-vue";
import { cloneDeep, merge } from "lodash";
import { nanoid } from "nanoid";

const { Group } = Radio;

export default {
  name: "GroupFound",
  props: [
    "showGroupFound",
    "searchNodeAll",
    "graphNodes",
    "entitySearchAllOption",
  ],
  data() {
    return {
      entityName: undefined,
      ruleName: undefined,
      matchRule: 1,
      groupNum: 3,
      matchValue: 3,
      keyWordsString: "",
      matchRuleVisible: false,
      intMatchRuleVisible: false,
      matchNumberVisible: false,
      keyWordMatchVisible: false,
      defaultCombJson: {
        data: {
          $$type: "comb",
          shape: "rectangle",
          zIndex: 10,
          minWidth: "200",
          minHeight: "200",
          padding: "50",
          fontSize: 30,
          opacity: "data(opacity)",
          color: "#333",
          textValign: "bottom",
          backgroundImage: "none",
          backgroundColor: "data(backgroundColor)",
          backgroundWidth: "25 7",
          backgroundHeight: "25 7",
          textHalign: "center",
          textAlign: "center",
          fontWeight: 400,
          backgroundOffsetX: 0,
          backgroundOffsetY: 0,
          parent: {},
          roundRectangleArray: "1 1 1 1",
          borderColor: "#fff",
          borderWidth: 0,
          label: "",
        },
        selector: "node.default-community",
        classes: ["default-comb"],
      },
      newCombArr: [], // 保存上一次增加的社群节点，以便切换社群探索方法时可以删除旧的社群节点
      lastEntityName: "",
      rulesOptions: [],
      entityOptions: [],
      searchAllOption: [],
    };
  },
  mounted() {
    this.entityOptions = this.searchNodeAll.map((item) => ({
      label: item,
      value: item,
    }));
    this.searchAllOption = this.entitySearchAllOption;
  },
  watch: {
    searchNodeAll() {
      this.entityOptions = this.searchNodeAll.map((item) => ({
        label: item,
        value: item,
      }));
      this.resetData();
    },
    entitySearchAllOption(newValue) {
      this.searchAllOption = newValue;
      this.resetData();
    },
  },
  components: {
    AButton: Button,
    AInput: Input,
    AInputNumber: InputNumber,
    ARadio: Radio,
    ARadioGroup: Group,
    ASpace: Space,
    ATooltip: Tooltip,
  },
  methods: {
    onCancel() {
      this.$emit("isShowGroupFoundChanged", false);
    },
    resetData() {
      this.newCombArr = [];
      this.entityName = undefined;
      this.ruleName = undefined;
      this.matchRule = 1;
      this.matchRuleVisible = false;
      this.intMatchRuleVisible = false;
      this.matchNumberVisible = false;
      this.keyWordMatchVisible = false;
    },
    onReset() {
      const cloneEles = [];
      const graph = this.$graph;
      const allEdges = graph.datas.allEdges();
      graph.datas.allNodesWithCommunity().map((node) => {
        if (node.data().nodeType === this.entityName) {
          const eleJson = node.json();
          if (eleJson.data.parent) {
            // parent 属性不能动态设置，只能删除原节点，再加上新节点
            eleJson.data.parent = null;
            cloneEles.push(eleJson);
            graph.cy.remove(node);
          }
        } else if (node.data().nodeType === "社群") {
          graph.cy.remove(node);
        }
      });
      if (cloneEles.length > 0) {
        cloneEles.map((ele) => {
          graph.cy.add(ele);
        });
        allEdges.map((edge) => {
          graph.cy.add(edge);
        });
      }
      this.resetData();
      this.$emit("isShowGroupFoundChanged", false);
      this.$emit("isHappenGroupFoundChanged", false);
    },
    onMatchRuleChange(e) {
      this.matchNumberVisible = false;
      this.keyWordMatchVisible = false;
      this.matchRule = e.target.value;
      if (e.target.value === 2 || e.target.value === 3) {
        this.matchNumberVisible = true;
      } else if (e.target.value === 4) {
        this.matchNumberVisible = false;
        this.keyWordMatchVisible = true;
      }
    },
    onConfirm() {
      this.$emit("canvasLoadingChanged", { loading: true, tip: "正在布局..." });
      const targetNodesArr = this.graphNodes.filter((node) => {
        if (node.nodeType === this.entityName) {
          return node;
        }
      });
      if (targetNodesArr.length) {
        const resultArr = [
          {
            value: "",
            arr: [],
          },
        ];
        let count = 0;
        let restObj = {
          value: "其他",
          arr: [],
        };
        if (this.matchRuleVisible) {
          // 社群匹配规则
          switch (this.matchRule) {
            case 1:
              // 整体匹配
              targetNodesArr.map((node, index) => {
                node.params.forEach((value, key) => {
                  if (key === this.ruleName) {
                    count += 1;
                    if (index === 0) {
                      resultArr[0].value = value;
                      resultArr[0].arr.push(node.id);
                    } else {
                      for (let i = 0; i < resultArr.length; i++) {
                        if (resultArr[i].value === value) {
                          resultArr[i].arr.push(node.id);
                          break;
                        } else if (i === resultArr.length - 1) {
                          resultArr.push({
                            value: value,
                            arr: [node.id],
                          });
                          break;
                        }
                      }
                    }
                  }
                });
                if (count === index && index === 0) {
                  resultArr[0].value = "其他";
                  resultArr[0].arr.push(node.id);
                  restObj = resultArr[0]; // 对象
                  count = 1;
                } else if (count === index && index > 0) {
                  if (!restObj.arr.length) {
                    resultArr.push(restObj);
                  }
                  restObj.arr.push(node.id);
                  count = index + 1;
                }
              });
              break;
            case 2:
              // 前缀匹配
              targetNodesArr.map((node, index) => {
                node.params.forEach((value, key) => {
                  if (key === this.ruleName) {
                    count += 1;
                    if (index === 0) {
                      resultArr[0].value = value.slice(0, this.matchValue);
                      resultArr[0].arr.push(node.id);
                    } else {
                      for (let i = 0; i < resultArr.length; i++) {
                        if (
                          resultArr[i].value === value.slice(0, this.matchValue)
                        ) {
                          resultArr[i].arr.push(node.id);
                          break;
                        } else if (i === resultArr.length - 1) {
                          resultArr.push({
                            value: value.slice(0, this.matchValue),
                            arr: [node.id],
                          });
                          break;
                        }
                      }
                    }
                  }
                });
                if (count === index && index === 0) {
                  resultArr[0].value = "其他";
                  resultArr[0].arr.push(node.id);
                  restObj = resultArr[0]; // 对象
                  count = 1;
                } else if (count === index && index > 0) {
                  if (!restObj.arr.length) {
                    resultArr.push(restObj);
                  }
                  restObj.arr.push(node.id);
                  count = index + 1;
                }
              });
              break;
            case 3:
              // 后缀匹配
              targetNodesArr.map((node, index) => {
                node.params.forEach((value, key) => {
                  if (key === this.ruleName) {
                    count += 1;
                    if (index === 0) {
                      resultArr[0].value = value.slice(-this.matchValue);
                      resultArr[0].arr.push(node.id);
                    } else {
                      for (let i = 0; i < resultArr.length; i++) {
                        if (
                          resultArr[i].value === value.slice(-this.matchValue)
                        ) {
                          resultArr[i].arr.push(node.id);
                          break;
                        } else if (i === resultArr.length - 1) {
                          resultArr.push({
                            value: value.slice(-this.matchValue),
                            arr: [node.id],
                          });
                          break;
                        }
                      }
                    }
                  }
                });
                if (count === index && index === 0) {
                  resultArr[0].value = "其他";
                  resultArr[0].arr.push(node.id);
                  restObj = resultArr[0]; // 对象
                  count = 1;
                } else if (count === index && index > 0) {
                  if (!restObj.arr.length) {
                    resultArr.push(restObj);
                  }
                  restObj.arr.push(node.id);
                  count = index + 1;
                }
              });
              break;
            case 4:
              // 关键词匹配
              if (this.keyWordMatchVisible && this.keyWordsString === "") {
                return this.$message.info("请输入关键词，用逗号隔开");
              } else {
                const keyWordsArr = this.keyWordsString.split(",");
                targetNodesArr.map((node, index) => {
                  node.params.forEach((value, key) => {
                    if (key === this.ruleName) {
                      count += 1;
                      for (let j = 0; j < keyWordsArr.length; j++) {
                        if (value.indexOf(keyWordsArr[j]) !== -1) {
                          if (index === 0) {
                            resultArr[0].value = keyWordsArr[j];
                            resultArr[0].arr.push(node.id);
                            break;
                          } else {
                            for (let i = 0; i < resultArr.length; i++) {
                              if (value.indexOf(resultArr[i].value) !== -1) {
                                resultArr[i].arr.push(node.id);
                                break;
                              } else if (i === resultArr.length - 1) {
                                resultArr.push({
                                  value: keyWordsArr[j],
                                  arr: [node.id],
                                });
                                break;
                              }
                            }
                            break;
                          }
                        } else if (j === keyWordsArr.length - 1) {
                          // 没有匹配上关键词的属性值
                          for (let k = 0; k < resultArr.length; k++) {
                            if (
                              resultArr[k].value === "其他" ||
                              resultArr[k].value === ""
                            ) {
                              resultArr[k].value = "其他";
                              resultArr[k].arr.push(node.id);
                              break;
                            } else if (k === resultArr.length - 1) {
                              resultArr.push({
                                value: "其他",
                                arr: [node.id],
                              });
                              break;
                            }
                          }
                          break;
                        }
                      }
                    }
                  });
                  if (count === index && index === 0) {
                    resultArr[0].value = "其他";
                    resultArr[0].arr.push(node.id);
                    restObj = resultArr[0]; // 对象
                    count = 1;
                  } else if (count === index && index > 0) {
                    for (let k = 0; k < resultArr.length; k++) {
                      if (
                        resultArr[k].value === "其他" ||
                        resultArr[k].value === ""
                      ) {
                        resultArr[k].value = "其他";
                        resultArr[k].arr.push(node.id);
                        break;
                      } else if (k === resultArr.length - 1) {
                        resultArr.push({
                          value: "其他",
                          arr: [node.id],
                        });
                        break;
                      }
                    }
                    count = index + 1;
                  }
                });
                break;
              }
            default:
              break;
          }
        } else {
          // 最大社群数量
          targetNodesArr.map((node, index) => {
            node.params.forEach((value, key) => {
              if (key === this.ruleName) {
                count += 1;
                if (index === 0) {
                  resultArr[0].value = value;
                  resultArr[0].arr.push(node.id);
                } else {
                  if (resultArr.length < this.groupNum - 1) {
                    for (let i = 0; i < resultArr.length; i++) {
                      if (resultArr[i].value === value) {
                        resultArr[i].arr.push(node.id);
                        break;
                      } else if (i === resultArr.length - 1) {
                        resultArr.push({
                          value: value,
                          arr: [node.id],
                        });
                        break;
                      }
                    }
                  } else {
                    if (!restObj.arr.length) {
                      resultArr.push(restObj);
                    }
                    restObj.arr.push(node.id);
                  }
                }
              }
            });
            if (count === index && index === 0) {
              resultArr[0].value = "其他";
              resultArr[0].arr.push(node.id);
              restObj = resultArr[0]; // 对象
              count = 1;
            } else if (count === index && index > 0) {
              if (!restObj.arr.length) {
                resultArr.push(restObj);
              }
              restObj.arr.push(node.id);
              count = index + 1;
            }
          });
        }
        const allEdges = this.$graph.datas.allEdges();
        const resultIdArr = cloneDeep(resultArr);
        resultArr.map((group) => {
          group.arr.map((node, index) => {
            this.$graph.datas.allNodesWithCommunity().map((item) => {
              if (node === item.id()) {
                group.arr[index] = item;
              }
            });
          });
        });
        const colorArr = this.gradientColor(
          "#FCFFD9",
          "#D9FFFE",
          resultArr.length
        );
        const newCombs = [];
        resultArr.map((group, index) => {
          const _eles = group.arr;
          const cloneEles = [];
          const defaultComb = {
            data: {
              id: nanoid(),
              backgroundColor: colorArr[index],
              nodeType: "社群",
              opacity: 0.15,
              backgroundOpacity: 0.15,
              data: {
                entityName: this.entityName,
                ruleName: this.ruleName,
                colorArr,
                resultIdArr,
              },
            },
          };
          const newComb = this.createComb(defaultComb);
          _eles.forEach((e) => {
            const eleJson = e.json();
            if (e.isNode()) {
              // parent 属性不能动态设置，只能删除原节点，再加上新节点
              eleJson.data.parent = newComb.data.id;
            }
            cloneEles.push(eleJson);
          });
          this.$graph.cy.add(newComb);
          newCombs.push(newComb);
          _eles.map((_ele) => {
            this.$graph.cy.remove(_ele);
          });
          cloneEles.map((ele) => {
            this.$graph.datas.addNode(ele);
          });
          // graph.cy.batch(() => {
          //   graph.cy.add(newComb);
          //   graph.cy.remove(_eles);
          //   graph.cy.add(cloneEles);
          // });
          // graph.events.mergeElements(group.arr);
        });
        if (this.newCombArr.length) {
          const cloneEles = [];
          const resultIds = cloneDeep(this.newCombArr[0].data.data.resultIdArr);
          const AllGraphNodes = this.$graph.datas.allNodesWithCommunity();
          resultIds.map((group) => {
            const _eles = group.arr;
            _eles.map((_ele, index) => {
              for (let i = 0; i < AllGraphNodes.length; i++) {
                if (_ele === AllGraphNodes[i].id()) {
                  group.arr[index] = AllGraphNodes[i];
                  break;
                }
              }
            });
            _eles.forEach((e) => {
              const eleJson = e.json();
              if (e.isNode()) {
                // parent 属性不能动态设置，只能删除原节点，再加上新节点
                eleJson.data.parent = null;
              }
              cloneEles.push(eleJson);
            });
          });
          AllGraphNodes.map((node) => {
            this.newCombArr.map((item) => {
              if (item.data.id === node.id()) {
                this.$graph.cy.remove(node);
              }
            });
          });
          if (this.lastEntityName && this.entityName !== this.lastEntityName) {
            cloneEles.map((ele) => {
              this.$graph.cy.add(ele);
            });
          }
        }
        // const graphCombs = this.$graph.datas.filter(".default-comb");
        allEdges.map((edge) => {
          this.$graph.cy.add(edge);
        });
        this.newCombArr = newCombs;
        this.lastEntityName = this.entityName;
        const currentSelectedNodes = this.$graph.datas.filter("node:selected");
        currentSelectedNodes.deselect();
        this.$emit("isShowGroupFoundChanged", false);
        this.$emit("isHappenGroupFoundChanged", true);
        this.$emit("selectedElesChanged", [], []);
      } else {
        this.$message.info("无对应概念类型的节点");
      }
      this.$emit("canvasLoadingChanged", { loading: false, tip: "布局完成" });
    },
    createComb(comb) {
      return merge(cloneDeep(this.defaultCombJson), comb);
    },
    gradientColor(startColor, endColor, step) {
      const startRGB = this.colorRgb(startColor); //转换为rgb数组模式
      const startR = startRGB[0];
      const startG = startRGB[1];
      const startB = startRGB[2];

      const endRGB = this.colorRgb(endColor);
      const endR = endRGB[0];
      // const endG = endRGB[1];
      const endB = endRGB[2];

      let sR = 0; //总差值
      let sG = 0;
      let sB = 0;
      if (step > 1) {
        sR = (endR - startR) / (step - 1); //总差值
        // sG = (endG - startG) / (step - 1);
        sB = (endB - startB) / (step - 1);
      }

      const colorArr = [];
      for (let i = 0; i < step; i++) {
        //计算每一步的hex值
        const rgb =
          "rgb(" +
          parseInt(sR * i + startR) +
          "," +
          parseInt(sG * i + startG) +
          "," +
          parseInt(sB * i + startB) +
          ")";
        colorArr.push(rgb);
      }
      return colorArr;
    },
    colorRgb(sColor) {
      // 将hex表示方式转换为rgb表示方式(这里返回rgb数组模式)
      const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
      sColor = sColor.toLowerCase();
      if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
          let sColorNew = "#";
          for (let i = 1; i < 4; i++) {
            sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
          }
          sColor = sColorNew;
        }
        //处理六位的颜色值
        const sColorChange = [];
        for (let i = 1; i < 7; i = i + 2) {
          sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        return sColorChange;
      } else {
        return sColor;
      }
    },
    onTypeChange(value) {
      this.entityName = value;
      this.ruleName = undefined;
      this.matchRuleVisible = false;
      this.intMatchRuleVisible = false;
      this.matchNumberVisible = false;
      this.keyWordMatchVisible = false;
      const optionArr = [];
      if (this.entityName) {
        this.searchAllOption.filter((item) => {
          if (item.label === this.entityName) {
            item.property.map((cell) => {
              switch (cell.value) {
                case "__id":
                  optionArr.push({
                    label: "原始ID" + " (" + cell.type + ") ",
                    value: cell.value,
                  });
                  break;
                case "__name":
                  optionArr.push({
                    label: "名字" + " (" + cell.type + ") ",
                    value: cell.value,
                  });
                  break;
                case "__label":
                  optionArr.push({
                    label: "标签" + " (" + cell.type + ") ",
                    value: cell.value,
                  });
                  break;
                case "__icon":
                  optionArr.push({
                    label: "图案选择" + " (" + cell.type + ") ",
                    value: cell.value,
                  });
                  break;
                case "__graphName":
                  optionArr.push({
                    label: "图数据库名称" + " (" + cell.type + ") ",
                    value: cell.value,
                  });
                  break;
                default:
                  optionArr.push({
                    label: cell.value + " (" + cell.type + ") ",
                    value: cell.value,
                  });
                  break;
              }
            });
          }
        });
      }
      this.rulesOptions = optionArr;
    },
    onRuleChange(value) {
      let fieldsType = "";
      for (let i = 0; i < this.searchAllOption.length; i++) {
        const item = this.searchAllOption[i];
        if (item.label === this.entityName) {
          for (let j = 0; j < item.property.length; j++) {
            const element = item.property[j];
            if (element.value === value) {
              fieldsType = element.type;
              break;
            }
          }
          break;
        }
      }
      this.matchNumberVisible = false;
      this.intMatchRuleVisible = false;
      this.keyWordMatchVisible = false;
      this.ruleName = value;
      if (value && (fieldsType === "string" || fieldsType === "timestamp")) {
        this.matchRuleVisible = true;
        this.matchRule = 1;
      } else {
        this.matchRuleVisible = false;
        this.intMatchRuleVisible = true;
      }
    },
  },
};
</script>
<style lang="less">
.group-found-modal {
  .ant-modal {
    margin: 0;
    top: auto;
    bottom: 0;
    left: 160px;
    height: 600px;
    overflow: hidden;
    padding-bottom: 0;
    position: absolute;
    box-shadow: 0 4px 12px 0 #dbdfee;
  }

  .ant-modal-content {
    height: 100%;

    .ant-modal-header {
      border-bottom: 1px solid #e0e0e0;

      .ant-modal-title {
        font-size: 17px;
        font-weight: 600;
      }
    }
    .ant-modal-body {
      overflow-y: auto;
      height: calc(100% - 108px);

      .anticon-question-circle {
        top: 21px;
        left: 97px;
        width: 12px;
        height: 12px;
        color: #1790fa;
        position: absolute;
      }

      .group-found-type {
        margin-bottom: 30px;

        .content-text {
          margin-bottom: 5px;
          color: @primaryTextColor;
        }

        .type-options {
          width: 200px;
        }
      }
    }
  }
}
</style>
