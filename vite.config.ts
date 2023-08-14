import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import copyPlugin from "rollup-plugin-copy";
import libCss from "vite-plugin-libcss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    libCss(),
    copyPlugin({
      targets: [{ src: "types/*", dest: "public" }], // 将文件复制到 public 目录下, vite会自动复制到dist目录
    }),
  ],
  build: {
    lib: {
      // 构建为库。如果指定了 build.lib，build.cssCodeSplit 会默认为 false。
      // __dirname的值是vite.config.ts文件所在目录
      entry: resolve(__dirname, "package/index.ts"), // entry是必需的，因为库不能使用HTML作为入口。
      name: "pdf", // 暴露的全局变量
      fileName: "vue-pdf-next", // 输出的包文件名，默认是package.json的name选项
    },
    rollupOptions: {
      // 自定义底层的Rollup打包配置
      // https://rollupjs.org/configuration-options/
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["vue"],
      output: {
        // format: 'es', // 默认es，可选 'amd' 'cjs' 'es' 'iife' 'umd' 'system'
        exports: "named", // https://rollupjs.org/configuration-options/#output-exports
        //   // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
