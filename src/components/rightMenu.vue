<template>
  <div class="right-menu">
    <a-menu
      v-if="show"
      class="context-menu"
      @click="onMenuClick"
      :style="{
        top: contextMenuData.position.y + 'px',
        left: contextMenuData.position.x + 'px',
      }"
    >
      <a-menu-item
        v-for="item in contextMenuData.context"
        :key="item.key"
        class="context-menu-item"
        :disabled="item.isDisabled"
      >
        <div
          :class="['context-menu-item-box', item.isDisabled ? 'disabled' : '']"
          v-if="item.show"
        >
          <icon-svg
            v-if="item.icon"
            :icon-class="item.icon"
            :color="item.color ? item.color : null"
          />
          <span class="box-title">{{ item.title }}</span>
        </div>
      </a-menu-item>
    </a-menu>
  </div>
</template>
<script>
import { Menu } from "ant-design-vue";

const { Item } = Menu;

export default {
  name: "RightMenu",
  props: {
    contextMenuData: Object, // 记录菜单的位置与内容
    show: Boolean, // 记录菜单是否展示
  },
  data() {
    return {};
  },
  components: {
    AMenu: Menu,
    AMenuItem: Item,
  },
  methods: {
    onMenuClick(key) {
      this.$emit("onMenuClick", key);
    },
  },
};
</script>
<style lang="less">
.right-menu {
  .context-menu {
    position: absolute;
    min-width: 170px;
    max-width: 400px;
    box-shadow: 0 2px 8px @borderColor;
    color: #485378;
    background-color: #fff;
    border-radius: 2px;

    &-item {
      padding: 0;
      width: 100%;
      height: auto;
      margin: 0 !important;

      &:not(.ant-menu-item-selected) {
        .context-menu-item-box {
          &:not(.disabled):hover {
            .box-title {
              color: @activeFontColor;
            }
          }
        }
      }

      &-box {
        height: 32px;
        margin: 4px 0;
        padding: 0 16px;
        line-height: 32px;

        &.disabled {
          .svg-icon,
          .box-title {
            color: @disabledColor;
          }
        }

        .svg-icon {
          width: 14px;
          height: 14px;
          margin-right: 8px;
        }

        .box-title {
          color: @primaryTextColor;
        }
      }
    }
  }
}
</style>
