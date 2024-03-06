<template>
  <div>
    <el-table
        ref="keyValueDataTableRef"
        :data="tempData"
        stripe
        size="small"
        row-key="id">

      <el-table-column label="序号" header-align="center" min-width="4%">
        <template #default="scope">
          <div>{{ scope.$index + 1 }}</div>
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="20%">
        <template #header>
          <span><span style="color: red">*</span>字段key</span>
        </template>
        <template #default="scope">
          <el-input
              v-model="scope.row.key"
              :disabled="isDisabledCol"
              size="small"
              type="textarea"
              :rows="1"
              :placeholder="placeholderKey"
              @change="changeData"/>
        </template>
      </el-table-column>

      <el-table-column v-if="isShowDataType" header-align="center" min-width="15%">
        <template #header>
          <span><span style="color: red">*</span>数据类型</span>
        </template>
        <template #default="scope">
          <el-select
              v-model="scope.row.data_type"
              size="small"
              placeholder="选择数据类型"
              style="width: 100%"
              @change="changeRowDataType(scope.row)"
          >
            <el-option v-for="item in busEvent.data.dataTypeMapping" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="30%">
        <template #header>
          <span><span style="color: red">*</span>字段value</span>
        </template>
        <template #default="scope">
          <!-- 文件 -->
          <div v-if="scope.row.data_type === 'file'">
            <el-row>
              <el-col :span="18">
                <el-input v-model="scope.row.value" size="small" :disabled="true" placeholder="请上传文件" />
              </el-col>
              <el-col :span="2" style="padding-left:10px;">
                <el-button size="small" type="primary" @click="clickSelectFile(scope.$index)">选择文件</el-button>
              </el-col>
            </el-row>
          </div>

          <!-- 文本 -->
          <div v-else>
            <el-input
                :id="'data_input' + scope.$index "
                v-model="scope.row.value"
                :disabled="['True', 'False'].indexOf(scope.row.data_type) !== -1"
                :placeholder="
                scope.row.data_type === 'True'
                  ? 'True' : scope.row.data_type === 'False'
                    ? 'False' : '请输入'"
                type="textarea"
                :rows="1"
                size="small"
                @change="changeData"
            />
          </div>

<!--          <el-input-->
<!--              v-model="scope.row.value"-->
<!--              size="small"-->
<!--              type="textarea"-->
<!--              :rows="1"-->
<!--              :placeholder="placeholderValue"-->
<!--              @change="changeData"/>-->
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="20%">
        <template #header>
          <span><span v-show="remarkIsRequired" style="color: red">*</span>字段说明</span>
        </template>
        <template #default="scope">
          <el-input
              v-model="scope.row.remark"
              :disabled="isDisabledCol"
              size="small"
              type="textarea"
              :rows="1"
              :placeholder="placeholderDesc"
          />
        </template>
      </el-table-column>

      <el-table-column v-if="!isDisabledCol" label="操作" header-align="center" width="90">
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
            ><i class="iconfont icon-testshibai"></i></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <selectStepFileView></selectStepFileView>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref, watch} from "vue";
import Sortable from "sortablejs"
import selectStepFileView from '@/components/business/step/select-step-file.vue'
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
  placeholderDesc: {
    default: '',
    type: String,
  },
  dataTypeMappingList: {
    default: [],
    type: Array,
  },
  isDisabledCol: {
    default: false,
    type: Boolean,
  },
  isShowDataType: {
    default: false,
    type: Boolean,
  },
  busEventName: {
    default: '',
    type: String,
  },
  remarkIsRequired: {
    default: true,
    type: Boolean,
  },
  useFrom: {
    default: undefined,
    type: String,
  },
})

watch(() => props.currentData, (newValue, oldValue) => {
  initTempData(newValue)
})

const tempData = ref([])
const keyValueDataTableRef = ref(null)
const oldList = ref([])
const newList = ref([])
const itemIndex = ref()

const initTempData = (data: string | any[] | undefined) => {
  if (data && data.length > 0) { // 有数据
    tempData.value = []
    props.currentData.forEach((data, index) => {
      data['id'] = `${Date.now()}_${index}`
      tempData.value.push(JSON.parse(JSON.stringify(data)))
    })
  } else {
    addRow(undefined)
  }
  oldList.value = tempData.value.map(v => v.id)
  newList.value = oldList.value.slice()
}

const changeData = (value: object) => {
  if (props.busEventName) {
    bus.emit(busEvent.changeData, {eventType: props.busEventName, content: tempData.value})
  }
}

const changeRowDataType = (row: { data_type: string; value: string; }) => {
  if (['True', 'False'].indexOf(row.data_type) !== -1) {
    row.value = row.data_type
  } else {
    row.value = ''
  }
}

const clickSelectFile = (rowIndex: number) => {
  itemIndex.value = rowIndex
  bus.emit(busEvent.drawerIsShow, {eventType: 'select-step-file'})
}

const getNewData = () => {
  return {id: `${Date.now()}`, key: null, value: null, remark: null, data_type: null}
}

const addRow = (isRow: undefined | boolean) => {
  if (isRow) {
    tempData.value.push(getNewData())
  } else {
    tempData.value = [getNewData()]
  }
}

const copyRow = (row: {id: string, key: null, value: null, remark: null, data_type: null}) => {
  let newData = JSON.parse(JSON.stringify(row))
  newData.id = `${Date.now()}`
  tempData.value.push(newData)
}

const isShowDelButton = (index: number) => {
  return !(tempData.value.length === 1 && index === 0)
}

const delRow = (index: number) => {
  tempData.value.splice(index, 1)
}

const clearData = () => {
  tempData.value[0] = getNewData()
}

onMounted(() => {
  initTempData(props.currentData)
  setSort()

  bus.on(busEvent.drawerIsCommit, onDrawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, onDrawerIsCommit);
})

const onDrawerIsCommit = (message: any) => {
  if (message.eventType === 'select-step-file' && props.useFrom === 'data-form') {
    tempData.value[itemIndex.value].value = message.content
  }
}

const setSort = () => {
  let tbody = keyValueDataTableRef.value.$el.querySelector(".el-table__body-wrapper tbody");
  Sortable.create(tbody, {
    group: { // 相同的组之间可以相互拖拽
      name: "keyValueDataTable",
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

defineExpose({
  tempData
})

</script>

<style scoped>

</style>
