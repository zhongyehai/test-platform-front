<template>
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

    <el-table-column header-align="center" min-width="35%">
      <template slot="header">
        <span><span style="color: red">*</span>字段key</span>
      </template>
      <template slot-scope="scope">
        <el-input
          v-model="scope.row.key"
          size="mini"
          type="textarea"
          :disabled="canEdite === false"
          :rows="1"
          :placeholder="placeholderKey"
          @change="changeData"
        />
      </template>
    </el-table-column>

    <el-table-column header-align="center" min-width="35%">
      <template slot="header">
        <span><span style="color: red">*</span>字段value</span>
      </template>
      <template slot-scope="scope">
        <el-input
          v-model="scope.row.value"
          size="mini"
          type="textarea"
          :rows="1"
          :placeholder="placeholderValue"
          @change="changeData"
        />
      </template>
    </el-table-column>

    <el-table-column header-align="center" min-width="20%">
      <template slot="header">
        <span><span style="color: red">*</span>字段说明</span>
      </template>
      <template slot-scope="scope">
        <el-input
          v-model="scope.row.remark"
          :disabled="canEdite === false"
          size="mini"
          type="textarea"
          :rows="1"
          :placeholder="placeholderDesc"
        />
      </template>
    </el-table-column>

    <el-table-column v-if="canEdite !== false" label="操作" header-align="center" min-width="6%">
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
</template>

<script>
import Sortable from 'sortablejs'

export default {
  name: 'ChangeRow',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'currentData', 'placeholderKey', 'placeholderValue', 'placeholderDesc', 'busEventName', 'canEdite'
  ],
  data() {
    return {
      tempData: [],
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
    this.initTempData(this.currentData)

    this.oldList = this.tempData.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },
  methods: {

    // 修改数据时，如果传了bus事件，则发送
    changeData(value) {
      if (this.busEventName) {
        this.$bus.$emit(this.$busEvents.changeData, this.busEventName, this.tempData)
      }
    },

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

    // 添加一行
    addRow(isRow) {
      if (isRow) {
        this.tempData.push({
          id: `${Date.now()}`,
          key: undefined,
          value: undefined,
          remark: undefined,
          data_type: 'str'
        })
      } else {
        this.tempData = [{
          id: `${Date.now()}`,
          key: undefined,
          value: undefined,
          remark: undefined,
          data_type: undefined
        }]
      }
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempData.length === 1 && index === 0)
    },

    // 删除一行
    delRow(index) {
      this.tempData.splice(index, 1)
    },

    // 清除数据
    clearData() {
      this.tempData[0].key = undefined
      this.tempData[0].value = undefined
      this.tempData[0].remark = undefined
      this.tempData[0].data_type = undefined
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
