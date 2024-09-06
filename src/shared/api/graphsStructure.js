import axiosInstance from "./index.js";

const graphUrl = "/pierce/graphSchema";
const dataUrl = "/pierce/dataSource";
const tableUrl = "/pierce/graphTableResource";

// 蓝图接口

// 分页查询蓝图信息
export async function getGraphFields(id) {
  const res = await axiosInstance.get(`${graphUrl}/getVisableFields?id=${id}`);
  return res;
}

// 分页查询蓝图信息
export async function querySchemaList(json) {
  const res = await axiosInstance.post(`${graphUrl}/SchemaQueryByPage`, json, {
    timeout: -1,
  });
  return res;
}

// 分页查询蓝图信息
export async function deleteSchema(id) {
  const res = await axiosInstance.get(`${graphUrl}/deleteSchemaByPk?id=${id}`);
  return res;
}

// 获取数据源
export async function getDataSource() {
  const res = await axiosInstance.get(`${dataUrl}/getDataSourceType`);
  return res;
}

// 获取数据源
export async function getDataBaseName(dataSource) {
  const res = await axiosInstance.get(
    `${dataUrl}/getDataBaseName?dataSource=${dataSource}`
  );
  return res;
}

// 获取数据源表名
export async function getTableFields(name) {
  const res = await axiosInstance.get(`${dataUrl}/getTableFields?id=${name}`);
  return res;
}

// 生成图谱
export async function createSchema(json) {
  const res = await axiosInstance.post(
    `${graphUrl}/createGraphBySchemaId`,
    json,
    {
      timeout: -1,
    }
  );
  return res;
}

// 获取图谱详情
export async function getSchemaDetail(id) {
  const res = await axiosInstance.get(`${graphUrl}/getSchemaDetail?id=${id}`);
  return res;
}

// 生成或修改蓝图
export async function saveSchema(json) {
  const res = await axiosInstance.post(`${graphUrl}/createOrEditSchema`, json, {
    timeout: -1,
  });
  return res;
}

// 图谱接口

// 获取可创建图谱的蓝图
export async function getUsefulSchema(json) {
  const res = await axiosInstance.post(`${tableUrl}/getUserfulSchema`, json, {
    timeout: -1,
  });
  return res;
}

// 查询图谱版本
export async function queryGraphVersion(json) {
  const res = await axiosInstance.post(
    `${tableUrl}/queryGraphBranByPage`,
    json,
    {
      timeout: -1,
    }
  );
  return res;
}

// 创建图谱
export async function createGraph(json) {
  const res = await axiosInstance.post(`${tableUrl}/creatGraphBySchema`, json, {
    timeout: -1,
  });
  return res;
}

// 分页查询图谱更新日志
export async function graphUpdateDetail(json) {
  const res = await axiosInstance.post(`${tableUrl}/graphUpdateDetail`, json, {
    timeout: -1,
  });
  return res;
}

// 删除图谱分支
export async function delGraphBranch(branchId) {
  const res = await axiosInstance.delete(
    `${tableUrl}/delGraphBranch?branchId=${branchId}`
  );
  return res;
}

// 查询图谱是否正在更新
export async function getGraphState(id) {
  const res = await axiosInstance.get(
    `${tableUrl}/getTwpCompositionLogStatue?id=${id}`
  );
  return res;
}

// 设置图谱更新策略
export async function updateGraphTable(json) {
  const res = await axiosInstance.post(`${tableUrl}/updateGraphTable`, json, {
    timeout: -1,
  });
  return res;
}

// 图谱版本选择
export async function selectGraphBranch(json) {
  const res = await axiosInstance.post(`${tableUrl}/selectGraphBranch`, json, {
    timeout: -1,
  });
  return res;
}
