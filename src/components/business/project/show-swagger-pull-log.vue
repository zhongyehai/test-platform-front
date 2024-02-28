<template>
  <div>
    <el-drawer title="拉取swagger记录" :append-to-body="true" v-model="drawerIsShow" size="60%">
      <div>
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

          <el-table-column show-overflow-tooltip prop="status" label="状态" align="center" min-width="50%">
            <template #default="scope">
              <el-tag :type="swaggerPullStatusMappingTagType[scope.row.status]">
                {{ swaggerPullStatusMappingContent[scope.row.status] }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column show-overflow-tooltip prop="create_time" align="center" label="操作时间" min-width="25%">
            <template #default="scope">
              <span> {{ scope.row.create_time }} </span>
            </template>
          </el-table-column>

          <el-table-column show-overflow-tooltip prop="create_user" align="center" label="操作人员" min-width="25%">
            <template #default="scope">
              <span> {{ userDict[scope.row.create_user] }} </span>
            </template>
          </el-table-column>

          <el-table-column fixed="right" show-overflow-tooltip prop="desc" align="center" label="操作" min-width="20%">
            <template #default="scope">
              <el-button style="margin: 0; padding: 5px" type="text" size="small" @click.native="showDetail(scope.row)">详情</el-button>
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

      <div>
        <el-drawer
            title="拉取swagger详情"
            size="50%"
            :append-to-body="true"
            v-model="pullLogDetailIsShow"
        >
          <div style="margin-right: 20px;margin-left: 20px">

            <div style="margin-bottom: 20px">
              <label class="label-style">触发人：</label>
              <span>{{ userDict[pullLogDetailData.create_user] }}</span>
            </div>

            <div style="margin-bottom: 20px">
              <label class="label-style">请求参数：</label>
              <show-json :json-data="pullLogDetailData.pull_args"/>
            </div>

            <div>
              <label class="label-style">备注信息：</label>
              <el-input
                  :value="pullLogDetailData.desc || ''"
                  disabled
                  style="width: 100%"
                  size="small"
                  type="textarea"
                  :rows="2"
              />
            </div>
          </div>

        </el-drawer>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>

import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import {bus, busEvent} from "@/utils/bus-events";
import showJson from "@/components/show-json.vue";
import { GetSwaggerPullLogList, GetSwaggerPullLog } from '@/api/assist/swagger'
import {swaggerPullStatusMappingContent, swaggerPullStatusMappingTagType} from "@/components/business/mapping";
import Pagination from "@/components/pagination.vue";
import toClipboard from "@/utils/copy-to-memory";
import {ElMessage} from "element-plus";

const props = defineProps({
  userDict: {
    default: {},
    type: Object
  }
})

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'show-swagger-pull-log') {
    queryItems.value.project_id = message.content.id
    getTableDataList()
    drawerIsShow.value = true
  }
}

const pullLogDetailData = ref({})
const pullLogDetailIsShow = ref(false)
const drawerIsShow = ref(false)
const tableIsLoading = ref(false)
const tableHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.78}px`
  }else {  // 大屏
    return `${innerHeight * 0.85}px`
  }
})
const tableDataList = ref([])
const tableDataTotal = ref(0)
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true,
  project_id: undefined
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

const getTableDataList = () => {
  tableIsLoading.value = true
  GetSwaggerPullLogList(queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    tableDataTotal.value = response.data.total
  })
}

const showDetail = (row: { id: any; }) => {
  GetSwaggerPullLog({id: row.id}).then(response => {
    pullLogDetailData.value = response.data
    pullLogDetailIsShow.value = true
  })
}
</script>


<style scoped lang="scss">

</style>
