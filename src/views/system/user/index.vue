<template>
  <div class="layout-container">

    <div class="layout-container-form flex space-between">
      <div class="layout-container-form-handle">
        <el-button type="primary" @click="showEditDrawer(undefined)"> 添加用户</el-button>
      </div>

      <div class="layout-container-form-search">
        <el-input
            v-model="queryItems.name"
            clearable
            size="small"
            style="width: 200px; margin-right: 10px"
            placeholder="用户名，支持模糊搜索"/>

        <el-input
            v-model="queryItems.account"
            clearable
            size="small"
            style="width: 200px; margin-right: 10px"
            placeholder="账号，支持模糊搜索"/>

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
        <el-table-column prop="id" label="序号" align="center" min-width="10%">
          <template #default="scope">
            <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="用户名" prop="name" align="center" min-width="20%">
          <template #default="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="账号" prop="desc" align="center" min-width="20%">
          <template #default="scope">
            <span> {{ scope.row.account }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="启用状态" prop="status" align="center"  min-width="15%">
          <template #default="scope">
            <el-switch v-model="scope.row.status" :loading="scope.row.loading" @change="changStatus(scope.row)"/>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="创建时间" prop="create_time" align="center" min-width="20%">
          <template #default="scope">
            <span>{{ scope.row.create_time }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" label="操作" width="110">
          <template #default="scope">
            <el-button type="text" size="small" style="margin: 0; padding: 2px" @click.native="showEditDrawer(scope.row)">修改</el-button>
            <el-popconfirm :title="`确定重置【${ scope.row.name }】的密码?`" @confirm="resetPassword(scope.row.id)">
              <template #reference>
                <el-button style="margin: 0; padding: 2px" type="text" size="small">重置密码</el-button>
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

    <EditDrawer :business-list="businessList" :role-list="roleList"></EditDrawer>
    <AddDrawer :business-list="businessList" :role-list="roleList"></AddDrawer>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount, computed} from "vue";
import Pagination from '@/components/pagination.vue'
import EditDrawer from './edit-drawer.vue'
import AddDrawer from './add-drawer.vue'

import {bus, busEvent} from "@/utils/bus-events";
import {GetUserList, ChangeUserStatus, ResetPassword, GetUserRoles} from "@/api/system/user";
import {GetRoleList} from "@/api/system/role";
import {GetBusinessList} from "@/api/config/business";

const tableIsLoading = ref(false)
const tableDataList = ref([])
const tableDataTotal = ref(0)
const roleList = ref([])
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true,
  name: undefined,
  account: undefined
})
const tableHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.73}px`
  }else {  // 大屏
    return `${innerHeight * 0.82}px`
  }
})

const changePagination = (pagination: any) => {
  queryItems.value.page_num = pagination.pageNum
  queryItems.value.page_size = pagination.pageSize
  getTableDataList()
}

const showEditDrawer = (row: object | undefined) => {
  if (row){
    GetUserRoles({ id: row.id }).then(response => {
      row.role_list = response.data
      bus.emit(busEvent.drawerIsShow, {eventType: 'editUser', content: row});
    })
  }else {
    bus.emit(busEvent.drawerIsShow, {eventType: 'addUser', content: row});
  }
}

const changStatus = (row: object) => {
  row.loading = true
  ChangeUserStatus({ 'id': row.id }).then(response => {
    row.loading = false
    if (response){
      getTableDataList()
    }
  })
}

const resetPassword = (dataId: number) => {
  ResetPassword({id: dataId}).then(response => {})
}

const getTableDataList = () => {
  queryItems.value.name = queryItems.value.name ? queryItems.value.name : undefined
  queryItems.value.account = queryItems.value.account ? queryItems.value.account : undefined
  tableIsLoading.value = true
  GetUserList(queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = []
    response.data.data.forEach((item: any) => {
      item.status = item.status === 1
      tableDataList.value.push(item)
    })
    tableDataTotal.value = response.data.total
  })
}

onMounted(() => {
  getTableDataList()
  getBusinessList()
  GetRoleList({page_num:1, page_size: 99999}).then(response => {
    roleList.value = response.data.data
  })

  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'user') {
    getTableDataList()
  }
}

const businessList = ref([])
const getBusinessList = () => {
  if (businessList.value.length < 1){
    GetBusinessList({page_num: 1, page_size: 99999}).then(response => {
      businessList.value = response.data.data
    })
  }
}



</script>

<style scoped lang="scss">

</style>
