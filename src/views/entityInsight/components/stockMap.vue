<template>
  <div>
    <div class="stock-graph-header">
      <span class="header-left">{{ eName }}</span>
      <div class="header-right">
        <a-button
          class="header-right-btn"
          @click="shipFullscreen"
          icon="fullscreen"
        >
          全屏
        </a-button>
        <a-button class="header-right-btn" icon="cloud-download">
          保存
        </a-button>
      </div>
    </div>
    <div class="stock-data-chart" id="penetrateChart"></div>
    <a-modal
      class="stock-fullscreen-modal"
      width="100%"
      :visible="showfullscreen"
      :closable="true"
      :destroyOnClose="true"
      @cancel="onCancel"
      :mask="true"
      :centered="true"
      :title="eName"
      :footer="null"
    >
      <div
        ref="fullscreen"
        class="fullscreen-stock-graph"
        id="stock-fullscreen"
      ></div>
      <a-button @click="onRefresh" class="refresh-btn">
        <a-icon type="sync" :spin="loading" /> 刷新
      </a-button>
    </a-modal>
  </div>
</template>

<script>
import * as d3 from "d3";
import { union } from "lodash";
import { getNeighbors } from "@/shared/api/graph.js";
import { Button } from "ant-design-vue";
import { mapState } from "vuex";

export default {
  name: "StockMap",
  props: ["data", "stockData", "pathData"],
  data() {
    return {
      svgw: undefined,
      svgh: undefined,
      layoutTree: "",
      svg: "",
      rootUp: "",
      rootDown: "",
      // 方块形状
      diamonds: {
        w: 145,
        h: 68,
        intervalW: 200,
        intervalH: 150,
      },
      COMPANY: "0",
      PERSON: "1",
      // 源头对象
      originDiamonds: {
        w: 190,
      },
      // 过渡时间
      DURATION: 0,
      // 加减符号半径
      SYMBOLA_S_R: 9,
      count: 0,
      nodeData: {
        children: [],
        name: "",
        parents: [],
      },
      eName: this.data.property.__name || this.data.property.enterprisename,
      showfullscreen: false,
      loading: false,
    };
  },
  mounted() {
    this.nodeData = this.stockData;
    this.init(this.nodeData, this.pathData, "init");
  },
  computed: {
    ...mapState("graphOptions", ["graphId"]),
  },
  watch: {
    pathData(newValue) {
      this.pathData = newValue;
      if (this.showfullscreen) {
        this.init(this.nodeData, this.pathData, "fullscreen");
      } else {
        this.init(this.nodeData, this.pathData, "init");
      }
    },
  },
  components: {
    AButton: Button,
  },
  methods: {
    init(treeData, pathData, type) {
      this.layoutTree = d3
        .tree()
        .nodeSize([this.diamonds.intervalW, this.diamonds.intervalH])
        .separation(() => 1);
      const lastNode = d3.select("#treesvg");
      if (lastNode) {
        lastNode.remove();
      }
      let domId = "";
      if (type === "init") {
        domId = "#penetrateChart";
        this.svgw = document.getElementById("penetrateChart").offsetWidth;
        this.svgh = document.getElementById("penetrateChart").offsetHeight;
      } else {
        this.svgw = document.getElementById("stock-fullscreen").offsetWidth;
        this.svgh = document.getElementById("stock-fullscreen").offsetHeight;
        domId = "#stock-fullscreen";
      }
      this.svg = d3
        .select(domId)
        .append("svg")
        .attr("width", this.svgw)
        .attr("height", this.svgh)
        .attr("id", "treesvg")
        .call(
          d3
            .zoom()
            .scaleExtent([0.5, 2])
            .on("zoom", (d) => {
              // 设置缩放位置以及平移初始位置
              this.svg.attr(
                "transform",
                d.transform.translate(this.svgw / 2, this.svgh / 2)
              );
            })
        )
        .attr("style", "position: relative;z-index: 2;")
        .append("g")
        .attr("id", "g")
        .attr(
          "transform",
          "translate(" + this.svgw / 2 + "," + this.svgh / 2 + ")"
        );
      let upTree = null;
      let downTree = null;
      // 拷贝树的数据
      Object.keys(treeData).map((item) => {
        if (item === "parents") {
          upTree = JSON.parse(JSON.stringify(treeData));
          upTree.children = treeData[item];
          upTree.parents = null;
        } else if (item === "children") {
          downTree = JSON.parse(JSON.stringify(treeData));
          downTree.children = treeData[item];
          downTree.parents = null;
        }
      });
      // hierarchy 返回新的结构 x0,y0初始化起点坐标
      this.rootUp = d3.hierarchy(upTree, (d) => d.children);
      this.rootUp.x0 = 0;
      this.rootUp.y0 = 0;

      this.rootDown = d3.hierarchy(downTree, (d) => d.children);
      this.rootDown.x0 = 0;
      this.rootDown.y0 = 0;
      // 上 和 下 结构
      let treeArr = [
        {
          data: this.rootUp,
          type: "up",
        },
        {
          data: this.rootDown,
          type: "down",
        },
      ];
      treeArr.map((item) => {
        if (item.data.children) {
          this.update(item.data, item.type, item.data, pathData);
        }
      });
    },
    update(source, showtype, sourceTree, pathData) {
      const _that = this;
      if (source.parents === null) {
        source.data.isOpen = !source.data.isOpen;
      }
      let nodes;
      if (showtype === "up") {
        nodes = _that.layoutTree(_that.rootUp).descendants();
      } else {
        nodes = _that.layoutTree(_that.rootDown).descendants();
      }
      let links = nodes.slice(1);
      nodes.forEach((d) => {
        d.y = d.depth * _that.diamonds.intervalH;
      });
      let node = _that.svg
        .selectAll("g.node" + showtype)
        .data(nodes, (d) => d.id || (d.id = showtype + ++_that.count));
      let nodeEnter = node
        .enter()
        .append("g")
        .attr("class", (d) =>
          showtype === "up" && !d.depth ? "hide-node" : "node" + showtype
        )
        .attr("transform", (d) =>
          showtype === "up"
            ? "translate(" + d.x + "," + -d.y + ")"
            : "translate(" + d.x + "," + d.y + ")"
        )
        .attr("opacity", (d) =>
          showtype === "up" && !d.depth
            ? _that.rootDown.data.children.length
              ? 0
              : 1
            : 1
        ); // 拥有下部分则隐藏初始块
      // 创建矩形
      nodeEnter
        .append("rect")
        .attr("type", (d) => d.id)
        .attr("width", (d) =>
          d.depth ? _that.diamonds.w : _that.originDiamonds.w
        )
        .attr("height", (d) => {
          return d.depth
            ? d.data.type === _that.COMPANY
              ? _that.diamonds.h - 25
              : _that.diamonds.h - 25
            : 30;
        })
        .attr("x", (d) =>
          d.depth ? -_that.diamonds.w / 2 : -_that.originDiamonds.w / 2
        )
        .attr("y", (d) =>
          d.depth ? (showtype === "up" ? -_that.diamonds.h / 2 : 0) : -15
        )
        .attr("stroke", () => "#7A9EFF")
        .attr("stroke-width", 1)
        .attr("rx", 5)
        .attr("ry", 5)
        .style("fill", (d) => {
          if (d.data.type === _that.COMPANY || !d.depth) {
            return d._children ? "#fff" : d.depth ? "#fff" : "#7A9EFF";
          } else if (d.data.type === _that.PERSON) {
            return "#F3F9FE";
          }
        });
      // 创建圆 加减
      nodeEnter
        .append("circle")
        .attr("class", "pointer")
        .attr("type", (d) => d.id || (d.id = showtype + "text" + ++_that.count))
        .attr("r", (d) => {
          if (d.data.name === _that.data.property.__name) {
            return 0;
          } else {
            return _that.SYMBOLA_S_R;
          }
        })
        .attr("cy", () =>
          showtype === "up"
            ? -(_that.SYMBOLA_S_R + _that.diamonds.h / 2)
            : _that.diamonds.h / 2 + _that.SYMBOLA_S_R * 2
        )
        .attr("cx", 0)
        .attr("fill", () => "#fff")
        .attr("stroke", () => "#7A9EFF");
      // 持股比例
      nodeEnter
        .append("g")
        .attr("transform", () => "translate(0,0)")
        .append("text")
        .attr("x", (d) => (d.x > 0 ? (showtype === "up" ? -25 : 30) : 30))
        .attr("y", showtype === "up" ? _that.diamonds.h : -20)
        .attr("text-anchor", "middle")
        .attr("fill", () => "#7A9EFF")
        .attr("opacity", (d) => (!d.depth ? 0 : 1))
        .text((d) =>
          showtype === "up"
            ? d.data.scale === 0
              ? "非公示"
              : d.data.Holding === 2
              ? ""
              : d.data.scale + "%"
            : ""
        )
        .style("font-size", "10px")
        .style("font-family", "Microsoft YaHei")
        .style("font-weight", "400");
      nodeEnter
        .append("g")
        .attr("transform", () => "translate(-27,-75)")
        .append("text")
        .attr("x", (d) => (d.x > 0 ? (showtype === "down" ? 30 : 100) : 30))
        .attr("y", showtype === "down" ? _that.diamonds.h : -80)
        .attr("text-anchor", "middle")
        .attr("fill", () => "#7A9EFF")
        .attr("opacity", (d) => (!d.depth ? 0 : 1))
        .text((d) =>
          showtype === "down"
            ? d.data.scale === undefined
              ? ""
              : d.data.Holding === 0
              ? "控股" + "\xa0\xa0\xa0\xa0\xa0\xa0" + d.data.scale + "%"
              : "\xa0\xa0\xa0\xa0\xa0\xa0" + d.data.scale + "%"
            : ""
        )
        .style("font-size", "10px")
        .style("font-family", "Microsoft YaHei")
        .style("font-weight", "400");
      // 公司名称
      // y轴 否表源头的字体距离
      nodeEnter
        .append("text")
        .attr("x", 0)
        .attr("y", (d) => {
          // 如果是上半部分
          if (showtype === "up") {
            // 如果是1层以上
            if (d.depth) {
              return -_that.diamonds.h / 2;
            } else {
              // 如果名字长度大于9个
              if (d.data.name.length > 10) {
                return -5;
              }
              return 0;
            }
          } else {
            if (d.depth) {
              return 0;
            } else {
              if (d.data.name.length > 10) {
                return -5;
              }
              return 0;
            }
          }
        })
        .attr("dy", (d) =>
          d.depth ? (d.data.name.length > 10 ? "1.5em" : "2em") : ".3em"
        )
        .attr("text-anchor", "middle")
        .attr("fill", (d) => (d.depth ? "#465166" : "#fff"))
        .text((d) =>
          d.data.name.length > 10 ? d.data.name.substr(0, 10) : d.data.name
        )
        .style("font-size", "12px")
        .style("font-family", "PingFangSC-Medium")
        .style("font-weight", "800");
      // 名称过长 第二段
      nodeEnter
        .append("text")
        .attr("x", 0)
        .attr("y", (d) => {
          // ? (d.depth ? -diamonds.h / 2 : 0) : 0
          if (showtype === "up") {
            if (d.depth) {
              return -_that.diamonds.h / 2;
            }
            return 9;
          } else {
            if (!d.depth) {
              return 8;
            }
            return 0;
          }
        })
        .attr("dy", (d) => (d.depth ? "3em" : ".3em"))
        .attr("text-anchor", "middle")
        .attr("fill", (d) => (d.depth ? "#465166" : "#fff"))
        .text((d) => {
          // 索引从第19个开始截取有表示超出
          if (d.data.name.substr(19, 1)) {
            return d.data.name.substr(9, 10) + "...";
          }
          return d.data.name.substr(10, 11);
        })
        .style("font-size", "12px")
        .style("font-family", "PingFangSC-Medium")
        .style("font-weight", "800");
      // 认缴金额
      nodeEnter
        .append("text")
        .attr("x", 0)
        .attr("y", showtype === "up" ? -_that.diamonds.h / 2 : 0)
        .attr("dy", (d) =>
          d.data.name.substr(9, d.data.name.length).length ? "5em" : "4em"
        )
        .attr("text-anchor", "middle")
        .attr("fill", (d) => (d.depth ? "#465166" : "#fff"))
        .text((d) =>
          d.data.money
            ? d.data.money === ""
              ? "认缴金额：非公示"
              : `认缴金额：${d.data.money}万元`
            : ""
        )
        .style("font-size", "10px")
        .style("font-family", "PingFangSC-Regular")
        .style("font-weight", "500")
        .style("color", "rgba(70,81,102,1)");
      /*
       * 绘制箭头
       * @param  {string} markerUnits [设置为strokeWidth箭头会随着线的粗细发生变化]
       * @param {string} viewBox 坐标系的区域
       * @param {number} markerWidth,markerHeight 标识的大小
       * @param {string} orient 绘制方向，可设定为：auto（自动确认方向）和 角度值
       * @param {number} stroke-width 箭头宽度
       * @param {string} d 箭头的路径
       * @param {string} fill 箭头颜色
       * @param {string} id resolved0表示公司 resolved1表示个人
       * 直接用一个marker达不到两种颜色都展示的效果
       */
      nodeEnter
        .append("marker")
        .attr("id", showtype + "resolved0")
        .attr("markerUnits", "strokeWidth")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("viewBox", "0 -5 10 10")
        .attr("markerWidth", 12)
        .attr("markerHeight", 12)
        .attr("orient", "90")
        .attr("refX", () => (showtype === "up" ? "-5" : "15"))
        .attr("stroke-width", 2)
        .attr("fill", "#7a9eff")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#7a9eff");
      nodeEnter
        .append("marker")
        .attr("id", showtype + "resolved1")
        .attr("markerUnits", "strokeWidth")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("viewBox", "0 -5 10 10")
        .attr("markerWidth", 12)
        .attr("markerHeight", 12)
        .attr("orient", "90")
        .attr("refX", () => (showtype === "up" ? "-5" : "15"))
        .attr("stroke-width", 2)
        .attr("fill", "#7a9eff")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#7A9EFF");
      // 将节点转换到它们的新位置。
      node
        .transition()
        .duration(_that.DURATION)
        .attr("transform", (d) =>
          showtype === "up"
            ? "translate(" + d.x + "," + -d.y + ")"
            : "translate(" + d.x + "," + d.y + ")"
        );
      // 代表是否展开的+-号,function this指向当前dom
      nodeEnter
        .append("svg:text")
        .attr("type", (d) => d.id || (d.id = showtype + "text" + ++_that.count))
        .attr("class", "stock-pointer")
        .on("click", function (d, node) {
          _that.click(node, showtype, sourceTree, pathData);
          setTimeout(() => {
            if (this.innerHTML === "-") {
              this.innerHTML = "+";
            } else {
              this.innerHTML = "-";
            }
          }, _that.DURATION);
        })
        .attr("x", 0)
        .attr("dy", (d) =>
          d.depth
            ? showtype === "up"
              ? -(_that.SYMBOLA_S_R / 2 + _that.diamonds.h / 2)
              : _that.diamonds.h - 12
            : 0
        )
        .attr("text-anchor", "middle")
        .attr("fill", (d) => (d._children ? "#fff" : "#7A9EFF"))
        .text((d) => (d.data.isOpen ? "-" : "+"));
      // 将退出节点转换到父节点的新位置.
      let nodeExit = node
        .exit()
        .transition()
        .duration(_that.DURATION)
        .attr("transform", () =>
          showtype === "up"
            ? "translate(" + source.x + "," + -source.y + ")"
            : "translate(" + source.x + "," + parseInt(source.y) + ")"
        )
        .remove();
      nodeExit
        .select("rect")
        .attr("width", _that.diamonds.w)
        .attr("height", _that.diamonds.h)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
      // 修改线条
      let link = _that.svg
        .selectAll("path.link" + showtype)
        .data(links, (d) => d.id);
      // 在父级前的位置画线。
      let linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link" + showtype)
        .attr("marker-start", (d) => `url(#${showtype}resolved${d.data.type})`) // 根据箭头标记的id号标记箭头
        .attr("stroke", () => "#7A9EFF")
        .style("fill-opacity", 1)
        .attr("fill", "none")
        .attr("stroke-width", "1px")
        .attr("d", () => {
          let o = {
            x: source.x0,
            y: source.y0,
          };
          return _that.diagonal(o, o, showtype);
        });
      let linkUpdate = linkEnter.merge(link);
      // 过渡更新位置.
      linkUpdate
        .transition()
        .duration(_that.DURATION)
        .attr("d", (d) => _that.diagonal(d, d.parent, showtype));
      // 将退出节点转换到父节点的新位置
      link
        .exit()
        .transition()
        .duration(_that.DURATION)
        .attr("d", () => {
          let o = {
            x: source.x,
            y: source.y,
          };
          return _that.diagonal(o, o, showtype);
        })
        .remove();
      // 隐藏旧位置方面过渡.
      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    },
    diagonal(s, d, showType) {
      let path;
      if (showType === "up") {
        path = `M ${s.x} ${-s.y + 10}
        V ${-s.y + 24 + 50},
        H ${d.x},
        V ${-s.y + 24 + 100},
        L ${d.x} ${-d.y}`;
      } else {
        path = `M ${s.x} ${s.y}
        V ${s.y - 60},
        H ${d.x},
        V ${s.y - 120},
        L ${d.x} ${d.y}`;
      }
      return path;
    },
    async click(source, showType, sourceTree, pathData) {
      // 不是起点才能点
      if (source.children) {
        // 收起
        const newData = {
          vertices: [],
          edges: [],
        };
        const data = {
          vertices: [],
          edges: [],
        };
        const sourceIds = source.children.map((node) => {
          return node.data.id;
        });

        pathData.vertices.map((vertex) => {
          if (
            sourceIds.indexOf(vertex.id) === -1 &&
            newData.vertices.indexOf(vertex) === -1
          ) {
            newData.vertices.push(vertex);
          } else if (
            sourceIds.indexOf(vertex.id) !== -1 &&
            data.vertices.indexOf(vertex) === -1
          ) {
            data.vertices.push(vertex);
          }
        });
        pathData.edges.map((edge) => {
          if (
            sourceIds.indexOf(edge.srcId) === -1 &&
            sourceIds.indexOf(edge.dstId) === -1 &&
            newData.edges.indexOf(edge) === -1
          ) {
            newData.edges.push(edge);
          } else if (
            (sourceIds.indexOf(edge.srcId) !== -1 ||
              sourceIds.indexOf(edge.dstId) !== -1) &&
            data.edges.indexOf(edge) === -1
          ) {
            data.edges.push(edge);
          }
        });
        source._children = source.children;
        source._data = data;
        source.children = null;
        this.update(source, showType, sourceTree, newData);
        // this.$emit("stockPathDataChanged", newData);
      } else if (source._children) {
        // 展开
        const newData = {
          vertices: [],
          edges: [],
        };
        source.children = source._children;
        source._children = null;
        newData.vertices = union(pathData.vertices, source._data.vertices);
        newData.edges = union(pathData.edges, source._data.edges);
        source._data = null;
        // this.$emit("stockPathDataChanged", newData);
        this.update(source, showType, sourceTree, newData);
      } else {
        // 新增展开
        const results = await this.getNodes(source.data.id, showType, pathData);
        let targetArr = [];
        if (results.graphData.length > 0) {
          if (showType === "up") {
            targetArr = this.getTarget(
              this.nodeData.parents,
              source.data.id,
              results.graphData
            );
            this.nodeData.parents = targetArr;
          } else {
            targetArr = this.getTarget(
              this.nodeData.children,
              source.data.id,
              results.graphData
            );
            this.nodeData.children = targetArr;
          }
        } else {
          this.$message.info("暂未查到股权信息");
        }
        if (this.showfullscreen) {
          this.init(this.nodeData, results.pathData, "fullscreen");
        } else {
          this.init(this.nodeData, results.pathData, "init");
        }
      }
    },
    async getNodes(id, type, pathData) {
      const json = {
        branchId: this.graphId,
        commonOnly: false,
        direction: "both",
        edgesFieldsLimitMap: {
          股东_企企: [],
          股东_人企: [],
          对外投资_企企: [],
          对外投资_人企: [],
          实控人_人企: [],
          实控人_企企: [],
        },
        layers: 1,
        nodeTypes: ["企业", "个人"],
        types: "findNeighbor",
        vertexIDs: [id],
      };
      const graphData = await getNeighbors(json);
      const parents = [];
      const children = [];
      const pData = {
        edges: [],
        vertices: [],
      };
      const cData = {
        edges: [],
        vertices: [],
      };
      if (!graphData) {
        this.$message.error("获取关联节点失败");
        return false;
      }
      let edges = [];
      let vertices = [];
      graphData.paths.map((path) => {
        edges = [...edges, ...path.edges];
        vertices = [...vertices, ...path.vertices];
      });
      edges.map((edge) => {
        const scale = edge.property.ratio || edge.property.fundedratio || "";
        if (edge.label === "实控人_人企") {
          const name = [];
          for (let i = 0; i < vertices.length; i++) {
            if (vertices[i].id === edge.dstId) {
              pData.vertices.push(vertices[i]);
              name.push(vertices[i]);
              break;
            }
          }
          if (edge.srcId === id) {
            parents.push({
              money: edge.property.money || "",
              name: name[0].property.__name || name[0].property.name || "",
              id: edge.dstId,
              scale: `${((parseFloat(scale) * 10000) / 100).toFixed(2)}`,
              type: "1",
              Holding: 0,
              children: [],
              isOpen: false,
            });
            pData.edges.push(edge);
          }
        } else if (edge.label === "股东_人企") {
          const name = [];
          for (let i = 0; i < vertices.length; i++) {
            if (vertices[i].id === edge.srcId) {
              pData.vertices.push(vertices[i]);
              name.push(vertices[i]);
              break;
            }
          }
          if (edge.dstId === id) {
            parents.push({
              money: edge.property.money || "",
              name: name[0].property.__name || name[0].property.name || "",
              id: edge.srcId,
              scale: `${((parseFloat(scale) * 10000) / 100).toFixed(2)}`,
              type: "1",
              Holding: 0,
              children: [],
              isOpen: false,
            });
            pData.edges.push(edge);
          }
        } else {
          if (edge.dstId === id) {
            for (let i = 0; i < vertices.length; i++) {
              if (vertices[i].id === edge.srcId) {
                pData.vertices.push(vertices[i]);
                break;
              }
            }
            parents.push({
              money: edge.property.money || "",
              name: edge.property.__srcId || "",
              scale: `${((parseFloat(scale) * 10000) / 100).toFixed(2)}`,
              type: "0",
              Holding: 0,
              children: [],
              id: edge.srcId,
              isOpen: false,
            });
            pData.edges.push(edge);
          } else if (edge.srcId === id) {
            for (let i = 0; i < vertices.length; i++) {
              if (vertices[i].id === edge.dstId) {
                cData.vertices.push(vertices[i]);
                break;
              }
            }
            children.push({
              money: edge.property.money || "",
              name: edge.property.__dstId || "",
              scale: `${((parseFloat(scale) * 10000) / 100).toFixed(2)}`,
              type: "0",
              Holding: 0,
              children: [],
              id: edge.dstId,
              isOpen: false,
            });
            cData.edges.push(edge);
          }
        }
      });
      if (type === "up") {
        const newData = {
          edges: [...pathData.edges, ...pData.edges],
          vertices: [...pathData.vertices, ...pData.vertices],
        };
        this.$emit("stockPathDataChanged", newData);
        return {
          pathData: newData,
          graphData: parents,
        };
      } else {
        const newData = {
          edges: [...pathData.edges, ...cData.edges],
          vertices: [...pathData.vertices, ...cData.vertices],
        };
        this.$emit("stockPathDataChanged", newData);
        return {
          graphData: children,
          pathData: newData,
        };
      }
    },
    getTarget(arr, tid, graphData) {
      for (let i = 0; i < arr.length; i++) {
        if (tid === arr[i].id) {
          arr[i].children = graphData;
          arr[i].isOpen = true;
          break;
        } else if (arr[i].children.length > 0) {
          this.getTarget(arr[i].children, tid, graphData);
        }
      }
      return arr;
    },
    shipFullscreen() {
      this.showfullscreen = true;
      setTimeout(() => {
        this.init(this.nodeData, this.pathData, "fullscreen");
      }, 500);
    },
    onCancel() {
      this.showfullscreen = false;
      this.init(this.nodeData, this.pathData, "init");
    },
    onRefresh() {
      this.init(this.nodeData, this.pathData, "fullscreen");
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 500);
    },
  },
};
</script>

<style lang="less">
.stock-graph-header {
  height: 50px;
  display: flex;
  padding: 0 16px;
  align-items: center;
  background: #fdfdfd;
  border: 1px solid #e4edf4;
  justify-content: space-between;

  .header-left {
    font-size: 16px;
  }

  .header-right {
    &-btn {
      color: @activeFontColor;
      border: none;
      font-size: 16px;
      background: #fdfdfd;

      .anticon {
        font-size: 18px;
      }
    }
  }
}
.stock-data-chart {
  height: 560px;
  border: 1px solid #e4edf4;

  .stock-pointer {
    cursor: pointer;
  }
}
.stock-fullscreen-modal {
  .ant-modal {
    height: 100%;
    padding: 0;

    &-content {
      height: 100%;

      .ant-modal-header {
        .ant-modal-title {
          font-weight: 600;
        }
      }

      .ant-modal-body {
        position: relative;
        height: calc(100% - 55px);

        .fullscreen-stock-graph {
          height: 100%;

          .stock-pointer {
            cursor: pointer;
          }
        }
        .refresh-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
        }
      }
    }
  }
}
</style>
