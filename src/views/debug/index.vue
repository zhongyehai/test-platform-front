<template>
  <div style="margin-left: 50px">
    {{ expands }}
    <el-table
      :data="tableData1"
      :row-class-name="hiddenRowIcon"
      style="width: 100%"
      row-key="id"
      :expand-row-keys="expands"
      @expand-change="expandChange"
    >
      <el-table-column type="expand" width="20px">
        <template slot-scope="props">
          <!--          {{ props.row.children }}-->
          <StepTable />
        </template>
      </el-table-column>

      <el-table-column prop="date" label="日期" />
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'StepTable',
  data() {
    return {
      expands: [],
      tableData: [{
        id: 1,
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        id: 2,
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        id: 3,
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄',
        children: [{
          id: 31,
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄'
        }, {
          id: 32,
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄'
        }]
      }, {
        id: 4,
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }],
      tableData1: [{
        id: 1,
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        id: 2,
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        id: 3,
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄',
        hasChildren: true
      }, {
        id: 4,
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄',
        hasChildren: true
      }]
    }
  },
  methods: {

    // 这里的childrenList是我的后端返回的字段 可根据你自己的接口修改
    // icon-no是我自定义的class名,可随意更改;和style同步就行
    hiddenRowIcon({ row }) {
      return row.hasChildren ? '' : 'hiddenRowIcon'
    },

    expandChange(row, expandedRows) {
      this.expands.indexOf(row.id) === -1 ? this.expands.push(row.id) : this.expands.splice(this.expands.indexOf(row.id))
      this.$set(row, 'children', [{
        id: 31,
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        id: 32,
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }])
    },

    load(tree, treeNode, resolve) {
      setTimeout(() => {
        resolve([
          {
            id: 31,
            date: '2016-05-01',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1519 弄'
          }, {
            id: 32,
            date: '2016-05-01',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1519 弄'
          }
        ])
      }, 1000)
    }
  }
}
</script>
<!--<style>-->
<!--//隐藏箭头-->
<!--/deep/ .el-table__expand-icon {-->
<!--  visibility: hidden !important;-->
<!--}-->

<!--</style>-->
<style lang="scss" scoped>
::v-deep .hiddenRowIcon .el-table__expand-icon {
  display: none;
}
</style>
