import { difference } from "lodash";

const useCiseLayout = (graph, searchVertex) => {
  const cy = graph.cy;
  const initialIds = searchVertex.map((item) => {
    return item.id;
  });
  if (!cy) return;
  const layout = cy.layout({
    name: "cise",
    nodeSeparation: 1,
    idealInterClusterEdgeLengthCoefficient: 20,
    clusters: clusterMaker({
      initialIds,
      cy,
    }),
    stop: () => {},
  });
  layout.run();
};

export default useCiseLayout;

const clusterMaker = ({ initialIds, cy }) => {
  const lowRiskEvent = [];
  const midRiskEvent = [];
  const highRiskEvent = [];
  const equityCompany = [];
  const supplyCompany = [];
  const allArticle = [];
  const allCompany = [];
  const allEvent = [];
  cy.nodes((cyNode) => {
    const id = cyNode.id();
    const nodeType = cyNode.data("nodeType");

    if (!initialIds.includes(id)) {
      switch (nodeType) {
        case "事件":
          allEvent.push(id);
          break;
        case "企业":
          allCompany.push(id);
          break;
        case "文章":
          allArticle.push(id);
          break;
      }
      cyNode.connectedEdges().forEach((cyEdge) => {
        const targetId = cyEdge.data("target");
        const sourceId = cyEdge.data("source");
        if (nodeType === "事件" && initialIds.includes(targetId)) {
          const riskLevel = cyEdge.data("params").get("risk_level");
          if (riskLevel) {
            switch (riskLevel) {
              case "0":
                lowRiskEvent.push(id);
                break;
              case "1":
                midRiskEvent.push(id);
                break;
              case "2":
                highRiskEvent.push(id);
                break;
            }
          }
        } else if (nodeType === "企业" && initialIds.includes(sourceId)) {
          const edgeType = cyEdge.data("nodeType");
          switch (edgeType) {
            case "股东":
              equityCompany.push(id);
              break;
            case "供应":
              supplyCompany.push(id);
              break;
          }
        }
      });
    }
  });

  const restCompany = difference(
    allCompany,
    equityCompany.concat(supplyCompany, initialIds)
  );
  const restEvent = difference(
    allEvent,
    lowRiskEvent.concat(midRiskEvent, highRiskEvent, initialIds)
  );

  const result = [
    initialIds,
    lowRiskEvent,
    midRiskEvent,
    highRiskEvent,
    equityCompany,
    supplyCompany,
    restEvent,
    restCompany,
    allArticle,
  ];

  // console.log(
  //   "分组任务状态",
  //   result.flat().length === cy.nodes().length ? "成功" : "失败"
  // );
  return result;
};
