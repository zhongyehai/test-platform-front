<template>
  <el-table
    ref="dataTable"
    :data="tempData"
    stripe
    :show-header="false"
    size="mini"
    row-key="id"
  >

    <el-table-column label="id" header-align="center" min-width="4%">
      <template slot-scope="scope">
        <div>{{ scope.$index + 1 }}</div>
      </template>
    </el-table-column>

    <el-table-column label="Key" header-align="center" min-width="30%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.key" size="mini" type="textarea" :rows="1" :placeholder="placeholderKey" />
      </template>
    </el-table-column>

    <el-table-column label="Value" header-align="center" min-width="30%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.value" size="mini" type="textarea" :rows="1" :placeholder="placeholderValue" />
      </template>
    </el-table-column>

    <el-table-column label="数据类型" header-align="center" min-width="10%">
      <template slot-scope="scope">
        <el-select
          v-model="scope.row.data_type"
          placeholder="选择数据类型"
          style="width: 100%"
          filterable
          clearable
          size="mini"
        >
          <el-option
            v-for="(item) in $busEvents.data.dataTypeMappingList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </template>
    </el-table-column>

    <el-table-column label="备注" header-align="center" min-width="20%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.remark" size="mini" type="textarea" :rows="1" :placeholder="placeholderDesc" />
      </template>
    </el-table-column>

    <el-table-column label="添加/删除" header-align="center" min-width="6%">
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
    'currentData', 'placeholderKey', 'placeholderValue', 'placeholderDesc'
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
    },

    // 如果临时数据长度为0，则添加一行
    'tempData': {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        if (newVal.length === 0) {
          this.addRow()
        }
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

    initTempData(data) {
      if (data && data.length > 0) {
        this.tempData = this.currentData
      } else {
        this.addRow()
      }
    },

    // 添加一行
    addRow(isRow) {
      if (isRow) {
        this.tempData.push({
          id: `${Date.now()}`,
          key: null,
          value: null,
          remark: null,
          data_type: 'str'
        })
      } else {
        this.tempData = [{
          id: `${Date.now()}`,
          key: null,
          value: null,
          remark: null,
          data_type: null
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
      this.tempData[0].key = null
      this.tempData[0].value = null
      this.tempData[0].remark = null
      this.tempData[0].data_type = null
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
