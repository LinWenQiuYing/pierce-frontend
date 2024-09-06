<template>
  <div class="schema-list">
    <a-list
      :data-source="listData"
      :pagination="pagination"
      :loading="searchLoading"
    >
      <a-list-item
        :class="
          selectItem[0] && selectItem[0].id == item.id ? 'list-item-active' : ''
        "
        slot="renderItem"
        slot-scope="item"
        @click="onSelect(item)"
      >
        <p class="list-item-title">
          <a-tooltip>
            <template slot="title">
              <span>{{ item.name }}</span>
            </template>
            <span class="item-name"> {{ item.name }} </span>
          </a-tooltip>
          <span
            class="check-graph"
            @click="
              (e) => {
                checkGraph(e, item);
              }
            "
            >预览</span
          >
        </p>
        <p class="list-item-text">
          <span class="text-label">编号：</span>
          <a-tooltip placement="topLeft">
            <template slot="title">
              <span>{{ item.id }}</span>
            </template>
            <span class="text-content single-line">{{ item.id }}</span>
          </a-tooltip>
        </p>
        <p class="list-item-text">
          <span class="text-label">同步：</span>
          <a-tooltip placement="topLeft">
            <template slot="title">
              <span>{{ item.time }}</span>
            </template>
            <span class="text-content single-line">{{ item.time }}</span>
          </a-tooltip>
        </p>
        <p class="list-item-text">
          <span class="text-label">描述：</span>
          <a-tooltip placement="topLeft">
            <template slot="title">
              <span>{{ item.desc }}</span>
            </template>
            <span class="text-content multiple-line">{{ item.desc }}</span>
          </a-tooltip>
        </p>
      </a-list-item>
    </a-list>
    <a-modal
      class="check-graph-modal"
      :width="900"
      :visible="checkGraphVisible"
      :closable="true"
      :destroyOnClose="true"
      @cancel="onModalCancel"
      :footer="null"
      centered
    >
      <div class="check-graph-modal-content">
        <SchemaGraph
          v-if="schemaData.vertexMetas.length"
          :pathData="schemaData"
          graphId="schema-graph-canvas0"
          :isModel="false"
          :schemaId="schemaId"
        />
      </div>
    </a-modal>
  </div>
</template>
<script>
import SchemaGraph from "./schemaGraph";
import { List, Tooltip } from "ant-design-vue";
import { queryGraphSchemaByPage } from "@/shared/api/configManage.js";
import { graphPreview } from "@/shared/api/configManage.js";

const { Item } = List;

export default {
  name: "SchemaList",
  data() {
    return {
      listData: [],
      selectItem: [],
      pagination: {
        size: "small",
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ["5", "10", "15", "20"],
        showTotal: (total, current) => {
          return `共${total}条记录，当前第${Math.ceil(
            current[0] / this.pagination.pageSize
          )}页`;
        },
        onChange: (page, pageSize) => {
          this.pagination.current = page;
          this.pagination.pageSize = pageSize;
          this.getSchemaList();
        },
        onShowSizeChange: (current, size) => {
          this.pagination.current = current;
          this.pagination.pageSize = size;
          this.getSchemaList();
        },
      },
      searchLoading: false,
      checkGraphVisible: false,
      schemaData: {
        edgeMetas: [],
        vertexMetas: [],
      },
      schemaId: undefined, // 预览的蓝图的id——kg:id,本地:schemaId
    };
  },
  components: {
    AList: List,
    AListItem: Item,
    ATooltip: Tooltip,
    SchemaGraph,
  },
  mounted() {
    this.getSchemaList();
  },
  methods: {
    async getSchemaList(searchValue) {
      this.searchLoading = true;
      const json = {
        fuzzyParameter: searchValue,
        pageNo: this.pagination.current,
        pageSize: this.pagination.pageSize,
        // source: 1, // pierce自己的图
      };
      const data = await queryGraphSchemaByPage(json);
      if (!data) {
        this.$message.error("获取schema数据失败，请重试！");
        return false;
      }
      this.$set(this.pagination, "total", parseInt(data.totalCount));
      const listData = [];
      data.dateList.map((item) => {
        listData.push({
          id: item.id,
          name: item.graphChName,
          time: item.updateDate || item.createDate,
          desc: item.graphDesc,
          schemaId: item.bluePrintId,
          graphSource: item.source,
        });
      });
      this.listData = listData;
      this.searchLoading = false;
    },
    onSelect(item) {
      this.selectItem = [item];
      this.$emit("selectChanged", [item]);
    },
    async checkGraph(e, item) {
      e.stopPropagation();
      this.schemaId = item.graphSource === 0 ? item.id : item.schemaId;
      const loading = this.$message.loading("正在获取图谱结构信息", 0);
      const data = await graphPreview(this.schemaId);
      loading();
      if (data.vertexMetas.length) {
        this.schemaData = data;
        this.checkGraphVisible = true;
      } else {
        this.$message.destroy();
        this.$message.info("暂无图谱结构信息");
      }
    },
    onModalCancel() {
      this.checkGraphVisible = false;
    },
  },
};
</script>
<style lang="less">
.schema-list {
  .ant-list {
    .ant-spin-nested-loading {
      min-height: 173px;

      .ant-spin-container {
        .ant-list-items {
          display: flex;
          flex-wrap: wrap;

          .ant-list-item {
            padding: 16px;
            display: block;
            cursor: pointer;
            position: relative;
            margin-right: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
            border: 1px solid #d9d9d9;
            width: calc((100% - 80px) / 5);

            &:nth-child(5n) {
              margin-right: 0;
            }

            .list-item-title {
              display: flex;
              align-items: center;
              padding-bottom: 16px;
              justify-content: space-between;

              .item-name {
                font-size: 16px;
                color: #515a6e;
                font-weight: 600;
                max-width: calc(100% - 30px);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .check-graph {
                font-size: 14px;
                color: @activeFontColor;
                cursor: pointer;
                width: 30px;
              }
            }

            .list-item-text {
              &:not(:last-child) {
                height: 29px;
                padding-bottom: 8px;
              }

              .text-label {
                color: #515a6e;
                width: 45px;
                display: block;
                float: left;
              }

              .text-content {
                color: #999;
                word-break: break-all;
                display: inline-block;
                max-width: calc(100% - 45px);

                &.single-line {
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }

                &.multiple-line {
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 2;
                  overflow: hidden;
                }
              }
            }

            .list-item-tag {
              right: 10px;
              bottom: 4px;
              color: @orange;
              position: absolute;
            }

            &.list-item-active,
            &:hover {
              border-color: @activeFontColor;
            }
          }
        }
      }
    }

    .ant-list-pagination {
      margin: 0;
    }
  }
}

.check-graph-modal {
  .ant-modal-wrap {
    .ant-modal {
      .ant-modal-content {
        background: #f8fbff;

        .ant-modal-body {
          padding: 18px 56px;
        }
      }
    }
  }
  &-content {
    height: 500px;
  }
}
</style>
