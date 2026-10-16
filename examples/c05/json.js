const jsonText = '{"id":"P001","stock":12}';
const parsed = JSON.parse(jsonText);
console.log(typeof jsonText, typeof parsed, parsed.stock); // → string object 12
console.log(JSON.stringify(parsed)); // → {"id":"P001","stock":12}
console.log(JSON.parse("null")); // → null
try {
  JSON.parse('{"stock":12,}');
} catch (error) {
  console.log(error.name); // → SyntaxError
}
