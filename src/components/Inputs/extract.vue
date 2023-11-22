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
            1、此处提取的数据只在运行时有效 <br>
            2、若在此处设置的key与服务/用例设置的公共变量的一致，则会使用此处提取到的值
          </div>
          <div style="margin-left: 20px; margin-bottom: 5px">
            示例数据： {"status": 200, "data_list": [{"id": 1},{"id": 2}]}
          </div>
          <div style="margin-left: 20px">

            <!-- 提取整个响应对象 -->
            <el-row>
              <el-col :span="5">
                <div>提取整个响应对象</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_1'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="''" style="width: 95%" />
              </el-col>
            </el-row>

            <!-- 提取json中的status -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>提取json中的status</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_2'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'status'" style="width: 95%" />
              </el-col>
            </el-row>

            <!-- 提取json中的data_list -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>提取json中的data_list</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_2'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'data_list'" style="width: 95%" />
              </el-col>
            </el-row>

            <!-- 提取list中的第一个值的id -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>提取list中的第一个值的id</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_3'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应cookies'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'data_list.0.id'" style="width: 95%" />
              </el-col>
            </el-row>

            <!-- 提取list中的第二个值的id -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>提取list中的第二个值的id</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_4'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'data_list.1.id'" style="width: 95%" />
              </el-col>
            </el-row>

            <!-- 提取list中的最后一个值的id -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>提取list中的最后一个值的id</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_5'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'data_list.-1.id'" style="width: 95%" />
              </el-col>
            </el-row>

            <!-- 提取list中的倒数第二个值的id -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>提取list中的倒数第二个值的id</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_6'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'data_list.-2.id'" style="width: 95%" />
              </el-col>
            </el-row>

            <!-- 正则表达式提取 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>正则表达式提取</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_7'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'正则表达式（从响应体提取）'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'[{(.+?)},{'" style="width: 95%" />
              </el-col>
            </el-row>

            <!-- 自定义函数 不传参提取 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>自定义函数 不传参提取</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_8'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'${do_something()}'" style="width: 95%" />
              </el-col>
            </el-row>

            <!-- 自定义函数+提取表达式 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>自定义函数+提取表达式</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_9'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'${do_something(status)}'" style="width: 95%" />
              </el-col>
            </el-row>

            <!-- 自定义函数+自定义变量 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>自定义函数+自定义变量</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_10'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input
                  size="mini"
                  disabled
                  :placeholder="'${do_something($extract_name_8, a=status)}'"
                  style="width: 95%"
                />
              </el-col>
            </el-row>

            <!-- 常量 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>常量</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_11'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'常量'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input
                  size="mini"
                  disabled
                  :placeholder="'123'"
                  style="width: 95%"
                />
              </el-col>
            </el-row>

            <!-- 自定义变量二次提取 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>自定义变量二次提取</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_12'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'自定义变量'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input
                  size="mini"
                  disabled
                  :placeholder="'$extract_name_2.1.id'"
                  style="width: 95%"
                />
              </el-col>
            </el-row>

            <!-- 自定义变量二次提取 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>自定义变量二次赋值</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_12'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'自定义变量'" style="width: 90%" />
              </el-col>
              <el-col :span="7">
                <el-input
                  size="mini"
                  disabled
                  :placeholder="'$extract_name_2'"
                  style="width: 95%"
                />
              </el-col>
            </el-row>

          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

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

      <el-table-column header-align="center" min-width="7%">
        <template slot="header">
          <span>是否执行</span>
        </template>
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :inactive-value="0"
            :active-value="1"
          />
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="20%">
        <template slot="header">
          <span><span style="color: red">*</span>变量key</span>
        </template>
        <template slot-scope="scope">
          <el-input v-model="scope.row.key" size="mini" type="textarea" :rows="1" :placeholder="placeholderKey" />
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="20%">
        <template slot="header">
          <span><span style="color: red">*</span>数据源</span>
        </template>
        <template slot-scope="scope">
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
        </template>
      </el-table-column>

      <el-table-column label="提取表达式" header-align="center" min-width="20%">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.value"
            size="mini"
            type="textarea"
            :rows="1"
            :placeholder="getPlaceholder(scope.row.data_source)"
          />
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="10%">
        <template slot="header">
          <span>更新到头部</span>
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">
              <div>作用：在特殊场景中，直接把提取到的值设置到后续操作中的头部参数中</div>
              <div>1、若打开此开关，则会将此处提取到的值，以当前设置的key更新到后续步骤的头部信息中</div>
              <div>2、若在其他地方已预设头部信息包含当前的key，对于头部信息中的这个key，则会以将此处提取到的值为准</div>
              <div>注：提取后的数据会以key、value的形式存在于自定义变量池中，不管是否选择更新到头部，都可使用</div>
            </div>
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <el-switch v-model="scope.row.update_to_header" />
        </template>
      </el-table-column>

      <el-table-column label="备注" header-align="center" min-width="20%">
        <template slot="header">
          <span><span style="color: red">*</span>备注</span>
        </template>
        <template slot-scope="scope">
          <el-input v-model="scope.row.remark" size="mini" type="textarea" :rows="1" :placeholder="placeholderDesc" />
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
  name: 'Extract',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'currentData', 'placeholderKey', 'placeholderValue', 'placeholderDesc'
  ],
  data() {
    return {
      tempData: [],
      responseDataSourceMapping: [{ label: '', value: '' }],
      sortable: null,
      oldList: [],
      newList: []
    }
  },

  watch: {
    'currentData': {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        this.initTempData(newVal)
      }
    }

  },

  mounted() {
    // 从获取响应对象数据源映射
    this.responseDataSourceMapping = this.$busEvents.data.responseDataSourceMappingList

    this.initTempData(this.currentData)
    this.oldList = this.tempData.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },
  methods: {

    initTempData(data) {
      if (data && data.length > 0) {
        this.tempData = []
        this.currentData.forEach((data, index) => {
          data['id'] = `${Date.now()}_${index}`
          this.tempData.push(JSON.parse(JSON.stringify(data)))
        })
      } else {
        this.addRow()
      }
    },

    // 根据选择的数据源显示不同的提示
    getPlaceholder(_type) {
      if (!_type) {
        return this.placeholderValue
      } else if (_type === 'regexp') {
        return '请填写正确的正则表达式'
      } else {
        return 'jsonpath表达式，若要提取整个对象，则不填写'
      }
    },

    // 添加一行
    addRow(isRow) {
      if (isRow) {
        this.tempData.push({
          id: `${Date.now()}`,
          status: 1,
          key: null,
          data_source: this.responseDataSourceMapping[0].value,
          value: null,
          remark: null,
          update_to_header: null
        })
      } else {
        this.tempData = [{
          id: `${Date.now()}`,
          status: 1,
          key: null,
          data_source: null,
          value: null,
          remark: null,
          update_to_header: null
        }]
      }
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempData.length === 1 && index === 0)
    },

    // 删除一行
    delRow(i) {
      this.tempData.splice(i, 1)
    },

    // 清除数据
    clearData() {
      this.tempData[0].status = 0
      this.tempData[0].key = null
      this.tempData[0].value = null
      this.tempData[0].remark = null
      this.tempData[0].data_source = null
      this.tempData[0].update_to_header = null
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
