<script setup lang="ts">
import { ref } from 'vue'
import PdfViewer from './components/PdfViewer.vue';

defineProps<{ msg: string }>()

const url = ref('https://res.dafenqi.law/work-wechat-prod/vinci-contract/wp0MYzDwAADLjlKPTLEyv0BLukV7_jMA/20230725/97ad7a60a8de4961889f5321d057ace9.pdf')
</script>

<template>
  <div style="width: 100VW; height: 100vh;">
    <PdfViewer
      :url="url"
    ></PdfViewer>
  </div>
</template>

<style scoped>
</style>
