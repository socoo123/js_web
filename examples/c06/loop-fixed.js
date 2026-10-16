const readers = [];
for (let index = 0; index < 3; index++) {
  readers.push(() => index);
}
for (const read of readers) console.log(read()); // → 0、1、2
