<template>
  <div class="zoom-wrapper">
    <span class="zoom-button" @click="handleZoomOut">
      <img :src="IconMinus" title="缩小" alt="缩小" />
    </span>
    <span class="zoom-button" @click="handleZoomIn">
      <img :src="IconAdd" title="放大" alt="放大" />
    </span>
    <el-select
      v-model="zoomValueFormat"
      placeholder="请选择"
      @change="handleZoomChange"
    >
      <el-option
        v-for="item in zoomOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
      </el-option>
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import IconAdd from "../assets/images/add.svg";
import IconMinus from "../assets/images/minus.svg";
import { ElSelect, ElOption } from "element-plus";

const props = defineProps({
  scale: {
    type: Number,
    default: 1,
  },
});
const emits = defineEmits(["zoomOut", "zoomIn", "zoomChange"]);

const zoomValue = ref(1);
const zoomOptions = ref([
  // {
  //   label: "自动缩放",
  //   value: "Automatic Zoom",
  // },
  {
    label: "50%",
    value: 0.5,
  },
  {
    label: "100%",
    value: 1,
  },
  {
    label: "200%",
    value: 2,
  },
]);

const zoomValueFormat = computed(() => {
  return `${(zoomValue.value * 100).toFixed(0)}%`;
});

// 页面缩小
const handleZoomOut = () => {
  emits("zoomOut");
};

// 页面放大
const handleZoomIn = () => {
  emits("zoomIn");
};

const handleZoomChange = (val) => {
  console.log("??", val);
  emits("zoomChange", val);
};

watch(
  () => props.scale,
  (val) => {
    const number = (Math.round(val * 10) / 10).toFixed(2);
    zoomValue.value = number;
  },
);
</script>

<style lang="scss" scoped>
.zoom-wrapper {
  .zoom-button {
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    &:hover {
      background-color: #dddedf;
    }
  }
}
</style>
