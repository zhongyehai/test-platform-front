<template>
  <div>
    <el-drawer
        title="队列管理"
        size="85%"
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
            <el-table-column prop="id" label="序号" align="center" min-width="5%" >
              <template #default="scope">
                <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
              </template>
            </el-table-column>

            <el-table-column show-overflow-tooltip label="队列名" prop="queue_name" align="center" min-width="20%">
              <template #default="scope">
                <span> {{ scope.row.queue_name }} </span>
              </template>
            </el-table-column>

            <el-table-column show-overflow-tooltip label="备注" prop="desc" align="center" min-width="15%">
              <template #default="scope">
                <span>{{ scope.row.desc }}</span>
              </template>
            </el-table-column>

            <el-table-column show-overflow-tooltip label="创建者" prop="create_user" align="center" min-width="10%">
              <template #default="scope">
                <span>{{ userDict[scope.row.create_user] }}</span>
              </template>
            </el-table-column>

            <el-table-column show-overflow-tooltip align="center" label="操作" width="180">
              <template #default="scope">
                <el-button
                    style="margin: 0; padding: 2px"
                    type="text"
                    size="small"
                    @click="showEditQueueDrawer('update', scope.row)"
                >修改
                </el-button>

                <el-button
                    type="text"
                    size="small"
                    style="margin: 0; padding: 2px"
                    @click="showEditQueueDrawer('copy', scope.row)"
                >复制
                </el-button>

                <el-button
                    style="margin: 0; padding: 2px"
                    type="text"
                    size="small"
                    @click="showEditQueueDrawer('sendMsg', scope.row)"
                >发消息
                </el-button>

                <el-button
                    type="text"
                    size="small"
                    style="margin: 0; padding: 2px"
                    @click="showMsgLogDrawer(scope.row)"
                >发送记录
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

  <queueEditDrawer :queue-link-id="queryItems.link_id"></queueEditDrawer>
  <msgLogDrawer :user-dict="props.userDict"></msgLogDrawer>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import queueEditDrawer from './queue-edit-drawer.vue'
import msgLogDrawer from './msg-log-drawer.vue'

import {bus, busEvent} from "@/utils/bus-events";
import {GetQueueList} from "@/api/tools/queue";
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
const tableHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.73}px`
  }else {  // 大屏
    return `${innerHeight * 0.82}px`
  }
})
const tableDataTotal = ref(0)
const queryItems = ref({page_num: 1, page_size:20, link_id: undefined})

const changePagination = (pagination: any) => {
  queryItems.value.page_num = pagination.pageNum
  queryItems.value.page_size = pagination.pageSize
  getTableDataList()
}

const showEditQueueDrawer = (command: string, row: object | null) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'queue-info', command: command, content: row ? row.id : row})
}

const showMsgLogDrawer = (row: any) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'queue-msg-log', content: row.id})
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
  GetQueueList(queryItems.value).then(response => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
  })
}

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
  bus.on(busEvent.drawerIsCommit, onShowDrawerCommitEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
  bus.off(busEvent.drawerIsCommit, onShowDrawerCommitEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'queue-list-info') {
    queryItems.value.link_id = message.content.id
    getTableDataList()
    queueDrawerIsShow.value = true
  }
}

const onShowDrawerCommitEvent = (message: any) => {
  if (message.eventType === 'queue-info') {
    getTableDataList()
  }
}

</script>

<style scoped lang="scss">

</style>
