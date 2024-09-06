<template>
  <div class="template-manage">
    <List
      v-if="isListShow"
      ref="templateList"
      @detailsChanged="detailsChanged"
      @modelDetailsChanged="modelDetailsChanged"
      @isListShowChanged="isListShowChanged"
      @detailsTypeChanged="detailsTypeChanged"
      @isDetailsShowChanged="isDetailsShowChanged"
      @addModelShowChange="addModelShowChange"
      @handleCreateModel="handleCreateModel"
    />
    <Details
      v-if="isDetailsShow"
      :details="details"
      :detailsType="detailsType"
      @detailsChanged="detailsChanged"
      @isListShowChanged="isListShowChanged"
      @isDetailsShowChanged="isDetailsShowChanged"
      @handleCreateModel="handleCreateModel"
    />
    <AddModel
      v-if="addModelShow"
      parentType="template"
      :isSkiped="isSkiped"
      :details="modelDetails"
      :detailsType="detailsType"
      :categoryOptions="categoryOptions"
      @modelDetailsChanged="modelDetailsChanged"
      @addModelShowChange="addModelShowChange"
      @getCategoryList="getCategoryList"
      @detailsChanged="detailsChanged"
      @isSkipedChanged="isSkipedChanged"
      ref="addModel"
    />
    <!-- <div class="template-manage-success" v-if="isSuccessShow">
      <div class="success-img">
        <img src="@/assets/images/img/success.jpg" alt="" />
      </div>
      <p class="title" v-if="detailsType === 'add'">模板创建成功</p>
      <p class="title" v-if="detailsType === 'edit'">模板修改成功</p>
      <p class="subtitle" v-if="detailsType === 'add'">
        模板已经成功创建，你可以选择在此模板上新建模型；或者可以选择返回模板列表
      </p>
      <p class="subtitle" v-if="detailsType === 'edit'">
        模板已经修改创建，你可以选择在此模板上新建模型；或者可以选择返回模板列表！
      </p>
      <div class="success-btns">
        <a-button type="primary" @click="handleCreateModel(details)">
          新建模型
        </a-button>
        <a-button @click="handleReturn"> 返回模板列表 </a-button>
      </div>
    </div> -->
  </div>
</template>
<script>
import AddModel from "../modelsManage/addModel";
import Details from "./details";
import List from "./list";
// import { Button } from "ant-design-vue";
import { getCategoryList } from "@/shared/api/configManage.js";

export default {
  name: "GraphsManage",
  data() {
    return {
      details: {
        id: undefined,
        name: undefined,
        desc: undefined,
        data: [],
        schemaId: undefined,
        templateScript: undefined,
        createType: 2,
      },
      isListShow: true,
      isDetailsShow: false,
      isSuccessShow: false,
      detailsType: "",
      addModelShow: false,
      modelDetails: {},
      categoryOptions: [],
      isSkiped: false, // 是否是模板跳转过来的
    };
  },
  components: {
    // AButton: Button,
    AddModel,
    Details,
    List,
  },
  methods: {
    detailsChanged(value) {
      this.details = value;
    },
    modelDetailsChanged(value) {
      this.modelDetails = value;
    },
    isListShowChanged(value, isSearch) {
      this.isListShow = value;
      if (isSearch) {
        this.$nextTick(() => {
          this.$refs.templateList.onSearch("init");
        });
      }
    },
    isDetailsShowChanged(value) {
      this.isDetailsShow = value;
    },
    // isSuccessShowChanged(value) {
    //   this.isSuccessShow = value;
    // },
    detailsTypeChanged(value) {
      this.detailsType = value;
      this.isSkiped = true;
    },
    onDrawerClose() {
      this.drawerVisible = false;
    },
    handleCreateModel(record) {
      // return false;
      this.addModelShowChange(
        true,
        record.id,
        record.name,
        record.createType,
        record.schemaId
      );
    },
    handleReturn() {
      // this.isSuccessShowChanged(false);
      this.isListShowChanged(true);
      this.$nextTick(() => {
        this.$refs.templateList.onSearch("init");
      });
    },
    addModelShowChange(value, templateId, templateName, createType, schemaId) {
      this.modelDetails = {
        id: undefined,
        name: undefined,
        createType,
        desc: undefined,
        template: {
          schemaId,
        },
        templateId,
        templateName,
        categoryId: undefined,
        status: undefined,
      };
      this.addModelShow = value;
      this.isListShow = !value;
      this.detailsType = "add";
      this.isSkiped = true;
    },
    async getCategoryList() {
      const listData = await getCategoryList(2);
      const categoryOptions = [];
      if (listData && listData.length) {
        listData.map((item) => {
          if (item.diff === 1) {
            categoryOptions.push({
              value: item.id,
              label: item.categoryName,
            });
          }
          item.children.map((ele) => {
            categoryOptions.push({
              value: ele.id,
              label: ele.categoryName,
            });
          });
        });
        this.categoryOptions = categoryOptions;
      } else if (listData && !listData.length) {
        this.$message.info("暂无模型分类，请先添加！");
      } else {
        this.$message.error("获取模型分类失败");
      }
    },
    isSkipedChanged(value) {
      this.isSkiped = value;
    },
  },
};
</script>
<style lang="less">
.template-manage {
  height: 100%;
  border-radius: 5px;

  &-success {
    text-align: center;
    padding: 100px 0 24px;
    height: 100%;
    background: #fff;

    .success-img {
      width: 70px;
      height: 70px;
      margin: 0 auto;
      margin-bottom: 30px;
    }

    .title {
      font-size: 20px;
      font-weight: 600;
      line-height: 28px;
      margin-bottom: 5px;
      color: @primaryTextColor;
    }

    .subtitle {
      width: 425px;
      margin: 0 auto;
      font-size: 14px;
      line-height: 22px;
      margin-bottom: 24px;
      color: @secondaryTextColor;
    }

    .success-btns {
      .ant-btn {
        &:first-child {
          margin-right: 10px;
        }
      }
    }
  }
}

.check-drawer {
  .ant-drawer-wrapper-body {
    .ant-drawer-header {
      .ant-drawer-title {
        font-size: 20px;
        font-weight: 600;
      }
    }

    .ant-drawer-body {
      .check-drawer-item {
        display: flex;
        margin-bottom: 16px;
        justify-content: space-between;

        &-label {
          width: 75px;
        }

        &-content {
          color: #949dad;
          width: calc(100% - 80px);

          .desc-content {
            height: 190px;
            padding: 12px;
            border: 1px solid #e6e6e6;
            border-radius: 5px;
          }

          .rules-item {
            color: @activeFontColor;
            margin-bottom: 10px;

            &.no-apply {
              color: #949dad;
            }
          }
        }
      }
    }
  }
}
</style>
