<template>
  <div class="app-container">

    <el-form label-width="100px" :inline="true">

      <el-form-item :label="'环境名字：'" size="mini">
        <el-input
          v-model="listQuery.name"
          class="input-with-select"
          placeholder="环境名字，支持模糊搜索"
          size="mini"
          clearable
          style="width: 300px"
        />
      </el-form-item>

      <el-form-item :label="'环境code：'" size="mini">
        <el-input
          v-model="listQuery.code"
          class="input-with-select"
          placeholder="环境code，支持模糊搜索"
          size="mini"
          clearable
          style="width: 300px"
        />
      </el-form-item>

      <el-button
        type="primary"
        size="mini"
        @click="getRunEnvList()"
      >
        搜索
      </el-button>

      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        size="mini"
        @click="showAddRunEnvDialog()"
      >
        添加环境
      </el-button>

    </el-form>

    <el-table
      ref="listTable"
      v-loading="tableLoadingIsShow"
      element-loading-text="正在排序中"
      element-loading-spinner="el-icon-loading"
      :data="run_env_list"
      stripe
      row-key="id"
    >
      <el-table-column prop="id" label="编号" align="center" min-width="10%">
        <template slot-scope="scope">
          <span> {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="name" align="center" label="环境名字" min-width="35%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="code" align="center" label="环境code" min-width="35%">
        <template slot-scope="scope">
          <span> {{ scope.row.code }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="desc" align="center" label="备注" min-width="35%">
        <template slot-scope="scope">
          <span> {{ scope.row.desc }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="desc" align="center" label="操作" min-width="10%">
        <template slot-scope="scope">
          <el-tooltip
            class="item"
            effect="dark"
            content="修改"
            placement="top-start"
          >
            <el-button
              type="text"
              size="mini"
              icon="el-icon-edit"
              @click.native="showAddRunEnvDialog(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>

    </el-table>

    <!-- 新增/修改环境 -->
    <el-drawer
      :title=" drawerType === 'add' ? '新增环境' : '修改环境'"
      size="60%"
      :wrapper-closable="false"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >

      <el-form
        ref="envForm"
        label-width="80px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px"
      >
        <el-form-item :label="'环境名字'" class="is-required" size="mini">
          <el-input
            v-model="tempRunEnv.name"
            placeholder="环境名字"
            size="mini"
          />
        </el-form-item>

        <el-form-item :label="'code'" class="is-required" size="mini">
          <el-input
            v-model="tempRunEnv.code"
            :disabled="drawerType === 'edit'"
            placeholder="环境code"
            size="mini"
          />
        </el-form-item>

        <el-form-item :label="'备注'" size="mini">
          <el-input v-model="tempRunEnv.desc" type="textarea" autosize size="mini" />
        </el-form-item>

      </el-form>

      <div class="demo-drawer__footer">
        <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          type="primary"
          size="mini"
          :loading="submitButtonIsLoading"
          @click=" drawerType === 'add' ? addRunEnv() : changRunEnv()"
        >
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

    <pagination
      v-show="run_env_total>0"
      :total="run_env_total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getRunEnvList"
    />
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'
import { runEnvList, postRunEnv, putRunEnv, runEnvSort } from '@/apis/config/runEnv'

export default {
  name: 'Index',
  components: {
    Pagination
  },
  data() {
    return {
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        create_user: '',
        name: '',
        code: ''
      },
      // 请求列表等待响应的状态
      tableLoadingIsShow: false,
      run_env_total: 0,
      run_env_list: [],
      drawerIsShow: false,
      drawerType: '',
      direction: 'rtl', // 抽屉打开方式
      submitButtonIsLoading: false,
      tempRunEnv: {},

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: []
    }
  },

  created() {
    this.oldList = this.run_env_list.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  mounted() {
    this.getRunEnvList()
  },

  methods: {

    showAddRunEnvDialog(row) {
      if (row) {
        this.tempRunEnv = JSON.parse(JSON.stringify(row))
        this.drawerType = 'edit'
      } else {
        this.tempRunEnv = {
          id: '',
          name: '',
          code: '',
          desc: ''
        }
        this.drawerType = 'add'
      }
      this.drawerIsShow = true
    },

    // 增加配置类型
    addRunEnv() {
      this.submitButtonIsLoading = true
      postRunEnv(this.tempRunEnv).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.getRunEnvList()
        }
      })
    },

    // 修改配置类型
    changRunEnv() {
      this.submitButtonIsLoading = true
      putRunEnv(this.tempRunEnv).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.getRunEnvList()
        }
      })
    },

    // 获取配置类型列表
    getRunEnvList() {
      this.tableLoadingIsShow = true
      runEnvList(this.listQuery).then(response => {
        this.tableLoadingIsShow = false
        this.run_env_list = response.data.data
        this.run_env_total = response.data.total

        this.oldList = this.run_env_list.map(v => v.id)
        this.newList = this.oldList.slice()
      })
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.listTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.run_env_list.splice(evt.oldIndex, 1)[0]
          this.run_env_list.splice(evt.newIndex, 0, targetRow)
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          runEnvSort({
            List: this.newList,
            pageNum: this.listQuery.pageNum,
            pageSize: this.listQuery.pageSize
          }).then(response => {
            this.showMessage(this, response)
            this.tableLoadingIsShow = false
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
