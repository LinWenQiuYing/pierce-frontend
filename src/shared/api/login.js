import axiosInstance from "./index.js";

const loginUrl = "/pierce/login";
const resUrl = "/pierce/resource";

// 生成验证码
export async function getVerCode() {
  const res = await axiosInstance.post(`${loginUrl}/verCode`, {
    timeout: -1,
  });
  return res.data;
}

// 登录
export async function userLogin(json) {
  const res = await axiosInstance.post(`${loginUrl}/`, json, {
    timeout: -1,
  });
  return res;
}

// 登出
export async function userLogout(token) {
  const res = await axiosInstance.get(`${loginUrl}/clear/${token}`);
  return res;
}

// 获取账号权限资源列表
export async function getUserPermission(roleId) {
  const res = await axiosInstance.get(
    `${resUrl}/queryImpowerResource?roleId=${roleId}`
  );
  return res.data;
}

// 角色授权
export async function impowerResource(json) {
  const res = await axiosInstance.post(`${resUrl}/impowerResource`, json, {
    timeout: -1,
  });
  return res;
}
