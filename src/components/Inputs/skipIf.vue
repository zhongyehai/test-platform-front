<template>
  <div>
    <!-- 跳过条件 -->
    <el-table
      ref="dataTable"
      :data="tempData"
      stripe
      size="mini"
      row-key="id"
    >
      <el-table-column label="序号" header-align="center" min-width="8%">
        <template slot-scope="scope">
          <div>{{ scope.$index + 1 }}</div>
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="20%">
        <template slot="header">
          <span><span style="color: red">*</span>跳过类型</span>
        </template>
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
              v-for="(item) in $busEvents.data.skipIfTypeMappingList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="20%">
        <template slot="header">
          <span><span style="color: red">*</span>数据源</span>
        </template>
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
                size="mini"
              >
                <el-option
                  v-for="(item) in skipIfDataSourceMapping"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-row>
            <el-row>
              <el-input
                v-model="scope.row.check_value"
                :disabled="scope.row.data_source === 'run_env'"
                type="textarea"
                size="mini"
                :rows="1"
                :placeholder="getDataSourcePlaceholder(scope.row.data_source)"
              />
            </el-row>
          </el-row>

        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="20%">
        <template slot="header">
          <span><span style="color: red">*</span>判断类型</span>
        </template>
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
              v-for="(item) in $busEvents.data.apiTestAssertMappingList"
              :key="item.value"
              :label="item.value"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="25%">
        <template slot="header">
          <span><span style="color: red">*</span>预期值</span>
        </template>
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
                size="mini"
              >
                <el-option
                  v-for="(item) in $busEvents.data.dataTypeMappingList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
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
                "
              />
            </el-row>
          </el-row>
        </template>
      </el-table-column>

      <el-table-column label="操作" header-align="center" min-width="7%">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
            <el-button
              v-show="scope.$index === 0 || scope.$index === tempData.length - 1"
              type="text"
              size="mini"
              icon="el-icon-plus"
              @click.native="addRow(true)"
            />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
            <el-button
              v-show="isShowDelButton(scope.$index)"
              type="text"
              size="mini"
              icon="el-icon-minus"
              style="color: red"
              @click.native="delRow(scope.$index)"
            />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" placement="top-end" content="清除数据">
            <el-button
              v-show="tempData.length === 1"
              type="text"
              size="mini"
              icon="el-icon-circle-close"
              style="color: red"
              @click.native="clearData()"
            />
          </el-tooltip>
        </template>
      </el-table-column>

    </el-table>

  </div>
</template>

<script>

import { getSkipIfDataSourceMapping } from '@/apis/config/config'
import Sortable from 'sortablejs'

export default {
  name: 'SkipIf',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'skipIfData', 'useType'
  ],

  data() {
    return {
      tempData: [],
      skipIfDataSourceMapping: [],
      sortable: null,
      oldList: [],
      newList: []
    }
  },

  watch: {
    'skipIfData': {
      handler(newVal, oldVal) {
        this.initTempData(newVal)
      }
    }
  },

  mounted() {
    // 判断是否跳过的数据源
    this.skipIfDataSourceMapping = this.useType === 'step' ? this.$busEvents.data.stepSkipIfDataSourceMapping : this.$busEvents.data.caseSkipIfDataSourceMapping

    this.initTempData(this.skipIfData)
    this.oldList = this.tempData.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  methods: {

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
    addRow(isRow) {
      if (isRow) {
        this.tempData.push({
          id: `${Date.now()}`,
          skip_type: null,
          data_source: null,
          check_value: null,
          comparator: null,
          data_type: null,
          expect: null
        })
      } else {
        this.tempData = [{
          id: `${Date.now()}`,
          skip_type: null,
          data_source: null,
          check_value: null,
          comparator: null,
          data_type: null,
          expect: null
        }]
      }
    },

    // 删除一行
    delRow(index) {
      this.tempData.splice(index, 1)
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
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.tempData.splice(evt.oldIndex, 1)[0]
          this.tempData.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
