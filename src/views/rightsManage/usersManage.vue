<template>
  <TableList
    listClass="users-manage"
    tableTitle="用户列表"
    :columns="columns"
    :tableValue="tableValue"
    :pagination="pagination"
    :tableLoading="searchLoading3"
    tableClass="user-table"
    :rowKey="(record) => record.id"
    isDefaultFold
  >
    <template v-slot:searchOptions>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">用户名称：</span>
        <a-input
          type="text"
          class="table-list-top-item-input"
          placeholder="用户名称"
          v-model.trim="userName"
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">真实姓名：</span>
        <a-input
          type="text"
          class="table-list-top-item-input"
          placeholder="真实姓名"
          v-model.trim="trueName"
        />
      </div>
      <div class="table-list-top-item">
        <a-button @click="reset"> 重置 </a-button>
        <a-button
          type="primary"
          @click="onSearch('init')"
          :loading="searchLoading1"
          v-if="userRights.btn_queryUser"
        >
          查询
        </a-button>
      </div>
    </template>
    <template v-slot:tableBtns>
      <a-button
        type="primary"
        @click="addUser"
        icon="plus-circle"
        v-if="userRights.btn_addUser"
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
      <a @click="edit(record)" v-if="userRights.btn_editUser">编辑</a>
      <a
        @click="freeze(record)"
        v-if="record.status === '冻结' && userRights.btn_startOrStopUser"
        >启用</a
      >
      <a
        @click="freeze(record)"
        v-if="record.status === '启用' && userRights.btn_startOrStopUser"
        >冻结</a
      >
      <a @click="setPassWord(record)" v-if="userRights.btn_updatePassword"
        >修改密码</a
      >
      <a
        v-if="record.status === '冻结' && userRights.btn_deleteUser"
        @click="deleteOut(record)"
        style="color: red"
        >删除</a
      >
      <a
        v-if="
          !userRights.btn_editUser &&
          !userRights.btn_startOrStopUser &&
          !userRights.btn_updatePassword &&
          !userRights.btn_deleteUser
        "
        class="no-action"
      >
        暂无操作权限
      </a>
    </template>
    <template v-slot:otherPart>
      <a-modal
        class="info-modal"
        :title="addUserTitle"
        :visible="showAddUser"
        okText="确定"
        cancelText="取消"
        @ok="addUserConfirm"
        @cancel="addUserCancel"
        centered
      >
        <div class="info">
          <div class="info-name">
            <div class="item-label"><i style="color: red">*</i> 用户名：</div>
            <a-input
              placeholder="请输入用户名"
              v-model.trim="addUserName"
              class="item-content"
              :disabled="addUserTitle === '编辑用户'"
            ></a-input>
          </div>
          <div class="info-name">
            <div class="item-label"><i style="color: red">*</i> 真实姓名：</div>
            <a-input
              placeholder="请输入真实姓名"
              v-model.trim="addTrueName"
              class="item-content"
            ></a-input>
          </div>
          <div class="info-name" v-if="addUserTitle === '新增用户'">
            <div class="item-label"><i style="color: red">*</i> 密码：</div>
            <a-input-password
              placeholder="请输入密码"
              v-model="addPassWord"
              class="item-content"
            ></a-input-password>
          </div>
          <div class="info-name">
            <div class="item-label">邮箱：</div>
            <a-input
              placeholder="请输入邮箱"
              v-model.trim="addEmail"
              class="item-content"
            ></a-input>
          </div>
          <div class="info-name">
            <div class="item-label">手机号：</div>
            <a-input
              placeholder="请输入手机号"
              v-model.trim="addTelPhone"
              class="item-content"
            ></a-input>
          </div>
          <div class="info-name">
            <div class="item-label">电话：</div>
            <a-input
              placeholder="请输入电话"
              v-model.trim="addPhone"
              class="item-content"
            ></a-input>
          </div>
          <div class="info-name">
            <div class="item-label"><i style="color: red">*</i> 认证方式：</div>
            <a-select
              placeholder="请选择认证方式"
              v-model="verifyMethod"
              class="item-content"
            >
              <a-select-option :value="0">本地认证</a-select-option>
            </a-select>
          </div>
          <div class="info-name">
            <div class="item-label"><i style="color: red">*</i> 所属机构：</div>
            <a-select
              placeholder="请选择机构"
              v-model="addAgency"
              class="item-content"
            >
              <a-select-option
                v-for="item in allAgency"
                :value="item.id"
                :key="item.id"
                >{{ item.orgName }}</a-select-option
              >
            </a-select>
          </div>
          <div class="info-name">
            <div class="item-label"><i style="color: red">*</i> 用户角色：</div>
            <a-select
              mode="multiple"
              :token-separators="[',']"
              placeholder="请选择用户角色"
              v-model="addRole"
              class="item-content"
            >
              <!-- mode="multiple"
            :token-separators="[',']" -->
              <a-select-option
                v-for="item in allRoles"
                :value="item.id"
                :key="item.id"
                >{{ item.label }}</a-select-option
              >
            </a-select>
          </div>
        </div>
      </a-modal>
      <a-modal
        class="info-modal"
        title="修改密码"
        :visible="showChangePass"
        okText="确定"
        cancelText="取消"
        @ok="changePassWord"
        @cancel="cancelPassWord"
        centered
      >
        <div class="info">
          <div class="info-name">
            <div class="item-label"><i style="color: red">*</i> 原密码：</div>
            <a-input-password
              placeholder="请输入原密码"
              v-model="oldPassword"
              class="item-content"
            ></a-input-password>
          </div>
          <div class="info-name">
            <div class="item-label"><i style="color: red">*</i> 新密码：</div>
            <a-input-password
              placeholder="请输入新密码"
              v-model="newPassword"
              class="item-content"
            ></a-input-password>
          </div>
          <div class="info-name">
            <div class="item-label"><i style="color: red">*</i> 确认密码：</div>
            <a-input-password
              placeholder="请重新确认新密码"
              v-model="newPasswordConfirm"
              class="item-content"
            ></a-input-password>
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
  getAllUserList,
  getAllOrganization,
  getAllRoles,
  addUser,
  deleteUser,
  setPassword,
  setAccountState,
  setAccountInfo,
} from "@/shared/api/rightsManage";
import { find } from "lodash";
import { hidePhoneNumber, hideName, modalConfirm } from "@/utils/common.js";
import { mapState } from "vuex";

const { Password } = Input;

export default {
  name: "UsersManage",
  data() {
    return {
      userName: "",
      trueName: "",
      agency: undefined,
      columns: [
        {
          title: "用户名称",
          dataIndex: "userName",
          key: "userName",
          width: 110,
        },
        {
          title: "真实姓名",
          dataIndex: "trueName",
          key: "trueName",
          width: 90,
        },
        {
          title: "机构名称",
          dataIndex: "agency",
          key: "agency",
          width: 120,
        },
        {
          title: "邮箱",
          dataIndex: "email",
          key: "email",
          width: 150,
        },
        {
          title: "手机号",
          dataIndex: "phoneNum",
          key: "phoneNum",
          width: 140,
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
          width: 89,
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
          this.getAllList("repeat");
        },
        onShowSizeChange: (current, size) => {
          this.pagination.current = current;
          this.pagination.pageSize = size;
          this.getAllList("repeat");
        },
      },
      showAddUser: false,
      addPassWord: "",
      addUserName: "",
      addTrueName: "",
      addEmail: "",
      addTelPhone: "",
      addPhone: "",
      verifyMethod: undefined,
      addAgency: undefined,
      addRole: [],
      showChangePass: false,
      addUserTitle: "",
      allAgency: [],
      allRoles: [],
      oldPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
      checkRowRecord: {},
      searchLoading1: false, // 查询按钮
      searchLoading2: false, // 刷新按钮
      searchLoading3: false, // 表格
    };
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
    ABadge: Badge,
    AButton: Button,
    AInput: Input,
    AInputPassword: Password,
    TableList,
  },
  computed: {
    ...mapState("rightsOptions", ["userInfo", "userRights"]),
  },
  async mounted() {
    let info = {
      currentUser: this.userInfo.userId,
      orgCode: "",
      orgName: "",
      status: null,
    };
    let value = {
      currentUser: this.userInfo.userId,
      roleCode: "",
      roleName: "",
    };
    this.getAllList("init");
    const allAgency = await getAllOrganization(info);
    if (!allAgency) {
      this.$message.error("获取全部机构信息失败");
    } else {
      this.allAgency = allAgency;
    }
    const data = await getAllRoles(value);
    if (!allAgency) {
      this.$message.error("获取全部角色信息失败");
      return false;
    }
    const allRoles = [];
    data.dateList.map((item) => {
      allRoles.push({
        label: item.roleName,
        code: item.roleCode,
        id: item.id,
      });
    });
    this.allRoles = allRoles;
  },
  methods: {
    async getAllList(type) {
      if (type === "init") {
        this.$set(this.pagination, "current", 1);
      }
      const json = {
        pageNo: this.pagination.current,
        pageSize: this.pagination.pageSize,
        account: this.userName,
        realName: this.trueName,
      };
      this.searchLoading3 = true;
      const tableValue = [];
      let res = await getAllUserList(json);
      this.searchLoading3 = false;
      if (!res) {
        this.$message.error("获取用户列表失败");
      } else {
        this.pagination.total = parseInt(res.totalCount);
        let apidata = res.dateList;
        for (let i = 0; i < apidata.length; i++) {
          const target = find(
            this.allAgency,
            (v) => v.id === apidata[i].subDepartmentId
          );
          let arr = {
            userName: apidata[i].account,
            trueName: apidata[i].realName,
            status: apidata[i].status === "0" ? "启用" : "冻结",
            agency: (target && target.orgName) || apidata[i].subDepartmentName,
            agencyId: apidata[i].subDepartmentId,
            email: apidata[i].email,
            phoneNum: apidata[i].mobile,
            id: apidata[i].id,
            roleIds: apidata[i].roleInfoResDtos,
            telephone: apidata[i].telephone,
            authType: apidata[i].authType,
          };
          tableValue.push(arr);
        }
        this.tableValue = tableValue;
      }
    },
    async onSearch(type) {
      this.searchLoading1 = true;
      await this.getAllList(type);
      this.searchLoading1 = false;
    },
    async handleRefresh(type) {
      this.searchLoading2 = true;
      await this.getAllList(type);
      this.searchLoading2 = false;
    },
    reset() {
      this.userName = "";
      this.trueName = "";
      this.getAllList("init");
    },
    edit(record) {
      this.addUserTitle = "编辑用户";
      this.showAddUser = true;
      this.checkRowRecord = record;

      this.addUserName = record.userName;
      this.addTrueName = record.trueName;
      this.addEmail = record.email;
      this.addTelPhone = record.phoneNum;
      this.addPhone = record.telephone;
      this.verifyMethod = record.authType;
      this.addAgency = record.agencyId;
      this.addRole = record.roleIds.map((v) => v.id);
    },
    freeze(record) {
      const _that = this;
      const title =
        record.status === "冻结"
          ? `确定要启用 ${record.userName} 账号吗？`
          : `确定要冻结 ${record.userName} 账号吗？`;
      const content =
        record.status === "冻结"
          ? "账号启用之后，用户将可以通过该账号登陆，请确认是否启用此账号。"
          : "账号冻结之后，用户将无法通过该账号登陆，请确认是否冻结此账号。";
      const onOk = async () => {
        let info = {
          id: record.id,
          account: record.userName,
          realName: record.trueName,
          status: record.status === "冻结" ? "0" : "1",
        };
        let resultFreeze = await setAccountState(info);
        resultFreeze.message === "成功"
          ? _that.$message.success("用户状态修改成功！")
          : _that.$message.error("用户状态修改失败！");
        if (resultFreeze.message === "成功") {
          this.getAllList("init");
        }
      };
      modalConfirm(title, _that, onOk, content);
    },
    setPassWord(record) {
      this.showChangePass = true;
      this.checkRowRecord = record;
    },
    deleteOut(record) {
      const _that = this;
      const title = `确定要删除 ${record.userName} 吗？`;
      const content = `${record.userName}的用户信息将被删除，且操作无法撤销，请确认是否删除该用户信息。`;
      const onOk = async () => {
        const info = {
          id: record.id,
          account: record.userName,
          realName: record.trueName,
        };
        let resultDel = await deleteUser(info);
        resultDel.message === "成功"
          ? _that.$message.success("用户删除成功！")
          : _that.$message.error("用户删除失败！");

        if (resultDel.message === "成功") {
          this.getAllList("init");
        }
      };
      modalConfirm(title, _that, onOk, content);
    },
    addUser() {
      this.addUserTitle = "新增用户";
      this.addUserName = "";
      this.addPassWord = "";
      this.addTrueName = "";
      this.addEmail = "";
      this.addTelPhone = "";
      this.addPhone = "";
      this.addAgency = undefined;
      this.addRole = [];
      this.verifyMethod = undefined;
      this.showAddUser = true;
    },
    async addUserConfirm() {
      if (this.addUserTitle === "新增用户") {
        if (
          this.addUserName &&
          this.addTrueName &&
          this.verifyMethod !== undefined &&
          this.addPassWord &&
          this.addRole.length
        ) {
          let info = {
            password: this.addPassWord,
            account: this.addUserName,
            currentUser: this.userInfo.userId,
            subDepartmentId: this.addAgency,
            email: this.addEmail,
            mobile: this.addTelPhone,
            realName: this.addTrueName,
            roleIds: this.addRole.length ? this.addRole : [],
            telephone: this.addPhone,
            authType: this.verifyMethod,
          };
          let result = await addUser(info);
          result.message === "成功"
            ? this.$message.success("添加用户成功！")
            : this.$message.warning("添加用户失败！");
          if (result.message === "成功") {
            this.showAddUser = false;
            this.getAllList("init");
          }
        } else if (this.addUserName === "") {
          this.$message.warning("用户名不可为空！");
        } else if (this.addTrueName === "") {
          this.$message.warning("真实姓名不可为空！");
        } else if (!this.addPassWord) {
          this.$message.warning("密码不可为空！");
        } else if (this.verifyMethod === undefined) {
          this.$message.warning("认证方式不可为空！");
        } else if (!this.addAgency) {
          this.$message.warning("所属机构不可为空！");
        } else if (!this.addRole.length) {
          this.$message.warning("用户角色不可为空！");
        }
      } else {
        const info = {
          account: this.userName,
          realName: this.trueName,
        };
        info.account = this.addUserName;
        info.realName = this.addTrueName;
        info.email = this.addEmail;
        info.id = this.checkRowRecord.id;
        info.mobile = this.addTelPhone;
        info.telephone = this.addPhone;
        info.subDepartmentId = this.addAgency;
        info.authType = this.verifyMethod;
        info.roleIds = this.addRole.length ? this.addRole : [];
        let resultSetInfo = await setAccountInfo(info);
        if (resultSetInfo.message === "成功") {
          this.showAddUser = false;
          this.$message.success("信息修改成功!");
          this.getAllList("init");
        } else {
          this.$message.success(`信息修改失败!${resultSetInfo.message}`);
        }
      }
    },
    addUserCancel() {
      this.showAddUser = false;
    },
    async changePassWord() {
      if (
        this.newPasswordConfirm !== "" &&
        this.newPassword !== "" &&
        this.newPassword === this.newPasswordConfirm
      ) {
        const json = {
          id: this.checkRowRecord.id,
          account: this.userName,
          realName: this.trueName,
          oriPassword: this.oldPassword,
          password: this.newPassword,
          secPassword: this.newPasswordConfirm,
        };
        const resultPW = await setPassword(json);
        if (resultPW.message === "成功") {
          this.$message.success("修改密码成功！");
        } else {
          this.$message.warning(`修改密码失败！ ${resultPW.message}`);
        }
      } else if (this.newPassword === "") {
        this.$message.warning("请填写新密码");
      } else if (this.newPasswordConfirm === "") {
        this.$message.warning("请确认新密码");
      } else {
        this.$message.warning("新密码和确认密码不一致，请重新确认");
      }
      this.cancelPassWord();
    },
    cancelPassWord() {
      this.showChangePass = false;
      this.oldPassword = "";
      this.newPassword = "";
      this.newPasswordConfirm = "";
    },
  },
};
</script>
<style lang="less">
.info-modal {
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
        .info {
          .info-name {
            margin-top: 10px;
            display: flex;

            .item-label {
              width: 100px;
              text-align: right;
              margin-right: 10px;
              color: #515a6e;
              line-height: 30px;
            }

            .item-content {
              width: 320px;

              &.ant-input-disabled {
                background: #fff;
                color: rgba(0, 0, 0, 0.65);
              }
            }
          }
        }
      }
    }
  }
}
</style>
