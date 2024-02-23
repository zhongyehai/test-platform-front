<template>
  <div class="layout-container">

    <div class="layout-container-form flex space-between">
      <div class="layout-container-form-handle">
        <el-button type="primary" @click="showEditDrawer(undefined, 'add')"> 添加权限</el-button>
      </div>

      <div class="layout-container-form-search">
        <el-input
            v-model="queryItems.name"
            clearable
            size="small"
            style="width: 400px; margin-right: 10px"
            placeholder="权限名，支持模糊搜索"/>
        <el-input
            v-model="queryItems.source_addr"
            clearable
            size="small"
            style="width: 400px; margin-right: 10px"
            placeholder="权限地址，支持模糊搜索"/>

        <el-button type="primary" @click="getTableDataList()"> 搜索</el-button>
      </div>
    </div>

    <div style="margin: 0 10px 0 10px">
      <el-tabs v-model="activeName" @tab-change="changePermissionType">
        <el-tab-pane label="前端权限" name="front" />
        <el-tab-pane label="后端权限" name="api" />
      </el-tabs>
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
        <el-table-column prop="id" label="序号" align="center" min-width="6%">
          <template #default="scope">
            <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="权限类型" prop="source_type" align="center" min-width="8%">
          <template #default="scope">
            <span> {{ sourceTypeDict[scope.row.source_type] }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="权限名" prop="name" align="center" min-width="20%">
          <template #default="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="权限地址" prop="source_addr" align="center" min-width="20%">
          <template #default="scope">
            <span> {{ scope.row.source_addr }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="备注" prop="desc" align="center" min-width="10%">
          <template #default="scope">
            <span> {{ scope.row.desc }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="创建时间" prop="create_time" align="center" min-width="12%">
          <template #default="scope">
            <span>{{ scope.row.create_time }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" label="操作" min-width="10%">
          <template #default="scope">
            <el-button type="text" size="small" style="margin: 0; padding: 5px" @click.native="showEditDrawer(scope.row, 'copy')">复制</el-button>
            <el-button type="text" size="small" style="margin: 0; padding: 5px" @click.native="showEditDrawer(scope.row, 'edit')">修改</el-button>
            <el-popconfirm :title="`确定删除【${ scope.row.name }】?`" @confirm="deleteData(scope.row.id)">
              <template #reference>
                <el-button style="margin: 0; padding: 5px;color: red" type="text" size="small">删除</el-button>
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

    <EditDrawer :source-type-dict="sourceTypeDict" :active-name="activeName"></EditDrawer>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount} from "vue";
import Pagination from '@/components/pagination.vue'
import EditDrawer from './drawer.vue'

import {bus, busEvent} from "@/utils/bus-events";
import {DeletePermission, GetPermissionList, GetPermissionType} from "@/api/system/permission";

const activeName = ref('front')
const tableIsLoading = ref(false)
const tableDataList = ref([])
const sourceTypeDict = ref({})
const tableDataTotal = ref(0)
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true,
  source_addr: undefined,
  name: undefined,
  source_type: 'front'
})
const tableHeight = localStorage.getItem('tableHeight')

const changePagination = (pagination: any) => {
  queryItems.value.page_num = pagination.pageNum
  queryItems.value.page_size = pagination.pageSize
  getTableDataList()
}

const showEditDrawer = (row: object | undefined, command: string) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'permission', content: row, 'command': command});
}

const deleteData = (dataId: number) => {
  DeletePermission({id: dataId}).then(response => {
    if (response){
      getTableDataList()
    }
  })
}

const getTableDataList = () => {
  queryItems.value.name = queryItems.value.name ? queryItems.value.name : undefined
  queryItems.value.source_addr = queryItems.value.source_addr ? queryItems.value.source_addr : undefined
  tableIsLoading.value = true
  GetPermissionList(queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    tableDataTotal.value = response.data.total
  })
}

const changePermissionType = (name: string) => {
  queryItems.value.page_num = 1
  queryItems.value.source_type = name
  getTableDataList()
}


onMounted(() => {

  GetPermissionType().then(response => {
    sourceTypeDict.value = response.data
  })

  getTableDataList()

  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'permission') {
    getTableDataList()
  }
}

</script>

<style scoped lang="scss">

</style>
