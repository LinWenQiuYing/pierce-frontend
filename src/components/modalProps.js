export default {
  props: [
    "afterClose", //modal完全关闭后的回调
    "bodyStyle", //modal body 样式
    "cancelText", //取消按钮文字
    "centered", //垂直居中展示modal
    "closable", //是否显示右上角关闭按钮
    "closeIcon", //自定义关闭图标
    "confirmLoadng", //确定按钮loading
    "destroyOnClose", //关闭时销毁modal里的子元素
    "forceRender", //强制渲染modal
    "getContainer", //指定modal挂载的html节点
    "keyboard", //是否支持键盘的esc关闭
    "mask", //是否展示遮罩
    "maskClosable", //点击蒙层是否允许关闭
    "maskStyle", //遮罩样式
    "okText", //确认按钮文字
    "okType", //确定按钮类型
    "okButtonProps", //ok按钮props
    "cancelButtonProps", //cancel按钮props
    "title", //标题
    "visible", //对话框是否可见
    "width", //宽度
    "wrapClassName", //对话框外层容器的类名
    "zIndex", //设置modal的z-index
    "dialogStyle", //可用于设置浮层的样式，调整浮层位置等
    "dialogClass", //可用于设置浮层的类名
  ],
};
