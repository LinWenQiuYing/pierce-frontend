import { lineSizeOptions } from "@/assets/theme/graphIcon.js";
import { isEmptyObj } from "@/utils/common.js";
import { cloneDeep, merge } from "lodash";
import _compact from "lodash/compact";
import _each from "lodash/each";
import _find from "lodash/find";
import _get from "lodash/get";
import _set from "lodash/set";
import _startsWith from "lodash/startsWith";
import _times from "lodash/times";

import iconSeries, { defaultIcon } from "@/assets/theme/iconSeries.js";
// @ts-ignore
import EXPAND_ICON from "@/assets/mark/expand.png";
// @ts-ignore
import CLOSE_ICON from "@/assets/mark/close.png";
import axios from "axios";
import moment from "moment";
import qs from "qs";

const SIZE_SMALL = 100;
const SIZE_MAX = 180;
// -1代表不使用用户设置的大小，使用pageRank计算出来的
const AUTO_SIZE = -1;
const MIN_RANK = 0.01;
const MAX_RANK = 0.02;
const RECTANGLE_RADIUS = 40;
const RADIUS_ITERATION = 40;
const BACKGROUND_IMAGE_RATIO = "100%";
const KEY_VALUE_SEPARATOR = "@@";
const SHAPE_POLYGON_POINTS_CACHE = {};
const NUMBER_PRECISION = 3; // 解决部分浮点计算问题

export const CYTO_FIT_PADDING = 50;
export const CYTON_MAX_ZOOM = 3;
export const CYTON_MIN_ZOOM = 0.05;
export const CONTAINER_ID = "graphCanvas";
export const DEFAULT_TIMESTAMP_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const DEFAULT_DATES_FORMAT = "YYYY/MM/DD";
export const defaultNodeJson = {
  data: {
    shape: "ellipse",
    $$type: "defaultNode",
    width: 50,
    height: 50,
    fontSize: 30,
    opacity: 1,
    color: "#333",
    textValign: "bottom",
    backgroundColor: "#f8fbff",
    backgroundImage: "none",
    backgroundWidth: "25 7",
    backgroundHeight: "25 7",
    backgroundOpacity: "1",
    visibility: "visible",
    display: "element",
    textHalign: "center",
    textAlign: "center",
    fontWeight: 400,
    backgroundOffsetX: 0,
    backgroundOffsetY: 0,
    parent: {},
    roundRectangleArray: "1 1 1 1",
    borderColor: "#fff",
    borderWidth: 0,
    label: "",
  },
  classes: ["default-node"],
};
export const defaultEdgeJson = {
  data: {
    $$type: "defaultEdge",
    width: 1,
    color: "#333",
    opacity: 1,
    fontSize: 26,
    display: "element",
    lineColor: "#9ea5af",
    arrowColor: "#9ea5af",
    textValign: "bottom",
    textHalign: "center",
    fontWeight: 400,
    textAlign: "center",
    label: "",
  },
  classes: ["default-line"],
};

export function formatGraphData(data) {
  // Unused
  const nodes = (data.cyNodes || []).map((item) => {
    const json = {
      ele: item.data,
      position: item.position,
      theme: data.theme,
      selected: item.selected,
    };
    return createNode(json);
  });
  const edges = (data.cyEdges || []).map((item) => {
    return createEdge(item.data);
  });
  return { nodes, edges, ...data };
}

export function createNode(
  props,
  isExpanded = false,
  isSchema = false,
  graphFields
) {
  const decoratorIconSize = () => {
    return Number(((24 * 150) / SIZE_SMALL).toFixed(NUMBER_PRECISION));
  };
  const { ele, position, theme, selected } = props;
  const labelType =
    ele.labelType ||
    ele.icon ||
    ele.property.icon ||
    elementAttr(ele, "icon", "default"); // 图标对应的字符串
  const data = {
    id: ele.id,
    // 设置节点名称展示长度 老版逻辑
    // name: ele.name ? trimStr(ele.name, 24) : trimStr(vertexName(ele), 24),
    // label: isSchema
    //   ? ele.label
    //   : ele.name
    //   ? trimStr(ele.name, 24)
    //   : trimStr(vertexName(ele), 24),
    name: isSchema
      ? ele.name || ele.label
      : !isEmptyObj(graphFields)
      ? graphFields[ele.label]
          .map((item) => item.fieldAlias)
          .map((item) => ele.property[item])
          .join(",")
      : trimStr(vertexName(ele), 24), // 先从graphFields中取到对应label的属性，为数组，方便以后改为多个展示项，再分别取对应展示项再property中的值，用逗号隔开
    label: isSchema
      ? ele.label || ele.name
      : !isEmptyObj(graphFields)
      ? graphFields[ele.label]
          .map((item) => item.fieldAlias)
          .map((item) => ele.property[item])
          .join(",")
      : trimStr(vertexName(ele), 24), // 先从graphFields中取到对应label的属性，为数组，方便以后改为多个展示项，再分别取对应展示项再property中的值，用逗号隔开

    // label: ele.label,
    textWrap: "wrap",
    color: "#A8AEB4",
    textMaxWidth: "420",
    textOverflowWrap: "anywhere",
    nodeType: ele.nodeType || ele.label,
    shape: ele.shape,
    borderColor: "#f8fbff",
    parent: ele.parent || "",
    borderWidth: 0,
    borderStyle: ele.borderStyle ? ele.borderStyle : "solid",
    labelType,
    note: isSchema
      ? ele.note
      : ele.note === "" || !!ele.note
      ? ele.note
      : elementAttr(ele, "note", ""),
    tags: [],
    manualSize: ele.manualSize,
    rank: ele.rank,
    width: size(ele.manualSize, ele.rank),
    height: size(ele.manualSize, ele.rank),
    backgroundX: ["50%", "20%", "80%"],
    backgroundY: ["50%", "20%", "80%"],
    backgroundWidth: [
      BACKGROUND_IMAGE_RATIO,
      decoratorIconSize(),
      decoratorIconSize(),
    ],
    backgroundHeight: [
      BACKGROUND_IMAGE_RATIO,
      decoratorIconSize(),
      decoratorIconSize(),
    ],
    backgroundColor: "#f8fbff",
    roundRectangleArray:
      ele.shape !== "polygon"
        ? []
        : getRoundRectangleArray(RECTANGLE_RADIUS, 150, RADIUS_ITERATION),
    fontSize:
      size(ele.manualSize, ele.rank) < SIZE_SMALL
        ? 22
        : (size(ele.manualSize, ele.rank) / SIZE_SMALL) * 22,
  };
  if (ele.label === "__eventVertex") {
    data.labelType = elementAttr(ele, "icon", "event@@0");
  }
  if (isSchema) {
    _set(data, "backgroundImage", [getBackgroundIcon(data.labelType, theme)]);
    // 如果是模型，则保存icon信息，给一键复用时使用
    _set(data, "icon", ele.icon);
  } else {
    _set(data, "backgroundImage", [
      getBackgroundIcon(data.labelType, theme),
      isExpanded ? CLOSE_ICON : EXPAND_ICON,
    ]);
  }
  if (ele.tags) {
    // !!ele.tags || ele.tags.length === 0
    data.tags = ele.tags;
  } else {
    const tags = ele.property["__tag"];
    data.tags = tags
      ? tags.split(",").filter((tag) => tag.trim().length > 0)
      : [];
  }
  const params = new Map();
  if (ele.params) {
    Object.keys(ele.params).forEach((key) => {
      params.set(key, ele.params[key]);
    });
  } else if (ele.property) {
    Object.keys(ele.property).forEach((key) => {
      params.set(key, ele.property[key]);
    });
  }
  _set(data, "params", params);
  return {
    data,
    position: position || { x: -10000, y: -10000 },
    groups: "nodes",
    selected,
  };
}

export function createEdge(ele) {
  const data = {
    id: ele.id,
    label: ele.label || ele.name,
    color: ele.lineStyle && ele.lineStyle === "dashed" ? "#d9d9d9" : "#A8AEB4",
    name: ele.name || ele.label,
    source: ele.srcId || ele.source,
    target: ele.dstId || ele.target,
    nodeType: ele.nodeType || ele.label,
    virtualEdge: ele.virtualEdge,
    backgroundColor: "#f8fbff",
    fontSize:
      size(ele.manualSize, ele.rank) < SIZE_SMALL
        ? 20
        : (size(ele.manualSize, ele.rank) / SIZE_SMALL) * 20,
    width: 1,
    edgeIndex: ele.edgeIndex,
    weight: ele.property.size
      ? lineSizeOptions[Number(ele.property.size)].size
      : ele.weight,
    lineColor: ele.property.colour || "#9EA5AF",
    arrowColor: ele.property.colour || "#9EA5AF",
    lineStyle: ele.property.baseStyle === "1" ? "solid" : "dashed",
  };
  const params = new Map();
  if (ele.params) {
    Object.keys(ele.params).forEach((key) => {
      params.set(key, ele.params[key]);
    });
  } else {
    Object.keys(ele.property).forEach((key) => {
      params.set(key, ele.property[key]);
    });
  }
  _set(data, "params", params);
  return { data, groups: "edges" };
}

export const size = (manualSize, rank) => {
  let finalSize;
  if (manualSize !== AUTO_SIZE) {
    finalSize = manualSize;
  } else {
    const percent = (rank - MIN_RANK) / (MAX_RANK - MIN_RANK);
    finalSize = SIZE_SMALL + percent * (SIZE_MAX - SIZE_SMALL);
  }
  finalSize = finalSize || 150;
  return Number(finalSize.toFixed(NUMBER_PRECISION));
};

export function trimStr(str, maxLength) {
  if (!str) {
    return "";
  }
  str = str.trim();
  if (str.length > (maxLength || 8)) {
    return str.slice(0, maxLength) + "..";
  }
  return str;
}

export function vertexName(json) {
  return json.name || json.label;
}

export function vertexLabel(json) {
  return json.label || json.name;
}

export function elementAttr(json, attr, defaultVal) {
  return json.property[`__${attr}`] || defaultVal;
}

export function getRoundRectangleArray(radius, size, iteration) {
  const cacheKey = `${radius}-${iteration}`;
  const cacheArray = SHAPE_POLYGON_POINTS_CACHE[cacheKey];
  if (cacheArray) {
    return cacheArray;
  }
  const leftBottomRadiusArray = generateRadiusArray(
    radius,
    size,
    iteration,
    -1,
    -1
  );
  // 对角只需要所有坐标乘以-1, 不用重新计算
  const rightTopRadiusArray = leftBottomRadiusArray.map((item) => item * -1);
  const leftTopRadiusArray = generateRadiusArray(
    radius,
    size,
    iteration,
    -1,
    1
  );
  // 对角只需要所有坐标乘以-1, 不用重新计算
  const rightBottomRadiusArray = leftTopRadiusArray.map((item) => item * -1);
  const result = leftBottomRadiusArray
    .concat(rightBottomRadiusArray)
    .concat(rightTopRadiusArray)
    .concat(leftTopRadiusArray);
  SHAPE_POLYGON_POINTS_CACHE[cacheKey] = result;
  return result;
}

export function getBackgroundIcon(iconString, theme = 0) {
  const iconArr = iconString.split(",");
  let icon = null;
  if (iconArr.length === 4) {
    // 自建图谱
    icon = _get(defaultIcon, `${iconArr[1]}.${iconArr[2]}.${iconArr[3]}`);
  } else {
    // kg推送图谱
    const iconConfig = getKgIconConfig(iconString);
    const iconTheme = iconSeries.lightIcon;
    icon =
      _get(
        JSON.parse(iconTheme),
        `${theme}.${iconConfig.category}.${iconConfig.icon}`
      ) || _get(JSON.parse(iconTheme), `${theme}.default.${iconConfig.icon}`);
  }
  return icon;
}

export function getKgIconConfig(iconString) {
  if (iconString) {
    // 规定存在graph meta里的icon string format 是 IconType@@Icon, 第一个值是IconType，第二个值是image folders下icon的文件名, 不包含后缀
    const [category, icon] = iconString.split(KEY_VALUE_SEPARATOR);
    return {
      category: category,
      icon: icon || "0", // 向下兼容， icon没给值默认取第一个icon样式
    };
  } else {
    return {
      category: "default",
      icon: "0",
    };
  }
}

export function generateRadiusArray(radius, size, iteration, xSign, ySign) {
  const ratio = radius / size;
  let result = [];
  // + 1 是因为双闭区间
  _times(iteration + 1, (next) => {
    const segment = (ratio * next) / iteration;
    // x^2 + y^2 = ratio^2
    // js 浮点精度问题 会导致 y^2 是负数, 精度小于
    let yPower2 = ratio * ratio - segment * segment;
    if (Math.abs(yPower2) < Math.pow(0.1, NUMBER_PRECISION)) {
      // 小于误差值 认为等于0
      yPower2 = 0;
    }
    const point = [
      xSign * (1 - ratio + segment),
      ySign * (1 - ratio + Math.sqrt(yPower2)),
    ];
    // 乘积为-1需要转换 x， y坐标
    result = result.concat(xSign * ySign > 0 ? point : point.reverse());
  });
  return result;
}

/**
 * kg需要显示_id,以及arangodb、spark的算法属性，其他meta属性不显示。
 * 并且，_id和arangodb、spark属性需要放在最前面，其他属性也需要排序
 */
export function getKgFields(
  inputElements,
  keyExtractor,
  includeMetaKeys = true
) {
  let result = inputElements.filter((ele) => {
    const key = keyExtractor(ele);
    if (
      key.startsWith("__algo") ||
      key.startsWith("__spark") ||
      key.startsWith("__sophon") ||
      key === "__eventKeywords"
    ) {
      return true;
    }
    return key.indexOf("_") !== 0;
  });

  result = result.sort((ele1) => {
    const key1 = keyExtractor(ele1);
    if (key1[0] === "_") {
      return -1;
    }
    return 1;
  });

  // 需要加上的通用属性
  if (includeMetaKeys) {
    const metaIdEle = inputElements.find((ele) => keyExtractor(ele) === "_id");
    const metaNameEle = inputElements.find(
      (ele) => keyExtractor(ele) === "__name"
    );
    return _compact([metaIdEle, metaNameEle, ...result]);
  }
  return result;
}

//图谱结果节点，边分类统计
export function classStatistic(data) {
  const map = (data || [])
    .map((item) => item.data().nodeType)
    .reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
  const result = [];
  for (const item of map) {
    result.push({
      name: item[0],
      size: item[1],
    });
  }
  return result;
}

export function isTimeRelatedType(type) {
  if (!type) {
    return false;
  }
  type = type.toLowerCase();
  return type === "date" || type === "datetime" || type === "timestamp";
}

export function parseMoment(value, truncateTime = false) {
  value = try2ConvertToNumber(value);

  // "", null ,undefined
  if (!value) {
    return null;
  }

  let result = null;
  // 字符串类型的时间表达，如 2019-05-01 12:22:22
  if (isNaN(value)) {
    result = moment(value);
  } else {
    result = moment(value, "x");
  }
  if (truncateTime) {
    result = result.startOf("day");
  }
  return result;
}

export function isNumberType(type) {
  if (!type) {
    return false;
  }
  type = type.toLowerCase();
  // 针对decimal, 后端会返回 decimal(30,xxxx) 类似
  return (
    type === "int" ||
    type === "integer" ||
    type === "long" ||
    type === "byte" ||
    type === "short" ||
    type === "double" ||
    type === "float" ||
    type === "number" ||
    type === "uint" ||
    type === "bigint" ||
    _startsWith(type, "decimal")
  );
}

// api返回的很多数字是string类型，为了workaround这种错误行为
// 如果确实是数字类型，就转一下,如果是时间(Date)，也会被转换成数字，不是的话，使用原来的类型
export function try2ConvertToNumber(value) {
  if (value === "") {
    return "";
  }
  if (isNaN(value)) {
    // "1234a","aaa"
    return value;
  } else {
    return +value; // "123",123
  }
}

/**
 * 非ascii字符一个字符占据的空间不等长，这里将算出一个比较合理的长度
 */
export function getShownText(text, limit, enlargeCoefficient = 2) {
  let length = 0;
  let result = "";
  // shownLength 会把非ascii码长度当做2, ascii码长度为1
  _each(text, (char) => {
    const charCode = char.charCodeAt(0);
    if (charCode < 0 || charCode > 128) {
      length = length + enlargeCoefficient;
    } else {
      length++;
    }
    if (length <= limit) {
      result += char;
    } else {
      return false;
    }
    return;
  });
  return result;
}

//元素颜色
export const EleStyle = {
  light: {
    node: {
      color: "#333",
    },
    edge: {
      lineColor: "#9ea5af",
      arrowColor: "#9ea5af",
      color: "#333",
      backgroundColor: "#f8fbff",
    },
  },
  dark: {
    node: {
      color: "#495E79",
    },
    edge: {
      lineColor: "#495E79",
      arrowColor: "#495E79",
      color: "#495E79",
      backgroundColor: "#172028",
    },
  },
};

//右键菜单
export const MENU_KEY = {
  RELATION_ENTITY: "addRelationEntity",
  REMOVE_RELATION_ENTITY: "removeRelationEntity",
  REMOVE_NODE: "removeNode",
  REMOVE_NODES: "removeNodes",
  CLEAR_ALL_Ele: "clearAllEle",
  DIRECTED_ANALYSIS: "directedAnalysis", // 定向分析
};

const RequestMethod = {
  GET: "get",
  POST: "post",
  PUT: "put",
  PATCH: "patch",
  DELETE: "delete",
};

export function makeRequestCancellable(method, url, body) {
  const instance = axios.create({
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });
  let canceler = null;
  const config = {
    cancelToken: new axios.CancelToken((c) => {
      canceler = c;
    }),
  };

  if (process.env.NODE_ENV === "development") {
    Object.assign(config, {
      // headers: {
      //   authorization:
      //     // "Bearer eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlcyI6IltcIlNPUEhPTl9BRE1JTlwiXSIsInNjb3BlIjoiZXh0ZXJuYWwiLCJleHAiOjQ3NzgxODcyNzAsImlhdCI6MTYyNDU4NzI3MH0.m3yC4dqDRxwCMtuAEI0I9G17e9InxrculCeAQy0rHq-uSFjpctTFs5mb30SSFlC_7Dsj_JAl8d7RGjHSUpsPsg",
      //     "Bearer eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6ImFwcDAxIiwicm9sZXMiOiJbXCJTT1BIT05fQURNSU5cIl0iLCJzY29wZSI6ImV4dGVybmFsIiwiZXhwIjo0NzgxMjI4MjA2LCJpYXQiOjE2Mjc2MjgyMDZ9.3DYou65Gnkj7y77JcpMd3Xb8FGtj-gxdNCHdj2QDDrrB_F376IdYeOw9CykeyrXul_DL6m8vb56N2fXqRxq4ZQ",
      // },
    });
  }

  let responsePromise;
  if (method === RequestMethod.GET || method === RequestMethod.DELETE) {
    if (!body) {
      config.params = body;
    }
    responsePromise = instance[method](url, config);
  } else {
    responsePromise = instance[method](url, body || null, config);
  }

  return { responsePromise, canceler };
}

// 返回整理好后的vertcies，edges和paths
export function checkThreshold(
  addElementConfig,
  graph,
  theme,
  graphFields,
  selected,
  isSchema
) {
  const newEdgesSet = new Set();
  const newNodesSet = new Set();
  const currentEdges = graph.datas.allEdges();
  const currentNodes = graph.datas.allNodes();
  const edgesDataMap = new Map();
  const currentEdgeIds = (currentEdges || []).map((item) => item.data().id);

  addElementConfig.elements.forEach((ele) => {
    if (isEdge(ele)) {
      if (!currentEdgeIds.includes(ele.id)) {
        edgesDataMap.set(ele.id, ele);
        newNodesSet.add(ele.id);
      } else if (selected) {
        const target = _find(currentEdges, (v) => v.id() === ele.id);
        target.select();
      }
    }
  });

  const nodesDataMap = new Map();
  const currentNodeIds = (currentNodes || []).map((item) => item.data().id);

  addElementConfig.elements.forEach((ele) => {
    if (isVertex(ele)) {
      if (!currentNodeIds.includes(ele.id)) {
        nodesDataMap.set(ele.id, ele);
        newNodesSet.add(ele.id);
      } else if (selected) {
        const target = _find(currentNodes, (v) => v.id() === ele.id);
        target.select();
      }
    }
  });

  const edgesData = Array.from(edgesDataMap.values());
  edgesData.forEach((ele) => {
    const src = _find(
      addElementConfig.referenceNodes,
      (v) => v.id === ele.srcId
    );
    const target = _find(
      addElementConfig.referenceNodes,
      (v) => v.id === ele.dstId
    );
    if (!!src && !!target) {
      if (!currentNodeIds.includes(src.id)) {
        nodesDataMap.set(src.id, src);
        newNodesSet.add(src.id);
      }
      if (!currentNodeIds.includes(target.id)) {
        nodesDataMap.set(target.id, target);
        newNodesSet.add(target.id);
      }
    } else {
      // console.warn(`找不到边${ele.id}的起点或终点`);
    }
  });

  const kgPaths = [];
  // 最后检查paths里的内容
  addElementConfig.elements.forEach((ele) => {
    if (isKgPath(ele)) {
      for (const n of ele.vertices) {
        newNodesSet.add(n.id);
      }
      for (const e of ele.edges) {
        newEdgesSet.add(e.id);
      }
      kgPaths.push(ele);
    }
  });

  const nodesData = Array.from(nodesDataMap.values());
  const nodes = (nodesData || []).map((ele) => {
    const json = {
      ele,
      theme,
      position: { x: ele.x ? ele.x : -10000, y: ele.y ? ele.y : -10000 },
      selected: selected ? selected : false,
    };
    return createNode(
      json,
      addElementConfig.anchorNodeIds.includes(ele.id),
      isSchema,
      graphFields
    );
  });
  const edges = (edgesData || []).map((ele) => {
    return createEdge(ele);
  });

  return { nodes, edges };
}

// 预览列表相关工具方法
export function isVertex(item) {
  return !item.srcId;
}

export function isEdge(item) {
  // 判断是不是边的条件就是看有没有srcId， assume edge must has not-null srcId value
  return !!item.srcId;
}

export function isKgPath(item) {
  return !isVertex(item) && !isEdge(item);
}

export function addElementFromNode(baseNode, addEles, cyto, isModel = false) {
  const { nodes, edges } = addEles;
  if (nodes) {
    const originPosition = baseNode.position();
    const addNodeIds = [];
    const addEdgeIds = [];
    const addNodes = nodes.map((node) => {
      node.data.height = 150;
      node.data.width = 150;
      if (!isModel) {
        node.data.backgroundWidth = [90, 32];
        node.data.backgroundHeight = [90, 32];
      } else {
        node.data.label = node.data.name;
      }
      addNodeIds.push(node.data.id);
      node.position = originPosition;
      return merge(cloneDeep(defaultNodeJson), node);
    });
    const addEdges =
      (edges &&
        edges.map((edge) => {
          addEdgeIds.push(edge.data.id);
          return merge(cloneDeep(defaultEdgeJson), edge);
        })) ||
      [];
    const positions = circleLayout(
      originPosition,
      addNodes.length > 8 ? (addNodes.length * 100) / Math.PI : 240,
      addNodes.length
    );
    cyto.batch(() => {
      cyto.add(addNodes);
      cyto.add(addEdges);
    });
    const addCyNodes = cyto.nodes().filter((node) => {
      return addNodeIds.includes(node.id());
    });

    addCyNodes.forEach((node, index) => {
      node
        .animation({
          position: positions[index],
          duration: 300,
        })
        .play();
    });
    if (!isModel) {
      baseNode.select();
    }
  }
}

export function circleLayout(position, radius, count) {
  const perAngle = (2 * Math.PI) / count;
  const positions = [];
  for (let i = 0; i < count; i++) {
    const angle = perAngle * i;
    positions.push({
      x: position.x + radius * Math.cos(angle),
      y: position.y + radius * Math.sin(angle),
    });
  }
  return positions;
}
