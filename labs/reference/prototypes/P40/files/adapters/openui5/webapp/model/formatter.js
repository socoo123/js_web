sap.ui.define([], () => {
  "use strict";
  return {
    money(cents) {
      if (!Number.isSafeInteger(cents)) return "";
      return `${Math.trunc(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
    },
  };
});
