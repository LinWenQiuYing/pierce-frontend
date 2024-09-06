import axiosInstance from "./index.js";

const orgUrl = "/pierce/org";
const accountUrl = "/pierce/account";
const roleUrl = "/pierce/role";
const resourceUrl = "/pierce/resource";

export async function searchOrganization(json) {
  const res = await axiosInstance.post(`${orgUrl}/query`, json, {
    timeout: -1,
  });
  return res.data;
}

export async function getAllOrganization(json) {
  const res = await axiosInstance.post(`${orgUrl}/all`, json, {
    timeout: -1,
  });
  return res.data;
}

export async function organzationEdit(json) {
  const res = await axiosInstance.post(`${orgUrl}/modify`, json, {
    timeout: -1,
  });
  return res;
}

export async function organzationAdd(json) {
  const res = await axiosInstance.post(`${orgUrl}/add`, json, {
    timeout: -1,
  });
  return res;
}

export async function getOrganzationDetailId(id) {
  const res = await axiosInstance.get(`${orgUrl}/detail/${id}`);
  return res;
}

export async function organzationDelete(id) {
  const res = await axiosInstance.get(`${orgUrl}/delete/${id}`);
  return res;
}

//用户管理获得所有列表接口
export async function getAllUserList(json) {
  const res = await axiosInstance.post(`${accountUrl}/pageQuery`, json, {
    timeout: -1,
  });
  return res.data;
}

//用户管理新增账号接口
export async function addUser(json) {
  const res = await axiosInstance.post(`${accountUrl}/add`, json, {
    timeout: -1,
  });
  return res;
}

//用户管理删除账号接口
export async function deleteUser(json) {
  const res = await axiosInstance.post(`${accountUrl}/delete`, json, {
    timeout: -1,
  });
  return res;
}

//用户管理修改账号接口
export async function setAccountInfo(json) {
  const res = await axiosInstance.post(`${accountUrl}/update`, json, {
    timeout: -1,
  });
  return res;
}

//用户管理修改账号密码接口
export async function setPassword(json) {
  const res = await axiosInstance.post(`${accountUrl}/updatePassword`, json, {
    timeout: -1,
  });
  return res;
}

//用户管理修改账号状态
export async function setAccountState(json) {
  const res = await axiosInstance.post(`${accountUrl}/updateStatus`, json, {
    timeout: -1,
  });
  return res;
}

//角色管理获取角色列表
export async function getAllRoles(json) {
  const res = await axiosInstance.post(`${roleUrl}/pageQuery`, json, {
    timeout: -1,
  });
  return res.data;
}

//角色管理新增角色
export async function addRole(json) {
  const res = await axiosInstance.post(`${roleUrl}/add`, json, {
    timeout: -1,
  });
  return res;
}

//角色管理编辑角色
export async function editRole(json) {
  const res = await axiosInstance.post(`${roleUrl}/update`, json, {
    timeout: -1,
  });
  return res;
}

//角色管理删除角色
export async function deleteRole(json) {
  const res = await axiosInstance.post(`${roleUrl}/delete`, json, {
    timeout: -1,
  });
  return res;
}

//角色管理查询角色详情
export async function getRoleDetail(id) {
  const res = await axiosInstance.get(`${roleUrl}/info/${id}`);
  return res.data;
}

//角色管理查询数据权限
export async function getDataPerm() {
  const res = await axiosInstance.get(`${roleUrl}/queryDataPerm`);
  return res;
}

//资源管理列表查询
export async function getResourceList(json) {
  const res = await axiosInstance.post(`${resourceUrl}/query`, json, {
    timeout: -1,
  });
  return res.data;
}

//资源管理资源新增
export async function addResource(json) {
  const res = await axiosInstance.post(`${resourceUrl}/add`, json, {
    timeout: -1,
  });
  return res;
}

//资源管理资源编辑
export async function updateResource(json) {
  const res = await axiosInstance.post(`${resourceUrl}/update`, json, {
    timeout: -1,
  });
  return res;
}

//资源管理资源删除
export async function resourceDelete(json) {
  const res = await axiosInstance.post(`${resourceUrl}/delete`, json, {
    timeout: -1,
  });
  return res;
}

//资源管理资源详情
export async function getResourceInfo(json) {
  const res = await axiosInstance.post(`${resourceUrl}/info`, json, {
    timeout: -1,
  });
  return res.data;
}
