<template>
  <div>

    <!-- 使用示例 -->
    <el-collapse accordion>
      <el-collapse-item>
        <template #title>
          <div style="color:red"> 点击查看示例</div>
        </template>

        <div style="margin-left: 20px">
          <div style="margin-left: 20px; margin-bottom: 5px">
            示例数据： {"status": 200, "message": "获取成功", "list": [{"id": 1},{"id": 2}]}
          </div>
          <div style="margin-left: 20px">

            <!-- 断言整数 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言整数</div>
              </el-col>
              <el-col :span="5">
                <el-input size="small" disabled :placeholder="'响应体'" style="width: 90%" />
                <el-input size="small" disabled :placeholder="'status'" style="width: 90%" />
              </el-col>

              <el-col :span="7">
                <el-input size="small" disabled :placeholder="'相等'" style="width: 90%" />
              </el-col>

              <el-col :span="7">
                <el-input size="small" disabled :placeholder="'整数'" style="width: 90%" />
                <el-input size="small" disabled :placeholder="'200'" style="width: 90%" />
              </el-col>
            </el-row>

            <!-- 断言普通字符串 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言普通字符串</div>
              </el-col>
              <el-col :span="5">
                <el-input size="small" disabled :placeholder="'响应体'" style="width: 90%" />
                <el-input size="small" disabled :placeholder="'message'" style="width: 90%" />
              </el-col>

              <el-col :span="7">
                <el-input size="small" disabled :placeholder="'相等'" style="width: 90%" />
              </el-col>

              <el-col :span="7">
                <el-input size="small" disabled :placeholder="'普通字符串'" style="width: 90%" />
                <el-input size="small" disabled :placeholder="'获取成功'" style="width: 90%" />
              </el-col>
            </el-row>

            <!-- 断言自定义变量 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言自定义变量</div>
              </el-col>
              <el-col :span="5">
                <el-input size="small" disabled :placeholder="'响应体'" style="width: 90%" />
                <el-input size="small" disabled :placeholder="'status'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="small" disabled :placeholder="'相等'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="small" disabled :placeholder="'自定义变量'" style="width: 90%" />
                <el-input size="small" disabled :placeholder="'$extract_name_2'" style="width: 90%" />
              </el-col>
            </el-row>

            <!-- 断言自定义函数 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言自定义函数</div>
              </el-col>
              <el-col :span="5">
                <el-input size="small" disabled :placeholder="'响应体'" style="width: 90%" />
                <el-input size="small" disabled :placeholder="'status'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="small" disabled :placeholder="'相等'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="small" disabled :placeholder="'自定义函数'" style="width: 90%" />
                <el-input size="small" disabled :placeholder="'${do_something(status)}'" style="width: 90%" />
              </el-col>
            </el-row>

            <!-- 断言自定义函数+自定义变量 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言自定义函数+自定义变量</div>
              </el-col>
              <el-col :span="5">
                <el-input size="small" disabled :placeholder="'响应体'" style="width: 90%" />
                <el-input size="small" disabled :placeholder="'status'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="small" disabled :placeholder="'相等'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="small" disabled :placeholder="'自定义函数'" style="width: 90%" />
                <el-input
                    size="small"
                    disabled
                    :placeholder="'${do_something($extract_name_2)}'"
                    style="width: 90%"
                />
              </el-col>
            </el-row>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <el-table ref="validateDataTableRef" :data="tempData" stripe size="small" row-key="id">

      <el-table-column label="序号" header-align="center" min-width="5%">
        <template #default="scope">
          <div>{{ scope.$index + 1 }}</div>
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="8%">
        <template #header>
          <span><span style="color: red">*</span>是否执行</span>
        </template>
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :inactive-value="0"
              :active-value="1"
          />
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="10%">
        <template #header>
          <span><span style="color: red">*</span>断言类型</span>
        </template>
        <template #default="scope">
          <el-select
              v-model="scope.row.validate_type"
              :disabled="testType === 'api'"
              placeholder="断言类型"
              style="width: 100%"
              size="small"
              @change="selectValidateType($event, scope.row)"
          >
            <el-option
                v-for="(item) in validateTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="30%">
        <template #header>
          <span><span style="color: red">*</span>数据源</span>
        </template>
        <template #default="scope">
          <el-row>
            <el-select
                v-model="scope.row.data_source"
                :placeholder="scope.row.validate_type === 'data' ? '选择数据源' : '选择元素'"
                style="width: 100%"
                filterable
                clearable
                default-first-option
                size="small"
            >
              <div v-show="scope.row.validate_type === 'data'">
                <el-option
                    v-for="(item) in busEvent.data.responseDataSource"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </div>
              <div v-show="scope.row.validate_type === 'page'">
                <el-option v-for="(item) in elementList" :key="item.id" :label="item.name" :value="item.id" />
              </div>
            </el-select>
          </el-row>
          <el-row>
            <el-input
                v-model="scope.row.key"
                :disabled="scope.row.validate_type === 'page'"
                type="textarea"
                size="small"
                :rows="1"
                :placeholder="getDataSourcePlaceholder(scope.row)"
            />
          </el-row>
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="25%">
        <template #header>
          <span><span style="color: red">*</span>断言方法</span>
        </template>
        <template #default="scope">
          <el-select
              v-if="scope.row.validate_type === 'data'"
              v-model="scope.row.validate_method"
              placeholder="选择断言方法"
              style="width: 100%"
              filterable
              clearable
              size="small"
              @change="selectValidateMethod($event, scope.row)"
          >
            <el-option
                v-for="(item) in busEvent.data.apiAssertMapping"
                :key="item.value"
                :label="item.value"
                :value="item.value"
            />
          </el-select>
          <el-select
              v-if="scope.row.validate_type !== 'data'"
              v-model="scope.row.validate_method"
              placeholder="选择断言方法"
              style="width: 100%"
              filterable
              clearable
              size="small"
              @change="selectValidateMethod($event, scope.row)"
          >
            <el-option
                v-for="(item) in busEvent.data.uiAssertMapping"
                :key="item.value"
                :label="item.value"
                :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="30%">
        <template #header>
          <span><span style="color: red">*</span>预期结果</span>
        </template>
        <template #default="scope">
          <el-row>
            <el-select
                v-model="scope.row.data_type"
                placeholder="选择预期结果数据类型"
                :disabled="disabledAssertType.indexOf(scope.row.validate_method) !== -1"
                style="width: 100%"
                filterable
                clearable
                default-first-option
                size="small"
                @change="selectDataType($event, scope.row)"
            >
              <el-option
                  v-for="(item) in busEvent.data.dataTypeMapping"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-row>
          <el-row>
            <el-input
                v-model="scope.row.value"
                size="small"
                type="textarea"
                :disabled="assertOne.indexOf(scope.row.validate_method) !== -1 || scope.row.disabled"
                :rows="scope.row.value ? 2 : 1"
                :placeholder="
                assertBatch.indexOf(scope.row.validate_method) !== -1 ? `请填写具体字段，如: ['key1', 'key2']` :
                scope.row.validate_method === '契约校验' ?
                  '详见：https://pypi.org/project/pactverify/，注：契约校验标识符改用@':
                  '预期结果'
              "
            />
          </el-row>
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
            ><Plus></Plus></el-button>
          </el-tooltip>

          <el-tooltip class="item" effect="dark" placement="top-end" content="复制当前行">
            <el-button
                type="text"
                size="small"
                style="margin: 2px; padding: 0"
                @click.native="copyRow(scope.row)"
            ><Copy></Copy></el-button>
          </el-tooltip>

          <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
            <el-button
                v-show="isShowDelButton(scope.$index)"
                type="text"
                size="small"
                style="color: red;margin: 2px; padding: 0"
                @click.native="delRow(scope.$index)"
            ><Minus></Minus></el-button>
          </el-tooltip>

          <el-tooltip class="item" effect="dark" placement="top-end" content="清除数据">
            <el-button
                v-show="tempData.length === 1"
                type="text"
                size="small"
                style="color: red;margin: 2px; padding: 0"
                @click.native="clearData()"
            ><Clear></Clear></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch} from "vue";
import Sortable from "sortablejs"
import {Clear, Copy, Minus, Plus} from "@icon-park/vue-next";
import {GetConfigByCode} from "@/api/config/config-value";
import {busEvent} from "@/utils/bus-events";
import {ElMessage} from "element-plus";

const props = defineProps({
  currentData: {
    default: [],
    type: Array,
  },
  elementList: {
    default: [],
    type: Array,
  },
  testType: {
    default: 'api',
    type: String,
  },
})

watch(() => props.currentData, (newValue, oldValue) => {
  console.log('validate.props.currentData: ', newValue)
  console.log('validate.props.oldValue: ', oldValue)
  initTempData(newValue)
})

const tempData = ref([])
const validateTypeList =  [{ 'label': '数据', 'value': 'data' }, { 'label': '页面', 'value': 'page' }]
const assertOne = ['值为真', '值为假', '值为null', '值不为null', '值为true', '值不为true', '值为false', '值不为false']
const assertBatch = [
  '批量判断字段值均为真', '批量判断字段值均为假',
  '批量判断字段值均为true', '批量判断字段值均不为true',
  '批量判断字段值均为false', '批量判断字段值均不为false',
  '批量判断字段值均为null', '批量判断字段值均不为null'
]
const disabledAssertType = [
  '值为真', '值为假', '值为null', '值不为null', '值为true', '值不为true', '值为false', '值不为false',
  '批量判断字段值均为真', '批量判断字段值均为假',
  '批量判断字段值均为true', '批量判断字段值均不为true',
  '批量判断字段值均为false', '批量判断字段值均不为false',
  '批量判断字段值均为null', '批量判断字段值均不为null'
]
const validateDataTableRef = ref(null)
const oldList = ref([])
const newList = ref([])

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

const getDataSourcePlaceholder = (row: { validate_type: string; data_source: string; }) => {
  if (row.validate_type === 'data') {
    if (!row.data_source) {
      return '实际结果提取表达式'
    } else if (row.data_source === 'regexp') {
      return '请填写正确的正则表达式'
    } else if (row.data_source === 'func') {
      return '请填写正确的自定义函数表达式'
    } else if (row.data_source === 'variable') {
      return '请填写正确的自定义变量表达式'
    } else {
      return 'jsonpath表达式，若要提取整个对象，则不填写'
    }
  }
}

const selectValidateType = (data: { validate_type: string; }, row: any) => {
  row.key = null
  row.data_source = null
  row.validate_method = null
}

const selectValidateMethod = (data: string | string[], row: any) => {
  if (['值为真', '值为true'].indexOf(data) !== -1) {
    row.data_type = 'str'
    row.value = 'True'
    return true
  } else if (['值为假', '值为false'].indexOf(data) !== -1) {
    row.data_type = 'str'
    row.value = 'False'
    return true
  } else if (data === '值为null') {
    row.data_type = 'str'
    row.value = 'null'
    return true
  } else if (data === '值不为null') {
    row.data_type = 'str'
    row.value = 'not null'
    return true
  } else if (data === '值不为true') {
    row.data_type = 'str'
    row.value = 'not true'
    return true
  } else if (data === '值不为false') {
    row.data_type = 'str'
    row.value = 'not false'
    return true
  } else if (data.indexOf('批量') !== -1) {
    row.data_type = 'list'
    row.value = '["key1", "key2"]'
    return true
  }
}

const selectDataType = (data: string | string[], row: any) => {
  if (['True', 'False'].indexOf(data) > 0){
    row.value = data
    row.disabled = true
  }else {
    row.disabled = false
  }
}

const getConfigByCode = () => {
  if (busEvent.data.responseDataSource.length < 1){
    GetConfigByCode({ code: 'extracts_mapping' }).then(response => {
      busEvent.data.responseDataSource = response.data
    })
  }
}

const getNewData = () => {
  return {
    id: `${Date.now()}`,
        status: 0,
        validate_type: props.testType === 'api' ? 'data' : 'page',
        data_source:  null,
        key: null,
        validate_method: null,
        data_type: null,
        value: null
  }
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
  getConfigByCode()
  initTempData(undefined)
  setSort()
})

const setSort = () => {
  let tbody = validateDataTableRef.value.$el.querySelector(".el-table__body-wrapper tbody");
  Sortable.create(tbody, {
    group: { // 相同的组之间可以相互拖拽
      name: "validateDataTable",
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

const getValidates = () => {
  tempData.value.forEach( (item: { status: any; key: any; value: any; validate_method: any; data_source: any; data_type: any; validate_type: any; }, index: any) => {
    if (item.status){
      if (item.data_source || item.validate_method || item.value || item.data_type || (item.validate_type === 'data' && item.key)){
        if (!item.data_source || !item.validate_method|| !item.value || !item.data_type){
          ElMessage.warning(`断言，第 ${index + 1} 行，请完善数据`)
          throw new Error(`断言，第 ${index + 1} 行，请完善数据: ${JSON.stringify(item)}`);
        }
      }
    }
  })
  return tempData.value
}

defineExpose({
  getValidates
})

</script>

<style scoped>

</style>
