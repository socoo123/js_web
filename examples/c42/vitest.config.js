export default {
  test: {
    environment: "node", include: ["examples/c42/*.test.js"],
    hookTimeout: 60000, testTimeout: 60000, fileParallelism: false,
  },
};
