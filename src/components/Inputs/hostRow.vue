<template>
  <el-table :data="tempData" stripe :show-header="false" size="mini">
    <el-table-column label="value" header-align="center" minWidth="50">
      <template slot-scope="scope">
        <el-input v-model="scope.row.value" size="mini" placeholder="http://localhost:8080"></el-input>
      </template>
    </el-table-column>
    <el-table-column label="添加" header-align="center" size="mini" minWidth="5">
      <template slot-scope="scope">
        <el-button v-show="isShowAddHostButton(scope.$index)"
                   type="success"
                   size="mini"
                   icon="el-icon-plus"
                   @click="addHostRow"
        >
        </el-button>
      </template>
    </el-table-column>
    <el-table-column label="删除" header-align="center" minWidth="5">
      <template slot-scope="scope">
        <el-button v-show="isShowDelHostButton(scope.$index)"
                   type="danger"
                   size="mini"
                   icon="el-icon-minus"
                   @click="delHostRow(scope.$index)"
        >
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: "hostRow",
  props: ['hostList'],
  data() {
    return {
      tempData: []
    }
  },

  created() {
    this.tempData = this.hostList.length > 0 ? this.hostList : [{value: ''}]
  },

  methods: {

    // 是否显示添加按钮
    isShowAddHostButton(index) {
      //  如果行索引为tempProject.hosts.length - 1 (最后一行) 则显示添加按钮
      return index === this.tempData.length - 1
    },

    // 是否显示删除按钮
    isShowDelHostButton(index) {
      // 如果host行数为1，且行索引为0 (第一行) 则不显示删除按钮
      return !(this.tempData.length === 1 && index === 0)
    },

    // 添加一行host
    addHostRow() {
      this.tempData.push({value: null})
    },

    // 删除一行host
    delHostRow(index) {
      this.tempData.splice(index, 1)
    }
  },
  watch: {
    'hostList': {
      handler(newVal, oldVal) {
        this.tempData = newVal
      }
    }
  }
}
</script>

<style scoped>

</style>
