<template>
  <div>
    <el-drawer v-model="drawerIsShow" title="上传元素" size="45%">
      <el-row style="margin-left: 20px;margin-right: 20px">
        <el-col :span="12">
          <el-upload
              class="upload-demo"
              :action="getUploadDir(testType)"
              :show-file-list="false"
              :on-success="uploadFile"
          >
            <el-button size="small" type="primary">选择文件</el-button>
          </el-upload>
        </el-col>

        <el-col :span="12">
          <el-button size="small" type="primary" style="float: right" @click="downloadTemplate">下载模板</el-button>
        </el-col>
      </el-row>

      <template #footer>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" @click="drawerIsShow = false">关闭</el-button>
        </div>
      </template>

    </el-drawer>
  </div>
</template>

<script lang="ts" setup>

import {onBeforeUnmount, onMounted, ref} from "vue";
import {bus, busEvent} from "@/utils/bus-events";
import {DownloadElementTemplate, getUploadDir, UploadElement} from "@/api/business-api/element";

const props = defineProps({
  testType: {
    default: '',
    type: String
  }
})

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'upload-element') {
    pageId.value = message.content
    drawerIsShow.value = true
  }
}

const uploadFile = (response: any, file: { raw: string | Blob; }) =>{
  const form = new FormData()
  form.append('file', file.raw)
  form.append('id', pageId.value)
  UploadElement(props.testType, form).then((response) => {
        if (response) {
          drawerIsShow.value = false
        }
      }
  )
}

const downloadTemplate = () => {
  DownloadElementTemplate(props.testType).then(response => {
    const blob = new Blob([response], {
      type: 'application/vnd.ms-excel' // 将会被放入到blob中的数组内容的MIME类型
    })
    // 保存文件到本地
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob) // 生成一个url
    a.download = '元素导入模板'
    a.click()
  })
}

const drawerIsShow = ref(false)
const pageId = ref()
const submitButtonIsLoading = ref(false)
const sendEvent = () => {
  bus.emit(busEvent.drawerIsCommit, {eventType: 'page-editor'});
}

</script>


<style scoped lang="scss">

</style>
