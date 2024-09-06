<template>
  <div
    :class="
      className
        ? `${className} common-multiple-select`
        : 'common-multiple-select'
    "
  >
    <div class="title">
      <span>{{ title }}</span>
      <a-checkbox
        :indeterminate="indeterminate"
        @change="onCheckAllChange"
        :checked="checkAll"
      >
        全选
      </a-checkbox>
    </div>
    <div class="content">
      <a-checkbox-group
        :options="options"
        :value="checkedList"
        @change="onChange"
      />
    </div>
  </div>
</template>
<script>
import { Checkbox } from "ant-design-vue";

const { Group } = Checkbox;

export default {
  name: "SingleMultipleSelect",
  props: ["title", "options", "value", "className"],
  data() {
    return {
      indeterminate: false,
      checkAll: false,
      checkedList: [],
    };
  },
  mounted() {
    if (this.value && this.value.length > this.options.length) {
      this.$emit("onChange", this.options);
    } else {
      const isCheckAll =
        !!this.value &&
        !!this.value.length &&
        this.value.length === this.options.length;
      const isIndeterninate =
        !!this.value &&
        !!this.value.length &&
        this.value.length < this.options.length;

      this.checkedList = this.value || [];
      this.checkAll = isCheckAll;
      this.indeterminate = isIndeterninate;
    }
  },
  components: {
    ACheckboxGroup: Group,
  },
  methods: {
    onCheckAllChange(e) {
      this.checkedList = e.target.checked ? this.options : [];
      this.indeterminate = false;
      this.checkAll = e.target.checked;
      this.$emit("onChange", this.checkedList);
    },
    onChange(list) {
      this.checkedList = list;
      this.indeterminate = !!list.length && list.length < this.options.length;
      this.checkAll = list.length === this.options.length;
      this.$emit("onChange", list);
    },
  },
};
</script>
<style lang="less">
.common-multiple-select {
  color: @primaryTextColor;

  .title {
    height: 40px;
    display: flex;
    padding: 0 15px;
    line-height: 40px;
    flex-direction: row;
    background: #fafafa;
    justify-content: space-between;

    .ant-checkbox-wrapper {
      color: #949dad;

      &.ant-checkbox-wrapper-checked {
        color: #1790fa;
      }
    }
  }

  .content {
    padding: 15px;

    .ant-checkbox-group {
      .ant-checkbox-wrapper {
        width: 130px;
        color: #949dad;
        margin-right: 10px;
        margin-bottom: 10px;

        &.ant-checkbox-wrapper-checked {
          color: #1790fa;
        }
      }
    }
  }
}
</style>
