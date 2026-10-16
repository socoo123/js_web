"use strict";
function readThis() {
  return this;
}
console.log(readThis()); // → undefined
