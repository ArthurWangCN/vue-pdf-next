<script setup lang="ts">
import { ref } from "vue";
import pdf from "../package/index";
// import pdf from '../dist/vue-pdf-next.js';
// import pdf from 'vue-pdf-next';

// const url = ref('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf');
const url = ref("https://arkokoley.github.io/pdfvuer/nationStates.pdf");

console.log(pdf);
</script>

<template>
  <div style="width: 100vw; height: 100vh">
    <pdf :url="url"></pdf>
  </div>
</template>

<style scoped></style>
