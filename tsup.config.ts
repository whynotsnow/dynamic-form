import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/exports.ts"], // 入口文件
  format: ["cjs", "esm"], // 输出 CommonJS + ESModule
  dts: true, // 生成类型声明文件
  sourcemap: true, // 方便调试
  clean: true, // 每次打包清理 dist
  minify: true, // 压缩
  external: ["react", "react-dom", "antd"], // 不打包 peerDependencies
});
