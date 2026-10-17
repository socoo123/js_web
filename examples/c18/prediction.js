const manifest = {
  version: "0.1.0",
  devDependencies: { semver: "^7.0.0" },
};
const locked = { version: "7.8.5" };

console.log(manifest.version);
console.log(manifest.devDependencies.semver);
console.log(locked.version);
console.log(manifest.devDependencies.semver === locked.version);
