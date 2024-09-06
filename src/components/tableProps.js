export default {
  props: [
    "tableLayout", // 表格元素的 table-layout 属性，设为 fixed 表示内容不会影响列的布局	- | 'auto' | 'fixed'	固定表头/列或使用了 column.ellipsis 时，默认值为 fixed
    "bordered", // 是否展示外边框和列边框	boolean	false
    "childrenColumnName", // 指定树形结构的列名	string[]	children
    "columns", // 表格列的配置描述	array
    "components", // 覆盖默认的 table 元素	object
    "dataSource", // 数据数组	any[]
    "defaultExpandAllRows", // 初始时，是否展开所有行	boolean	false
    "defaultExpandedRowKeys", // 默认展开的行	string[]
    "expandedRowKeys", // 展开的行，控制属性。可用 .sync 后缀 string[]
    "expandedRowRender", // 额外的展开行 Function(record, index, indent, expanded):VNode | slot="expandedRowRender" slot-scope="record, index, indent, expanded"
    "expandIcon", // 自定义展开图标	Function(props):VNode | slot="expandIcon" slot-scope="props"
    "expandRowByClick", // 过点击行来展开子行	boolean	false
    "expandIconColumnIndex", // 展开的图标显示在哪一列，如果没有 rowSelection，默认显示在第一列，否则显示在选择框后面	number
    "footer", // 表格尾部	Function(currentPageData)|slot-scope
    "indentSize", // 展示树形数据时，每层缩进的宽度，以 px 为单位	number	15
    "loading", // 页面是否加载中	boolean|object	false
    "locale", // 默认文案设置，目前包括排序、过滤、空数据文案	object	filterConfirm: '确定' filterReset: '重置' emptyText: '暂无数据'
    "pagination", // 分页器，参考配置项或 pagination文档，设为 false 时不展示和进行分页	object
    "rowClassName", // 表格行的类名	Function(record, index):string
    "rowKey", // 表格行 key 的取值，可以是字符串或一个函数	string|Function(record):string	'key'
    "rowSelection", // 列表项是否可选择，配置项	object	null
    "scroll", // 设置横向或纵向滚动，也可用于指定滚动区域的宽和高，建议为 x 设置一个数字，如果要设置为 true，需要配合样式 .ant-table td { white-space: nowrap; }	{ x: number | true, y: number }
    "showHeader", // 是否显示表头	boolean	true
    "size", // 表格大小	default | middle | small	default
    "title", // 表格标题	Function(currentPageData)|slot-scope
    "customHeaderRow", // 设置头部行属性	Function(column, index)
    "customRow", // 设置行属性	Function(record, index)
    "getPopupContainer", // 设置表格内各类浮层的渲染节点，如筛选菜单	(triggerNode) => HTMLElement	() => TableHtmlElement	1.5.0
    "transformCellText", // 数据渲染前可以再次改变，一般用户空数据的默认配置，可以通过 ConfigProvider 全局统一配置	Function({ text, column, record, index }) => any	-	1.5.4
  ],
};
