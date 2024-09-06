<template>
  <a-table
    :class="border ? 'border-table table-component' : 'table-component'"
    v-bind="$props"
    v-on="$listeners"
    :border="border"
    :size="size"
    :scroll="scroll"
    :rowKey="rowKey"
  >
    <template
      v-for="column in columns"
      :slot="column.scopedSlots ? column.scopedSlots.customRender : ''"
      slot-scope="text, record"
    >
      <slot
        :name="column.scopedSlots ? column.scopedSlots.customRender : ''"
        v-bind="record"
      ></slot>
    </template>
  </a-table>
</template>
<script>
import props from "./tableProps.js";

export default {
  name: "TableComponent",
  mixins: [props],
  props: {
    // 表格的类名
    border: {
      type: Boolean,
      default: () => false,
    },
    size: {
      type: String,
      default: () => "small",
    },
    scroll: {
      // 如果表格高度有最大值并且有fixed的列，请动态计算表格主体高度赋值于y
      type: Object,
      default: () => ({ x: "max-content", y: "calc(100% - 48px)" }),
    },
    rowKey: {
      type: [String, Function],
      default: () => (record) => record.key,
    },
  },
  mounted() {},
  data() {
    return {};
  },
  methods: {},
};
</script>
<style lang="less">
.table-component {
  height: 100%;

  .ant-spin-nested-loading {
    height: 100%;

    .ant-spin-container {
      height: 100%;

      .ant-table {
        border: none;
        border-radius: 0;
        color: @primaryTextColor;
        height: calc(100% - 72px);

        .ant-table-content {
          height: 100%;

          .ant-table-scroll {
            height: 100%;

            .ant-table-placeholder {
              border-top: 0;
            }
          }

          .ant-table-header {
            // width: calc(100% + 5px);

            &::-webkit-scrollbar {
              border: 0;
            }

            .ant-table-fixed {
              border-radius: 0;

              .ant-table-thead {
                tr {
                  border-bottom-color: @dividersColor;
                }

                .ant-table-row-cell-break-word,
                .ant-table-selection-column {
                  font-weight: 600;
                  padding: 12px 16px;
                  color: @primaryTextColor;
                  background: @tableHeaderColor;
                  border-bottom-color: @dividersColor;
                  border-top: 1px solid @dividersColor;

                  &.ant-table-column-has-sorters {
                    .ant-table-header-column {
                      width: 100%;

                      .ant-table-column-sorters {
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;

                        .ant-table-column-sorter {
                          .ant-table-column-sorter-inner {
                            margin-top: -6px;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          .ant-table-body,
          .ant-table-body-inner {
            background: @contentColor;

            .ant-table-fixed {
              border-bottom: 1px solid @dividersColor;
            }

            .ant-table-tbody {
              .ant-table-row {
                .ant-table-row-cell-break-word {
                  padding: 12px 16px;
                  color: @primaryTextColor;
                  border-bottom-color: @dividersColor;

                  .no-action {
                    color: rgba(0, 0, 0, 0.65);
                    user-select: none;
                    cursor: not-allowed;
                  }

                  a {
                    color: @activeFontColor;
                    margin-right: 12px;

                    &:last-child {
                      margin-right: 0;
                    }

                    &.disabled {
                      cursor: not-allowed;
                      color: @disabledColor;
                    }
                  }
                }
              }
            }
          }
        }
      }

      .ant-pagination {
        margin: 24px 0;
      }
    }
  }
}

.border-table {
  .ant-table {
    .ant-table-content {
      border-right: 0 !important;

      .ant-table-header {
        border-radius: 0 !important;

        .ant-table-row-cell-break-word,
        .ant-table-selection-column {
          border-top: 1px solid @dividersColor !important;
          border-right: 1px solid @dividersColor !important;
          border-bottom: 1px solid @dividersColor !important;
          border-radius: 0 !important;
        }
      }

      .ant-table-fixed {
        border-bottom: 0 !important;
        border-left: 1px solid @dividersColor !important;
      }
      .ant-table-fixed,
      .ant-table-body-outer {
        .ant-table-row-cell-break-word,
        .ant-table-selection-column {
          border-right: 1px solid @dividersColor !important;
          border-bottom: 1px solid @dividersColor !important;
          color: @primaryTextColor !important;
        }
      }
    }
  }
}
</style>
