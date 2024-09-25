<template>
  <div class="layout-container">

    <div class="layout-container-form flex space-between">
      <div class="layout-container-form-handle">
        <el-button type="primary" @click="showEditDrawer('add', undefined)"> 新增脚本</el-button>
      </div>

      <div class="layout-container-form-search">
        <el-select
            style="margin-right: 10px; width: 100%"
            v-model="queryItems.script_type"
            placeholder="选择脚本类型"
            filterable
            default-first-option
            clearable
            size="small"
        >
          <el-option v-for="(value, key) in scriptTypeDict" :key="key" :label="value" :value="key" />
        </el-select>

        <el-input
            style="margin-right: 10px"
            v-model="queryItems.file_name"
            class="input-with-select"
            placeholder="脚本名，支持模糊搜索"
            size="small"
            clearable
        />

        <el-select
            style="margin-right: 10px; width: 100%"
            v-model="queryItems.create_user"
            :placeholder="'选择创建人'"
            filterable
            default-first-option
            clearable
            size="small"
            class="filter-item"
        >
          <el-option v-for="user in userList" :key="user.name" :label="user.name" :value="user.id" />
        </el-select>

        <el-button type="primary" @click="getTableDataList()"> 搜索</el-button>
      </div>
    </div>

    <div style="margin: 10px">
      <el-table
          v-loading="tableIsLoading"
          row-key="id"
          element-loading-text="正在获取数据"
          element-loading-spinner="el-icon-loading"
          :data="tableDataList"
          style="width: 100%"
          stripe
          :height="tableHeight"
          @cell-dblclick="cellDblclick">

        <el-table-column prop="id" label="序号" align="center" min-width="10%">
          <template #default="scope">
            <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="脚本类型" prop="script_type" align="center" min-width="10%">
          <template #default="scope">
            <span> {{ scriptTypeDict[scope.row.script_type] }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="脚本文件名" prop="name" align="center" min-width="30%">
          <template #default="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="备注" prop="desc" align="center"  min-width="15%">
          <template #default="scope">
            <span> {{ scope.row.desc }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="创建人" prop="create_user" align="center" min-width="10%">
          <template #default="scope">
            <span>{{ userDict[scope.row.create_user] }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="最后修改人" prop="update_user" align="center" min-width="10%">
          <template #default="scope">
            <span>{{ userDict[scope.row.update_user] }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" label="操作" width="180">
          <template #default="scope">
            <el-button type="text" size="small" style="margin: 0; padding: 2px" @click.native="showEditDrawer('edit', scope.row)">修改</el-button>
            <el-button type="text" size="small" style="margin: 0; padding: 2px" @click.native="showEditDrawer('copy', scope.row)">复制</el-button>
            <el-button type="text" size="small" v-show="scope.row.script_type == 'mock'" style="margin: 0; padding: 2px" @click.native="showRecordDrawer(scope.row.name)">调用记录</el-button>
            <el-popconfirm :title="`确定删除【${ scope.row.name }】?`" @confirm="deleteData(scope.row)">
              <template #reference>
                <el-button style="margin: 0; padding: 2px; color: red" type="text" size="small">删除</el-button>
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

    <EditDrawer :script-type-dict="scriptTypeDict"></EditDrawer>
    <MockRecordDrawer></MockRecordDrawer>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount, computed} from "vue";
import Pagination from '@/components/pagination.vue'
import EditDrawer from './edit-drawer.vue'
import MockRecordDrawer from './mock-record-drawer.vue'

import {bus, busEvent} from "@/utils/bus-events";
import {GetUserList} from "@/api/system/user";
import toClipboard from "@/utils/copy-to-memory";
import {ElMessage} from "element-plus";
import {DeleteScript, GetScriptList, ScriptSort} from "@/api/assist/script";
import Sortable from "sortablejs";

const tableIsLoading = ref(false)
const tableDataList = ref([])
const tableDataTotal = ref(0)
const userList = ref([])
const userDict = ref({})
const oldIdList = ref([])
const newIdList = ref([])
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true,
  script_type: undefined,
  file_name: undefined,
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

const scriptTypeDict = {test: '执行测试', mock: 'mock脚本', encryption: '加密脚本', decryption: '解密脚本'}

const changePagination = (pagination: any) => {
  queryItems.value.page_num = pagination.pageNum
  queryItems.value.page_size = pagination.pageSize
  getTableDataList()
}

const cellDblclick = async (row: any, column: any, event: any) => {
  try {
    await toClipboard(row[column.property]);
    ElMessage.success("已复制到粘贴板")
  } catch (e) {
    console.error(e);
  }
}

const showEditDrawer = (command: string, row: object | undefined) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'script', command: command, content: row})
}

const showRecordDrawer = (scriptName: string) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'script-mock-record', content: scriptName})
}

const deleteData = (row: object) => {
  DeleteScript({ 'id': row.id }).then(response => {
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
      // 结束拖拽
      const targetRow = tableDataList.value.splice(e.oldIndex, 1)[0]
      tableDataList.value.splice(e.newIndex, 0, targetRow)
      const tempIndex = newIdList.value.splice(e.oldIndex, 1)[0]
      newIdList.value.splice(e.newIndex, 0, tempIndex)
      sortTable()
    },
  });
}

const getTableDataList = () => {
  queryItems.value.script_type = queryItems.value.script_type ? queryItems.value.script_type : undefined
  queryItems.value.file_name = queryItems.value.file_name ? queryItems.value.file_name : undefined
  queryItems.value.create_user = queryItems.value.create_user ? queryItems.value.create_user : undefined
  tableIsLoading.value = true
  GetScriptList(queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    tableDataTotal.value = response.data.total

    oldIdList.value = tableDataList.value.map(item => item.id)
    newIdList.value = oldIdList.value.slice()
  })
}

const sortTable = () => {
  tableIsLoading.value = true
  ScriptSort({
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

const getUserList = () => {
  GetUserList({}).then((response: object) => {
    userList.value = response.data.data
    response.data.data.forEach((user: { id: string | number; name: any; }) => {
      userDict.value[user.id] = user.name
    })
  })
}

onMounted(() => {
  getUserList()
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
  if (message.eventType === 'script') {
    getTableDataList()
  }
}

</script>

<style scoped lang="scss">

</style>
