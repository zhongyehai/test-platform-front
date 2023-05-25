<template>

  <el-drawer
    title="接口使用情况"
    size="85%"
    :append-to-body="true"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >

    <el-table
      ref="apiTable"
      :data="caseList"
      stripe
    >
      <el-table-column prop="num" align="center" label="序号" min-width="8%">
        <template slot-scope="scope">
          <span> {{ scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="name" label="接口对应步骤" align="center" min-width="50%">
        <template slot-scope="scope">
          <span>{{ scope.row.from }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="name" align="center" label="用例名称" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column
        :show-overflow-tooltip="true"
        prop="level"
        align="center"
        min-width="17%"
      >
        <template slot="header">
          <span> 调试结果 </span>
          <el-tooltip
            class="item"
            effect="dark"
            placement="top-start"
          >
            <div slot="content">
              <div>1: 批量运行时，只有调试结果为通过的才会执行</div>
              <div>2: 请务必将用例调试通过后再设为调试通过</div>
            </div>
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <div>
            <div style="width: 80%; margin-left:auto; margin-right:auto">
              <el-select
                :ref="`statusSelector${scope.row.id}`"
                slot="prepend"
                v-model="scope.row.status"
                size="mini"
                placeholder="选择调试结果"
                filterable
                class="select"
                @change="changeCaseIsRun(scope.row)"
              >
                <el-option label="未调试-不执行" :value="0"><span style="color: #dcdfe6">未调试-不执行</span></el-option>
                <el-option label="调试通过-要执行" :value="1"><span style="color: #67C23A">调试通过-要执行</span></el-option>
                <el-option label="调试通过-不执行" :value="2"><span style="color: #909399">调试通过-不执行</span></el-option>
                <el-option label="调试不通过-不执行" :value="3"><span style="color: #F56C6C">调试不通过-不执行</span></el-option>
              </el-select>
            </div>
          </div>
        </template>
      </el-table-column>

    </el-table>

  </el-drawer>
</template>

<script>

import { putCaseIsRun } from '@/apis/apiTest/case'

export default {
  name: 'ApiUseDrawer',
  components: {},
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'marker'
  ],
  data() {
    return {
      drawerIsShow: false,
      direction: 'rtl', // 抽屉打开方式
      colorDict: {
        0: '#dcdfe6',
        1: '#67C23A',
        2: '#909399',
        3: '#F56C6C'
      },
      caseList: []
    }
  },

  watch: {

    // 重新获取用例列表后，修改对应的重要等级背景色颜色
    'caseList': {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        this.$nextTick(function() {
          newVal.forEach(test_case => {
            this.changeSelectCaseColor(test_case)
          })
        })
      }
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, marker, dataList) => {
      if (_type === 'apiUseIsShow' && marker === this.marker) {
        this.caseList = dataList
        this.drawerIsShow = true
      }
    })
  },

  // 页面销毁的时候，关闭bus监听选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    changeSelectCaseColor(row) {
      this.$refs[`statusSelector${row.id}`].$el.children[0].children[0].style.backgroundColor = this.colorDict[row.status]
    },

    // 修改用例状态
    changeCaseIsRun(row) {
      putCaseIsRun({ id: [row.id], status: row.status }).then(response => {
        this.showMessage(this, response)
        this.changeSelectCaseColor(row)
      })
    }
  }

}
</script>

<style scoped>

</style>
