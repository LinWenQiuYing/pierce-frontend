import axiosInstance from "./index.js";

const userUrl = "/pierce/customer";

// 查询客户详情
export async function getUserInfo(id) {
  const res = await axiosInstance.get(`${userUrl}/info/${id}`);
  return res.data;
}

// 线索客户列表查询
export async function searchCustomerList(json) {
  const res = await axiosInstance.post(`${userUrl}/queryBusInsight`, json, {
    timeout: -1,
  });
  return res.data;
}

// 取消/启用客户关注-企业
export async function setCustomerIsAttention(json) {
  const res = await axiosInstance.post(`${userUrl}/interest/customer`, json, {
    timeout: -1,
  });
  return res;
}

// 取消/启用客户关注-个人
export async function setPersonalIsAttention(json) {
  const res = await axiosInstance.post(`${userUrl}/interest/personal`, json, {
    timeout: -1,
  });
  return res;
}

// 取消/启用客户关注-员工
export async function setStaffIsAttention(json) {
  const res = await axiosInstance.post(`${userUrl}/interest/staff`, json, {
    timeout: -1,
  });
  return res;
}

// 输入并实时模糊匹配
export async function dynamicSearch(json) {
  const res = await axiosInstance.post(`${userUrl}/fuzzyQuery`, json, {
    timeout: -1,
  });
  return res.data;
}

// 对公客户列表查询
export async function getEnterpriseList(json) {
  const res = await axiosInstance.post(`${userUrl}/query`, json, {
    timeout: -1,
  });
  return res.data;
}

// 个人客户列表查询
export async function getPersonList(json) {
  const res = await axiosInstance.post(`${userUrl}/query/personal`, json, {
    timeout: -1,
  });
  return res.data;
}

// 员工客户列表查询
export async function getEmployeeList(json) {
  const res = await axiosInstance.post(`${userUrl}/query/staff`, json, {
    timeout: -1,
  });
  return res.data;
}
