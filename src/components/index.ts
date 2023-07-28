import type { App } from 'vue'
import PdfViewer from "./PdfViewer.vue";

// 定义 install 方法
const install = (app: App): void => {
  app.component('pdf', PdfViewer)
}

export {
  PdfViewer
}

const pdf = {
  install
}

export default pdf;
