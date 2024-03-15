<template>
    <div>
      <el-table
          ref="elementTableRef"
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

        <el-table-column prop="id" label="序号" align="center" min-width="6%">
          <template #default="scope">
            <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="name" label="元素名称" min-width="15%">
          <template #default="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="by" align="center" min-width="12%">
          <template #header>
            <span>定位方式</span>
            <el-tooltip class="item" effect="dark" placement="top-start" content="在此处新增/修改地址（定位方式为【页面地址】）后，会自动同步到页面信息的页面地址">
              <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></span>
            </el-tooltip>
          </template>
          <template #default="scope">
            <span> {{ busEvent.data.findElementOptionDict[scope.row.by] }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="element" align="center" label="元素表达式" min-width="42%">
          <template #default="scope">
            <span> {{ scope.row.element }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="wait_time_out" align="center" min-width="10%">
          <template #header>
            <span>等待时间(秒)</span>
            <el-tooltip class="item" effect="dark" placement="top-start" content="预设等待元素出现的超时时间，再执行用例时，将会执行此时间的等待(秒)">
              <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></span>
            </el-tooltip>
          </template>
          <template #default="scope">
            <span> {{ scope.row.wait_time_out }} </span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" prop="desc" align="center" label="操作" width="120">
          <template #default="scope">
            <el-button type="text" size="small" style="margin: 0; padding: 2px" @click="showEditDrawer('edit', scope.row)">修改</el-button>
            <el-popconfirm width="250px" title="复制此元素并生成新的元素?" @confirm="showEditDrawer('copy', scope.row)">
              <template #reference>
                <el-button style="margin: 0; padding: 2px" type="text" size="small">复制</el-button>
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
        <EditDrawer :test-type="testType" :device-list="deviceList"></EditDrawer>
        <AddDrawer :test-type="testType" :device-list="deviceList"></AddDrawer>
    </div>

</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount, watch, computed} from "vue";
import Pagination from '@/components/pagination.vue'
import EditDrawer from './edit-drawer.vue'
import AddDrawer from './add-drawer.vue'

import {bus, busEvent} from "@/utils/bus-events";
import {ElMessage} from "element-plus";
import toClipboard from "@/utils/copy-to-memory";
import {GetElementList, DeleteElement, ChangeElementSort, CopyElement} from "@/api/business-api/element";
import Sortable from "sortablejs";
import {GetPhoneList} from "@/api/business-api/device-phone";

const props = defineProps({
  testType: {
    default: '',
    type: String
  },
  pageId: {
    default: undefined,
    type: Number
  }
})

watch(() => props.pageId, (newValue, oldValue) => {
  if (newValue){
    queryItems.value.page_id = newValue
    getTableDataList()
  }
})

const elementTableRef = ref(null)
const tableIsLoading = ref(false)
const deviceList = ref([])
const oldIdList = ref([])
const newIdList = ref([])
const tableDataList = ref([])
const tableDataTotal = ref(0)
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true,
  page_id: undefined
})
const tableHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.63}px`
  }else {  // 大屏
    return `${innerHeight * 0.76}px`
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
  DeleteElement(props.testType, {id: row.id}).then(response => {
    if (response){
      getTableDataList()
    }
  })
}

const showEditDrawer = (command: string, row: any) => {
  bus.emit(busEvent.drawerIsShow, {
    eventType: command === 'add' ? 'add-element' : 'edit-element',
    content: row,
    command: command,
    page_id: queryItems.value.page_id
  })
}

const getTableDataList = () => {
  tableIsLoading.value = true
  GetElementList(props.testType, queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    tableDataTotal.value = response.data.total

    oldIdList.value = tableDataList.value.map(item => item.id)
    newIdList.value = oldIdList.value.slice()
  })
}

const sortTable = () => {
  tableIsLoading.value = true
  ChangeElementSort(props.testType, {
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
  let tbody = elementTableRef.value.$el.querySelector(".el-table__body-wrapper tbody");
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

onMounted(() => {
  if (props.testType === 'app' && deviceList.value.length === 0) {
    GetPhoneList({ page_num: 1, page_size: 99999 }).then(response => {
      deviceList.value = response.data.data
    })
  }
  setSort()
  bus.on(busEvent.drawerIsCommit, drawerIsCommit);

})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'element-editor') {
    getTableDataList()
  }
}

</script>

<style scoped lang="scss">

</style>
