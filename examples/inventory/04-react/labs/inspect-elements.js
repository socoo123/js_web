import { createElement, isValidElement } from "react";

const element = createElement("h2", { className: "name" }, "机械键盘");
console.log(typeof element);
console.log(element.type);
console.log(element.props.className);
console.log(element.props.children);
console.log(isValidElement(element));
console.log(typeof element.appendChild);
