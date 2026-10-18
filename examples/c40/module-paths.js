const namespace = "course.inventory";
const resourceRoot = new URL("./", "http://localhost:8040/index.html");
const moduleId = "course/inventory/model/findProduct";
const prefix = namespace.replaceAll(".", "/") + "/";
const file = moduleId.slice(prefix.length) + ".js";
console.log(file);
console.log(new URL(file, resourceRoot).pathname);
console.log(new URL("resources/sap-ui-core.js", "https://example.com/js_web/ui5/index.html").pathname);
