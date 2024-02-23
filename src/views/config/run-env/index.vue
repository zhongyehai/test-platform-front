<template>
  <div class="layout-container">

    <div class="layout-container-form flex space-between">
      <div class="layout-container-form-handle">
        <el-button type="primary" @click="showEditDrawer(undefined)"> 添加环境</el-button>
        <el-button type="primary" @click="showToBusinessDrawer(undefined)">运行环境与业务线绑定管理</el-button>
      </div>

      <div class="layout-container-form-search">
        <el-select
            v-model="queryItems.group"
            placeholder="选择环境分组"
            clearable
            filterable
            default-first-option
            style="margin-right: 10px"
            size="small"
        >
          <el-option v-for="item in runEnvGroupList" :key="item" :label="item" :value="item"/>
        </el-select>

        <el-input
            v-model="queryItems.name"
            clearable
            size="small"
            style="width: 200px; margin-right: 10px"
            placeholder="环境名字，支持模糊搜索"/>

        <el-input
            v-model="queryItems.code"
            class="input-with-select"
            placeholder="环境code，支持模糊搜索"
            size="small"
            clearable
            style="width: 200px; margin-right: 10px"
        />

        <el-button type="primary" @click="getTableDataList()"> 搜索</el-button>
      </div>
    </div>

    <div style="margin: 10px">

      <el-table
          :data="tableDataList"
          v-loading="tableIsLoading"
          element-loading-text="正在获取数据"
          element-loading-spinner="el-icon-loading"
          style="width: 100%"
          stripe
          :height="tableHeight"
          @row-dblclick="rowDblclick"
          row-key="id">

          <el-table-column prop="id" label="序号" align="center" min-width="10%">
            <template #default="scope">
              <span> {{ (queryItems.page_num - 1) * queryItems.page_size + scope.$index + 1 }} </span>
            </template>
          </el-table-column>

          <el-table-column show-overflow-tooltip prop="group" align="center" label="环境分组" min-width="10%">
            <template #default="scope">
              <span> {{ scope.row.group }} </span>
            </template>
          </el-table-column>

          <el-table-column show-overflow-tooltip prop="name" align="center"  label="环境名字" min-width="25%">
            <template #default="scope">
              <span> {{ scope.row.name }} </span>
            </template>
          </el-table-column>

          <el-table-column show-overflow-tooltip prop="code" align="center" label="环境code" min-width="20%">
            <template #default="scope">
              <span> {{ scope.row.code }} </span>
            </template>
          </el-table-column>

          <el-table-column show-overflow-tooltip prop="desc" align="center" label="备注" min-width="25%">
            <template #default="scope">
              <span> {{ scope.row.desc }} </span>
            </template>
          </el-table-column>

          <el-table-column fixed="right" show-overflow-tooltip prop="desc" align="center" label="操作" min-width="10%">
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

    <EditDrawer :runEnvGroupList="runEnvGroupList"></EditDrawer>
    <ToBusinessDrawer></ToBusinessDrawer>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount} from "vue";
import {ElMessage} from "element-plus";
import Sortable from "sortablejs"

import Pagination from '@/components/pagination.vue'
import EditDrawer from './drawer.vue'
import ToBusinessDrawer from './to-business.vue'

import {RunEnvGroupList, GetRunEnvList, RunEnvSort} from "@/api/config/run-env";
import {bus, busEvent} from "@/utils/bus-events";
import toClipboard from "@/utils/copy-to-memory";

const tableIsLoading = ref(false)
const runEnvGroupList = ref([])
const tableDataList = ref([])
const oldIdList = ref([])
const newIdList = ref([])
const tableDataTotal = ref(0)
const queryItems = ref({
  page_num: 1,
  page_size: 20,
  detail: true,
  group: undefined,
  name: undefined,
  code: undefined
})
const tableHeight = localStorage.getItem('tableHeight')

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

// 表格行拖拽
const setSort = () => {
  let tbody = document.querySelector(".el-table__body-wrapper tbody");
  Sortable.create(tbody, {
    group: { // 相同的组之间可以相互拖拽
      name: "table",
      pull: true,
      put: true,
    },
    animation: 150, // ms, number 单位：ms，定义排序动画的时间
    onAdd: function (e: any) {
      // 拖拽时候添加有新的节点的时候发生该事件
      console.log("onAdd.foo:", e);
    },
    onUpdate: function (e: any) {
      // 拖拽更新节点位置发生该事件
      console.log("onUpdate.foo:", e);
    },
    onRemove: function (e: any) {
      // 删除拖拽节点的时候促发该事件
      console.log("onRemove.foo:", e);
    },
    onStart: function (e: any) {
      // 开始拖拽出发该函数
      console.log("onStart.foo:", e);
    },
    onSort: function (e: any) {
      // 发生排序发生该事件
      console.log("onUpdate.foo:", e);
    },
    onEnd(e: any) {
      // 结束拖拽
      console.log("结束表格拖拽", e);
      const targetRow = tableDataList.value.splice(e.oldIndex, 1)[0]
      tableDataList.value.splice(e.newIndex, 0, targetRow)
      const tempIndex = newIdList.value.splice(e.oldIndex, 1)[0]
      newIdList.value.splice(e.newIndex, 0, tempIndex)
      sortTable()
    },
  });
}

const showEditDrawer = (row: object | undefined) => {
  const content = row ? row : {id: undefined, type: undefined, name: undefined, value: undefined, desc: undefined}
  bus.emit(busEvent.drawerIsShow, {eventType: 'run-env', content: content});
}
const showToBusinessDrawer = (row: object | undefined) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'run-env-to-business'});
}

const getTableDataList = () => {
  queryItems.value.group = queryItems.value.group ? queryItems.value.group : undefined
  queryItems.value.name = queryItems.value.name ? queryItems.value.name : undefined
  queryItems.value.code = queryItems.value.code ? queryItems.value.code : undefined
  tableIsLoading.value = true
  GetRunEnvList(queryItems.value).then((response: object) => {
    tableIsLoading.value = false
    tableDataList.value = response.data.data
    tableDataTotal.value = response.data.total

    oldIdList.value = tableDataList.value.map(item => item.id)
    newIdList.value = oldIdList.value.slice()
  })
}

const sortTable = () => {
  tableIsLoading.value = true
  RunEnvSort({
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

onMounted(() => {

  RunEnvGroupList({}).then((response: object) => {
    runEnvGroupList.value = response.data
  })

  getTableDataList()

  setSort()

  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'run-env') {
    getTableDataList()
  }
}

</script>

<style scoped lang="scss">

</style>
