<template>
    <div style="margin-left: 5px">
      <el-tabs v-model="activeTab">

        <div
            v-loading.fullscreen.lock="drawerIsLoading"
            element-loading-text="正在处理中"
            element-loading-spinner="el-icon-loading"
        />

        <el-tab-pane name="case">
          <template #label>
            <span> 用例列表 </span>
            <el-popover class="el_popover_class" placement="top-start" trigger="hover" content="添加用例">
              <template #reference>
                <el-button
                    v-show="queryItems.suite_id"
                    type="text"
                    style="margin-left: 10px"
                    @click="showEditDrawer('add', undefined)"
                ><i style="color: #409EFF" class="iconfont icon-testadd" /></el-button>
              </template>
            </el-popover>
          </template>

          <el-popconfirm width="250px" title="确定删除所选中的测试用例?" @confirm="deleteData(null)">
            <template #reference>
              <el-button
                  :disabled="selectedList.length < 1"
                  type="primary"
                  size="small">批量删除</el-button>
            </template>
          </el-popconfirm>

          <el-button :disabled="selectedList.length < 1" type="primary" size="small" @click="clickRun">批量运行</el-button>

          <el-popconfirm width="350px" title="确定把所选用例状态改为【未调试-不执行】?" @confirm="changeCaseStatus(null, 0)">
            <template #reference>
              <el-button
                  :disabled="selectedList.length < 1"
                  type="primary"
                  size="small">批量改为未调试-不执行</el-button>
            </template>
          </el-popconfirm>

          <el-popconfirm width="350px" title="确定把所选用例状态改为【调试通过-要执行】?" @confirm="changeCaseStatus(null, 1)">
            <template #reference>
              <el-button
                  :disabled="selectedList.length < 1"
                  type="primary"
                  size="small">批量改为调试通过-要执行</el-button>
            </template>
          </el-popconfirm>

          <el-popconfirm width="350px" title="确定把所选用例状态改为【调试通过-不执行】?" @confirm="changeCaseStatus(null, 2)">
            <template #reference>
              <el-button
                  :disabled="selectedList.length < 1"
                  type="primary"
                  size="small">批量改为调试通过-不执行</el-button>
            </template>
          </el-popconfirm>

          <el-popconfirm width="360px" title="确定把所选用例状态改为【调试不通过-不执行】?" @confirm="changeCaseStatus(null, 3)">
            <template #reference>
              <el-button
                  :disabled="selectedList.length < 1"
                  type="primary"
                  size="small">批量改为调试不通过-不执行</el-button>
            </template>
          </el-popconfirm>

          <el-button :disabled="selectedList.length < 1" type="primary" size="small" @click="showChangeCaseParent">修改归属</el-button>

          <el-table
              v-loading="tableIsLoading"
              element-loading-text="正在获取数据"
              element-loading-spinner="el-icon-loading"
              :data="tableDataList"
              style="width: 100%"
              :header-cell-style="{'text-align':'center'}"
              stripe
              row-key="id"
              :height="tableHeight"
              @selection-change="clickSelectAll"
              @row-dblclick="rowDblclick">

            <el-table-column type="selection" min-width="2%"/>

            <el-table-column prop="id" label="序号" align="left" min-width="8%">
              <template #default="scope">
                <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
              </template>
            </el-table-column>

            <el-table-column show-overflow-tooltip prop="name" align="left" label="用例名称" min-width="40%">
              <template #default="scope">
                <span> {{ scope.row.name }} </span>
              </template>
            </el-table-column>

            <el-table-column show-overflow-tooltip prop="desc" align="left" label="详情" min-width="15%">
              <template #default="scope">
                <el-popover
                    trigger="hover"
                    placement="bottom-start"
                    style="margin-right: 10px"
                    popper-class="down-popover"
                    width="1300px"
                >
                    <showCaseDesc
                        :ref="scope.row.id"
                        :case-desc="scope.row.desc"
                        :case-skip-if="scope.row.skip_if"
                        :case-variables="scope.row.variables"
                        :case-extracts="scope.row.output"
                        :project-id="queryItems.project_id"
                    />
                  <template #reference>
                    <span> {{ scope.row.desc || '-' }} </span>
                  </template>
                </el-popover>
              </template>
            </el-table-column>


            <el-table-column show-overflow-tooltip prop="level" align="left" min-width="15%">
              <template #header>
                <span> 用例状态 </span>
                <el-tooltip class="item" effect="dark" placement="top-start">
                  <template #content>
                    <div>1: 批量/定时任务运行时，只有调试结果为 "调试通过-要执行" 的才会执行</div>
                    <div>2: 请务必将用例调试通过后再设为调试通过</div>
                  </template>
                  <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></span>
                </el-tooltip>
              </template>
              <template #default="scope">
                <el-select
                    :ref="`statusSelector${scope.row.id}`"
                    slot="prepend"
                    v-model="scope.row.status"
                    size="small"
                    placeholder="选择用例状态"
                    filterable
                    :class="`case-status-${scope.row.status}`"
                    @change="changeCaseStatus(scope.row)"
                >
                  <el-option label="未调试-不执行" :value="0"><span style="color: #dcdfe6">未调试-不执行</span></el-option>
                  <el-option label="调试通过-要执行" :value="1"><span style="color: #67C23A">调试通过-要执行</span></el-option>
                  <el-option label="调试通过-不执行" :value="2"><span style="color: #909399">调试通过-不执行</span></el-option>
                  <el-option label="调试不通过-不执行" :value="3"><span style="color: #F56C6C">调试不通过-不执行</span></el-option>
                </el-select>
              </template>
            </el-table-column>

            <el-table-column fixed="right" prop="desc" align="center" label="操作" min-width="15%">
              <template #default="scope">
                <el-button type="text" size="small" style="margin: 0; padding: 2px" @click="clickRun(scope.row)">运行</el-button>
                <el-button type="text" size="small" style="margin: 0; padding: 2px" @click="showEditDrawer('edit', scope.row)">修改</el-button>
                <el-popconfirm width="200px" title="复制用例及其步骤?" @confirm="copyCase(scope.row)">
                  <template #reference>
                    <el-button style="margin: 0; padding: 2px" type="text" size="small">复制</el-button>
                  </template>
                </el-popconfirm>
                <el-popconfirm width="300px" :title="`确定删除【${ scope.row.name }】?`" @confirm="deleteData(scope.row)">
                  <template #reference>
                    <el-button style="margin: 0; padding: 2px;color: red" type="text" size="small">删除</el-button>
                  </template>
                </el-popconfirm>
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

        </el-tab-pane>

        <addCaseDrawer :test-type="testType"></addCaseDrawer>
        <EditCaseDrawer :test-type="testType" :project-id="projectId"></EditCaseDrawer>
        <ChangeCaseParentDrawer
            :test-type="testType"
            :project-id="projectId"
            :project-list="projectList"></ChangeCaseParentDrawer>
      </el-tabs>
    </div>

</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount, computed} from "vue";
import Pagination from '@/components/pagination.vue'
import showCaseDesc from './show-desc.vue'
import addCaseDrawer from './add-drawer.vue'
import EditCaseDrawer from './edit-drawer.vue'
import ChangeCaseParentDrawer from './change-case-parent.vue'

import {bus, busEvent} from "@/utils/bus-events";
import {ElMessage} from "element-plus";
import toClipboard from "@/utils/copy-to-memory";
import {GetCaseList, DeleteCase, ChangeCaseSort, ChangeCaseStatus, CopyCase, RunCase} from "@/api/business-api/case";
import Sortable from "sortablejs";

const props = defineProps({
  testType: {
    default: '',
    type: String
  },
  projectId: {
    default: '',
    type: String,
  },
  projectList: {
    default: [],
    type: Array,
  }
})

const triggerFrom = 'case-index'
const tableIsLoading = ref(false)
const drawerIsLoading = ref(false)
const activeTab = ref('case')
const oldIdList = ref([])
const newIdList = ref([])
const tableDataList = ref([])
const selectedList = ref([])
const runCaseIdList = ref([])
const tableDataTotal = ref(0)
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true,
  suite_id: undefined,
  project_id: undefined
})
const tableHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.63}px`
  }else {  // 大屏
    return `${innerHeight * 0.77}px`
  }
})

const rowDblclick = async (row: any, column: any, event: any) => {
  try {
    await toClipboard(row[column.property]);
    ElMessage.success("已复制到粘贴板")
  } catch (e) {
    console.error(e);
  }
}

const changePagination = (pagination: any) => {
  queryItems.value.page_num = pagination.pageNum
  queryItems.value.page_size = pagination.pageSize
  getTableDataList()
}

const clickSelectAll = (val: never[]) => {
  selectedList.value = val
}

const changeCaseStatus = (row: { id: any; status: number; } | null, status: number) => {
  const changeStatus = row ? row.status : status
  drawerIsLoading.value = true
  ChangeCaseStatus(props.testType, {id_list: getSubmitId(row), status: changeStatus}).then(response => {
    drawerIsLoading.value = false
    if (response){
      getTableDataList()
    }
  })
}

const showChangeCaseParent = () => {
  bus.emit(busEvent.drawerIsShow, { eventType: 'change-case-parent', content: getSubmitId(null) })
}

const clickRun = (row) => {
  let tempRunArgs = null
  if (row.id) {
    tempRunArgs = {
      variables: JSON.parse(JSON.stringify(row.variables)),
      headers: row.headers ? JSON.parse(JSON.stringify(row.headers)) : undefined,
      skip_if: JSON.parse(JSON.stringify(row.skip_if)),
      run_times: row.run_times
    }
    runCaseIdList.value = [row.id]
  } else {
    runCaseIdList.value = []
    selectedList.value.forEach(data => {
      runCaseIdList.value.push(data.id)
    })
  }
  bus.emit(busEvent.drawerIsShow, {
    eventType: 'select-run-env',
    triggerFrom: triggerFrom,
    showSelectRunModel: false,
    business_id: null,
    runArgs: tempRunArgs
  })
}

const runCase = (runConf) => {
  RunCase(props.testType, {
    case_id_list: runCaseIdList.value,
    env_list: runConf.runEnv,
    is_async: runConf.runType,
    browser: runConf.browser,
    server_id: runConf.runServer,
    phone_id: runConf.runPhone,
    no_reset: runConf.noReset,
    temp_variables: runConf.temp_variables,
    'trigger_type': 'page'
  }).then(response => {
    if (response) {
      bus.emit(busEvent.drawerIsShow, {
        eventType: 'run-process',
        batch_id: response.data.batch_id,
        report_id: response.data.report_id
      })
    }
  })
}

const getSubmitId = (row: any) => {
  let selectedIdList: any[] = []
  if (row){
    selectedIdList = [row.id]
  }else {
    selectedList.value.forEach(item => { selectedIdList.push(item.id) })
  }
  return selectedIdList
}

const deleteData = (row: any) => {
  drawerIsLoading.value = true
  DeleteCase(props.testType,{id_list: getSubmitId(row)}).then(response => {
    drawerIsLoading.value = false
    if (response){
      getTableDataList()
    }
  })
}

const showEditDrawer = (command: string, row: any) => {
  bus.emit(busEvent.drawerIsShow, {
    eventType: command === 'add' ? 'add-case' : 'edit-case',
    content: row,
    suite_id: queryItems.value.suite_id
  })
}

const copyCase = (row: any) => {
  tableIsLoading.value = true
  CopyCase(props.testType, {id: row.id}).then(response => {
    tableIsLoading.value = false
    if (response){
      getTableDataList()
      showEditDrawer('edit', response.data.case)  // 复制完毕后打开编辑框
    }
  })
}

const getTableDataList = () => {
  tableIsLoading.value = true
  GetCaseList(props.testType, queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    tableDataTotal.value = response.data.total

    oldIdList.value = tableDataList.value.map(item => item.id)
    newIdList.value = oldIdList.value.slice()
  })
}

const sortTable = () => {
  tableIsLoading.value = true
  ChangeCaseSort(props.testType, {
    id_list: newIdList.value,
    page_num: queryItems.value.page_num,
    page_size: queryItems.value.page_size
  }).then(response => {
    tableIsLoading.value = false
    if (response){
      getTableDataList()
    }
  })
}

const setSort = () => {
  let tbody = document.querySelector(".el-table__body-wrapper tbody");
  Sortable.create(tbody, {
    group: { // 相同的组之间可以相互拖拽
      name: "table",
      pull: true,
      put: true,
    },
    animation: 150, // ms, number 单位：ms，定义排序动画的时间
    onEnd(e: any) {
      const targetRow = tableDataList.value.splice(e.oldIndex, 1)[0]
      tableDataList.value.splice(e.newIndex, 0, targetRow)
      const tempIndex = newIdList.value.splice(e.oldIndex, 1)[0]
      newIdList.value.splice(e.newIndex, 0, tempIndex)
      sortTable()
    },
  });
}

onMounted(() => {
  setSort()
  bus.on(busEvent.treeIsChoice, treeIsChoice);
  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.treeIsChoice, treeIsChoice);
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'case-editor') {
    getTableDataList()
  } else if (message.eventType === 'select-run-env' && message.triggerFrom === triggerFrom) {
    runCase(message)
  }
}

const treeIsChoice = (message: any) => {
  if (message.eventType === 'case-suite') {
    queryItems.value.suite_id = message.content.id
    queryItems.value.project_id = message.content.project_id
    queryItems.value.page_num = 1
    queryItems.value.page_size = 20
    getTableDataList()
  }
}

</script>

<style scoped lang="scss">
.case-status-0 :deep(.el-input__wrapper){
  background-color: #dcdfe6;
}

.case-status-1 :deep(.el-input__wrapper){
  background-color: #67C23A;
}

.case-status-2 :deep(.el-input__wrapper){
  background-color: #909399;
}

.case-status-3 :deep(.el-input__wrapper){
  background-color: #F56C6C;
}


</style>
