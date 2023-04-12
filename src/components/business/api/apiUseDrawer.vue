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
      <el-table-column prop="num" align="center" label="序号" min-width="10%">
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

      <el-table-column align="center" min-width="15%">
        <template slot="header">
          <span>用例是否执行</span>
          <el-tooltip
            class="item"
            effect="dark"
            placement="top-start"
          >
            <div slot="content">
              <div>1: 若此处设置为不运行，则运行用例集、定时任务时将不会运行此用例</div>
              <div>2: 请务必将用例调试通过后再设为要运行</div>
            </div>
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :inactive-value="0"
            :active-value="1"
            @change="changeCaseIsRun(scope.row)"
          />
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
    'marker'
  ],
  data() {
    return {
      drawerIsShow: false,
      direction: 'rtl', // 抽屉打开方式
      caseList: []
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

    // 修改用例状态
    changeCaseIsRun(row) {
      putCaseIsRun({ 'id': row.id }).then(response => {
        this.showMessage(this, response)
      })
    }
  }

}
</script>

<style scoped>

</style>
