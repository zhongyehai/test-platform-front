<template>
  <div>
    <!-- 跳过条件 -->
    <el-table
      ref="dataTable"
      :data="tempData"
      stripe
      :show-header="false"
      size="mini"
      row-key="id">
      <el-table-column label="id" header-align="center" min-width="4%">
        <template slot-scope="scope">
          <div>{{ scope.$index + 1 }}</div>
        </template>
      </el-table-column>

      <el-table-column label="skip_type" header-align="center" min-width="20%">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.skip_type"
            placeholder="跳过类型"
            style="width: 100%"
            filterable
            clearable
            default-first-option
            size="mini"
            @change="selectValidateType($event, scope.row)"
          >
            <el-option
              v-for="(item) in skipIfTypeMapping"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>

      <el-table-column label="数据源" header-align="center" min-width="25%">
        <template slot-scope="scope">
          <el-row>
            <el-row>
              <el-select
                v-model="scope.row.data_source"
                placeholder="选择数据源"
                style="width: 100%"
                filterable
                clearable
                default-first-option
                size="mini">
                <el-option
                  v-for="(item) in skipIfDataSourceMapping"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-row>
            <el-row>
              <el-input
                v-model="scope.row.check_value"
                :disabled="scope.row.data_source === 'run_env'"
                type="textarea"
                size="mini"
                :rows="1"
                :placeholder="getDataSourcePlaceholder(scope.row.data_source)"></el-input>
            </el-row>
          </el-row>

        </template>
      </el-table-column>

      <el-table-column label="comparator" header-align="center" min-width="20%">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.comparator"
            placeholder="断言类型"
            style="width: 100%"
            filterable
            clearable
            default-first-option
            size="mini"
            @change="selectValidateType($event, scope.row)"
          >
            <el-option
              v-for="(item) in validateTypeList"
              :key="item.value"
              :label="item.value"
              :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>

      <el-table-column property="value" label="Value" header-align="center" min-width="25%">
        <template slot-scope="scope">
          <el-row>
            <el-row>
              <el-select
                v-model="scope.row.data_type"
                placeholder="选择预期结果数据类型"
                :disabled="scope.row.comparator === '值为真' || scope.row.comparator === '值为假'"
                style="width: 100%"
                filterable
                clearable
                default-first-option
                size="mini">
                <el-option
                  v-for="(item) in dataTypeMapping"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-row>
            <el-row>
              <el-input
                v-model="scope.row.expect"
                size="mini"
                type="textarea"
                :disabled="scope.row.comparator === '值为真' || scope.row.comparator === '值为假'"
                :rows="1"
                :placeholder="
                  scope.row.comparator === '契约校验' ?
                  '详见：https://pypi.org/project/pactverify/，注：契约校验标识符改用@':
                  '预期结果'
                ">
              </el-input>
            </el-row>
          </el-row>
        </template>
      </el-table-column>

      <el-table-column label="添加一行" header-align="center" min-width="6%">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
            <el-button
              v-show="scope.$index === 0"
              type="text"
              size="mini"
              icon="el-icon-plus"
              @click.native="addRow(scope.$index)">
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
            <el-button
              v-show="isShowDelButton(scope.$index)"
              type="text"
              size="mini"
              icon="el-icon-minus"
              style="color: red"
              @click.native="delRow(scope.$index)">
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" placement="top-end" content="清除数据">
            <el-button
              v-show="tempData.length === 1"
              type="text"
              size="mini"
              icon="el-icon-circle-close"
              style="color: red"
              @click.native="clearData()"
            >
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>

    </el-table>

  </div>
</template>

<script>

import {getAssertMapping} from '@/apis/apiTest/api'
import {getConfigByName, getSkipIfDataSourceMapping, getSkipIfTypeMapping} from '@/apis/config/config'
import Sortable from "sortablejs";

export default {
  name: "skipIf",
  props: ['skipIfData', 'use_type'],

  data() {
    return {
      validateTypeList: [],
      tempData: [],
      dataTypeMapping: [],
      skipIfDataSourceMapping: [],
      skipIfTypeMapping: [],
      sortable: null,
      oldList: [],
      newList: [],
    }
  },

  mounted() {
    if (this.skipIfTypeMapping.length === 0) {
      this.getSkipIfTypeMappings()
    }

    if (this.skipIfDataSourceMapping.length === 0) {
      this.getSkipIfDataSourceMappings()
    }

    if (this.validateTypeList.length === 0) {
      this.getAssertMappings()
    }

    if (this.dataTypeMapping.length === 0) {
      this.getDataTypeMapping()
    }

    this.initTempData(this.skipIfData)
    this.oldList = this.tempData.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },


  methods: {

    // 从后端获取跳过数据源
    getSkipIfDataSourceMappings() {
      getSkipIfDataSourceMapping({type: this.use_type}).then(response => {
        this.skipIfDataSourceMapping = response.data
      })
    },

    // 从后端获取跳过方式
    getSkipIfTypeMappings() {
      getSkipIfTypeMapping().then(response => {
        this.skipIfTypeMapping = response.data
      })
    },

    // 从后端获取断言方式
    getAssertMappings() {
      getAssertMapping().then(response => {
        this.validateTypeList = response.data
      })
    },

    // 从后端获取数据类型映射
    getDataTypeMapping() {
      getConfigByName({'name': 'data_type_mapping'}).then(response => {
        this.dataTypeMapping = JSON.parse(response.data.value)
      })
    },

    // 根据选择的数据源显示不同的提示
    getDataSourcePlaceholder(_type) {
      if (!_type) {
        return '请选择数据源'
      } else if (_type === 'variable') {
        return '请填写自定义变量表达式'
      } else if (_type === 'func') {
        return '请填写自定义函数表达式'
      } else {
        return ''
      }
    },

    // 选中断言类型事件
    selectValidateType(data, row) {
      if (data === '值为真') {
        this.$set(row, 'data_type', 'str')
        this.$set(row, 'value', 'True')
        return true
      } else if (data === '值为假') {
        this.$set(row, 'data_type', 'str')
        this.$set(row, 'value', 'False')
        return true
      }
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempData.length === 1 && index === 0)
    },

    // 添加一行
    addRow() {
      this.tempData.push({
        id: `${Date.now()}`,
        skip_type: null,
        data_source: null,
        check_value: null,
        comparator: null,
        data_type: null,
        expect: null
      })
    },

    // 删除一行
    delRow(index) {
      this.tempData.splice(index, 1);
    },

    // 清除数据
    clearData() {
      this.tempData[0].skip_type = null
      this.tempData[0].data_source = null
      this.tempData[0].check_value = null
      this.tempData[0].comparator = null
      this.tempData[0].data_type = null
      this.tempData[0].expect = null
    },

    initTempData(skipIfs) {
      if (skipIfs && skipIfs.length > 0) {
        this.tempData = this.skipIfData
      } else {
        this.addRow()
      }
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.dataTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.tempData.splice(evt.oldIndex, 1)[0]
          this.tempData.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)
        }
      })
    },
  },

  watch: {
    'skipIfData': {
      handler(newVal, oldVal) {
        this.initTempData(newVal)
      }
    }
  }
}
</script>

<style scoped>

</style>
