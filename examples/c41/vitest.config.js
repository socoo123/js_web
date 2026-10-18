export default {
  test: {
    environment: "node", include: ["examples/c41/*.test.js"],
    hookTimeout: 60000, testTimeout: 60000, fileParallelism: false,
  },
};
