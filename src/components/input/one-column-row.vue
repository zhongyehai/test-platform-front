<template>
  <el-table
    ref="dataTableRef"
    class="dataTableRef"
    :data="tempData"
    stripe
    :show-header="false"
    size="small"
    row-key="id"
  >

    <el-table-column label="id" header-align="center" min-width="5%">
      <template #default="scope">
        <div>{{ scope.$index + 1 }}</div>
      </template>
    </el-table-column>

    <el-table-column label="Key" header-align="center" min-width="75%">
      <template #default="scope">
        <el-input
          v-model="scope.row.key"
          size="small"
          type="textarea"
          :rows="1"
          :placeholder="placeholderKey"
          @change="changeData"
        />
      </template>
    </el-table-column>

    <el-table-column label="操作" header-align="center" width="90">
      <template #default="scope">

        <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
          <el-button
            v-show="scope.$index === 0 || scope.$index === tempData.length - 1"
            type="text"
            size="small"
            style="margin: 2px; padding: 0"
            @click.native="addRow(true)"
          ><i class="iconfont icon-testadd"></i></el-button>
        </el-tooltip>

        <el-tooltip class="item" effect="dark" placement="top-end" content="复制当前行">
          <el-button
              type="text"
              size="small"
              style="margin: 2px; padding: 0"
              @click.native="copyRow(scope.row)"
          ><i class="iconfont icon-testjingdianwanfa"></i></el-button>
        </el-tooltip>

        <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
          <el-button
            v-show="isShowDelButton(scope.$index)"
            type="text"
            size="small"
            style="color: red;margin: 2px; padding: 0"
            @click.native="delRow(scope.$index)"
          ><i class="iconfont icon-testdelete1"></i></el-button>
        </el-tooltip>

        <el-tooltip class="item" effect="dark" placement="top-end" content="清除数据">
          <el-button
              v-show="tempData.length === 1"
              type="text"
              size="small"
              style="color: red;margin: 2px; padding: 0"
              @click.native="clearData()"
          ><i class="iconfont icon-testqingkong"></i></el-button>
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch} from "vue";

import Sortable from "sortablejs"

import {bus, busEvent} from "@/utils/bus-events";

const props = defineProps({
  currentData: {
    default: [],
    type: Array,
  },
  placeholderKey: {
    default: '',
    type: String,
  },
  placeholderValue: {
    default: '',
    type: String,
  },
  busEventName: {
    default: '',
    type: String,
  },
})

watch(() => props.currentData, (newValue, oldValue) => {
  initTempData(newValue)
})

const tempData = ref([])
const dataTableRef = ref(null)
const oldList = ref([])
const newList = ref([])

const initTempData = (data: string | any[] | undefined) =>{
  if (data && data.length > 0) { // 有数据
    tempData.value = []
    props.currentData.forEach(data => {
      tempData.value.push({id: `${Date.now()}${data}`, key: data})
    })
  } else {
    addRow(undefined)
  }
  oldList.value = tempData.value.map(v => v.id)
  newList.value = oldList.value.slice()
}

const changeData = () => {
  if (props.busEventName) {
    bus.emit(busEvent.changeData, {eventType: props.busEventName, content: tempData.value})
  }
}

const addRow = (isRow: undefined | boolean) => {
  if (isRow) {
    tempData.value.push({ id: `${Date.now()}`, key: null })
  } else {
    tempData.value = [{ id: `${Date.now()}`, key: null}]
  }
}

const copyRow = (row: {id: string, key: null, value: null, remark: null, data_type: null}) => {
  let newData = JSON.parse(JSON.stringify(row))
  newData.id = `${Date.now()}`
  tempData.value.push(newData)
}

const getData = () =>{
  const dataList: any[] = []
      tempData.value.forEach(data => {
      if (data.key) {
        dataList.push(data.key)
      }
  })
  return dataList
}

const isShowDelButton = (index: number) => {
  return !(tempData.value.length === 1 && index === 0)
}

// 删除一行
const delRow = (index: number) => {
  tempData.value.splice(index, 1)
}

// 清除数据
const clearData = () => {
  tempData.value[0].key = null
}

onMounted(() => {
  initTempData(undefined)
  setSort()
})

// 拖拽排序
const setSort = () => {
  let tbody = dataTableRef.value.$el.querySelector(".el-table__body-wrapper tbody");
  Sortable.create(tbody, {
    group: { // 相同的组之间可以相互拖拽
      name: "oneColTable",
      pull: true,
      put: true,
    },
    animation: 150, // ms, number 单位：ms，定义排序动画的时间
    onEnd: evt => {
      const targetRow = tempData.value.splice(evt.oldIndex, 1)[0]
      tempData.value.splice(evt.newIndex, 0, targetRow)

      const tempIndex = newList.value.splice(evt.oldIndex, 1)[0]
      newList.value.splice(evt.newIndex, 0, tempIndex)
    }
  })
}

// 把选择的值暴露出来，给父组件引用
defineExpose({
  getData
})

</script>

<style scoped>

</style>
