<template>
  <div>
    <div v-show="showErrorMsg" style="color: red; margin: 15px">* 语法错误，请检查!</div>
    <el-button
        type="primary"
        size="small"
        :disabled="showErrorMsg"
        style="margin-left:20px; float: right"
        @click="formatDataToJson()"
    >格式化
    </el-button>
    <v-ace-editor
        ref="jsonEditorRef"
        v-model:value="tempData"
        lang="json5"
        :theme="aceConfig.theme"
        :options="aceConfig.options"
        :readonly="aceConfig.readOnly"
        :style="{height: tableHeight}"
    />
  </div>
</template>

<script setup lang="ts">
import {reactive, ref, watch} from 'vue'
import {VAceEditor} from "vue3-ace-editor";
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/theme-chrome';
import {ElMessage} from "element-plus";

const aceConfig = reactive({
  theme: 'chrome', //主题
  readOnly: false, //是否只读
  options: {
    enableBasicAutocompletion: true,  // 启动代码补全功能
    enableSnippets: true,  // 启动代码段
    enableLiveAutocompletion: true,  // 启用实时自动完成
    tabSize: 2,
    showPrintMargin: false, // 去除编辑器里的竖线
    fontSize: 16,
    useWorker: true // 使用 web worker 进行语法检查
  }
})
const tempData = ref('{}')
const showErrorMsg = ref(false)
const props = defineProps({
  jsonData: {
    default: '{}',
    type: String
  }
})
const jsonEditorRef = ref(null)
const tableHeight = localStorage.getItem('tableHeight')
watch(() => props.jsonData, (newValue, oldValue) => {
  tempData.value = JSON.stringify(newValue, null, 4)
})

watch(() => tempData.value, (newValue, oldValue) => {
  if (newValue){
    try {
      JSON.parse(newValue)
      showErrorMsg.value = false
    }catch (e) {
      showErrorMsg.value = true
    }
  }
})

const formatDataToJson = () => {
  tempData.value = JSON.stringify(JSON.parse(tempData.value), null, 4)
}

const getJsonData = () => {
  try {
    return JSON.parse(tempData.value)
  }catch (e) {
    ElMessage.warning('json数据格式错误')
    throw new Error('json数据格式错误')
  }
}

defineExpose({
  tempData, getJsonData
})

</script>

<style scoped lang="scss">

</style>
