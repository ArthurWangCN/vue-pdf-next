<template>
  <div class="pdf-viewer">
    <!-- <div>url={{ url }}</div>
    <div>numPages={{ numPages }}</div> -->
    <div ref="containerRef" class="pdf-viewer__container">
      <div className="pdfViewer pdfjs-viewer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { PDFViewer, EventBus } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import { onMounted, ref, shallowRef, watch } from 'vue';
import 'pdfjs-dist/legacy/build/pdf.worker.entry.js';
// @ts-ignore
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// pdfjsLib.GlobalWorkerOptions.workerSrc = window.pdfjsWorker;
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.bootcdn.net/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'

import { useEventListener, useDebounceFn } from '@vueuse/core';

// const url =
//   'https://res.dafenqi.law/work-wechat-prod/vinci-contract/wp0MYzDwAADLjlKPTLEyv0BLukV7_jMA/20230725/97ad7a60a8de4961889f5321d057ace9.pdf';
// const url =
//   "https://res.dafenqi.law/work-wechat-prod/vinci-contract/wp0MYzDwAADLjlKPTLEyv0BLukV7_jMA/20230725/174a4c9e0dfa42b0bb0641fc1c34d87f.pdf";
// const numPages = ref(1);
const CMAP_URL = '/pdfjs/web/cmaps/';
const DEFAULT_CANVAS_WIDTH = 793;
const pdfObj: any = shallowRef();

const canvasWidth = ref();

const props = defineProps({
  url: {
    type: String,
    default: '',
  },
});

// 监听事件，必须传参 PDFViewer 为实例
const eventBus = new EventBus();
eventBus.on('pagesinit', (e: any) => {
  console.log('pagesinit', e);
  // const canvasWidth = e.source?._pages[0]?.width || DEFAULT_CANVAS_WIDTH;
  // const boxWidth =  pdfObj.value?.container?.clientWidth || document.querySelector('.pdf-viewer')!.clientWidth;
  // const ratio = boxWidth / canvasWidth;
  canvasWidth.value = e.source?._pages[0]?.width;
  pdfObj.value.currentScale = getPageScale(e.source?._pages[0]?.width, pdfObj.value?.container?.clientWidth);
  // pdfObj.value.currentScale = ratio;
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
eventBus.on('pagesloaded', (e: any) => {
  console.log('pagesloaded');
  console.log(e);
});
eventBus.on('pagerendered', () => {
  console.log('pagerendered');
});

const containerRef = ref();

const initPdf = async () => {
  // 创建 PDFViewer
  // const pdfViewer = new PDFViewer({
  pdfObj.value = new PDFViewer({
    container: containerRef.value,
    eventBus,
    // @ts-ignore
    linkService: undefined,
  });
  // console.log('🚀 ~ file: App.vue:46 ~ onMounted ~ pdfViewer:', pdfViewer);
  const loadingTask = pdfjsLib.getDocument({
    url: props.url,
    cMapUrl: CMAP_URL,
    cMapPacked: true,
  });
  const pdf = await loadingTask.promise;
  pdfObj.value.setDocument(pdf);
  console.log(pdfObj.value);
};

onMounted(() => {
  initPdf();
});

watch(
  () => props.url,
  () => {
    initPdf();
  },
);

const getPageScale = (canvasWidth: number, boxWidth: number) => {
  canvasWidth = canvasWidth || DEFAULT_CANVAS_WIDTH;
  boxWidth = boxWidth || document.querySelector('.pdf-viewer')!.clientWidth;
  const ratio = boxWidth / canvasWidth;
  return ratio;
};

useEventListener(window, 'resize', () => {
  handleResize();
});
const handleResize = useDebounceFn(() => {
  pdfObj.value.currentScale = getPageScale(canvasWidth.value, document.querySelector('.pdf-viewer')!.clientWidth);
}, 300);
</script>

<style>
.pdf-viewer {
  position: relative;
  height: 100%;
}

.pdf-viewer__container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: scroll;
  height: 100%;
}
.pdfjs-viewer .page {
  /* width: 100% !important; */
  border: none;
  margin: 1px auto 1px;
}
</style>
