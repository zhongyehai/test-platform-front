<template>
  <div>
    <el-table
      ref="caseSuiteSortTableRef"
      v-loading="tableIsLoading"
      :data="tableDataList"
      stripe
      size="small"
      row-key="id">

      <el-table-column label="序号" min-width="10%">
        <template #default="scope">
          <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column label="名字" min-width="80%">
        <template #default="scope">
          <div>{{ scope.row.name }}</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import Sortable from "sortablejs"
import {bus, busEvent} from "@/utils/bus-events";
import {GetCaseSuiteList, ChangeCaseSuiteSort} from "@/api/business-api/case-suite";
import {GetModuleList, ChangeModuleSort} from "@/api/business-api/module";

const props = defineProps({
  testType: {
    default: '',
    type: String
  },
  useType:{
    default: 'module',
    type: String
  }
})

const caseSuiteSortTableRef = ref(null)
const tableIsLoading = ref(false)
const tableDataList = ref([])
const projectId = ref()
const parent = ref()
const pageNum = ref(1)
const pageSize = ref(9999)
const oldIdList = ref([])
const newIdList = ref([])

const getTableDataList = () => {
  let getFunc = props.useType === 'module' ?  GetModuleList : GetCaseSuiteList
  tableIsLoading.value = true
  getFunc(props.testType,{project_id: projectId.value, parent: parent.value}).then(response => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data

    oldIdList.value = tableDataList.value.map(v => v.id)
    newIdList.value = oldIdList.value.slice()
  })
}

onMounted(() => {
  setSort()
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'sort-case-suite') {
    projectId.value = message.content.project_id
    parent.value = message.content.parent
    getTableDataList()
  }
}

const sortTable = () => {
  let sortFunc = props.useType === 'module' ?  ChangeModuleSort : ChangeCaseSuiteSort
  tableIsLoading.value = true
  sortFunc(props.testType,{
    id_list: newIdList.value,
    page_num: pageNum.value,
    page_size: pageSize.value
  }).then(response => {
    tableIsLoading.value = false
    if (response){
      getTableDataList()
    }
  })
}

const setSort = () => {
  let tbody = caseSuiteSortTableRef.value.$el.querySelector(".el-table__body-wrapper tbody");
  Sortable.create(tbody, {
    group: { // 相同的组之间可以相互拖拽
      name: "oneColTable",
      pull: true,
      put: true,
    },
    animation: 150, // ms, number 单位：ms，定义排序动画的时间
    onEnd: evt => {
      const targetRow = tableDataList.value.splice(evt.oldIndex, 1)[0]
      tableDataList.value.splice(evt.newIndex, 0, targetRow)

      const tempIndex = newIdList.value.splice(evt.oldIndex, 1)[0]
      newIdList.value.splice(evt.newIndex, 0, tempIndex)
      sortTable()
    }
  })
}

</script>

<style scoped>

</style>
