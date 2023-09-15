<template>
  <div class="app-container">

    <div class="filter-container">

      <!-- inline="true"，el-form-item不自动换行 -->
      <el-form label-width="55px" :inline="true">

        <el-form-item :label="'业务线'" size="mini">
          <el-select
            v-model="selectBusiness"
            filterable
            multiple
            style="width: 150px"
            placeholder="业务线"
            size="mini"
            @change="getBugList"
          >
            <el-option
              v-for="business in $busEvents.data.businessList"
              :key="business.id"
              :label="business.name"
              :value="business.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="'描述'" size="mini">
          <el-input
            v-model="inputName"
            placeholder="缺陷描述关键字"
            size="mini"
            clearable
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item :label="'详情'" size="mini">
          <el-input
            v-model="inputDetail"
            placeholder="缺陷详情关键字"
            size="mini"
            clearable
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item :label="'状态'" size="mini">
          <el-select
            v-model="inputStatus"
            filterable
            multiple
            style="width: 150px"
            placeholder="选择状态"
            size="mini"
          >
            <el-option
              v-for="(value, key) in bugStatusMapping"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="'迭代'" size="mini">
          <el-select
            v-model="inputIteration"
            filterable
            multiple
            style="width: 150px"
            placeholder="选择迭代"
            size="mini"
          >
            <el-option
              v-for="iteration in iterationListData"
              :key="iteration"
              :label="iteration"
              :value="iteration"
            />
          </el-select>
        </el-form-item>

        <el-button type="primary" size="mini" @click.native="doQuery('')">查询</el-button>
        <el-button type="primary" size="mini" @click.native="initQuery('')">重置</el-button>
        <el-button type="primary" size="mini" @click.native="showDrawer('')">添加</el-button>
      </el-form>

    </div>

    <el-table
      ref="apiTree"
      v-loading="tableIsLoading"
      size="mini"
      :data="bugDataList"
      stripe
    >
      <el-table-column prop="id" label="编号" align="center" min-width="5%">
        <template slot-scope="scope">
          <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="status" label="状态" min-width="10%">
        <template slot-scope="scope">
          <el-select
            :ref="`statusSelector${scope.row.id}`"
            v-model="scope.row.status"
            filterable
            placeholder="选择状态"
            size="mini"
            @change="changeStatus(scope.row)"
          >
            <el-option
              v-for="(value, key) in bugStatusMapping"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="replay" label="是否复盘" min-width="10%">
        <template slot-scope="scope">
          <el-select
            :ref="`replaySelector${scope.row.id}`"
            v-model="scope.row.replay"
            filterable
            placeholder="选择状态"
            size="mini"
            @change="changeReplays(scope.row)"
          >
            <el-option
              v-for="(value, key) in isReplayMapping"
              :key="parseInt(key)"
              :label="value"
              :value="parseInt(key)"
            />
          </el-select>

        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" label="业务线" min-width="8%">
        <template slot-scope="scope">
          <span> {{ $busEvents.data.businessDict[scope.row.business_id] }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" prop="name" label="缺陷描述" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" prop="detail" label="缺陷详情" min-width="28%">
        <template slot-scope="scope">
          <span> {{ scope.row.detail }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" prop="iteration" label="迭代" min-width="8%">
        <template slot-scope="scope">
          <span> {{ scope.row.iteration }} </span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="10%">
        <template slot-scope="scope">

          <!--修改bug信息-->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            @click="showDrawer(scope.row)"
          >修改
          </el-button>

          <!-- 删除bug -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.deletePopoverIsShow"
            placement="top"
            popper-class="down-popover"
          >
            <p>确定删除【{{ scope.row.name }}】?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="delBug(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              style="color: red"
              type="text"
              size="mini"
              :loading="scope.row.deleteButtonIsLoading"
            >删除
            </el-button>
          </el-popover>

        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/修改bug -->
    <el-drawer
      :title="bugTemplate.id ? '修改缺陷' : '新增缺陷'"
      size="70%"
      :visible.sync="editDrawerIsShow"
      :direction="direction"
    >

      <el-form
        ref="dataForm"
        :model="bugTemplate"
        label-position="right"
        label-width="90px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px"
      >

        <el-form-item class="filter-item is-required" :label="'业务线'" size="mini">
          <el-select
            v-model="bugTemplate.business_id"
            filterable
            allow-create
            default-first-option
            placeholder="业务线"
            size="mini"
            style="width:100%"
          >
            <el-option
              v-for="business in $busEvents.data.businessList"
              :key="business.id"
              :label="business.name"
              :value="business.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="filter-item is-required" :label="'迭代'" size="mini">
          <el-select
            v-model="bugTemplate.iteration"
            filterable
            allow-create
            default-first-option
            placeholder="迭代"
            size="mini"
            style="width:100%"
          >
            <el-option
              v-for="iteration in iterationListData"
              :key="iteration"
              :label="iteration"
              :value="iteration"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="'缺陷描述'" class="filter-item is-required" size="mini">
          <el-input v-model="bugTemplate.name" placeholder="缺陷描述" />
        </el-form-item>

        <el-form-item :label="'缺陷详情'" class="filter-item is-required" size="mini">
          <el-input v-model="bugTemplate.detail" type="textarea" :rows="2" placeholder="缺陷详情" />
        </el-form-item>

        <el-form-item :label="'缺陷来源'" class="filter-item" size="mini">
          <el-input v-model="bugTemplate.bug_from" placeholder="缺陷来源" />
        </el-form-item>

        <el-form-item :label="'发现时间'" class="filter-item" size="mini">
          <el-date-picker
            v-model="bugTemplate.trigger_time"
            type="datetime"
            placeholder="选择日期时间"
            align="right"
            style="width: 100%"
            :picker-options="pickerOptions"
          />
        </el-form-item>

        <el-form-item :label="'原因'" class="filter-item" size="mini">
          <el-input v-model="bugTemplate.reason" type="textarea" :rows="2" placeholder="原因" />
        </el-form-item>

        <el-form-item :label="'解决方案'" class="filter-item" size="mini">
          <el-input v-model="bugTemplate.solution" type="textarea" :rows="2" placeholder="解决方案" />
        </el-form-item>

        <el-form-item :label="'跟进人'" class="filter-item" size="mini">
          <el-select
            v-model="bugTemplate.manager"
            filterable
            placeholder="跟进负责人"
            size="mini"
            style="width:100%"
          >
            <el-option
              v-for="user in currentUserList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="filter-item is-required" :label="'是否复盘'" size="mini">
          <el-select
            v-model="bugTemplate.replay"
            filterable
            placeholder="是否复盘"
            size="mini"
            style="width:100%"
          >
            <el-option
              v-for="(value, key) in isReplayMapping"
              :key="parseInt(key)"
              :label="value"
              :value="parseInt(key)"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="'复盘结论'" class="filter-item" size="mini">
          <el-input v-model="bugTemplate.conclusion" type="textarea" :rows="2" placeholder="复盘结论" />
        </el-form-item>

      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="editDrawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click="bugTemplate.id ? changeEnv() : addBug()"
        >
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageNum"
      :limit.sync="pageSize"
      @pagination="getBugList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { businessList } from '@/apis/config/business'
import {
  bugList,
  putBug,
  postBug,
  deleteBug,
  iterationList,
  changeBugStatus,
  changeBugReplays
} from '@/apis/testWork/bugTrack'
import { userList } from '@/apis/system/user'

export default {
  name: 'BugTrack',
  components: {
    Pagination
  },
  data() {
    return {
      statusColorDict: {
        'todo': '#F56C6C',
        'doing': '#409EFF',
        'done': '#58D68D'
      },
      replayColorDict: {
        0: '#F56C6C',
        1: '#58D68D'
      },
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      },

      direction: 'rtl', // 抽屉打开方式
      tableIsLoading: false,
      bugDataList: [],
      bugStatusMapping: {
        'todo': '待解决',
        'doing': '解决中',
        'done': '已解决'
      },
      isReplayMapping: {
        0: '未复盘',
        1: '已复盘'
      },
      iterationListData: [],
      currentUserList: [],
      addBusinessId: '',
      submitButtonIsLoading: false,
      deleteButtonIsLoading: false,
      editDrawerIsShow: false, // 抽屉是否展示
      selectBusiness: [], // 选中的业务线
      inputDetail: '', // 查询条件
      inputStatus: '', // 查询条件
      inputIteration: '', // 查询条件
      inputName: '', // 查询条件
      businessList: [], // 业务线列表
      bugTemplate: {
        id: '',
        business_id: '',
        name: '',
        detail: '',
        iteration: '',
        conclusion: '',
        status: '',
        replay: 0,
        bug_from: '',
        trigger_time: '',
        manager: null,
        reason: '',
        solution: ''
      },
      total: 0,
      pageNum: 1,
      pageSize: 20
    }
  },

  watch: {
    // 重新获取用例列表后，修改对应的重要等级背景色颜色
    'bugDataList': {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        this.$nextTick(function() {
          newVal.forEach(bug => {
            this.changeSelectBackgroundColorColor(bug)
          })
        })
      }
    }
  },

  mounted() {
    // 获取业务线
    if (this.$busEvents.data.businessList.length < 1) {
      businessList().then(response => {
        this.$busEvents.data.businessList = response.data.data
        this.$busEvents.data.businessDict = {}
        this.$busEvents.data.businessList.forEach(business => {
          this.$busEvents.data.businessDict[business.id] = business.name
        })
      })
    }
    this.getBugList()
    this.getUserList(this.getIterationList)
  },

  methods: {

    // 修改选择框颜色
    changeSelectBackgroundColorColor(row) {
      this.$refs[`statusSelector${row.id}`].$el.children[0].children[0].style.backgroundColor = this.statusColorDict[row.status]
      this.$refs[`replaySelector${row.id}`].$el.children[0].children[0].style.backgroundColor = this.replayColorDict[row.replay]
    },

    async getUserList(func) {
      const response = await userList()
      this.currentUserList = response.data.data
      // response.data.data.forEach(user => {
      //   this.userDict[user.id] = user
      // })
      if (func) {
        func()
      }
    },

    initNewBug() {
      this.bugTemplate = {
        id: '',
        business_id: this.$busEvents.data.businessList[0].id,
        iteration: this.iterationListData.at(-1),
        name: '',
        detail: '',
        conclusion: '',
        status: '',
        replay: 0,
        bug_from: '',
        trigger_time: new Date(),
        manager: null,
        reason: '',
        solution: ''
      }
    },

    // 获取迭代
    getIterationList() {
      iterationList().then(response => {
        this.iterationListData = response.data
      })
    },

    // 获取bug列表
    getBugList() {
      bugList({
        'pageNum': this.pageNum,
        'pageSize': this.pageSize,
        'detail': this.inputDetail,
        'name': this.inputName,
        'status': this.inputStatus,
        'iteration': this.inputIteration,
        'business_list': this.selectBusiness
      }).then(response => {
        this.bugDataList = response.data.data
        this.total = response.data.total
      })
    },

    changeStatus(row) {
      this.tableIsLoading = true
      changeBugStatus({ id: row.id, status: row.status }).then(response => {
        this.tableIsLoading = false
        this.showMessage(this, response)
      })
    },

    changeReplays(row) {
      this.tableIsLoading = true
      changeBugReplays({ id: row.id, replay: row.replay }).then(response => {
        this.tableIsLoading = false
        this.showMessage(this, response)
      })
    },

    // 执行查询
    doQuery() {
      this.pageNum = 1
      this.pageSize = 20
      this.getBugList()
    },

    // 重置
    initQuery() {
      this.pageNum = 1
      this.pageSize = 20
      this.selectBusiness = []
      this.inputDetail = ''
      this.inputName = ''
      this.inputStatus = ''
      this.inputIteration = ''
      this.getBugList()
    },

    // 打开抽屉
    showDrawer(row) {
      this.getIterationList()
      if (row) { // 修改
        this.bugTemplate = JSON.parse(JSON.stringify(row))
        this.editDrawerIsShow = true
      } else { // 增加
        this.initNewBug()
        this.editDrawerIsShow = true
      }
    },

    // 添加bug
    addBug() {
      this.submitButtonIsLoading = true
      postBug(this.bugTemplate).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.editDrawerIsShow = false
          this.getIterationList()
          this.getBugList()
        }
      })
    },

    // 修改bug
    changeEnv() {
      this.submitButtonIsLoading = true
      putBug(this.bugTemplate).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.editDrawerIsShow = false
          this.getBugList()
        }
      })
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    // 删除bug
    delBug(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteButtonIsLoading', true)
      deleteBug({ 'id': row.id }).then(response => {
        this.$set(row, 'deleteButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.getBugList()
        }
      })
    }
  }
}
</script>

<style>

</style>
