<template>
  <a-modal
    :width="640"
    :mask="false"
    :footer="null"
    title="场景查询"
    :closable="true"
    @cancel="onCancel"
    :destroyOnClose="true"
    class="scene-search-modal"
    :visible="showSceneSearch"
  >
    <a-tabs :active-key="activeKey" @change="onKeychange">
      <a-tab-pane key="1" tab="实体查询" v-if="userRights.btn_entitySearch">
        <entity-search
          ref="entitySearch"
          :graphNodes="graphNodes"
          :searchNodeAll="searchNodeAll"
          :savedEntityData="savedEntityData"
          :entitySearchOption="entitySearchOption"
          @graphNodesChanged="graphNodesChanged"
          @selectedElesChanged="selectedElesChanged"
          @canvasLoadingChanged="canvasLoadingChanged"
          @savedEntityDataChanged="savedEntityDataChanged"
          @isShowSceneSearchChanged="isShowSceneSearchChanged"
        />
      </a-tab-pane>
      <a-tab-pane
        key="2"
        tab="语句查询"
        forceRender
        v-if="userRights.btn_sentenceSearch"
      >
        <sentence-search
          ref="sentenceSearch"
          :graphNodes="graphNodes"
          :savedSentenceData="savedSentenceData"
          @graphNodesChanged="graphNodesChanged"
          @selectedElesChanged="selectedElesChanged"
          @canvasLoadingChanged="canvasLoadingChanged"
          @savedSentenceDataChanged="savedSentenceDataChanged"
          @isShowSceneSearchChanged="isShowSceneSearchChanged"
        />
      </a-tab-pane>
      <a-tab-pane key="3" tab="已保存的查询" v-if="userRights.btn_savedSearch">
        <saved-search
          :graphNodes="graphNodes"
          :savedSentenceData="savedSentenceData"
          :savedEntityData="savedEntityData"
          @graphNodesChanged="graphNodesChanged"
          @selectedElesChanged="selectedElesChanged"
          @canvasLoadingChanged="canvasLoadingChanged"
          @handleChangeActiveKey="handleChangeActiveKey"
          @entityRulesChanged="entityRulesChanged"
          @sentenceContentChanged="sentenceContentChanged"
          @savedEntityDataChanged="savedEntityDataChanged"
          @savedSentenceDataChanged="savedSentenceDataChanged"
          @isShowSceneSearchChanged="isShowSceneSearchChanged"
        />
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>
<script>
import EntitySearch from "./entitySearch";
import SavedSearch from "./savedSearch";
import SentenceSearch from "./sentenceSearch";
import { Tabs } from "ant-design-vue";
import { mapState, mapMutations } from "vuex";

const { TabPane } = Tabs;

export default {
  name: "SceneSearchModal",
  props: [
    "showSceneSearch",
    "searchNodeAll",
    "entitySearchOption",
    "graphNodes",
    "savedSentenceData",
    "savedEntityData",
  ],
  data() {
    return {
      activeKey: "1",
    };
  },
  mounted() {
    // 根据权限，初始化activeKey
    if (this.userRights.btn_entitySearch) {
      this.activeKey = "1";
    } else if (this.userRights.btn_sentenceSearch) {
      this.activeKey = "2";
    } else if (this.userRights.btn_savedSearch) {
      this.activeKey = "3";
    }
  },
  computed: {
    ...mapState("rightsOptions", ["userRights"]),
  },
  components: {
    ATabs: Tabs,
    ATabPane: TabPane,
    EntitySearch,
    SavedSearch,
    SentenceSearch,
  },
  methods: {
    ...mapMutations("graphOptions", {
      setSentence: "setSentence",
    }),
    onCancel() {
      this.$emit("isShowSceneSearchChanged", false);
    },
    graphNodesChanged(value) {
      this.$emit("graphNodesChanged", value);
    },
    sentenceContentChanged(value) {
      this.$refs.sentenceSearch.sentenceContent = value;
      this.setSentence(value);
    },
    entityRulesChanged(string, arr) {
      this.$refs.entitySearch.rulesContent = string;
      this.$refs.entitySearch.rulesGroup = arr;
    },
    onKeychange(activeKey) {
      this.activeKey = activeKey;
    },
    handleChangeActiveKey(value) {
      this.activeKey = value;
    },
    savedSentenceDataChanged(value) {
      this.$emit("savedSentenceDataChanged", value);
    },
    savedEntityDataChanged(value) {
      this.$emit("savedEntityDataChanged", value);
    },
    canvasLoadingChanged(value) {
      this.$emit("canvasLoadingChanged", value);
    },
    isShowSceneSearchChanged(value) {
      this.$emit("isShowSceneSearchChanged", value);
    },
    selectedElesChanged(nodes, edges) {
      this.$emit("selectedElesChanged", nodes, edges);
    },
  },
};
</script>
<style lang="less">
.scene-search-modal {
  .ant-modal {
    margin: 0;
    top: auto;
    bottom: 0;
    left: 160px;
    height: 775px;
    overflow: hidden;
    padding-bottom: 0;
    position: absolute;
    box-shadow: 0 4px 12px 0 #dbdfee;
  }

  .ant-modal-content {
    height: 100%;
    z-index: 1080;
    background: #fff;

    .ant-modal-header {
      border-bottom: 1px solid #e0e0e0;

      .ant-modal-title {
        font-size: 17px;
        font-weight: 600;
      }
    }

    .ant-modal-body {
      padding: 10px 0;
      height: calc(100% - 55px);

      .ant-tabs {
        height: 100%;

        .ant-tabs-bar {
          padding: 0 24px;
          border-bottom: 0;
          margin-bottom: 24px;

          .ant-tabs-nav-container {
            .ant-tabs-nav-wrap {
              .ant-tabs-nav-scroll {
                .ant-tabs-nav {
                  .ant-tabs-tab {
                    padding: 12px 0;
                  }
                }
              }
            }
          }
        }

        .ant-tabs-content {
          height: calc(100% - 68px);
        }
      }
    }
  }
}
</style>
