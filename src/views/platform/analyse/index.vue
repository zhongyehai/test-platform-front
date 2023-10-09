<template>
  <div class="dashboard-editor-container">
    <el-form label-width="80px" :inline="true">

      <el-form-item :label="'业务线'" size="mini">
        <el-select
          v-model="query_form.business_id"
          filterable
          placeholder="业务线"
          size="mini"
        >
          <el-option
            v-for="business in $busEvents.data.businessList"
            :key="business.id"
            :label="business.name"
            :value="business.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="'触发方式'" size="mini">
        <el-select
          v-model="query_form.trigger_type"
          filterable
          placeholder="业务线"
          size="mini"
          clearable
        >
          <el-option
            v-for="trigger_type in trigger_type_list"
            :key="trigger_type.value"
            :label="trigger_type.label"
            :value="trigger_type.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="'生成时间'" size="mini">
        <el-date-picker
          v-model="time_list"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions"
        />
      </el-form-item>

      <el-button type="primary" size="mini" @click.native="get_analyse_chart()">查询</el-button>
    </el-form>

    <el-row style="margin-top: 10px">
      <el-col :span="12">
        <count_chart :key="analyse_chart_res.use_count" :chart-data="analyse_chart_res.use_count" />
        <div style="text-align: center; color: #409EFF">
          报告总计{{ analyse_chart_res.use_count.all_count }}条，执行通过{{ analyse_chart_res.use_count.pass_count }}
          条，执行失败{{ analyse_chart_res.use_count.fail_count }}条，执行通过率
          {{ ((analyse_chart_res.use_count.pass_count / analyse_chart_res.use_count.all_count) * 100).toFixed(3).toString() }}%
        </div>
      </el-col>
      <el-col :span="12">
        <count_chart :key="analyse_chart_res.use_count" :chart-data="analyse_chart_res.use_count" />
      </el-col>
    </el-row>

  </div>
</template>

<script>
import waves from '@/directive/waves'
import { analyseChart } from '@/apis/apiTest/stat'
import { businessList } from '@/apis/config/business'
import count_chart from './count_chart.vue'

export default {
  name: 'Index',
  components: { count_chart },

  directives: { waves },
  data() {
    return {
      pickerOptions: {
        shortcuts: [{
          text: '近7天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '近30天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '近90天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },

      trigger_type_list: [
        { label: '页面', value: 'page' },
        { label: '流水线', value: 'pipeline' },
        { label: '定时任务', value: 'cron' }
      ],

      time_list: [],
      query_form: {
        business_id: '',
        trigger_type: undefined,
        start_time: '',
        end_time: ''
      },

      analyse_chart_res: {
        'use_count': {
          'all_count': 0, 'pass_count': 0, 'fail_count': 0
        }
      }

    }
  },
  computed: {},

  watch: {},

  mounted() {
    // 获取业务线
    if (this.$busEvents.data.businessList.length < 1) {
      businessList().then(response => {
        this.$busEvents.data.businessList = response.data.data
        this.$busEvents.data.businessDict = {}
        this.$busEvents.data.businessList.forEach(business => {
          this.$busEvents.data.businessDict[business.id] = business.name
        })
        if (this.$busEvents.data.businessList.length > 1) {
          this.query_form.business_id = this.$busEvents.data.businessList[0].id
          this.get_analyse_chart()
        }
      })
    } else {
      this.query_form.business_id = this.$busEvents.data.businessList[0].id
      this.get_analyse_chart()
    }
  },

  methods: {

    get_analyse_chart() {
      this.query_form.start_time = this.time_list[0]
      this.query_form.end_time = this.time_list[1]
      analyseChart(this.query_form).then(response => {
        this.analyse_chart_res = response.data
      })
    }
  }

}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
