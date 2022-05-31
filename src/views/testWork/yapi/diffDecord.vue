<template>
  <div class="app-container">
    <el-form label-width="200px">
      <el-form-item :label="'选择历史比对类型：'" size="mini">
        <el-select
          v-model="currentProject"
          placeholder="选择历史比对类型"
          size="mini"
          style="width: 500px"
          filterable
          default-first-option
          @change="getDiffRecordListData"
        >
          <el-option
            v-for="item in projectList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          >
          </el-option>
        </el-select>

        <el-button
          v-show="currentProject"
          type="primary"
          size="mini"
          style="margin-left: 50px"
          @click.native="downloadXmidSetup()">下载xmind8安装包
        </el-button>

      </el-form-item>
    </el-form>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      :data="diffRecordList"
      stripe
    >
      <el-table-column prop="id" label="数据id" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.id }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="project" label="名称" min-width="20%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'创建时间'" prop="id" align="center" min-width="20%">
        <template slot-scope="scope">
          <span>{{ scope.row.created_time }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'创建人'" prop="id" align="center" min-width="20%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="name" label="是否有改变" min-width="10%">
        <template slot-scope="scope">
          <el-tag size="small" :type="scope.row.is_changed === 1 ? 'danger' : 'success'">
            {{ scope.row.is_changed === 1 ? '有改变' : '没有改变' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="20%">
        <template slot-scope="scope">

          <el-button type="primary"
                     size="mini"
                     v-show="scope.row.is_changed === 1"
                     @click.native="showDetail(scope.row)">查看详情
          </el-button>

          <el-tooltip class="item" effect="dark" content="下载后需用xmind8打开" placement="top-start">
            <el-button type="primary"
                       size="mini"
                       :loading="scope.row.downloadLoadingIsShow"
                       v-show="scope.row.is_changed === 1"
                       @click.native="exportDiffRecordAsXmind(scope.row)">导出为xmind
            </el-button>
          </el-tooltip>

        </template>
      </el-table-column>
    </el-table>


    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="PageNum"
      :limit.sync="PageSize"
      @pagination="getDiffRecordListData"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

import {getDiffRecordList, getDiffRecordProjectList, getDiffRecordAsXmind} from "@/apis/testWork/yapi";
import {userList} from "@/apis/user/user";

export default {
  name: 'diffDecord',
  components: {Pagination},
  data() {
    return {
      // 用户列表
      user_list: [],

      // 服务列表
      projectList: [],

      // 当前选中的服务
      currentProject: '',

      // 数据列表
      diffRecordList: [],

      total: 0,
      PageNum: 1,
      PageSize: 20,


      // 加载状态
      listLoading: false,

      // 数据列表
      currentDataList: []
    }
  },

  methods: {

    // 获取服务列表
    getKYMProjectList() {
      getDiffRecordProjectList().then(response => {
        this.projectList = response.data
      })
    },

    // 获取用户信息，同步请求
    async getUserList() {
      let response = await userList()
      this.currentUserList = response.data.data
      response.data.data.forEach(user => {
        this.userDict[user.id] = user
      })
    },

    // 解析用户
    parseUser(userId) {
      return this.userDict[userId].name
    },

    // 选中服务
    getDiffRecordListData(value) {
      getDiffRecordList({
        'pageNum': this.PageNum,
        'pageSize': this.PageSize,
        'name': this.currentProject
      }).then(response => {
        this.diffRecordList = response.data.data
        this.total = response.data.total
      })
    },

    // 查看报告详情
    showDetail(row) {
      let {href} = this.$router.resolve({path: 'diffRecordShow', query: {id: row.id, name: row.name}})
      window.open(href, '_blank')
    },

    // 导出为xmind
    exportDiffRecordAsXmind(row) {
      getDiffRecordAsXmind({id: row.id}).then(response => {
        this.$set(row, 'downloadLoadingIsShow', false)
        let blob = new Blob([response], {
          type: 'application/vnd.ms-excel'      //将会被放入到blob中的数组内容的MIME类型
        });
        // 保存文件到本地
        let a = document.createElement('a')
        a.href = URL.createObjectURL(blob);  //生成一个url
        a.download = row.name + '.xmind'
        a.click()
      })
    },

    // 下载xmind8安装包
    downloadXmidSetup() {
      window.open('https://dl2.xmind.cn/xmind-8-update9-windows.exe')
    }
  },

  mounted() {
    this.getUserList()
    this.getKYMProjectList()
  },
}
</script>

<style>

</style>
