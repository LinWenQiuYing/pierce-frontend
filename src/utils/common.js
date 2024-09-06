import { nanoid } from "nanoid";

export const autoResize = (echarts) => {
  const handleResize = () => echarts.resize();
  window.addEventListener("resize", handleResize);
  // 下面的语句没有起到效果，是配合react useEffect的方法，在vue中不生效
  // return () => window.removeEventListener("resize", handleResize);
};

export function downloadFile(content, fileName) {
  let blob = null;

  if (!(content instanceof Blob)) {
    blob = new Blob([content]);
  } else {
    blob = content;
  }
  let aLink = document.createElement("a");
  let evt = new MouseEvent("click", {
    view: window,
    bubbles: false,
    cancelable: true,
  });
  evt.initEvent("click", false, false);
  aLink.href = URL.createObjectURL(blob);
  aLink.download = fileName || "";
  document.body.appendChild(aLink);
  aLink.dispatchEvent(evt);

  window.setTimeout(() => {
    document.body.removeChild(aLink);
    aLink = null;
    evt = null;
  });
}
class Storage {
  constructor(name) {
    this.name = name;
  }
  //设置缓存
  setItem(params) {
    let obj = {
      name: "",
      value: "",
      expires: 0,
      startTime: new Date().getTime(), //记录何时将值存入缓存，毫秒级
    };
    let options = {};
    //将obj和传进来的params合并
    Object.assign(options, obj, params);
    if (options.expires) {
      //如果options.expires设置了的话
      //以options.name为key，options为值放进去
      localStorage.setItem(options.name, JSON.stringify(options));
    } else {
      //如果options.expires没有设置，就判断一下value的类型
      let type = Object.prototype.toString.call(options.value);
      //如果value是对象或者数组对象的类型，就先用JSON.stringify转一下，再存进去
      if (type == "[object Object]" || type == "[object Array]") {
        options.value = JSON.stringify(options.value);
      }
      localStorage.setItem(options.name, options.value);
    }
  }
  //拿到缓存
  getItem(name) {
    let item = JSON.parse(localStorage.getItem(name));
    //如果有expires的值，说明设置了失效时间
    if (item && item.expires) {
      let date = new Date().getTime();
      //何时将值取出减去刚存入的时间，与item.expires比较，如果大于就是过期了，如果小于或等于就还没过期
      if (date - item.startTime > item.expires) {
        //缓存过期，清除缓存，返回false
        localStorage.removeItem(name);
        return false;
      } else {
        //缓存未过期，返回值
        return item.value;
      }
    } else {
      //如果没有设置失效时间，直接返回值
      return item;
    }
  }
  //移出缓存
  removeItem(name) {
    localStorage.removeItem(name);
  }
  //移出全部缓存
  clear() {
    localStorage.clear();
  }
}

export const LocalStorage = new Storage();

export function hideIdCode(idCode) {
  return idCode.replace(/^(.{6})(?:\d+)(.{4})$/, "$1********$2");
}

export function hidePhoneNumber(phoneNumber) {
  return phoneNumber.replace(/(\d{3})\d*(\d{4})/, "$1****$2");
}

export function hideName(name) {
  return name.replace(/(?<=.)./g, "*");
}

export function getUserInfo() {
  return JSON.parse(LocalStorage.getItem("userInfo"));
}

export function getUserRights() {
  return JSON.parse(LocalStorage.getItem("userRights"));
}

export function strReduct(str, len) {
  // 按需截取字符串方法
  if (str.length <= len) {
    return str;
  } else {
    return str.split("").splice(0, len).join("") + "...";
  }
}

export function modalConfirm(title, _that, onOk, content) {
  _that.$confirm({
    title: title,
    icon: () =>
      _that.$createElement("img", {
        attrs: {
          src: require("@/assets/images/img/info_warning.svg"),
          class: "confirm-icon",
        },
      }),
    content: content,
    okText: "是",
    okType: "primary",
    centered: true,
    cancelText: "否",
    onOk: onOk,
    onCancel: () => {
      _that.$message.info("已取消");
    },
  });
}

// 页面自动滚动到底部
export function scrollToBottom(_that, domId, step) {
  // step: 每次滚动幅度， _that: vue的示例对象-this
  _that.$nextTick(() => {
    // 找到是哪个区域在滚动-domId
    let scrollTop = document.getElementById(domId).scrollTop;
    const clientHeight = document.getElementById(domId).clientHeight;
    const scrollHeight = document.getElementById(domId).scrollHeight;
    const timer = setInterval(() => {
      if (scrollTop + clientHeight < scrollHeight) {
        document.getElementById(domId).scrollTop += step;
        scrollTop += step;
      } else {
        clearInterval(timer);
      }
    }, 10);
  });
}

// 页面自动滚动到顶部
export function scrollToTop(_that, domId, step) {
  // step: 每次滚动幅度， _that: vue的示例对象-this
  _that.$nextTick(() => {
    // 找到是哪个区域在滚动-domId
    let scrollTop = document.getElementById(domId).scrollTop;
    const timer = setInterval(() => {
      if (scrollTop > 0) {
        document.getElementById(domId).scrollTop -= step;
        scrollTop -= step;
      } else {
        clearInterval(timer);
      }
    }, 10);
  });
}

export function getRulesGroup(list) {
  let result = [
    {
      id: -1,
      types: "relations",
      relations: "且",
    },
  ];
  list.map((item) => {
    if (!item.parentId) {
      if (item.logic === 2) {
        // 条件组
        result.push([
          {
            id: item.id,
            types: "relations",
            relations: "且",
          },
        ]);
      } else {
        // 条件
        if (item.logic === 0) {
          result[0].relations = "或";
        } else if (item.logic === 1) {
          result[0].relations = "且";
        }
        result.push({
          id: nanoid(),
          condition: {
            key: item.conditionId,
            conditionDesc: item.conditionDesc,
            title: item.conditionName,
            content: item.sqlContext,
            detail: item.sqlContextValue ? item.sqlContextValue : null,
            hitStatus: item.hitStatus ? item.hitStatus : false,
          },
          types: "single",
        });
      }
    } else {
      let target = [];
      for (let i = 0; i < result.length; i++) {
        const ele = result[i];
        if (Array.isArray(ele) && ele[0].id === item.parentId) {
          target = ele;
          break;
        }
      }
      if (item.logic === 0) {
        target[0].relations = "或";
      } else if (item.logic === 1) {
        target[0].relations = "且";
      }
      target.push({
        id: nanoid(),
        condition: {
          key: item.conditionId,
          conditionDesc: item.conditionDesc,
          title: item.conditionName,
          content: item.sqlContext,
          detail: item.sqlContextValue ? item.sqlContextValue : null,
          hitStatus: item.hitStatus ? item.hitStatus : false,
        },
        types: "single",
      });
    }
  });
  return result;
}

// 判断对象是否为空
export function isEmptyObj(obj) {
  return JSON.stringify(obj) === "{}" || Object.keys(obj).length === 0;
}

// 将图片转换为base64
export function getBase64Image(imgUrl) {
  let base64Url = "";
  let image = new Image();
  image.setAttribute("crossOrigin", "anonymous"); //解决跨域问题
  image.src = imgUrl;
  image.onload = function () {
    //image.onload为异步加载
    let canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    let context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, image.width, image.height);
    //这里的base64Url就是base64类型
    //使用toDataUrl将图片转换成jpeg的格式,不要把图片压缩成png，因为压缩成png后base64的字符串可能比不转换前的长！
    base64Url = canvas.toDataURL("image/jpeg", 1);
  };
  return base64Url;
}
