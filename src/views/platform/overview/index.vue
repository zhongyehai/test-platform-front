<template>
  <div class="dashboard-editor-container">
    <el-radio-group v-model="time_slot" size="mini" @change="change_time_slot()">
      <el-radio-button v-for="(value, key) in time_slot_mapping" :key="key" :label="key" />
    </el-radio-group>

    <el-row v-loading="card_is_loading" class="card-group">
      <el-card class="card"> 总使用次数 {{ use_card_res.use_count }}</el-card>
      <el-card class="card"> 总通过率 {{ (use_card_res.use_pass_rate * 100).toFixed(2).toString() }} % </el-card>
      <el-card class="card"> 巡检次数 {{ use_card_res.patrol_count }}</el-card>
      <el-card class="card"> 巡检通过率 {{ (use_card_res.patrol_pass_rate * 100).toFixed(2).toString() }} %</el-card>
      <el-card class="card"> 造数据次数 {{ use_card_res.make_data_count }}</el-card>
    </el-row>

    <chart :key="use_chart_res.options_list" :chart-data="use_chart_res" />
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { useCard, useChart } from '@/apis/apiTest/stat'
import Chart from '@/views/platform/overview/chart.vue' // waves directive

export default {
  name: 'Index',
  components: { Chart },

  directives: { waves },
  data() {
    return {
      time_slot: '近7天',
      time_slot_mapping: {
        '近7天': -7,
        '近14天': -14,
        '近30天': -30,
        '近90天': -90,
        '近180天': -180
      },

      card_is_loading: false,
      use_card_res: {
        'use_count': 0,
        'use_pass_count': 0,
        'use_pass_rate': 0,
        'patrol_count': 0,
        'patrol_pass_count': 0,
        'patrol_pass_rate': 0,
        'make_data_count': 0
      },

      use_chart_res: {
        'options_list': [],
        'use_count_list': 0,
        'use_pass_count_list': 0,
        'use_pass_rate_list': 0,
        'patrol_count_list': 0,
        'patrol_pass_count_list': 0,
        'patrol_pass_rate_list': 0,
        'make_data_count_list': 0
      }

    }
  },

  mounted() {
    this.change_time_slot()
  },

  methods: {
    change_time_slot() {
      this.get_use_card()
      this.get_use_chart()
    },

    // 获取卡片统计
    get_use_card() {
      this.card_is_loading = true
      useCard({ time_slot: this.time_slot_mapping[this.time_slot] }).then(response => {
        this.card_is_loading = false
        this.use_card_res = response.data
      })
    },

    // 统计图
    get_use_chart() {
      useChart({ time_slot: this.time_slot_mapping[this.time_slot] }).then(response => {
        this.use_chart_res = response.data
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

.card-group {
  padding-top: 10px;
  padding-bottom: 32px;
  white-space: nowrap; /* 防止卡片换行 */
  overflow-x: auto;    /* 如果内容超出容器宽度，显示水平滚动条 */

  .card {
    width: 19%;        /* 设置卡片宽度，根据需要调整 */
    display: inline-block; /* 设置卡片为内联块元素，使其在同一行显示 */
    color: #FFF;
    text-align: center;
    margin-right: 10px;
    background-color: #409EFF;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}

</style>
