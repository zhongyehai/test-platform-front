<template>
  <div>

    <el-form label-width="60px">
      <el-row>
        <el-form-item :label="'查询'" size="mini" style="margin-bottom: 5px">
          <el-input
            v-model="queryAddr"
            class="input-with-select"
            placeholder="请输入接口地址，如 /mock/{projectSystemId}"
            size="mini"
            style="width: 75%"
          />
          <el-button
            v-show="queryAddr"
            type="primary"
            size="mini"
            :loading="queryAddrIsLoading"
            style="margin-left: 5px"
            @click.native="getApiMsgBelongTo()"
          >查归属
          </el-button>
          <el-button
            v-show="queryAddr"
            type="primary"
            size="mini"
            :loading="queryAddrIsLoading"
            style="margin-left: 5px"
            @click.native="getApiMsgBelongToStep()"
          >查使用情况
          </el-button>
        </el-form-item>
      </el-row>

      <el-row>

        <!-- 服务选择 -->
        <el-col :span="11">
          <el-form-item label="服务" style="margin-bottom: 5px">
            <projectSelectorView
              ref="projectSelectorView"
              :bus-emit-event-name="$busEvents.selectorChoice"
            />
          </el-form-item>
        </el-col>

        <!-- 选择模块 -->
        <el-col :span="13">
          <el-form-item label="模块" style="margin-bottom: 5px">
            <el-cascader
              v-model="selectedOptions"
              placeholder="选择模块"
              filterable
              size="mini"
              style="min-width: 100%"
              :options="tempModuleList"
              :props="{ checkStrictly: true }"
              clearable
              @change="getCaseList"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 接口列表 -->
    <div>

      <el-table
        ref="apiTable"
        :data="apiList.data"
        stripe
      >
        <el-table-column prop="num" align="center" label="序号" min-width="8%">
          <template slot-scope="scope">
            <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column :show-overflow-tooltip="true" prop="name" label="接口信息" align="center" min-width="90%">
          <template slot-scope="scope">
            <div
              class="block"
              :class="`block_${scope.row.method.toLowerCase()}`"
              :style="{
                'backgroundColor': scope.row.deprecated === true ? '#ebebeb' : '',
                'textDecoration': scope.row.deprecated === true ? 'line-through' : ''
              }"
            >
              <span
                class="block-method block_method_color"
                :class="`block_method_${scope.row.method.toLowerCase()}`"
                :style="{
                  'backgroundColor': scope.row.deprecated === true ? '#ebebeb' : ''
                }"
              >
                {{ scope.row.method }}
              </span>
              <span class="block-method block_url">{{ scope.row.addr }}</span>
              <span class="block-summary-description">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" min-width="10%">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click.native="addApiToStep(scope.row)">转步骤</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="apiList.total>0"
        :total="apiList.total"
        :page.sync="pageNum"
        :limit.sync="pageSize"
        @pagination="getApiList"
      />

    </div>

    <showApiFromDrawer
      :case-id="currentCaseId"
      :marker="marker"
    />

    <showApiUseDrawer
      :marker="marker"
    />
  </div>

</template>

<script>
import projectSelectorView from '@/components/Selector/project'
import Pagination from '@/components/Pagination'
import showApiFromDrawer from '@/components/business/api/apiFromDrawer.vue'
import showApiUseDrawer from '@/components/business/api/apiUseDrawer.vue'

import { apiList, apiMsgBelongTo, apiMsgBelongToStep } from '@/apis/apiTest/api'
import { moduleList } from '@/apis/apiTest/module'

export default {
  name: 'ApiList',
  components: {
    Pagination,
    projectSelectorView,
    showApiFromDrawer,
    showApiUseDrawer
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'projectId', 'currentCaseId'
  ],
  data() {
    return {
      selectedOptions: [],

      tempModuleList: [],
      currentProjectId: '',
      moduleId: '',
      caseId: '',

      queryAddrIsLoading: false,

      apiList: {
        total: 0,
        data: []
      },
      pageNum: 0,
      pageSize: 10,
      queryAddr: '',
      marker: 'caseApiList'
    }
  },

  watch: {
    'currentCaseId': {
      handler(newVal, oldVal) {
        this.caseId = newVal
      }
    }

  },

  mounted() {
    // 监听选中服务
    this.$bus.$on(this.$busEvents.selectorChoice, (project) => {
      if (project) {
        this.currentProjectId = project
        this.getModulesByProjectId(project.id)
      }
    })
  },

  created() {
    this.caseId = this.currentCaseId
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.selectorChoice)
  },

  methods: {

    // 获取接口归属
    getApiMsgBelongTo() {
      this.queryAddrIsLoading = true
      apiMsgBelongTo({ addr: this.queryAddr }).then(response => {
        this.queryAddrIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'apiFromIsShow', this.marker, response.data)
        }
      })
    },

    // 获取接口使用情况
    getApiMsgBelongToStep() {
      this.queryAddrIsLoading = true
      apiMsgBelongToStep({ addr: this.queryAddr }).then(response => {
        this.queryAddrIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'apiUseIsShow', this.marker, response.data)
        }
      })
    },

    // 递归把列表转为树行结构
    arrayToTree(arr, parentId) {
      //  arr 是返回的数据  parendId 父id
      const temp = []
      const treeArr = arr
      treeArr.forEach((item, index) => {
        if (item.parent === parentId) {
          if (this.arrayToTree(treeArr, treeArr[index].id).length > 0) {
            // 递归调用此函数
            treeArr[index].children = this.arrayToTree(treeArr, treeArr[index].id)
          }
          treeArr[index].value = treeArr[index].id
          treeArr[index].label = treeArr[index].name
          temp.push(treeArr[index])
        }
      })
      return temp
    },

    // 获取服务id对应的模块列表
    getModulesByProjectId(project_id) {
      moduleList({ 'projectId': project_id }).then(response => {
        this.tempModuleList = this.arrayToTree(response.data.data, null)
      })
    },

    getCaseList(selectedModuleList) {
      if (selectedModuleList.length > 0) {
        this.moduleId = selectedModuleList.slice(-1)[0] // 取列表中的最后一个
        apiList({
          'moduleId': this.moduleId,
          'pageNum': this.pageNum,
          'pageSize': this.pageSize
        }).then(response => {
          this.apiList.data = response.data.data ? response.data.data : []
          this.apiList.total = response.data.total ? response.data.total : 0
        })
      }
    },

    // 根据模块id内容获取接口列表
    getApiListByModuleId() {
      apiList({
        'moduleId': this.moduleId,
        'pageNum': this.pageNum,
        'pageSize': this.pageSize
      }).then(response => {
        this.apiList.data = response.data.data ? response.data.data : []
        this.apiList.total = response.data.total ? response.data.total : 0
      })
    },

    // 切换页数
    getApiList(value) {
      this.getApiListByModuleId()
    },

    // 深拷贝接口，添加到步骤列表
    addApiToStep(api) {
      // 把当前选中的接口，传给步骤编辑tab
      // 初始化步骤的默认值
      var new_api = JSON.parse(JSON.stringify(api))
      new_api['api_id'] = new_api['id']
      new_api['id'] = ''
      new_api['status'] = 1
      new_api['run_times'] = 1
      new_api['replace_host'] = false
      new_api['skip_if'] = { 'expect': null, 'comparator': '', 'data_type': '', 'check_value': null }
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'stepInfo', 'add', new_api)
    }
  }
}
</script>

<style scoped>
.block_post {
  border: 1px solid #49cc90;
  background-color: rgba(73, 204, 144, .1)
}

.block_method_post {
  background-color: #49cc90;
}

.block_put {
  border: 1px solid #fca130;
  background-color: rgba(252, 161, 48, .1)
}

.block_method_put {
  background-color: #fca130;
}

.block_get {
  border: 1px solid #61affe;
  background-color: rgba(97, 175, 254, .1)
}

.block_method_get {
  background-color: #61affe;
}

.block_delete {
  border: 1px solid #f93e3e;
  background-color: rgba(249, 62, 62, .1)
}

.block_method_delete {
  background-color: #f93e3e;
}

.block_patch {
  border: 1px solid #50e3c2;
  background-color: rgba(80, 227, 194, .1)
}

.block_method_patch {
  background-color: #50e3c2;
}

.block_head {
  border: 1px solid #e6a23c;
  background-color: rgba(230, 162, 60, .1)
}

.block_method_head {
  background-color: #e6a23c;
}

.block_options {
  border: 1px solid #409eff;
  background-color: rgba(64, 158, 255, .1)
}

.block_method_options {
  background-color: #409eff;
}

.block {
  position: relative;
  border-radius: 4px;
  /*height: 48px;*/
  overflow: hidden;
  padding: 5px;
  display: flex;
  align-items: center;
}

.block_url {
  word-break: normal;
  width: auto;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  font-family: Open Sans, sans-serif;
  color: #3b4151;
}

.block_name {
  padding-left: 5px;
  word-break: normal;
  width: auto;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  font-family: Open Sans, sans-serif;
  color: #3b4151;
}

.block_method_color {
  cursor: pointer;
  color: #fff;
}

.block-method {
  font-size: 14px;
  font-weight: 600;
  min-width: 50px;
  padding: 0px 10px;
  text-align: center;
  border-radius: 5px;
  text-shadow: 0 1px 0 rgba(0, 0, 0, .1);
  font-family: Titillium Web, sans-serif;
}

.block-summary-description {
  word-break: normal;
  width: auto;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  font-family: Open Sans, sans-serif;
  color: #3b4151;
}
</style>
