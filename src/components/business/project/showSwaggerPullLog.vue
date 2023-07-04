<template>

  <el-drawer
    title="拉取swagger记录"
    size="60%"
    :append-to-body="true"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >
    <el-table ref="swaggerPullLogTable" :data="pullLogList" stripe>
      <el-table-column prop="num" align="center" label="序号" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="name" label="状态" align="center" min-width="50%">
        <template slot-scope="scope">
          <el-tag :type="pullStatusTagType[scope.row.status]">
            {{ pullStatusContent[scope.row.status] }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="name" align="center" label="操作时间" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.created_time }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="name" align="center" label="操作人员" min-width="25%">
        <template slot-scope="scope">
          <span> {{ userDict[scope.row.create_user].name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="name" align="center" label="操作" min-width="25%">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="showPullLogDetail(scope.row)"
          >详情</el-button>
        </template>
      </el-table-column>

    </el-table>

    <el-drawer
      title="拉取swagger详情"
      size="50%"
      :append-to-body="true"
      :visible.sync="pullLogDetailIsShow"
      :direction="direction"
    >
      <div style="margin-right: 20px;margin-left: 20px">

        <div style="margin-bottom: 20px">
          <label class="label-style">触发人：</label>
          <el-input
            :value="pullLogDetailData.create_user_name"
            disabled
            style="width: 85%"
            size="mini"
            type="textarea"
            :rows="1"
          />
        </div>

        <div style="margin-bottom: 20px">
          <label class="label-style">请求参数：</label>
          <el-input
            :value="pullLogDetailData.pull_args || ''"
            disabled
            style="width: 85%"
            size="mini"
            type="textarea"
            :rows="2"
          />
        </div>

        <div>
          <label class="label-style">备注信息：</label>
          <el-input
            :value="pullLogDetailData.desc || ''"
            disabled
            style="width: 85%"
            size="mini"
            type="textarea"
            :rows="2"
          />
        </div>
      </div>

    </el-drawer>
  </el-drawer>
</template>

<script>

import { swaggerPullList } from '@/apis/assist/swagger'
import { swaggerPullStatusMappingContent, swaggerPullStatusMappingTagType } from '@/utils/mapping'

export default {
  name: 'ShowSwaggerPullLog',
  components: {},
  data() {
    return {
      drawerIsShow: false,
      pullLogDetailIsShow: false,
      pullLogDetailData: {},
      direction: 'rtl', // 抽屉打开方式
      pullStatusContent: swaggerPullStatusMappingContent,
      pullStatusTagType: swaggerPullStatusMappingTagType,
      pullLogList: [],
      userDict: {}
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, project, userDict) => {
      if (_type === 'showSwaggerPullLog') {
        this.userDict = userDict
        swaggerPullList({ project_id: project.id }).then(response => {
          if (this.showMessage(this, response)) {
            this.pullLogList = response.data
          }
        })
        this.drawerIsShow = true
      }
    })
  },

  // 页面销毁的时候，关闭bus监听选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {
    showPullLogDetail(data) {
      this.pullLogDetailData = data
      this.pullLogDetailData.create_user_name = this.userDict[data.create_user].name
      this.pullLogDetailIsShow = true
    }
  }

}
</script>

<style scoped>

</style>
