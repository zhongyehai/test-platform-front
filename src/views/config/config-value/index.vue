<template>
  <div class="layout-container">

    <div class="layout-container-form flex space-between">
      <div class="layout-container-form-handle">
        <el-button type="primary" @click="showEditDrawer(undefined)"> 添加配置</el-button>
      </div>

      <div class="layout-container-form-search">
        <el-select
            v-model="queryItems.type"
            placeholder="选择配置分类"
            clearable
            filterable
            default-first-option
            style="margin-right: 10px"
            size="small"
        >
          <el-option v-for="type in configTypeList" :key="type.id" :label="type.name" :value="type.id"/>
        </el-select>

        <el-input
            v-model="queryItems.name"
            clearable
            size="small"
            style="width: 200px; margin-right: 10px"
            placeholder="配置code，支持模糊搜索"/>

        <el-input
            v-model="queryItems.value"
            class="input-with-select"
            placeholder="配置值，支持模糊搜索"
            size="small"
            clearable
            style="width: 200px; margin-right: 10px"
        />

        <el-select
            v-model="queryItems.create_user"
            size="small"
            clearable
            placeholder="创建人"
            style="margin-right: 10px">
          <el-option v-for="user in userList" :key="user.id" :label="user.name" :value="user.id"/>
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
          @row-dblclick="rowDblclick">

        <el-table-column prop="id" label="序号" align="center" min-width="10%">
          <template #default="scope">
            <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="name" align="center" label="配置code" min-width="20%">
          <template #default="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="value" align="center" label="配置值" min-width="28%">
          <template #default="scope">
            <span> {{ scope.row.value }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="desc" align="center" label="备注" min-width="20%">
          <template #default="scope">
            <span> {{ scope.row.desc }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="desc" align="center" label="配置分类" min-width="10%">
          <template #default="scope">
            <span> {{ parseConfigType(scope.row.type) }} </span>
          </template>
        </el-table-column>

        <!--        <el-table-column show-overflow-tooltip prop="create_user" align="center" label="创建者" min-width="10%">-->
        <!--          <template #default="scope">-->
        <!--            <span>{{ parseUser(scope.row.create_user) }}</span>-->
        <!--          </template>-->
        <!--        </el-table-column>-->

        <el-table-column fixed="right" show-overflow-tooltip prop="desc" align="center" label="操作" width="80">
          <template #default="scope">
            <el-button type="text" size="small" @click.native="showEditDrawer(scope.row)">修改</el-button>
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

    <EditDrawer :config-type-list="configTypeList"></EditDrawer>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, computed, onBeforeUnmount} from "vue";
import Pagination from '@/components/pagination.vue'
import EditDrawer from './drawer.vue'

import {GetConfigTypeList} from "@/api/config/config-type";
import {GetUserList} from "@/api/system/user";
import {GetConfigList} from "@/api/config/config-value";
import {bus, busEvent} from "@/utils/bus-events";
import {ElMessage} from "element-plus";
import toClipboard from "@/utils/copy-to-memory";

const tableIsLoading = ref(false)
const configTypeList = ref([])
const configTypeDict = ref({})
const tableDataList = ref([])
const userList = ref([])
const tableDataTotal = ref(0)
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true,
  type: undefined,
  create_user: undefined,
  name: undefined,
  value: undefined
})
const tableHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.73}px`
  }else {  // 大屏
    return `${innerHeight * 0.82}px`
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

const parseConfigType = (row_id: number) => {
  return configTypeDict.value[row_id]
}

const showEditDrawer = (row: object | undefined) => {
  const content = row ? row : {id: undefined, type: undefined, name: undefined, value: undefined, desc: undefined}
  bus.emit(busEvent.drawerIsShow, {eventType: 'config-value', content: content});
}


// 获取配置列表
const getTableDataList = () => {
  queryItems.value.type = queryItems.value.type ? queryItems.value.type : undefined
  queryItems.value.name = queryItems.value.name ? queryItems.value.name : undefined
  queryItems.value.value = queryItems.value.value ? queryItems.value.value : undefined
  queryItems.value.create_user = queryItems.value.create_user ? queryItems.value.create_user : undefined
  tableIsLoading.value = true
  GetConfigList(queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    tableDataTotal.value = response.data.total
  })
}

const getUserList = () => {
  GetUserList({}).then((response: object) => {
    userList.value = response.data.data
  })
}

const getConfigTypeList = () => {
  GetConfigTypeList({}).then((response: object) => {
    configTypeList.value = response.data.data
    response.data.data.forEach((item: any) => {
      configTypeDict.value[item.id] = item.name
    })
  })
}

onMounted(() => {
  getUserList()
  getConfigTypeList()
  getTableDataList()
  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'config-value') {
    getTableDataList()
  }
}

</script>

<style scoped lang="scss">

</style>
