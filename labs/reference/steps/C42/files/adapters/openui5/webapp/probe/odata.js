// region setup
sap.ui.define(["sap/ui/core/util/MockServer", "sap/ui/model/odata/v2/ODataModel"], (MockServer, ODataModel) => {
  "use strict";
  const local = sap.ui.require.toUrl("course/inventory/localService");
  const serviceUrl = new URL(`${local}/service/`, location.href).pathname;
  const server = new MockServer({ rootUri: serviceUrl });
  MockServer.config({ autoRespond: true, autoRespondAfter: 50 });
  server.simulate(`${local}/metadata.xml`, {
    sMockdataBaseUrl: `${local}/mockdata`, bGenerateMissingMockData: false,
  });
  const requests = [];
  server.attachBefore("GET", (event) => {
    requests.push(event.getParameter("oXhr").url);
    document.querySelector("#requests").textContent = requests.map(decodeURI).join("\n");
  });
  server.start();
  const model = new ODataModel({ serviceUrl, useBatch: false, tokenHandling: false, defaultBindingMode: "OneWay" });
  window.odataProbe = { model, server, requests };
// endregion setup
  // region query
  const result = document.querySelector("#result");
  function read(skip = 0, top = 2) {
    model.read("/Products", {
      urlParameters: {
        "$filter": "stock ge 1 and stock le 5", "$orderby": "stock desc,id asc",
        "$skip": String(skip), "$top": String(top), "$select": "id,name,stock,priceCents",
      },
      success: (data) => {
        result.textContent = data.results.map((p) => `${p.id} ${p.name} ${p.stock}`).join("；")
          + `；本页库存 ${data.results.reduce((sum, p) => sum + p.stock, 0)}`;
      },
      error: (error) => { result.textContent = `读取失败 ${error.statusCode}`; },
    });
  }
  model.attachMetadataFailed(() => { result.textContent = "元数据加载失败"; });
  model.metadataLoaded().then(() => {
    document.querySelector("#query").disabled = document.querySelector("#next").disabled = false;
    document.querySelector("#query").onclick = () => read();
    document.querySelector("#next").onclick = () => read(1, 1);
    read();
  });
});
// endregion query
