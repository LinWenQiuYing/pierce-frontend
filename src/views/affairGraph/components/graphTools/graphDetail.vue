<template>
  <div class="graph-detail">
    <div
      class="graph-detail-button"
      :style="{
        transform: isFold ? 'translateX(0)' : 'translateX(60px)',
        transition: isFold ? 'all 0.3s 0.3s' : 'all 0.3s',
      }"
      @click="handleChangeFold(false)"
    >
      <a-icon type="double-left" />
      <span class="graph-detail-button-text">图谱信息</span>
    </div>
    <div
      class="graph-detail-content"
      :style="{
        transform: isFold ? 'translateX(400px)' : 'translateX(0)',
        transition: isFold ? 'all 0.3s' : 'all 0.3s 0.3s',
      }"
    >
      <div class="graph-detail-content-title">
        <span class="graph-detail-content-title-text">图谱信息</span>
        <a-icon
          type="close"
          class="graph-detail-content-title-icon"
          @click="handleChangeFold(true)"
        />
      </div>
      <div class="graph-detail-content-main">
        <a-skeleton active :loading="canvasLoading.loading">
          <div v-if="selectedNodes && selectedNodes.length === 1">
            <p class="info-title">基本信息</p>
            <a-row class="info-content-item">
              <a-col class="field-name" :span="4">类型：</a-col>
              <a-col class="field-content" :span="20">{{
                selectedNodes[0].nodeType === "社群" ? "社群" : "实体"
              }}</a-col>
            </a-row>
            <a-row
              class="info-content-item"
              v-if="selectedNodes[0].nodeType !== '社群'"
            >
              <a-col class="field-name" :span="4">标签：</a-col>
              <a-col class="field-content" :span="20">
                <div class="label-content" v-if="selectedNodes[0].tags">
                  <span class="label-content-item">{{
                    selectedNodes[0].nodeType
                  }}</span>
                  <span
                    class="label-content-item"
                    v-for="tag in selectedNodes[0].tags"
                    :key="tag"
                  >
                    {{ tag }}
                  </span>
                </div>
                <div class="label-content" v-else>
                  <span class="label-content-item">{{
                    selectedNodes[0].nodeType
                  }}</span>
                </div>
              </a-col>
            </a-row>
            <a-row
              class="info-content-item"
              v-if="selectedNodes[0].nodeType === '企业'"
            >
              <a-col class="field-name" :span="4">名称：</a-col>
              <a-col class="field-content" :span="20">
                <div class="label-content">
                  <span
                    class="check-details"
                    @click="checkDetails(selectedNodes[0].name)"
                  >
                    {{ selectedNodes[0].name }}
                  </span>
                </div>
              </a-col>
            </a-row>
            <a-row
              class="info-content-item"
              v-if="selectedNodes[0].nodeType !== '社群'"
            >
              <a-col class="field-name" :span="4">出度：</a-col>
              <a-col class="field-content" :span="20">
                <div class="label-content">
                  {{ outdegree }}
                  <a-tooltip placement="top">
                    <template slot="title">
                      <span>表示图谱上以该实体为起点的关系数量总和</span>
                    </template>
                    <a-icon type="question-circle" />
                  </a-tooltip>
                </div>
              </a-col>
            </a-row>
            <a-row
              class="info-content-item"
              v-if="selectedNodes[0].nodeType !== '社群'"
            >
              <a-col class="field-name" :span="4">入度：</a-col>
              <a-col class="field-content" :span="20">
                <div class="label-content">
                  {{ indegree }}
                  <a-tooltip placement="top">
                    <template slot="title">
                      <span>表示图谱上以该实体为起点的关系数量总和</span>
                    </template>
                    <a-icon type="question-circle" />
                  </a-tooltip>
                </div>
              </a-col>
            </a-row>
            <div v-if="selectedNodes[0].nodeType !== '社群'">
              <p class="info-title second-title">标签信息</p>
              <a-input
                allow-clear
                v-model.trim="value"
                autoComplete="off"
                class="params-input"
                @change="onInputChange"
                placeholder="请输入标签名"
              >
                <a-icon slot="suffix" type="search" />
              </a-input>
              <div
                class="attribute-panel"
                v-for="key in enumerableKeys"
                :key="key"
              >
                <div class="attribute-panel-header">
                  <div class="name-bar"></div>
                  <div class="name-text">{{ key }}</div>
                </div>
                <div class="attribute-panel-content">
                  {{ params.get(key) }}
                </div>
              </div>
            </div>
            <div class="group" v-if="selectedNodes[0].nodeType === '社群'">
              <p class="group-header">
                社群分组依据：
                {{
                  selectedNodes[0].data.entityName +
                  " (" +
                  selectedNodes[0].data.ruleName +
                  ") "
                }}
              </p>
              <div class="group-list">
                <div
                  class="group-list-item"
                  v-for="(item, index) in selectedNodes[0].data.resultIdArr"
                  :key="item.index"
                >
                  <span
                    class="item-color"
                    :style="{
                      backgroundColor: selectedNodes[0].data.colorArr[index],
                    }"
                  ></span>
                  <span class="item-value">{{ item.value }}</span>
                  <span class="item-number">{{ item.arr.length }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="selectedEdges && selectedEdges.length === 1">
            <p class="info-title">基本信息</p>
            <a-row class="info-content-item">
              <a-col class="field-name" :span="4">类型：</a-col>
              <a-col class="field-content" :span="20">边</a-col>
            </a-row>
            <a-row class="info-content-item">
              <a-col class="field-name" :span="4">标签：</a-col>
              <a-col class="field-content" :span="20">
                <div class="label-content" v-if="selectedEdges[0].tags">
                  <span class="label-content-item">{{
                    selectedEdges[0].nodeType
                  }}</span>
                  <span
                    class="label-content-item"
                    v-for="tag in selectedEdges[0].tags"
                    :key="tag"
                  >
                    {{ tag }}
                  </span>
                </div>
                <div class="label-content" v-else>
                  <span class="label-content-item">{{
                    selectedEdges[0].nodeType
                  }}</span>
                </div>
              </a-col>
            </a-row>
            <p class="info-title second-title">标签信息</p>
            <a-input
              autoComplete="off"
              v-model.trim="value"
              class="params-input"
              @change="onInputChange"
              allow-clear
              placeholder="请输入标签名"
            >
              <a-icon slot="suffix" type="search" />
            </a-input>
            <div
              class="attribute-panel"
              v-for="key in enumerableKeys"
              :key="key"
            >
              <div class="attribute-panel-header">
                <div class="name-bar"></div>
                <div class="name-text">{{ key }}</div>
              </div>
              <div class="attribute-panel-content">
                {{ params.get(key) }}
              </div>
            </div>
          </div>
          <div v-else>
            <div class="stats-bar-area">
              <div class="stats-bar-area-title">类型</div>
              <div
                class="stats-wrapper"
                v-for="item in totalItems"
                :key="item.name"
              >
                <div
                  class="stats-progress"
                  @click="handleClickProgress(item.name)"
                >
                  <div
                    class="stats-progress-content"
                    :style="{ width: (item.size / totalMax) * 100 + '%' }"
                  >
                    <a-tooltip placement="left">
                      <template slot="title">
                        <span>{{ item.name }}</span>
                      </template>
                      <span class="stats-progress-text">{{ item.name }}</span>
                    </a-tooltip>
                  </div>
                </div>
                <div class="stats-count">{{ item.size }}</div>
              </div>
            </div>
            <div class="stats-bar-area">
              <div class="stats-bar-area-title">概念标签（Label）</div>
              <div
                class="stats-wrapper"
                v-for="item in nodeItems"
                :key="item.name"
              >
                <div
                  class="stats-progress"
                  @click="handleClickProgress(item.name)"
                >
                  <div
                    class="stats-progress-content"
                    :style="{ width: (item.size / nodeMax) * 100 + '%' }"
                  >
                    <a-tooltip placement="left">
                      <template slot="title">
                        <span>{{ item.name }}</span>
                      </template>
                      <span class="stats-progress-text">{{ item.name }}</span>
                    </a-tooltip>
                  </div>
                </div>
                <div class="stats-count">{{ item.size }}</div>
              </div>
            </div>
            <div class="stats-bar-area">
              <div class="stats-bar-area-title">边类型</div>
              <div
                class="stats-wrapper"
                v-for="item in edgeItems"
                :key="item.name"
              >
                <div
                  class="stats-progress"
                  @click="handleClickProgress(item.name)"
                >
                  <div
                    class="stats-progress-content"
                    :style="{ width: (item.size / edgeMax) * 100 + '%' }"
                  >
                    <a-tooltip placement="left">
                      <template slot="title">
                        <span>{{ item.name }}</span>
                      </template>
                      <span class="stats-progress-text">{{ item.name }}</span>
                    </a-tooltip>
                  </div>
                </div>
                <div class="stats-count">{{ item.size }}</div>
              </div>
            </div>
            <div class="stats-bar-area" v-if="tagItems.length">
              <div class="stats-bar-area-title">标签</div>
              <div
                class="stats-wrapper"
                v-for="item in tagItems"
                :key="item.name"
              >
                <div
                  class="stats-progress"
                  @click="handleClickProgress(item.name)"
                >
                  <div
                    class="stats-progress-content"
                    :style="{ width: (item.size / tagMax) * 100 + '%' }"
                  >
                    <a-tooltip placement="left">
                      <template slot="title">
                        <span>{{ item.name }}</span>
                      </template>
                      <span class="stats-progress-text">{{ item.name }}</span>
                    </a-tooltip>
                  </div>
                </div>
                <div class="stats-count">{{ item.size }}</div>
              </div>
            </div>
          </div>
        </a-skeleton>
      </div>
    </div>
  </div>
</template>
<script>
import { Col, Input, Row, Skeleton, Tooltip } from "ant-design-vue";
import { classStatistic, getKgFields } from "@/utils/graph.js";

export default {
  name: "GraphDetail",
  props: ["canvasLoading", "selectedNodes", "selectedEdges", "graphNodes"],
  data() {
    return {
      elementData: this.selectedNodes[0],
      indegree: 0,
      outdegree: 0,
      value: "",
      params: undefined,
      existIdParams: false,
      enumerableAllKeys: [],
      enumerableKeys: [],
      totalItems: [],
      nodeItems: [],
      edgeItems: [],
      tagItems: [],
      totalMax: -Infinity,
      nodeMax: -Infinity,
      edgeMax: -Infinity,
      tagMax: -Infinity,
      isFold: true,
      isDetailsShow: false, // 是否展示
    };
  },
  mounted() {
    this.init();
  },
  watch: {
    selectedNodes() {
      if (this.selectedNodes.length) {
        this.isDetailsShow = false;
        const paramKeys = [];
        this.$graph.datas.allNodes().filter((node) => {
          if (node.id() === this.selectedNodes[0].id) {
            this.indegree = node.indegree(true);
            this.outdegree = node.outdegree(true);
            this.params = node.data().params;
            const filterParams = ["icon", "baseStyle", "colour", "size"];
            for (let [key] of node.data().params) {
              //把样式相关的属性隐藏
              if (filterParams.indexOf(key) === -1) {
                paramKeys.push(key);
              }
            }
            this.enumerableKeys = getKgFields(paramKeys, (key) => key);
            this.enumerableAllKeys = this.enumerableKeys;
            this.existIdParams = paramKeys.includes("_id");
          }
        });
      } else if (this.selectedEdges.length) {
        this.isDetailsShow = false;
        const paramKeys = [];
        this.$graph.datas.allEdges().filter((edge) => {
          if (edge.id() === this.selectedEdges[0].id) {
            this.params = edge.data().params;
            const filterParams = ["baseStyle", "colour", "size"];
            for (let [key] of edge.data().params) {
              //把样式相关的属性隐藏
              if (filterParams.indexOf(key) === -1) {
                paramKeys.push(key);
              }
            }
            this.enumerableKeys = getKgFields(paramKeys, (key) => key);
            this.enumerableAllKeys = this.enumerableKeys;
            this.existIdParams = paramKeys.includes("_id");
          }
        });
      } else {
        if (!this.isDetailsShow) {
          this.isDetailsShow = true;
        } else {
          this.isDetailsShow = false;
          this.handleChangeFold(true);
        }
      }
    },
    graphNodes() {
      this.init();
    },
  },
  components: {
    ACol: Col,
    AInput: Input,
    ARow: Row,
    ASkeleton: Skeleton,
    ATooltip: Tooltip,
  },
  methods: {
    init() {
      const nodes = this.$graph.datas
        .allNodes()
        .filter((node) => !node.data().id.includes("community"));
      const edges = this.$graph.datas.allEdges();
      const nodeCount = nodes.size();
      const edgeCount = edges.size();
      this.totalItems = [
        {
          name: "实体",
          size: nodeCount,
        },
        {
          name: "关系",
          size: edgeCount,
        },
      ];
      this.nodeItems = classStatistic(nodes);
      this.edgeItems = classStatistic(edges);
      this.totalItems.forEach((item) => {
        if (item.size > this.totalMax) {
          this.totalMax = item.size;
        }
      });
      this.nodeItems.forEach((item) => {
        if (item.size > this.nodeMax) {
          this.nodeMax = item.size;
        }
      });
      this.edgeItems.forEach((item) => {
        if (item.size > this.edgeMax) {
          this.edgeMax = item.size;
        }
      });
      const tags = new Map();
      const tagItems = [];
      for (const node of nodes) {
        if (node.data().tags) {
          for (const tag of node.data().tags) {
            tags.set(tag, (tags.get(tag) || 0) + 1);
          }
        }
      }
      for (const tag of tags.keys()) {
        tagItems.push({
          name: tag,
          title: tag,
          size: tags.get(tag),
        });
      }
      this.tagItems = tagItems;
    },
    checkDetails(name) {
      this.$router.push({
        name: "enterpriseInsight",
        params: {
          entName: name,
        },
      });
    },
    onInputChange(e) {
      const value = e.currentTarget.value;
      this.enumerableKeys = this.enumerableAllKeys.filter((key) => {
        if (key.indexOf(value) > -1) {
          return key;
        }
      });
    },
    handleChangeFold(flag) {
      this.isFold = flag;

      if (!flag) {
        this.isDetailsShow = true;
      }
    },
    handleClickProgress(type) {
      const nodes = this.$graph.datas
        .allNodes()
        .filter((node) => !node.data().id.includes("community"));
      const edges = this.$graph.datas.allEdges();
      const nodeIds = nodes.map((item) => item.data().id);
      const edgeIds = edges.map((item) => item.data().id);
      const enterpriseNodeIds = [];
      const accountNodeIds = [];
      const personNodeIds = [];
      const singleEdgeIds = [];
      for (let i = 0; i < nodes.length; i++) {
        const element = nodes[i];
        if (element.data().nodeType === "企业") {
          enterpriseNodeIds.push(element.data().id);
        } else if (element.data().nodeType === "账号") {
          accountNodeIds.push(element.data().id);
        } else if (element.data().nodeType === "个人") {
          personNodeIds.push(element.data().id);
        }
      }
      switch (type) {
        case "实体":
          this.$graph.events.selectElements(nodeIds);
          break;
        case "关系":
          this.$graph.events.selectElements(edgeIds);
          break;
        case "企业":
          this.$graph.events.selectElements(enterpriseNodeIds);
          break;
        case "账号":
          this.$graph.events.selectElements(accountNodeIds);
          break;
        case "个人":
          this.$graph.events.selectElements(personNodeIds);
          break;
        default:
          for (let i = 0; i < edges.length; i++) {
            const edge = edges[i];
            if (edge.data().nodeType === type) {
              singleEdgeIds.push(edge.data().id);
            }
          }
          this.$graph.events.selectElements(singleEdgeIds);
          break;
      }
    },
  },
};
</script>
<style lang="less">
.graph-detail {
  &-button {
    right: 0;
    top: 64px;
    width: 30px;
    display: flex;
    overflow: hidden;
    position: absolute;
    background: #fff;
    flex-direction: column;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    box-shadow: 0px 0px 6px rgb(134, 134, 134, 31%);

    .anticon-double-left {
      width: 30px;
      height: 30px;
      padding: 8px;
      color: #fff;
      background: @activeFontColor;
    }

    &-text {
      padding: 4px 8px;
      color: #9da9c2;
      line-height: 18px;
    }
  }

  &-content {
    right: 0;
    bottom: 0;
    top: 64px;
    width: 360px;
    overflow: hidden;
    position: absolute;
    background: #fff;
    box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.16);

    &-title {
      display: flex;
      font-size: 18px;
      padding: 16px 24px;
      align-items: center;
      justify-content: space-between;

      &-text {
        font-weight: 600;
        color: @primaryTextColor;
      }
    }

    &-main {
      padding: 24px;
      overflow: auto;
      height: calc(100% - 59px);
      border-top: 1px solid #e0e0e0;

      .info-title {
        font-size: 15px;
        margin-bottom: 16px;
        color: @primaryTextColor;

        &.second-title {
          margin-top: 30px;
        }
      }

      .info-content-item {
        color: #949dad;
        margin-bottom: 6px;

        .field-name {
          height: 26px;
          line-height: 26px;
        }

        .field-content {
          line-height: 26px;
        }

        .label-content {
          display: flex;
          align-items: center;

          &-item {
            margin-top: 2px;
            height: 22px;
            font-size: 12px;
            padding: 0 10px;
            color: @activeFontColor;
            line-height: 20px;
            text-align: center;
            display: inline-block;
            background: #e6f7ff;
            border: 1px solid #91d5ff;
          }

          .check-details {
            cursor: pointer;
            color: @activeFontColor;
          }

          .anticon-question-circle {
            color: @activeFontColor;
            margin-left: 16px;
          }
        }
      }

      .attribute-panel {
        display: flex;
        padding: 10px;
        font-size: 12px;
        user-select: text;
        background: #fafafa;
        flex-direction: column;

        &-header {
          display: flex;
          margin-bottom: 5px;
          align-items: center;

          .name-bar {
            width: 3px;
            height: 10px;
            margin-right: 8px;
            background: #4e4e4e;
          }

          .name-text {
            flex: 1;
            word-break: break-word;
          }
        }

        &-content {
          word-break: break-word;
        }
      }

      .params-input {
        margin-bottom: 16px;
      }

      .stats-bar-area {
        margin-bottom: 30px;

        &-title {
          color: @primaryTextColor;
        }

        .stats-wrapper {
          width: 300px;
          display: flex;
          margin-top: 8px;
          align-items: center;
          justify-content: space-between;

          .stats-progress {
            width: 214px;
            height: 20px;
            cursor: pointer;
            line-height: 20px;
            margin-left: 40px;
            border-radius: 10px;
            background: #e9eff5;

            &-content {
              display: flex;
              height: 20px;
              line-height: 20px;
              padding-left: 12px;
              align-items: center;
              border-radius: 10px;
              position: relative;
              background-image: linear-gradient(to right, #67cbfe, #1495eb);

              .stats-progress-text {
                font-size: 12px;
                position: absolute;
                left: -40px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                width: 40px;
              }
            }
          }
        }
      }

      .group {
        margin-top: 30px;

        &-header {
          margin-bottom: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        &-list {
          &-item {
            display: flex;
            align-items: center;

            .item-color {
              height: 10px;
              width: 10px;
              margin: 0 5px;
              display: inline-block;
              vertical-align: super;
            }

            .item-value {
              width: 228px;
              user-select: none;
              overflow: hidden;
              display: inline-block;
              white-space: nowrap;
              text-overflow: ellipsis;
              color: rgb(40, 55, 79);
            }

            .item-number {
              font-weight: 700;
              vertical-align: super;
              color: rgb(40, 55, 79);
            }
          }
        }
      }
    }
  }
}
</style>
