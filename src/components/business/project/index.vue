<template>
  <div class="layout-container">

    <div class="layout-container-form flex space-between">
      <div class="layout-container-form-handle">
        <el-button type="primary" @click="showEditDrawer(undefined, 'project')"> 添加 </el-button>
      </div>

      <div class="layout-container-form-search">
        <el-input
            v-model="queryItems.name"
            :placeholder="`${testType === 'api' ? '服务' : testType === 'ui' ? '项目' : 'app'}名，支持关键字查询`"
            size="small"
            clearable
            style="width: 200px; margin-right: 10px"
        />

        <el-select
            v-model="queryItems.business_id"
            placeholder="选择业务线"
            filterable
            default-first-option
            clearable
            size="small"
            @clear="clearBusinessId"
            style="width: 200px; margin-right: 10px"
        >
          <el-option
              v-for="business in businessList"
              :key="business.id"
              :label="business.name"
              :value="business.id"
          />
        </el-select>

        <el-select
            v-model="queryItems.manager"
            :placeholder="'选择负责人'"
            filterable
            default-first-option
            clearable
            style="width: 200px; margin-right: 10px"
            size="small"
        >
          <el-option v-for="user in userList" :key="user.name" :label="user.name" :value="user.id" />
        </el-select>

        <el-button type="primary" @click="getTableDataList"> 搜索</el-button>
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
          :height="tableHeight"
          @row-dblclick="rowDblclick"
          row-key="id">

        <el-table-column prop="id" label="序号" align="center" min-width="8%">
          <template #default="scope">
            <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column
            show-overflow-tooltip
            prop="name"
            align="center"
            :label="`${testType === 'api' ? '服务' : testType === 'ui' ? '项目' : 'app'}名称`"
            min-width="20%">
          <template #default="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column
            v-if="testType === 'api'"
            show-overflow-tooltip
            align="center"
            label="swagger"
            prop="swagger"
            min-width="35%"
        >
          <template #default="scope">
            <div v-if="scope.row.swagger">
              <span>{{ scope.row.swagger }}</span>
            </div>
            <div v-else>
              <el-tag type="warning">未设置</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
            v-if="testType === 'api'"
            show-overflow-tooltip
            align="center"
            label="拉取状态"
            min-width="10%"
        >
          <template #default="scope">
            <el-tooltip
                v-if="scope.row.last_pull_status !== 1"
                content="点击查看详情"
                class="item"
                effect="dark"
                placement="top-start"
            >
              <el-tag
                  :type="swaggerPullStatusMappingTagType[scope.row.last_pull_status]"
                  @click="showSwaggerPullLog(scope.row)"
              >
                {{ swaggerPullStatusMappingContent[scope.row.last_pull_status] }}
              </el-tag>
            </el-tooltip>

            <el-tag
                v-else
                :type="swaggerPullStatusMappingTagType[scope.row.last_pull_status]"
                @click="showSwaggerPullLog(scope.row)"
            >
              {{ swaggerPullStatusMappingContent[scope.row.last_pull_status] }}
            </el-tag>

          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="business_id" align="center" label="业务线" min-width="10%">
          <template #default="scope">
            <span> {{ businessDict[scope.row.business_id] }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="manager" align="center" label="负责人" min-width="10%">
          <template #default="scope">
            <span> {{ userDict[scope.row.manager] }} </span>
          </template>
        </el-table-column>

        <el-table-column v-if="testType === 'app'" show-overflow-tooltip align="center" label="app_package" min-width="15%">
          <template #default="scope">
            <span>{{ scope.row.app_package }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="update_user" align="center" label="最后修改" min-width="10%">
          <template #default="scope">
            <span>{{ userDict[scope.row.update_user] }}</span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" show-overflow-tooltip prop="desc" align="center" label="操作" width="140">
          <template #default="scope">
            <el-button v-show="scope.row.swagger" style="margin: 0; padding: 2px" type="text" size="small" @click.native="showPullSwaggerDrawer(scope.row)">拉取</el-button>
            <el-button style="margin: 0; padding: 2px" type="text" size="small" @click.native="showEditDrawer(scope.row, 'project')">修改</el-button>
            <el-button style="margin: 0; padding: 2px" type="text" size="small" @click.native="showEditDrawer(scope.row, 'env')">环境</el-button>
            <el-popconfirm width="250px" :title="`确定删除【${ scope.row.name }】?`" @confirm="deleteData(scope.row.id)">
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
    </div>

    <EditProjectDrawer
        :test-type="testType"
        :user-list="userList"
        :business-list="businessList"
    ></EditProjectDrawer>

    <EditEnvDrawer :test-type="testType"></EditEnvDrawer>

    <selectPullOptionDialog></selectPullOptionDialog>
    <showSwaggerPullLogDrawer :user-dict="userDict"></showSwaggerPullLogDrawer>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount, computed, watch} from "vue";
import Sortable from "sortablejs"
import Pagination from '@/components/pagination.vue'
import EditProjectDrawer from './edit-project-drawer.vue'
import EditEnvDrawer from './edit-env-drawer.vue'
import selectPullOptionDialog from './select-pull-option-dialog.vue'
import showSwaggerPullLogDrawer from './show-swagger-pull-log.vue'

import {GetUserList} from "@/api/system/user";
import {bus, busEvent} from "@/utils/bus-events";
import {ElMessage} from "element-plus";
import toClipboard from "@/utils/copy-to-memory";
import {swaggerPullStatusMappingContent, swaggerPullStatusMappingTagType} from "@/components/business/mapping";
import {GetBusinessList} from "@/api/config/business";
import {ChangeProjectSort, DeleteProject, GetProjectList} from "@/api/business-api/project";

const props = defineProps({
  testType: {
    default: 'api',
    type: String
  }
})

const tableIsLoading = ref(false)
const businessList = ref([])
const businessDict = ref({})
const tableDataList = ref([])
const oldIdList = ref([])
const newIdList = ref([])
const userList = ref([])
const userDict = ref({})
const tableDataTotal = ref(0)
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true,
  name: undefined,
  manager: undefined,
  business_id: undefined,
  create_user: undefined
})

const tableHeight = ref('10px')

const setTableHeight = () => {
  if (window.innerHeight < 800){  // 小屏
    tableHeight.value = `${window.innerHeight * 0.73}px`
  }else {  // 大屏
    tableHeight.value =  `${window.innerHeight * 0.82}px`
  }
}

const handleResize = () => {
  setTableHeight();
}

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


// 表格行拖拽
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
      // 结束拖拽
      console.log("结束表格拖拽", e);
      const targetRow = tableDataList.value.splice(e.oldIndex, 1)[0]
      tableDataList.value.splice(e.newIndex, 0, targetRow)
      const tempIndex = newIdList.value.splice(e.oldIndex, 1)[0]
      newIdList.value.splice(e.newIndex, 0, tempIndex)
      sortTable()
    },
  });
}

const clearBusinessId = () => {

}

const showSwaggerPullLog = (row: object) => {
  console.log('row: ', row)
  if (row.last_pull_status !== 1) {
    console.log('show-swagger-pull-log')
    bus.emit(busEvent.drawerIsShow, {eventType: 'show-swagger-pull-log', content: row})
  }
}

const getBusinessList = () => {
  GetBusinessList({page_num: 1, page_size: 99999}).then(response => {
    businessList.value = response.data.data
    businessList.value.forEach(business => {
      businessDict.value[business.id] = business.name
    })
  })
}

const showEditDrawer = (row: object | undefined, type: string | undefined) => {
  bus.emit(busEvent.drawerIsShow, {eventType: type === 'project' ? 'project-editor' : 'project-env-editor', content: row});
}
const showPullSwaggerDrawer = (row: object | undefined) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'pull-from-swagger', content: row});
}

const getTableDataList = () => {
  queryItems.value.manager = queryItems.value.manager ? queryItems.value.manager : undefined
  queryItems.value.name = queryItems.value.name ? queryItems.value.name : undefined
  queryItems.value.business_id = queryItems.value.business_id ? queryItems.value.business_id : undefined
  queryItems.value.create_user = queryItems.value.create_user ? queryItems.value.create_user : undefined
  tableIsLoading.value = true
  GetProjectList(props.testType, queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    tableDataTotal.value = response.data.total

    oldIdList.value = tableDataList.value.map(item => item.id)
    newIdList.value = oldIdList.value.slice()
  })
}

const sortTable = () => {
  tableIsLoading.value = true
  ChangeProjectSort(props.testType, {
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

const deleteData = (dataId: number) => {
  DeleteProject(props.testType, {id: dataId}).then(response => {
    if (response){
      getTableDataList()
    }
  })
}

const getUserList = () => {
  GetUserList({}).then((response: object) => {
    userList.value = response.data.data
    userList.value.forEach(item => {
      userDict.value[item.id] = item.name
    })
  })
}

onMounted(() => {
  getUserList()
  getBusinessList()
  getTableDataList()
  setSort()
  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
  setTableHeight()
  window.addEventListener('resize', handleResize);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
  window.removeEventListener('resize', handleResize);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'project-editor') {
    getTableDataList()
  }
}

</script>

<style scoped lang="scss">

</style>
