<template>
  <div>
    <!-- 使用示例 -->
    <el-collapse accordion>
      <el-collapse-item>
        <template slot="title">
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
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
                <el-input size="mini" disabled :placeholder="'status'" style="width: 90%" />
              </el-col>

              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'相等'" style="width: 90%" />
              </el-col>

              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'整数'" style="width: 90%" />
                <el-input size="mini" disabled :placeholder="'200'" style="width: 90%" />
              </el-col>
            </el-row>

            <!-- 断言普通字符串 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言普通字符串</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
                <el-input size="mini" disabled :placeholder="'message'" style="width: 90%" />
              </el-col>

              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'相等'" style="width: 90%" />
              </el-col>

              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'普通字符串'" style="width: 90%" />
                <el-input size="mini" disabled :placeholder="'获取成功'" style="width: 90%" />
              </el-col>
            </el-row>

            <!-- 断言自定义变量 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言自定义变量</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
                <el-input size="mini" disabled :placeholder="'status'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'相等'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'自定义变量'" style="width: 90%" />
                <el-input size="mini" disabled :placeholder="'$extract_name_2'" style="width: 90%" />
              </el-col>
            </el-row>

            <!-- 断言自定义函数 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言自定义函数</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
                <el-input size="mini" disabled :placeholder="'status'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'相等'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'自定义函数'" style="width: 90%" />
                <el-input size="mini" disabled :placeholder="'${do_something(status)}'" style="width: 90%" />
              </el-col>
            </el-row>

            <!-- 断言自定义函数+自定义变量 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言自定义函数+自定义变量</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
                <el-input size="mini" disabled :placeholder="'status'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'相等'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'自定义函数'" style="width: 90%" />
                <el-input
                  size="mini"
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

    <!-- 断言 -->
    <el-table
      ref="dataTable"
      :data="tempData"
      stripe
      size="mini"
      row-key="id"
    >
      <el-table-column label="序号" header-align="center" min-width="4%">
        <template slot-scope="scope">
          <div>{{ scope.$index + 1 }}</div>
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="30%">
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
                  v-for="(item) in responseDataSourceMapping"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-row>
            <el-row>
              <el-input
                v-model="scope.row.key"
                type="textarea"
                size="mini"
                :rows="1"
                :placeholder="getDataSourcePlaceholder(scope.row.data_source)"
              />
            </el-row>
          </el-row>
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="30%">
        <template slot="header">
          <span><span style="color: red">*</span>断言类型</span>
        </template>
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.validate_type"
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
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="30%">
        <template slot="header">
          <span><span style="color: red">*</span>预期结果</span>
        </template>
        <template slot-scope="scope">
          <el-row>
            <el-row>
              <el-select
                v-model="scope.row.data_type"
                placeholder="选择预期结果数据类型"
                :disabled="scope.row.validate_type === '值为真' || scope.row.validate_type === '值为假'"
                style="width: 100%"
                filterable
                clearable
                default-first-option
                size="mini"
              >
                <el-option
                  v-for="(item) in dataTypeMapping"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-row>
            <el-row>
              <el-input
                v-model="scope.row.value"
                size="mini"
                type="textarea"
                :disabled="scope.row.validate_type === '值为真' || scope.row.validate_type === '值为假'"
                :rows="1"
                :placeholder="
                  scope.row.validate_type === '契约校验' ?
                    '详见：https://pypi.org/project/pactverify/，注：契约校验标识符改用@':
                    '预期结果'
                "
              />
            </el-row>
          </el-row>
        </template>
      </el-table-column>

      <el-table-column label="操作" header-align="center" min-width="6%">
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

import Sortable from 'sortablejs'

export default {
  name: 'Validates',
  props: ['validates'],

  data() {
    return {
      tempData: [],

      validateTypeList: [],
      dataTypeMapping: [],
      responseDataSourceMapping: [],
      sortable: null,
      oldList: [],
      newList: []
    }
  },

  watch: {
    'validates': {
      handler(newVal, oldVal) {
        this.initValidates(newVal)
      }
    }
  },

  mounted() {
    this.validateTypeList = this.$busEvents.data.apiTestAssertMappingList // 从缓存获取断言类型映射
    this.dataTypeMapping = this.$busEvents.data.dataTypeMappingList // 从缓存获取数据类型映射
    this.responseDataSourceMapping = this.$busEvents.data.responseDataSourceMappingList // 从缓存获取响应对象数据源映射

    this.initValidates(this.validates)
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
        return '实际结果提取表达式'
      } else if (_type === 'regexp') {
        return '请填写正确的正则表达式'
      } else {
        return 'jsonpath表达式，若要提取整个对象，则不填写'
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
          data_source: this.responseDataSourceMapping[0].value,
          key: null,
          validate_type: this.validateTypeList[0].value,
          data_type: this.dataTypeMapping[0].value,
          value: null
        })
      } else {
        this.tempData = [{
          id: `${Date.now()}`,
          data_source: null,
          key: null,
          validate_type: null,
          data_type: null,
          value: null
        }]
      }
    },

    // 删除一行
    delRow(index) {
      this.tempData.splice(index, 1)
    },

    // 清除数据
    clearData() {
      this.tempData[0].data_source = null
      this.tempData[0].key = null
      this.tempData[0].validate_type = null
      this.tempData[0].data_type = null
      this.tempData[0].value = null
    },

    initValidates(validates) {
      if (validates && validates.length > 0) {
        this.tempData = this.validates
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
