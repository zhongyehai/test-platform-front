<template>
  <div>
    <el-drawer v-model="drawerIsShow" title="上传用例集文件" size="60%">

      <div
          v-loading.fullscreen.lock="drawerIsLoading"
          element-loading-text="正在处理中"
          element-loading-spinner="el-icon-loading"
      />

      <div style="margin-left: 10px;margin-right: 10px">
        <div style="margin-bottom: 10px">
          1、<span style="color: red;font-size: 38px">只支持XMind8版本</span> <a href="https://xmind.cn/download/xmind8/" target="_blank" style="color: #3a8ee6">去下载</a><br>
          2、必须<span style="color: red;">按照模板填写内容</span><br>
          3、导入后，<span style="color: red;">默认类型为流程用例集</span>，若要修改为其他类型，<span style="color: red;">只需修改一级用例集即可</span>，子用例集会跟随修改
        </div>

        <el-row>
          <el-col :span="12" style="margin-bottom: 10px">
            <el-upload
                class="upload-demo"
                :action="getUploadDir(testType)"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="uploadFile"
            >
              <el-button size="small" type="primary">选择 xmind 文件</el-button>
            </el-upload>
          </el-col>

          <el-col :span="12" style="margin-bottom: 10px">
            <el-button size="small" type="primary" style="float: right" @click="downloadTemplate">下载导入模板</el-button>
          </el-col>
        </el-row>
        <!-- 示例图片 -->
        <el-image src="/images/uploadCase.jpg" />

        <div v-if="uploadFailTotal > 0">
          <span>共失败 {{ uploadFailTotal }}条</span>
          {{ uploadFailList }}
        </div>
      </div>

<!--      <template #footer>-->
<!--        <div slot="footer" class="dialog-footer">-->
<!--          <el-button size="small" @click="drawerIsShow = false">关闭</el-button>-->
<!--        </div>-->
<!--      </template>-->

    </el-drawer>
  </div>
</template>

<script lang="ts" setup>

import {onBeforeUnmount, onMounted, ref} from "vue";
import {DownloadSuiteTemplate, UploadCaseSuite} from "@/api/business-api/case-suite";
import {bus, busEvent} from "@/utils/bus-events";
import {getUploadDir} from "@/api/business-api/case-suite";

const props = defineProps({
  testType: {
    default: '',
    type: String,
  }
})

const uploadHeaders =  { 'access-token': localStorage.getItem('access-token') }
const uploadFailList = ref([])
const uploadFailTotal = ref(0)
const projectId = ref()
const drawerIsShow = ref(false)
const drawerIsLoading = ref(false)
let submitButtonIsLoading = ref(false)


onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'upload-case-suite') {
    uploadFailList.value = []
    uploadFailTotal.value = 0
    projectId.value = message.content.project_id
    drawerIsShow.value = true
  }
}


const downloadTemplate = () => {
  DownloadSuiteTemplate(props.testType).then(response => {
    const blob = new Blob([response], { type: 'application/vnd.xmind.workbook' })
    // 保存文件到本地
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob) // 生成一个url
    a.download = '用例集导入模板.xmind'
    a.click()
  })
}

const uploadFile = (response: any, file: { raw: string | Blob; }) => {
  const form = new FormData()
  form.append('project_id', projectId.value)
  form.append('file', file.raw)

  drawerIsLoading.value = true
  UploadCaseSuite(props.testType, form).then((response) => {
    drawerIsLoading.value = false
    bus.emit(busEvent.drawerIsCommit, {eventType: 'upload-case-suite'});
    uploadFailList.value = response.data.suite.fail.data
    uploadFailTotal.value = response.data.suite.fail.total
  })
}

</script>


<style scoped lang="scss">

</style>
