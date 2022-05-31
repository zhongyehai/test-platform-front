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
            示例数据： {"status": 200, "message": "获取成功", "list": [{"id": 1},{"id": 2}]}
          </div>
          <div style="margin-left: 20px">

            <!-- 断言整数 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言整数</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%"></el-input>
                <el-input size="mini" disabled :placeholder="'status'" style="width: 90%"></el-input>
              </el-col>

              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'相等'" style="width: 90%"></el-input>
              </el-col>

              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'整数'" style="width: 90%"></el-input>
                <el-input size="mini" disabled :placeholder="'200'" style="width: 90%"></el-input>
              </el-col>
            </el-row>

            <!-- 断言普通字符串 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言普通字符串</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%"></el-input>
                <el-input size="mini" disabled :placeholder="'message'" style="width: 90%"></el-input>
              </el-col>

              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'相等'" style="width: 90%"></el-input>
              </el-col>

              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'普通字符串'" style="width: 90%"></el-input>
                <el-input size="mini" disabled :placeholder="'获取成功'" style="width: 90%"></el-input>
              </el-col>
            </el-row>

            <!-- 断言自定义变量 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言自定义变量</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%"></el-input>
                <el-input size="mini" disabled :placeholder="'status'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'相等'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'自定义变量'" style="width: 90%"></el-input>
                <el-input size="mini" disabled :placeholder="'$extract_name_2'" style="width: 90%"></el-input>
              </el-col>
            </el-row>

            <!-- 断言自定义函数 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言自定义函数</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%"></el-input>
                <el-input size="mini" disabled :placeholder="'status'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'相等'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'自定义函数'" style="width: 90%"></el-input>
                <el-input size="mini" disabled :placeholder="'${do_something(status)}'" style="width: 90%"></el-input>
              </el-col>
            </el-row>

            <!-- 断言自定义函数+自定义变量 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>断言自定义函数+自定义变量</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%"></el-input>
                <el-input size="mini" disabled :placeholder="'status'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'相等'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'自定义函数'" style="width: 90%"></el-input>
                <el-input size="mini" disabled :placeholder="'${do_something($extract_name_2)}'"
                          style="width: 90%"></el-input>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>


    <!-- 断言 -->
    <el-table
      :data="tempValidates"
      size="mini"
      stripe
      :show-header="false"
      class="h-b-e-a-style"
      :row-style="{'background-color': 'rgb(250, 250, 250)'}">

      <el-table-column label="validate_type" header-align="center" min-width="15%">
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
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </template>
      </el-table-column>

      <el-table-column label="数据源" header-align="center" min-width="15%">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.element"
            placeholder="选择数元素"
            style="width: 100%"
            filterable
            clearable
            default-first-option
            size="mini">
            <el-option
              v-for="(item) in tempElementList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>

        </template>
      </el-table-column>

      <el-table-column property="data_type" label="数据类型" header-align="center" min-width="15%">
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.data_type"
            placeholder="选择数据类型"
            :disabled="scope.row.validate_type === '值为真' || scope.row.validate_type === '值为假'"
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
        </template>
      </el-table-column>

      <el-table-column property="value" label="Value" header-align="center" min-width="15%">
        <template slot-scope="scope">
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
                ">
          </el-input>
        </template>
      </el-table-column>

      <el-table-column label="添加一行" header-align="center" min-width="4%">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
            <el-button
              v-show="isShowAddButton(scope.$index)"
              type="text"
              size="mini"
              icon="el-icon-plus"
              @click.native="addRow(scope.$index)">
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column label="删除当前行" header-align="center" min-width="4%">
        <template slot-scope="scope">
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

import {assertMappingList} from '@/apis/uiTest/step'
import {getConfigByName} from '@/apis/config/config'

export default {
  name: "validates",
  props: [
    'validates',
    'tempElementList'
  ],

  mounted() {
    if (this.validateTypeList.length === 0) {
      this.getAssertMappings()
    }
    if (this.dataTypeMapping.length === 0) {
      this.getDataTypeMapping()
    }
  },

  created() {
    this.getValidates(this.validates)
  },

  data() {
    return {
      validateTypeList: [],
      tempValidates: [{element: null, key: null, validate_type: null, data_type: null, value: null}],

      dataTypeMapping: [],
      responseDataSourceMapping: [],
    }
  },

  methods: {

    // 从后端获取断言方式
    getAssertMappings() {
      assertMappingList().then(response => {
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

    // 是否显示添加按钮
    isShowAddButton(index) {
      return index === this.tempValidates.length - 1
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempValidates.length === 1 && index === 0)
    },

    // 添加一行
    addRow() {
      this.tempValidates.push({element: null, key: null, validate_type: null, data_type: null, value: null})
    },

    // 删除一行
    delRow(index) {
      this.tempValidates.splice(index, 1);
    },

    getValidates(validates) {
      if (validates && validates.length > 0) {
        this.tempValidates = validates
      } else {
        this.tempValidates = [{element: null, key: null, validate_type: null, data_type: null, value: null}]
      }
    }
  },

  watch: {
    'validates': {
      handler(newVal, oldVal) {
        this.getValidates(newVal)
      }
    }
  }
}
</script>

<style scoped>

</style>
