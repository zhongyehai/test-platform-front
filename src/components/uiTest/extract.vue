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
            1、此处提取的数据只在运行时有效 <br/>
            2、若在此处设置的key与服务/用例设置的公共变量的一致，则会使用此处提取到的值
          </div>
          <div style="margin-left: 20px; margin-bottom: 5px">
            示例数据： {"status": 200, "list": [{"id": 1},{"id": 2}]}
          </div>
          <div style="margin-left: 20px">

            <!-- 提取整个响应对象 -->
            <el-row>
              <el-col :span="5">
                <div>提取整个响应对象</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_1'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="''" style="width: 95%"></el-input>
              </el-col>
            </el-row>

            <!-- 提取json中的status -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>提取json中的status</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_2'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应头部信息'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'status'" style="width: 95%"></el-input>
              </el-col>
            </el-row>

            <!-- 提取list中的第一个值的id -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>提取list中的第一个值的id</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_3'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应cookies'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'list.0.id'" style="width: 95%"></el-input>
              </el-col>
            </el-row>

            <!-- 提取list中的第二个值的id -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>提取list中的第二个值的id</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_4'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'list.1.id'" style="width: 95%"></el-input>
              </el-col>
            </el-row>

            <!-- 提取list中的最后一个值的id -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>提取list中的最后一个值的id</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_5'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'list.-1.id'" style="width: 95%"></el-input>
              </el-col>
            </el-row>

            <!-- 提取list中的倒数第二个值的id -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>提取list中的倒数第二个值的id</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_6'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'list.-2.id'" style="width: 95%"></el-input>
              </el-col>
            </el-row>

            <!-- 正则表达式提取 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>正则表达式提取</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_7'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'正则表达式（从响应体提取）'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'[{(.+?)},{'" style="width: 95%"></el-input>
              </el-col>
            </el-row>

            <!-- 自定义函数 不传参提取 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>自定义函数 不传参提取</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_8'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'${do_something()}'" style="width: 95%"></el-input>
              </el-col>
            </el-row>

            <!-- 自定义函数+提取表达式 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>自定义函数+提取表达式</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_9'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'${do_something(status)}'" style="width: 95%"></el-input>
              </el-col>
            </el-row>

            <!-- 自定义函数+自定义变量 -->
            <el-row style="margin-top: 5px">
              <el-col :span="5">
                <div>自定义函数+自定义变量</div>
              </el-col>
              <el-col :span="5">
                <el-input size="mini" disabled :placeholder="'extract_name_10'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'响应体'" style="width: 90%"></el-input>
              </el-col>
              <el-col :span="7">
                <el-input size="mini" disabled :placeholder="'${do_something($extract_name_8, a=status)}'"
                          style="width: 95%"></el-input>
              </el-col>
              <span style="margin-top: 5px"><span style="color: red">注</span>：自定义函数提取值，不支持传常量，只支持自定义变量或者提取表达式</span>
            </el-row>

          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

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
          <el-input v-model="scope.row.id" v-show="false"></el-input>
        </template>
      </el-table-column>

      <el-table-column label="Key" header-align="center" min-width="23%">
        <template slot-scope="scope">
          <el-input v-model="scope.row.key" size="mini" type="textarea" :rows="1" :placeholder="placeholderKey">
          </el-input>
        </template>
      </el-table-column>

      <el-table-column label="提取方式" header-align="center" min-width="23%">
        <template slot-scope="scope">
          <el-row>
            <el-select
              v-model="scope.row.extract_type"
              placeholder="选择提取方式"
              style="width: 100%"
              filterable
              clearable
              default-first-option
              size="mini">
              <el-option
                v-for="(item) in $busEvents.data.extractMappingList"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-row>
        </template>
      </el-table-column>

      <el-table-column label="Value" header-align="center" min-width="23%">
        <template slot-scope="scope">
          <!-- 选择自定义函数，则输入自定义函数 -->
          <el-input
            v-show="scope.row.extract_type === 'func'"
            v-model="scope.row.value"
            size="mini"
            type="textarea"
            :rows="1"
            placeholder="请填写正确的自定义函数">
          </el-input>

          <!-- 选择页面元素提取，则选择具体元素 -->
          <el-select
            v-show="scope.row.extract_type !== 'func'"
            v-model="scope.row.value"
            placeholder="选择元素"
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

      <el-table-column label="备注" header-align="center" min-width="21%">
        <template slot-scope="scope">
          <el-input v-model="scope.row.remark" size="mini" type="textarea" :rows="1" :placeholder="placeholderDesc">
          </el-input>
        </template>
      </el-table-column>

      <el-table-column label="添加" header-align="center" min-width="6%">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
            <el-button
              v-show="scope.$index === 0"
              type="text"
              size="mini"
              icon="el-icon-plus"
              @click.native="addRow(scope.$index)"
            >
            </el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
            <el-button
              v-show="isShowDelButton(scope.$index)"
              type="text"
              size="mini"
              icon="el-icon-minus"
              style="color: red"
              @click.native="delRow(scope.$index)"
            >
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>

    </el-table>
  </div>

</template>

<script>

import Sortable from "sortablejs";

export default {
  name: 'extract',
  props: [
    'currentData',
    'tempElementList',
    'placeholderKey',
    'placeholderValue',
    'placeholderDesc'
  ],
  data() {
    return {
      tempData: [],
      sortable: null,
      oldList: [],
      newList: [],
    }
  },

  methods: {

    initTempData(){
      this.tempData = []
      for (let index in this.currentData){
        let data = this.currentData[index]
        data["id"] = `${index}_${data.key}`
        this.tempData.push(data)
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

    // 是否显示添加按钮
    isShowAddButton(index) {
      return index === this.tempData.length - 1
    },

    // 添加一行
    addRow() {
      this.tempData.push({id: this.tempData.length, key: null, extract_type: null, value: null, remark: null})
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempData.length === 1 && index === 0)
    },

    // 删除一行
    delRow(i) {
      this.tempData.splice(i, 1)
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

  mounted() {
    this.initTempData()

    this.oldList = this.tempData.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  watch: {
    'currentData': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.initTempData()
        } else {
          this.tempData = [{id: 0, key: null, extract_type: null, value: null, remark: null}]
        }
      }
    },

    // 如果临时数据长度为0，则添加一行
    'tempData': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal.length === 0) {
          this.addRow()
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
