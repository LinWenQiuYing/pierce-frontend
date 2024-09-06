export const dict = [
  {
    name: "account",
    translation: "账号",
  },
  {
    name: "airplane",
    translation: "飞机",
  },
  {
    name: "armoredVehicle",
    translation: "装甲车",
  },
  {
    name: "car",
    translation: "汽车",
  },
  {
    name: "company",
    translation: "公司",
  },
  {
    name: "cruiser",
    translation: "巡洋舰",
  },
  {
    name: "default",
    translation: "默认",
  },
  {
    name: "document",
    translation: "文档",
  },
  {
    name: "event",
    translation: "事件",
  },
  {
    name: "industry",
    translation: "行业",
  },
  {
    name: "location",
    translation: "地理位置",
  },
  {
    name: "missile",
    translation: "导弹",
  },
  {
    name: "organization",
    translation: "机构",
  },
  {
    name: "person",
    translation: "人",
  },
  {
    name: "rocket",
    translation: "火箭",
  },
  {
    name: "ship",
    translation: "船",
  },
  {
    name: "train",
    translation: "火车",
  },
];

export function getTranslate(key) {
  return dict.filter((item) => item.name === key)[0].translation;
}
