<template>
  <div class="dashboard-editor-container">
    <el-radio-group v-model="time_slot" size="mini" @change="change_time_slot()">
      <el-radio-button v-for="(value, key) in time_slot_mapping" :key="key" :label="key" />
    </el-radio-group>

    <el-row v-loading="card_is_loading" :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <!--  图标 -->
          <div class="card-panel-icon-wrapper icon-shopping">
            <i class="el-icon-s-data card-panel-icon" />
          </div>
          <!-- 文案 -->
          <div class="card-panel-description">
            <div class="card-panel-text">
              人工触发次数
            </div>
            <CountTo :start-val="0" :end-val="use_card_res.page_use_count" :duration="1" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <!--  图标 -->
          <div class="card-panel-icon-wrapper icon-shopping">
            <i class="el-icon-document-copy card-panel-icon" />
          </div>
          <!-- 文案 -->
          <div class="card-panel-description">
            <div class="card-panel-text">
              人工通过率
            </div>
            <CountTo
              :start-val="0"
              :end-val="use_card_res.page_use_pass_rate"
              :duration="1"
              :decimals="2"
              class="card-panel-num"
            />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <!--  图标 -->
          <div class="card-panel-icon-wrapper icon-shopping">
            <i class="el-icon-folder card-panel-icon" />
          </div>
          <!-- 文案 -->
          <div class="card-panel-description">
            <div class="card-panel-text">
              巡检次数
            </div>
            <CountTo :start-val="0" :end-val="use_card_res.patrol_count" :duration="1" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <!--  图标 -->
          <div class="card-panel-icon-wrapper icon-shopping">
            <i class="el-icon-s-order card-panel-icon" />
          </div>
          <!-- 文案 -->
          <div class="card-panel-description">
            <div class="card-panel-text">
              巡检通过率
            </div>
            <CountTo
              :start-val="0"
              :end-val="use_card_res.patrol_pass_rate"
              :duration="1"
              :decimals="2"
              class="card-panel-num"
            />
          </div>
        </div>
      </el-col>
      <!--      <el-card class="card"> 人工触发次数 {{ use_card_res.page_use_count }}</el-card>-->
      <!--      <el-card class="card"> 人工通过率 {{ (use_card_res.page_use_pass_rate * 100).toFixed(2).toString() }} % </el-card>-->
      <!--      <el-card class="card"> 巡检次数 {{ use_card_res.patrol_count }}</el-card>-->
      <!--      <el-card class="card"> 巡检通过率 {{ (use_card_res.patrol_pass_rate * 100).toFixed(2).toString() }} %</el-card>-->
      <!--      <el-card class="card"> 造数据次数 {{ use_card_res.make_data_count }}</el-card>-->
    </el-row>

    <chart :key="use_chart_res.options_list" :chart-data="use_chart_res" />
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { useCard, useChart } from '@/apis/apiTest/stat'
import Chart from './chart.vue'
import CountTo from 'vue-count-to'

export default {
  name: 'Index',
  components: { Chart, CountTo },

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
        'page_use_count': 0,
        'page_use_pass_count': 0,
        'page_use_pass_rate': 0,
        'patrol_count': 0,
        'patrol_pass_count': 0,
        'patrol_pass_rate': 0
        // 'make_data_count': 0
      },

      use_chart_res: {
        'options_list': [],
        'page_use_count_list': 0,
        'page_use_pass_count_list': 0,
        'page_use_pass_rate_list': 0,
        'patrol_count_list': 0,
        'patrol_pass_count_list': 0,
        'patrol_pass_rate_list': 0
        // 'make_data_count_list': 0
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

.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width: 550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
