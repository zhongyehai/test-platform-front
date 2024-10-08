<template>
  <div>
    <el-drawer
        title="topic管理"
        size="85%"
        :append-to-body="true"
        v-model="queueDrawerIsShow"
    >
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

        <el-table-column show-overflow-tooltip label="topic名" prop="topic" align="center" min-width="20%">
          <template #default="scope">
            <span> {{ scope.row.topic }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="备注" prop="desc" align="center" min-width="15%">
          <template #default="scope">
            <span>{{ scope.row.desc }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="创建者" prop="create_user" align="center" min-width="5%">
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
                style="margin: 0; padding: 2px;color: #FF6600"
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

      <template #footer>
        <div slot="footer" class="demo-drawer__footer">
          <el-button
              size="small"
              type="primary"
              style="float: left"
              @click="showEditQueueDrawer"
          >添加topic</el-button>
        </div>
      </template>
    </el-drawer>
  </div>

  <topicEditDrawer :queue-instance-id="queryItems.instance_id"></topicEditDrawer>
  <msgLogDrawer :user-dict="props.userDict"></msgLogDrawer>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import topicEditDrawer from './edit-drawer.vue'
import msgLogDrawer from './msg-log-drawer.vue'

import {bus, busEvent} from "@/utils/bus-events";
import {GetQueueTopicList} from "@/api/tools/queue";
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

const tableDataTotal = ref(0)
const queryItems = ref({page_num: 1, page_size:20, instance_id: undefined})

const changePagination = (pagination: any) => {
  queryItems.value.page_num = pagination.pageNum
  queryItems.value.page_size = pagination.pageSize
  getTableDataList()
}

const showEditQueueDrawer = (command: string, row: object | null) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'queue-topic', command: command, content: {topic_id: row ? row.id : row}})
}

const showMsgLogDrawer = (row: any) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'queue-topic-msg-log', content: row.id})
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
  GetQueueTopicList(queryItems.value).then(response => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
  })
}

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
  bus.on(busEvent.drawerIsCommit, onShowDrawerCommitEvent);
  setTableHeight()
  window.addEventListener('resize', handleResize);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
  bus.off(busEvent.drawerIsCommit, onShowDrawerCommitEvent);
  window.removeEventListener('resize', handleResize);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'queue-topic-list') {
    queryItems.value.instance_id = message.content.id
    getTableDataList()
    queueDrawerIsShow.value = true
  }
}

const onShowDrawerCommitEvent = (message: any) => {
  if (message.eventType === 'queue-topic-commit') {
    getTableDataList()
  }
}

</script>

<style scoped lang="scss">

</style>
