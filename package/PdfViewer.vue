<template>
  <div class="pdf-toolbar">
    <div class="page-jumper">
      <img
        :src="IconArrowDown"
        class="page-prev page-jumper-button"
        title="上一页"
        alt="上一页"
        @click="handlePageJumpPrev"
      />
      <el-input
        v-model.number="pageNumber"
        @keyup.enter="handlePageJump"
      ></el-input>
      / <span>{{ pageTotal }}</span>
      <img
        :src="IconArrowDown"
        class="page-next page-jumper-button"
        title="下一页"
        alt="下一页"
        @click="handlePageJumpNext"
      />
    </div>
    <toolbar-zoom
      :scale="pageScale"
      @zoom-out="handlePageZoomOut"
      @zoom-in="handlePageZoomIn"
      @zoom-change="handlePageZoomChange"
    ></toolbar-zoom>
  </div>
  <div id="thumbnailView"></div>
  <div id="thumbnail-container"></div>
  <div class="pdf-viewer">
    <div ref="containerRef" class="pdf-viewer__container">
      <div className="pdfViewer pdfjs-viewer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import { PDFViewer, EventBus } from "pdfjs-dist/web/pdf_viewer";
import { onMounted, ref, shallowRef, watch, computed, Ref } from "vue";
import "pdfjs-dist/legacy/build/pdf.worker.entry.js";
// @ts-ignore
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// pdfjsLib.GlobalWorkerOptions.workerSrc = window.pdfjsWorker;
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.bootcdn.net/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
import "./styles/pdf_viewer.css";
import { useEventListener, useDebounceFn, useThrottleFn } from "@vueuse/core";

import { ElInput } from "element-plus";
import IconArrowDown from "./assets/images/arrow-down.svg";

import ToolbarZoom from "./components/toolbar-zoom.vue";
import "element-plus/dist/index.css";

const CMAP_URL = "/pdfjs/web/cmaps/";
const DEFAULT_CANVAS_WIDTH = 793;
const pdfObj: any = shallowRef();

const canvasWidth = ref();

const props = defineProps({
  url: {
    type: String,
    default: "",
  },
});

const pageTotal = ref(0);
const pageNumber = ref(1);
const currentValidPage = ref(1);
const handlePageJump = () => {
  if (!pdfObj.value) return;
  if (pageNumber.value < 1 || pageNumber.value > pageTotal.value) {
    pageNumber.value = currentValidPage.value;
    return;
  }
  pageNumber.value = parseInt(pageNumber.value + "");
  pdfObj.value.currentPageNumber = pageNumber.value;
  currentValidPage.value = pageNumber.value;
};
// 跳转上一页
const handlePageJumpPrev = () => {
  pageNumber.value = parseInt(pageNumber.value + "");
  if (pageNumber.value === 1) return;
  pageNumber.value--;
  pdfObj.value.currentPageNumber = pageNumber.value;
  currentValidPage.value = pageNumber.value;
};
// 跳转下一页
const handlePageJumpNext = () => {
  pageNumber.value = parseInt(pageNumber.value + "");
  if (pageNumber.value >= pageTotal.value) return;
  pageNumber.value++;
  pdfObj.value.currentPageNumber = pageNumber.value;
  currentValidPage.value = pageNumber.value;
};

// 监听事件，必须传参 PDFViewer 为实例
const eventBus = new EventBus();
eventBus.on("pagesinit", (e: any) => {
  console.log("pagesinit", e);
  // const canvasWidth = e.source?._pages[0]?.width || DEFAULT_CANVAS_WIDTH;
  // const boxWidth =  pdfObj.value?.container?.clientWidth || document.querySelector('.pdf-viewer')!.clientWidth;
  // const ratio = boxWidth / canvasWidth;
  canvasWidth.value = e.source?._pages[0]?.width;
  pdfObj.value.currentScale = getPageScale(
    e.source?._pages[0]?.width,
    pdfObj.value?.container?.clientWidth,
  );
  // pdfObj.value.currentScale = ratio;
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
eventBus.on("pagesloaded", (e: any) => {
  console.log("pagesloaded");
  console.log(e);
  pageTotal.value = e?.pagesCount || 0;
});
eventBus.on("pagerendered", () => {
  console.log("pagerendered");
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
    l10n: null,
  });
  // console.log('🚀 ~ file: App.vue:46 ~ onMounted ~ pdfViewer:', pdfViewer);
  const loadingTask = pdfjsLib.getDocument({
    url: props.url,
    cMapUrl: CMAP_URL,
    cMapPacked: true,
  });
  const pdf = await loadingTask.promise;
  // getTextFromPDF(pdf);
  console.log(">>>", pdf);
  pdfObj.value.setDocument(pdf);
  console.log(pdfObj.value);
};

/**
 * 获取所有文本
 * @param pdfDoc
 */
function getTextFromPDF(pdfDoc: any) {
  const numPages = pdfDoc.numPages;
  let fullText = "";

  for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
    pdfDoc
      .getPage(pageNumber)
      .then((page) => {
        return page.getTextContent();
      })
      .then((textContent) => {
        const pageText = textContent.items.map((item) => item.str).join(" ");
        console.log(pageText);
        fullText += pageText + "\n";

        // 如果所有页面都处理完成，则输出完整文本
        if (pageNumber === numPages) {
          // console.log(fullText);
        }
      })
      .catch((error) => {
        console.error("Error fetching text content:", error);
      });
  }
}

/**
 * 获取pdf文件缩略图
 * @param pdf
 */
function getPdfThumbnail(pdf: any) {
  const thumbnailContainer = document.getElementById("thumbnail-container");

  for (let pageNum = 1; pageNum <= 5; pageNum++) {
    pdf.getPage(pageNum).then((page) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const viewport = page.getViewport({ scale: 0.5 });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      // 渲染缩略图
      page.render(renderContext).promise.then(() => {
        thumbnailContainer?.appendChild(canvas);
      });
    });
  }
}

/**
 * 页面滚动节流
 */
const throttledScrollHandler = useThrottleFn(() => {
  // 滚动设置回显页数
  pageNumber.value = currentValidPage.value = pdfObj.value.currentPageNumber;
}, 200);

onMounted(() => {
  initPdf();

  if (containerRef.value) {
    containerRef.value?.addEventListener("scroll", throttledScrollHandler);
  }
});

watch(
  () => props.url,
  () => {
    initPdf();
  },
);

const pageScale: Ref<number | string> = ref(1);
/**
 * 页面缩小
 */
const handlePageZoomOut = () => {
  if (!pdfObj.value) return;
  if (pdfObj.value?.currentScale && pdfObj.value?.currentScale > 0.1) {
    pdfObj.value.currentScale = pageScale.value = (
      pdfObj.value.currentScale - 0.1
    ).toFixed(2);
  }
};
/**
 * 页面放大
 */
const handlePageZoomIn = () => {
  if (!pdfObj.value) return;
  if (pdfObj.value?.currentScale) {
    pdfObj.value.currentScale = pageScale.value = (
      pdfObj.value.currentScale + 0.1
    ).toFixed(2);
  }
  console.log(pdfObj.value.currentScale);
};
/**
 * 页面下拉选择缩放比例
 * @param val 缩放数值
 */
const handlePageZoomChange = (val: number) => {
  if (!pdfObj.value) return;
  if (pdfObj.value?.currentScale) {
    pdfObj.value.currentScale = pageScale.value = val;
  }
};

const getPageScale = (canvasWidth: number, boxWidth: number) => {
  canvasWidth = canvasWidth || DEFAULT_CANVAS_WIDTH;
  boxWidth = boxWidth || document.querySelector(".pdf-viewer")!.clientWidth;
  const ratio = boxWidth / canvasWidth;
  return ratio;
};

// useEventListener(window, "resize", () => {
//   handleResize();
// });
// const handleResize = useDebounceFn(() => {
//   pdfObj.value.currentScale = getPageScale(
//     canvasWidth.value,
//     document.querySelector(".pdf-viewer")!.clientWidth,
//   );
// }, 300);
</script>

<style lang="scss" scoped>
.pdf-toolbar {
  background-color: #f9f9fa;
  .page-jumper {
    display: flex;
    align-items: center;
    .page-prev {
      transform: rotate(180deg);
      cursor: pointer;
      margin-right: 8px;
    }
    .page-next {
      cursor: pointer;
      margin-left: 8px;
    }
    :deep(.el-input__inner) {
      width: 40px;
      text-align: right;
      font-size: 16px;
    }
    .page-jumper-button {
      padding: 4px;
      border-radius: 4px;
      &:hover {
        background-color: #dddedf;
      }
    }
  }
}

.pdf-viewer {
  position: relative;
  height: calc(100% - 80px);
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
