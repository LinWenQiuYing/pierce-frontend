import { themes } from "./model";
// 修改页面中的样式变量值
const changeStyle = (obj) => {
  for (let key in obj) {
    document
      .getElementsByTagName("body")[0]
      .style.setProperty(`--${key}`, obj[key]);
  }
};
// 改变主题的方法
export const setTheme = (themeName) => {
  localStorage.setItem("theme", themeName); // 保存主题到本地，下次进入使用该主题
  const themeConfig = themes[themeName];
  // 如果有主题名称，那么则采用我们定义的主题
  if (themeConfig) {
    for (const key in themeConfig) {
      if (Object.hasOwnProperty.call(themeConfig, key)) {
        const element = themeConfig[key];
        localStorage.setItem(key, element); // 保存到本地
      }
    }
    changeStyle(themeConfig); // 改变样式
  } else {
    let themeConfig = {};
    for (const key in themes.light) {
      themeConfig[key] = localStorage.getItem(key);
    }
    changeStyle(themeConfig);
  }
};
