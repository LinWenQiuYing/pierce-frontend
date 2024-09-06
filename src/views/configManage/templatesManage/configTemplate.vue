<template>
  <div class="config-template-config">
    <div class="config-template-config-graph">
      <div class="config-template-config-graph-schema" ref="schemaGraphBox">
        <p class="graph-title" v-show="schemaWidth && schemaWidth > 400">
          图谱结构关系展示区
        </p>
        <div class="schema-graph-contain">
          <SchemaGraph
            ref="schemaGraph"
            :pathData="schemaData"
            graphId="schema-graph-canvas"
            :isModel="false"
          />
        </div>
      </div>
      <div class="sep-bar" @mousedown="onmousedown">
        <img src="@/assets/images/img/flex.svg" alt="" />
      </div>
      <div
        class="config-template-config-graph-model"
        :style="{ width: `${modalWidth}px` }"
        ref="modelGraphBox"
      >
        <p class="graph-title" v-show="modalWidth && modalWidth > 413">
          模型结构点边关系配置
        </p>
        <!-- <a-tooltip placement="right">
            <template slot="title">
              <span>点击查看教程视频</span>
            </template>
            <img
              class="info-circle"
              src="@/assets/images/img/info_circle.svg"
              alt=""
            />
          </a-tooltip> -->
        <div class="schema-graph-contain">
          <SchemaGraph
            ref="modelGraph"
            graphId="model-graph-canvas"
            :pathData="pathData"
            :isModel="true"
            :target="target"
            :addEdges="addEdges"
            :addVertices="addVertices"
            :isReset="isReset"
            :selectedNodes="selectedNodes"
            :selectedEdges="selectedEdges"
            @selectedElesChanged="selectedElesChanged"
            @resetAddElements="resetAddElements"
          />
        </div>
        <div class="config-template-config-graph-btns">
          <div class="btns-select" v-show="modalWidth && modalWidth > 454">
            <div class="select-btns">
              <div class="select-btns-item">
                <p :class="['btns-label', isLock ? 'disabled' : '']">边起点:</p>
                <a-select
                  class="vertex-options"
                  v-model="startVertex"
                  placeholder="请选择起点"
                  allow-clear
                  :disabled="isLock"
                >
                  <a-select-option
                    v-for="item in searchOptions"
                    :key="item.id"
                    :value="item.id"
                    :title="item.label"
                  >
                    {{ item.label }}
                  </a-select-option>
                </a-select>
              </div>
              <div class="select-btns-item">
                <p :class="['btns-label', isLock ? 'disabled' : '']">边终点:</p>
                <a-select
                  class="vertex-options"
                  v-model="endVertex"
                  placeholder="请选择终点"
                  allow-clear
                  :disabled="isLock"
                >
                  <a-select-option
                    v-for="item in searchOptions"
                    :key="item.id"
                    :value="item.id"
                    :title="item.label"
                  >
                    {{ item.label }}
                  </a-select-option>
                </a-select>
              </div>
            </div>
            <div class="btns-actions">
              <a-button
                class="action-btn"
                type="primary"
                @click="handleAddEdge"
                :disabled="!startVertex && !endVertex"
              >
                添加边
              </a-button>
              <a-button
                class="action-btn"
                type="primary"
                @click="handleRemoveNode"
                :disabled="
                  (!selectedNodes.length && !selectedEdges.length) || isLock
                "
              >
                删除
              </a-button>
            </div>
          </div>
          <div class="btns-operation">
            <a-button
              class="action-btn"
              v-if="!isLock"
              @click="handleReset('refresh')"
            >
              重置
            </a-button>
            <a-tooltip
              v-if="isLock && detailsType === 'check'"
              placement="topRight"
              overlayClassName="model-tooltip"
            >
              <template slot="title">
                <span>点击进行点边【种类配置】</span>
              </template>
              <a-button class="action-btn disabled" type="primary" disabled>
                进入编辑
              </a-button>
            </a-tooltip>
            <a-tooltip
              v-else-if="isLock && detailsType !== 'check'"
              placement="topRight"
              overlayClassName="model-tooltip"
            >
              <template slot="title">
                <span>点击进行点边【种类配置】</span>
              </template>
              <a-button class="action-btn" type="primary" @click="handleLock">
                进入编辑
              </a-button>
            </a-tooltip>
            <a-tooltip
              v-else
              placement="topRight"
              overlayClassName="model-tooltip"
            >
              <template slot="title">
                <span>点击进行【路径语句】与【限定条件】设置</span>
              </template>
              <a-button class="action-btn" type="primary" @click="handleLock">
                完成配置
              </a-button>
            </a-tooltip>
          </div>
        </div>
      </div>
    </div>
    <div class="config-template-config-property">
      <div class="config-template-config-item">
        <div class="config-template-config-item-title">
          <div class="config-template-config-item-title-left">
            <span class="content-sub-title">种类和属性配置</span>
            <a-tooltip placement="right" overlayClassName="model-tooltip">
              <template slot="title">
                <p>点/边：可在上右图中选中</p>
                <p>点击【种类配置】进行点边种类和属性配置</p>
              </template>
              <icon-svg icon-class="info_circle" class="info-circle" />
            </a-tooltip>
          </div>
          <a-button class="fold-btn" @click="isConfigFold = !isConfigFold">
            {{ isConfigFold ? "展开" : "收起" }}
            <a-icon :type="isConfigFold ? 'down' : 'up'" />
          </a-button>
        </div>
        <div class="config-template-config-item-content" v-if="!isConfigFold">
          <div class="content-box">
            <span class="item-box-label">当前点/边：</span>
            <div class="item-box-content">
              <a-select
                class="item-box-content-select"
                placeholder="请选择点/边"
                v-model="currentEntity"
                @change="handleChangeCurrent"
                allow-clear
                :disabled="isLock"
              >
                <a-select-option
                  v-for="item in currentEntityOptions"
                  :key="item.id"
                  :value="item.id"
                  :title="item.label"
                >
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </div>
          </div>
          <div class="content-box">
            <span class="item-box-label">点/边种类：</span>
            <div class="item-box-content">
              <a-select
                mode="multiple"
                :token-separators="[',']"
                class="item-box-content-select"
                placeholder="请选择点/边种类"
                v-model="currentNodeType"
                allow-clear
                @change="handleChangeType"
                :disabled="!currentEntity || isLock"
              >
                <a-select-option
                  v-for="item in entityTypeOptions"
                  :key="item.id"
                  :value="item.id"
                  :title="item.label"
                >
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </div>
          </div>
          <div class="content-box">
            <span class="item-box-label">点/边属性：</span>
            <div class="item-box-content">
              <a-button
                class="item-box-content-btn"
                type="primary"
                @click="addSingleRule"
                :disabled="!currentNodeType.length"
              >
                <a-icon type="plus-square" /> 新建规则
              </a-button>
            </div>
          </div>
          <a-tabs
            class="content-tabs"
            v-model="activeKey"
            hide-add
            type="editable-card"
            @change="handleChangeTab"
            v-if="currentNodeType.length"
          >
            <a-tab-pane
              v-for="pane in currentNodeType"
              :key="pane"
              :tab="pane"
              :closable="false"
            >
            </a-tab-pane>
          </a-tabs>
          <div class="content-rules" v-if="currentNodeType.length">
            <div
              class="rules-single"
              v-for="(rule, index) in singleRules"
              :key="rule.id"
            >
              <a-icon type="file" />
              <a-select
                placeholder="请选择"
                :value="rule.name"
                :options="rulesOptions"
                class="rule-options"
                @change="
                  (e) => {
                    onSingleAttributeChange('name', e, index);
                  }
                "
              />
              <a-input
                type="text"
                placeholder="请输入"
                class="rules-single-input"
                :value="rule.value"
                @change="
                  (e) => {
                    onSingleAttributeChange(
                      'value',
                      e.currentTarget.value,
                      index
                    );
                  }
                "
              />
              <a-icon type="delete" @click="deleteSingle(index)" />
            </div>
          </div>
        </div>
      </div>
      <div class="config-template-config-item">
        <div class="config-template-config-item-title">
          <div class="config-template-config-item-title-left">
            <span class="content-sub-title">路径语句设置</span>
            <a-tooltip placement="right" overlayClassName="model-tooltip">
              <template slot="title">
                <span
                  >请在上右图中，按住ctrl键，并选择首尾相连的边，进行路径语句设置</span
                >
              </template>
              <icon-svg icon-class="info_circle" class="info-circle" />
            </a-tooltip>
          </div>
          <a-button class="fold-btn" @click="isMatchFold = !isMatchFold">
            {{ isMatchFold ? "展开" : "收起" }}
            <a-icon :type="isMatchFold ? 'down' : 'up'" />
          </a-button>
        </div>
        <div class="config-template-config-item-content" v-if="!isMatchFold">
          <div
            class="content-box"
            v-for="(path, index) in matchList"
            :key="path.name"
          >
            <span class="item-box-label">{{ path.name }}：</span>
            <div class="item-box-content">
              <a-input
                type="text"
                placeholder="请选择路径"
                class="item-box-content-input"
                :value="path.value"
                disabled
              />
              <a-button
                class="item-box-content-btn"
                type="primary"
                @click="confirmPath(index)"
                v-if="!path.isConfirm"
                :disabled="!matchList.slice(-1)[0].path.nodes.length"
              >
                确认路径
              </a-button>
              <div
                class="item-box-content-icon disabled"
                v-else-if="detailsType === 'check'"
              >
                <a-icon type="sync" v-if="matchList.length === 1" />
                <a-icon type="delete" v-else />
              </div>
              <div class="item-box-content-icon" v-else>
                <a-icon
                  type="sync"
                  v-if="matchList.length === 1"
                  @click="resetPath"
                />
                <a-icon type="delete" v-else @click="deletePath(index)" />
              </div>
            </div>
          </div>
          <a-button
            class="content-box-btn"
            type="primary"
            @click="addPath"
            :disabled="
              !matchList.slice(-1)[0].isConfirm || detailsType === 'check'
            "
          >
            添加路径
          </a-button>
        </div>
      </div>
      <div class="config-template-config-item">
        <div class="config-template-config-item-title">
          <div class="config-template-config-item-title-left">
            <span class="content-sub-title">限定条件设置</span>
            <a-tooltip placement="right" overlayClassName="model-tooltip">
              <template slot="title">
                <span>请点击【新建规则（组）】，进行限定条件设置</span>
              </template>
              <icon-svg icon-class="info_circle" class="info-circle" />
            </a-tooltip>
          </div>
          <a-button class="fold-btn" @click="isWhereFold = !isWhereFold">
            {{ isWhereFold ? "展开" : "收起" }}
            <a-icon :type="isWhereFold ? 'down' : 'up'" />
          </a-button>
        </div>
        <div class="config-template-config-item-content" v-if="!isWhereFold">
          <model-group-rules
            v-if="rulesGroup.length > 1"
            :list="rulesGroup"
            :originList="rulesGroup"
            :value="[]"
            :floor="0"
            :variableList="currentElements"
            :schemaData="schemaData"
            :conditionOptions="conditionOptions"
            :funcList="funcList"
            :disabled="detailsType === 'check'"
          />
          <div class="config-btns">
            <a-button
              class="config-btns-btn"
              type="primary"
              @click="addRules('single', [])"
              :disabled="!isLock || detailsType === 'check'"
            >
              <a-icon type="plus-square" /> 新建规则
            </a-button>
            <a-button
              class="config-btns-btn"
              type="primary"
              @click="addRules('multi', [])"
              :disabled="!isLock || detailsType === 'check'"
            >
              <a-icon type="folder-add" /> 新建规则组
            </a-button>
            <a-button
              class="config-btns-btn"
              :disabled="!isLock || detailsType === 'check'"
              @click="resetWhere"
            >
              <a-icon type="redo" :rotate="-90" /> 重置
            </a-button>
          </div>
        </div>
      </div>
    </div>
    <a-button
      v-if="type === 'model'"
      class="config-template-config-btn"
      type="primary"
      @click="handleGetSentence"
      :disabled="!matchList.slice(-1)[0].isConfirm"
    >
      <!-- :disabled="!matchList.slice(-1)[0].isConfirm" -->
      语句生成
    </a-button>
    <div
      class="config-template-config-show"
      v-if="type === 'model' && sentenceShow"
    >
      <p class="content-sub-title">语句呈现</p>
      <div class="show-content">
        <a-textArea
          type="text"
          class="show-content-input"
          v-model="sentenceContent"
          disabled
          :autoSize="{ minRows: 5, maxRows: 8 }"
        />
      </div>
    </div>
    <a-button
      v-if="type === 'model' && sentenceShow"
      class="config-template-config-btn"
      type="primary"
      @click="handleEditSentence"
      :disabled="!sentenceShow"
    >
      修改语句
    </a-button>
    <a-modal
      class="edit-confirm-modal"
      :width="600"
      :visible="editConfirmVisible"
      :closable="true"
      :destroyOnClose="true"
      :maskClosable="true"
      :footer="null"
      title="cypher语句修改"
      @cancel="onEditConfirmCancel"
      centered
    >
      <div class="edit-confirm-modal-content">
        <div class="content-body">
          <div class="content-body-text">
            <a-textArea
              type="text"
              class="show-content-input"
              v-model="editSentence"
              :autoSize="{ minRows: 5, maxRows: 12 }"
            />
          </div>
          <a-button
            class="content-body-btn"
            type="primary"
            @click="handleCheckGrammar(editSentence)"
            >语法检查</a-button
          >
        </div>
        <div class="content-log">{{ logContent }}</div>
        <div class="content-btns">
          <a-button @click="onEditConfirmCancel">取消</a-button>
          <a-button type="primary" @click="handleEditCypher">确认修改</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script>
import {
  createCypher,
  graphPreview,
  queryDicList,
} from "@/shared/api/configManage.js";
import { cypherGrammarVerify } from "@/shared/api/graph.js";
import pathData from "@/shared/data/pathData.json";
import { scrollToBottom } from "@/utils/common.js";
import { getBackgroundIcon } from "@/utils/graph.js";
import { Button, Icon, Input, Tabs, Tooltip } from "ant-design-vue";
import { cloneDeep, find, findIndex } from "lodash";
import moment from "moment";
import { nanoid } from "nanoid";
import SchemaGraph from "../components/schemaGraph";
import ModelGroupRules from "./modelGroupRules";

const { TabPane } = Tabs;
const { TextArea } = Input;

export default {
  name: "ConfigTemplate",
  props: ["selectItem", "details", "detailsType", "type"],
  data() {
    return {
      startVertex: undefined,
      endVertex: undefined,
      searchOptions: [], // 点集
      currentEntityOptions: [], // 点边集
      currentEntity: undefined, // 当前选中的点/边
      entityTypeOptions: [], // 当前实体可选的类型
      nodeTypeOptions: [], // 点类型
      edgeTypeOptions: [], // 边类型
      pathData: this.details.modelInfo || pathData,
      schemaData: {
        edgeMetas: [],
        vertexMetas: [],
      },
      nodeIndex: (this.details && this.details.nodeIndex) || 2,
      edgeIndex: (this.details && this.details.edgeIndex) || 2,
      pathIndex: (this.details && this.details.pathIndex) || 0,
      target: "",
      addVertices: [],
      addEdges: [],
      isLock: false,
      isReset: false,
      selectedNodes: [],
      selectedEdges: [],
      currentElements: [],
      currentNodeType: [],
      currentNodeTypeAll: [],
      activeKey: "",
      singleRules: [],
      rulesGroup: (this.details && this.details.rulesGroup) || [
        {
          id: -1,
          types: "relations",
          relations: "且",
          label: undefined,
        },
      ],
      rulesOptions: [],
      conditionOptions: [],
      funcList: [],
      matchList: (this.details && this.details.matchList) || [
        {
          name: "p1",
          value: "",
          path: {
            edges: [],
            nodes: [],
          },
          isConfirm: false,
        },
      ],
      lastEdge: {
        id: "",
        source: "",
        target: "",
      },
      isConfigFold: false,
      isMatchFold: true,
      isWhereFold: true,
      sentenceContent: (this.details && this.details.sentenceContent) || "",
      sentenceShow: (this.details && this.details.sentenceShow) || false,
      process: false, // 表示是否正在过程中，节流作用
      editConfirmVisible: false,
      logContent: "",
      editSentence: "", // 待修改的cypher
      schemaWidth: undefined, // 左侧schema区域的宽度，初始为undefined，取css设置的宽度
      modalWidth: undefined, // 右侧模型区域的宽度，初始为undefined，取css设置的宽度
      mouseDownX: 0, // 记录鼠标按下时的x位置
      ismousedown: false, // 是否正在按下鼠标尚未抬起
      isReady: false, // 页面是否加载完成
    };
  },
  components: {
    AButton: Button,
    AIcon: Icon,
    AInput: Input,
    ATextArea: TextArea,
    ATabPane: TabPane,
    ATabs: Tabs,
    ATooltip: Tooltip,
    ModelGroupRules,
    SchemaGraph,
  },
  watch: {
    activeKey(nValue) {
      this.activeKey = nValue;
      if (nValue) {
        let targetList = [];
        if (this.currentEntity.indexOf("_") === -1) {
          // 点
          targetList = this.schemaData.vertexMetas;
        } else {
          // 边
          targetList = this.schemaData.edgeMetas;
        }
        const property = find(
          targetList,
          (ele) => ele.label === nValue
        ).property;
        this.rulesOptions = property.map((prop) => {
          return {
            label: prop,
            value: prop,
          };
        });
      }
    },
    currentEntity(nValue) {
      this.currentEntity = nValue;
      if (nValue) {
        if (nValue.indexOf("_") === -1) {
          // 选中了点
          this.entityTypeOptions = this.nodeTypeOptions;
        } else {
          // 选中了边
          this.entityTypeOptions = this.edgeTypeOptions;
        }
      } else {
        // 未选中实体
        this.entityTypeOptions = [];
      }
    },
    matchList() {
      this.sentenceContent = "";
    },
    rulesGroup() {
      this.sentenceContent = "";
    },
    details: {
      async handler(newValue) {
        if (!this.isReady) return false;
        this.details = newValue;
        // 如果是编辑或查看，则直接用schemaId查询，如果是新增，则需要根据selectItem[0]的graphSource判断。
        if (this.detailsType !== "add" && this.details.schemaId) {
          await this.handleSetModel(this.details.schemaId);
        } else if (
          this.selectItem[0].graphSource === 0 &&
          this.selectItem[0].id
        ) {
          await this.handleSetModel(this.selectItem[0].id);
        } else if (
          this.selectItem[0].graphSource === 1 &&
          this.selectItem[0].schemaId
        ) {
          await this.handleSetModel(this.selectItem[0].schemaId);
        }
        // 重置模型结构，因为不能保证蓝图结构的一致性
        // this.handleReset("refresh");
        // if (this.type === "template" && this.detailsType === "add") {
        //   this.handleElementChange();
        // } else {
        //   this.handleLock();
        // }
      },
      deep: true,
    },
  },
  beforeDestroy() {
    window.removeEventListener("mouseup", this.removeUp, false);
    window.removeEventListener("mousemove", this.handleMove, false);
  },
  async mounted() {
    this.isReady = false;
    this.schemaWidth = this.$refs.schemaGraphBox.offsetWidth;
    this.modalWidth = this.$refs.modelGraphBox.offsetWidth;
    this.handleGetOptions();
    // 如果是编辑或查看，则直接用schemaId查询，如果是新增，则需要根据selectItem[0]的graphSource判断。
    if (this.details.schemaId) {
      await this.handleSetModel(this.details.schemaId);
    } else if (this.selectItem[0].graphSource === 0 && this.selectItem[0].id) {
      await this.handleSetModel(this.selectItem[0].id);
    } else if (
      this.selectItem[0].graphSource === 1 &&
      this.selectItem[0].schemaId
    ) {
      await this.handleSetModel(this.selectItem[0].schemaId);
    }
    if (this.type === "template" && this.detailsType === "add") {
      await this.handleElementChange();
    } else {
      await this.handleLock();
    }
    this.isReady = true;
    console.log("this.details", this.details);
  },
  methods: {
    async handleSetModel(id) {
      try {
        const data = await graphPreview(id);
        this.getDicList();
        this.schemaData = data;
        this.$refs.schemaGraph.canvasLoading = {
          loading: true,
          tip: "正在布局...",
        };
        const nodeTypeOptions = [];
        const edgeTypeOptions = [];
        this.schemaData.edgeMetas.map((edge) => {
          edgeTypeOptions.push({
            id: edge.label,
            label: edge.label,
          });
        });
        this.schemaData.vertexMetas.map((node) => {
          nodeTypeOptions.push({
            id: node.label,
            label: node.label,
          });
        });
        this.nodeTypeOptions = nodeTypeOptions;
        this.edgeTypeOptions = edgeTypeOptions;
      } catch (error) {
        this.$message.destroy();
        this.$message.error("获取蓝图信息失败");
      }
    },
    async getDicList() {
      try {
        const logicalList = await queryDicList("logical");
        const functionList = await queryDicList("func");
        this.conditionOptions = logicalList.map((logical) => {
          return {
            label: logical.dicName,
            value: logical.dicName,
          };
        });
        this.funcList = functionList.map((func) => {
          return {
            label: func.dicName,
            value: func.dicName,
            paramsNum: func.dicValue,
          };
        });
      } catch (error) {
        this.$message.destroy();
        this.$message.error("获取下拉信息失败");
      }
    },
    handleAddEdge() {
      if (this.startVertex && this.endVertex) {
        this.target = this.startVertex;
        this.createEdge(1);
      } else if (this.startVertex) {
        this.target = this.startVertex;
        this.createNode();
        this.createEdge(2);
      } else if (this.endVertex) {
        this.target = this.endVertex;
        this.createNode();
        this.createEdge(3);
      }
      this.$nextTick(() => {
        this.$refs.modelGraph.addEdge();
      });
      this.startVertex = undefined;
      this.endVertex = undefined;
      this.handleElementChange();
    },
    resetAddElements() {
      this.addVertices = [];
      this.addEdges = [];
    },
    handleRemoveNode() {
      const searchOptions = cloneDeep(this.searchOptions);
      const currentEntityOptions = cloneDeep(this.currentEntityOptions);
      let targetNode = undefined;
      let targetEdge = undefined;
      // 有选中边 删除currentEntityOptions中相应的边
      if (this.selectedEdges.length) {
        this.selectedEdges.map((edge) => {
          if (this.currentEntity === edge.id) {
            targetEdge = edge.id;
          }
          for (let i = 0; i < this.currentEntityOptions.length; i++) {
            const item = this.currentEntityOptions[i];
            if (edge.id === item.id) {
              const index = findIndex(
                currentEntityOptions,
                (v) => v.id === edge.id
              );
              currentEntityOptions.splice(index, 1);
              break;
            }
          }
        });
        // 判断是否符合删除条件：至少保留一个点一个边
        let num = 0;
        currentEntityOptions.map((item) => {
          if (item.label.indexOf("E") !== -1) {
            num++;
          }
        });
        if (num < 1) {
          this.$message.destroy();
          this.$message.error("删除失败，请至少保留一条路径！", 3);
          return false;
        } else {
          this.currentEntityOptions = currentEntityOptions;
        }
      }
      // 删除searchOptions 与 currentEntityOptions中的相应的点，以及currentEntityOptions中相连的边
      if (this.selectedNodes.length) {
        this.selectedNodes.map((node) => {
          if (this.currentEntity === node.id) {
            targetNode = node.id;
          }
          for (let i = 0; i < this.searchOptions.length; i++) {
            const item = this.searchOptions[i];
            if (node.id === item.id) {
              const index = findIndex(searchOptions, (v) => v.id === node.id);
              searchOptions.splice(index, 1);
              break;
            }
          }
          this.currentEntityOptions.map((item) => {
            if (item.label.indexOf("E") !== -1) {
              // 边
              if (item.id.indexOf(node.id) !== -1) {
                // 该边是以目标节点为起点或终点的
                const index = findIndex(
                  currentEntityOptions,
                  (o) => o.id.indexOf(node.id) !== -1
                );
                if (index !== -1) {
                  currentEntityOptions.splice(index, 1);
                }
              }
            } else {
              // 点
              if (node.id === item.id) {
                const index = findIndex(
                  currentEntityOptions,
                  (o) => node.id === o.id
                );
                if (index !== -1) {
                  currentEntityOptions.splice(index, 1);
                }
              }
            }
          });
        });
        // 判断是否符合删除条件：至少保留一个点一个边
        let count1 = 0;
        let count2 = 0;
        currentEntityOptions.map((item) => {
          if (item.label.indexOf("E") !== -1) {
            count1++;
          } else {
            count2++;
          }
        });
        if (count1 < 1 || count2 < 1) {
          this.$message.destroy();
          this.$message.error("删除失败，请至少保留一条路径！", 3);
          return false;
        } else {
          this.searchOptions = searchOptions;
          this.currentEntityOptions = currentEntityOptions;
        }
      }

      if (targetNode || targetEdge) {
        // 不立即设置是因为可能不满足删除条件
        this.currentEntity = undefined;
      }
      this.$refs.modelGraph.removeEles();
      this.selectedElesChanged([], []);
      this.handleElementChange();
      this.handleResetData("both");
      this.pathIndex = 0;
    },
    handleGetOptions() {
      const searchOptions = [];
      const currentEntityOptions = [];
      const nodes = [];
      const edges = [];
      this.pathData.vertexMetas.map((vertex) => {
        const item = {
          id: vertex.id,
          label: vertex.name,
        };
        if (nodes.indexOf(item.value) === -1) {
          nodes.push(item.id);
          searchOptions.push(item);
          currentEntityOptions.push(item);
        }
      });
      this.pathData.edgeMetas.map((edge) => {
        const item = {
          id: edge.id,
          label: edge.name,
        };
        if (edges.indexOf(item.value) === -1) {
          edges.push(item.id);
          currentEntityOptions.push(item);
        }
      });
      this.searchOptions = searchOptions;
      this.currentEntityOptions = currentEntityOptions;
    },
    handleReset(type) {
      this.isReset = true;
      this.pathData = pathData;
      this.nodeIndex = 2;
      this.edgeIndex = 2;
      this.startVertex = undefined;
      this.endVertex = undefined;
      this.currentEntity = undefined;
      this.currentNodeType = [];
      this.currentNodeTypeAll = [];
      this.resetAddElements();
      this.$nextTick(() => {
        this.isReset = false;
      });
      this.selectedElesChanged([], []);
      this.handleGetOptions();
      this.handleResetData("both");
      if (type === "refresh") {
        this.handleElementChange();
      }
    },
    async handleLock() {
      if (!this.isLock) {
        // 即将锁定
        const arr = []; // 存放没有选择种类的点边名称
        this.$refs.modelGraph.$schema2.datas.allElements().map((ele) => {
          // 校验模型中的实体是否都已经选好了种类-label
          if (!ele.data().nodeType.length) {
            arr.push(ele.data().name);
          }
        });
        if (!arr.length) {
          this.isConfigFold = true;
          this.isMatchFold = false;
          this.isWhereFold = false;
        } else {
          this.$message.destroy();
          let names = "";
          arr.map((item, index) => {
            if (index > 0) {
              names += "、" + item;
            } else {
              names = item;
            }
          });
          this.$message.warning(`${names}还未配置种类，请配置！`, 3);
          return false;
        }
        let flag = true; // 标识符
        const list = []; // 存放异常节点
        for (let i = 0; i < this.currentElements.length; i++) {
          const element = this.currentElements[i];
          for (let j = 0; j < element.label.length; j++) {
            const ele = element.label[j];
            for (let k = 0; k < ele.rules.length; k++) {
              const rule = ele.rules[k];
              if (!rule.name || !rule.value) {
                flag = false;
                list.push(element.name);
                break;
              }
            }
          }
        }
        if (!flag) {
          let names = "";
          list.map((item, index) => {
            if (index > 0) {
              names += "、" + item;
            } else {
              names = item;
            }
          });
          this.$message.warning(`请填写${names}完整的实体规则！`);
          this.isConfigFold = false;
          this.isMatchFold = true;
          this.isWhereFold = true;
          this.isLock = false;
          return false;
        }
        this.startVertex = undefined;
        this.endVertex = undefined;
        this.isLock = true;
      } else {
        this.isConfigFold = false;
        this.isMatchFold = true;
        this.isWhereFold = true;
        this.isLock = false;
      }
      await this.handleElementChange();
    },
    handleResetData(type) {
      // 重置matchList、rulesGroup等变量
      if (type === "where") {
        // 重置where
        this.resetWhere();
      } else if (type === "sentence") {
        // 重置语句
        this.sentenceContent = "";
        this.sentenceShow = false;
        return false;
      } else {
        this.resetPath();
        this.resetWhere();
      }
      this.sentenceContent = "";
      this.sentenceShow = false;
    },
    async handleElementChange() {
      // 更新当前存在的元素信息并重置图中元素选中状态
      this.$nextTick(() => {
        const currentElements = [];
        this.$refs.modelGraph.$schema2.datas.allElements().map((ele) => {
          ele.deselect();
          currentElements.push({
            name: ele.data().name,
            label: ele.data().nodeType === "" ? [] : ele.data().nodeType,
            id: ele.id(),
          });
          this.currentElements = currentElements;
        });
        this.selectedElesChanged([], []);
      });
    },
    createNode() {
      const index = `N${++this.nodeIndex}`;
      this.addVertices = [
        {
          x: 0,
          y: 0,
          id: index,
          label: "",
          name: index,
          property: {},
          nodeType: [],
          icon: "default@@1",
        },
      ];
      this.searchOptions.push({
        id: index,
        label: index,
      });

      // 更新当前实体选项
      this.currentEntityOptions.push({
        id: index,
        label: index,
      });
    },
    createEdge(type) {
      const nodeIndex = this.nodeIndex;
      const edgeIndex = this.edgeIndex++;
      let startVertex = "";
      let endVertex = "";
      switch (type) {
        case 1:
          startVertex = this.startVertex;
          endVertex = this.endVertex;
          break;
        case 2:
          startVertex = this.startVertex;
          endVertex = `N${nodeIndex}`;
          break;
        case 3:
          startVertex = `N${nodeIndex}`;
          endVertex = this.endVertex;
          break;

        default:
          break;
      }
      const edgeId = `${startVertex}_${endVertex}_${nanoid(5)}`;
      this.addEdges = [
        {
          srcId: startVertex,
          dstId: endVertex,
          id: edgeId,
          label: "",
          name: `E${edgeIndex}`,
          nodeType: [],
          property: {},
        },
      ];

      // 更新当前实体选项
      this.currentEntityOptions.push({
        id: edgeId,
        label: `E${edgeIndex}`,
      });
    },
    handleChangeCurrent(value) {
      this.currentEntity = value;
      if (!value) {
        this.currentNodeType = [];
        this.currentNodeTypeAll = [];
        this.singleRules = [];
        this.activeKey = "";
      } else {
        this.currentElements.map((item) => {
          if (value === item.id) {
            this.currentNodeTypeAll = item.label;
            this.currentNodeType = item.label.map((cell) => {
              return cell.label;
            });
            this.singleRules = (item.label[0] && item.label[0].rules) || [];
            this.activeKey = (item.label[0] && item.label[0].label) || "";
          }
        });
      }
    },
    selectedElesChanged(nodes, edges) {
      this.selectedNodes = nodes;
      this.selectedEdges = edges;
      if (this.isLock && !this.matchList.slice(-1)[0].isConfirm) {
        this.handleChangeCurrent(undefined);
        if (edges.length) {
          const lastEdge = edges.slice(-1)[0];
          if (edges.length === 1) {
            this.handleUpdateEdge(lastEdge, "new");
          } else {
            // 按住ctrl键进行路径选择
            // 为match部分服务
            if (!this.lastEdge.id || this.lastEdge.id === lastEdge.id) {
              this.handleUpdateEdge(lastEdge, "push");
            } else {
              if (lastEdge.source !== this.lastEdge.target) {
                // 首尾不相连，无法选中，并提示
                this.$refs.modelGraph.$schema2.datas.allEdges().map((edge) => {
                  if (lastEdge.id === edge.id()) {
                    edge.deselect();
                    this.$message.destroy();
                    this.$message.warning("请选择首尾相连的关系边", 3);
                  }
                });
                const index = findIndex(
                  this.selectedEdges,
                  (o) => o.id === lastEdge.id
                );
                this.selectedEdges.splice(index, 1);
              } else {
                this.handleUpdateEdge(lastEdge, "push");
              }
            }
          }
        } else {
          this.lastEdge = {
            id: "",
            source: "",
            target: "",
          };
          this.matchList.slice(-1)[0].path = {
            edges: [],
            nodes: [],
          };
          this.matchList.slice(-1)[0].value = "";
        }
      } else if (!this.isLock) {
        if (nodes.length === 1 && !edges.length) {
          this.handleChangeCurrent(nodes[0].id);
        } else if (edges.length === 1 && !nodes.length) {
          this.handleChangeCurrent(edges[0].id);
        } else {
          this.handleChangeCurrent(undefined);
        }
      }
    },
    handleUpdateEdge(lastEdge, type) {
      this.lastEdge = lastEdge;
      const matchList = cloneDeep(this.matchList);
      let nodes = matchList[this.pathIndex].path.nodes;
      let edges = matchList[this.pathIndex].path.edges;
      if (type === "new") {
        edges = [lastEdge];
        nodes = [];
      } else {
        const edgeIndex = findIndex(edges, (o) => o.id === lastEdge.id);
        if (edgeIndex === -1) {
          // 处理edges
          edges.push(lastEdge);
        }
      }
      let pathString = "";
      edges.map((edge, index) => {
        if (!index) {
          pathString = edge.source + "->" + edge.name + "->" + edge.target;
        } else {
          pathString += "->" + edge.name + "->" + edge.target;
        }
      });
      matchList[this.pathIndex].value = pathString;
      // 处理nodes
      // 分两次添加，为了节点能按顺序
      const allNodes = this.$refs.modelGraph.$schema2.datas.allNodes();
      if (type === "new") {
        // 保证nodes里的第一个节点是路径的第一个节点
        for (let i = 0; i < allNodes.length; i++) {
          const nodeData = allNodes[i].data();
          if (lastEdge.source === nodeData.id) {
            nodes.push(nodeData);
            break;
          }
        }
        for (let i = 0; i < allNodes.length; i++) {
          const nodeData = allNodes[i].data();
          const nodeIndex = findIndex(nodes, (o) => o.id === nodeData.id);
          if (nodeIndex === -1 && lastEdge.target === nodeData.id) {
            nodes.push(nodeData);
          }
        }
      } else {
        allNodes.map((node) => {
          const nodeData = node.data();
          const nodeIndex = findIndex(nodes, (o) => o.id === nodeData.id);
          if (
            nodeIndex === -1 &&
            (lastEdge.source === nodeData.id || lastEdge.target === nodeData.id)
          ) {
            nodes.push(nodeData);
          }
        });
      }
      matchList[this.pathIndex].path.nodes = nodes;
      matchList[this.pathIndex].path.edges = edges;
      this.matchList = matchList;
    },
    handleChangeTab(activeKey) {
      this.currentNodeTypeAll.map((item) => {
        if (item.label === activeKey) {
          this.singleRules = item.rules;
        }
      });
    },
    handleChangeType(value) {
      // 修改点边的label
      this.currentNodeType = value;
      const currentNodeTypeAll = [];
      const targetLabel = find(
        this.currentElements,
        (ele) => ele.id === this.currentEntity
      ).label;
      value.map((item) => {
        if (targetLabel.length) {
          // 该实体已经有属性了
          const index = findIndex(targetLabel, (o) => o.label === item); // 判断targetLabel中的label是否在value中，如果在则更新，否则遗弃
          if (index !== -1) {
            currentNodeTypeAll.push({
              label: item,
              rules: targetLabel[index].rules, // 存放lable对应的属性规则
            });
          } else {
            currentNodeTypeAll.push({
              label: item,
              rules: [], // 存放lable对应的属性规则
            });
          }
        } else {
          // 该实体没有属性
          currentNodeTypeAll.push({
            label: item,
            rules: [], // 存放lable对应的属性规则
          });
        }
      });
      this.currentNodeTypeAll = currentNodeTypeAll;
      this.currentElements.map((item) => {
        if (item.id === this.currentEntity) {
          item.label = currentNodeTypeAll;
        }
      });
      this.activeKey = value[0];
      this.singleRules =
        (currentNodeTypeAll[0] && currentNodeTypeAll[0].rules) || [];
      const labelString = value.join("/"); // 将多个label拼接成字符串
      this.$refs.modelGraph.$schema2.datas.allElements().map((ele) => {
        if (ele.data().id === this.currentEntity) {
          const data = ele.data();
          data.label = data.name + "\n" + labelString;
          data.nodeType = currentNodeTypeAll;

          if (ele.isNode()) {
            // 找到第一个label对应的icon
            const target = find(
              this.schemaData.vertexMetas,
              (v) => v.label === value[0]
            );
            data.backgroundImage = [getBackgroundIcon(target.icon, "1")];
            data.icon = target.icon;
            this.$refs.modelGraph.$schema2.cy
              .style()
              .selector(`#${ele.id()}`)
              .css({
                "background-color": "#fff",
              });
          }
          this.$refs.modelGraph.$schema2.datas.changeData(ele, data);
        }
      });
      this.handleResetData("where");
    },
    addSingleRule() {
      const singleItem = {
        id: nanoid(),
        name: undefined,
        value: "",
        variable: "",
      };
      this.singleRules.push(singleItem);
    },
    addRules(type, key) {
      const rulesArr = this.rulesGroup;
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
      this.rulesGroup = rulesArr;
      // 页面自动滚动到底部
      let domId = undefined;
      if (this.type === "template") {
        domId = "template-details-content";
      } else {
        domId = "add-model-content";
      }
      scrollToBottom(this, domId, 5);
    },
    onSingleAttributeChange(type, value, index) {
      this.singleRules[index][type] = value;
      this.singleRules[index].variable = this.currentEntity;
      this.handleResetData("sentence");
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
    deleteSingle(index) {
      this.singleRules.splice(index, 1);
    },
    resetPath() {
      this.matchList = [
        {
          name: "p1",
          value: "",
          path: {
            edges: [],
            nodes: [],
          },
          isConfirm: false,
        },
      ];
      this.pathIndex = 0;
    },
    deletePath(index) {
      this.matchList.splice(index, 1);
      this.matchList.map((path, index) => {
        path.name = `p${index + 1}`;
      });
      --this.pathIndex;
      this.handleElementChange();
    },
    confirmPath(index) {
      // 确认路径
      this.matchList[index].isConfirm = true;
      this.handleElementChange();
    },
    addPath() {
      this.matchList.push({
        name: `p${++this.pathIndex + 1}`,
        value: "",
        path: {
          nodes: [],
          edges: [],
        },
        isConfirm: false,
      });
      this.handleElementChange();
    },
    resetWhere() {
      this.rulesGroup = [
        {
          id: -1,
          types: "relations",
          relations: "且",
          label: undefined,
        },
      ];
    },
    async handleGetSentence() {
      if (this.process) {
        return false;
      }
      this.process = true;
      this.$message.loading("正在生成cypher语句", 0);
      const json = {
        nodeList: [],
        conditionList: [],
      };
      this.matchList.map((item, num) => {
        const nodes = this.matchList[num].path.nodes;
        const edges = this.matchList[num].path.edges;
        const nodeIndex = findIndex(
          nodes,
          (o) => o.id === item.path.edges[0].source
        );
        const pathJson = {};
        pathJson.variable = nodes[nodeIndex].name;
        pathJson.labels = nodes[nodeIndex].nodeType.map((item) => item.label);
        pathJson.nodeProperty = [];
        nodes[nodeIndex].nodeType.map((item) => {
          pathJson.nodeProperty.push(...item.rules);
        });
        pathJson.relation = this.createPathJson(edges[0], 0, num);
        json.nodeList.push(pathJson);
      });
      if (
        this.rulesGroup.length === 2 &&
        !Array.isArray(this.rulesGroup.slice(-1)[0]) &&
        !this.rulesGroup.slice(-1)[0].conditionList.length
      ) {
        this.$message.destroy();
        this.$message.error("若无限定条件，请删除空下拉框");
        this.process = false;
        return false;
      } else {
        const conditionList = this.handleCreateRuleGroupJson(
          this.rulesGroup,
          []
        );
        if (!conditionList) {
          this.process = false;
          return false;
        } else {
          json.conditionList = conditionList;
        }
      }
      try {
        const res = await createCypher(json);
        this.process = false;
        this.$message.destroy();
        if (res.data) {
          this.$message.success("生成cypher语句成功");
          let indexList = []; // 存放index
          let bracketsList1 = []; // 存放括号 二维数组
          let bracketsList2 = []; // 存放括号 二维数组
          for (let i = 0; i < res.data.length; i++) {
            const ele = res.data[i];
            if (ele === "(") {
              bracketsList1.push([i, ""]);
            } else if (ele === ")") {
              bracketsList1.slice(-1)[0][1] = i;
              bracketsList2.push(
                ...bracketsList1.splice(bracketsList1.length - 1, 1)
              );
            }
          }
          const keywordList = ["MATCH", "WHERE", "AND", "OR", "RETURN"]; // 需要换行的关键词, "(", ")"
          keywordList.map((keyword) => {
            let index = res.data.indexOf(keyword);
            while (index !== -1) {
              indexList.push(index);
              index = res.data.indexOf(keyword, index + 1); // 从字符串出现的位置的下一位置开始继续查找
            }
          });
          indexList = indexList.sort((a, b) => a - b); // 对indexList进行排序
          const indexList2 = cloneDeep(indexList);
          bracketsList2.map((list) => {
            indexList2.map((index, num) => {
              if (list[0] < index && index < list[1]) {
                // 去掉括号中的换行
                indexList2.splice(num, 1);
              }
            });
          });
          let sentenceContent = res.data.slice(0, indexList2[1]);
          for (let i = 0; i < indexList2.length; i++) {
            const index = indexList2[i];
            const indexAfter = indexList2[i + 1];
            if (i > 0 && indexAfter) {
              sentenceContent += "\n" + res.data.slice(index, indexAfter);
            } else if (i > 0 && !indexAfter) {
              sentenceContent += "\n" + res.data.slice(index);
            }
          }

          this.sentenceContent = sentenceContent;
          this.sentenceShow = true;

          // 页面自动滚动到底部
          scrollToBottom(this, "add-model-content", 20);
        } else {
          const message = res.message ? res.message : "生成cypher语句失败";
          this.$message.error(message);
          this.sentenceShow = false;
        }
      } catch (error) {
        this.$message.destroy();
        this.$message.error("生成cypher语句失败");
        this.sentenceShow = false;
      }
    },
    createPathJson(edge, index, num) {
      const nodes = this.matchList[num].path.nodes;
      const edges = this.matchList[num].path.edges;
      // 边
      let json = {};
      json.variable = edge.name;
      json.labels = edge.nodeType.map((item) => item.label);
      json.relationProperty = [];
      edge.nodeType.map((item) => {
        json.relationProperty.push(...item.rules);
      });
      const nodeIndex = findIndex(nodes, (o) => o.id === edge.target);
      json.node = {
        variable: nodes[nodeIndex].name,
        labels: nodes[nodeIndex].nodeType.map((item) => item.label),
      };
      json.node.nodeProperty = [];
      nodes[nodeIndex].nodeType.map((item) => {
        json.node.nodeProperty.push(...item.rules);
      });
      if (edges.length - 1 > index) {
        json.node.relation = this.createPathJson(
          edges[index + 1],
          index + 1,
          num
        );
      } else {
        json.node.relation = null;
      }
      return json;
    },
    handleCreateConditionJson(json, index, list) {
      // 拼接单条语句的方法-child部分
      const condition = list[index];
      json.type = condition.type + "";
      switch (condition.type) {
        case 1:
          // 运算符
          json.operate = condition.value;
          break;
        case 2:
          // 常量值
          if (condition.inputType === "ValueTime") {
            json.constant = {
              value: moment(condition.value).format("YYYY-MM-DD HH:mm:ss"),
              type: "ValueString",
            };
          } else {
            json.constant = {
              value: condition.value,
              type: condition.inputType,
            };
          }
          break;
        case 3:
          // 属性
          json.property = {
            variable: condition.objValue,
            name: condition.value,
          };
          break;
        case 4:
          // 函数
          json.func = {
            funcName: condition.value.funcName,
            funcValue: [],
          };
          condition.value.funcValue.map((cond) => {
            let conditionJson = {};
            // 入参-即条件
            if (cond.conditionList.length) {
              conditionJson = this.handleCreateConditionJson(
                conditionJson,
                0,
                cond.conditionList
              );
            }
            json.func.funcValue.push(conditionJson);
          });
          break;
        default:
          break;
      }
      if (list.length - 1 > index) {
        // 接着递归
        json.child = {};
        json.child = this.handleCreateConditionJson(
          json.child,
          index + 1,
          list
        );
      }
      return json;
    },
    handleCreateRuleGroupJson(list, arr) {
      let flag = true;
      for (let i = 0; i < list.length; i++) {
        // type:1-运算符、2-常量值、3-属性 4-函数 5-条件组
        const rule = list[i];
        if (i > 0) {
          let conditionJson = {};
          conditionJson.logical = list[0].relations === "且" ? "and" : "or";
          if (Array.isArray(rule)) {
            // 条件组
            conditionJson.type = "5";
            if (rule.length === 1) {
              this.$message.destroy();
              this.$message.error("若无限定条件，请删除空条件组");
              flag = false;
              break;
            } else if (
              rule.length === 2 &&
              !Array.isArray(rule.slice(-1)[0]) &&
              !rule.slice(-1)[0].conditionList.length
            ) {
              this.$message.destroy();
              this.$message.error("若无限定条件，请删除空下拉框");
              flag = false;
              break;
            } else {
              const conditionArr = this.handleCreateRuleGroupJson(rule, []);
              if (!conditionArr) {
                flag = false;
                break;
              } else {
                conditionJson.conditionArr = conditionArr;
              }
            }
          } else {
            // 条件
            if (!rule.conditionList.length) {
              this.$message.destroy();
              this.$message.error("若无限定条件，请删除空下拉框");
              flag = false;
              break;
            } else {
              conditionJson = this.handleCreateConditionJson(
                conditionJson,
                0,
                rule.conditionList
              );
            }
          }
          arr.push(conditionJson);
        }
      }
      if (flag) {
        return arr;
      } else {
        return;
      }
    },
    handleEditSentence() {
      this.editConfirmVisible = true;
      this.logContent = "";
      this.editSentence = this.sentenceContent;
    },
    onEditConfirmCancel() {
      this.editConfirmVisible = false;
    },
    async handleEditCypher() {
      const flag = await this.handleCheckGrammar(this.editSentence);
      this.$message.destroy();
      if (flag) {
        this.$message.success("修改成功");
        this.sentenceContent = this.editSentence;
        this.onEditConfirmCancel();
      } else {
        this.$message.error("cypher语句语法存在问题，请修正后再重试！");
      }
    },
    async handleCheckGrammar(value) {
      // 语法校验
      const payload = {
        cypher: value,
      };
      try {
        const resData = await cypherGrammarVerify(payload);
        this.$message.destroy();
        if (resData.data.length) {
          this.$message.error("语法错误");
          this.logContent = "error：" + resData.data[0].detail;
          return false;
        } else {
          this.logContent = "语法正确";
          this.$message.success("语法正确");
          return true;
        }
      } catch (error) {
        this.logContent = "语法校验失败";
        return false;
      }
    },
    onmousedown(e) {
      this.ismousedown = true;
      this.mouseDownX = e.pageX;
      // 记录此时模型区域的宽度
      this.modalWidth = this.$refs.modelGraphBox.offsetWidth;
      this.$refs.modelGraphBox.style.width = this.modalWidth + "px";
      document.body.onselectstart = () => false; // 防止页面元素出现被选中的蓝色状态，学到了
      window.addEventListener("mousemove", this.handleMove, false);
      window.addEventListener("mouseup", this.removeUp, false);
    },
    handleMove(e) {
      const deltaX = this.mouseDownX - e.pageX;
      this.modalWidth = this.modalWidth + deltaX;
      this.schemaWidth = this.$refs.schemaGraphBox.offsetWidth;
      this.$refs.modelGraphBox.style.width = this.modalWidth + "px";
      this.mouseDownX = e.pageX;
    },
    removeUp(e) {
      document.body.onselectstart = () => true;
      if (this.ismousedown && e.pageX !== this.mouseDownX) {
        this.ismousedown = false;
      }
      window.removeEventListener("mousemove", this.handleMove, false);
    },
  },
};
</script>
<style lang="less">
.config-template-config {
  width: 100%;
  background: #fff;

  &-graph {
    flex: 1;
    width: 100%;
    display: flex;
    overflow: hidden;
    height: 400px;
    margin-bottom: 24px;

    .sep-bar {
      width: 12px;
      display: flex;
      cursor: ew-resize;
      position: relative;
      justify-content: center;
      background-color: @borderColor;
      height: 100%;

      img {
        top: 50%;
        position: absolute;
        transform: translateY(-50%) rotate(90deg);
      }
    }

    &-schema {
      flex: 1;
    }

    &-model {
      width: calc(50% - 6px);

      .schema-graph-canvas {
        height: calc(100% - 100px);
      }
    }

    &-schema,
    &-model {
      position: relative;
      border: 1px solid #d5d5d5;
      overflow: hidden;
      min-width: 0;
      height: 100%;

      .graph-title {
        top: 0;
        font-size: 14px;
        line-height: 40px;
        position: absolute;
        padding-left: 14px;
        color: @primaryTextColor;
      }

      .schema-graph-contain {
        top: 0;
        width: 100%;
        height: 100%;
        position: absolute;

        .schema-graph {
          padding-top: 40px;

          .layout {
            top: 7.5px;
            right: 38px;
            width: calc(100% - 38px);

            .layout-title {
              display: none;
            }

            .layout-select {
              color: @primaryTextColor;
            }
          }

          .adapt-screen {
            top: 10px;
            right: 12px;
          }

          .schema-graph-canvas {
            background: #fafafa;
          }
        }
      }
    }

    &-btns {
      right: 0;
      bottom: 0;
      width: 100%;
      display: flex;
      height: 100px;
      position: absolute;
      justify-content: space-between;

      .btns-select {
        display: flex;
        padding: 0 16px;
        justify-content: flex-start;

        .select-btns {
          width: 180px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;

          &-item {
            display: flex;
            align-items: center;

            .btns-label {
              width: 55px;
              font-size: 14px;
              user-select: none;
              color: @primaryTextColor;

              &.disabled {
                color: @secondaryTextColor;
              }
            }

            .vertex-options {
              width: calc(100% - 55px);
            }
          }
        }

        .btns-actions {
          display: flex;
          margin-left: 16px;
          flex-direction: column;
          justify-content: space-evenly;

          .action-btn {
            padding: 0;
            width: 76px;
            height: 32px;
            text-align: center;
          }
        }
      }

      .btns-operation {
        right: 16px;
        bottom: 12px;
        position: absolute;

        .action-btn {
          border: 0;
          color: @blue;
          border-radius: 0;
          background: #fff !important;

          &.disabled {
            cursor: not-allowed;
            color: @disabledColor;
          }
        }
      }
    }
  }

  &-property {
    &:not(:last-child) {
      padding-bottom: 36px;
    }

    .config-template-config-item {
      &:nth-child(3) {
        .config-template-config-item-content {
          padding: 0 13px;
        }
      }

      &-title {
        display: flex;
        align-items: center;
        margin-bottom: 24px;
        justify-content: space-between;

        .info-circle {
          width: 14px;
          height: 14px;
          cursor: pointer;
          margin-left: 10px;
          margin-bottom: 2px;
        }

        .anticon {
          padding: 5px;
        }
      }

      &-content {
        display: block;
        padding: 24px 32px;
        padding-top: 0;
        overflow: auto;

        .content-box {
          display: flex;
          align-items: center;

          &:not(:last-child) {
            padding-bottom: 16px;
          }

          .item-box-label {
            color: #000;
            user-select: none;
          }

          .item-box-content {
            width: calc(100% - 80px);
            display: flex;
            align-items: center;

            &-text {
              color: @activeFontColor;

              &.no-content {
                color: #d9d9d9;
              }
            }

            &-select {
              width: 300px;
            }

            &-btn {
              margin-right: 16px;
            }

            &-input {
              margin-right: 16px;
              width: calc(100% - 134px);
              color: #6f6f6f !important;
              background-color: #fff !important;
            }

            .anticon-delete {
              font-size: 16px;
            }

            .anticon-plus-square {
              font-size: 18px;
              height: 18px;
              vertical-align: middle;
            }

            &-icon {
              color: @activeFontColor;

              &.disabled {
                cursor: not-allowed;
                color: @disabledColor;
              }
            }
          }
        }

        .content-tabs {
          .ant-tabs-bar {
            margin: 0;
          }
        }

        .content-rules {
          min-height: 73px;
          max-height: 333px;
          background: #fafbff;
          border: 1px solid #e8e8e8;
          border-top: 0;
          overflow: auto;
          padding: 10px;

          .rules-single {
            width: 530px;
            display: flex;
            align-items: center;
            position: relative;
            padding: 10px 0 10px 10px;

            .rule-options,
            .rules-single-input {
              width: 160px;
              margin: 0 5px;
            }

            .condition-options {
              width: 120px;
              margin: 0 5px;
            }

            .anticon-file {
              font-size: 16px;
              color: #949dad;
            }

            .anticon-delete {
              color: @activeFontColor;
              font-size: 16px;
              margin-left: 10px;
            }
          }
        }

        .config-btns {
          padding-left: 10px;

          &-btn {
            margin-right: 10px;

            .anticon {
              font-size: 15px;
            }
          }
        }
      }
    }
  }

  &-show {
    margin: 36px 0 16px 0;

    .show-content {
      min-height: 115px;

      &-input {
        min-height: 115px;
        color: #6f6f6f !important;
        background: #fff;
        word-break: break-all;
      }
    }
  }
}

.save-model-modal {
  .ant-modal-header {
    .ant-modal-title {
      font-weight: 600;
    }
  }

  .ant-modal-body {
    padding: 24px 40px;
  }

  .ant-modal-footer {
    .ant-btn {
      margin-right: 24px;
      margin-left: 0;
    }
  }

  &-content {
    &-item {
      display: flex;

      &:first-child {
        margin-bottom: 16px;
      }

      .content-item-label {
        width: 85px;
        text-align: right;
        line-height: 32px;

        .require {
          line-height: 32px;
          font-style: italic;
          color: #ff3838;
          margin-right: 5px;
        }

        .label-text {
          color: #000;
        }
      }

      .content-item-main {
        width: calc(100% - 85px);
      }
    }
  }
}

.edit-confirm-modal {
  &-content {
    overflow: hidden;

    .content-body {
      display: flex;
      flex-wrap: wrap;
      position: relative;
      padding-bottom: 50px;
      justify-content: space-between;

      &-text {
        width: 100%;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.65);
      }

      &-btn {
        position: absolute;
        right: 0;
        bottom: 0;
      }
    }

    .content-log {
      margin: 16px 0;
      height: 100px;
      overflow: auto;
      padding: 4px 11px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
    }

    .content-btns {
      float: right;

      .ant-btn {
        margin-left: 16px;
      }
    }
  }
}

.model-tooltip {
  max-width: 360px;
}
</style>
