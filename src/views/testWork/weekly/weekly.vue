<template>

  <div>

    <!-- 周报管理 -->
    <el-tabs v-model="tabName" class="table_padding table_api">

      <!-- 周报管理 -->
      <el-tab-pane :label="tabName" :name="tabName">

        <!-- 查询条件 -->

        <!-- 搜索、添加栏 -->
        <div class="filter-container">

          <!-- inline="true"，el-form-item不自动换行 -->
          <el-form label-width="80px" :inline="true">
            <el-row>
              <el-form-item label="产品：" size="mini">
                <el-select
                  ref="productSelector"
                  v-model="listQuery.product_id"
                  placeholder="选择产品"
                  filterable
                  default-first-option
                  clearable
                  size="mini"
                  class="filter-item"
                  @change="querySelectedProduct">
                  <el-option v-for="product in productList" :key="product.id" :label="product.name"
                             :value="product.id"/>
                </el-select>
              </el-form-item>

              <el-form-item label="项目：" size="mini">
                <el-select
                  ref="projectSelector"
                  v-model="listQuery.project_id"
                  placeholder="选择项目"
                  filterable
                  default-first-option
                  clearable
                  size="mini"
                  class="filter-item">
                  <el-option v-for="project in queryProjectList" :key="project.id" :label="project.name"
                             :value="project.id"/>
                </el-select>
              </el-form-item>

              <el-form-item label="负责人：" size="mini">
                <el-select
                  v-model="listQuery.create_user"
                  placeholder="选择负责人"
                  filterable
                  default-first-option
                  clearable
                  size="mini"
                  class="filter-item">
                  <el-option v-for="user in currentUserList" :key="user.name" :label="user.name" :value="user.id"/>
                </el-select>
              </el-form-item>
            </el-row>

            <el-form-item :label="'时间段：'" size="mini">
              <div class="block">
                <el-date-picker
                  v-model="time_period"
                  type="datetimerange"
                  :picker-options="pickerOptions"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  align="right">
                </el-date-picker>
              </div>
            </el-form-item>

            <el-button
              type="primary"
              size="mini"
              @click="selectData">
              {{ '搜索' }}
            </el-button>

            <el-button
              type="primary"
              size="mini"
              @click="initListQuery">
              {{ '重置' }}
            </el-button>

            <el-button
              v-show="weeklyList.length > 0"
              type="primary"
              size="mini"
              :loading="downloadLoadingIsShow"
              @click="downloadCurrentWeekWeeklyList">
              {{ '导出最近一周' }}
            </el-button>

            <!--            <el-button-->
            <!--              disabled-->
            <!--              v-show="weeklyList.length > 0"-->
            <!--              type="primary"-->
            <!--              size="mini"-->
            <!--              :loading="downloadLoadingIsShow"-->
            <!--              @click="downloadWeeklyList">-->
            <!--              {{ '导出所选时间段' }}-->
            <!--            </el-button>-->

            <el-button
              type="primary"
              size="mini"
              @click="clickAddWeekly">
              {{ '添加周报' }}
            </el-button>

          </el-form>
        </div>

        <el-table
          ref="apiListTable"
          v-loading="tableLoadingIsShow"
          :data="weeklyList"
          row-key="id"
          stripe
        >
          <el-table-column prop="num" label="序号" min-width="10%">
            <template slot-scope="scope">
              <span> {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }} </span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="product_id" label="所属产品" min-width="15%">
            <template slot-scope="scope">
              <span> {{ parseProduct(scope.row.product_id) }} </span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="version" label="版本号" min-width="15%">
            <template slot-scope="scope">
              <span> {{ scope.row.version }} </span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="create_user" label="开始时间" min-width="15%">
            <template slot-scope="scope">
              <span>{{ thisFormatTime(scope.row.start_time) }}</span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="create_user" label="结束时间" min-width="15%">
            <template slot-scope="scope">
              <span>{{ thisFormatTime(scope.row.end_time) }}</span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="create_user" label="创建者" min-width="15%">
            <template slot-scope="scope">
              <span>{{ parseUser(scope.row.create_user) }}</span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="desc" label="备注" min-width="15%">
            <template slot-scope="scope">
              <span>{{ scope.row.desc }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" min-width="15%">
            <template slot-scope="scope">

              <!--修改-->
              <el-button
                type="text"
                style="margin-right: 8px"
                icon="el-icon-edit"
                @click="showEditForm(scope.row)">
              </el-button>

              <!-- 复制 -->
              <el-popover
                :ref="scope.row.id"
                placement="top"
                style="margin-right: 10px"
                popper-class="down-popover"
                v-model="scope.row.copyPopoverIsShow">
                <p>复制此周报并生成新的周报?</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="cancelCopyPopover(scope.row)">取消</el-button>
                  <el-button type="primary" size="mini" @click="copyWeekly(scope.row)">确定</el-button>
                </div>
                <el-button
                  slot="reference"
                  type="text"
                  icon="el-icon-document-copy"
                ></el-button>
              </el-popover>

              <!-- 删除 -->
              <el-popover
                :ref="scope.row.id"
                placement="top"
                popper-class="down-popover"
                v-model="scope.row.deletePopoverIsShow">
                <p>确定删除此数据?</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
                  <el-button type="primary" size="mini" @click="thisDeleteWeekly(scope.row)">确定</el-button>
                </div>
                <el-button
                  v-show="currentUserRole === '2' || parseInt(currentUserId) === parseInt(scope.row.create_user)"
                  slot="reference"
                  style="color: red"
                  type="text"
                  icon="el-icon-delete"
                  :disabled="scope.row.status === 1"
                  :loading="scope.row.isShowDeleteLoading"
                ></el-button>
              </el-popover>

            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

    </el-tabs>

    <pagination
      v-show="weeklyTotal>0"
      :total="weeklyTotal"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getWeeklyList"
    />

    <!-- 新增/修改周报表单 -->
    <el-drawer
      :title="weeklyDrawerStatus === 'add' ? '新增周报' : weeklyDrawerStatus === 'copy' ? '复制周报' : '修改周报'"
      size="60%"
      :wrapperClosable="false"
      :visible.sync="weeklyDrawerIsShow"
      :direction="direction">
      <el-form
        ref="dataForm"
        :model="tempWeekly"
        label-position="right"
        label-width="90px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px">
        <el-form-item label="所属产品" prop="product_id" class="is-required" size="mini">
          <el-select
            style="width: 100%"
            v-model="tempWeekly.product_id"
            size="mini"
            placeholder="选择产品"
            filterable
            default-first-option
            @change="selectedProduct">
            <el-option v-for="item in productList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="所属项目" prop="project_id" size="mini">
          <el-select
            style="width: 100%"
            v-model="tempWeekly.project_id"
            size="mini"
            placeholder="选择项目"
            filterable
            clearable>
            <el-option v-for="item in projectList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="版本号" prop="version" class="is-required" size="mini">
          <el-input v-model="tempWeekly.version" size="mini" placeholder="任务所属系统版本号"></el-input>
        </el-form-item>

        <el-form-item label="任务明细" prop="task_item" class="is-required" size="mini">
          <taskItemView
            :currentData="tempWeekly.task_item"
            :placeholderKey="'任务项'"
            :placeholderValue="'任务进度'"
            :placeholderDesc="'备注'"
          ></taskItemView>
        </el-form-item>

        <el-form-item label="时间段" prop="task_item" class="is-required" size="mini">
          <el-radio v-model="weekPosition" :label="-99" disabled>更早</el-radio>
          <el-radio v-model="weekPosition" :label="-7">上周</el-radio>
          <el-radio v-model="weekPosition" :label="0">本周</el-radio>
          <el-radio v-model="weekPosition" :label="7">下周</el-radio>
          <el-radio v-model="weekPosition" :label="99" disabled>更晚</el-radio>
        </el-form-item>

        <el-form-item label="备注" prop="desc" size="mini">
          <el-input v-model="tempWeekly.desc" size="mini" type="textarea" :rows="5"></el-input>
        </el-form-item>

      </el-form>

      <!-- 判断是否展示抽屉的操作按钮，新增、用户为数据创建者、用户为系统管理员，才可操作 -->
      <div
        class="demo-drawer__footer"
        v-show="
          weeklyDrawerStatus === 'add' ||
          currentUserRole === '2' ||
          parseInt(currentUserId) === parseInt(tempWeekly.create_user) &&
          parseInt(weekPosition) > -99 && parseInt(weekPosition) < 99">
        <el-button
          slot="reference"
          size="mini"
          type="primary"
          style="float: left"
          :loading="isShowLoading"
          @click="saveAndInit()"
        >再来一条
        </el-button>

        <el-button size="mini" @click="weeklyDrawerIsShow = false"> {{ '取消' }}</el-button>

        <el-button
          size="mini"
          type="primary"
          :loading="isShowLoading"
          @click=" tempWeekly.id ? changWeekly() : addWeekly() ">
          {{ '保存' }}
        </el-button>
      </div>
      <!--      </div>-->
    </el-drawer>

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import taskItemView from '@/components/Inputs/changeRow'

import {
  postWeekly,
  getWeekly,
  putWeekly,
  deleteWeekly,
  weeklyListData,
  weeklyConfigList, downloadWeeklyData
} from "@/apis/testWork/weekly";

import {userList} from '@/apis/system/user'
import {formatTime, getCurrentWeekStartTimeAndEndTime} from "@/utils/timeUtil";
import {tryParseInt} from "@/utils/parseData";

export default {
  name: 'index',
  components: {Pagination, taskItemView},

  // 接收父组件传参的key
  props: [
    'currentProductId',
    'currentProjectId'
  ],

  data() {
    return {

      currentUserId: localStorage.getItem('id'),  // 用户id
      currentUserRole: localStorage.getItem('roles'),  // 用户权限id

      tableLoadingIsShow: false,  // 请求列表等待响应的状态
      downloadLoadingIsShow: false,  // 导出按钮的loading
      tabName: '周报列表',  //  tab页的显示

      // 接口新增/编辑临时数据
      tempWeekly: {
        id: '',
        product_id: '',
        project_id: '',
        version: '',
        task_item: [{key: "", value: "", remark: ""}],
        desc: '',
        start_time: '',
        end_time: ''
      },

      // 数据列表
      weeklyTotal: 0,
      weeklyList: [],

      // 拖拽排序参数
      currentUserList: [],
      userDict: {},

      weeklyDrawerIsShow: false,  // 抽屉展示状态
      weeklyDrawerStatus: '',  // 抽屉类型
      direction: 'rtl',  // 抽屉打开方式
      productList: [], // 产品列表
      productDict: {},  // 产品字典
      projectList: [], // 项目列表
      isShowLoading: false,
      isDrawerSelectProduct: false,  // 是否在抽屉里面改变的产品id，是才重置项目id
      weekPosition: 0,  // 周定位，上周、本周、下周

      lastWeekStart: '',  // 上周开始的时间
      lastWeekend: '',  // 上周结束的时间

      currentWeekStart: '',  // 本周开始的时间
      currentWeekend: '',  // 本周结束的时间

      nextWeekStart: '',  // 下周开始的时间
      nextWeekend: '',  // 下周结束的时间

      listQuery: {
        product_id: '',
        project_id: '',
        create_user: '',
        start_time: '',  // 查询开始时间
        end_time: '',  // 查询结束时间
        download_type: '',
        pageNum: 1,
        pageSize: 20
      },
      queryProjectList: [],
      // 时间选择器
      time_period: [],  // 查询开始、结束时间段
      pickerOptions: {
        shortcuts: [
          {
            text: '上上周',
            onClick(picker) {
              picker.$emit(
                'pick',
                [
                  formatTime(getCurrentWeekStartTimeAndEndTime(-14).startTime),
                  formatTime(getCurrentWeekStartTimeAndEndTime(-14).endTime)
                ]
              );
            }
          },
          {
            text: '上周',
            onClick(picker) {
              picker.$emit(
                'pick',
                [
                  formatTime(getCurrentWeekStartTimeAndEndTime(-7).startTime),
                  formatTime(getCurrentWeekStartTimeAndEndTime(-7).endTime)
                ]
              );
            }
          },
          {
            text: '本周',
            onClick(picker) {
              picker.$emit(
                'pick',
                [
                  formatTime(getCurrentWeekStartTimeAndEndTime(0).startTime),
                  formatTime(getCurrentWeekStartTimeAndEndTime(0).endTime)
                ]
              );
            }
          }, {
            text: '下周',
            onClick(picker) {
              picker.$emit(
                'pick',
                [
                  formatTime(getCurrentWeekStartTimeAndEndTime(7).startTime),
                  formatTime(getCurrentWeekStartTimeAndEndTime(7).endTime)
                ]
              );
            }
          }]
      }
    }
  },

  created() {
    this.initTempWeekly()
    this.getUserList(this.getProductList)

    // 初始化上周、本周、下周的开始、结束时间节点
    let lastWeek = getCurrentWeekStartTimeAndEndTime(-7)
    this.lastWeekStart = formatTime(lastWeek.startTime)
    this.lastWeekend = formatTime(lastWeek.endTime)

    let currentWeek = getCurrentWeekStartTimeAndEndTime(0)
    this.currentWeekStart = formatTime(currentWeek.startTime)
    this.currentWeekend = formatTime(currentWeek.endTime)

    let nextWeek = getCurrentWeekStartTimeAndEndTime(7)
    this.nextWeekStart = formatTime(nextWeek.startTime)
    this.nextWeekend = formatTime(nextWeek.endTime)
  },

  mounted() {
    this.getWeeklyList()

    this.$bus.$on(this.$busEvents.testWork.clickProductTree, (dataDict) => {
      this.getWeeklyList({
        'product_id': dataDict.product_id,
        'project_id': dataDict.project_id,
        'pageNum': this.listQuery.pageNum,
        'pageSize': this.listQuery.pageSize
      })
    })

    // this.$bus.$on(this.$busEvents.testWork.weeklyDrawerStatus, (_type) => {
    //   this.openDrawer(_type)
    // })

  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.testWork.clickProductTree)
    // this.$bus.$off(this.$busEvents.testWork.weeklyDrawerStatus)
  },

  methods: {

    // 初始化查询数据
    initListQuery() {
      this.listQuery.project_id = ''
      this.listQuery.product_id = ''
      this.listQuery.create_user = ''
      this.listQuery.start_time = ''
      this.listQuery.end_time = ''
      this.time_period = []
      this.getWeeklyList()
    },

    // 查询数据
    selectData() {
      this.listQuery.start_time = this.time_period[0] || ''
      this.listQuery.end_time = this.time_period[1] || ''
      this.getWeeklyList()
    },

    // 格式化时间
    thisFormatTime(date) {
      return formatTime(date)
    },

    // 初始化数据，不初始化产品和项目
    initTempWeekly() {
      this.tempWeekly.id = ''
      this.tempWeekly.version = ''
      this.tempWeekly.task_item = [{key: "", value: "", remark: ""}]
      this.tempWeekly.desc = ''
      this.tempWeekly.start_time = ''
      this.tempWeekly.end_time = ''
    },

    // 获取用户信息，同步请求
    async getUserList(func) {
      let response = await userList()
      this.currentUserList = response.data.data
      response.data.data.forEach(user => {
        this.userDict[user.id] = user
      })
      if (func) {
        func('true')
      }
    },

    // 解析用户
    parseUser(userId) {
      return this.userDict[userId].name
    },

    // 解析产品
    parseProduct(productId) {
      return this.productDict[productId]
    },

    // 获取产品列表
    getProductList(isGetWeekly) {
      weeklyConfigList({parent: ''}).then(response => {
        response.data.data.forEach(product => {
          this.productDict[product.id.toString()] = product.name
        })

        this.productList = response.data.data
      })

      if (isGetWeekly) {
        this.getWeeklyList()
      }
    },

    // 选中产品，获取项目列表
    querySelectedProduct() {
      weeklyConfigList({parent: this.listQuery.product_id}).then(response => {
        this.queryProjectList = response.data.data
      })
    },

    // 选中产品，获取项目列表
    selectedProduct() {
      weeklyConfigList({parent: this.tempWeekly.product_id}).then(response => {
        this.projectList = response.data.data
      })
    },

    // 点击添加
    clickAddWeekly() {
      this.initTempWeekly()
      this.openDrawer('add')
    },

    // 打开抽屉
    openDrawer(_type) {
      this.weeklyDrawerStatus = _type
      this.getProductList()
      this.weeklyDrawerIsShow = true
    },

    // 打开编辑框
    showEditForm(row) {
      this.isDrawerSelectProduct = false
      this.tempWeekly = JSON.parse(JSON.stringify(row))

      // 处理产品id、项目id
      this.tempWeekly.product_id = tryParseInt(this.tempWeekly.product_id)
      this.tempWeekly.project_id = tryParseInt(this.tempWeekly.project_id)

      // 处理时间段，判断是上周、本周、下周
      let tempWeekly_start_time = this.thisFormatTime(this.tempWeekly.start_time)
      if (tempWeekly_start_time > this.nextWeekStart) {  // 数据开始时间大于下周的开始时间，则说明是以后的周计划
        this.weekPosition = 99
      } else if (tempWeekly_start_time == this.nextWeekStart) {  // 数据开始时间等于下周的开始时间，则说明是下周的周计划
        this.weekPosition = 7
      } else if (tempWeekly_start_time == this.currentWeekStart) {  // 数据开始时间等于当前时间所在周的开始时间，则说明是本周的周计划
        this.weekPosition = 0
      } else if (tempWeekly_start_time == this.lastWeekStart) {  // 数据开始时间等于上周的开始时间，则说明是上周的周计划
        this.weekPosition = -7
      } else {  // 超出时间范围，则说明是以前的周计划
        this.weekPosition = -99
      }

      // 获取项目列表
      this.selectedProduct()

      this.openDrawer('edit')
    },

    // 解析时间段
    parseTimeForCommit() {
      let date = this.getWeekForCommit()
      this.tempWeekly.start_time = date.start
      this.tempWeekly.end_time = date.end
    },

    // 保存并重新初始化
    saveAndInit() {
      this.isShowLoading = true
      if (this.tempWeekly.id) {
        this.parseTimeForCommit()
        putWeekly(this.tempWeekly).then(response => {
          this.isShowLoading = false
          if (this.showMessage(this, response)) {
            this.initTempWeekly()  // 初始化数据
            this.weeklyDrawerStatus = 'add'
            this.getWeeklyList()
          }
        })
      } else {
        this.parseTimeForCommit()
        postWeekly(this.tempWeekly).then(response => {
          this.isShowLoading = false
          if (this.showMessage(this, response)) {
            this.initTempWeekly()  // 初始化数据
            this.weeklyDrawerStatus = 'add'
            this.getWeeklyList()
          }
        })
      }
    },

    // 删除周报
    thisDeleteWeekly(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'isShowDeleteLoading', true)
      deleteWeekly({'id': row.id}).then(response => {
        this.$set(row, 'isShowDeleteLoading', false)
        if (this.showMessage(this, response)) {
          this.getWeeklyList()
        }
      })
    },

    cancelDeletePopover(weekly){
      this.$set(weekly, 'deletePopoverIsShow', false)
    },

    cancelCopyPopover(weekly){
      this.$set(weekly, 'copyPopoverIsShow', false)
    },

    // 复制周报
    copyWeekly(weekly) {
      this.$set(weekly, 'copyPopoverIsShow', false)
      this.tempWeekly = JSON.parse(JSON.stringify(weekly))
      // 处理产品id、项目id
      this.tempWeekly.product_id = tryParseInt(this.tempWeekly.product_id)
      this.tempWeekly.project_id = tryParseInt(this.tempWeekly.project_id)
      this.tempWeekly.id = ''
      this.tempWeekly.create_user = this.currentUserId

      // 获取项目列表
      this.selectedProduct()

      this.openDrawer('copy')
    },

    // 解析用户选择的时间段
    getWeekForCommit() {
      let week = getCurrentWeekStartTimeAndEndTime(this.weekPosition)
      let start = week.startTime
      let end = week.endTime
      return {
        start: `${start.getFullYear()}-${start.getMonth() + 1 >= 10 ? (start.getMonth() + 1) : '0' + (start.getMonth() + 1)}-${start.getDate() < 10 ? '0' + start.getDate() : start.getDate()}`,
        end: `${end.getFullYear()}-${end.getMonth() + 1 >= 10 ? (end.getMonth() + 1) : '0' + (end.getMonth() + 1)}-${end.getDate() < 10 ? '0' + end.getDate() : end.getDate()}`
      }
    },


    // 添加周报
    addWeekly() {
      this.isShowLoading = true
      this.parseTimeForCommit()
      postWeekly(this.tempWeekly).then(response => {
        this.isShowLoading = false
        if (this.showMessage(this, response)) {
          this.weeklyDrawerIsShow = false
          this.initTempWeekly()  // 初始化数据
          this.getWeeklyList()
        }
      })
    },

    // 修改周报
    changWeekly() {
      this.isShowLoading = true
      this.parseTimeForCommit()
      putWeekly(this.tempWeekly).then(response => {
        this.isShowLoading = false
        if (this.showMessage(this, response)) {
          this.weeklyDrawerIsShow = false
          this.initTempWeekly()  // 初始化数据
          this.getWeeklyList()
        }
      })
    },

    // 获取周报列表
    getWeeklyList(params) {
      this.tableLoadingIsShow = true
      let data = params ? params : this.listQuery
      weeklyListData(data).then(response => {
        this.weeklyList = response.data.data
        this.weeklyTotal = response.data.total
      })
      this.tableLoadingIsShow = false
    },

    // 导出当周的周报
    downloadCurrentWeekWeeklyList() {
      this.listQuery.download_type = 'current'
      this.listQuery.start_time = this.lastWeekStart
      this.listQuery.end_time = this.currentWeekend
      this.downloadWeeklyList()
    },

    // 导出周报
    downloadWeeklyList(params) {
      this.downloadLoadingIsShow = true
      downloadWeeklyData(this.listQuery).then(response => {
        this.listQuery.download_type = ''
        this.listQuery.start_time = ''
        this.listQuery.end_time = ''
        this.downloadLoadingIsShow = false
        let blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'   //将会被放入到blob中的数组内容的MIME类型
        });
        // 保存文件到本地
        let a = document.createElement('a')
        a.href = URL.createObjectURL(blob);  //生成一个url
        a.download = `测试组周报（${this.lastWeekStart}_${this.lastWeekend}）`
        a.click()
      })
    },

  },

  watch: {

    // 监听父组件传过来的当前选中的产品，实时获取周报列表
    'currentProductId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.listQuery.project_id = ''
          this.selectedProduct()
        }
      }
    },

    // 监听父组件传过来的当前选中的项目，实时获取周报列表
    'currentProjectId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.listQuery.product_id = ''
          this.selectedProduct()
        }
      }
    },

    'tempWeekly.product_id': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (this.isDrawerSelectProduct) {
          this.tempWeekly.project_id = ''
        }
        this.isDrawerSelectProduct = true
      }
    }
  }

}
</script>

<style>

</style>
