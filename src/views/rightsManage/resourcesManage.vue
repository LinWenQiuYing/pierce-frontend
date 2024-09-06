<template>
  <div class="resources-manage">
    <div class="manage-header">
      <div class="manage-header-item">
        <span class="item-label">资源名称：</span>
        <a-input
          placeholder="请输入资源名称"
          v-model.trim="resName"
          class="manage-header-item-input item-input"
        />
      </div>
      <div class="manage-header-item">
        <span class="item-label">资源编码：</span>
        <a-input
          placeholder="请输入资源编码"
          v-model.trim="resCode"
          class="manage-header-item-input item-input"
        />
      </div>
      <div class="manage-header-item">
        <span class="item-label">菜单名称：</span>
        <a-input
          placeholder="请输入菜单名称"
          v-model.trim="menuName"
          class="manage-header-item-input item-input"
        />
      </div>
      <div class="manage-header-item">
        <a-button type="primary" icon="search" @click="onSearch">查询</a-button>
        <a-button style="margin-left: 10px" @click="reset">
          <a-icon type="redo" :rotate="-90" /> 重置
        </a-button>
      </div>
    </div>
    <div class="manage-table">
      <a-tree
        show-icon
        :default-expanded-keys="['0-0']"
        :treeData="list"
        :icon="getIcon"
        blockNode
        :selectable="false"
      >
        <template slot="folder" slot-scope="item">
          <div class="tree-view-item">
            <span class="tree-view-left">{{ item.title }}</span>
            <div class="tree-view-right">
              <a-icon
                type="info-circle"
                class="btn"
                @click="checkDetail(item)"
              />
              <a-icon type="edit" class="btn" @click="editDetail(item)" />
              <a-icon type="plus-square" class="btn" @click="addList(item)" />
              <a-icon type="delete" class="btn" @click="deleteResource(item)" />
            </div>
          </div>
        </template>
      </a-tree>
    </div>
    <a-modal
      class="resources-modal"
      :title="modalTitle"
      :visible="showAddUser"
      okText="确定"
      cancelText="取消"
      @ok="addUserConfirm"
      @cancel="addUserCancel"
      centered
    >
      <div class="resources">
        <div class="resources-name" v-show="parentName">
          <div class="item-label">
            <span style="color: red">*</span> 上级资源：
          </div>
          <a-input
            placeholder="上级资源"
            v-model.trim="parentName"
            style="width: 320px"
            disabled
          />
        </div>
        <div class="resources-name">
          <div class="item-label">
            <span style="color: red">*</span> 资源名称：
          </div>
          <a-input
            placeholder="请输入资源名称"
            v-model.trim="resourceName"
            style="width: 320px"
            :disabled="checkDe"
          />
        </div>
        <div class="resources-name" style="margin-top: 10px; display: flex">
          <div class="item-label">
            <span style="color: red">*</span> 资源编码：
          </div>
          <a-input
            placeholder="请输入资源编码"
            v-model.trim="resourceCode"
            style="width: 320px"
            :disabled="checkDe"
          />
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script>
import { Button, Input, Tree } from "ant-design-vue";
import {
  getResourceList,
  addResource,
  updateResource,
  getResourceInfo,
  resourceDelete,
} from "@/shared/api/rightsManage";
import { modalConfirm } from "@/utils/common.js";

export default {
  name: "ResourcesManage",
  data() {
    return {
      resName: "",
      resCode: "",
      menuName: "",
      showAddUser: false,
      resourceName: "",
      resourceCode: "",
      parentName: undefined,
      parentId: undefined,
      detailId: undefined,
      checkDe: false,
      modify: false,
      modalTitle: "",
      list: [],
    };
  },
  async mounted() {
    this.onSearch();
  },
  components: {
    AButton: Button,
    AInput: Input,
    ATree: Tree,
  },
  methods: {
    async getAllData(value) {
      const listData = await getResourceList(value);
      if (!listData) {
        this.$message.error("获取资源列表失败，请重新尝试");
      } else {
        const list = listData.map((item) => {
          let children = null;
          if (item.childResources) {
            children = this.getChildResources(item.childResources);
          }
          return {
            key: item.id,
            isLeaf: false,
            title: item.resName,
            children,
            resName: item.resName,
            resCode: item.resCode,
            scopedSlots: { title: "folder" },
          };
        });
        this.list = list;
      }
    },
    getChildResources(list) {
      const result = list.map((ele) => {
        let children = null;
        if (ele.childResources) {
          children = this.getChildResources(ele.childResources);
        }
        return {
          key: ele.id,
          isLeaf:
            ele.childResources && ele.childResources.length ? false : true,
          title: ele.resName,
          children,
          resName: ele.resName,
          resCode: ele.resCode,
          scopedSlots: { title: "folder" },
        };
      });
      return result;
    },
    onSearch() {
      const json = {
        resCode: this.resCode,
        resName: this.resName,
        menuName: this.menuName,
      };
      this.getAllData(json);
    },
    reset() {
      this.resName = "";
      this.resCode = "";
      this.menuName = "";
      this.onSearch();
    },
    async addUserConfirm() {
      if (this.checkDe) {
        this.showAddUser = false;
        return false;
      }
      if (!this.modify) {
        if (this.resourceName && this.resourceCode) {
          let info = {
            resCode: this.resourceCode,
            resName: this.resourceName,
            parentId: this.parentId,
          };
          let result = await addResource(info);
          if (result.message === "成功") {
            this.$message.success("添加成功");
            this.onSearch();
          } else {
            this.$message.warning("添加失败");
          }
          this.addUserCancel();
        } else if (this.resourceName === "") {
          this.$message.warning("请填写新增资源名称");
        } else if (this.resourceCode === "") {
          this.$message.warning("请填写新增资源编码");
        }
      } else {
        if (this.resourceName && this.resourceCode) {
          let info = {
            id: this.detailId,
            resCode: this.resourceCode,
            resName: this.resourceName,
            parentId: this.parentId,
          };
          let res = await updateResource(info);
          if (res.message === "成功") {
            this.$message.success("修改成功");
            this.onSearch();
          } else {
            this.$message.warning("修改失败");
          }
          this.addUserCancel();
        } else if (this.resourceName === "") {
          this.$message.warning("请填写新增资源名称");
        } else if (this.resourceCode === "") {
          this.$message.warning("请填写新增资源编码");
        }
      }
    },
    addUserCancel() {
      this.showAddUser = false;
      this.resourceName = "";
      this.resourceCode = "";
      this.parentId = undefined;
      this.parentName = undefined;
    },
    getIcon(props) {
      const { isLeaf, expanded } = props;
      if (isLeaf) {
        return <a-icon type="file" />;
      }
      return <a-icon type={expanded ? "folder-open" : "folder"} />;
    },
    onSelect(selectedKeys, e) {
      if (!e.node.isLeaf) {
        e.node.onExpand();
      }
    },
    addList(record) {
      this.modalTitle = "新增资源";
      this.parentId = record.key;
      this.parentName = record.resName;
      this.resourceName = "";
      this.resourceCode = "";
      this.checkDe = false;
      this.modify = false;
      this.showAddUser = true;
    },
    deleteResource(item) {
      const _that = this;
      const title = `确定要删除 ${item.title} 吗？`;
      const onOk = async () => {
        const json = {
          id: item.key,
        };
        const data = await resourceDelete(json);
        if (data.message === "成功") {
          _that.$message.success("删除成功");
          _that.onSearch();
        } else {
          _that.$message.error(`删除失败，${data.message}`);
        }
      };
      modalConfirm(title, _that, onOk);
    },
    async getResDetail(id) {
      const detail = await getResourceInfo(id);
      this.resourceName = detail.resName;
      this.resourceCode = detail.resCode;
      this.parentId = detail.parentId;
      this.parentName = detail.parentName;
      return detail;
    },
    checkDetail(record) {
      const json = {
        id: record.key,
      };
      this.getResDetail(json);
      this.modalTitle = "查看资源";
      this.showAddUser = true;
      this.checkDe = true;
      this.modify = false;
    },
    editDetail(record) {
      const json = {
        id: record.key,
      };
      this.getResDetail(json);
      this.modalTitle = "编辑资源";
      this.detailId = record.key;
      this.showAddUser = true;
      this.checkDe = false;
      this.modify = true;
    },
  },
};
</script>
<style lang="less">
.resources-manage {
  height: 100%;
  width: 100%;
  padding: 24px;
  background: @contentColor;

  .manage-header {
    display: flex;
    flex-wrap: wrap;
    padding-bottom: 16px;
    position: relative;
    border-bottom: 1px dashed #dbdbdb;

    &-item {
      &:not(:last-child) {
        margin-right: 10px;
        max-width: calc((100% - 204px) / 3);
      }

      &-input {
        width: 300px;

        &.item-select {
          max-width: calc(100% - 45px);
        }

        &.item-input {
          max-width: calc(100% - 75px);
        }
      }
    }
  }
  .manage-table {
    padding-top: 16px;
    height: calc(100% - 49px);

    .manage-table-button {
      display: flex;
    }
    .manage-table-update {
      margin-left: 10px;
    }
  }
  .ant-tree {
    position: relative;
    width: 500px;

    .ant-tree-title,
    .tree-view-left {
      user-select: none;
    }

    .ant-tree-switcher {
      .ant-tree-switcher-icon {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    li,
    .ant-tree-treenode-switcher-open,
    .ant-tree-treenode-switcher-close {
      .ant-tree-node-content-wrapper {
        width: calc(100% - 24px);

        .ant-tree-title {
          padding-right: 5px;
          width: calc(100% - 24px);
          display: inline-block;

          .tree-view-item {
            .tree-view-left {
              overflow: hidden;
              white-space: nowrap;
              display: inline-block;
              width: calc(100% - 90px);
              text-overflow: ellipsis;
            }

            .tree-view-right {
              display: none;
              float: right;

              .btn {
                color: @activeFontColor;
                margin-left: 5px;
              }
            }
          }
        }

        &:hover {
          .tree-view-right {
            display: block !important;
          }
        }
      }

      .anticon-caret-down {
        left: 50%;
        transform: translate(-50%, -50%) !important;
      }
    }
  }
}

.resources-modal {
  .ant-modal {
    &-content {
      .ant-modal-header {
        .ant-modal-title {
          font-weight: 600;
          font-size: 16px;
          line-height: 22px;
          color: @primaryTextColor;
        }
      }

      .ant-modal-body {
        .resources {
          .resources-name {
            margin-top: 10px;
            display: flex;

            .item-label {
              width: 100px;
              text-align: right;
              margin-right: 10px;
              color: #515a6e;
              line-height: 30px;
            }

            .ant-input-disabled,
            .ant-select-disabled > .ant-select-selection {
              background: #fff;
              color: rgba(0, 0, 0, 0.65);
            }
          }
        }
      }
    }
  }
}
</style>
