<template>
  <div class="layout-container">

    <div class="layout-container-form flex space-between">
      <div class="layout-container-form-handle">
        <el-button type="primary" @click="dialogIsShow=true"> 上传文件</el-button>
        <span style="margin-left: 20px;color: red">*请注意，文件所在目录为 /autotest</span>
      </div>

      <div class="layout-container-form-search">
        <el-select
            style="margin-right: 10px"
            v-model="queryItems.file_type"
            placeholder="请选择文件类型"
            size="small"
            filterable
            @change="changeFileType"
        >
          <el-option v-for="item in fileTypeList" :key="item.key" :label="item.value" :value="item.key"/>
        </el-select>

        <el-button type="primary" @click="getTableDataList()"> 搜索</el-button>
      </div>
    </div>

    <div style="margin: 10px">
      <el-table
          v-loading="tableIsLoading"
          element-loading-text="正在获取数据"
          element-loading-spinner="el-icon-loading"
          :data="tableDataList"
          style="width: 100%"
          stripe
          :height="tableHeight">
        <el-table-column prop="id" label="序号" align="center" min-width="5%">
          <template #default="scope">
            <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="文件名" prop="name" align="center" min-width="40%">
          <template #default="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="文件大小" prop="size" align="center" min-width="10%">
          <template #default="scope">
            <span> {{ scope.row.size }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="最近一次使用时间" prop="lastVisitTime" align="center"
                         min-width="15%">
          <template #default="scope">
            <span>{{ scope.row.lastVisitTime }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="最后一次更新时间" prop="LastModifiedTime" align="center"
                         min-width="15%">
          <template #default="scope">
            <span>{{ scope.row.LastModifiedTime }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" label="操作" width="100">
          <template #default="scope">
            <el-button
                type="text"
                size="small"
                style="margin: 0; padding: 2px"
                :loading="scope.row.downloadLoading"
                @click.native="downloadFile(scope.row)">下载
            </el-button>

            <el-button
                v-show="queryItems.file_type === 'json'"
                type="text"
                size="small"
                style="margin: 0; padding: 2px;color: #fca130"
                @click.native="showRunModelSelector(scope.row.name)">执行
            </el-button>

            <!--            <el-popconfirm :title="`确定删除【${ scope.row.name }】?`" @confirm="deleteData(scope.row)">-->
            <!--              <template #reference>-->
            <!--                <el-button-->
            <!--                    style="margin: 0; padding: 2px;color: red"-->
            <!--                    :loading="scope.row.deleteLoading"-->
            <!--                    type="text"-->
            <!--                    size="small">删除</el-button>-->
            <!--              </template>-->
            <!--            </el-popconfirm>-->
          </template>
        </el-table-column>
      </el-table>

      <pagination
          v-show="tableDataTotal > 0"
          :pageNum="queryItems.page_num"
          :pageSize="queryItems.page_size"
          :total="tableDataTotal"
          @pageFunc="changePagination"
      />
    </div>

    <el-dialog
        title="请选择执行指令"
        v-model="runModelSelectorIsShow"
        :close-on-click-modal="false"
        width="70%"
    >
      <div style="margin: 20px">
        <div style="margin-bottom: 20px">
          <div>
            <el-radio size="large" v-model="command" label="-s">-s: 模拟下单</el-radio>
          </div>
          <div style="margin-left: 20px; color: red">
              需在json文件中指定 1.算法下单文件：cats_stress_test.csv; 2.T0下单文件：cats_stress_test_t0.csv
          </div>
        </div>

        <div style="margin-bottom: 20px">
          <div>
            <el-radio size="large" v-model="command" label="-u">-u 先抢单平仓再shutdown</el-radio>
          </div>
          <div style="margin-left: 20px; color: red">
            <span style="color: red">
              1、先修改batchUpdateAlgo_TLCtrlTask.json的algoInstanceId<br>
              2、可以控制多个algoInstanceId，以及对某个algoInstanceId(篮子)下的所有symbol操作，或是对某个篮子下的一些symbol做操作
            </span>
          </div>
        </div>

        <div style="margin-bottom: 20px">
          <div>
            <el-radio size="large" v-model="command" label="-S">-S shutdown</el-radio>
          </div>
          <div style="margin-left: 20px; color: red">
            <span style="color: red">
              1、若 position 为0, 且 status 为stop, 才可以 shutdown<br>
              2、先修改batchStopAlgo.json的algoInstanceId<br>
              3、可以控制多个algoInstanceId，以及对某个algoInstanceId(篮子)下的所有symbol操作，或是对某个篮子下的一些symbol做操作
            </span>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button
            v-loading="runCommandIsLoading"
            style="float: left"
            size="small"
            type="primary"
            @click="runShellMock">执行
        </el-button>

        <el-button size="small" style="float: right" @click="runModelSelectorIsShow = false">关闭</el-button>
      </div>
    </el-dialog>

    <div>
      <el-dialog
          title="上传文件"
          v-loading="dialogIsLoading"
          v-model="dialogIsShow"
          :close-on-click-modal="false"
          width="50%"
      >
        <div style="margin-bottom: 10px">
          <span style="color: red">*请注意，文件所在目录为 /autotest，请确认json文件中指定csv文件的路径是否正确</span>
        </div>
        <el-upload
            style="margin-bottom: 50px"
            ref="upload"
            multiple
            class="upload-demo"
            :action="uploadShellMockFileUrl"
            :auto-upload="false"
            :on-change="onChange"
            :on-remove="removeFileFromCash"
            :file-list="tempFileList"
        >
          <el-button size="small" type="primary">选择文件</el-button>
        </el-upload>

        <div slot="footer" class="dialog-footer">
          <el-button
              style="float: left"
              v-show="tempFileList.length > 0"
              size="small"
              type="primary"
              @click="submitUpload">上传到服务器
          </el-button>

          <el-button size="small" style="float: right" @click="dialogIsShow = false">关闭</el-button>
        </div>

      </el-dialog>
    </div>

  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount, computed} from "vue";
import Pagination from '@/components/pagination.vue'

import {
  DownloadShellMockFile,
  GetShellMockFileList, RunShellMock,
  UploadShellMockFile,
  uploadShellMockFileUrl
} from "@/api/tools/shell-mock";

const tableIsLoading = ref(false)
const tableDataList = ref([])
const tableDataTotal = ref(0)
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true,
  file_type: 'csv'
})

const dialogIsLoading = ref(false)
const dialogIsShow = ref(false)
const tempFileList = ref([])
const runModelSelectorIsShow = ref(false)
const runCommandIsLoading = ref(false)
const command = ref("-s")
const runFileName = ref("")
const fileTypeList = ref([
  {'key': 'csv', 'value': 'csv / txt文件'},
  {'key': 'json', 'value': 'json文件'}
])

const tableHeight = ref('10px')

const setTableHeight = () => {
  if (window.innerHeight < 800) {  // 小屏
    tableHeight.value = `${window.innerHeight * 0.73}px`
  } else {  // 大屏
    tableHeight.value = `${window.innerHeight * 0.82}px`
  }
}

const handleResize = () => {
  setTableHeight();
}

const changePagination = (pagination: any) => {
  queryItems.value.page_num = pagination.pageNum
  queryItems.value.page_size = pagination.pageSize
  getTableDataList()
}

const downloadFile = (row) => {
  row.downloadLoading = true
  DownloadShellMockFile({file_name: row.name, file_type: queryItems.value.file_type}).then(response => {
    row.downloadLoading = false
    const blob = new Blob([response], {
      type: 'application/vnd.ms-excel' // 将会被放入到blob中的数组内容的MIME类型
    })
    // 保存文件到本地
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob) // 生成一个url
    a.download = row.name
    a.click()
  })
}

const changeFileType = () => {
  queryItems.value.page_num = 1
  queryItems.value.page_size = 20
  getTableDataList()
}

const getTableDataList = () => {
  queryItems.value.file_type = queryItems.value.file_type ? queryItems.value.file_type : 'case'
  tableIsLoading.value = true
  GetShellMockFileList(queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    tableDataTotal.value = response.data.total
  })
}

const onChange = (file: { name: any; }, fileList: any) => {
  // 暂时不做任何操作
  console.log("file", file)
  console.log("fileList", fileList)
  tempFileList.value = fileList
  console.log("tempFileList.value", tempFileList.value)
}

// 从缓存中删除文件
const removeFileFromCash = (file: { name: any; }, fileList: any[], isCover: boolean) => {
  // 从文件列表点x组件会自动删
  // isCover 为 true，则代表用户选择了不覆盖文件，需要执行删除代码
  if (isCover) {
    fileList.splice(fileList.indexOf(file), 1)
  }
  tempFileList.value = fileList
}

// 提交上传的文件到服务器
const submitUpload = () => {
  // 把文件添加到form
  const form = new FormData()
  tempFileList.value.forEach(file => {
    form.append('files', file.raw)
  })

  // 上传form到服务器
  dialogIsLoading.value = true
  UploadShellMockFile(form).then((response) => {
        dialogIsLoading.value = false
        if (response) {
          tempFileList.value = []
          dialogIsShow.value = false
          getTableDataList()
        }
      }
  )
}

const showRunModelSelector = (fileName: string) => {
  command.value = '-s'
  runModelSelectorIsShow.value = true
  runFileName.value = fileName
}

// 执行shell
const runShellMock = (row: { command: string }) => {
  runCommandIsLoading.value = true
  RunShellMock({command: command.value, file_name: runFileName.value}).then((response) => {
    runCommandIsLoading.value = false
    runModelSelectorIsShow.value = false
  })
}

onMounted(() => {
  getTableDataList()
  setTableHeight()
  window.addEventListener('resize', handleResize);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
})

</script>

<style scoped lang="scss">

</style>
