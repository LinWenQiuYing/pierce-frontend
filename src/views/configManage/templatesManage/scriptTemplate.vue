<template>
  <div class="script-template">
    <div class="script-template-item">
      <p class="content-sub-title">模板脚本展示</p>
      <a-textArea
        allow-clear
        type="text"
        :auto-size="{ minRows: 8, maxRows: 15 }"
        class="script-template-input"
        placeholder="请输入模板脚本"
        :disabled="detailsType === 'check' || isLock"
        v-model.trim="details.templateScript"
      />
      <a-button
        v-if="detailsType !== 'check'"
        type="primary"
        class="script-template-btn"
        @click="handleSaveScript"
        >{{ isLock ? "修改脚本" : "保存脚本" }}</a-button
      >
    </div>
    <div class="script-template-item">
      <p class="content-sub-title">脚本化参数及语句配置展示</p>
      <a-table
        class="templates-table"
        :columns="columns"
        :data-source="details.data"
        :pagination="pagination"
        :rowKey="(record) => record.index"
        bordered
      >
        <template
          v-for="col in ['type', 'content', 'example']"
          :slot="col"
          slot-scope="text, record, index"
        >
          <div :key="col">
            <a-cascader
              v-if="col === 'type'"
              allow-clear
              class="slot-input"
              :value="text"
              :options="paramOptions"
              placeholder="参数类型"
              :disabled="detailsType === 'check'"
              @change="(e) => handleChange(e, record.id, col)"
            />
            <a-button
              v-else-if="
                col === 'example' && record.type && record.type[0] === 'Enum'
              "
              class="slot-btn"
              @click="handleCheckEnum(record, col)"
            >
              {{ detailsType === "add" ? "配置枚举值" : "查看枚举值" }}
            </a-button>
            <a-input
              v-else
              allow-clear
              class="slot-input"
              :value="text"
              :disabled="detailsType === 'check'"
              :placeholder="
                col === 'content' ? 'e.g.过滤节点的出入度为' : 'e.g.出度填out'
              "
              @change="(e) => handleChange(e.target.value, record.id, col)"
            />
          </div>
        </template>
      </a-table>
    </div>
    <a-modal
      class="enum-modal"
      :width="600"
      :visible="isEnumModalShow"
      :destroyOnClose="true"
      @cancel="onCancel(true)"
      @ok="handleOk"
      centered
      title="枚举值"
    >
      <div class="enum-modal-content">
        <div class="enum-modal-content-title">
          <div class="title-index">编号</div>
          <div class="title-text">枚举值</div>
          <div class="title-content">展示字段</div>
        </div>
        <div class="enum-modal-content-box">
          <div class="box-item" v-for="item in enumList" :key="item.index">
            <div class="title-index" v-if="item.index < 10">
              {{ `0${item.index}` }}
            </div>
            <div class="title-index" v-else>
              {{ item.index }}
            </div>
            <div class="title-text">
              <a-input
                allow-clear
                class="modal-input"
                :value="item.text"
                placeholder="枚举值"
                :disabled="detailsType === 'check'"
                @change="
                  (e) => handleInputChange(e.target.value, item.index, 'text')
                "
              />
            </div>
            <div class="title-content">
              <a-input
                allow-clear
                class="modal-input"
                :value="item.content"
                placeholder="展示字段"
                :disabled="detailsType === 'check'"
                @change="
                  (e) =>
                    handleInputChange(e.target.value, item.index, 'content')
                "
              />
            </div>
            <a-icon
              v-if="detailsType !== 'check'"
              type="minus-circle"
              class="delete-icon"
              @click="handleDelete(item.index)"
            />
          </div>
          <a-icon
            v-if="detailsType !== 'check'"
            type="plus-circle"
            class="add-icon"
            @click="handleAdd"
          />
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script>
import { Button, Cascader, Input } from "ant-design-vue";
import { scrollToBottom } from "@/utils/common.js";
import { cloneDeep, find, intersection } from "lodash";

const { TextArea } = Input;

export default {
  name: "ScriptTemplate",
  props: ["detailsType", "details"],
  data() {
    return {
      columns: [
        {
          title: "参数编号",
          dataIndex: "index",
          key: "index",
          width: "15%",
        },
        {
          title: "参数类型",
          dataIndex: "type",
          key: "type",
          width: "20%",
          scopedSlots: { customRender: "type" },
        },
        {
          title: "参数语句",
          dataIndex: "content",
          key: "content",
          width: "30%",
          scopedSlots: { customRender: "content" },
        },
        {
          title: "示例语句",
          dataIndex: "example",
          key: "example",
          width: "35%",
          scopedSlots: { customRender: "example" },
        },
      ],
      pagination: {
        size: "small",
        total: 0,
        current: 1,
        pageSize: 5,
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
        },
        onShowSizeChange: (current, size) => {
          this.pagination.current = current;
          this.pagination.pageSize = size;
        },
      },
      paramOptions: [
        {
          label: "整数",
          value: 1,
        },
        {
          label: "字符串",
          value: 2,
        },
        {
          label: "枚举值",
          value: "Enum",
          children: [
            {
              label: "整数",
              value: 3,
            },
            {
              label: "字符串",
              value: 4,
            },
          ],
        },
      ],
      isEnumModalShow: false,
      enumList: [],
      enumBaseList: [],
      isLock: false,
      id: undefined,
      col: undefined,
      list: [], // 存放变量的名字
      data: [], // 存放已经配置好的参数信息
    };
  },
  components: {
    AButton: Button,
    ACascader: Cascader,
    AInput: Input,
    ATextArea: TextArea,
  },
  watch: {
    details: {
      handler(newValue) {
        this.details = newValue;
      },
      deep: true,
    },
  },
  methods: {
    handleSaveScript() {
      if (this.details && this.details.templateScript) {
        this.isLock = !this.isLock;
        if (!this.isLock) return false;
        const reg = /\$\{(.+?)\}/;
        const reg_g = /\$\{(.+?)\}/g;
        const result = this.details.templateScript.match(reg_g);
        const list = [];
        if (result) {
          for (let i = 0; i < result.length; i++) {
            const item = result[i];
            list.push(item.match(reg)[1]);
            if (result.indexOf(item) !== i) {
              this.$message.error("参数编号重复，请修改!");
              this.$set(this.details, "data", []);
              return false;
            }
          }
          const newList = intersection(this.list, list); // 交集
          this.list = list; // 保存是为了下一次做比较
          const data = [];
          list.map((item, index) => {
            if (newList.indexOf(item) !== -1) {
              // 在交集中
              const target = find(this.data, (v) => v.index === item);
              data.push(target);
            } else {
              // 其余的在差集中
              data.push({
                id: index,
                index: item,
                type: undefined,
                content: undefined,
                example: undefined,
              });
            }
          });
          this.data = data; // 保存是为了下一次做比较
          this.$set(this.details, "data", data);
          if (this.isLock) {
            scrollToBottom(this, "template-details-content", 10);
          }
        } else {
          this.$message.error("请输入正确的模板");
          this.isLock = !this.isLock;
          return false;
        }
      } else {
        this.$message.error("请先输入脚本内容！");
      }
    },
    handleChange(value, id, column) {
      const newData = [...this.details.data];
      // return false;
      const target = find(newData, (v) => v.id === id);
      if (target) {
        target[column] = value;
        if (column === "type") {
          if (value.length) {
            switch (value.at(-1)) {
              case 1:
                target.typeText = "整数";
                break;
              case 2:
                target.typeText = "字符串";
                break;
              case 3:
                target.typeText = "整数枚举值";
                break;
              case 4:
                target.typeText = "字符串枚举值";
                break;

              default:
                break;
            }
          } else {
            target.typeText = undefined;
            target.content = undefined;
            target.example = undefined;
          }
        }
        this.$set(this.details, "data", newData);
      }
    },
    handleCheckEnum(record, col) {
      this.id = record.id;
      this.col = col;
      const target = this.details.data[record.id].example;
      if (!target || !target.length) {
        this.handleChange(
          [
            {
              index: 1,
              text: undefined,
              content: undefined,
            },
          ],
          record.id,
          col
        );
      }
      this.enumList = this.details.data[record.id][col];
      this.enumBaseList = cloneDeep(this.enumList);
      this.isEnumModalShow = true;
    },
    onCancel(flag) {
      if (flag) {
        this.details.data[this.id][this.col] = this.enumBaseList;
      }
      this.isEnumModalShow = false;
    },
    handleOk() {
      let flag = false;
      if (this.enumList.length) {
        for (let i = 0; i < this.enumList.length; i++) {
          const element = this.enumList[i];
          if (!element.text || !element.content) {
            this.$message.error("请填写完整的枚举值！");
            flag = true;
            break;
          }
        }
      } else {
        this.$message.error("请至少填写一个完整的枚举值！");
        flag = true;
      }
      if (!flag) {
        this.onCancel(false);
      }
    },
    handleInputChange(value, index, type) {
      this.enumList[index - 1][type] = value;
    },
    handleDelete(index) {
      if (this.detailsType === "check") return false;
      this.enumList.splice(index - 1, 1);
      this.enumList.map((item, index) => {
        item.index = index + 1;
      });
    },
    handleAdd() {
      if (this.detailsType === "check") return false;
      this.enumList.push({
        index: this.enumList.length ? this.enumList.at(-1).index + 1 : 1,
        text: undefined,
        content: undefined,
      });
    },
  },
};
</script>
<style lang="less">
.script-template {
  padding: 16px;
  background: #fff;

  &-item {
    overflow: hidden;
  }

  &-input,
  .templates-table {
    margin: 0 36px;
    width: calc(100% - 72px);

    .slot-input {
      width: 100%;
      margin: -5px 0;
      color: @primaryTextColor !important;

      .ant-input[disabled] {
        text-align: center;
        background-color: #fff !important;
        color: @primaryTextColor !important;
      }
    }

    .slot-btn {
      border: 0;
      width: 100%;
      color: @blue;
      margin: 0 auto;
    }
  }

  .ant-table-bordered .ant-table-thead > tr > th,
  .ant-table-bordered .ant-table-tbody > tr > td {
    padding: 10px;
  }

  &-input {
    margin-bottom: 16px;

    .ant-input-disabled {
      background-color: #fff;
      color: @primaryTextColor;
    }

    .anticon-close-circle {
      top: 50%;
      transform: translateY(-50%);
    }
  }

  &-btn {
    float: right;
    margin-right: 36px;
    margin-bottom: 16px;
  }
}

.enum-modal {
  &-content {
    max-height: 500px;

    &-title {
      display: flex;
      align-items: center;
      margin-bottom: 14px;
      padding-bottom: 12px;
      color: @primaryTextColor;
      border-bottom: 1px solid #d9d9d9;
    }

    &-box {
      overflow: auto;
      max-height: 452px;
      color: @primaryTextColor;

      .box-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      }
    }

    .title-index {
      width: 40px;
      margin-right: 60px;
      text-align: center;
    }

    .title-text {
      width: 180px;
      text-align: center;
      margin-right: 60px;
    }

    .modal-input {
      .ant-input[disabled] {
        text-align: center;
        background-color: #fff !important;
        color: @primaryTextColor !important;
      }
    }

    .title-content {
      width: 180px;
      text-align: center;
    }

    .add-icon {
      width: 40px;
      color: @blue;
    }

    .delete-icon {
      color: @blue;
      margin-left: 10px;
    }
  }
}
</style>
