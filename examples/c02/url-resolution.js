const pageUrl = "http://127.0.0.1:8000/c02-lab/index.html";
console.log(new URL("./app.js", pageUrl).href);
console.log(new URL("/app.js", pageUrl).href);
