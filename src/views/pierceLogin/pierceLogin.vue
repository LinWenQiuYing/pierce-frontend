<template>
  <div class="pierce-login">
    <div class="pierce-login-content">
      <div class="pierce-login-content-left">
        <p class="left-title">PIERCE金融风控平台</p>
        <p class="left-subtitle">Pierce Financial Risk Control Platform</p>
        <p class="left-desc">星环科技，构建明日数据世界</p>
      </div>
      <div class="pierce-login-content-right">
        <div class="pierce-login-content-right-header">
          <img src="@/assets/images/img/transwarp.png" alt="星环科技" />
        </div>
        <div class="pierce-login-content-right-input">
          <a-input
            v-model.trim="userName"
            class="login-input"
            placeholder="请输入用户名"
          >
            <a-icon slot="prefix" type="user" />
          </a-input>
        </div>
        <div class="pierce-login-content-right-input">
          <a-input-password
            v-model="userPassword"
            class="login-input"
            placeholder="请输入密码"
            autoComplete="off"
          >
            <a-icon slot="prefix" type="lock" />
          </a-input-password>
        </div>
        <div class="pierce-login-content-right-input">
          <a-input
            v-model="verCode"
            class="verify-input"
            placeholder="请输入验证码"
            autoComplete="off"
          >
            <a-icon slot="prefix" type="safety" />
          </a-input>
          <div class="verify-img" @click="getVerCode">
            <img :src="verCodeImg" alt="验证码" />
          </div>
        </div>
        <a-button class="pierce-login-btn" @click="login" :loading="loading"
          >登录</a-button
        >
      </div>
    </div>
    <vue-particles
      color="#fff"
      :particleOpacity="0.7"
      :particlesNumber="100"
      shapeType="circle"
      :particleSize="4"
      linesColor="#fff"
      :linesWidth="1"
      :lineLinked="true"
      :lineOpacity="0.4"
      :linesDistance="150"
      :moveSpeed="1"
      :hoverEffect="true"
      hoverMode="grab"
      :clickEffect="false"
      clickMode="push"
      class="pierce-login-background"
    />
  </div>
</template>
<script>
import VueRouter from "vue-router";
import { Button, Input } from "ant-design-vue";
import { getVerCode, userLogin } from "@/shared/api/login.js";
import { baseRoutes } from "@/router/index.js";
import { mapState, mapMutations } from "vuex";
import { LocalStorage } from "@/utils/common.js";
import { cloneDeep } from "lodash";

const { Password } = Input;

export default {
  name: "PierceLogin",
  data() {
    return {
      verCode: "",
      userName: "",
      verCodeImg: "",
      loading: false,
      userPassword: "",
      verCodeValue: "",
      target: this.$route.params.target || "/",
    };
  },
  computed: {
    ...mapState("rightsOptions", ["userInfo", "userBaseRights"]),
  },
  components: {
    AButton: Button,
    AInput: Input,
    AInputPassword: Password,
  },
  mounted() {
    this.getVerCode();
    if (this.userInfo.token) {
      this.$router.replace(this.target);
    }
    document.body.addEventListener("keydown", this.handleKeyDown);
  },
  beforeDestroy() {
    document.body.removeEventListener("keydown", this.handleKeyDown);
  },
  methods: {
    ...mapMutations("rightsOptions", {
      setUserInfo: "setUserInfo",
      setUserRights: "setUserRights",
    }),
    async getVerCode() {
      const data = await getVerCode();
      if (!data) {
        this.$message.error("获取验证码失败，请重新尝试");
        return false;
      }
      this.verCodeImg = data.base64ImageCode;
      this.verCodeValue = data.code;
    },
    async login() {
      this.$message.destroy();
      if (!this.userName) {
        this.$message.error("请输入用户名");
        return false;
      } else if (!this.userPassword) {
        this.$message.error("请输入密码");
        return false;
      } else if (!this.verCode) {
        this.$message.error("请输入验证码");
        return false;
      } else if (
        this.verCode.toLowerCase() !== this.verCodeValue.toLowerCase()
      ) {
        this.$message.error("验证码输入有误");
        this.getVerCode();
        this.verCode = "";
        return false;
      }
      this.loading = true;
      const json = {
        account: this.userName,
        password: this.userPassword,
        verCode: this.verCode,
        loginType: 1,
      };
      const data = await userLogin(json);
      if (data.message === "成功") {
        this.loading = false;
        this.$message.success("登录成功");
        const rights = data.data.resourcesCode; // 保存资源权限
        const userRights = cloneDeep(this.userBaseRights);
        rights.map((right) => {
          userRights[right] = true;
        });
        userRights.graphsStructure = true;
        userRights.blueprintManage = true;
        const restRoutes = [];
        const routes = cloneDeep(baseRoutes);
        routes[0].children.map((item) => {
          if (item.name) {
            const flag = userRights[`${item.name}`];
            if (flag) {
              if (item.children && item.children.length) {
                const carr = [];
                item.children.map((citem) => {
                  const cflag = userRights[`${citem.name}`];
                  if (cflag) {
                    carr.push(citem);
                  }
                });
                item.children = carr;
              }
              restRoutes.push(item);
            }
          } else {
            const flag = userRights["affairGraph"];
            if (flag) {
              restRoutes.push(item);
            }
          }
        });
        // 重定向默认为layout的第一个子路由
        routes[0].redirect =
          restRoutes[0].children && restRoutes[0].children.length
            ? restRoutes[0].children[0].path === ""
              ? `${restRoutes[0].path}`
              : `${restRoutes[0].path}/${restRoutes[0].children[0].path}`
            : restRoutes[0].path;
        routes[0].children = restRoutes;

        // 重置router的matcher，相当于重置routes为[]
        this.$router.matcher = new VueRouter({
          mode: "history",
          base: process.env.BASE_URL,
        }).matcher;
        // 根据用户权限配置路由
        routes.map((route) => {
          this.$router.addRoute(route);
        });

        // 判断登陆用户的角色是否包含超级管理员角色
        let isRoot = false;
        for (let i = 0; i < data.data.roles.length; i++) {
          const role = data.data.roles[i];
          if (role.roleCode === "root") {
            isRoot = true;
            break;
          }
        }
        if (isRoot) {
          userRights.btn_doRuleTask = true;
        }

        // 一切就绪，保存用户信息与用户权限信息
        const userInfo = {
          token: data.data.token,
          roles: data.data.roles,
          userId: data.data.id,
          userName: data.data.account,
        };
        LocalStorage.setItem({
          name: "userInfo",
          value: JSON.stringify(userInfo),
          expires: 259200000, // 三天
        });
        this.setUserInfo(userInfo);
        LocalStorage.setItem({
          name: "userRights",
          value: JSON.stringify(userRights),
          expires: 259200000, // 三天
        });
        this.setUserRights(userRights);

        // 登录成功，跳转主界面路由
        this.$router.replace(this.target);
      } else {
        this.loading = false;
        this.$message.error(`${data.message}`);
      }
    },
    handleKeyDown(e) {
      e.stopPropagation();
      if (e.keyCode === 13) {
        this.login();
      }
    },
  },
};
</script>
<style lang="less">
.pierce-login {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url("../../assets/images/img/login_background.png") no-repeat center;
  position: fixed;
  top: 0;
  left: 0;
  zoom: 1;
  background-color: #fff;
  background-size: cover;
  -webkit-background-size: cover;
  -o-background-size: cover;

  &::before {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    content: "";
    opacity: 0.3;
    position: absolute;
    background: #000;
  }

  &-content {
    z-index: 1;
    width: 800px;
    height: 360px;
    display: flex;

    &-left {
      width: 420px;
      height: 100%;
      color: #fff;
      padding-top: 100px;
      padding-left: 40px;
      background: url("../../assets/images/img/login_background_2.png")
        no-repeat center;

      .left-title {
        font-size: 27px;
      }

      .left-subtitle {
        opacity: 0.7;
        font-size: 12px;
        letter-spacing: 1px;
      }

      .left-desc {
        opacity: 0.9;
        font-size: 16px;
        padding-top: 20px;
      }
    }

    &-right {
      width: 380px;
      height: 100%;
      background: #fff;
      border-radius: 0 6px 6px 0;

      &-header {
        padding: 25px 0;
        text-align: center;
        margin-bottom: 5px;

        img {
          width: 200px;
        }
      }

      &-input {
        width: 270px;
        height: 36px;
        display: flex;
        margin: 0 auto;
        margin-bottom: 20px;
        align-items: center;
        justify-content: space-between;

        .ant-input-affix-wrapper {
          height: 100%;

          .ant-input {
            height: 100%;
          }
        }

        .ant-input-prefix {
          color: #979797;
        }

        .verify-input {
          width: 170px;
        }

        .verify-img {
          height: 100%;
          cursor: pointer;

          img {
            height: 100%;
          }
        }
      }

      .pierce-login-btn {
        width: 270px;
        height: 36px;
        margin: 0 auto;
        color: #fff;
        display: block;
        background-image: linear-gradient(to right, #18b3f1, #0474e6);
      }
    }
  }

  &-background {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    position: absolute;
  }
}
</style>
