// Node 24 的 node --test 不展开目录参数，而是把目录当模块入口解析到这里；有了它 node --test server/test/ 才能运行。
import './contract.test.mjs';
