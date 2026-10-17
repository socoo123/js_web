import semver from "semver";

console.log(semver.satisfies("7.8.5", "^7.0.0"));
console.log(semver.satisfies("8.0.0", "^7.0.0"));
console.log(semver.satisfies("7.9.0", "~7.8.5"));
console.log(semver.satisfies("0.3.0", "^0.2.3"));
