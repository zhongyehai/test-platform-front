<template>
  <div class="layout-container">

    <div class="layout-container-form flex space-between">
      <div class="layout-container-form-handle">
        <el-form label-width="60px" inline>
          <el-form-item :label="`${testType === 'api' ? '服务' : testType === 'ui' ? '项目' : 'app'}`" size="small">
            <el-select
                v-model="queryItems.project_id"
                :placeholder="`选择${testType === 'api' ? '服务' : testType === 'ui' ? '项目' : 'app'}`"
                size="small"
                style="width: 250px"
                filterable
                default-first-option
                @change="getCaseSuiteList"
            >
              <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

<!--          <el-form-item v-if="testType === 'api'" label="查接口" size="small">-->
<!--            <el-input-->
<!--                v-model="queryItems.addr"-->
<!--                class="input-with-select"-->
<!--                placeholder="请输入接口地址"-->
<!--                size="small"-->
<!--                clearable-->
<!--                style="width: 400px"-->
<!--            />-->
<!--            <el-button-->
<!--                v-show="testType === 'api'"-->
<!--                :disabled="!queryItems.addr"-->
<!--                type="primary"-->
<!--                size="small"-->
<!--                :loading="queryButtonIsLoading"-->
<!--                style="margin-left: 10px"-->
<!--                @click.native="showApiFrom()"-->
<!--            >查归属-->
<!--            </el-button>-->
<!--            <el-button-->
<!--                v-show="testType === 'api'"-->
<!--                :disabled="!queryItems.addr"-->
<!--                type="primary"-->
<!--                size="small"-->
<!--                :loading="queryButtonIsLoading"-->
<!--                style="margin-left: 10px"-->
<!--                @click.native="getApiToStep()"-->
<!--            >查使用情况-->
<!--            </el-button>-->
<!--          </el-form-item>-->
        </el-form>
      </div>
    </div>

    <div>
      <el-row>

        <!-- 第一列用例集树 -->
        <el-col style="width: 20%; margin-left: 10px; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
          <el-tabs v-model="tabActiveName" class="table_padding table_project">
            <el-tab-pane name="moduleTree">

              <template #label>
                <span> 用例集树 </span>
                <el-popover class="el_popover_class" placement="top-start" trigger="hover" content="添加一用例集">
                  <template #reference>
                    <el-button
                        v-show="queryItems.project_id"
                        type="text"
                        style="margin: 0; padding: 5px"
                        @click="addParentCaseSuite"
                    ><Plus></Plus></el-button>
                  </template>
                </el-popover>
                <el-popover class="el_popover_class" placement="top-start" trigger="hover" content="导入用例集">
                  <template #reference>
                    <el-button
                        v-show="queryItems.project_id"
                        type="text"
                        style="margin: 0; padding: 5px"
                        @click="uploadCaseSuite"
                    ><UploadOne></UploadOne></el-button>
                  </template>
                </el-popover>
              </template>

              <div>
                <el-input v-model="filterText" placeholder="输入关键字进行过滤" />
                <el-scrollbar :style="{height: treeHeight}">
                <el-tree
                    ref="treeRef"
                    :data="moduleTreeData"
                    :props="defaultProps"
                    :filter-node-method="filterNode"
                    node-key="id"
                    @node-click="clickTree"
                    highlight-current
                >
                  <template #default="{ node, data }">
                    <div class="custom-tree-node" @mouseenter="mouseenter(data)" @mouseleave="mouseleave(data)">
                      <span>{{ node.label }}</span>
                      <div v-show="data.id === currentNode.id">
                        <Plus style="color: #409EFF;margin: 0; padding: 2px" @click.stop="showEditDrawer('add', node, data)"></Plus>
                        <Write style="color: #409EFF;margin: 0; padding: 2px" @click.stop="showEditDrawer('edit', node, data)"></Write>
                        <Delete style="color: red;margin: 0; padding: 2px" @click.stop="clickDeleteModule(node, data)"></Delete>
                      </div>
                    </div>
                  </template>
                </el-tree>
                </el-scrollbar>
              </div>

            </el-tab-pane>
          </el-tabs>
        </el-col>

        <!-- 第二列，用例列表 -->
        <el-col style="width: 79%;">
<!--          <apiFromDrawer :case-id="null" />-->
<!--          <apiUseDrawer />-->
          <!-- 用例管理 -->
          <caseIndex :test-type="testType" :project-id="project.id" :project-list="projectList"></caseIndex>
        </el-col>

      </el-row>
      <editDrawer :test-type="testType"></editDrawer>
      <uploadDrawer :test-type="testType"></uploadDrawer>

      <selectRunEnv :test-type="testType" :business-id="project.business_id"></selectRunEnv>
      <showRunProcess :test-type="testType"></showRunProcess>

    </div>
  </div>
</template>

<script setup lang="ts">

import {onMounted, ref, onBeforeUnmount, watch, computed} from "vue";
import editDrawer from "./edit-drawer.vue";
import uploadDrawer from "./upload-drawer.vue";
// import apiFromDrawer from "@/components/business/api/from-drawer.vue";
// import apiUseDrawer from "@/components/business/api/use-drawer.vue";
import caseIndex from "@/components/business/case/index.vue";

import {GetProjectList, GetProject} from '@/api/business-api/project'
import {bus, busEvent} from "@/utils/bus-events";
import {arrayToTree, ellipsis} from "@/utils/parse-data";
import {ElMessage, ElMessageBox, ElTree} from "element-plus";
import {Plus, UploadOne, Write, Delete} from "@icon-park/vue-next";
import {GetApiFrom, GetApiToStep} from "@/api/business-api/api";
import {GetCaseSuiteList, DeleteCaseSuite} from "@/api/business-api/case-suite";
import {GetConfigByCode} from "@/api/config/config-value";
import SelectRunEnv from "@/components/select-run-env.vue";
import ShowRunProcess from "@/components/show-run-process.vue";

const props = defineProps({
  testType: {
    default: '',
    type: String
  }
})
interface Tree {[key: string]: any}
let treeHeight = computed(() => {
  if (innerHeight < 800) {  // 小屏
    return `${innerHeight * 0.67}px`
  } else {  // 大屏
    return `${innerHeight * 0.80}px`
  }
})
const treeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref('')
watch(filterText, (val) => {treeRef.value!.filter(val)})
const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.name.includes(value)
}

const defaultProps = {children: 'children', label: 'name'}
const tempLabel = ref()
const currentNode = ref({id: undefined})
const queryButtonIsLoading = ref(false)
const tabActiveName = ref('moduleTree')
const projectList = ref([])
const project = ref({})
const moduleTreeData = ref([])
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  addr: undefined,
  project_id: undefined
})

// 鼠标滑入
const mouseenter = (data: { name: string; showDropdownMenu: boolean; }) => {
  currentNode.value = data
  tempLabel.value = JSON.parse(JSON.stringify(data.name))
  data.name = ellipsis(data.name, 8)
}

// 鼠标滑出
const mouseleave = (data: { name: any; showDropdownMenu: boolean; }) => {
  data.name = tempLabel.value
}

const addParentCaseSuite = () => {
  currentNode.value = {}
  showEditDrawer('add', null, {id: null})
}

const uploadCaseSuite = () => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'upload-case-suite', content: {project_id: project.value.id}})
}

const showEditDrawer = (command: string, node: any, data: { name: any; controller: any; }) => {
  let eventContent = {}
  if (command === 'add'){
    eventContent =  {parent: data.id, suite_type: data.suite_type, project_id: project.value.id}
  }else {
    eventContent =  JSON.parse(JSON.stringify(data))
  }
  bus.emit(busEvent.drawerIsShow, {eventType: 'edit-case-suite', content: eventContent})
}

const moduleTreeIsDone = (moduleTree: never[]) => {
  bus.emit(busEvent.treeIsDone, {eventType: 'case-suite', content: JSON.parse(JSON.stringify(moduleTree))})
}

const clickDeleteModule = (node: any, data: { name: any; }) => {
  ElMessageBox.confirm(
      `确定删除【${data.name}】`,
      '提示',
      {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'})
      .then(() => {
        DeleteCaseSuite(props.testType, { id: data.id }).then(response => {
          if (response){
            treeRef.value.remove(data)
            moduleTreeIsDone(moduleTreeData.value)
          }
        })
      }).catch(() => {})
}

const clickTree = (data: any) => {
  bus.emit(busEvent.treeIsChoice, {
    eventType: 'case-suite',
    content: {id: data.id, data: data, project_id: project.value.id, project: project.value}
  })
}

const showApiFrom = () => {
  queryButtonIsLoading.value = true
  GetApiFrom({ api_addr: queryItems.value.addr }).then(response => {
    queryButtonIsLoading.value = false
    if (response.data.length > 0){
      bus.emit(busEvent.drawerIsShow, {eventType: 'api-from', content: response.data})
    }else {
      ElMessage.warning('没有查到相关数据')
    }
  })
}
const getApiToStep = () => {
  queryButtonIsLoading.value = true
  GetApiToStep({ api_addr: queryItems.value.addr }).then(response => {
    queryButtonIsLoading.value = false
    if (response){
      bus.emit(busEvent.drawerIsShow, {eventType: 'api-use', content: response.data})
    }
  })
}

const getProjectList = () => {
  GetProjectList(props.testType, {page_num: 1, page_size: 99999}).then(response => {
    projectList.value = response.data.data
  })
}

const getCaseSuiteList = (projectId: number) => {
  GetCaseSuiteList(props.testType, { 'project_id': projectId, page_num: 1, page_size: 99999 }).then(response => {
    var response_data = JSON.stringify(response.data) === '{}' ? [] : response.data.data
    moduleTreeData.value = arrayToTree(response_data, null)
    moduleTreeIsDone(moduleTreeData.value)
  })

  GetProject(props.testType, {id: projectId }).then(response => {
    project.value = response.data
  })
}

onMounted(() => {
  getProjectList()

  GetConfigByCode({ code: 'data_type_mapping' }).then(response => {
    busEvent.data.dataTypeMapping = response.data
  })

  GetConfigByCode({ code: 'extracts_mapping' }).then(response => {
    busEvent.data.responseDataSource = response.data
  })

  GetConfigByCode({ code: 'assert_mapping_list' }).then(response => {
    busEvent.data.apiAssertMapping = response.data
  })

  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'edit-case-suite') {
    if (message.command === 'add'){
      if (currentNode.value.id) {
        if (!currentNode.value.children) {
          currentNode.value.children = []
        }
        currentNode.value.children.push(message.content)
        treeRef.value.store.nodesMap[currentNode.value.id].expanded = true // 展开节点
      } else {
        moduleTreeData.value.push(message.content)
      }
    }else {
      currentNode.value.name = message.content.name
    }
    moduleTreeIsDone(moduleTreeData.value)
  }else if (message.eventType === 'upload-case-suite'){
    getCaseSuiteList(project.value.id)
  }
}

</script>

<style scoped lang="scss">
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

/* 添加一些全局样式，确保布局效果 */
.el-row {
  display: flex;
}

.el-col {
  flex: 0 0 auto; /* 确保列按照指定的宽度展示 */
}

</style>
