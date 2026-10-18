const url = new URL("localService/service/Products", "http://localhost:8040/js_web/ui5/");
url.searchParams.set("$filter", "stock ge 1 and stock le 5");
url.searchParams.set("$orderby", "stock desc,id asc");
url.searchParams.set("$top", "2");
url.searchParams.set("$select", "id,name,stock,priceCents");
console.log(url.pathname); // → /js_web/ui5/localService/service/Products
console.log(url.searchParams.get("$filter")); // → stock ge 1 and stock le 5
console.log(url.searchParams.get("$orderby")); // → stock desc,id asc
console.log(url.searchParams.get("$top")); // → 2
