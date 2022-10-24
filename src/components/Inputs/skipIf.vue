<template>
  <div>
    <!-- 使用示例 -->
    <el-collapse accordion>
      <el-collapse-item>
        <template slot="title">
          <div style="color:#409eff"> 点击查看示例</div>
        </template>

        <div style="margin-left: 20px">
          <div style="margin-left: 20px; margin-bottom: 5px">
            任意一行设置的表达式成立，都会执行跳过操作，使用方法与断言一致，详见断言示例
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>


    <!-- 断言 -->
    <el-table
      :data="tempSkipIf"
      size="mini"
      stripe
      :show-header="false"
      class="h-b-e-a-style"
      :row-style="{'background-color': 'rgb(250, 250, 250)'}">

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

      <el-table-column label="添加一行" header-align="center" min-width="10%">
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
        </template>
      </el-table-column>

    </el-table>

  </div>


</template>

<script>

import {getAssertMapping} from '@/apis/apiTest/api'
import {getConfigByName, getSkipIfDataSourceMapping, getSkipIfTypeMapping} from '@/apis/config/config'

export default {
  name: "skipIf",
  props: ['skipIfData', 'use_type'],

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
  },

  created() {
    this.getValidates(this.skipIfData)
  },

  data() {
    return {
      validateTypeList: [],

      tempSkipIf: [
        {
          skip_type: null,
          data_source: null,
          check_value: null,
          comparator: null,
          data_type: null,
          expect: null
        }
      ],

      dataTypeMapping: [],
      skipIfDataSourceMapping: [],
      skipIfTypeMapping: [],
    }
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
    getDataTypeMapping(){
      getConfigByName({'name': 'data_type_mapping'}).then(response => {
        this.dataTypeMapping = JSON.parse(response.data.value)
      })
    },

    // 根据选择的数据源显示不同的提示
    getDataSourcePlaceholder(_type){
      if (!_type){
        return '请选择数据源'
      }else if (_type === 'variable'){
        return '请填写自定义变量表达式'
      }else if (_type === 'func'){
        return '请填写自定义函数表达式'
      }else{
        return ''
      }
    },

    // 选中断言类型事件
    selectValidateType(data, row){
      if (data === '值为真'){
        this.$set(row, 'data_type', 'str')
        this.$set(row, 'value', 'True')
        return true
      }else if (data === '值为假'){
        this.$set(row, 'data_type', 'str')
        this.$set(row, 'value', 'False')
        return true
      }
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempSkipIf.length === 1 && index === 0)
    },

    // 添加一行
    addRow() {
      this.tempSkipIf.push({
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
      this.tempSkipIf.splice(index, 1);
    },

    getValidates(validates) {
      if (validates && validates.length > 0) {
        this.tempSkipIf = validates
      } else {
        this.tempSkipIf = [        {
          skip_type: null,
          data_source: null,
          check_value: null,
          comparator: null,
          data_type: null,
          expect: null
        }]
      }
    }
  },

  watch: {
    'skipIfData': {
      handler(newVal, oldVal) {
        this.getValidates(newVal)
      }
    }
  }
}
</script>

<style scoped>

</style>
