<template>
  <div class="layout-container" v-loading="isLoading">
    <div style="margin: 10px">
      <div>
        <span style="color: red">*</span>
        数据来源：
        【<span style="color: red">接口自动化</span>】
        下用例集类型为
        【<span style="color: red">造数据用例集</span>】
        下状态为
        【<span style="color: red">已通过-要执行</span>】
        的
        【<span style="color: red">用例</span>】
      </div>

      <el-row>
        <el-col :span="3">
          <el-tabs v-model="businessListTab">
            <el-tab-pane :label="businessListTab" :name="businessListTab">
              <el-scrollbar class="aside_scroll" :style="{height: `${scrollHeight}`}">
                <el-tabs v-model="businessActiveId" tab-position="left" :before-leave="getProjectList">
                  <el-tab-pane
                      v-for="(business) in busEvent.data.businessList"
                      :key="business.id"
                      :name="business.id.toString()"
                      :label="business.name"
                  />
                </el-tabs>
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
        </el-col>

        <el-col :span="4">
          <el-tabs v-model="projectListTab">
            <el-tab-pane :label="projectListTab" :name="projectListTab">
              <el-scrollbar class="aside_scroll" :style="{height: `${scrollHeight}`}">
                <el-tabs v-model="projectActiveId" tab-position="left" :before-leave="getCaseList">
                  <el-tab-pane
                      v-for="(project) in projectList"
                      :key="project.id"
                      :name="project.id.toString()"
                      :label="project.name"
                  />
                </el-tabs>
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
        </el-col>

        <el-col :span="17">
          <el-tabs v-model="caseListTab">
            <el-tab-pane :label="caseListTab" :name="caseListTab">
              <div style="margin-left: 10px; margin-right: 10px">
                <el-table
                    ref="caseTable"
                    element-loading-text="正在获取数据..."
                    size="small"
                    :height="scrollHeight"
                    element-loading-spinner="el-icon-loading"
                    :data="caseList"
                    stripe
                >
                  <el-table-column prop="num" label="序号" align="left" min-width="8%">
                    <template #default="scope">
                      <span> {{ scope.$index + 1 }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column show-overflow-tooltip align="left" label="用例名称" min-width="55%">
                    <template #default="scope">
                      <span> {{ scope.row.name }} </span>
                    </template>
                  </el-table-column>

                  <el-table-column show-overflow-tooltip align="left" label="用例描述" min-width="20%">
                    <template #default="scope">
                      <el-popover
                          trigger="hover"
                          placement="bottom-start"
                          style="margin-right: 10px"
                          popper-class="down-popover"
                          width="1300px"
                      >
                        <showCaseDesc
                            :case-desc="scope.row.desc"
                            :case-skip-if="scope.row.skip_if"
                            :case-variables="scope.row.variables"
                            :case-extracts="scope.row.output"
                            :project-id="projectActiveId"
                        />
                        <template #reference>
                          <span> {{ scope.row.desc || '-' }} </span>
                        </template>
                      </el-popover>
                    </template>
                  </el-table-column>

                  <el-table-column label="操作" align="left" min-width="10%">
                    <template #default="scope">

                      <!-- 运行用例 -->
                      <el-button type="text" size="small" style="margin: 0; padding: 2px" @click="clickRunCase(scope.row)">运行 </el-button>

                      <!--修改用例-->
                      <el-button type="text" size="small" style="margin: 0; padding: 2px" @click="editCase(scope.row)">修改 </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>

      <selectRunEnv :test-type="'api'" :project-business-id="businessActiveId"></selectRunEnv>
      <showRunProcess :test-type="'api'"></showRunProcess>

      <editCaseDrawer :test-type="'api'" :project-id="projectActiveId"/>

    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import SelectRunEnv from "@/components/select-run-env.vue";
import ShowRunProcess from "@/components/show-run-process.vue";
import showCaseDesc from '@/components/business/case/show-desc.vue'
import editCaseDrawer from '@/components/business/case/edit-drawer.vue'
import {bus, busEvent} from "@/utils/bus-events";
import {GetBusinessList} from "@/api/config/business";
import {GetProjectList} from "@/api/business-api/project";
import {GetMakeDataCaseList, RunCase} from "@/api/business-api/case";

const isLoading = ref(false)
const businessListTab = ref('业务线列表')
const projectListTab = ref('服务列表')
const caseListTab = ref('用例列表')
const businessActiveId = ref()
const projectActiveId = ref()
const projectList = ref([])
const caseList = ref([])
const runCaseId = ref([])
const testType = 'api'
const triggerFrom = 'make-business-data'
const scrollHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.73}px`
  }else {  // 大屏
    return `${innerHeight * 0.82}px`
  }
})

const getProjectList = (activeName: string, oldActiveName: any) => {
  if (activeName && activeName !== '0') {
    caseList.value = []
    isLoading.value = true
    GetProjectList(testType,{ business_id: parseInt(activeName) }).then(response => {
      isLoading.value = false
      if (response.data.total > 0) {
        projectList.value = response.data.data
        projectActiveId.value = response.data.data[0].id.toString()
      }
    })
  }
}

const getCaseList = (activeName: string, oldActiveName: any) => {
  if (activeName && activeName !== '0') {
    isLoading.value = true
    GetMakeDataCaseList(testType,{ project_id: parseInt(activeName) }).then(response => {
      isLoading.value = false
      caseList.value = response.data.data
    })
  }
}

// 编辑用例
const editCase = (row) => {
  bus.emit(busEvent.drawerIsShow, {
    eventType: 'edit-case',
    content: JSON.parse(JSON.stringify(row))
  })
}

const clickRunCase = (row) => {
  runCaseId.value = [row.id]
  bus.emit(busEvent.drawerIsShow, {
    eventType: 'select-run-env',
    triggerFrom: triggerFrom,
    showSelectRunModel: false,
    business_id: businessActiveId.value,
    runArgs:       {
      variables: JSON.parse(JSON.stringify(row.variables)),
      headers: row.headers ? JSON.parse(JSON.stringify(row.headers)) : undefined,
      skip_if: JSON.parse(JSON.stringify(row.skip_if))
    }
  })
}

// 运行用例
const runCase = (runConf) => {
  RunCase(testType, {
    case_id_list: runCaseId.value,
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


const getBusinessList = () => {
  GetBusinessList({page_num: 1, page_size: 99999}).then(response => {
    busEvent.data.businessList = response.data.data

    businessActiveId.value = response.data.data[0].id.toString()

    busEvent.data.businessDict = {}
    busEvent.data.businessList.forEach(business => {
      busEvent.data.businessDict[business.id] = business.name
    })
  })
}

onMounted(() => {
  getBusinessList()
  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'case-editor') {
    getCaseList(projectActiveId.value, undefined)
  } else if (message.eventType === 'select-run-env' && message.triggerFrom === triggerFrom) {
    runCase(message)
  }
}

</script>

<style scoped lang="scss">

</style>
