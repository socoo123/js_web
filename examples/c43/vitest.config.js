export default {
  test: {
    environment: "node", include: ["examples/c43/*.test.js"],
    hookTimeout: 60000, testTimeout: 45000, fileParallelism: false,
  },
};
