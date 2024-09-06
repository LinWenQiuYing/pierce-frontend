import axiosInstance from "./index.js";

const myUrl = "/pierce/risk/warning";

//风险线索列表查询
export async function getWarningList(info) {
  const res = await axiosInstance.post(`${myUrl}/query`, info, {
    timeout: -1,
  });
  return res.data;
}

//风险线索忽略设置
export async function warningIgnore(info) {
  const res = await axiosInstance.post(`${myUrl}/ignore`, info, {
    timeout: -1,
  });
  return res;
}

//风险线索详情查看
export async function warningDetailCheck(id) {
  const res = await axiosInstance.get(`${myUrl}/detail/${id}`);
  return res.data;
}

//风险线索详情编辑
export async function warningDetailEdit(info) {
  const res = await axiosInstance.post(`${myUrl}/edit/detail`, info, {
    timeout: -1,
  });
  return res;
}

//查询线索分类信息
export async function getWarningType() {
  const res = await axiosInstance.get(`/pierce/warningRule/allRuleCategory`);
  return res.data;
}

// 查询风险路径
export async function getWarningPath(info) {
  const res = await axiosInstance.post(`${myUrl}/queryPathByProperty`, info, {
    timeout: -1,
  });
  return res.data;
}

// 获取最新待处理事件列表
export async function getLatestList() {
  const res = await axiosInstance.get(`${myUrl}/latestPendingWarning`);
  return res.data;
}

// 根据客户名查询风险数量
export async function getWaringCountByCustomer(name) {
  const res = await axiosInstance.get(
    `${myUrl}/getWaringCountByCustomer?customerName=${name}`
  );
  return res.data;
}

// 根据客户名查询指定规则的预警数量
export async function getWaringCountByRuleName(json) {
  const res = await axiosInstance.post(
    `${myUrl}/getWaringCountByRuleName`,
    json,
    {
      timeout: -1,
    }
  );
  return res.data;
}

// 批量查询风险路径
export async function batchQueryRiskWarningPaths(json) {
  const res = await axiosInstance.post(
    `${myUrl}/batchQueryRiskWarningPaths`,
    json,
    {
      timeout: -1,
    }
  );
  return res.data;
}

// 根据线索id查询对应图谱id
export async function queryGraphByRiskId(id) {
  const res = await axiosInstance.get(`${myUrl}/queryGraphByRiskId?id=${id}`);
  return res;
}
