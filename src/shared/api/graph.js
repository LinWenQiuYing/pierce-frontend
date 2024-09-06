import axiosInstance from "./index.js";

const myUrl = "/pierce/graph";
const dataUrl = "/pierce/graphExplorer";
const stellarUrl = "/pierce/stellar";
const cypherUrl = "/pierce/cypherResource";

export async function getCase(caseId) {
  const res = await axiosInstance.get(`${myUrl}/queryCase`, {
    params: { caseId },
  });
  return res.data;
}

export async function getBranch(branchId) {
  const res = await axiosInstance.get(`${myUrl}/queryBranch`, {
    params: { branchId },
  });
  return res.data;
}

export async function getBlueprint(bpId) {
  const res = await axiosInstance.get(`${myUrl}/queryBlueprint`, {
    params: { bpId },
  });
  return res.data;
}

export async function searchEntitiesFake(json) {
  const result = await axiosInstance.post(`${stellarUrl}/vertices`, json);
  return result;
}

export async function getNeighbors(json) {
  const res = await axiosInstance.post(`${stellarUrl}/neighbors`, json, {
    timeout: -1,
  });
  return res.data;
}

// 从kg转发
export async function queryNeighbors(json) {
  const res = await axiosInstance.post(`${myUrl}/queryNeighbors`, json, {
    timeout: -1,
  });
  return res.data;
}

export async function batchQuery(formData) {
  const res = await axiosInstance.post(`${myUrl}/batchQuery`, formData);
  return res;
}

// 实体查询
export async function advancedSearch(json) {
  const res = await axiosInstance.post(`${stellarUrl}/queryGraphNode`, json, {
    timeout: -1,
  });
  return res.data;
}

// 定向分析
export async function handleDirectedAnalysis(json) {
  const res = await axiosInstance.post(`${stellarUrl}/directedAnalysis`, json, {
    timeout: -1,
  });
  return res.data;
}

// 语句查询
export async function handleSentenceSearch(json) {
  const res = await axiosInstance.post(
    `${stellarUrl}/graphStatementSearch`,
    json,
    {
      timeout: -1,
    }
  );
  return res.data;
}

// 查询已保存的查询语句
export async function checkSavedSentence(graphId) {
  const res = await axiosInstance.get(
    `${dataUrl}/queryGraphCqlByGraphId?graphId=${graphId}`
  );
  return res.data;
}

// 查询已保存的查询实体条件
export async function checkSavedEntity(graphId) {
  const res = await axiosInstance.get(
    `${dataUrl}/queryEntityConditionsByGraphId?graphId=${graphId}`
  );
  return res.data;
}

// 保存语句查询
export async function handleSaveSentence(json) {
  const res = await axiosInstance.post(`${dataUrl}/save`, json, {
    timeout: -1,
  });
  return res;
}

// 保存实体查询
export async function handleSaveEntity(json) {
  const res = await axiosInstance.post(`${dataUrl}/entity/save`, json, {
    timeout: -1,
  });
  return res;
}

// 删除已保存的查询语句
export async function deleteSavedSentence(id) {
  const res = await axiosInstance.get(`${dataUrl}/delete/${id}`);
  return res.data;
}

// 删除已保存的查询条件
export async function deleteSavedEntity(id) {
  const res = await axiosInstance.get(`${dataUrl}/entity/delete/${id}`);
  return res.data;
}

// 获取用户所有的Blueprint
export async function getUserBlueprint() {
  const res = await axiosInstance.get(`${myUrl}/userBlueprint`);
  return res.data;
}

// 立即执行规则
export async function doModelTask(id) {
  const res = await axiosInstance.get(`${myUrl}/doModelTask?ruleId=${id}`);
  return res;
}

// 批量上传
export async function batchUpload(formData) {
  const res = await axiosInstance.post(
    `/pierce/warningRule/fileParsing`,
    formData,
    {
      timeout: 30000,
    }
  );
  return res;
}

// cypher语法校验
export async function cypherGrammarVerify(json) {
  const res = await axiosInstance.post(
    `${cypherUrl}/cypherGrammarVerify`,
    json,
    {
      timeout: -1,
    }
  );
  return res;
}
