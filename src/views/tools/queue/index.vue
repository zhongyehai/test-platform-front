<template>
  <div class="layout-container">

    <div class="layout-container-form flex space-between">
      <div class="layout-container-form-handle">
        <el-button
            type="primary"
            size="small"
            style="margin-left: 10px"
            @click.native="showEditDrawer('add', null)"
        >新增链接
        </el-button>
      </div>

      <div class="layout-container-form-search">
        <el-select
            style="margin-right: 10px"
            v-model="queryItems.queue_type"
            placeholder="队列类型"
            filterable
            default-first-option
            clearable
            size="small"
            class="filter-item"
        >
          <el-option v-for="(value, key) in queueTypeDict" :key="key" :label="value" :value="key" />
        </el-select>

        <el-input
            style="margin-right: 10px"
            v-model="queryItems.host"
            placeholder="队列链接地址，支持模糊搜索"
            size="small"
            clearable
        />

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
          :height="tableHeight"
          row-key="id"
          @cell-dblclick="rowDblclick">
        <el-table-column prop="id" label="序号" align="center" min-width="5%" >
          <template #default="scope">
            <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="类型" prop="queue_type" align="center" min-width="5%">
          <template #default="scope">
            <span> {{ queueTypeDict[scope.row.queue_type] }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="地址" prop="host" align="center" min-width="20%">
          <template #default="scope">
            <span> {{ scope.row.host }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="端口" prop="port" align="center" min-width="15%">
          <template #default="scope">
            <span>{{ scope.row.port }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="备注" prop="desc" align="center" min-width="10%">
          <template #default="scope">
            <span>{{ scope.row.desc }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="创建者" prop="create_user" align="center" min-width="10%">
          <template #default="scope">
            <span>{{ userDict[scope.row.create_user] }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" label="操作" width="140">
          <template #default="scope">
            <el-button
                type="text"
                size="small" style="margin: 0; padding: 2px"
                @click="showQueueList(scope.row)"
            >队列列表
            </el-button>

            <!--修改文件信息-->
            <el-button
                type="text"
                size="small" style="margin: 0; padding: 2px"
                @click="showEditDrawer('edit', scope.row)"
            >修改
            </el-button>

            <!-- 复制 -->
            <el-button
                type="text"
                size="small" style="margin: 0; padding: 2px"
                @click="showEditDrawer('copy', scope.row)"
            >复制
            </el-button>

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

    <queueLinkEditDrawer :queue-type-dict="queueTypeDict"></queueLinkEditDrawer>
    <queueListDrawer :user-dict="userDict"></queueListDrawer>
  </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import queueListDrawer from './queue-list-drawer.vue'
import queueLinkEditDrawer from './queue-link-edit-drawer.vue'

import {bus, busEvent} from "@/utils/bus-events";
import {GetQueueLinkList} from "@/api/tools/queue";
import Pagination from "@/components/pagination.vue";
import {GetUserList} from "@/api/system/user";
import toClipboard from "@/utils/copy-to-memory";
import {ElMessage} from "element-plus";

const tableIsLoading = ref(false)
const tableDataList = ref([])
const tableHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.73}px`
  }else {  // 大屏
    return `${innerHeight * 0.82}px`
  }
})
const tableDataTotal = ref(0)
const queryItems = ref({page_num: 1, page_size:20, host: undefined, queue_type: undefined})
const userDict = ref({})
const queueTypeDict =  { 'rocket_mq': 'rocketmq', 'rabbit_mq': 'rabbitmq', 'redis': 'redis' }

const changePagination = (pagination: any) => {
  queryItems.value.page_num = pagination.pageNum
  queryItems.value.page_size = pagination.pageSize
  getTableDataList()
}

const showEditDrawer = (command: string, row: object | null) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'queue-link-info', command: command, content: row});
}

const showQueueList = (row: any) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'queue-list-info', content: row})
}

const rowDblclick = async (row: any, column: any, event: any) => {
  try {
    await toClipboard(row[column.property]);
    ElMessage.success("已复制到粘贴板")
  } catch (e) {
    console.error(e);
  }
}

const getUserList = () => {
  GetUserList({page_num: 1, page_size: 99999}).then(response => {
    response.data.data.forEach(user => {
      userDict.value[user.id] = user.name
    })
  })
}

const getTableDataList = () => {
  queryItems.value.host = queryItems.value.host ? queryItems.value.host : undefined
  queryItems.value.queue_type = queryItems.value.queue_type ? queryItems.value.queue_type : undefined
  tableIsLoading.value = true
  GetQueueLinkList(queryItems.value).then(response => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    tableDataTotal.value = response.data.total
  })
}

onMounted(() => {
  getUserList()
  getTableDataList()
  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'queue-link-info') {
    getTableDataList()
  }
}

</script>

<style scoped lang="scss">

</style>
