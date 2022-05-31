<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('project')">
        <div class="card-panel-icon-wrapper icon-people">
          <i class="el-icon-folder-opened card-panel-icon"></i>
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            服务数
          </div>
          <count-to :start-val="0" :end-val="title.project" :duration="1" class="card-panel-num"/>
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('module')">
        <!--  图标 -->
        <div class="card-panel-icon-wrapper icon-shopping">
          <i class="el-icon-folder card-panel-icon" ></i>
        </div>
        <!-- 文案 -->
        <div class="card-panel-description">
          <div class="card-panel-text">
            模块数
          </div>
          <count-to :start-val="0" :end-val="title.module" :duration="1" class="card-panel-num"/>
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('api')">
        <div class="card-panel-icon-wrapper icon-message">
          <i class="el-icon-s-order card-panel-icon"></i>
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            接口数
          </div>
          <count-to :start-val="0" :end-val="title.api" :duration="1" class="card-panel-num"/>
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('file')">
        <!--  图标 -->
        <div class="card-panel-icon-wrapper icon-shopping">
          <i class="el-icon-files card-panel-icon" ></i>
        </div>
        <!-- 文案 -->
        <div class="card-panel-description">
          <div class="card-panel-text">
            文件数
          </div>
          <count-to :start-val="0" :end-val="title.file" :duration="1" class="card-panel-num"/>
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('case')">
        <div class="card-panel-icon-wrapper icon-money">
          <i class="el-icon-tickets card-panel-icon"></i>
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            用例数
          </div>
          <count-to :start-val="0" :end-val="title.case" :duration="1" class="card-panel-num"/>
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('step')">
        <!--  图标 -->
        <div class="card-panel-icon-wrapper icon-shopping">
          <i class="el-icon-document-copy card-panel-icon" ></i>
        </div>
        <!-- 文案 -->
        <div class="card-panel-description">
          <div class="card-panel-text">
            测试步骤数
          </div>
          <count-to :start-val="0" :end-val="title.step" :duration="1" class="card-panel-num"/>
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('task')">
        <!--  图标 -->
        <div class="card-panel-icon-wrapper icon-shopping">
          <i class="el-icon-date card-panel-icon" ></i>
        </div>
        <!-- 文案 -->
        <div class="card-panel-description">
          <div class="card-panel-text">
            定时任务数
          </div>
          <count-to :start-val="0" :end-val="title.task" :duration="1" class="card-panel-num"/>
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('report')">
        <!--  图标 -->
        <div class="card-panel-icon-wrapper icon-shopping">
          <i class="el-icon-s-data card-panel-icon" ></i>
        </div>
        <!-- 文案 -->
        <div class="card-panel-description">
          <div class="card-panel-text">
            测试报告数
          </div>
          <count-to :start-val="0" :end-val="title.report" :duration="1" class="card-panel-num"/>
        </div>
      </div>
    </el-col>

  </el-row>
</template>

<script>

import {getTitleCount} from '@/apis/home/home'
import CountTo from 'vue-count-to'

export default {
  components: {
    CountTo
  },
  data() {
    return {
      title: {
        'project': 0,
        'models': 0,
        'api': 0,
        'file': 0,
        'set': 0,
        'case': 0,
        'step': 0,
        'task': 0,
        'report': 0,
      }
    }
  },

  methods: {
    // 点击的title统计，传给折线图，获取对应的明细
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    },

    // 获取title的统计
    getTitle() {
      getTitleCount().then(response => {
        this.title = response.data
      })
    },
  },

  mounted() {
    this.getTitle()
  }
}
</script>

<style lang="scss" scoped>
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
