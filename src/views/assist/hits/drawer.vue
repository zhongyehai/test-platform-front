<template>
  <!-- 新增/修改命中问题表单 -->
  <el-drawer
    :title="tempHit.id ? '修改命中问题' : '新增命中问题'"
    size="40%"
    :wrapperClosable="false"
    :visible.sync="drawerIsShow"
    :direction="direction">
    <el-form
      ref="dataForm"
      label-position="center"
      label-width="100px"
      style="min-width: 400px;margin-left: 20px;margin-right: 20px">

      <el-form-item :label="'触发时间'" prop="hit_type" class="is-required" size="mini">
        <el-date-picker
          v-model="tempHit.date"
          align="right"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
          :picker-options="pickerOptions">
        </el-date-picker>
      </el-form-item>

      <el-form-item :label="'测试类型'" prop="hit_type" class="is-required" size="mini">
        <el-select
          style="width: 100%"
          v-model="tempHit.test_type"
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
          >
          </el-option>
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
          style="width:100%">
          <el-option
            v-for="item in hitTypeList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item :label="'问题内容'" prop="name" class="is-required">
        <el-input v-model="tempHit.hit_detail" size="mini" type="textarea" :placeholder="'备注'"/>
      </el-form-item>

      <el-form-item :label="'报告id'" prop="report_id" class="is-required">
        <el-input size="mini" v-model="tempHit.report_id"/>
      </el-form-item>

      <el-form-item :label="'备注'" prop="desc">
        <el-input v-model="tempHit.desc" size="mini" type="textarea" :placeholder="'备注'"/>
      </el-form-item>

    </el-form>

    <div class="demo-drawer__footer">
      <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click="tempHit.id ? editHit(): creteHit()">
        {{ '保存' }}
      </el-button>
    </div>

  </el-drawer>
</template>

<script>
import {getConfigByName} from '@/apis/config/config'
import {postHit, putHit, getHitTypeList} from '@/apis/assist/hit'

export default {
  name: "drawer",
  props: [
    'runTestTypeList',
    'currentHitTypeList'
  ],
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      submitButtonIsLoading: false,
      drawerIsShow: false,
      hitTypeList: this.currentHitTypeList,
      runTestType: this.runTestTypeList,
      tempHit: {
        id: '',
        date: '',
        hit_type: '',
        hit_detail: '',
        test_type: '',
        report_id: '',
        desc: ''
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date());
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', date);
          }
        }]
      },
    }
  },

  mounted() {

    this.$bus.$on(this.$busEvents.drawerIsShow, (status, data) => {

      this.initHitTypeList()  // 获取问题类型列表

      this.getRunType()  // 获取测试类型列表

      if (status === 'add') {
        this.tempHit.id = ''
        this.tempHit.date = data ? data.date : ''
        this.tempHit.hit_type = ''
        this.tempHit.hit_detail = ''
        this.tempHit.test_type = data ? data.test_type : ''
        this.tempHit.report_id = data ? data.report_id : ''
        this.tempHit.desc = ''
      } else if (status === 'update') {
        this.tempHit.id = data.id
        this.tempHit.date = data.date
        this.tempHit.hit_type = data.hit_type
        this.tempHit.hit_detail = data.hit_detail
        this.tempHit.test_type = data.test_type
        this.tempHit.report_id = data.report_id
        this.tempHit.desc = data.desc
      }

      this.drawerIsShow = true
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
    },

    initHitTypeList() {
      if (!this.hitTypeList || this.hitTypeList.length < 1){
        getHitTypeList().then(response => {
          this.hitTypeList = response.data
        })
      }
    },

    getRunType() {
      if (!this.runTestType || this.runTestType.length < 1) {
        getConfigByName({name: 'test_type'}).then(response => {
          this.runTestType = JSON.parse(response.data.value)
        })
      }
    }
  },

  watch: {
    "runTestTypeList": {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.runTestType = newVal
        }
      }
    },

    "currentHitTypeList": {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.hitTypeList = newVal
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
