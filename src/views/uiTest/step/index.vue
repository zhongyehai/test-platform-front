<template>

  <!-- 步骤管理组件 -->
  <el-row>

    <!-- 步骤列表 -->
    <el-col :span="10">
      <stepListView
        ref="stepListView"
        :caseStepList="stepList"
        :caseId="caseId"></stepListView>
    </el-col>

    <!-- 添加步骤/引用用例 -->
    <el-col :span="14">

      <el-tabs v-model="activeName">

        <!-- 接口列表 -->
        <el-tab-pane label="元素列表" name="apiList">
          <elementList
            ref="elementList"
            :projectId="this.projectId"
            :dialogIsShow="dialogIsShow"
            :currentCaseId="caseId"
          ></elementList>
        </el-tab-pane>

        <!-- 引用用例 -->
        <el-tab-pane label="引用用例" name="quoteCase">
          <quoteCaseView
            ref="quoteCase"
            :tempCase="tempCase"
            :caseId="caseId"
          ></quoteCaseView>
        </el-tab-pane>

      </el-tabs>

    </el-col>

    <!-- 步骤编辑 -->
    <editStepView
      ref="editStepView"
      :caseId="caseId"
      :projectId="projectId"
    ></editStepView>
  </el-row>


</template>

<script>


import stepListView from '@/views/uiTest/step/stepList'
import elementList from '@/views/uiTest/step/elementList'
import editStepView from "@/views/uiTest/step/editStep";
import quoteCaseView from "@/views/uiTest/step/quoteCase";

import {postStep, stepList} from "@/apis/uiTest/step";

export default {
  name: 'index',
  props: [
    'projectId',
    'caseId',
    'tempCase',
    'stepList'
  ],
  components: {
    stepListView,
    elementList,
    editStepView,
    quoteCaseView
  },
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      dialogStatus: '',
      dialogIsShow: false,
      activeName: 'apiList',

    }
  },

  methods: {},

  mounted() {

    // 新增步骤
    this.$bus.$on(this.$busEvents.ui.uiAddElementToStep, (apiOrCase, type) => {
      if (type === 'quote') {  // 引用接口
        postStep(apiOrCase).then(response => {
          if (this.showMessage(this, response)) {
            // 避免重复请求步骤列表，新建完步骤过后，把新增的步骤给步骤列表更新
            this.$bus.$emit(this.$busEvents.api.apiAddStepIsCommit, response.data)
          }
        })
      }
    })

    // 打开用例caseDialog的时候，定位到接口列表栏
    this.$bus.$on(this.$busEvents.api.apiCaseDrawerStatus, (command, currentCase) => {
      this.activeName = 'apiList'
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.ui.uiAddElementToStep)
    this.$bus.$off(this.$busEvents.editStep)
    this.$bus.$off(this.$busEvents.api.apiCaseDrawerStatus)
  }
}
</script>

<style scoped>

</style>
