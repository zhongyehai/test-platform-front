<template>
  <div class="app-container">
    <el-form inline style="margin-left: 20px">
      <el-form-item :label="'测试类型'" prop="hit_type" size="mini" style="margin-right: 10px">
        <el-select
          v-model="queryData.test_type"
          style="width: 100%"
          placeholder="测试类型"
          size="mini"
          filterable
          clearable
          default-first-option
        >
          <el-option
            v-for="item in runTestTypeList"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="'问题类型'" prop="hit_type" size="mini" style="margin-right: 10px">
        <el-select
          v-model="queryData.hit_type"
          filterable
          clearable
          allow-create
          default-first-option
          placeholder="问题类型，可手动输入"
          size="mini"
          style="width:100%"
        >
          <el-option
            v-for="item in hitTypeList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="'报告id'" prop="report_id" size="mini" style="margin-right: 10px">
        <el-input v-model="queryData.report_id" size="mini" />
      </el-form-item>

      <el-button
        type="primary"
        size="mini"
        style="margin-left: 10px"
        @click.native="getHitList()"
      >查询
      </el-button>

      <el-button
        type="primary"
        size="mini"
        style="margin-left: 10px"
        @click.native="showHitDrawer('add')"
      >新增问题记录
      </el-button>
    </el-form>

    <el-table
      ref="hitTable"
      v-loading="tableIsLoading"
      size="mini"
      :data="hitListData"
      row-key="id"
      stripe
    >
      <el-table-column label="序号" align="center" min-width="6%">
        <template slot-scope="scope">
          <span> {{ (queryData.pageNum - 1) * queryData.pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" prop="date" label="触发日期" min-width="10%">
        <template slot-scope="scope">
          <span>{{ scope.row.date }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" prop="project_id" label="所属服务" min-width="10%">
        <template slot-scope="scope">
          <span>{{ projectDictData[scope.row.project_id] }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" prop="test_type" label="测试类型" min-width="10%">
        <template slot-scope="scope">
          <span>{{ runTestTypeDict[scope.row.test_type] }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" prop="test_type" label="运行环境" min-width="10%">
        <template slot-scope="scope">
          <span>{{ envDict[scope.row.env] }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" prop="hit_type" label="问题类型" min-width="10%">
        <template slot-scope="scope">
          <span>{{ scope.row.hit_type }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" prop="hit_type" label="问题详情" min-width="15%">
        <template slot-scope="scope">
          <span>{{ scope.row.hit_detail }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" prop="hit_type" label="报告id" min-width="10%">
        <template slot-scope="scope">
          <span>{{ scope.row.report_id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="16%">
        <template slot-scope="scope">

          <!--查看报告-->
          <el-button
            type="text"
            size="mini"
            @click="showReport(scope.row)"
          >查看报告
          </el-button>

          <!--修改问题记录-->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 8px"
            @click="showHitDrawer('update', scope.row)"
          >修改
          </el-button>

          <!-- 删除问题记录 -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.deletePopoverIsShow"
            placement="top"
            popper-class="down-popover"
          >
            <p>确定删除此数据?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="delHit(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              style="color: red"
              type="text"
              size="mini"
              :loading="scope.row.deleteLoadingIsShow"
            >删除
            </el-button>
          </el-popover>

        </template>
      </el-table-column>

    </el-table>

    <pagination
      v-show="hitListTotal>0"
      :total="hitListTotal"
      :page.sync="queryData.pageNum"
      :limit.sync="queryData.pageSize"
      @pagination="getHitList"
    />

    <hitDrawer
      :run-test-type-list="runTestTypeList"
      :current-hit-type-list="hitTypeList"
      :run-env-list="envList"
      :project-list="projectListData"
    />

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import hitDrawer from '@/views/assist/hits/drawer'

import { deleteHit, getHitTypeList, hitList } from '@/apis/assist/hit'
import { getConfigByName } from '@/apis/config/config'
import { runEnvList } from '@/apis/config/runEnv'
import { projectList } from '@/apis/apiTest/project'

export default {
  name: 'FuncFile',
  components: {
    Pagination,
    hitDrawer
  },
  data() {
    return {
      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
      hitTypeList: [],
      hitListData: [],
      hitListTotal: 0,
      runTestTypeDict: {},
      runTestTypeList: [],
      tableIsLoading: false,
      envList: [],
      envDict: {},
      projectListData: [],
      projectDictData: {},
      queryData: {
        test_type: undefined,
        hit_type: undefined,
        report_id: undefined,
        pageSize: 20,
        pageNum: 1
      }
    }
  },

  mounted() {
    // 获取服务列表
    if (!this.projectListData || this.projectListData.length < 1) {
      projectList().then(response => {
        this.projectListData = response.data.data
        this.projectListData.forEach(project => {
          this.projectDictData[project.id] = project.name
        })
      })
    }

    // 获取环境列表
    runEnvList({}).then(response => {
      this.envList = response.data.data
      this.envList.forEach(evn => {
        this.envDict[evn.code] = evn.name
      })
    })

    this.initHitTypeList()

    this.getRunType()

    this.getHitList()

    // 修改成功，重新请求列表
    this.$bus.$on(this.$busEvents.drawerIsCommit, (status) => {
      this.getHitList()
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  methods: {

    getRunType() {
      getConfigByName({ name: 'test_type' }).then(response => {
        this.runTestTypeList = JSON.parse(response.data)
        this.runTestTypeList.forEach(rType => {
          this.runTestTypeDict[rType['key']] = rType['label']
        })
      })
    },

    initHitTypeList() {
      getHitTypeList().then(response => {
        this.hitTypeList = response.data
      })
    },

    getHitList() {
      this.tableIsLoading = true
      hitList(this.queryData).then(response => {
        this.tableIsLoading = false
        this.hitListData = response.data.data
        this.hitListTotal = response.data.total
      })
    },

    // 新增问题记录
    showHitDrawer(status, row) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'hit', status, row)
    },

    // 查看报告
    showReport(row) {
      let baseDir = ''
      if (row.test_type === 'api') {
        baseDir = 'apiTest'
      } else if (row.test_type === 'web_ui') {
        baseDir = 'webUiTest'
      } else {
        baseDir = 'appUiTest'
      }
      window.open(`#/${baseDir}/reportShow?id=${row.report_id}`, '_blank')
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    delHit(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteLoadingIsShow', true)
      deleteHit({ 'id': row.id }).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getHitList()
        }
      })
    }

  }

}
</script>

<style scoped>

</style>
