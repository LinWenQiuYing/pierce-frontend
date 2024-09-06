<template>
  <TableList
    listClass="roles-manage"
    tableTitle="角色列表"
    :columns="columns"
    :tableValue="tableData"
    :pagination="pagination"
    :tableLoading="searchLoading3"
    tableClass="role-table"
    :rowKey="(record) => record.id"
    isDefaultFold
  >
    <template v-slot:searchOptions>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">角色名称：</span>
        <a-input
          type="text"
          class="table-list-top-item-input"
          placeholder="角色名称"
          v-model.trim="roleName"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">角色编码：</span>
        <a-input
          type="text"
          class="table-list-top-item-input"
          placeholder="角色编码"
          v-model.trim="roleCode"
        />
      </div>
      <div class="table-list-top-item">
        <a-button @click="handleReset"> 重置 </a-button>
        <a-button
          type="primary"
          @click="handleSearch('init')"
          :loading="searchLoading1"
          v-if="userRights.btn_queryRoles"
        >
          查询
        </a-button>
      </div>
    </template>
    <template v-slot:tableBtns>
      <a-button
        type="primary"
        icon="plus-circle"
        @click="showAddModal"
        class="header-btn"
        v-if="userRights.btn_addRole"
      >
        添加
      </a-button>
      <a-button
        class="header-btn"
        @click="handleRefresh('repeat')"
        :icon="searchLoading2 ? 'loading' : 'undo'"
        >刷新</a-button
      >
    </template>
    <template v-slot:actionsSlot="{ record }">
      <a @click="handleEdit(record)" v-if="userRights.btn_editRole">编辑</a>
      <a @click="handleAuthorize(record)" v-if="userRights.btn_impowerResource"
        >授权</a
      >
      <a @click="handleDelete(record)" v-if="userRights.btn_deleteRole">删除</a>
      <a
        v-if="
          !userRights.btn_editRole &&
          !userRights.btn_impowerResource &&
          !userRights.btn_deleteRole
        "
        class="no-action"
      >
        暂无操作权限
      </a>
    </template>
    <template v-slot:otherPart>
      <a-modal
        :title="modalTitle"
        :visible="addVisible"
        :footer="null"
        @cancel="handleCancelAdd"
        class="role-modal"
        :width="560"
        centered
      >
        <a-form
          :form="form"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 12 }"
          @submit="handleAdd"
          class="role-modal-form"
        >
          <a-form-item label="角色名称">
            <a-input
              v-decorator="[
                'name',
                {
                  rules: [{ required: true, message: '请输入角色名称!' }],
                },
              ]"
              placeholder="请输入角色名称"
            />
          </a-form-item>
          <a-form-item label="角色编码">
            <a-input
              v-decorator="[
                'code',
                {
                  rules: [{ required: true, message: '请输入角色编码!' }],
                },
              ]"
              placeholder="请输入角色编码"
            />
          </a-form-item>
          <a-form-item label="角色描述">
            <a-input v-decorator="['desc']" placeholder="请输入角色描述" />
          </a-form-item>
          <a-form-item
            :wrapper-col="{ span: 12, offset: 5 }"
            class="role-modal-form-footer"
          >
            <a-button @click="handleCancelAdd">取消</a-button>
            <a-button
              type="primary"
              html-type="submit"
              :loading="confirmLoading"
              >确认</a-button
            >
          </a-form-item>
        </a-form>
      </a-modal>
      <a-drawer
        title="角色权限配置"
        placement="right"
        :closable="false"
        :visible="drawerVisible"
        @close="onDrawerClose"
        width="600"
        class="right-set-drawer"
      >
        <p class="tree-header">所拥有的权限:</p>
        <a-tree
          checkable
          v-model="checkedKeys"
          :expandedKeys="expandedKeys"
          :auto-expand-parent="true"
          :tree-data="list"
          @check="onCheck"
          @expand="onExpand"
        >
        </a-tree>
        <div class="tree-footer">
          <a-dropdown placement="topLeft" :trigger="['click']">
            <a-menu slot="overlay" @click="handleMenuClick">
              <a-menu-item key="1">全部勾选</a-menu-item>
              <a-menu-item key="2">取消全选</a-menu-item>
              <a-menu-item key="3">展开所有</a-menu-item>
              <a-menu-item key="4">合并所有</a-menu-item>
            </a-menu>
            <a-button class="actions-btn"> 操作 <a-icon type="up" /> </a-button>
          </a-dropdown>
          <div class="tree-footer-right">
            <a-popconfirm
              title="确定放弃编辑？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="
                () => {
                  drawerVisible = false;
                }
              "
            >
              <a-button class="tree-footer-right-btn"> 取消 </a-button>
            </a-popconfirm>
            <a-button
              type="primary"
              @click="saveAuthorize"
              class="tree-footer-right-btn"
            >
              保存
            </a-button>
          </div>
        </div>
      </a-drawer>
    </template>
  </TableList>
</template>
<script>
import TableList from "@/components/tableList";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Menu,
  Popconfirm,
  Tree,
} from "ant-design-vue";
import {
  getAllRoles,
  addRole,
  editRole,
  deleteRole,
} from "@/shared/api/rightsManage";
import { getUserPermission, impowerResource } from "@/shared/api/login.js";
import { modalConfirm } from "@/utils/common.js";
import { mapState } from "vuex";

const { Item } = Form;
const MenuItem = Menu.Item;

export default {
  name: "RolesManage",
  data() {
    return {
      roleName: "",
      roleCode: "",
      searchLoading1: false, // 查询按钮
      searchLoading2: false, // 刷新按钮
      searchLoading3: false, // 表格
      columns: [
        {
          title: "角色名称",
          dataIndex: "name",
          key: "name",
          width: 129,
        },
        {
          title: "角色编码",
          dataIndex: "code",
          key: "code",
          width: 130,
        },
        {
          title: "创建人",
          dataIndex: "createPerson",
          key: "createPerson",
          width: 130,
        },
        {
          title: "更新人",
          key: "updatePerson",
          dataIndex: "updatePerson",
          width: 130,
        },
        {
          title: "更新时间",
          key: "updateTime",
          dataIndex: "updateTime",
          width: 180,
        },
        {
          title: "操作",
          key: "actions",
          dataIndex: "actions",
          scopedSlots: { customRender: "actions" },
          width: 180,
        },
      ],
      tableData: [],
      pagination: {
        size: "small",
        total: 0,
        current: 1,
        pageSize: 15,
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
          this.onSearch("repeat");
        },
        onShowSizeChange: (current, size) => {
          this.pagination.current = current;
          this.pagination.pageSize = size;
          this.onSearch("repeat");
        },
      },
      addVisible: false,
      confirmLoading: false,
      modalTitle: "新增角色",
      form: this.$form.createForm(this, { name: "roleForm" }),
      drawerVisible: false,
      checkedKeys: [],
      expandedKeys: [
        "910935293081821184",
        "910935367107092480",
        "910935591649157120",
        "910935664684572672",
      ],
      checkData: {},
      roleId: "",
    };
  },
  mounted() {
    this.getRolesList("init");
  },
  computed: {
    ...mapState("rightsOptions", ["resourceList", "userRights"]),
    list() {
      return this.resourceList;
    },
  },
  components: {
    AButton: Button,
    ADropdown: Dropdown,
    AForm: Form,
    AFormItem: Item,
    AInput: Input,
    AMenu: Menu,
    AMenuItem: MenuItem,
    APopconfirm: Popconfirm,
    ATree: Tree,
    TableList,
  },
  methods: {
    async getRolesList(type) {
      if (type === "init") {
        this.$set(this.pagination, "current", 1);
      }
      const json = {
        pageNo: this.pagination.current,
        pageSize: this.pagination.pageSize,
        roleCode: this.roleCode,
        roleName: this.roleName,
      };
      this.searchLoading3 = true;
      const apiData = await getAllRoles(json);
      this.searchLoading3 = false;
      if (!apiData) {
        this.$message.error("获取角色列表失败");
      } else {
        this.$set(this.pagination, "total", parseInt(apiData.totalCount));
        const tableData = [];
        apiData.dateList.map((item) => {
          tableData.push({
            name: item.roleName,
            code: item.roleCode,
            createPerson: item.createUser || "",
            updatePerson: item.updateUser || "",
            updateTime: item.updateDate || item.createDate || "",
            desc: item.description || "",
            id: item.id,
          });
        });
        this.tableData = tableData;
      }
    },
    async handleSearch(type) {
      this.searchLoading1 = true;
      this.getRolesList(type);
      this.searchLoading1 = false;
    },
    async handleRefresh(type) {
      this.searchLoading2 = true;
      this.getRolesList(type);
      this.searchLoading2 = false;
    },
    handleReset() {
      this.roleName = "";
      this.roleCode = "";
      this.getRolesList("init");
    },
    showAddModal() {
      this.modalTitle = "新增角色";
      this.addVisible = true;
    },
    async handleAdd(event) {
      event.stopPropagation();
      event.preventDefault();
      this.confirmLoading = true;
      const info = {};
      this.form.validateFields((err, values) => {
        if (!err) {
          info.roleName = values.name;
          info.roleCode = values.code;
          info.description = values.desc;
        } else {
          this.$message.error("请填写表单带*号的必填项");
        }
      });
      let data = undefined;
      if (this.modalTitle === "新增角色") {
        data = await addRole(info);
        this.confirmLoading = false;
        if (data.message === "成功") {
          this.$message.success("添加成功");
          this.getRolesList("init");
        } else {
          this.$message.error(`添加失败 ${data.message}`);
        }
      } else {
        // 编辑
        info.id = this.checkData.id;
        data = await editRole(info);
        this.confirmLoading = false;
        if (data.message === "成功") {
          this.$message.success("修改成功");
          this.getRolesList("init");
        } else {
          this.$message.error(`修改失败 ${data.message}`);
        }
      }
      this.handleCancelAdd();
    },
    handleCancelAdd() {
      this.addVisible = false;
      this.form.setFieldsValue({
        name: "",
        code: "",
        desc: "",
      });
    },
    handleEdit(record) {
      this.modalTitle = "编辑角色";
      this.addVisible = true;
      this.checkData = record;
      setTimeout(() => {
        this.form.setFieldsValue({
          name: record.name,
          code: record.code,
          desc: record.desc,
        });
      }, 100);
    },
    async handleAuthorize(record) {
      this.roleId = record.id;
      const data = await getUserPermission(record.id);
      let checkedKeys = [];
      if (!data) {
        this.$message.error("获取角色授权信息失败");
        return false;
      }
      data.map((item) => {
        checkedKeys = this.initCheckList(item, checkedKeys);
      });
      this.checkedKeys = checkedKeys;
      this.drawerVisible = true;
    },
    handleDelete(record) {
      const _that = this;
      const title = `确定要删除 ${record.name} 吗？`;
      const content =
        "该角色类型将被删除，且该操作无法撤销，请确认是否删除该角色。";
      const onOk = async () => {
        const info = {
          id: record.id,
        };
        const data = await deleteRole(info);
        if (data.message === "成功") {
          _that.$message.success("该角色已删除成功！");
          _that.onSearch("init");
        } else {
          _that.$message.error(`删除失败 ${data.message}`);
        }
      };
      modalConfirm(title, _that, onOk, content);
    },
    onDrawerClose() {
      this.drawerVisible = false;
    },
    onCheck(checkedKeys) {
      this.checkedKeys = checkedKeys;
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
    },
    async saveAuthorize() {
      let json = [];
      this.checkedKeys.map((item) => {
        json.push({
          id: "",
          roleId: this.roleId,
          resId: item,
        });
      });

      // 查漏补缺-找出那些子资源选中了，但父资源未选中的资源，将他们加入选中
      this.resourceList.map((item) => {
        if (item.children && this.checkedKeys.indexOf(item.key) === -1) {
          // 如果当前资源存在子资源，且当前资源未被选中
          json = this.checkChildSelected(item, json, [item.key]);
        }
      });
      const data = await impowerResource(json);
      if (data.message === "成功") {
        this.$message.success("授权成功！");
      } else {
        this.$message.error(`授权失败！${data.message}`);
      }
      this.drawerVisible = false;
    },
    handleMenuClick(e) {
      switch (e.key) {
        case "1":
          this.checkedKeys = [
            "910935223317962752",
            "910935293081821184",
            "910935367107092480",
            "910935439341395968",
            "910935591649157120",
            "910935664684572672",
            "910935869249167360",
            "910936014149787648",
            "910936190939701248",
            "910936283990335489",
            "910936345004875776",
            "910936508318490624",
            "910936564761239552",
            "910936619761147904",
            "910936619761147909",
          ];
          break;
        case "2":
          this.checkedKeys = [];
          break;
        case "3":
          this.expandedKeys = [
            "910935367107092480",
            "910935591649157120",
            "910935664684572672",
          ];
          break;
        case "4":
          this.expandedKeys = [];
          break;
        default:
          break;
      }
    },
    checkChildSelected(item, json, prarentsKeys) {
      // 检查是否子资源选中，但父资源未被选中
      // prarentsKeys的作用是记录每一个父资源，防止当前子资源的祖先资源依旧被忘记选中
      let num = 0;
      item.children.map((child) => {
        if (this.checkedKeys.indexOf(child.key) > -1) {
          // 子资源被选中
          num++;
        } else if (
          child.children &&
          this.checkedKeys.indexOf(child.key) === -1
        ) {
          // 如果当前资源存在子资源，且当前资源未被选中
          json = this.checkChildSelected(child, json, [
            ...prarentsKeys,
            child.key,
          ]);
        }
      });
      if (num > 0) {
        prarentsKeys.map((key) => {
          json.push({
            id: "",
            roleId: this.roleId,
            resId: key,
          });
        });
      }
      return json;
    },
    initCheckList(item, checkedKeys) {
      if (item.childResource && item.childResource.length) {
        item.childResource.map((cell) => {
          checkedKeys = this.initCheckList(cell, checkedKeys);
        });
      } else {
        checkedKeys.push(item.id);
      }
      return checkedKeys;
    },
  },
};
</script>
<style lang="less">
.role-modal {
  .ant-modal {
    .ant-modal-header {
      .ant-modal-title {
        font-weight: 600;
      }
    }

    .ant-modal-body {
      padding: 24px 0 10px;

      .role-modal-form {
        .ant-form-item {
          padding-left: 20px;
          margin-bottom: 10px;

          &:nth-of-type(3) {
            margin-bottom: 24px;
          }

          .ant-form-item-control-wrapper {
            width: 66%;
          }
        }
        &-footer {
          margin: 0;
          border-top: 1px solid #ddd;
          height: 40px;
          padding: 0 16px;

          .ant-col {
            margin: 0;
            width: auto !important;
            top: 10px;
            right: 16px;
            position: absolute;

            .ant-btn {
              margin-right: 10px;
            }
          }
        }
      }
    }
  }
}

.role-delete-confirm {
  .ant-modal {
    .ant-modal-confirm-title {
      font-weight: 600;
    }

    .ant-modal-confirm-content {
      padding-top: 10px;
    }
  }
}

.right-set-drawer {
  .ant-drawer-header {
    .ant-drawer-title {
      font-weight: 600;
    }
  }

  .ant-drawer-body {
    position: relative;
    height: calc(100% - 55px);

    .tree-header {
      font-size: 15px;
    }

    .ant-tree {
      max-height: calc(100% - 50px);
      overflow: auto;
    }

    .tree-footer {
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      position: absolute;
      padding: 10px 20px;
      background: #fff;
      justify-content: space-between;
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.16);

      &-right {
        &-btn {
          margin-right: 10px;
        }
      }
    }
  }
}
</style>
