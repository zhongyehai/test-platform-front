<template>
  <!-- 新增/修改命中问题表单 -->
  <el-drawer
    :title="tempHit.id ? '修改命中问题' : '新增命中问题'"
    size="60%"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >
    <el-form
      ref="hitForm"
      label-position="center"
      label-width="100px"
      style="min-width: 400px;margin-left: 20px;margin-right: 20px"
    >

      <el-form-item :label="'选择服务'" prop="project_id" class="is-required" size="mini">
        <el-select
          v-model="tempHit.project_id"
          :placeholder="`选择服务`"
          size="mini"
          style="width: 100%"
          filterable
          default-first-option
        >
          <el-option v-for="item in projectListData" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item :label="'运行环境'" prop="env" class="is-required" size="mini">
        <el-select
          v-model="tempHit.env"
          filterable
          default-first-option
          placeholder="运行环境"
          size="mini"
          style="width:100%"
        >
          <el-option
            v-for="item in runEnvList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="'报告id'" prop="report_id" class="is-required" size="mini">
        <el-input v-model="tempHit.report_id" size="mini" />
      </el-form-item>

      <el-form-item :label="'触发时间'" prop="date" class="is-required" size="mini">
        <el-date-picker
          v-model="tempHit.date"
          align="right"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
          :picker-options="pickerOptions"
        />
      </el-form-item>

      <el-form-item :label="'测试类型'" prop="test_type" class="is-required" size="mini">
        <el-select
          v-model="tempHit.test_type"
          style="width: 100%"
          placeholder="测试类型"
          size="mini"
          filterable
          default-first-option
        >
          <el-option
            v-for="item in runTestType"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="'问题类型'" prop="hit_type" class="is-required" size="mini">
        <el-select
          v-model="tempHit.hit_type"
          filterable
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

      <el-form-item :label="'问题内容'" prop="hit_detail" class="is-required" size="mini">
        <el-input v-model="tempHit.hit_detail" size="mini" type="textarea" :placeholder="'问题内容'" />
      </el-form-item>

      <el-form-item :label="'备注'" prop="desc" size="mini">
        <el-input v-model="tempHit.desc" size="mini" type="textarea" :placeholder="'备注'" />
      </el-form-item>

    </el-form>

    <div class="demo-drawer__footer">
      <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click="tempHit.id ? editHit(): creteHit()"
      >
        {{ '保存' }}
      </el-button>
    </div>

  </el-drawer>
</template>

<script>
import { getConfigByName } from '@/apis/config/config'
import { postHit, putHit, getHitTypeList } from '@/apis/assist/hit'
import { projectList as apiProjectList } from '@/apis/apiTest/project'
import { getReport as apiGetReport } from '@/apis/apiTest/report'

export default {
  name: 'Drawer',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'runTestTypeList',
    // eslint-disable-next-line vue/require-prop-types
    'currentHitTypeList',
    // eslint-disable-next-line vue/require-prop-types
    'runEnvList',
    // eslint-disable-next-line vue/require-prop-types
    'projectList'
  ],
  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      submitButtonIsLoading: false,
      drawerIsShow: false,
      hitTypeList: this.currentHitTypeList,
      runTestType: this.runTestTypeList,
      projectListData: [], // 项目列表
      tempHit: {
        id: '',
        date: '',
        hit_type: '',
        hit_detail: '',
        test_type: '',
        project_id: '',
        env: '',
        report_id: '',
        desc: ''
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
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
        }]
      },
      projectListUrl: '',
      getReportUrl: ''
    }
  },

  watch: {
    'runTestTypeList': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.runTestType = newVal
        }
      }
    },

    'currentHitTypeList': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.hitTypeList = newVal
        }
      }
    },

    'projectList': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.projectListData = newVal
        }
      }
    }
  },

  created() {
    this.projectListData = this.projectList
    this.projectListUrl = apiProjectList
    this.getReportUrl = apiGetReport
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, status, data) => {
      if (_type === 'hit') {
        // 获取服务列表
        if (!this.projectListData || this.projectListData.length < 1) {
          this.projectListUrl().then(response => {
            this.projectListData = response.data.data
          })
        }

        // 获取问题类型列表
        if (!this.hitTypeList || this.hitTypeList.length < 1) {
          getHitTypeList().then(response => {
            this.hitTypeList = response.data
          })
        }

        // 获取测试类型列表
        if (!this.runTestType || this.runTestType.length < 1) {
          getConfigByName({ name: 'test_type' }).then(response => {
            this.runTestType = JSON.parse(response.data.value)
          })
        }

        if (status === 'add') {
          this.tempHit.id = ''
          this.tempHit.date = data ? data.date : ''
          this.tempHit.hit_type = ''
          this.tempHit.hit_detail = ''
          this.tempHit.test_type = data ? data.test_type : ''
          this.tempHit.project_id = data ? data.project_id : ''
          this.tempHit.env = data ? data.run_env : ''
          this.tempHit.report_id = data ? data.report_id : ''
          this.tempHit.desc = ''
          // 新增时，如果接收到了报告id，则获取报告对应的服务id
          if (this.tempHit.report_id) {
            this.getReportUrl({ id: this.tempHit.report_id }).then(response => {
              this.tempHit.project_id = response.data.project_id
            })
          }
        } else if (status === 'update') {
          this.tempHit.id = data.id
          this.tempHit.date = data.date
          this.tempHit.hit_type = data.hit_type
          this.tempHit.hit_detail = data.hit_detail
          this.tempHit.test_type = data.test_type
          this.tempHit.project_id = data.project_id
          this.tempHit.env = data.env
          this.tempHit.report_id = data.report_id
          this.tempHit.desc = data.desc
        }

        this.drawerIsShow = true
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {
    // 新增命中问题
    creteHit() {
      this.submitButtonIsLoading = true
      postHit(this.tempHit).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsCommit)
          this.drawerIsShow = false
        }
      })
    },

    // 修改命中问题
    editHit() {
      this.submitButtonIsLoading = true
      putHit(this.tempHit).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsCommit)
          this.drawerIsShow = false
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
