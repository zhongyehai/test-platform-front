<template>
  <div class="layout-container">
    <div>
      <el-row>
        <el-col :xs="4" :sm="3" :md="4" :lg="5" :xl="5" style="border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
          <el-tabs v-model="projectTab" style="margin-left: 10px">
            <el-tab-pane name="project">
              <template #label>
                <span> {{ `${testType === 'api' ? '服务' : testType === 'ui' ? '项目' : 'app'}列表` }} </span>
              </template>
              <el-input v-model="filterText" placeholder="输入关键字进行过滤"/>
              <el-scrollbar :style="{height: treeHeight}">
                <el-tree
                    ref="projectTreeRef"
                    class="filter-tree"
                    :data="projectDataList"
                    :props="defaultProps"
                    :filter-node-method="filterNode"
                    node-key="id"
                    @node-click="clickTree"
                    highlight-current
                >
                  <template #default="{ node, data }">
                    <div class="custom-tree-node">
                      <span>{{ node.label }}</span>
                    </div>
                  </template>
                </el-tree>
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
        </el-col>

        <el-col :xs="20" :sm="21" :md="20" :lg="19" :xl="19">
          <div style="margin-left: 5px">
            <el-tabs v-model="taskTab">
              <el-tab-pane name="task">
                <template #label>
                  <span> 任务列表 </span>
                  <el-popover class="el_popover_class" placement="top-start" trigger="hover" content="添加任务">
                    <template #reference>
                      <el-button
                          v-show="queryItems.project_id"
                          type="text"
                          style="margin-left: 10px"
                          @click="showEditDrawer(undefined)"
                      ><i style="color: #409EFF" class="iconfont icon-testadd"/></el-button>
                    </template>
                  </el-popover>
                </template>

                <el-table
                    v-loading="tableIsLoading"
                    element-loading-text="正在获取数据"
                    element-loading-spinner="el-icon-loading"
                    :data="tableDataList"
                    stripe
                    :height="tableHeight"
                    @row-dblclick="rowDblclick">

                  <el-table-column prop="id" label="序号" align="center" min-width="7%">
                    <template #default="scope">
                      <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column show-overflow-tooltip prop="name" align="center" label="任务名称" min-width="25%">
                    <template #default="scope">
                      <span> {{ scope.row.name }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column show-overflow-tooltip prop="cron" label="cron表达式" align="center" min-width="30%">
                    <template #default="scope">
                      <span> {{ scope.row.cron }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column show-overflow-tooltip prop="skip_holiday" label="节假日/调休日" align="center"
                                   min-width="15%">
                    <template #default="scope">
                      <span> {{ scope.row.skip_holiday === 1 ? "跳过" : "不跳过" }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column prop="merge_notify" label="合并通知" align="center" min-width="15%">
                    <template #header>
                      <span>合并通知</span>
                      <el-tooltip class="item" effect="dark" placement="top-start">
                        <template #content>
                          <div>1、不合并通知：达到触发发送通知的条件时，每个环境都会发一份通知</div>
                          <div>2、合并通知：达到触发发送通知的条件时，汇总每个环境的通知，只通知一次</div>
                          <div>注：当选择了多个环境时，才会出现此选项</div>
                        </template>
                        <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill"/></span>
                      </el-tooltip>
                    </template>
                    <template #default="scope">
                      <span> {{ scope.row.merge_notify === 1 ? "合并" : "不合并" }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column prop="status" align="center" min-width="15%">
                    <template #header>
                      <span>是否启用</span>
                      <el-tooltip class="item" effect="dark" placement="top-start">
                        <template #content>
                          <div>1: 启用中的任务才会定时执行</div>
                          <div>2: 禁用中的任务才支持修改</div>
                        </template>
                        <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill"/></span>
                      </el-tooltip>
                    </template>
                    <template #default="scope">
                      <el-switch
                          v-model="scope.row.status"
                          :inactive-value="0"
                          :active-value="1"
                          @change="changeStatus(scope.row)"
                      />
                    </template>
                  </el-table-column>

                  <el-table-column fixed="right" show-overflow-tooltip prop="desc" align="center" label="操作"
                                   min-width="20%">
                    <template #default="scope">
                      <el-button
                          style="margin: 0; padding: 2px"
                          type="text"
                          size="small"
                          @click.native="clickRun(scope.row)">运行
                      </el-button>

<!--                      :disabled="scope.row.status === 1"-->
                      <el-button
                          style="margin: 0; padding: 2px"
                          type="text"
                          size="small"
                          @click.native="showEditDrawer(scope.row)">修改
                      </el-button>

                      <el-popconfirm width="250px" title="复制此任务并生成新的任务?" @confirm="copyData(scope.row)">
                        <template #reference>
                          <el-button style="margin: 0; padding: 2px" type="text" size="small">复制</el-button>
                        </template>
                      </el-popconfirm>

                      <el-popconfirm width="250px" :title="`确定删除【${ scope.row.name }】?`" @confirm="deleteData(scope.row)">
                        <template #reference>
<!--                          :disabled="scope.row.status === 1"-->
                          <el-button
                              :loading="scope.row.isLoading"
                              style="margin: 0; padding: 2px;color: red"
                              type="text"
                              size="small"
                          >删除
                          </el-button>
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
            </el-tabs>

          </div>
        </el-col>
      </el-row>
    </div>
    <EditDrawer :test-type="testType"></EditDrawer>
    <selectRunEnv :test-type="testType"></selectRunEnv>
    <showRunProcess :test-type="testType"></showRunProcess>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount, watch, nextTick, computed} from "vue";
import Pagination from '@/components/pagination.vue'
import EditDrawer from './drawer.vue'

import {GetProjectList} from "@/api/business-api/project";
import {bus, busEvent} from "@/utils/bus-events";
import {ElMessage, ElTree} from "element-plus";
import toClipboard from "@/utils/copy-to-memory";
import {CopyTask, DeleteTask, DisableTask, EnableTask, GetTaskList, RunTask} from "@/api/business-api/task";
import {RunCase} from "@/api/business-api/case";
import SelectRunEnv from "@/components/select-run-env.vue";
import ShowRunProcess from "@/components/show-run-process.vue";

const props = defineProps({
  testType: {
    default: '',
    type: String
  }
})

interface Tree {
  [key: string]: any
}

let treeHeight = computed(() => {
  if (innerHeight < 800) {  // 小屏
    return `${innerHeight * 0.7}px`
  } else {  // 大屏
    return `${innerHeight * 0.81}px`
  }
})
const projectTreeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref('')
watch(filterText, (val) => {
  projectTreeRef.value!.filter(val)
})
const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.name.includes(value)
}

const defaultProps = {children: 'children', label: 'name'}
const projectTab = ref('project')
const taskTab = ref('task')
const tableIsLoading = ref(false)
const projectDataList = ref([])
const tableDataList = ref([])
const tableDataTotal = ref(0)
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true,
  project_id: undefined
})
const tableHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.73}px`
  }else {  // 大屏
    return `${innerHeight * 0.83}px`
  }
})
const currentProject = ref()
const triggerFrom = 'task-index'
const runTaskId = ref()

const rowDblclick = async (row: any, column: any, event: any) => {
  try {
    await toClipboard(row[column.property]);
    ElMessage.success("已复制到粘贴板")
  } catch (e) {
    console.error(e);
  }
}

const clickTree = (row) => {
  queryItems.value.project_id = row.id
  currentProject.value = row
  getTableDataList()
  bus.emit(busEvent.treeIsChoice, {eventType: 'project-tree', content: row})
}

const changePagination = (pagination: any) => {
  queryItems.value.page_num = pagination.pageNum
  queryItems.value.page_size = pagination.pageSize
  getTableDataList()
}

const showEditDrawer = (row: object | undefined) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'edit-task', content: row});
}

const clickRun = (row) => {
  runTaskId.value = row.id
  bus.emit(busEvent.drawerIsShow, {
    eventType: 'select-run-env',
    triggerFrom: triggerFrom,
    showSelectRunModel: true,
    business_id: currentProject.value.business_id,
    runArgs: undefined
  })
}

const runTask = (runConf) => {
  RunTask(props.testType, {
    id: runTaskId.value,
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

const copyData = (row: { id: any; }) => {
  tableIsLoading.value = true
  CopyTask(props.testType, {id: row.id}).then(response => {
    tableIsLoading.value = false
    if (response) {
      getTableDataList()
    }
  })
}

const deleteData = (row: { id: any, isLoading: boolean; }) => {
  row.isLoading = true
  DeleteTask(props.testType, {id: row.id}).then(response => {
    row.isLoading = false
    if (response) {
      getTableDataList()
    }
  })
}

const getTableDataList = () => {
  tableIsLoading.value = true
  GetTaskList(props.testType, queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    tableDataTotal.value = response.data.total
  })
}

const changeStatus = (row: { status?: any; id?: any; }) => {
  if (row.status === 1) {
    enableTask(row.id)
  } else {
    disableTask(row.id)
  }
}

const enableTask = (taskId: number) => {
  tableIsLoading.value = true
  EnableTask(props.testType, {id: taskId}).then(response => {
    tableIsLoading.value = true
    if (response) {
      getTableDataList()
    }
  })
}

const disableTask = (taskId: number) => {
  tableIsLoading.value = true
  DisableTask(props.testType, {id: taskId}).then(response => {
    tableIsLoading.value = true
    if (response) {
      getTableDataList()
    }
  })
}

const getProjectList = () => {
  GetProjectList(props.testType, {page_num: 1, page_size: 99999}).then(response => {
    projectDataList.value = response.data.data
    if (tableDataList.value.length < 1) {
      nextTick(() => {
        projectTreeRef.value.$el.querySelector(".el-tree-node__content").click()
      })
    }
  })
}
onMounted(() => {
  getProjectList()
  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'task-editor') {
    getTableDataList()
  } else if (message.eventType === 'select-run-env' && message.triggerFrom === triggerFrom) {
    runTask(message)
  }
}

</script>

<style scoped lang="scss">
.first-col {
  width: 20% !important;
}

.second-col {
  width: 79% !important;
}

</style>
