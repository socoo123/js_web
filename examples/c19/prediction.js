const manifest = {
  packageManager: "yarn@4.18.1",
  scripts: { report: "node report.js" },
  dependencies: { "wrap-ansi": "7.0.0" },
};
console.log(manifest.packageManager.split("@")[0]);
console.log(manifest.scripts.report.split(" ")[0]);
console.log(Object.hasOwn(manifest.dependencies, "string-width"));
