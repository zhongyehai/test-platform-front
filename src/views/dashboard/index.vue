<template>
  <div class="dashboard-editor-container">

    <!-- title统计 -->
    <panel-group @handleSetLineChartData="handleSetLineChartData"/>

    <!-- 曲线图 -->
    <el-row style="background:#fff;padding:16px 16px 0;">
      <!-- 避免出现改变了数据，统计图没有重新渲染的情况，这里加一个key值，数据发生改变则前置重新渲染 -->
      <line-chart :chart-data="detailData" :key="detailData.title"/>
    </el-row>


    <!-- 柱状图 -->
    <!--    <el-row :gutter="32">-->
    <!--      <el-col :xs="24" :sm="24" :lg="24">-->
    <!--        <div class="chart-wrapper">-->
    <!--          <bar-chart :chart-data="detailData" :key="detailData.title"/>-->
    <!--        </div>-->
    <!--      </el-col>-->
    <!--    </el-row>-->

  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import RaddarChart from './components/RaddarChart'
import PieChart from './components/PieChart'

// import ColumnChart from './components/ColumnChart'

import BarChart from './components/BarChart'
import TransactionTable from './components/TransactionTable'
import TodoList from './components/TodoList'
// import BoxCard from './components/BoxCard'

import { getDetailCount } from '@/apis/home/home'

const lineChartData = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'Dashboard',
  components: {
    PanelGroup,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart,
    TransactionTable,
    TodoList
    // BoxCard
  },
  data() {
    return {
      // lineChartData: lineChartData.newVisitis
      detailData: {}
    }
  },

  methods: {
    handleSetLineChartData(type) {
      // this.lineChartData = lineChartData[type]
      getDetailCount(type).then(response => {
        this.detailData = response.data
      })
    }
  },

  // mounted() {
  //   // 初始时获取定时任务的详情
  //   this.handleSetLineChartData('task')
  // }

  created() {
    // 初始时获取定时任务的详情
    this.handleSetLineChartData('report')
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


<!--&lt;!&ndash;<template>&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;  <div class="dashboard-container">&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;    <div class="dashboard-text">userName: {{ userName }}</div>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;  </div>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;</template>&ndash;&gt;-->


<!--<script>-->
<!--import { mapGetters } from 'vuex'-->

<!--export default {-->
<!--  name: 'Dashboard',-->
<!--  // computed: {...mapGetters([ 'userName' ])},-->
<!--  // data(){-->
<!--  //   return {-->
<!--  //     userName: this.$store.getters.userName-->
<!--  //   }-->
<!--  // }-->
<!--}-->
<!--</script>-->

<!--<style lang="scss" scoped>-->
<!--.dashboard {-->
<!--  &-container {-->
<!--    margin: 30px;-->
<!--  }-->
<!--  &-text {-->
<!--    font-size: 30px;-->
<!--    line-height: 46px;-->
<!--  }-->
<!--}-->
<!--</style>-->
