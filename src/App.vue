<script setup lang="ts">
import { ref } from 'vue'
// import pdf from '../package/index';
import pdf from 'vue-pdf-next';

const url = ref('https://res.dafenqi.law/work-wechat-prod/vinci-contract/wp0MYzDwAADLjlKPTLEyv0BLukV7_jMA/20230725/97ad7a60a8de4961889f5321d057ace9.pdf')

console.log(pdf)
</script>

<template>
  <div style="width: 100VW; height: 100vh;">
    <pdf
      :url="url"
    ></pdf>
  </div>
</template>

<style scoped>
</style>
