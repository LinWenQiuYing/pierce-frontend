<template>
  <div class="graph-change-button">
    <a-select
      class="graph-obj"
      :value="graphId"
      @change="handleChangeGraph"
      placeholder="请选择图谱"
    >
      <template slot="suffixIcon">
        <a-icon type="swap" :rotate="90" />
      </template>
      <a-select-option
        v-for="item in graphOptions"
        :key="item.value"
        :value="item.value"
      >
        {{ item.label }}
      </a-select-option>
    </a-select>
  </div>
</template>
<script>
import { mapState, mapMutations } from "vuex";
import { find } from "lodash";
import { queryGraphList } from "@/shared/api/configManage.js";
import { getGraphFields } from "@/shared/api/graphsStructure.js";

export default {
  name: "GraphChangeButton",
  data() {
    return {
      graphOptions: [],
    };
  },
  components: {},
  computed: {
    ...mapState("graphOptions", ["graphId", "schemaId", "graphSource"]),
  },
  watch: {},
  mounted() {
    // this.getGraphList(); // 因为已经在graphAnalysis中调用过了
  },
  methods: {
    ...mapMutations("graphOptions", {
      setGraphId: "setGraphId",
      setSchemaId: "setSchemaId",
      setGraphSource: "setGraphSource",
      setGraphFields: "setGraphFields",
    }),
    handleChangeGraph(value) {
      const target = find(this.graphOptions, (v) => v.value === value);
      this.$emit("changeGraph", value, target.schemaId, target.graphSource);
    },
    async getGraphList() {
      const graphList = await queryGraphList();
      const graphOptions = [];
      if (!graphList) {
        this.$message.error("获取可选图谱失败");
      } else {
        graphList.map((graph) => {
          graphOptions.push({
            label: graph.graphChName,
            value: graph.id,
            branchId: graph.branchId,
            schemaId: graph.schemaId,
            graphSource: graph.source,
          });
        });
        this.graphOptions = graphOptions;
        if (this.schemaId || this.graphId) {
          if (this.graphSource === 0) {
            // kg
            await this.getGraphFields(this.graphId);
          } else {
            // 本地
            await this.getGraphFields(this.schemaId);
          }
          return;
        }
        if (graphOptions.length) {
          this.setGraphId(graphOptions[0].value);
          this.setSchemaId(graphOptions[0].schemaId);
          this.setGraphSource(graphOptions[0].graphSource);
          sessionStorage.setItem("graphId", graphOptions[0].value);
          sessionStorage.setItem("schemaId", graphOptions[0].schemaId);
          sessionStorage.setItem("graphSource", graphOptions[0].graphSource);
          if (this.graphSource === 0) {
            // kg
            await this.getGraphFields(graphOptions[0].graphId);
          } else {
            // 本地
            await this.getGraphFields(graphOptions[0].schemaId);
          }
        } else {
          this.$message.error("暂无可用图谱数据");
          this.setGraphId(undefined);
          this.setSchemaId(undefined);
          this.setGraphSource(undefined);
          sessionStorage.setItem("graphId", undefined);
          sessionStorage.setItem("schemaId", undefined);
          sessionStorage.setItem("graphSource", undefined);
        }
      }
    },
    async getGraphFields(schemaId) {
      const res = await getGraphFields(schemaId);
      if (res.message === "成功" && res.data) {
        this.setGraphFields(res.data);
      } else if (res.message === "成功" && !res.data) {
        this.setGraphFields({});
      } else {
        this.setGraphFields({});
        this.$message.error(res.message);
      }
    },
  },
};
</script>
<style lang="less">
.graph-change-button {
  left: 24px;
  top: 17px;
  width: 280px;
  position: absolute;

  .graph-obj {
    width: 100%;

    .ant-select-selection {
      .ant-select-arrow {
        top: 0;
        right: 0;
        margin: 0;
        width: 30px;
        height: 100%;
        color: #fff;
        display: flex;
        align-items: center;
        background: @activeFontColor;
        justify-content: center;
      }
    }
  }
}
</style>
