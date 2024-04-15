<template>
    <div>
      <el-table
          ref="phoneTableRef"
          v-loading="tableIsLoading"
          element-loading-text="正在获取数据"
          element-loading-spinner="el-icon-loading"
          :data="tableDataList"
          style="width: 100%"
          :header-cell-style="{'text-align':'center'}"
          stripe
          row-key="id"
          :height="tableHeight"
          @row-dblclick="rowDblclick">

        <el-table-column prop="id" label="序号" align="center" min-width="10%">
          <template #default="scope">
            <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="name" align="center" label="设备名称" min-width="25%">
          <template #default="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="os" align="center" label="系统类型" min-width="10%">
          <template #default="scope">
            <span> {{ scope.row.os }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="os_version" align="center" label="系统版本" min-width="10%">
          <template #default="scope">
            <span> {{ scope.row.os_version }} </span>
          </template>
        </el-table-column>

        <el-table-column prop="device_id" align="center" min-width="20%">
          <template #header>
            <span> 设备id </span>
            <el-tooltip class="item" effect="dark" placement="top-start" content="使用adb devices查看">
              <span style="margin-left:5px;color: #409EFF"><Help></Help></span>
            </el-tooltip>
          </template>
          <template #default="scope">
            <span> {{ scope.row.device_id }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="screen" align="center" label="分辨率" min-width="10%">
          <template #default="scope">
            <span> {{ scope.row.screen }} </span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" prop="desc" align="center" label="操作" width="110">
          <template #default="scope">
            <el-button type="text" size="small" style="margin: 0; padding: 2px" @click="showEditDrawer(scope.row)">修改</el-button>
            <el-popconfirm width="250px" title="复制此服务器并生成新的服务器?" @confirm="copyData(scope.row)">
              <template #reference>
                <el-button style="margin: 0; padding: 2px" type="text" :loading="scope.row.copyIsLoading" size="small">复制</el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm width="250px" :title="`确定删除【${ scope.row.name }】?`" @confirm="deleteData(scope.row)">
              <template #reference>
                <el-button style="margin: 0; padding: 2px;color: red" type="text" size="small">删除</el-button>
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
        <EditDrawer></EditDrawer>
        <AddDrawer></AddDrawer>
    </div>

</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount, watch, computed} from "vue";
import {Help} from "@icon-park/vue-next";
import Pagination from '@/components/pagination.vue'
import EditDrawer from './edit-drawer.vue'
import AddDrawer from './add-drawer.vue'

import {bus, busEvent} from "@/utils/bus-events";
import {ElMessage} from "element-plus";
import toClipboard from "@/utils/copy-to-memory";
import Sortable from "sortablejs";
import {GetConfigByCode} from "@/api/config/config-value";
import {ChangePhoneSort, CopyPhone, DeletePhone, GetPhoneList} from "@/api/business-api/device-phone";

const phoneTableRef = ref(null)
const tableIsLoading = ref(false)
const oldIdList = ref([])
const newIdList = ref([])
const tableDataList = ref([])
const tableDataTotal = ref(0)
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true
})
const tableHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.71}px`
  }else {  // 大屏
    return `${innerHeight * 0.81}px`
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

const deleteData = (row: { id: any; }) => {
  DeletePhone({id: row.id}).then(response => {
    if (response){
      getTableDataList()
    }
  })
}

const showEditDrawer = (row: any) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'edit-phone', content: row})
}

const copyData = (row: { copyIsLoading: boolean; id: any; }) => {
  row.copyIsLoading = true
  CopyPhone({ 'id': row.id }).then(response => {
    row.copyIsLoading = false
    if (response) {
      getTableDataList()
    }
  })
}

const getTableDataList = () => {
  tableIsLoading.value = true
  GetPhoneList(queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    tableDataTotal.value = response.data.total

    oldIdList.value = tableDataList.value.map(item => item.id)
    newIdList.value = oldIdList.value.slice()
  })
}

const sortTable = () => {
  tableIsLoading.value = true
  ChangePhoneSort({
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

const setSort = () => {
  let tbody = phoneTableRef.value.$el.querySelector(".el-table__body-wrapper tbody");
  Sortable.create(tbody, {
    group: { // 相同的组之间可以相互拖拽
      name: "table",
      pull: true,
      put: true,
    },
    animation: 150, // ms, number 单位：ms，定义排序动画的时间
    onEnd(e: any) {
      const targetRow = tableDataList.value.splice(e.oldIndex, 1)[0]
      tableDataList.value.splice(e.newIndex, 0, targetRow)
      const tempIndex = newIdList.value.splice(e.oldIndex, 1)[0]
      newIdList.value.splice(e.newIndex, 0, tempIndex)
      sortTable()
    },
  });
}

const getPhoneOsMapping = () => {
  if (busEvent.data.phoneOsMapping.length < 1){
    GetConfigByCode({ code: 'phone_os_mapping' }).then(response => {
      busEvent.data.phoneOsMapping = response.data
    })
  }
}
const getDeviceExtends = () => {
  if (Object.keys(busEvent.data.deviceExtends).length < 1){
    GetConfigByCode({ code: 'device_extends' }).then(response => {
      busEvent.data.deviceExtends = response.data
    })
  }
}

onMounted(() => {
  getTableDataList()
  getPhoneOsMapping()
  getDeviceExtends()
  setSort()
  bus.on(busEvent.drawerIsCommit, drawerIsCommit);

})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'phone-editor') {
    getTableDataList()
  }
}

</script>

<style scoped lang="scss">

</style>
