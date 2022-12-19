<template>
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

    <el-table-column label="Key" header-align="center" min-width="35%">
      <template slot-scope="scope">
        <el-input
          v-model="scope.row.key"
          size="mini"
          type="textarea"
          :rows="1"
          @change="changeData"
          :placeholder="placeholderKey">
        </el-input>
      </template>
    </el-table-column>

    <el-table-column label="Value" header-align="center" min-width="35%">
      <template slot-scope="scope">
        <el-input
          v-model="scope.row.value"
          size="mini"
          type="textarea"
          :rows="1"
          @change="changeData"
          :placeholder="placeholderValue">
        </el-input>
      </template>
    </el-table-column>

    <el-table-column label="备注" header-align="center" min-width="20%">
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
</template>

<script>
import Sortable from "sortablejs";

export default {
  name: 'changeRow',
  props: [
    'currentData',
    'placeholderKey',
    'placeholderValue',
    'placeholderDesc',
    'busEvent'
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

    // 修改数据时，如果传了bus事件，则发送
    changeData(value){
      if (this.busEvent){
        this.$bus.$emit(this.busEvent, this.tempData)
      }
    },

    initTempData(){
      this.tempData = []
      for (let index in this.currentData){
        let data = this.currentData[index]
        data["id"] = `${index}_${data.key}`
        this.tempData.push(data)
      }
    },

    // 添加一行
    addRow() {
      this.tempData.push({id: this.tempData.length, key: null, value: null, remark: null, data_type: 'str'})
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempData.length === 1 && index === 0)
    },

    // 删除一行
    delRow(index) {
      this.tempData.splice(index, 1)
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
          this.tempData = [{id: 0, key: null, value: null, remark: null, data_type: 'str'}]
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
