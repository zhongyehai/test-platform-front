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
                    :data="projectDataList"
                    :props="defaultProps"
                    :filter-node-method="filterNode"
                    node-key="id"
                    @node-click="clickTree"
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
            <el-tabs v-model="reportTab">
              <el-tab-pane name="report" label="报告列表">

                    <el-select
                        v-model="queryItems.env_list"
                        style="margin-right: 10px"
                        placeholder="运行环境"
                        size="small"
                        multiple
                        clearable
                        default-first-option
                    >
                      <el-option v-for="item in eventList" :key="item.code" :label="item.name" :value="item.code" />
                    </el-select>

                    <el-input
                        v-model="queryItems.name"
                        placeholder="报告名，模糊查询"
                        size="small"
                        clearable
                        style="width: 200px; margin-right: 10px"
                    />

                    <el-select
                        v-model="queryItems.create_user"
                        placeholder="创建人"
                        filterable
                        default-first-option
                        clearable
                        size="small"
                        style="width: 200px; margin-right: 10px"
                    >
                      <el-option v-for="item in userList" :key="item.id" :label="item.name" :value="item.id"/>
                    </el-select>

                    <el-select
                        v-model="queryItems.run_type"
                        placeholder="运行类型"
                        size="small"
                        filterable
                        clearable
                        style="margin-right: 10px"
                        default-first-option
                    >
                      <el-option v-for="(value, key) in runTypeDict" :key="key" :label="value" :value="key"/>
                    </el-select>

                    <el-popover :visible="checkDeleteIsShow" placement="top" popper-class="down-popover" width="450px">
                      确定删除所选中的测试报告?
                      <div style="color: red">
                        1、关联了问题记录的测试报告不会被删除 <br>
                        2、触发方式为【定时任务】或者【流水线】的，只有管理员能删除
                      </div>
                      <div style="text-align: right; margin-top: 10px">
                        <el-button size="small" type="text" @click="checkDeleteIsShow = false">取消</el-button>
                        <el-button type="primary" size="small" @click="deleteData(null)">确定</el-button>
                      </div>
                      <template #reference>
                        <el-button
                            :disabled="selectedList.length === 0"
                            type="primary"
                            size="small"
                            style="margin-left: 5px"
                            @click="checkDeleteIsShow = true"
                        >批量删除
                        </el-button>
                      </template>
                    </el-popover>

                    <el-button type="primary" @click="getTableDataList">查询</el-button>

                <el-table
                    v-loading="tableIsLoading"
                    element-loading-text="正在获取数据"
                    element-loading-spinner="el-icon-loading"
                    :data="tableDataList"
                    stripe
                    @selection-change="clickSelectAll"
                    :height="tableHeight"
                    @row-dblclick="rowDblclick">

                  <el-table-column type="selection" min-width="2%" />

                  <el-table-column prop="id" label="序号" align="center" min-width="5%">
                    <template #default="scope">
                      <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column show-overflow-tooltip prop="name" align="center" label="报告名称" min-width="18%" />

                  <el-table-column show-overflow-tooltip prop="create_time" align="center" label="生成时间" min-width="15%">
                    <template #default="scope">
                      <span> {{ scope.row.create_time }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column show-overflow-tooltip prop="trigger_type" label="触发方式" align="center" min-width="8%">
                    <template #default="scope">
                      <span> {{ reportTriggerTypeMappingContent[scope.row.trigger_type] }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column v-if="testType !== 'app'" show-overflow-tooltip prop="env"  label="运行环境" align="center" min-width="10%">
                    <template #default="scope">
                      <span> {{ eventDict[scope.row.env] }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column show-overflow-tooltip prop="is_passed"  label="是否通过" align="center" min-width="10%">
                    <template #default="scope">
                      <el-tag size="small" :type="reportStatusMappingTagType[scope.row.is_passed]">
                        {{ reportStatusMappingContent[scope.row.is_passed] }}
                      </el-tag>
                    </template>
                  </el-table-column>

                  <el-table-column show-overflow-tooltip prop="process" label="是否完成" align="center" min-width="8%">
                    <template #default="scope">
                      <el-tag
                          size="small"
                          :type="scope.row.process === 3 && scope.row.status === 2 ? 'success' : 'warning'"
                      >
                        {{ scope.row.process === 3 && scope.row.status === 2 ? '已完成' : '执行中' }}
                      </el-tag>
                    </template>
                  </el-table-column>

                  <el-table-column show-overflow-tooltip prop="create_user" label="创建人" align="center" min-width="8%">
                    <template #default="scope">
                      <span> {{ userDict[scope.row.create_user] }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column
                      fixed="right"
                      show-overflow-tooltip
                      prop="desc"
                      align="center"
                      label="操作"
                      min-width="12%">
                    <template #default="scope">
                      <el-button
                          v-show="scope.row.run_type !== 'api' || isAdmin"
                          type="text"
                          size="small"
                          style="margin: 0; padding: 2px"
                          @click.native="clickReRun(scope.row)"
                      >重跑
                      </el-button>

                      <!--查看报告-->
                      <el-button
                          type="text"
                          size="small"
                          style="margin: 0; padding: 2px"
                          @click.native="openReportById(scope.row.id)"
                      >查看
                      </el-button>
                      <el-popconfirm :title="`确定删除【${ scope.row.name }】?`" @confirm="deleteData(scope.row)">
                        <template #reference>
                          <el-button
                              :disabled="scope.row.status === 1"
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

    <selectRunEnv :test-type="testType"></selectRunEnv>
    <showRunProcess :test-type="testType"></showRunProcess>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount, watch, nextTick, computed} from "vue";
import Pagination from '@/components/pagination.vue'

import {GetProjectList} from "@/api/business-api/project";
import {bus, busEvent} from "@/utils/bus-events";
import {ElMessage, ElTree} from "element-plus";
import toClipboard from "@/utils/copy-to-memory";
import {DeleteReport, GetReport, GetReportList} from "@/api/business-api/report";
import {reportStatusMappingContent, reportStatusMappingTagType, reportTriggerTypeMappingContent} from "../mapping";
import {GetRunEnvList} from "@/api/config/run-env";
import {GetUserList} from "@/api/system/user";
import {GetConfigByCode} from "@/api/config/config-value";
import SelectRunEnv from "@/components/select-run-env.vue";
import ShowRunProcess from "@/components/show-run-process.vue";
import {GetCase, RunCase} from "@/api/business-api/case";
import {GetServerList} from "@/api/business-api/device-server";
import {GetPhoneList} from "@/api/business-api/device-phone";
import {RunTask} from "@/api/business-api/task";
import {RunCaseSuite} from "@/api/business-api/case-suite";
import {RunApi} from "@/api/business-api/api";

const props = defineProps({
  testType: {
    default: '',
    type: String
  }
})

interface Tree {
  [key: string]: any
}

let treeHeight = localStorage.getItem('treeHeight')
const treeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref('')
watch(filterText, (val) => {
  treeRef.value!.filter(val)
})
const defaultProps = {children: 'children', label: 'name'}
const projectTab = ref('project')
const reportTab = ref('report')
const projectTreeRef = ref(null)
const tableIsLoading = ref(false)
const checkDeleteIsShow = ref(false)
const project = ref({})
const report = ref({})
const projectDataList = ref([])
const eventList = ref([])
const eventDict = ref({})
const userList = ref([])
const userDict = ref({})
const runTypeDict = ref({})
const tableDataList = ref([])
const selectedList = ref([])
const tableDataTotal = ref(0)
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true,
  project_id: undefined,
  name: undefined,
  create_user: undefined,
  env_list: [],
  run_type: undefined
})

const tableHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.7}px`
  }else {  // 大屏
    return `${innerHeight * 0.81}px`
  }
})
const isAdmin = localStorage.getItem('permissions').indexOf('admin') !== -1
const triggerFrom = 'report-index'

const rowDblclick = async (row: any, column: any, event: any) => {
  try {
    await toClipboard(row[column.property]);
    ElMessage.success("已复制到粘贴板")
  } catch (e) {
    console.error(e);
  }
}

const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.label.includes(value)
}

const clickTree = (row) => {
  project.value = row
  queryItems.value.project_id = row.id
  getRunEnvList()
  getTableDataList()
}

const changePagination = (pagination: any) => {
  queryItems.value.page_num = pagination.pageNum
  queryItems.value.page_size = pagination.pageSize
  getTableDataList()
}

const getReportAndSendEvent = () => {
  GetReport(props.testType, {id: report.value.id}).then(response => {
    report.value = response.data

    if (report.value.run_type === 'case') {
      const tempVariables = report.value.temp_variables
      if (tempVariables) { // 本身就有临时参数
        sendReRun(tempVariables)
      } else { // 没有就获取用例的数据
        if (report.value.trigger_id.length === 1) {
          GetCase(props.testType, { id: report.value.trigger_id[0] }).then(response => {
            const case_data = response.data
            sendReRun({
              skip_if: case_data.skip_if, variables: case_data.variables,
              run_times: case_data.run_times, headers: case_data.headers
            })
          })
        } else {
          sendReRun(null)
        }
      }
    }else {
      sendReRun(null)
    }
  })
}

const sendReRun = (tempRunArgs: any) => {
  bus.emit(busEvent.drawerIsShow, {
    eventType: 'select-run-env',
    triggerFrom: triggerFrom,
    showSelectRunModel: ['task', 'suite'].indexOf(report.value.run_type) !== -1,
    business_id: project.value.business_id,
    runArgs: tempRunArgs
  })
}

const clickReRun = (row: {}) => {
  report.value = row
  if (props.testType === 'app') {
    if (busEvent.data.runServerList.length < 1) {
      GetServerList({ page_num: 1, page_size: 99999 }).then(response => {
        busEvent.data.runServerList = response.data.data
      })
    }

    if (busEvent.data.runPhoneList.length < 1) {
      GetPhoneList({ page_num: 1, page_size: 99999 }).then(response => {
        busEvent.data.runPhoneList = response.data.data
      })
    }
  }

  getReportAndSendEvent()
}

const getRunUrl = () => {
  const run_type = report.value.run_type
  return run_type === 'task' ? RunTask
      : run_type === 'suite' ? RunCaseSuite
          : run_type === 'case' ? RunCase
              : RunApi
}

const reRun = (runConf) => {
  const runUrl = getRunUrl()
  runUrl(props.testType, {
    api_list: report.value.run_type === 'api' ? report.value.trigger_id : undefined,
    case_id_list: report.value.run_type === 'case' ? report.value.trigger_id : undefined,
    id: ['task', 'suite'].indexOf(report.value.run_type) !== -1 ? report.value.trigger_id : undefined,
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


const openReportById = (reportId: any) => {
  window.open(`/${props.testType}-test/report-show?id=${reportId}`, '_blank')
}

const clickSelectAll = (val: never[]) => {
  selectedList.value = val
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

const deleteData = (row: { id: any; }) => {
  tableIsLoading.value = true
  DeleteReport(props.testType, {id_list: getSubmitId(row)}).then(response => {
    checkDeleteIsShow.value = false
    tableIsLoading.value = false
    if (response) {
      getTableDataList()
    }
  })
}

const getTableDataList = () => {
  tableIsLoading.value = true
  GetReportList(props.testType, queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    tableDataTotal.value = response.data.total
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

const getRunEnvList = () => {
  GetRunEnvList({ business_id: project.value.business_id }).then(response => {
    eventList.value = response.data.data
    eventList.value.forEach(env => {
      eventDict.value[env.code] = env.name
    })
  })
}

const getUserList = () => {
  GetUserList({ business_id: project.value.business_id }).then(response => {
    userList.value = response.data.data
    userList.value.forEach(env => {
      userDict.value[env.id] = env.name
    })
  })
}

const getRunTypeDict = () => {
  GetConfigByCode({ code: 'run_type' }).then(response => {
    runTypeDict.value = response.data
  })
}

onMounted(() => {
  getRunTypeDict()
  getProjectList()
  getUserList()

  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'select-run-env' && message.triggerFrom === triggerFrom) {
    reRun(message)
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
