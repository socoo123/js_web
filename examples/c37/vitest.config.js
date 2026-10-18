// 在仓库根运行，复用阶段 4 的测试运行器，不安装新依赖。
export default {
  test: { globals: true, environment: "node", include: ["examples/c37/*.test.js"] },
};
