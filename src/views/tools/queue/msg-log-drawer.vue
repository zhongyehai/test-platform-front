<template>
  <div>
    <el-drawer
        title="消息发送记录"
        size="70%"
        :append-to-body="true"
        v-model="queueDrawerIsShow"
    >
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

            <el-table-column prop="id" label="序号" align="center" min-width="10%" >
              <template #default="scope">
                <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
              </template>
            </el-table-column>

            <el-table-column show-overflow-tooltip label="消息内容" prop="message" align="center" min-width="50%">
              <template #default="scope">
                <span> {{ scope.row.message }} </span>
              </template>
            </el-table-column>

            <el-table-column show-overflow-tooltip label="发送时间" prop="create_time" align="center" min-width="15%">
              <template #default="scope">
                <span>{{ scope.row.create_time }}</span>
              </template>
            </el-table-column>

            <el-table-column show-overflow-tooltip label="发送人" prop="create_user" align="center" min-width="10%">
              <template #default="scope">
                <span>{{ userDict[scope.row.create_user] }}</span>
              </template>
            </el-table-column>

            <el-table-column show-overflow-tooltip align="center" label="操作" min-width="15%">
              <template #default="scope">
                <el-button
                    type="text"
                    size="small"
                    @click="showEditQueueDrawer('sendMsg', scope.row)"
                >再次发送
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

      <template #footer>
        <div slot="footer" class="demo-drawer__footer">
          <el-button
              size="small"
              type="primary"
              style="float: left"
              @click="showEditQueueDrawer"
          >添加队列</el-button>
        </div>
      </template>
    </el-drawer>
  </div>

</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";

import {bus, busEvent} from "@/utils/bus-events";
import {GetQueueLogList} from "@/api/tools/queue";
import toClipboard from "@/utils/copy-to-memory";
import {ElMessage} from "element-plus";
import Pagination from "@/components/pagination.vue";

const props = defineProps({
  userDict: {
    default: {},
    type: Object
  }
})

const queueDrawerIsShow = ref(false)
const tableIsLoading = ref(false)
const tableDataList = ref([])
const tableHeight = localStorage.getItem('tableHeight')
const tableDataTotal = ref(0)
const queryItems = ref({page_num: 1, page_size:20, queue_id: undefined})

const changePagination = (pagination: any) => {
  queryItems.value.page_num = pagination.pageNum
  queryItems.value.page_size = pagination.pageSize
  getTableDataList()
}

const showEditQueueDrawer = (command: string, row: object | null) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'queue-info', command: command, content: row.queue_id})
}

const rowDblclick = async (row: any, column: any, event: any) => {
  try {
    await toClipboard(row[column.property]);
    ElMessage.success("已复制到粘贴板")
  } catch (e) {
    console.error(e);
  }
}

const getTableDataList = () => {
  tableIsLoading.value = true
  GetQueueLogList(queryItems.value).then(response => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
  })
}

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'queue-msg-log') {
    queryItems.value.queue_id = message.content
    getTableDataList()
    queueDrawerIsShow.value = true
  }
}

</script>

<style scoped lang="scss">

</style>
