<template>
  <TableList
    listClass="organization-manage"
    tableTitle="机构列表"
    :columns="columns"
    :tableValue="tableValue"
    :pagination="pagination"
    :tableLoading="searchLoading3"
    tableClass="organization-table"
    :rowKey="(record) => record.id"
    isDefaultFold
  >
    <template v-slot:searchOptions>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">机构名称：</span>
        <a-input
          allow-clear
          class="table-list-top-item-input"
          placeholder="机构名称"
          v-model.trim="orgName"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">机构编码：</span>
        <a-input
          allow-clear
          placeholder="机构编码"
          v-model.trim="orgCode"
          class="table-list-top-item-input"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">机构状态：</span>
        <a-select
          placeholder="机构状态"
          v-model="searchType"
          class="table-list-top-item-input"
        >
          <a-select-option value="0">启用</a-select-option>
          <a-select-option value="1">停用</a-select-option>
        </a-select>
      </div>
      <div class="table-list-top-item">
        <a-button @click="reset"> 重置 </a-button>
        <a-button
          type="primary"
          @click="onSearch('init')"
          :loading="searchLoading1"
          v-if="userRights.btn_checkOrganization"
        >
          查询
        </a-button>
      </div>
    </template>
    <template v-slot:tableBtns>
      <a-button
        type="primary"
        class="header-btn"
        @click="addUser"
        icon="plus-circle"
        v-if="userRights.btn_addOrganization"
      >
        添加
      </a-button>
      <a-button
        class="header-btn"
        @click="onRefresh('repeat')"
        :icon="searchLoading2 ? 'loading' : 'undo'"
        >刷新</a-button
      >
    </template>
    <template v-slot:actionsSlot="{ record }">
      <a @click="checkDetail(record)" v-if="userRights.btn_checkOrganization"
        >查看</a
      >
      <a @click="editUser(record)" v-if="userRights.btn_updateOrganization"
        >编辑</a
      >
      <a
        @click="enable(record)"
        v-if="
          record.status === '停用' && userRights.btn_startOrStopOrganization
        "
        >启用</a
      >
      <a
        @click="enable(record)"
        v-if="
          record.status === '启用' && userRights.btn_startOrStopOrganization
        "
        >停用</a
      >
      <a
        v-if="record.status === '停用' && userRights.btn_delOrganization"
        @click="deleteOut(record)"
        style="color: red"
        >删除</a
      >
      <a
        v-if="
          !userRights.btn_checkOrganization &&
          !userRights.btn_updateOrganization &&
          !userRights.btn_startOrStopOrganization &&
          !userRights.btn_delOrganization
        "
        class="no-action"
      >
        暂无操作权限
      </a>
    </template>
    <template v-slot:otherPart>
      <a-modal
        class="organization-modal"
        :title="modalTitle"
        :visible="showAddUser"
        okText="确定"
        cancelText="取消"
        @ok="addUserConfirm"
        @cancel="addUserCancel"
        centered
      >
        <div class="organization">
          <div class="organization-name">
            <div class="item-label">
              <span style="color: red">*</span> 机构名称：
            </div>
            <a-input
              placeholder="请输入机构名称"
              v-model.trim="organizationName"
              style="width: 320px"
              :disabled="modalTitle !== '新增机构'"
            ></a-input>
          </div>
          <div class="organization-name">
            <div class="item-label">上级机构：</div>
            <a-select
              placeholder="请选择上级机构"
              v-model="superiorOrganization"
              style="width: 320px"
              :disabled="checkDe"
              allow-clear
            >
              <a-select-option
                v-for="item in allOrganization"
                :value="item.value"
                :key="item.value"
                >{{ item.label }}</a-select-option
              >
            </a-select>
          </div>
          <div
            class="organization-name"
            style="margin-top: 10px; display: flex"
          >
            <div class="item-label">
              <span style="color: red">*</span> 机构编码：
            </div>
            <a-input
              placeholder="请输入机构编码"
              v-model.trim="OrganizationCode"
              style="width: 320px"
              :disabled="checkDe"
            ></a-input>
          </div>
        </div>
      </a-modal>
    </template>
  </TableList>
</template>
<script>
import TableList from "@/components/tableList";
import { Badge, Button, Input } from "ant-design-vue";
import {
  searchOrganization,
  organzationAdd,
  organzationEdit,
  organzationDelete,
  getAllOrganization,
} from "@/shared/api/rightsManage";
import { mapState } from "vuex";
import { modalConfirm } from "@/utils/common.js";

export default {
  name: "OrganizationManage",
  data() {
    return {
      orgName: "",
      orgCode: "",
      searchType: undefined,
      columns: [
        {
          title: "机构编码",
          dataIndex: "orgCode",
          key: "orgCode",
          width: 129,
        },
        {
          title: "机构名称",
          dataIndex: "orgName",
          key: "orgName",
          width: 170,
        },
        {
          title: "上级机构",
          dataIndex: "parentOrg",
          key: "parentOrg",
          width: 170,
        },
        {
          title: "创建人",
          dataIndex: "createName",
          key: "createName",
          width: 120,
        },
        {
          title: "状态",
          dataIndex: "status",
          key: "status",
          customRender: (text) => {
            return (
              <a-badge
                color={text === "停用" ? "#f5222d" : "#52c41a"}
                text={text}
              />
            );
          },
          width: 110,
        },
        {
          title: "操作",
          key: "actions",
          dataIndex: "actions",
          width: 180,
          scopedSlots: { customRender: "actions" },
        },
      ],
      tableValue: [],
      pagination: {
        size: "small",
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
          this.getAllData("repeat");
        },
        onShowSizeChange: (current, size) => {
          this.pagination.current = current;
          this.pagination.pageSize = size;
          this.getAllData("repeat");
        },
      },
      showAddUser: false,
      organizationName: "",
      OrganizationCode: "",
      agencyUser: "",
      superiorOrganization: undefined,
      detailId: undefined,
      checkDe: false,
      modify: false,
      allOrganization: [
        {
          label: "/",
          value: "-1",
        },
      ],
      modalTitle: "",
      searchLoading1: false, // 查询按钮
      searchLoading2: false, // 刷新按钮
      searchLoading3: false, // 表格
    };
  },
  async mounted() {
    this.getAllData("init");
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
    ABadge: Badge,
    AButton: Button,
    AInput: Input,
    TableList,
  },
  computed: {
    ...mapState("rightsOptions", ["userInfo", "userRights"]),
  },
  methods: {
    async getAllData(type) {
      if (type === "init") {
        this.$set(this.pagination, "current", 1);
      }
      const json = {
        currentUser: this.userInfo.userId,
        pageNo: this.pagination.current,
        pageSize: this.pagination.pageSize,
        orgCode: this.orgCode,
        orgName: this.orgName,
        status: this.searchType ? Number(this.searchType) : null,
      };
      this.searchLoading3 = true;
      const tableValue = [];
      let data = await searchOrganization(json);
      if (!data) {
        this.$message.error("获取机构列表失败，请重新尝试");
      } else {
        this.pagination.total = parseInt(data.totalCount);
        for (let i = 0; i < data.dateList.length; i++) {
          const element = data.dateList;
          let arr = {
            createName: element[i].createUser,
            parentOrg: element[i].parentName,
            status: element[i].status === 0 ? "启用" : "停用", //0启用 1停用
            orgName: element[i].orgName,
            orgCode: element[i].orgCode,
            id: element[i].id,
            parentOrgId: element[i].parentId,
          };
          tableValue.push(arr);
        }
        this.tableValue = tableValue;
      }
      this.searchLoading3 = false;
    },
    async onRefresh(type) {
      this.searchLoading2 = true;
      await this.getAllData(type);
      this.searchLoading2 = false;
    },
    async onSearch(type) {
      this.searchLoading1 = true;
      await this.getAllData(type);
      this.searchLoading1 = false;
    },
    async getAllOrganization() {
      const json = {
        currentUser: this.userInfo.userId,
        orgCode: "",
        orgName: "",
        status: null,
      };
      const allOrganization = [
        {
          label: "/",
          value: "-1",
        },
      ];
      let data = await getAllOrganization(json);
      if (!data) {
        this.$message.error("获取全部机构信息失败");
        return false;
      }
      for (let i = 0; i < data.length; i++) {
        let arr = {
          label: data[i].orgName,
          value: data[i].id,
        };
        allOrganization.push(arr);
      }
      this.allOrganization = allOrganization;
    },
    reset() {
      this.orgName = "";
      this.searchType = undefined;
      this.orgCode = "";
      this.getAllData("init");
    },
    addUser() {
      this.modalTitle = "新增机构";
      this.organizationName = "";
      this.OrganizationCode = "";
      this.superiorOrganization = "-1";
      this.checkDe = false;
      this.modify = false;
      this.showAddUser = true;
      this.getAllOrganization();
    },
    async addUserConfirm() {
      if (this.checkDe) {
        this.showAddUser = false;
        return false;
      }
      if (this.organizationName && this.OrganizationCode) {
        let info = {
          currentUser: this.userInfo.userId,
          orgCode: this.OrganizationCode,
          orgName: this.organizationName,
          parentOrgId: this.superiorOrganization,
        };
        let result = null;
        const loading = this.$message.loading("正在操作", 0);
        if (this.modify) {
          info.id = this.detailId;
          result = await organzationEdit(info);
        } else {
          result = await organzationAdd(info);
        }
        this.addUserCancel();
        loading();
        const text = this.modify ? "修改" : "添加";
        if (result.message === "成功") {
          this.$message.success(`${text}成功`);
          this.getAllData("init");
        } else {
          this.$message.warning(`${text}失败`);
        }
      } else if (this.organizationName === "") {
        this.$message.warning("请填写机构名称");
      } else if (this.OrganizationCode === "") {
        this.$message.warning("请填写机构编码");
      }
    },
    addUserCancel() {
      this.showAddUser = false;
    },
    deleteOut(record) {
      const _that = this;
      const title = `确定要删除 ${record.orgName} 吗？`;
      const content = `${record.orgName}的机构信息将被删除，且操作无法撤销，请确认是否删除该机构信息？`;
      const onOk = async () => {
        let result = await organzationDelete(record.id);
        result.message === "成功"
          ? _that.$message.success("机构删除成功！")
          : _that.$message.error("机构失败！");
        _that.getAllData("init");
      };
      modalConfirm(title, _that, onOk, content);
    },
    enable(record) {
      const _that = this;
      const title =
        record.status === "停用"
          ? `确定要启用 ${record.orgName} 吗？`
          : `确定要停用 ${record.orgName} 吗？`;
      const content =
        record.status === "启用"
          ? `${record.orgName}的机构信息将被停用！`
          : `${record.orgName}的机构信息将被启用！`;
      const onOk = async () => {
        let info = {
          currentUser: _that.userInfo.userId,
          id: record.id,
          orgCode: record.orgCode,
          orgName: record.orgName,
          parentOrgId: record.parentOrgId,
          status: record.status === "停用" ? 0 : 1,
        };
        let res = await organzationEdit(info);
        res.message === "成功"
          ? record.status === "停用"
            ? _that.$message.success("机构启用成功！")
            : _that.$message.success("机构停用成功！")
          : _that.$message.error("操作失败");
        _that.getAllData("init");
      };
      modalConfirm(title, _that, onOk, content);
    },
    editUser(record) {
      this.modalTitle = "编辑机构";
      this.checkDe = false;
      this.modify = true;
      this.organizationName = record.orgName;
      this.OrganizationCode = record.orgCode;
      this.superiorOrganization = record.parentOrgId;
      this.detailId = record.id;
      this.showAddUser = true;
      this.getAllOrganization();
    },
    checkDetail(record) {
      this.modalTitle = "查看机构";
      this.checkDe = true;
      this.modify = false;
      this.organizationName = record.orgName;
      this.OrganizationCode = record.orgCode;
      this.superiorOrganization = record.parentOrg;
      this.agencyUser = record.createName;
      this.showAddUser = true;
      this.getAllOrganization();
    },
  },
};
</script>
<style lang="less">
.organization-manage {
  .table-list-top-item {
    width: calc((100% - 96px) / 4);
  }
}

.organization-modal {
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
        .organization {
          .organization-name {
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
