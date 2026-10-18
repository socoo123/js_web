export default {
  test: {
    environment: "node", include: ["examples/c40/*.test.js"],
    hookTimeout: 60000, testTimeout: 60000, fileParallelism: false,
  },
};
