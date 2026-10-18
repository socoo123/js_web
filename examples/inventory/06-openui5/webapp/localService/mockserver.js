sap.ui.define(["sap/ui/core/util/MockServer"], (MockServer) => {
  "use strict";
  return {
    start() {
      const local = sap.ui.require.toUrl("course/inventory/localService");
      const serviceUrl = new URL(`${local}/service/`, window.location.href).pathname;
      const server = new MockServer({ rootUri: serviceUrl });
      MockServer.config({ autoRespond: true, autoRespondAfter: 200 });
      server.simulate(`${local}/metadata.xml`, {
        sMockdataBaseUrl: `${local}/mockdata`, bGenerateMissingMockData: false,
      });
      server.start();
      return { server, serviceUrl };
    },
  };
});
