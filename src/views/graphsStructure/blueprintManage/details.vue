<template>
  <div class="blueprint-details">
    <div
      class="blueprint-details-header"
      :style="{ height: descHeight + 96 + 'px' }"
    >
      <div
        class="blueprint-details-header-title"
        v-if="detailsType === 'add' || detailsType === 'copy'"
      >
        <div class="title-box">
          <span class="title-label">蓝图名称：</span>
          <a-input
            type="text"
            allow-clear
            class="title-input"
            v-model="blueprintName"
            placeholder="请输入蓝图名称"
          />
        </div>
        <div
          class="title-desc no-content"
          ref="titleDesc"
          v-if="!blueprintDesc"
        >
          <span class="title-label">蓝图描述：</span>
          <span class="title-desc-text" @click="handleChangeInfo"
            >添加蓝图描述</span
          >
        </div>
        <div class="title-desc" ref="titleDesc" v-else>
          <span class="title-label">蓝图描述：</span>
          <div class="title-desc-text">
            <span class="title-desc-text-content">{{ blueprintDesc }}</span>
            <span class="update" @click="handleChangeInfo">修改</span>
          </div>
        </div>
      </div>
      <div
        class="blueprint-details-header-title"
        v-else-if="detailsType === 'check'"
      >
        <div class="title-box">
          <span class="title-name">
            {{ blueprintName }}
          </span>
        </div>
        <div
          class="title-desc no-content"
          ref="titleDesc"
          v-if="!blueprintDesc"
        >
          <span class="title-label">蓝图描述：</span>
          <span class="title-desc-text">暂无蓝图描述</span>
        </div>
        <p class="title-desc" ref="titleDesc" v-else>
          <span class="title-label">蓝图描述：</span>
          <span class="title-desc-text">
            <span class="title-desc-text-content">{{ blueprintDesc }}</span>
          </span>
        </p>
      </div>
      <div class="blueprint-details-header-title" v-else>
        <div class="title-box">
          <span class="title-name">
            {{ blueprintName }}
          </span>
          <a-icon type="edit" @click="handleChangeInfo" />
        </div>
        <p class="title-desc no-content" ref="titleDesc" v-if="!blueprintDesc">
          <span class="title-desc-text" @click="handleChangeInfo"
            >添加蓝图描述</span
          >
        </p>
        <div class="title-desc" ref="titleDesc" v-else>
          <span class="title-label">蓝图描述：</span>
          <div class="title-desc-text">
            <span class="title-desc-text-content">{{ blueprintDesc }}</span>
            <span class="update" @click="handleChangeInfo">修改</span>
          </div>
        </div>
      </div>
      <div class="blueprint-details-header-btns">
        <a-button @click="handleReturn">返回</a-button>
        <a-button type="primary" @click="handleCreate">生成蓝图</a-button>
      </div>
    </div>
    <div class="blueprint-details-content">
      <div class="blueprint-details-content-left">
        <div class="left-graph">
          <div class="left-graph-tools">
            <div
              class="left-graph-tools-box"
              v-for="(box, index) in toolIcons"
              :key="index"
            >
              <div
                class="left-graph-tools-box-item"
                v-for="item in box"
                :key="item.label"
                @click="item.onClick(item.label)"
              >
                <a-tooltip placement="bottom">
                  <template slot="title">
                    <span>{{ item.label }}</span>
                  </template>
                  <icon-svg
                    :icon-class="item.icon"
                    :class="detailsType === 'check' ? 'disabled' : ''"
                    :color="
                      detailsType === 'check'
                        ? 'rgba(0, 0, 0, 0.25)'
                        : item.isActive
                        ? '#1890ff'
                        : 'rgba(0, 0, 0, 0.45)'
                    "
                    :style="{
                      cursor: item.isActive ? 'pointer' : 'not-allowed',
                    }"
                  />
                </a-tooltip>
              </div>
              <a-divider
                type="vertical"
                v-if="index !== toolIcons.length - 1"
              />
              <!-- <div class="left-graph-tools-box-item">
                <a-tooltip placement="bottom">
                  <template slot="title">
                    <span>组合</span>
                  </template>
                  <icon-svg icon-class="icon-group" />
                </a-tooltip>
              </div>
              <div class="left-graph-tools-box-item">
                <a-tooltip placement="bottom">
                  <template slot="title">
                    <span>解除组合</span>
                  </template>
                  <icon-svg icon-class="icon-group" />
                </a-tooltip>
                <icon-svg icon-class="icon-upgroup" />
              </div> -->
            </div>
          </div>
          <div
            ref="content"
            id="left-graph-canvas"
            class="left-graph-canvas"
            @drop="handleDrop"
          >
            <right-menu
              :show="rightMenuShow"
              @onMenuClick="onMenuClick"
              :contextMenuData="contextMenuData"
            />
            <div
              class="left-graph-canvas-addbtn"
              :style="{
                visibility: isHover ? 'visible' : 'hidden',
                left: left + 'px',
                top: top + 'px',
                display: detailsType === 'check' ? 'none' : 'flex',
              }"
              @mouseenter.prevent="onMouse('enter')"
              @mouseleave.prevent="onMouse('leave')"
              @mousedown.prevent="onMousedown"
              @click="handleAdd"
            >
              <a-icon type="plus-circle" />
            </div>
            <div class="left-graph-canvas-ratio">
              当前比例:{{ (canvasRatio * 100).toFixed(0) }}%
            </div>
          </div>
        </div>
        <div class="left-bottom">
          <div class="left-bottom-nodes">
            <div
              class="left-bottom-node"
              v-for="node in nodeList"
              :key="node.index"
            >
              <img
                alt=""
                :src="node.src"
                :draggable="detailsType !== 'check'"
                @dragstart.stop="(e) => handleDragStart(e, node.color)"
              />
            </div>
          </div>
          <div
            :class="[
              'left-bottom-text',
              detailsType === 'check' ? 'disabled' : '',
            ]"
          >
            可直接将点拖拽至画布内来新建一个节点
          </div>
        </div>
      </div>
      <div class="blueprint-details-content-right">
        <div class="right-options">
          <div class="right-header">属性配置</div>
          <div class="right-options-content">
            <div class="right-options-content-item">
              <div class="item-title" @click="handleClick('isFold1')">
                <span class="item-title-text">数据源配置</span>
                <a-icon :type="isFold1 ? 'down' : 'right'" />
              </div>
              <div :class="isFold1 ? 'item-content fold' : 'item-content'">
                <a-form :form="form1">
                  <a-form-item label="数据源选择：">
                    <a-select
                      v-decorator="[
                        'sourceValue',
                        {
                          rules: [{ required: true, message: '请选择' }],
                          initialValue: sourceValue,
                        },
                      ]"
                      @change="handleChangeDataSource"
                      placeholder="请选择"
                      :options="sourceOptions"
                      class="item-content-input"
                      :disabled="detailsType === 'check'"
                    />
                  </a-form-item>
                  <a-form-item label="数据库选择：">
                    <a-select
                      v-decorator="[
                        'databaseValue',
                        {
                          rules: [{ required: true, message: '请选择' }],
                          initialValue: databaseValue,
                        },
                      ]"
                      placeholder="请选择"
                      :options="databaseOptions"
                      class="item-content-input"
                      @change="handleChangeDatabase"
                      :disabled="detailsType === 'check'"
                    />
                  </a-form-item>
                </a-form>
              </div>
            </div>
            <div class="right-options-content-item">
              <div class="item-title" @click="handleClick('isFold2')">
                <span class="item-title-text">数据配置</span>
                <a-icon :type="isFold2 ? 'down' : 'right'" />
              </div>
              <div :class="isFold2 ? 'item-content fold' : 'item-content'">
                <a-form :form="form2" class="data-form">
                  <a-form-item
                    :label="
                      (selectItem && selectItem.type === 'line') ||
                      (selectItem && selectItem.type === 'loop') ||
                      (selectItem && selectItem.type === 'quadratic')
                        ? '关系名称：'
                        : '实体名称：'
                    "
                  >
                    <a-input
                      v-decorator="[
                        'inputValue',
                        {
                          rules: [{ required: true, message: '请选择' }],
                        },
                      ]"
                      type="text"
                      autoComplete="off"
                      placeholder="请输入"
                      @change="handleInputChange"
                      class="item-content-input"
                      :disabled="detailsType === 'check'"
                    />
                  </a-form-item>
                  <a-form-item
                    :label="
                      (selectItem && selectItem.type === 'line') ||
                      (selectItem && selectItem.type === 'loop') ||
                      (selectItem && selectItem.type === 'quadratic')
                        ? '关系属性：'
                        : '实体属性：'
                    "
                  >
                    <gb-ant-select-multiple-cascader
                      ref="cascader"
                      v-decorator="[
                        'attrValue',
                        {
                          rules: [{ required: true, message: '请选择' }],
                        },
                      ]"
                      class="item-content-input"
                      autoComplete="off"
                      :maxTagCount="3"
                      :maxTagTextLength="6"
                      placeholder="请选择"
                      :selectOptionsConfig="{
                        key: 'key',
                        value: 'key',
                        text: 'name',
                        children: 'children',
                      }"
                      allText="全选"
                      :noDataText="
                        !databaseValue ? '请先选择数据库' : '正在加载数据'
                      "
                      dropdownClassName="customer-multiple-cascader"
                      :treeData="attrOptions"
                      @change="
                        (value) => {
                          handleAttrChange(value, 'new');
                        }
                      "
                      :disabled="detailsType === 'check'"
                    />
                  </a-form-item>
                  <a-form-item label="主键选择：">
                    <a-select
                      v-decorator="[
                        'keyValue',
                        {
                          rules: [{ required: true, message: '请选择' }],
                        },
                      ]"
                      show-search
                      filter-option
                      placeholder="请选择"
                      :options="keyOptions"
                      class="item-content-input"
                      @change="handleKeyChange"
                      :disabled="detailsType === 'check'"
                    />
                  </a-form-item>
                </a-form>
              </div>
            </div>
            <div class="right-options-content-item">
              <div class="item-title" @click="handleClick('isFold3')">
                <span class="item-title-text">字段展示名配置</span>
                <a-icon :type="isFold3 ? 'down' : 'right'" />
              </div>
              <div :class="['item-content item-table', isFold3 ? 'fold' : '']">
                <table-component
                  :columns="columns"
                  :data-source="tableValue"
                  :rowKey="(record) => record.id"
                  :pagination="false"
                  :loading="searchLoading"
                  class="date-table"
                  border
                >
                  <div slot="isShow" slot-scope="record">
                    <a-switch
                      :checked="record.isShow"
                      @change="
                        (checked) => {
                          onChange(checked, record.id);
                        }
                      "
                      size="small"
                      :disabled="detailsType === 'check'"
                    />
                  </div>
                  <div slot="startOrEnd" slot-scope="record">
                    <a-radio-group
                      :value="record.startOrEnd"
                      button-style="solid"
                      size="small"
                      class="slot-radio"
                      @change="
                        (e) => {
                          onRadioChange(e.target.value, record.id);
                        }
                      "
                      :disabled="detailsType === 'check'"
                    >
                      <a-radio-button value="start"> 起 </a-radio-button>
                      <a-radio-button value=""> 无 </a-radio-button>
                      <a-radio-button value="end"> 终 </a-radio-button>
                    </a-radio-group>
                  </div>
                  <div
                    slot="showName"
                    slot-scope="record"
                    class="showName-slot"
                  >
                    <a-input
                      type="text"
                      class="showName-slot-input"
                      :value="record.showName"
                      @change="
                        (e) => {
                          handleChangeName(e, record.id);
                        }
                      "
                      :disabled="detailsType === 'check'"
                    />
                  </div>
                  <span slot="actions" slot-scope="record">
                    <a
                      :class="detailsType === 'check' ? 'disabled' : ''"
                      @click="handleRemove(record)"
                      >移除</a
                    >
                  </span>
                </table-component>
              </div>
            </div>
            <div class="right-options-content-item">
              <div class="item-title" @click="handleClick('isFold4')">
                <span class="item-title-text">样式配置</span>
                <a-icon :type="isFold4 ? 'down' : 'right'" />
              </div>
              <div :class="isFold4 ? 'item-box fold' : 'item-box'">
                <div
                  class="item-box-item"
                  v-if="selectItem && selectItem.type === 'circle'"
                >
                  <span class="item-box-label">图标样式</span>
                  <a-cascader
                    :allowClear="false"
                    class="item-box-input"
                    :options="showOptions"
                    placeholder="请选择"
                    :value="iconValue"
                    @change="handleIconChange"
                    popupClassName="icon-cascader"
                    :disabled="detailsType === 'check'"
                  >
                    <div slot="displayRender" slot-scope="{ labels }">
                      <icon-svg
                        v-if="labels.length > 1"
                        :icon-class="labels.at(-1).data.value"
                      />
                    </div>
                  </a-cascader>
                </div>
                <div class="item-box-item">
                  <span class="item-box-label">风格样式</span>
                  <a-select
                    placeholder="请选择"
                    :value="styleValue"
                    class="item-box-input"
                    @change="handleStyleChange"
                    dropdownClassName="style-dropdown"
                    v-if="
                      (selectItem && selectItem.type === 'line') ||
                      (selectItem && selectItem.type === 'loop') ||
                      (selectItem && selectItem.type === 'quadratic')
                    "
                    :disabled="detailsType === 'check'"
                  >
                    <a-select-option
                      v-for="item in styleOptions2"
                      :key="item.value"
                      :value="item.value"
                    >
                      <span class="option-label">{{ item.label }}</span>
                      <img class="option-img" :src="item.src" alt="" />
                    </a-select-option>
                  </a-select>
                  <a-select
                    placeholder="请选择"
                    :value="styleValue"
                    class="item-box-input"
                    @change="handleStyleChange"
                    dropdownClassName="style-dropdown"
                    v-else
                    :disabled="detailsType === 'check'"
                  >
                    <a-select-option
                      v-for="item in styleOptions1"
                      :key="item.value"
                      :value="item.value"
                    >
                      <span class="option-label">{{ item.label }}</span>
                      <img class="option-img" :src="item.src" alt="" />
                    </a-select-option>
                  </a-select>
                </div>
                <div class="item-box-item">
                  <span class="item-box-label">尺寸配置</span>
                  <a-select
                    placeholder="请选择"
                    :value="sizeValue"
                    class="item-box-input"
                    @change="handleSizeChange"
                    dropdownClassName="size-dropdown"
                    v-if="
                      (selectItem && selectItem.type === 'line') ||
                      (selectItem && selectItem.type === 'loop') ||
                      (selectItem && selectItem.type === 'quadratic')
                    "
                    :disabled="detailsType === 'check'"
                  >
                    <a-select-option
                      v-for="option in sizeOptions2"
                      :key="option.value"
                      :value="option.value"
                    >
                      <span
                        class="size-dropdown-option-label"
                        :style="{ fontSize: option.size + 'px' }"
                        >{{ option.label }}</span
                      >
                    </a-select-option>
                  </a-select>
                  <a-select
                    placeholder="请选择"
                    :value="sizeValue"
                    class="item-box-input"
                    @change="handleSizeChange"
                    dropdownClassName="size-dropdown"
                    v-else
                    :disabled="detailsType === 'check'"
                  >
                    <a-select-option
                      v-for="option in sizeOptions1"
                      :key="option.value"
                      :value="option.value"
                    >
                      <span
                        class="size-dropdown-option-label"
                        :style="{ fontSize: option.size + 'px' }"
                        >{{ option.label }}</span
                      >
                    </a-select-option>
                  </a-select>
                </div>
                <div class="item-box-item">
                  <span class="item-box-label">颜色配置</span>
                  <a-select
                    placeholder="请选择"
                    :value="colorValue"
                    class="item-box-input"
                    @change="handleColorChange"
                    :dropdownClassName="
                      selectItem && selectItem.type === 'circle'
                        ? 'color-dropdown right'
                        : 'color-dropdown'
                    "
                    :disabled="detailsType === 'check'"
                  >
                    <a-select-option
                      v-for="option in colorOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      <span
                        class="option-dot"
                        :style="{ backgroundColor: option.value }"
                      ></span>
                    </a-select-option>
                  </a-select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="right-show">
          <!-- <div class="right-header">预览</div>
          <div class="right-show-canvas" id="right-show-canvas"></div> -->
          <div class="right-show-btns">
            <a-button @click="handleReturn" class="right-show-btn"
              >取消</a-button
            >
            <a-button
              v-if="detailsType !== 'check'"
              @click="handleSave"
              class="right-show-btn"
              >保存</a-button
            >
          </div>
        </div>
      </div>
    </div>
    <a-modal
      :width="572"
      class="blueprint-details-info-modal"
      :visible="infoModalShow"
      :destroyOnClose="true"
      @ok="handleOk"
      @cancel="onCancel"
      centered
      title="蓝图信息"
    >
      <div class="content-item">
        <span class="content-item-label">蓝图名称：</span>
        <a-input
          type="text"
          placeholder="请输入蓝图名称"
          class="content-item-input"
          v-model="blueprintNameInput"
        />
      </div>
      <div class="content-item">
        <span class="content-item-label">蓝图描述：</span>
        <a-textArea
          type="text"
          placeholder="请输入蓝图描述"
          class="content-item-input"
          v-model="blueprintDescInput"
          :auto-size="{ minRows: 3, maxRows: 5 }"
        />
      </div>
    </a-modal>
  </div>
</template>
<script>
import TableComponent from "@/components/tableComponent";
import {
  Button,
  Cascader,
  Divider,
  Form,
  Input,
  Radio,
  Switch,
  Tooltip,
} from "ant-design-vue";
import RightMenu from "@/components/rightMenu";
import { cloneDeep, debounce, findIndex, find } from "lodash";
import {
  getTableFields,
  getDataBaseName,
  saveSchema,
  createSchema,
  getDataSource,
} from "@/shared/api/graphsStructure.js";
import G6 from "@antv/g6";
import bus from "@/utils/bus.js";
import { redo, undo } from "@/utils/antvActions.js";
import {
  nodeSizeOptions as sizeOptions1,
  lineSizeOptions as sizeOptions2,
} from "@/assets/theme/graphIcon.js";

const { Item } = Form;
const { TextArea } = Input;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

export default {
  name: "BlueprintDetails",
  props: ["detailsType", "details"],
  data() {
    return {
      blueprintName: this.details.graphName || undefined,
      blueprintDesc: this.details.graphDesc || undefined,
      blueprintNameInput: undefined,
      blueprintDescInput: undefined,
      sourceValue: this.details.sourceValue || undefined,
      sourceOptions: [
        {
          label: "MySQL",
          value: "MySQL",
        },
      ],
      databaseValue: this.details.databaseValue || undefined,
      databaseOptions: [],
      attrValue: undefined,
      attrValueAll: undefined,
      attrOptions: [],
      attrOptionsChildren: [],
      keyValue: undefined,
      keyOptions: [],
      styleValue: "1",
      styleOptions1: [
        {
          label: "样式一",
          value: "1",
          src: require("@/assets/images/img/appstore_fill.svg"),
        },
        {
          label: "样式二",
          value: "2",
          src: require("@/assets/images/img/appstore_stroke.svg"),
        },
        {
          label: "样式三",
          value: "3",
          src: require("@/assets/images/img/appstore_default.svg"),
        },
      ],
      styleOptions2: [
        {
          label: "solid",
          value: "1",
          src: require("@/assets/images/img/line_solid.svg"),
        },
        {
          label: "dash",
          value: "2",
          src: require("@/assets/images/img/line_dash.svg"),
        },
      ],
      iconValue: undefined,
      iconOptions: [
        {
          label: "基础图标",
          value: "default",
          children: [
            {
              label: require("@/assets/images/img/company.svg"),
              value: "company",
              icon: "@/assets/images/img/company.svg",
            },
            {
              label: require("@/assets/images/img/bank.svg"),
              value: "bank",
              icon: "@/assets/images/img/bank.svg",
            },
            {
              label: require("@/assets/images/img/person.svg"),
              value: "person",
              icon: "@/assets/images/img/person.svg",
            },
            {
              label: require("@/assets/images/img/article.svg"),
              value: "article",
              icon: "@/assets/images/img/article.svg",
            },
            {
              label: require("@/assets/images/img/account.svg"),
              value: "account",
              icon: "@/assets/images/img/account.svg",
            },
          ],
        },
      ],
      sizeValue: 48,
      sizeOptions1,
      sizeOptions2,
      colorValue: undefined,
      colorOptions: [
        {
          label: 1,
          value: "#000000",
        },
        {
          label: 2,
          value: "#6682E4",
        },
        {
          label: 3,
          value: "#F5222D",
        },
        {
          label: 4,
          value: "#FA8C16",
        },
        {
          label: 5,
          value: "#FADB14",
        },
        {
          label: 6,
          value: "#52C41A",
        },
        {
          label: 7,
          value: "#13C2C2",
        },
        {
          label: 8,
          value: "#1890FF",
        },
        {
          label: 9,
          value: "#A876E5",
        },
        {
          label: 10,
          value: "#EB2F96",
        },
        {
          label: 11,
          value: "#CECECE",
        },
        {
          label: 12,
          value: "#B1C3FF",
        },
        {
          label: 13,
          value: "#FFCCC7",
        },
        {
          label: 14,
          value: "#FFE7BA",
        },
        {
          label: 15,
          value: "#FFFFB8",
        },
        {
          label: 16,
          value: "#D9F7BE",
        },
        {
          label: 17,
          value: "#B5F5EC",
        },
        {
          label: 18,
          value: "#BAE7FF",
        },
        {
          label: 19,
          value: "#EFDBFF",
        },
        {
          label: 20,
          value: "#FFD6E7",
        },
      ],
      inputValue: undefined,
      columns: [
        {
          title: "表名",
          dataIndex: "tableName",
          key: "tableName",
          width: 90,
        },
        {
          title: "字段名",
          dataIndex: "fieldName",
          key: "fieldName",
          width: 99,
        },
        {
          title: "显示",
          dataIndex: "isShow",
          key: "isShow",
          width: 45,
          scopedSlots: { customRender: "isShow" },
        },
        {
          title: "展示项",
          dataIndex: "showName",
          key: "showName",
          width: 100,
          scopedSlots: { customRender: "showName" },
        },
        {
          title: "操作",
          dataIndex: "actions",
          key: "actions",
          width: 43,
          scopedSlots: { customRender: "actions" },
        },
      ],
      tableValue: [],
      searchLoading: false,
      isFold1: true,
      isFold2: true,
      isFold3: true,
      isFold4: true,
      descHeight: 21,
      nodeList: [
        {
          index: 1,
          src: require("@/assets/images/img/drag_node1.svg"),
          color: "#6682E4",
        },
        {
          index: 2,
          src: require("@/assets/images/img/drag_node2.svg"),
          color: "#13C2C2",
        },
        {
          index: 3,
          src: require("@/assets/images/img/drag_node3.svg"),
          color: "#A876E5",
        },
      ],
      graph: null,
      canvasWidth: 0,
      canvasHeight: 0,
      graphData: this.details.graphData || {
        nodes: [],
        edges: [],
      },
      nodeIndex: 1,
      edgeIndex: 1,
      form1: this.$form.createForm(this, { name: "form1" }),
      form2: this.$form.createForm(this, { name: "form2" }),
      isHover: false, // 是否悬浮
      isChosen: false, // 是否选中
      top: 0,
      left: 0,
      currentEvent: undefined,
      graphItem: undefined,
      selectItem: undefined, // 单个选择
      selectNodes: [], // 多选
      selectEdges: [], // 多选
      infoModalShow: false,
      mouseDown: false, // 鼠标是否按下
      mouseClick: false, // 鼠标是否点击
      addingEdge: false, // 是否正在添加边
      selfEdge: undefined, // 正在添加的边
      moveDistence: {
        x: 0,
        y: 0,
      }, // 画布移动距离
      toolIcons: [
        [
          {
            icon: "icon-backoff",
            label: "撤销",
            isActive: false,
            onClick: () => {
              if (this.detailsType === "check") return;
              this.handleUndo();
            },
          },
          {
            icon: "icon-forward",
            label: "重做",
            isActive: false,
            onClick: () => {
              if (this.detailsType === "check") return;
              this.handleRedo();
            },
          },
        ],
        [
          {
            icon: "icon-copy",
            label: "复制",
            isActive: false,
            onClick: () => {
              if (this.detailsType === "check") return;
              this.handleCopy();
            },
          },
          {
            icon: "icon-paste",
            label: "粘贴",
            isActive: false,
            onClick: () => {
              if (this.detailsType === "check") return;
              this.handlePaste("topMenu");
            },
          },
          {
            icon: "icon-delete-simple",
            label: "删除",
            isActive: false,
            onClick: () => {
              if (this.detailsType === "check") return;
              this.handleDeleteItem();
            },
          },
        ],
        [
          {
            icon: "icon-zoomIn",
            label: "放大",
            isActive: false,
            onClick: () => {
              if (this.detailsType === "check") return;
              this.handleZoomIn();
            },
          },
          {
            icon: "icon-zoomOut",
            label: "缩小",
            isActive: false,
            onClick: () => {
              if (this.detailsType === "check") return;
              this.handleZoomOut();
            },
          },
          {
            icon: "icon-compress",
            label: "适应画布",
            isActive: false,
            onClick: () => {
              if (this.detailsType === "check") return;
              this.handleFitView();
            },
          },
          {
            icon: "icon-oneToOne",
            label: "还原比例",
            isActive: false,
            onClick: () => {
              if (this.detailsType === "check") return;
              this.handleFitBack();
            },
          },
        ],
        [
          {
            icon: "icon-multiselect",
            label: "多选",
            isActive: false,
            onClick: () => {
              if (this.detailsType === "check") return;
              this.handleMultiSelect();
            },
          },
        ],
      ],
      graphCanvas: null,
      canvasRatio: 1,
      contextMenuData: {},
      rightMenuShow: false,
      toCopyNodes: [],
      isClear: false, // 判断是否是清空级联框时
      redoStack: undefined, // 重做栈
      undoStack: undefined, // 撤销栈
    };
  },
  components: {
    AButton: Button,
    ACascader: Cascader,
    ADivider: Divider,
    AForm: Form,
    AFormItem: Item,
    AInput: Input,
    ARadioButton: RadioButton,
    ARadioGroup: RadioGroup,
    ASwitch: Switch,
    ATextArea: TextArea,
    ATooltip: Tooltip,
    RightMenu,
    TableComponent,
  },
  watch: {
    selectItem(newValue) {
      if (newValue) {
        this.selectItem = newValue;
        const data = newValue.data;
        this.updateIconState(["复制", "删除"], [true, true]);
        if (newValue && newValue.type === "circle") {
          // 选择了点
          this.columns = [
            {
              title: "表名",
              dataIndex: "tableName",
              key: "tableName",
              width: 90,
            },
            {
              title: "字段名",
              dataIndex: "fieldName",
              key: "fieldName",
              width: 99,
            },
            {
              title: "显示",
              dataIndex: "isShow",
              key: "isShow",
              width: 45,
              scopedSlots: { customRender: "isShow" },
            },
            {
              title: "展示项",
              dataIndex: "showName",
              key: "showName",
              width: 100,
              scopedSlots: { customRender: "showName" },
            },
            {
              title: "操作",
              dataIndex: "actions",
              key: "actions",
              width: 43,
              scopedSlots: { customRender: "actions" },
            },
          ];
        } else {
          // 选择了边
          this.columns = [
            {
              title: "表名",
              dataIndex: "tableName",
              key: "tableName",
              width: 90,
            },
            {
              title: "字段名",
              dataIndex: "fieldName",
              key: "fieldName",
              width: 99,
            },
            {
              title: "起止点",
              dataIndex: "startOrEnd",
              key: "startOrEnd",
              width: 126,
              scopedSlots: { customRender: "startOrEnd" },
            },
            {
              title: "显示",
              dataIndex: "isShow",
              key: "isShow",
              width: 45,
              scopedSlots: { customRender: "isShow" },
            },
            {
              title: "展示项",
              dataIndex: "showName",
              key: "showName",
              width: 100,
              scopedSlots: { customRender: "showName" },
            },
            {
              title: "操作",
              dataIndex: "actions",
              key: "actions",
              width: 43,
              scopedSlots: { customRender: "actions" },
            },
          ];
        }
        if (this.attrOptions.length && this.attrOptions[0].length) {
          this.isClear = true;
          this.$refs.cascader.handleClearAll();
        }
        if (data.attrValue) {
          // 如果是只展示
          this.handleAttrChange(data.attrValue, "show");
          this.attrValueAll = data.attrValueAll;
          this.tableValue = data.tableValue;
        } else {
          this.handleAttrChange([], "new");
        }
        this.form2.setFieldsValue({
          attrValue: data.attrValue,
          inputValue: data.inputValue,
          keyValue: data.keyValue,
        });
        this.keyValue = data.keyValue;
        this.styleValue = data.styleValue;
        this.iconValue = data.iconValue;
        this.sizeValue = data.sizeValue;
        this.colorValue = data.colorValue;
      } else {
        this.form2.setFieldsValue({
          attrValue: undefined,
          inputValue: undefined,
          keyValue: undefined,
        });
        this.keyOptions = [];
        this.keyValue = undefined;
        this.tableValue = [];
        this.styleValue = "1";
        this.iconValue = undefined;
        this.sizeValue = this.sizeOptions1[0].value;
        this.colorValue = undefined;
      }
    },
    graphData(newValue) {
      // 如果图中有节点，则对应图标高亮
      if (newValue.nodes.length) {
        this.updateIconState(
          ["放大", "缩小", "适应画布", "还原比例", "多选"],
          [true, true, true, true, true]
        );
      } else {
        this.updateIconState(
          ["放大", "缩小", "适应画布", "还原比例", "多选"],
          [false, false, false, false, false]
        );
      }
    },
  },
  computed: {
    showOptions() {
      bus._self = null;
      bus.$root = null;
      bus._renderProxy = null;
      bus._routerRoot = null;
      const showOptions = [];
      const iconOptions = cloneDeep(this.iconOptions);
      iconOptions.map((item) => {
        if (item.children.length) {
          const children = [];
          item.children.map((icon) => {
            children.push({
              label: bus.$createElement("img", {
                attrs: {
                  src: icon.label,
                  class: "option-icon",
                },
                value: icon.value,
              }),
              value: icon.value,
              icon: icon.icon,
            });
          });

          item.children = children;
        }
        showOptions.push(item);
      });
      return showOptions;
    },
  },
  async mounted() {
    if (this.detailsType !== "add" && this.details.dataSourceId) {
      this.form1.setFieldsValue({
        databaseValue: this.details.dataSourceId,
      });
      this.handleChangeDatabase(this.details.dataSourceId);
    } else {
      this.form1.setFieldsValue({
        databaseValue: undefined,
      });
    }
    setTimeout(() => {
      const that = this;
      that.descHeight = that.$refs.titleDesc.scrollHeight;
      window.onresize = () => {
        if (that.$refs.titleDesc) {
          that.descHeight = that.$refs.titleDesc.scrollHeight;
          that.canvasWidth = that.$refs.content.clientWidth;
          // 修改画布的大小
          that.graph.changeSize(that.canvasWidth, that.canvasHeight);
          // 将图移动到画布中心位置
          // that.graph.fitCenter();
        }
      };
    }, 100);
    let type = undefined;
    if (this.detailsType === "add") {
      type = "create";
    } else {
      type = "show";
    }
    this.initGraph(type);
    await this.getDataSource();
  },
  beforeDestroy() {
    this.graph.destroy();
  },
  methods: {
    initGraph(type) {
      this.canvasWidth = this.$refs.content.clientWidth;
      this.canvasHeight = this.$refs.content.clientHeight;

      // 放在graph声明前面，防止报错
      // const minimap = new G6.Minimap({
      //   container: "right-show-canvas",
      //   className: "minimap",
      //   size: [420, 200],
      // });
      const _that = this;

      // 创建自定义节点
      G6.registerEdge(
        "graph-edge",
        {
          draw(cfg, group) {
            console.log("draw", cfg, group);
            const startPoint = cfg.startPoint;
            const endPoint = cfg.endPoint;
            const shape = group.addShape("path", {
              attrs: {
                stroke: "#333",
                path: [
                  ["M", startPoint.x, startPoint.y],
                  ["L", endPoint.x / 3 + (2 / 3) * startPoint.x, startPoint.y], // 三分之一处
                  ["L", endPoint.x / 3 + (2 / 3) * startPoint.x, endPoint.y], // 三分之二处
                  ["L", endPoint.x, endPoint.y],
                ],
              },
              // must be assigned in G6 3.3 and later versions. it can be any value you want
              name: "path-shape",
            });
            return shape;
          },
        },
        "line"
      );

      // 创建自定义事件
      G6.registerBehavior("click-add-edge", {
        // Set the events and the corresponding responsing function for this behavior
        getEvents() {
          return {
            "node:mouseenter": "onMouseEnter",
            "node:mouseleave": "onMouseLeave",
            mouseup: "onMouseUp",
            mousemove: "onMousemove", // The event is mousemove, the responsing function is onMousemove
          };
        },
        onMouseEnter(ev) {
          const self = this;
          const node = ev.item;
          const graph = self.graph;
          if (_that.addingEdge && _that.selfEdge) {
            self.chosen = true;
            _that.isChosen = true;
            graph.setItemState(node, "chosen", true);
          }
        },
        onMouseLeave(ev) {
          const self = this;
          const node = ev.item;
          const graph = self.graph;
          if (_that.addingEdge && _that.selfEdge) {
            self.chosen = false;
            _that.isChosen = false;
            graph.setItemState(node, "chosen", false);
          }
        },
        // The responsing function for mousemove defined in getEvents
        onMousemove(ev) {
          const self = this;
          // The current position the mouse clicks
          const point = { x: ev.x, y: ev.y };
          if (_that.addingEdge && _that.selfEdge) {
            // Update the end node to the current node the mouse clicks
            self.graph.updateItem(
              _that.selfEdge,
              {
                ..._that.selfEdge.getModel(),
                target: point,
              },
              false
            );
            self.graph.get("canvas").set("localRefresh", false); // gitee上查到的避免拖动出现重影的方法
          }
        },
        onMouseUp(ev) {
          const self = this;
          const node = ev.item;
          const graph = self.graph;
          const model = (node && node.getModel()) || {};
          if (_that.addingEdge && self.chosen) {
            // 如果在节点上悬浮
            const edgeModel = _that.selfEdge.getModel();
            graph.removeItem(_that.selfEdge, false);
            graph.addItem(
              "edge",
              {
                id: `edge${_that.edgeIndex}`,
                source: edgeModel.source,
                target: model.id,
                type: model.id === edgeModel.source ? "loop" : "line",
                style: {
                  startArrow: {
                    path: G6.Arrow.vee(
                      0,
                      0,
                      model.id === edgeModel.source
                        ? edgeModel.style.lineWidth
                        : edgeModel.style.lineWidth + model.size / 2
                    ), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
                    d:
                      model.id === edgeModel.source
                        ? edgeModel.style.lineWidth
                        : edgeModel.style.lineWidth + model.size / 2, // 偏移量
                  },
                  endArrow: {
                    path: G6.Arrow.vee(
                      10,
                      10,
                      model.id === edgeModel.source
                        ? edgeModel.style.lineWidth
                        : edgeModel.style.lineWidth + model.size / 2
                    ), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
                    d:
                      model.id === edgeModel.source
                        ? edgeModel.style.lineWidth
                        : edgeModel.style.lineWidth + model.size / 2, // 偏移量
                    fill: edgeModel.style.stroke,
                  },
                },
                data: {
                  styleValue: "1",
                  sizeValue: 1,
                  colorValue: "#CECECE",
                  tableValue: [],
                },
              },
              true
            );
            _that.checkStackLength();
            graph.get("canvas").set("localRefresh", false); // gitee上查到的避免拖动出现重影的方法
            _that.edgeIndex += 1;

            _that.resetEdges();
            _that.graphData = graph.save();
          } else if (_that.addingEdge) {
            graph.removeItem(_that.selfEdge, false);
          }
          _that.selfEdge = null;
          self.chosen = false;
          _that.addingEdge = false;
          graph.setMode("default");
          _that.$nextTick(() => {
            _that.graphCanvas.style.cursor = "default";
          });
          _that.isChosen = false;
          graph.setItemState(_that.graphItem, "chosen", false);
        },
      });

      const graph = new G6.Graph({
        container: "left-graph-canvas",
        width: this.canvasWidth,
        height: this.canvasHeight,
        // plugins: [minimap],
        minZoom: 0.5,
        maxZoom: 2.4,
        linkCenter: true,
        enabledStack: true,
        maxStep: 20, // 默认历史栈里最多存20步
        animate: true,
        animateCfg: {
          duration: 300, // Number，一次动画的时长
        },
        layout:
          type === "create"
            ? {
                tyle: "random",
              }
            : {
                type: "dagre",
                rankdir: "LR", // 可选，默认为图的中心
                align: "DL", // 可选
                nodesep: 40, // 可选
                ranksep: 40, // 可选
                // controlPoints: true, // 可选
              },
        defaultNode: {
          type: "circle", // 节点类型
          size: this.sizeOptions1[0].value, // 节点大小
          style: {
            lineWidth: 0,
            cursor: "move",
          },
          icon: {
            show: true,
            width: 14,
            height: 14,
            img: "",
          },
          labelCfg: {
            position: "bottom",
            offset: 5,
            style: {
              fill: "#666",
            },
          },
        },
        defaultEdge: {
          type: "line",
          style: {
            stroke: "#CECECE",
            lineWidth: 1,
            lineAppendWidth: 10,
            cursor: "pointer",
            startArrow: {
              path: G6.Arrow.vee(0, 0, 24), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
              d: 24, // 偏移量
            },
            endArrow: {
              path: G6.Arrow.vee(10, 10, 24), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
              d: 24, // 偏移量
              fill: "#CECECE",
            },
          },
          labelCfg: {
            autoRotate: true,
            style: {
              lineWidth: 5,
              fill: "#CECECE",
              stroke: "#fafafa",
            },
          },
        },
        // 节点不同状态下的样式集合
        nodeStateStyles: {
          // 鼠标 hover 上节点，即 hover 状态为 true 时的样式
          hover: {
            "text-shape": {
              fill: "#016EFF",
            },
          },
          // 鼠标点击节点，即 click 状态为 true 时的样式
          click: {
            shadowColor: "rgba(0, 0, 0, 0.4)",
            shadowBlur: 10,
            "text-shape": {
              fill: "#016EFF",
            },
          },
          chosen: {
            stroke: "#B7EB8F",
            lineWidth: 3,
          },
        },
        edgeStateStyles: {
          click: {
            stroke: "#016EFF",
            "text-shape": {
              fill: "#016EFF",
            },
          },
        },

        modes: {
          default: ["drag-canvas", "drag-node"],
          // 增加边交互模式
          addEdge: ["click-add-edge"],
          multiSelect: [
            {
              type: "brush-select",
              trigger: "drag",
              selectedState: "click",
            },
          ],
          direction: "both",
        },
      });
      this.graph = graph;
      this.graphCanvas = document.getElementsByTagName("canvas")[0];

      // 绑定事件
      // 悬浮事件
      this.graph.on("node:mouseenter", (e) => {
        this.graph.setItemState(e.item, "hover", true);
        this.currentEvent = e;
        this.graphItem = e.item;
        if (!this.isChosen) {
          this.isHover = true;
        } else {
          this.isHover = false;
        }
      });
      this.graph.on("node:mousemove", (e) => {
        const position = this.graph.getCanvasByPoint(
          e.item.getModel().x,
          e.item.getModel().y
        );
        const nodeX = e.item.getModel().x;
        const nodeY = e.item.getModel().y;
        const mouseX = e.x;
        const mouseY = e.y;
        const r = (e.item.getModel().size / 2) * this.canvasRatio;
        if (mouseX !== nodeX) {
          if (!this.isChosen) {
            this.isHover = true;
          } else {
            this.isHover = false;
          }
          if (mouseX > nodeX) {
            const angle = Math.atan((nodeY - mouseY) / (mouseX - nodeX));
            const w = Math.cos(angle) * (r + 7);
            const h = Math.sin(angle) * (r + 7);
            this.left = w + position.x - 7;
            this.top = position.y - h - 7;
          } else {
            const angle = Math.atan((nodeY - mouseY) / (nodeX - mouseX));
            const w = Math.cos(angle) * (r + 7);
            const h = Math.sin(angle) * (r + 7);
            this.left = position.x - w - 7;
            this.top = position.y - h - 7;
          }
        } else if (mouseX === nodeX && mouseY !== nodeY) {
          if (!this.isChosen) {
            this.isHover = true;
          } else {
            this.isHover = false;
          }
          const w = position.x;
          this.left = w - 7;
          const h = r + 7;
          if (mouseY < nodeY) {
            this.top = position.y - h - 7;
          } else {
            this.top = position.y + h - 7;
          }
        } else {
          this.isHover = false; // 不展示加号按钮
          this.top = 0;
          this.left = 0;
        }
      });
      this.graph.on("node:mouseleave", (e) => {
        this.graph.setItemState(e.item, "hover", false);
        this.currentEvent = e;
        this.graphItem = e.item;
        this.isHover = false;
      });

      // 拖拽事件
      this.graph.on("node:dragstart", (e) => {
        this.graph.setItemState(e.item, "hover", false);
        this.currentEvent = e;
        this.graphItem = e.item;
        this.isHover = false;
      });
      this.graph.on("node:dragend", (e) => {
        this.graph.setItemState(e.item, "hover", true);
        this.currentEvent = e;
        this.graphItem = e.item;
        this.isHover = false;
      });

      // 点击事件
      this.graph.on("node:click", (e) => {
        this.rightMenuShow = false;
        const itemMap = e.currentTarget.cfg.itemMap;
        for (let i in itemMap) {
          this.graph.setItemState(itemMap[i], "click", false);
        }
        for (let i = 0; i < this.graphData.nodes.length; i++) {
          const node = this.graphData.nodes[i];
          if (node.id === e.item._cfg.id) {
            // node.data.colorValue = node.style.fill;
            this.selectItem = node;
            break;
          }
        }
        this.graph.setItemState(e.item, "click", true);
      });
      this.graph.on("edge:click", (e) => {
        this.rightMenuShow = false;
        const itemMap = e.currentTarget.cfg.itemMap;
        for (let i in itemMap) {
          this.graph.setItemState(itemMap[i], "click", false);
        }
        for (let i = 0; i < this.graphData.edges.length; i++) {
          const edge = this.graphData.edges[i];
          if (edge.id === e.item._cfg.id) {
            // edge.data.colorValue = edge.style.stroke;
            this.selectItem = edge;
            break;
          }
        }
        this.graph.setItemState(e.item, "click", true);
      });
      this.graph.on("canvas:click", (e) => {
        const itemMap = e.currentTarget.cfg.itemMap;
        this.canvasClick(itemMap);
      });

      // 右键事件
      this.graph.on("contextmenu", (evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        const contextMenuData = {
          position: {
            x: evt.canvasX,
            y: evt.canvasY,
          },
          context: [],
        };
        if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
          // 画布上点击右键
          contextMenuData.context = [
            {
              title: "撤销",
              icon: "icon-backoff",
              key: "backoff",
              color: "rgba(0, 0, 0, 0.45)",
              show: true,
              isDisabled: this.undoStack.length ? false : true,
            },
            {
              title: "重做",
              icon: "icon-forward",
              key: "forward",
              color: "rgba(0, 0, 0, 0.45)",
              show: true,
              isDisabled: this.redoStack.length ? false : true,
            },
            {
              title: "粘贴",
              icon: "icon-paste",
              key: "paste",
              color: "rgba(0, 0, 0, 0.45)",
              show: true,
              isDisabled: this.toCopyNodes.length ? false : true,
            },
          ];
        } else if (evt.item) {
          // 在点边上点击右键
          const itemType = evt.item.getType();
          if (itemType === "node") {
            // 点
            contextMenuData.context = [
              {
                title: "复制",
                icon: "icon-copy",
                key: "copy",
                color: "rgba(0, 0, 0, 0.45)",
                show: true,
              },
              {
                title: "删除",
                icon: "icon-delete-simple",
                key: "delete",
                color: "rgba(0, 0, 0, 0.45)",
                show: true,
              },
            ];
            this.selectItem = evt.item.getModel();
          } else {
            // 边
            this.selectItem = evt.item.getModel();
            contextMenuData.context = [
              {
                title: "删除",
                icon: "icon-delete-simple",
                key: "delete",
                color: "rgba(0, 0, 0, 0.45)",
                show: true,
              },
            ];
          }
        }
        this.contextMenuData = contextMenuData;
        this.rightMenuShow = true;
      });

      // 节点选择后
      this.graph.on("nodeselectchange", (e) => {
        // 多选操作后，不会单独选中边故有三种情况：点边都有，点边都没有 和 点有边没有，故当边有数据时，点必有数据
        this.graph.setMode("default");
        this.$nextTick(() => {
          this.graphCanvas.style.cursor = "default";
        });
        // 当前操作后，所有被选中的 items 集合
        this.selectNodes = e.selectedItems.nodes;
        this.selectEdges = e.selectedItems.edges;
        if (this.selectEdges.length || this.selectNodes.length) {
          this.updateIconState(["复制", "删除"], [true, true]);
        } else {
          // 点和边都没有数据
          this.updateIconState(["复制", "删除"], [false, false]);
        }
        if (this.selectNodes.length === 1) {
          this.selectItem = e.selectedItems.nodes[0].getModel();
        } else if (this.selectEdges.length === 1) {
          this.selectItem = e.selectedItems.edges[0].getModel();
        } else {
          this.selectItem = undefined;
        }
      });

      // 键盘输入事件
      this.graph.on("keydown", (e) => {
        e.cancelBubble = true;
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (this.$route.name !== "blueprintManage") return;
        if (
          (e.code.toLowerCase() === "keyc" ||
            e.key.toLowerCase() === "c" ||
            e.keyCode === 67) &&
          e.ctrlKey &&
          e.target.localName === "body"
        ) {
          // ctrl + c
          e.preventDefault();
          this.handleCopy();
        } else if (
          (e.code.toLowerCase() === "keyv" ||
            e.key.toLowerCase() === "v" ||
            e.keyCode === 86) &&
          e.ctrlKey &&
          e.target.localName === "body"
        ) {
          // ctrl + v
          e.preventDefault();
          this.handlePaste("topMenu");
        } else if (
          (e.code.toLowerCase() === "delete" ||
            e.key.toLowerCase() === "delete" ||
            e.keyCode === 46) &&
          e.target.localName === "body"
        ) {
          // delete
          e.preventDefault();
          this.handleDeleteItem();
          this.isHover = false;
        } else if (
          (((e.code.toLowerCase() === "keyz" ||
            e.key.toLowerCase() === "z" ||
            e.keyCode === 90) &&
            e.ctrlKey &&
            e.shiftKey) ||
            ((e.code.toLowerCase() === "keyy" ||
              e.key.toLowerCase() === "y" ||
              e.keyCode === 89) &&
              e.ctrlKey)) &&
          e.target.localName === "body"
        ) {
          // ctrl + shift + z || ctrl + y
          e.preventDefault();
          this.handleRedo();
        } else if (
          (e.code.toLowerCase() === "keyz" ||
            e.key.toLowerCase() === "z" ||
            e.keyCode === 90) &&
          e.ctrlKey &&
          e.target.localName === "body"
        ) {
          // ctrl + z
          e.preventDefault();
          this.handleUndo();
        }
      });
      if (type === "show") {
        // 读取数据
        this.graph.data(this.graphData);
        // 渲染图
        this.graph.render();
        this.resetEdges();
        setTimeout(() => {
          this.graph.fitCenter();
        }, 0);
      }
      this.redoStack = this.graph.getRedoStack();
      this.undoStack = this.graph.getUndoStack();
    },
    handleReturn() {
      this.$emit("isDetailsShowChanged", false, undefined, false);
    },
    async handleCreate() {
      const { flag, message } = this.checkGraphData();
      if (!this.blueprintName) {
        this.$message.error("尚未输入蓝图名称！");
        return false;
      }
      if (!flag) {
        this.$message.error(message);
        return false;
      }
      const json = this.getPostJson("create");
      console.log("json", json);
      let res = undefined;
      if (json) {
        const loading = this.$message.loading("构建蓝图中", 0);
        res = await createSchema(json);
        loading();
      } else {
        return false;
      }
      if (res.message === "成功") {
        this.$emit("isDetailsShowChanged", false, undefined, true);
        this.$message.success("构图成功");
      } else {
        this.$message.error(res.message);
      }
    },
    async handleSave() {
      if (!this.blueprintName) {
        this.$message.error("尚未输入蓝图名称！");
        return false;
      }
      const json = this.getPostJson("save");
      console.log("json", json);
      let res = undefined;
      if (json) {
        const loading = this.$message.loading("正在保存", 0);
        res = await saveSchema(json);
        loading();
      } else {
        return false;
      }
      if (res.message === "成功") {
        this.$message.success("蓝图保存成功！");
        this.$emit("isDetailsShowChanged", false, undefined, true);
      } else {
        this.$message.error(res.message);
      }
    },
    checkGraphData() {
      let flag = true;
      let message = "";
      if (!this.graphData.nodes.length) {
        flag = false;
        message = "尚未配置蓝图点边结构！";
        return {
          flag,
          message,
        };
      }
      for (let i = 0; i < this.graphData.nodes.length; i++) {
        const node = this.graphData.nodes[i];
        if (!node.label) {
          flag = false;
          message = "尚有未配置实体名称的节点！";
          return {
            flag,
            message,
          };
        }
        if (!node.data.keyValue) {
          flag = false;
          message = `${node.label}节点尚未配置主键！`;
          return {
            flag,
            message,
          };
        }
      }
      for (let i = 0; i < this.graphData.edges.length; i++) {
        const edge = this.graphData.edges[i];
        if (!edge.label) {
          flag = false;
          message = "尚有未配置实体名称的边！";
          return {
            flag,
            message,
          };
        }
        if (!edge.data.keyValue) {
          flag = false;
          message = `${edge.label}边尚未配置主键！`;
          return {
            flag,
            message,
          };
        }
      }
      return {
        flag,
        message,
      };
    },
    getPostJson(type) {
      // type: "create":需要校验 , "save":不需要校验(但要校验节点和关系名称是否填写-label)
      const database = find(
        this.databaseOptions,
        (v) => v.value === this.databaseValue
      );
      const json = {
        id: this.details.id || null,
        graphName: this.blueprintName,
        graphDesc: this.blueprintDesc ? this.blueprintDesc : null,
        datasourceId: this.databaseValue,
        datasourceName: (database && database.label) || "",
        text: "",
        nodeDtos: [],
        edgeDtos: [],
        isCreateSchema: type === "create" ? true : false,
      };
      let text = "";
      let flag = true; // 是否校验通过
      let flagEdge = true; // 边是否校验通过
      let flagNode = true; // 点是否校验通过
      this.graphData.edges.map((edge) => {
        const source = find(this.graphData.nodes, (n) => n.id === edge.source);
        const target = find(this.graphData.nodes, (n) => n.id === edge.target);
        let srcLabelId = null;
        let dstLabelId = null;
        if (!flagEdge) return;
        if (!edge.label) {
          this.$message.error("含有未填写关系名称的边！");
          flagEdge = false;
        }
        if (type === "create" && flagEdge) {
          if (edge.data.tableValue.length) {
            const startList = edge.data.tableValue.filter((item) => {
              if (item.startOrEnd === "start") {
                return item;
              }
            });
            const endList = edge.data.tableValue.filter((item) => {
              if (item.startOrEnd === "end") {
                return item;
              }
            });
            if (startList.length) {
              srcLabelId = startList[0].showName;
            } else {
              this.$message.info(`请选择${edge.label}边的起点属性！`);
              flagEdge = false;
            }
            if (endList.length) {
              dstLabelId = endList[0].showName;
            } else if (type === "create") {
              this.$message.info(`请选择${edge.label}边的终点属性！`);
              flagEdge = false;
            }
          } else {
            this.$message.info(`请选择${edge.label}边的关系属性！`);
            flagEdge = false;
          }
        }
        json.edgeDtos.push({
          label: edge.label,
          srcLabel: source.label,
          dstLabel: target.label,
          srcLabelId,
          dstLabelId,
          baseStyle: edge.data.styleValue || null,
          colour: edge.data.colorValue || null,
          size: edge.data.sizeValue || null,
          nodeFields:
            edge.data.tableValue.map((item) => {
              text +=
                item.tableName +
                "." +
                item.fieldName +
                " as " +
                item.showName +
                ",";
              return {
                tableName: item.tableName,
                entityType: "2",
                fieldName: item.fieldName,
                fieldAlias: item.showName,
                analyzedFrom:
                  item.startOrEnd === "start"
                    ? 0
                    : item.startOrEnd === "end"
                    ? 1
                    : null,
                fieldDisplay: item.isShow ? 1 : 0,
                fieldType: item.type,
                isPk: edge.data.keyValue === item.key ? 1 : 0,
              };
            }) || [],
        });
      });
      this.graphData.nodes.map((node, num) => {
        if (!flagNode) return;
        if (!node.label) {
          this.$message.error("含有未填写实体名称的点！");
          flagNode = false;
        }
        json.nodeDtos.push({
          label: node.label,
          baseStyle: node.data.styleValue || null,
          colour: node.data.colorValue || null,
          size: node.data.sizeValue || null,
          icon: (node.data.iconValue && node.data.iconValue.join()) || null,
          nodeFields:
            node.data.tableValue.map((item, index) => {
              if (
                index === node.data.tableValue.length - 1 &&
                num === this.graphData.nodes.length - 1
              ) {
                text +=
                  item.tableName +
                  "." +
                  item.fieldName +
                  " as " +
                  item.showName;
              } else {
                text +=
                  item.tableName +
                  "." +
                  item.fieldName +
                  " as " +
                  item.showName +
                  ",";
              }
              return {
                tableName: item.tableName,
                entityType: "1",
                fieldName: item.fieldName,
                fieldAlias: item.showName,
                fieldDisplay: item.isShow ? 1 : 0,
                fieldType: item.type,
                isPk: node.data.keyValue === item.key ? 1 : 0,
              };
            }) || [],
        });
      });
      json.text = text;

      flag = flagEdge && flagNode;
      if (flag) {
        return json;
      } else {
        return false;
      }
    },
    async getDataSource() {
      const res = await getDataSource();
      console.log("res", res);
      if (res.message === "成功" && res.data) {
        const sourceOptions = [];
        for (let key in res.data) {
          sourceOptions.push({
            label: key,
            value: key,
          });
        }
        this.sourceOptions = sourceOptions;
      } else {
        this.$message.error("获取数据源失败！");
      }
    },
    async getDataBase() {
      const res = await getDataBaseName(this.sourceValue);
      if (res.message === "成功") {
        const databaseOptions = [];
        res.data.map((item) => {
          databaseOptions.push({
            label: item.dsDefaultDb,
            value: item.id,
          });
        });
        this.databaseOptions = databaseOptions;
      } else {
        this.$message.error(res.message);
      }
    },
    handleChangeDataSource(value) {
      this.sourceValue = value;
      this.getDataBase();
      this.form1.setFieldsValue({
        databaseValue: undefined,
      });
    },
    async handleChangeDatabase(value) {
      this.databaseValue = value;
      const res = await getTableFields(value);
      const attrOptions = [[]];
      const attrOptionsChildren = [];
      if (res.message === "成功") {
        for (let i in res.data) {
          attrOptions[0].push({
            key: i,
            name: i,
            children: res.data[i].map((item) => {
              let childrenId = i + "_" + item.split(":")[0];
              attrOptionsChildren.push({
                key: childrenId,
                parent: i,
                name: item.split(":")[0],
                type: item.split(":")[1],
              });

              return {
                key: childrenId,
                name: item.split(":")[0],
                type: item.split(":")[1],
              };
            }),
          });
        }
      }
      this.attrOptions = attrOptions;
      this.attrOptionsChildren = attrOptionsChildren;
    },
    handleAttrChange(value, type) {
      // type: new: 原本没有数据，第一次赋值，show: 原本有数据，只做展示
      if (!value || !value.length) {
        this.form2.setFieldsValue({
          keyValue: undefined,
        });
      }
      if (!this.selectItem) {
        this.$message.info("请先选择一个实体！");
        this.form2.setFieldsValue({
          attrValue: undefined,
        });
        return false;
      }

      if (!this.isClear) {
        this.attrValue = value;
        if (type !== "new") {
          // 节点已经有了相关的值，有些值直接取就好
          const keyOptions = [];
          value.map((item) => {
            const index = findIndex(this.attrOptions[0], (v) => v.key === item);
            if (index !== -1) {
              // 找到了，说明存在当前元素的子元素被全部选取
              this.attrOptions[0][index].children.map((v) => {
                keyOptions.push({
                  label: v.name,
                  value: v.key,
                });
              });
            } else {
              // 没找到，说明当前元素为子元素
              for (let i = 0; i < this.attrOptionsChildren.length; i++) {
                const element = this.attrOptionsChildren[i];
                if (element.key === item) {
                  keyOptions.push({
                    label: element.name,
                    value: item,
                  });
                  break;
                }
              }
            }
          });
          this.keyOptions = keyOptions;
        } else {
          // 节点本来没有相关的值，故可以初始化相关的值
          const attrValueAll = [];
          const keyOptions = [];
          const tableValue = [];
          value.map((item) => {
            const index = findIndex(this.attrOptions[0], (v) => v.key === item);
            if (index !== -1) {
              // 找到了，说明存在当前元素的子元素被全部选取
              this.attrOptions[0][index].children.map((v) => {
                attrValueAll.push({
                  key: v.key,
                  parent: this.attrOptions[0][index].name,
                  label: v.name,
                  showName: v.name,
                  type: v.type,
                });

                keyOptions.push({
                  label: v.name,
                  value: v.key,
                });
              });
            } else {
              // 没找到，说明当前元素为子元素
              for (let i = 0; i < this.attrOptionsChildren.length; i++) {
                const element = this.attrOptionsChildren[i];
                if (element.key === item) {
                  attrValueAll.push({
                    key: item,
                    parent: element.parent,
                    label: element.name,
                    showName: element.name,
                    type: element.type,
                  });

                  keyOptions.push({
                    label: element.name,
                    value: item,
                  });
                  break;
                }
              }
            }
          });
          this.keyOptions = keyOptions;
          this.attrValueAll = attrValueAll;

          const item = this.graph.findById(this.selectItem.id);
          const model = item.getModel();
          model.data.attrValue = value;
          model.data.attrValueAll = attrValueAll;
          attrValueAll.map((attr, num) => {
            tableValue.push({
              id: num,
              tableName: attr.parent,
              fieldName: attr.label,
              startOrEnd: "", // 默认为空-既不是起点，也不是终点
              isShow: num < 1 ? true : false,
              key: attr.key,
              showName: attr.label,
              type: attr.type,
            });
          });
          this.tableValue = tableValue;
          model.data.tableValue = tableValue;
          this.graph.updateItem(item, model, false);
          this.graph.refreshItem(item);
          this.graphData = this.graph.save();
        }
      }
      this.isClear = false;
    },
    handleKeyChange(value) {
      this.keyValue = value;
      const item = this.graph.findById(this.selectItem.id);
      const model = item.getModel();
      model.data.keyValue = value;
      this.graph.updateItem(item, model, false);
      this.graphData = this.graph.save();
    },
    resetEdges() {
      const edges = this.graph.save().edges;
      const noLoopEdges = edges.filter((edge) => {
        if (edge.target !== edge.source) {
          return edge;
        }
      });
      G6.Util.processParallelEdges(noLoopEdges, 20);
      const nodes = [];
      let dist = 90;
      this.graph.getEdges().forEach((edge, i) => {
        if (edges[i].target === edges[i].source) {
          // 将边的自环点放入数组，方便校验是否为同一个点的自环边
          const index = nodes.indexOf(edges[i].target);
          if (index === -1) {
            dist = 90;
          }
          nodes.push(edges[i].target);
          this.graph.updateItem(
            edge,
            {
              loopCfg: {
                dist,
              },
              labelCfg: {
                autoRotate: true,
                backgroundColor: "#fff",
              },
              style: {
                startArrow: {
                  path: G6.Arrow.vee(0, 0, edges[i].style.lineWidth),
                  d: edges[i].style.lineWidth,
                },
                endArrow: {
                  path: G6.Arrow.vee(10, 10, edges[i].style.lineWidth), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
                  d: edges[i].style.lineWidth, // 偏移量
                  fill: edges[i].style.stroke,
                },
              },
              type: "loop",
            },
            false
          );
          dist += 50;
        } else {
          this.graph.updateItem(
            edge,
            {
              curveOffset: edges[i].curveOffset,
              curvePosition: 0.425, // 手动调出来的
              style: {
                startArrow: {
                  path: G6.Arrow.vee(
                    0,
                    0,
                    edges[i].style.lineWidth +
                      edge._cfg.targetNode.getModel().size / 2
                  ),
                  d:
                    edges[i].style.lineWidth +
                    edge._cfg.targetNode.getModel().size / 2,
                },
                endArrow: {
                  path: G6.Arrow.vee(
                    10,
                    10,
                    edges[i].style.lineWidth +
                      edge._cfg.targetNode.getModel().size / 2
                  ), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
                  d:
                    edges[i].style.lineWidth +
                    edge._cfg.targetNode.getModel().size / 2, // 偏移量
                  fill: edges[i].style.stroke,
                },
              },
              labelCfg: {
                autoRotate: true,
                backgroundColor: "#fff",
              },
            },
            false
          );
        }
      });
    },
    onMenuClick(key) {
      switch (key.key) {
        case "backoff":
          this.handleUndo();
          break;
        case "forward":
          this.handleRedo();
          break;
        case "paste":
          this.handlePaste("rightMenu");
          break;
        case "copy":
          this.handleCopy();
          break;
        case "delete":
          this.handleDeleteItem();
          break;
        default:
          break;
      }
    },
    handleRemove(record) {
      if (this.detailsType === "check") return;
      const index1 = findIndex(this.tableValue, (v) => v.id === record.id);
      const index2 = findIndex(this.attrValueAll, (v) => v.key === record.key);
      // 删除表格的值
      this.tableValue.splice(index1, 1);
      if (record.key === this.keyValue) {
        // 判断是否删除了主键
        this.form2.setFieldsValue({
          keyValue: undefined,
        });
        this.keyValue = undefined;
        this.$set(this.tableValue, 0, { ...this.tableValue[0], isShow: true });
      }
      // 同时删除实体属性
      this.attrValueAll.splice(index2, 1);
      this.attrValue = this.attrValueAll.map((v) => v.key);

      const item = this.graph.findById(this.selectItem.id);
      const model = item.getModel();
      model.data.attrValue = this.attrValue;
      model.data.attrValueAll = this.attrValueAll;
      model.data.tableValue = this.tableValue;
      this.graph.updateItem(item, model, false);
      this.graph.refreshItem(item);
      this.graphData = this.graph.save();

      // 先清除级联组件的值，再重新赋值
      this.isClear = true;
      this.$refs.cascader.handleClearAll();
      this.handleAttrChange(this.attrValue, "show");

      this.form2.setFieldsValue({
        attrValue: this.attrValue,
        keyValue: this.keyValue,
      });
    },
    handleChangeName: debounce(function (e, id) {
      // 正则校验
      const value = e.target.value.trim();
      // 中文、英文、数字和下划线
      const reg = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/;
      const flag = reg.test(value);
      if (!value) {
        this.$message.error("请输入展示项名称！");
      } else if (flag) {
        const index = findIndex(this.tableValue, (v) => v.id === id);
        const target = this.tableValue[index];
        target.showName = value;
        this.$set(this.tableValue, index, target);
        const item = this.graph.findById(this.selectItem.id);
        const model = item.getModel();
        model.data.tableValue = this.tableValue;
        this.graph.updateItem(item, model, false);
        this.graph.refreshItem(item);
        this.graphData = this.graph.save();
      } else {
        this.$message.error("展示项名称只能包含中文、英文、数字和下划线");
      }
    }, 300),
    onChange(checked, id) {
      const tableValue = cloneDeep(this.tableValue);
      let target = null;
      tableValue.map((item) => {
        if (item.id === id) {
          target = item;
          item.isShow = checked;
        } else {
          item.isShow = false;
        }
      });
      if (!checked) {
        target.isShow = true;
        this.$message.error("请至少选择一个作为展示项！");
      }
      this.tableValue = tableValue;
      const item = this.graph.findById(this.selectItem.id);
      const model = item.getModel();
      model.data.tableValue = this.tableValue;
      this.graph.updateItem(item, model, false);
      this.graph.refreshItem(item);
      this.graphData = this.graph.save();
    },
    handleUndo() {
      // 撤销
      undo(this.graph);
      this.resetEdges();
      this.rightMenuShow = false;
      this.checkStackLength();
      this.graphData = this.graph.save();
      // 直接重置selectItem
      this.canvasClick([...this.graph.getNodes(), ...this.graph.getEdges()]);
    },
    handleRedo() {
      // 重做
      redo(this.graph);
      this.resetEdges();
      this.rightMenuShow = false;
      this.checkStackLength();
      this.graphData = this.graph.save();
      // 直接重置selectItem
      this.canvasClick([...this.graph.getNodes(), ...this.graph.getEdges()]);
    },
    handleCopy() {
      this.rightMenuShow = false;
      const toCopyNodes = [];
      if (!this.selectItem && !this.selectNodes.length) {
        this.$message.error("请先选择实体节点！");
      } else if (this.selectNodes.length) {
        this.selectNodes.map((node) => {
          const model = node.getModel();
          toCopyNodes.push({
            position: {
              x: model.x + model.size,
              y: model.y + model.size,
            },
            color: model.style.fill,
            size: model.size,
            modelData: model,
          });
        });
        this.updateIconState(["粘贴"], [true]);
      } else {
        toCopyNodes.push({
          position: {
            x: this.selectItem.x + this.selectItem.size,
            y: this.selectItem.y + this.selectItem.size,
          },
          color: this.selectItem.style.fill,
          size: this.selectItem.size,
          modelData: this.selectItem,
        });
        this.updateIconState(["粘贴"], [true]);
      }
      this.toCopyNodes = toCopyNodes;
    },
    handlePaste(type) {
      if (this.toCopyNodes.length) {
        const toCopyNodes = [];
        if (type === "topMenu") {
          // 顶部菜单点击粘贴
          this.toCopyNodes.map((node) => {
            const { position, size, color, modelData } = node;
            toCopyNodes.push({
              ...node,
              position: {
                x: position.x + size,
                y: position.y + size,
              },
            });
            this.handleAddNode(position, color, modelData);
          });
        } else {
          // 右键粘贴，此种情况无法粘贴多个点，所以只粘贴第一个点
          const { size, color, modelData } = this.toCopyNodes[0];
          const pointPosition = this.graph.getPointByCanvas(
            this.contextMenuData.position.x,
            this.contextMenuData.position.y
          );
          toCopyNodes.push({
            ...this.toCopyNodes[0],
            position: {
              x: pointPosition.x + size,
              y: pointPosition.y + size,
            },
          });
          this.handleAddNode(pointPosition, color, modelData);
        }
        this.toCopyNodes = toCopyNodes; // 更新待复制的节点信息，不然一直点粘贴，只会在相同的位置粘贴像同样式的节点
        this.rightMenuShow = false;
        this.graphData = this.graph.save();
      }
    },
    handleMultiSelect() {
      if (!this.graphData.nodes.length) return;
      this.graph.setMode("multiSelect");
      this.$nextTick(() => {
        this.graphCanvas.style.cursor = "crosshair";
      });
    },
    handleZoomIn() {
      // 放大
      if (!this.graphData.nodes.length) return;
      const center = {
        x: this.canvasWidth / 2,
        y: this.canvasHeight / 2,
      };
      this.canvasRatio *= 1.25;
      this.canvasRatio = this.canvasRatio.toFixed(2); // 保留两位小数，方便变成百分数
      if (this.canvasRatio > 2.4) {
        this.canvasRatio = 2.4;
        this.updateIconState(["放大"], [false]);
        return false;
      } else {
        this.graph.zoomTo(this.canvasRatio, center);
        this.updateIconState(["放大", "缩小"], [true, true]);
        this.graph.setMode("default");
      }
    },
    handleZoomOut() {
      // 缩小
      if (!this.graphData.nodes.length) return;
      const center = {
        x: this.canvasWidth / 2,
        y: this.canvasHeight / 2,
      };
      this.canvasRatio *= 0.8;
      this.canvasRatio = this.canvasRatio.toFixed(2); // 保留两位小数，方便变成百分数
      if (this.canvasRatio < 0.5) {
        this.canvasRatio = 0.5;
        this.updateIconState(["缩小"], [false]);
        return false;
      } else {
        this.graph.zoomTo(this.canvasRatio, center);
        this.updateIconState(["放大", "缩小"], [true, true]);
        this.graph.setMode("default");
      }
    },
    handleFitView() {
      if (!this.graphData.nodes.length) return;
      this.graph.fitView(50);
      this.graph.setMode("default");
      this.canvasRatio = this.graph.getZoom().toFixed(2);
    },
    handleFitBack() {
      if (!this.graphData.nodes.length) return;
      const center = {
        x: this.canvasWidth / 2,
        y: this.canvasHeight / 2,
      };
      this.graph.zoomTo(1, center);
      this.graph.setMode("default");
      this.canvasRatio = 1;
    },
    handleDeleteItem() {
      this.rightMenuShow = false;
      if (
        !this.selectItem &&
        !this.selectNodes.length &&
        !this.selectEdges.length
      ) {
        this.$message.error("请先选择实体！");
      } else if (
        (this.selectNodes && this.selectNodes.length) ||
        (this.selectEdges && this.selectEdges.length)
      ) {
        // 通过 ID 查询节点实例
        this.selectEdges.map((edge) => {
          if (!edge.destroyed) {
            const item = this.graph.findById(edge._cfg.id);
            this.graph.removeItem(item, true);
            this.checkStackLength();
          }
        });
        this.selectNodes.map((node) => {
          if (!node.destroyed) {
            const item = this.graph.findById(node._cfg.id);
            this.graph.removeItem(item, true);
            this.checkStackLength();
          }
        });
      } else {
        // 通过 ID 查询节点实例
        const item = this.graph.findById(this.selectItem.id);
        this.graph.removeItem(item, true);
        this.checkStackLength();
      }
      this.selectNodes = [];
      this.selectEdges = [];
      this.selectItem = undefined;
      this.updateIconState(["复制", "删除"], [false, false]);
      this.graphData = this.graph.save();
    },
    updateIconState(labels, flags) {
      const toolIcons = cloneDeep(this.toolIcons);
      toolIcons.map((box) => {
        box.map((item) => {
          labels.map((label, index) => {
            if (item.label === label) {
              item.isActive = flags[index];
            }
          });
        });
      });
      this.toolIcons = toolIcons;
    },
    handleClick(value) {
      this[value] = !this[value];
      setTimeout(() => {
        this.canvasHeight = this.$refs.content.clientHeight;
      }, 200);
    },
    handleDragStart(e, color) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("color", color);
    },
    handleDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      this.$nextTick(() => {
        this.graphCanvas.style.cursor = "default";
      });
      const color = e.dataTransfer.getData("color");
      const position = this.graph.getPointByCanvas(e.offsetX, e.offsetY);
      if (color) {
        const id = this.handleAddNode(position, color);

        // 通过拖拽方式加入画布的节点，默认选中
        // 优先去掉其他点边的选中状态
        const nodes = this.graph.findAllByState("node", "click");
        const edges = this.graph.findAllByState("edge", "click");
        const elements = [...nodes, ...edges];
        elements.map((ele) => {
          this.graph.setItemState(ele, "click", false);
        });
        const item = this.graph.findById(id);
        this.graph.setItemState(item, "click", true);
        const model = item.getModel();
        model.data = {
          styleValue: "1",
          sizeValue: this.sizeOptions1[0].value,
          colorValue: color,
          iconValue: undefined,
          tableValue: [],
        };
        this.selectItem = model;

        // 更新数据
        this.graphData = this.graph.save();
      }
    },
    handleAddNode(position, color, modelData) {
      // modelData为待复制节点的数据，如果存在则复用，如果不存在则做初始化
      const model = {
        id: `node${this.nodeIndex}`,
        x: position.x,
        y: position.y,
        style: {
          fill: color,
        },
        icon: modelData ? modelData.icon : null,
        data: modelData
          ? modelData.data
          : {
              styleValue: "1",
              sizeValue: 48,
              colorValue: "#6682E4",
              iconValue: undefined,
              tableValue: [],
            },
      };
      this.graph.addItem("node", model, true);
      this.checkStackLength();
      this.nodeIndex += 1;
      return model.id;
    },
    handleAddEdge(source, target) {
      const model = {
        id: `edge${this.edgeIndex}`,
        source,
        target,
        data: {
          styleValue: "1",
          sizeValue: 1,
          colorValue: "#CECECE",
          tableValue: [],
        },
      };
      this.graph.addItem("edge", model, true);
      this.checkStackLength();
      this.edgeIndex += 1;
    },
    onMouse(type) {
      if (type === "enter") {
        this.graph.setItemState(this.graphItem, "hover", true);
        if (!this.isChosen) {
          this.isHover = true;
        } else {
          this.isHover = false;
        }
      } else {
        this.graph.setItemState(this.graphItem, "hover", false);
        this.isHover = false;
        if (this.mouseDown && !this.mouseClick) {
          this.graph.setMode("addEdge");
          const node = this.graphItem;
          const model = node.getModel();
          // Add anew edge, the end node is the current node user clicks
          this.selfEdge = this.graph.addItem(
            "edge",
            {
              id: `edge${this.edgeIndex}`,
              source: model.id,
              target: model.id,
              style: {
                startArrow: {},
                endArrow: {
                  path: G6.Arrow.vee(10, 10, 1), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
                  d: 1, // 偏移量
                  fill: "#CECECE",
                },
              },
            },
            false
          );
          this.edgeIndex += 1;
          this.addingEdge = true;
          this.mouseDown = false;
          this.mouseClick = false;
        }
      }
    },
    onMousedown(e) {
      this.mouseDown = true;
      this.mouseClick = false;
    },
    handleAdd(e) {
      this.mouseClick = true;
      this.mouseDown = false;
      const model = this.graphItem.getModel();
      const positionReal = this.graph.getCanvasByPoint(model.x, model.y);
      const nodeX = positionReal.x;
      const nodeY = positionReal.y;
      const mouseX = this.left + 7;
      const mouseY = this.top + 7;
      const position = {
        x: 0,
        y: 0,
      };
      let w = 0;
      let h = 0;
      const color = model.data.colorValue || model.style.fill;
      const source = this.graphItem._cfg.id;
      const target = `node${this.nodeIndex}`;
      const r = 200 * this.canvasRatio; // 默认边长：200

      if (mouseX !== nodeX) {
        if (mouseX > nodeX) {
          const angle = Math.atan((nodeY - mouseY) / (mouseX - nodeX));
          w = nodeX + Math.cos(angle) * r;
          h = nodeY - Math.sin(angle) * r;
        } else {
          const angle = Math.atan((nodeY - mouseY) / (nodeX - mouseX));
          w = nodeX - Math.cos(angle) * r;
          h = nodeY - Math.sin(angle) * r;
        }
      } else {
        w = nodeX;
        if (nodeY > mouseY) {
          h = nodeY - r;
        } else {
          h = nodeY + r;
        }
      }
      const points = this.graph.getPointByCanvas(w, h);
      position.x = points.x;
      position.y = points.y;
      this.handleAddNode(position, color);
      this.handleAddEdge(source, target);
      this.isHover = false;

      // 更新数据
      this.graphData = this.graph.save();
    },
    handleInputChange: debounce(function (e) {
      // 不可使用箭头函数代替，如 fun: debounce( (e)=> {…},100},箭头函数会导致里面的this指向undefined
      if (!this.selectItem) {
        this.$message.info("请先选择一个实体！");
        this.form2.setFieldsValue({
          inputValue: undefined,
        });
        return false;
      }
      const value = e.target.value.trim();
      this.form2.setFieldsValue({
        inputValue: value,
      });
      this.inputValue = value;
      const item = this.graph.findById(this.selectItem.id);
      const model = item.getModel();
      model.data.inputValue = value;
      model.label = value;
      this.graph.updateItem(item, model, false);
      this.graph.refreshItem(item);
      this.graphData = this.graph.save();
    }, 300),
    handleStyleChange(value) {
      if (!this.selectItem) {
        this.$message.info("请先选择一个实体！");
        return false;
      }
      const item = this.graph.findById(this.selectItem.id);
      let model = item.getModel();
      const data = model.data;
      if (this.selectItem.type === "circle") {
        let fill = null;
        let stroke = null;
        let lineWidth = 0;
        let icon = model.icon || {
          show: true,
        };
        let flag = true; // 是否返回
        switch (value) {
          case "2":
            // 样式二
            fill = "#fff";
            stroke = this.colorValue;
            lineWidth = 1.5;
            this.styleValue = value;
            data.styleValue = value;
            if (icon && icon.show && icon.img) {
              this.$set(this.iconValue, 2, value);
              data.iconValue = this.iconValue;
              icon.width = this.sizeValue;
              icon.height = this.sizeValue;
              icon.img = require(`@/assets/theme/${this.iconValue[0]}/${this.iconValue[1]}/${this.iconValue[2]}/${this.iconValue[3]}.svg`);
            }
            break;
          case "3":
            // 样式三
            if (icon && icon.show && icon.img) {
              this.$set(this.iconValue, 2, value);
              data.iconValue = this.iconValue;
              icon.width = this.sizeValue;
              icon.height = this.sizeValue;
              this.styleValue = value;
              data.styleValue = value;
              icon.img = require(`@/assets/theme/${this.iconValue[0]}/${this.iconValue[1]}/${this.iconValue[2]}/${this.iconValue[3]}.svg`);
            } else {
              this.$message.info("请先选择图标样式");
              flag = false;
            }
            break;

          default:
            // 默认样式一
            fill = this.colorValue;
            stroke = this.colorValue;
            lineWidth = 0;
            this.styleValue = value;
            data.styleValue = value;
            if (icon && icon.show && icon.img) {
              this.$set(this.iconValue, 2, value);
              data.iconValue = this.iconValue;
              icon.width = this.sizeValue;
              icon.height = this.sizeValue;
              // 填充类型，取白色图标
              icon.img = require(`@/assets/theme/${this.iconValue[0]}/${this.iconValue[1]}/${this.iconValue[2]}/${this.iconValue[3]}.svg`);
            }
            break;
        }
        model = {
          ...model,
          data,
          icon,
          style: {
            ...model.style,
            fill,
            stroke,
            lineWidth,
          },
        };
        if (!flag) return;
      } else {
        data.styleValue = value;
        this.styleValue = value;

        if (value === "1") {
          model = {
            ...model,
            data,
            style: {
              lineDash: [],
            },
          };
        } else {
          model = {
            ...model,
            data,
            style: {
              lineDash: [5, 5],
            },
          };
        }
      }
      this.graph.updateItem(item, model, false);
      this.graph.refreshItem(item);
      this.graphData = this.graph.save();
    },
    handleIconChange(value) {
      if (!this.selectItem) {
        this.$message.info("请先选择一个实体！");
        return false;
      }
      const target = find(
        this.colorOptions,
        (v) => v.value === this.colorValue
      );
      // 填充类型
      value.push(this.styleValue);
      value.push(target.label);
      this.iconValue = value;

      const item = this.graph.findById(this.selectItem.id);
      let model = item.getModel();
      const data = model.data;
      let icon = model.icon;
      data.iconValue = value;
      // icon.show = true;

      icon.width = this.sizeValue;
      icon.height = this.sizeValue;
      icon.img = require(`@/assets/theme/${value[0]}/${value[1]}/${value[2]}/${value[3]}.svg`);
      model = {
        ...model,
        icon,
        data,
      };

      this.graph.updateItem(item, model, false);
      this.graph.refreshItem(item);
      this.graphData = this.graph.save();
    },
    handleSizeChange(value) {
      if (!this.selectItem) {
        this.$message.info("请先选择一个实体！");
        return false;
      }
      this.sizeValue = value;
      const item = this.graph.findById(this.selectItem.id);
      let model = item.getModel();
      const data = model.data;
      data.sizeValue = value;

      if (this.selectItem.type === "circle") {
        let icon = model.icon;
        if (icon && icon.show && icon.img) {
          icon.width = this.sizeValue;
          icon.height = this.sizeValue;
        }
        model = {
          ...model,
          icon,
          size: value,
          data,
        };
        // 修改以当前节点为起点或终点的边的箭头偏移
        const inEdges = item.getInEdges();
        const outEdges = item.getOutEdges();
        // 不直接使用getEdges()方法是因为有奇怪的bug，被迫分开写
        if (inEdges.length || outEdges.length) {
          inEdges.map((edge) => {
            let edgeModel = edge.getModel();
            if (edgeModel.type === "loop") {
              edgeModel = {
                ...edgeModel,
                style: {
                  startArrow: {
                    // 自环边的起点不需要偏移量
                    path: G6.Arrow.vee(0, 0, 0),
                    d: 0,
                  },
                  endArrow: {
                    path: G6.Arrow.vee(10, 10, edgeModel.style.lineWidth), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
                    d: edgeModel.style.lineWidth, // 偏移量
                    fill: edgeModel.style.stroke,
                  },
                },
              };
            } else {
              // 以当前节点为终点
              const size = value;
              edgeModel = {
                ...edgeModel,
                style: {
                  ...edgeModel.style,
                  endArrow: {
                    path: G6.Arrow.vee(
                      10,
                      10,
                      edgeModel.style.lineWidth + size / 2
                    ), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
                    d: edgeModel.style.lineWidth + size / 2, // 偏移量
                    fill: edgeModel.style.stroke,
                  },
                },
              };
            }
            this.graph.updateItem(edge, edgeModel, false);
            this.graph.refreshItem(edge);
          });
          outEdges.map((edge) => {
            let edgeModel = edge.getModel();
            if (edgeModel.type === "loop") {
              edgeModel = {
                ...edgeModel,
                style: {
                  startArrow: {
                    // 自环边的起点不需要偏移量
                    path: G6.Arrow.vee(0, 0, 0),
                    d: 0,
                  },
                  endArrow: {
                    path: G6.Arrow.vee(10, 10, edgeModel.style.lineWidth), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
                    d: edgeModel.style.lineWidth, // 偏移量
                    fill: edgeModel.style.stroke,
                  },
                },
              };
            } else {
              // 以当前节点为起点
              const size = value;
              edgeModel = {
                ...edgeModel,
                style: {
                  ...edgeModel.style,
                  startArrow: {
                    path: G6.Arrow.vee(
                      0,
                      0,
                      edgeModel.style.lineWidth + size / 2
                    ), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
                    d: edgeModel.style.lineWidth + size / 2, // 偏移量
                    fill: edgeModel.style.stroke,
                  },
                },
              };
            }
            this.graph.updateItem(edge, edgeModel, false);
            this.graph.refreshItem(edge);
          });
        }
      } else {
        const size = item._cfg.targetNode.getModel().size;
        if (model.type === "loop") {
          model = {
            ...model,
            style: {
              lineWidth: value,
              startArrow: {
                // 自环边的起点不需要偏移量
                path: G6.Arrow.vee(0, 0, 0),
                d: 0,
              },
              endArrow: {
                path: G6.Arrow.vee(10, 10, value), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
                d: value, // 偏移量
                fill: this.colorValue,
              },
            },
            data,
          };
        } else {
          model = {
            ...model,
            style: {
              lineWidth: value,
              startArrow: {
                path: G6.Arrow.vee(0, 0, value + size / 2),
                d: value + size / 2,
              },
              endArrow: {
                path: G6.Arrow.vee(10, 10, value + size / 2), // 内置箭头，参数为箭头宽度、长度、偏移量 d（默认为 0）
                d: value + size / 2, // 偏移量
                fill: this.colorValue,
              },
            },
            data,
          };
        }
      }
      this.graph.updateItem(item, model, false);
      this.graph.refreshItem(item);
      this.graphData = this.graph.save();
    },
    handleColorChange(value) {
      if (!this.selectItem) {
        this.$message.info("请先选择一个实体！");
        return false;
      }
      this.colorValue = value;
      const item = this.graph.findById(this.selectItem.id);
      let model = item.getModel();
      const data = model.data;
      data.colorValue = value;

      if (this.selectItem.type === "circle") {
        let fill = null;
        let stroke = null;
        let lineWidth = 0;
        let icon = model.icon || {
          show: true,
        };

        let flag = true; // 是否返回
        const target = find(
          this.colorOptions,
          (v) => v.value === this.colorValue
        );
        switch (this.styleValue) {
          case "2":
            // 样式二
            fill = "#fff";
            stroke = value;
            lineWidth = 1.5;
            if (icon && icon.show && icon.img) {
              this.$set(this.iconValue, 3, target.label);
              data.iconValue = this.iconValue;
              icon.width = this.sizeValue;
              icon.height = this.sizeValue;
              icon.img = require(`@/assets/theme/${this.iconValue[0]}/${this.iconValue[1]}/${this.iconValue[2]}/${this.iconValue[3]}.svg`);
            }
            break;
          case "3":
            // 样式三
            if (icon && icon.show && icon.img) {
              this.$set(this.iconValue, 3, target.label);
              icon = model.icon;
              icon.width = this.sizeValue;
              icon.height = this.sizeValue;
              icon.img = require(`@/assets/theme/${this.iconValue[0]}/${this.iconValue[1]}/${this.iconValue[2]}/${this.iconValue[3]}.svg`);
            } else {
              this.$message.info("请先选择图标样式");
              flag = false;
            }
            break;

          default:
            // 默认样式一
            fill = value;
            stroke = value;
            lineWidth = 0;
            if (icon && icon.show && icon.img) {
              this.$set(this.iconValue, 3, target.label);
              icon.width = this.sizeValue;
              icon.height = this.sizeValue;
              // 填充类型，取白色图标
              icon.img = require(`@/assets/theme/${this.iconValue[0]}/${this.iconValue[1]}/${this.iconValue[2]}/${this.iconValue[3]}.svg`);
            }
            break;
        }
        model = {
          ...model,
          icon,
          style: {
            ...model.style,
            fill,
            stroke,
            lineWidth,
          },
          data,
        };
        if (!flag) return;
      } else {
        model = {
          ...model,
          style: {
            stroke: value,
          },
          data,
        };
        // 重置边的click状态，不然修改了颜色也看不出来
        this.graph.setItemState(item, "click", false);
      }
      this.graph.updateItem(item, model, false);
      this.graph.refreshItem(item);
      this.graphData = this.graph.save();
    },
    handleChangeInfo() {
      this.infoModalShow = true;
      this.blueprintNameInput = this.blueprintName;
      this.blueprintDescInput = this.blueprintDesc;
    },
    handleOk() {
      this.blueprintName = this.blueprintNameInput;
      this.blueprintDesc = this.blueprintDescInput;
      this.onCancel();
    },
    onCancel() {
      this.infoModalShow = false;
      this.blueprintNameInput = undefined;
      this.blueprintDescInput = undefined;
    },
    onRadioChange(value, id) {
      const tableValue = cloneDeep(this.tableValue);
      tableValue.map((item) => {
        if (item.id === id) {
          // 找到需要修改的行，修改startOrEnd的值
          item.startOrEnd = value;
        } else if (item.startOrEnd === value) {
          // 找到相同值的，重置为空--无
          item.startOrEnd = "";
        }
      });
      this.tableValue = tableValue;
      const item = this.graph.findById(this.selectItem.id);
      const model = item.getModel();
      model.data.tableValue = this.tableValue;
      this.graph.updateItem(item, model, false);
      this.graph.refreshItem(item);
      this.graphData = this.graph.save();
    },
    checkStackLength() {
      this.redoStack = this.graph.getRedoStack();
      this.undoStack = this.graph.getUndoStack();
      // 更新图标样式
      if (this.undoStack.length > 0) {
        this.updateIconState(["撤销"], [true]);
      } else {
        this.updateIconState(["撤销"], [false]);
      }
      if (this.redoStack.length > 0) {
        this.updateIconState(["重做"], [true]);
      } else {
        this.updateIconState(["重做"], [false]);
      }
    },
    canvasClick(items) {
      this.rightMenuShow = false;
      for (let i in items) {
        this.graph.setItemState(items[i], "click", false);
      }
      this.selectItem = undefined;
      this.selectNodes = [];
      this.selectEdges = [];
      this.graph.setMode("default");
      this.updateIconState(["复制", "删除"], [false, false]);
      this.$nextTick(() => {
        this.graphCanvas.style.cursor = "default";
      });
    },
  },
};
</script>
<style lang="less">
.blueprint-details {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  min-height: 100%;
  position: absolute;

  &-header {
    width: 100%;
    display: flex;
    padding: 24px;
    background: #fff;
    position: relative;
    justify-content: space-between;

    &-title {
      display: flex;
      flex-direction: column;

      .title-box {
        width: 290px;
        display: flex;
        align-items: center;

        .title-label {
          width: 76px;
        }

        .title-input {
          width: calc(100% - 76px);
        }

        .title-name {
          font-size: 20px;
          font-weight: 600;
          color: @primaryTextColor;
        }

        .anticon-edit {
          color: @blue;
          margin-left: 12px;
        }
      }

      .title-desc {
        top: 72px;
        left: 24px;
        right: 24px;
        display: flex;
        position: absolute;

        .title-label {
          width: 76px;
        }

        &-text {
          display: flex;
          align-items: center;
          max-width: calc(100% - 76px);
          color: @secondaryTextColor;

          &-content {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            width: calc(100% - 36px);
          }
        }

        .update {
          color: @blue;
          cursor: pointer;
          margin-left: 8px;
        }

        &.no-content {
          .title-desc-text {
            color: @blue;
            cursor: pointer;
          }
        }
      }
    }
  }

  &-content {
    width: 100%;
    padding: 24px;
    display: flex;
    min-height: calc(100% - 120px);

    &-left {
      flex: 1;
      display: flex;
      background: #fff;
      flex-direction: column;
      width: calc(100% - 546px);
      border-right: 1px solid @dividersColor;

      .left-graph {
        min-height: 656px;
        height: calc(100% - 116px);

        &-tools {
          width: 100%;
          height: 44px;
          display: flex;
          overflow: auto;
          border-right: 0;
          padding-left: 16px;
          align-items: center;
          padding-right: 95px;
          border: 1px solid #e6f7ff;

          &-box {
            display: flex;
            align-items: center;

            .ant-divider {
              margin: 0 16px;
            }

            &-item {
              width: 14px;
              height: 14px;
              display: flex;
              cursor: pointer;
              align-items: center;

              .svg-icon {
                &.disabled {
                  cursor: not-allowed;
                }
              }

              &:not(:nth-last-child(2)) {
                margin-right: 24px;
              }
            }
          }
        }

        &-canvas {
          display: flex;
          position: relative;
          background: #fafafa;
          height: calc(100% - 44px);

          &-addbtn {
            width: 14px;
            height: 14px;
            cursor: copy;
            display: flex;
            position: absolute;
            transition: all 0.1s;

            .anticon {
              color: @blue;
            }
          }

          &-ratio {
            position: absolute;
            right: 0;
            top: -32.75px;
            color: #9da9c2;
            background: #fff;
            padding-right: 16px;
            user-select: none;
          }
        }
      }

      .left-bottom {
        height: 116px;
        border-right: 0;
        padding: 16px 24px;
        border: 1px solid #e6f7ff;

        &-nodes {
          width: 192px;
          display: flex;
          margin-bottom: 16px;
          justify-content: space-between;
        }

        &-text {
          font-size: 12px;
          color: @secondaryTextColor;

          &.disabled {
            color: @disabledColor;
          }
        }
      }
    }

    &-right {
      width: 546px;
      min-height: 772px;
      background: #fff;

      .right-header {
        height: 44px;
        padding: 0 16px;
        font-weight: 600;
        line-height: 44px;
        border-style: solid;
        color: @primaryTextColor;
        background: @tableHeaderColor;
        border-width: 1px 1px 1px 0px;
        border-color: rgba(0, 0, 0, 0.06);
      }

      .right-options {
        height: calc(100% - 52px);

        &-content {
          display: flex;
          padding: 16px;
          overflow: auto;
          flex-direction: column;
          height: calc(100% - 44px);

          &-item {
            display: flex;
            flex-direction: column;
            justify-content: center;

            &:first-child {
              .item-content {
                height: 80px;
              }
            }

            &:nth-child(2) {
              .item-content {
                height: 128px;
              }
            }

            &:nth-child(4) {
              .item-box {
                height: 164px;
              }
            }

            .item-title {
              z-index: 9;
              color: @blue;
              height: 22px;
              cursor: pointer;
              max-width: 125px;
              line-height: 22px;

              &-text {
                margin-right: 10px;
              }
            }

            .item-content {
              opacity: 1;
              display: flex;
              margin: 8px 0 16px;
              transition: all 0.3s;
              flex-direction: column;

              &.fold {
                height: 0;
                opacity: 0;
                margin-top: 0;

                .item-content-item,
                .ant-form,
                .date-table {
                  display: none;
                }
              }

              .ant-form {
                &.data-form {
                  .ant-form-item-label {
                    width: 84px;
                  }

                  .ant-form-item-control-wrapper {
                    width: calc(100% - 84px);

                    .ant-form-item-children {
                      .item-content-input {
                        height: 32px;

                        .ant-select {
                          height: 32px;
                          overflow: hidden;

                          .ant-select-arrow {
                            top: 18px;
                          }
                        }
                      }
                    }
                  }
                }
                &-item {
                  height: 32px;
                  display: flex;
                  margin-bottom: 16px;

                  &:last-child {
                    margin-bottom: 0;
                  }

                  &-label {
                    width: 97px;
                    line-height: 32px;
                    color: @primaryTextColor;
                  }

                  &-control-wrapper {
                    width: calc(100% - 97px);

                    .ant-form-item-control {
                      line-height: 32px;

                      .ant-select-dropdown {
                        min-width: 153px !important;

                        &-content {
                          .customer-multiple-cascader {
                            .cascader-content-list {
                              width: 140px;

                              &:first-child {
                                width: 270px;

                                .cascader-content-item {
                                  &:first-child {
                                    display: none;
                                  }
                                }
                              }
                              .cascader-content-item {
                                padding: 5px 8px;

                                &:hover {
                                  background: #e6f7ff;
                                }

                                .ant-checkbox-wrapper {
                                  color: @primaryTextColor;

                                  .ant-checkbox {
                                    top: 1px;

                                    &.ant-checkbox-indeterminate {
                                      .ant-checkbox-inner {
                                        &::after {
                                          background-color: #1890ff;
                                        }
                                      }
                                    }

                                    &.ant-checkbox-checked {
                                      .ant-checkbox-inner {
                                        background: #1890ff;

                                        &::after {
                                          border-color: #fff;
                                        }
                                      }
                                    }

                                    .ant-checkbox-inner {
                                      width: 16px;
                                      height: 16px;
                                      border-radius: 2px;
                                      border-color: @borderColor;

                                      &::after {
                                        left: 50%;
                                      }
                                    }

                                    &-input {
                                      width: 16px;
                                      height: 16px;
                                    }
                                  }

                                  &.ant-checkbox-wrapper-checked {
                                    .ant-checkbox-checked {
                                      .ant-checkbox-inner {
                                        &::after {
                                          left: 20%;
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              .date-table {
                height: auto;

                .ant-spin-nested-loading {
                  height: auto;

                  .ant-spin-container {
                    height: auto;

                    .ant-table {
                      height: auto;
                    }
                  }
                }
                .ant-table-row-cell-break-word {
                  font-size: 12px;
                  padding: 6px 8px !important;
                }

                .slot-radio {
                  padding: 2px;
                  height: 22px;
                  display: flex;
                  background: #fff;
                  border-radius: 3px;
                  border: 1px solid @borderColor;

                  .ant-radio-button-wrapper {
                    border: 0;
                    padding: 0;
                    width: 34px;
                    height: 16px;
                    font-size: 12px;
                    line-height: 16px;
                    text-align: center;
                    border-radius: 2px !important;

                    &:not(:last-child) {
                      margin-right: 2px;
                    }

                    &::before {
                      content: none;
                    }

                    &.ant-radio-button-wrapper-disabled {
                      background-color: transparent !important;
                    }

                    &.ant-radio-button-wrapper-checked {
                      &:focus-within {
                        box-shadow: none;
                      }

                      &.ant-radio-button-wrapper-disabled {
                        background-color: @disabledColor !important;
                      }
                    }
                  }
                }

                .showName-slot {
                  &-input {
                    height: 22px;
                    font-size: 12px;
                    color: @primaryTextColor;
                  }
                }
              }
            }

            .item-box {
              opacity: 1;
              display: flex;
              flex-wrap: wrap;
              margin-top: 8px;
              transition: all 0.3s;

              &.fold {
                height: 0;
                opacity: 0;
                margin-top: 0;

                .item-box-item {
                  display: none;
                }
              }

              &-item {
                display: flex;
                margin-right: 24px;
                margin-bottom: 24px;
                flex-direction: column;
                width: calc((100% - 24px) / 2);

                &:nth-child(2n) {
                  margin-right: 0;
                }

                .item-box-label {
                  height: 22px;
                  line-height: 22px;
                  margin-bottom: 4px;
                  color: @primaryTextColor;
                }

                .item-box-input {
                  .ant-select-selection {
                    .ant-select-selection__rendered {
                      .ant-select-selection-selected-value {
                        height: 30px;
                        align-items: center;
                        display: flex !important;

                        .option-img {
                          display: none;
                        }

                        .option-dot {
                          width: 16px;
                          height: 16px;
                          border-radius: 8px;
                          display: inline-block;
                        }
                      }
                    }
                  }

                  .ant-cascader-picker-label {
                    .svg-icon {
                      width: 20px;
                      height: 20px;
                      color: @secondaryTextColor;
                    }
                  }
                }
              }
            }
          }
        }
      }

      .right-show {
        &-canvas {
          height: 200px;
        }

        &-btns {
          height: 52px;
          display: flex;
          padding: 0 24px;
          align-items: center;
          justify-content: flex-end;
          border-top: 1px solid @dividersColor;

          .right-show-btn {
            border: 0;
            color: @secondaryTextColor;

            &:last-child {
              color: @blue;
              margin-left: 8px;
            }
          }
        }
      }
    }
  }
}

.blueprint-details-info-modal {
  .ant-modal-content {
    .ant-modal-header {
      .ant-modal-title {
        font-size: 16px;
        font-weight: 600;
        color: @primaryTextColor;
      }
    }

    .ant-modal-body {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;

      .content-item {
        width: 336px;
        display: flex;

        &:not(:last-child) {
          margin-bottom: 16px;
        }

        &-label {
          width: 80px;
          line-height: 32px;
          color: @primaryTextColor;
        }

        &-input {
          width: calc(100% - 80px);
        }
      }
    }

    .ant-modal-footer {
      padding: 10px 24px;
    }
  }
}

.icon-cascader {
  .ant-cascader-menus-content {
    display: flex;

    .ant-cascader-menu {
      &:nth-child(2) {
        width: 50%;
      }
    }
  }
}

.style-dropdown {
  .ant-select-dropdown-menu {
    display: flex;

    &-item {
      width: calc(100% / 3);

      .option-label {
        display: none;
      }
    }
  }
}

.color-dropdown {
  right: 183px;
  left: auto !important;
  width: 248px !important;

  &.right {
    right: 45px;
  }

  .ant-select-dropdown-menu {
    padding: 4px;
    display: flex;
    flex-wrap: wrap;

    &-item {
      height: 26px;
      padding: 4px;

      .option-dot {
        width: 16px;
        height: 16px;
        border-radius: 8px;
        display: inline-block;
      }
    }
  }
}
</style>
