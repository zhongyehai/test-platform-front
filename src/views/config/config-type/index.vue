<template>
  <div class="layout-container">

    <div class="layout-container-form flex space-between">
      <div class="layout-container-form-handle">
        <el-button type="primary" @click="showEditDrawer(undefined)"> 添加类型</el-button>
      </div>

      <div class="layout-container-form-search">
        <el-input
            v-model="queryItems.name"
            clearable
            size="small"
            style="width: 400px; margin-right: 10px"
            placeholder="配置类型名，支持模糊搜索"/>

        <el-select
            v-model="queryItems.create_user"
            size="small"
            clearable
            placeholder="创建人"
            style="margin-right: 10px">
          <el-option v-for="user in userList" :key="user.id" :label="user.name" :value="user.id"/>
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
        <el-table-column prop="id" label="序号" align="center" min-width="10%">
          <template #default="scope">
            <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="name" align="center" label="参数类型" min-width="35%">
          <template #default="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="desc" align="center" label="备注" min-width="35%">
          <template #default="scope">
            <span> {{ scope.row.desc }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="create_user" align="center" label="创建者" min-width="10%">
          <template #default="scope">
            <span>{{ parseUser(scope.row.create_user) }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" show-overflow-tooltip prop="desc" align="center" label="操作" min-width="10%">
          <template #default="scope">
            <el-button type="text" size="small" @click.native="showEditDrawer(scope.row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
          v-show="configTypeTotal > 0"
          :pageNum="queryItems.page_num"
          :pageSize="queryItems.page_size"
          :total="configTypeTotal"
          @pageFunc="changePagination"
      />
    </div>

    <EditDrawer></EditDrawer>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, Ref, computed, onBeforeUnmount} from "vue";
import Pagination from '@/components/pagination.vue'
import EditDrawer from './drawer.vue'

import {GetConfigTypeList} from "@/api/config/config-type";
import {GetUserList} from "@/api/system/user";
import {bus, busEvent} from "@/utils/bus-events";

const tableIsLoading = ref(false)
const tableDataList = ref([])
const userList = ref([])
const userDict: Ref<{ id: number | undefined; name: string | undefined; }> = ref({id: undefined, name: undefined})
const configTypeTotal = ref(0)
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true,
  create_user: undefined,
  name: undefined
})
const tableHeight = localStorage.getItem('tableHeight')

const changePagination = (pagination: any) => {
  queryItems.value.page_num = pagination.pageNum
  queryItems.value.page_size = pagination.pageSize
  getTableDataList()
}

const showEditDrawer = (row: object | undefined) => {
  const content = row ? row : {id: undefined, name: undefined, desc: undefined}
  bus.emit(busEvent.drawerIsShow, {eventType: 'config-type', content: content});
}

// 解析用户
const parseUser = (userId: number) => {
  return userDict.value[userId]
}

// 获取配置类型列表
const getTableDataList = () => {
  queryItems.value.create_user = queryItems.value.create_user ? queryItems.value.create_user : undefined
  queryItems.value.name = queryItems.value.name ? queryItems.value.name : undefined
  tableIsLoading.value = true
  GetConfigTypeList(queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    configTypeTotal.value = response.data.total
  })
}

onMounted(() => {
  // 获取用户列表
  GetUserList({}).then((response: object) => {
    userList.value = response.data.data
    response.data.data.forEach((user: any) => {
      userDict.value[user.id] = user.name
    })
  })

  // 获取配置类型列表
  getTableDataList()

  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'config-type') {
    getTableDataList()
  }
}

</script>

<style scoped lang="scss">

</style>
