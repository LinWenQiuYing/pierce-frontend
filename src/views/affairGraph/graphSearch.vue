<template>
  <div class="enterprise-search-wrapper">
    <div class="enterprise-search">
      <SearchOutlined />
      <a-select
        :options="searchOptions"
        class="search-obj"
        :default-value="defaultOptionValue"
        @change="handleChangeOption"
      />
      <a-auto-complete
        placeholder="输入名称或者ID"
        v-model="submitValue"
        :filter-option="false"
        @change="handleSelect"
        class="search-options"
        backfill
      >
        <template slot="dataSource">
          <a-select-option
            v-for="item in filterOption"
            :key="item.value"
            :value="item.label"
            >{{ item.label }}</a-select-option
          >
        </template>
      </a-auto-complete>
      <a-button
        type="primary"
        @click="handleSearch"
        :loading="searchLoading"
        icon="search"
        v-if="userRights.btn_graphSearch"
      >
        搜索
      </a-button>
    </div>
    <div class="download-tips">
      <InfoCircleFilled />
      下载CSV示例文件并填充企业信息; 上传文件不超过2M，仅支持CSV文件
      <br />
      <InfoCircleFilled />
      使用记事本打开CSV文件，"文件"->"另存为"，编码方式选择ANSI，保存完毕后，用EXCEL打开这个文件就不会出现乱码的情况
    </div>

    <div class="progress">
      <div class="progress-item">
        <span class="progress-index">1</span>
        <div>
          <span @click="download" class="download-btn">
            <span v-if="downloadLoading"><LoadingOutlined /></span>
            <span v-else><DownloadOutlined /></span>
            下载csv示例文件
          </span>
          <p>请根据示例文件的格式填写你要批量查询的企业</p>
        </div>
      </div>
      <div class="progress-item">
        <span class="progress-index">2</span>
        上传文件进行查询
      </div>
    </div>

    <a-upload-dragger
      :show-upload-list="false"
      :multiple="false"
      accept=".csv"
      class="graph-search-upload"
      :before-upload="beforeUpLoad"
    >
      <img
        class="upload-icon"
        src="@/assets/images/img/cloud_upload.svg"
        alt=""
      />
      <p>
        <span class="upload-file" v-if="file !== ''">
          {{ file.name }}
          <span class="delete-btn" @click="deleteFile">
            <DeleteOutlined />
          </span>
        </span>
        <span class="upload-file" v-else>点击或将.csv文件拖拽到这里上传</span>
      </p>
      <a-button
        type="primary"
        :loading="uploadLoading"
        @click="confirmSearch"
        v-if="file !== ''"
      >
        确认查询
      </a-button>
      <a-button v-else>开始上传</a-button>
    </a-upload-dragger>
  </div>
</template>
<script>
import { AutoComplete, Button, Upload } from "ant-design-vue";
import {
  SearchOutlined,
  InfoCircleFilled,
  LoadingOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import { searchEntitiesFake, batchUpload } from "@/shared/api/graph.js";
import { downloadSampleFile } from "@/shared/api/configManage.js";
import { dynamicSearch } from "@/shared/api/user.js";
import { downloadFile } from "@/utils/common.js";
import { mapState, mapMutations } from "vuex";
import { find } from "lodash";

const { Dragger } = Upload;

export default {
  name: "GraphSearch",
  data() {
    return {
      searchOptions: [
        {
          label: "全部",
          value: "",
        },
        {
          label: "企业",
          value: 0,
        },
        {
          label: "个人",
          value: 1,
        },
        {
          label: "员工",
          value: 2,
        },
      ],
      defaultOptionValue: "",
      searchLoading: false,
      downloadLoading: false,
      uploadLoading: false,
      file: "",
      submitValue: "",
      filterOption: [],
      timer: null,
    };
  },
  components: {
    AAutoComplete: AutoComplete,
    AButton: Button,
    AUploadDragger: Dragger,
    DeleteOutlined,
    DownloadOutlined,
    InfoCircleFilled,
    LoadingOutlined,
    SearchOutlined,
  },
  computed: {
    ...mapState("graphOptions", ["graphId", "schemaId"]),
    ...mapState("rightsOptions", ["userRights"]),
  },
  mounted() {},
  methods: {
    ...mapMutations("graphOptions", {
      setFirstNode: "setFirstNode",
      setSearchVertex: "setSearchVertex",
      setSearchNames: "setSearchNames",
    }),
    handleChangeOption(value) {
      this.defaultOptionValue = value;
      this.filterOption = [];
      this.submitValue = "";
    },
    handleSelect(value) {
      this.submitValue = value.trim();
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (value.trim() !== "") {
        this.timer = setTimeout(() => {
          this.getCompanyList(value.trim());
        }, 500);
      } else {
        this.options = [];
      }
    },
    async getCompanyList(value) {
      let json = {
        key: value,
      };
      if (this.defaultOptionValue !== "") {
        json.type = this.defaultOptionValue;
      }
      const companyList = await dynamicSearch(json);
      const options = [];
      if (companyList) {
        companyList.map((item) => {
          options.push({
            label: item.name,
            value: item.id,
          });
        });
        this.filterOption = options;
      } else {
        this.$message.error("获取查询对象列表失败");
      }
    },
    handleSearch() {
      const obj = find(this.filterOption, (v) => v.label === this.submitValue);
      const target = obj && obj.value;
      if (this.submitValue && target) {
        const names = [this.submitValue];
        this.onSearch(names);
      } else {
        this.$message.warning("请正确选择查询名称！");
        return false;
      }
    },
    async onSearch(names) {
      if (this.searchLoading) {
        return false;
      }
      try {
        this.setSearchNames(names);
        this.searchLoading = true;
        const json = {
          branchId: this.graphId,
          types: "findVertex",
          names,
          isFuzzy: true,
          limit: 100,
          isFilterNote: false,
        };
        const loading = this.$message.loading("正在查询", 0);
        const res = await searchEntitiesFake(json);
        loading();
        // if (res.message !== "成功") {
        //   this.$message.error(res.message);
        //   return false;
        // }
        const vertex = res.data;
        // if ((vertex && !vertex.length) || !vertex) {
        //   this.$message.error("暂未查询到相应节点");
        //   return false;
        // }
        if (vertex && vertex.length) {
          this.setFirstNode(vertex[0]);
          sessionStorage.setItem("firstNode", JSON.stringify(vertex[0]));
          this.setSearchVertex(vertex);
          sessionStorage.setItem("searchVertex", JSON.stringify(vertex));
        } else {
          this.setFirstNode({});
          sessionStorage.setItem("firstNode", JSON.stringify({}));
          this.setSearchVertex([]);
          sessionStorage.setItem("searchVertex", JSON.stringify([]));
        }
        this.$router.push({
          name: "affairGraphAnalysis",
          params: {
            nodeData: vertex[0],
            isSkip: true,
          },
        });
      } finally {
        this.searchLoading = false;
      }
    },
    async download() {
      const res = await downloadSampleFile();
      if (!res) {
        this.$message.error("获取批量查询示例文件失败");
      } else {
        downloadFile(res, "批量查询示例文件.csv");
      }
    },
    beforeUpLoad(file) {
      if (this.searchLoading) {
        return false;
      }
      if (file.size / Math.pow(1024, 2) < 2) {
        this.file = file;
      } else {
        this.$message.error("上传文件不超过2M，仅支持CSV文件");
      }
      return false;
    },
    deleteFile(event) {
      event.stopPropagation();
      event.preventDefault();
      this.file = "";
    },
    async confirmSearch(event) {
      if (this.searchLoading) {
        return false;
      }
      event.stopPropagation();
      event.preventDefault();
      if (this.file !== "") {
        const formData = new FormData();
        formData.append("branchId", this.graphId);
        formData.append("file", this.file);
        const data = await batchUpload(formData);
        if (data.message === "成功") {
          const names = [];
          data.data.map((name) => {
            names.push(name.customerName);
          });
          this.onSearch(names);
        } else {
          this.$message.error(`上传失败 ${data.message}`);
        }
      }
    },
  },
};
</script>
<style lang="less">
.enterprise-search-wrapper {
  padding: 20px 0;
  margin: 0 auto;
  width: 65%;

  .enterprise-search {
    align-items: center;
    border-radius: 6px;
    border: 1px solid #dee3f0;
    display: flex;
    flex-direction: row;
    padding: 0 6px 0 15px;
    height: 50px;
    width: 100%;

    .anticon-search {
      font-size: 16px;
    }

    .search-options {
      flex: 1;

      .ant-select-selection {
        border: none;
        box-shadow: none !important;

        .ant-select-selection__rendered {
          height: 100%;
        }

        .ant-input {
          border: none;

          &:focus {
            border: none;
            box-shadow: none !important;
          }
        }
      }
    }

    .search-obj {
      width: 125px;

      .ant-select-selection {
        border: none;
        border-right: 1px solid #ddd;
        box-shadow: none !important;

        .ant-select-selection__rendered {
          text-align: center;
          height: 100%;

          .ant-select-selection-selected-value {
            float: none;
          }
        }
      }
    }

    .ant-btn-primary {
      border-radius: 6px;
      font-size: 14px;
      height: 38px;
      width: 86px;
    }
  }

  .ant-input-affix-wrapper {
    border: 1px solid #dee3f0;
    border-radius: 6px;
    padding: 11px 15px;
    z-index: 0 !important;

    .ant-input-prefix {
      color: #7e88ab;
      margin-right: 12px;
    }

    &-focused {
      border: 1px solid @activeFontColor;
      box-shadow: none;
    }
  }

  .download-tips {
    background: #e6f2ff;
    border: 1px solid #83baf9;
    border-radius: 6px;
    color: @activeFontColor;
    padding: 14px 17px;
    margin-top: 20px;

    .anticon {
      margin-right: 8px;
    }
  }

  .progress {
    margin-top: 25px;

    &-item {
      align-items: flex-start;
      display: flex;
      flex-direction: row;

      .progress-index {
        background: #e6f2ff;
        border-radius: 50%;
        color: @activeFontColor;
        display: inline-block;
        height: 24px;
        line-height: 24px;
        text-align: center;
        margin-right: 12px;
        width: 24px;
      }

      .download-btn {
        color: @activeFontColor;
        cursor: pointer;

        .anticon {
          margin-right: 3px;
        }
      }

      p {
        color: #7e88ab;
        margin-bottom: 30px;
      }
    }
  }

  .graph-search-upload {
    .ant-upload-drag {
      background: #fafcff;
      border: 1px dashed #dce3ee;
      margin-top: 15px;
      height: auto;

      .ant-upload-drag-container {
        .upload-icon {
          width: 76px;
        }

        p {
          color: #a8b0ca;
          margin: 10px 0;

          .upload-file {
            color: #485378;
            padding-left: 20px;

            .delete-btn {
              visibility: hidden;
              margin-left: 15px;
            }

            &:hover {
              .delete-btn {
                visibility: visible;
              }
            }
          }
        }
        .ant-btn-primary {
          border-radius: 4px;
          color: #fff;
          height: 36px;
          width: 110px;
        }
      }
    }
  }
}
</style>
