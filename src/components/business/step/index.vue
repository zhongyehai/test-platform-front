<template>

  <!-- 步骤管理组件 -->
  <el-row>

    <!-- 步骤列表 -->
    <el-col :span="10">
      <stepListView
        ref="stepListView"
        :dataType="dataType"
        :caseId="caseId">
      </stepListView>
    </el-col>

    <!-- 添加步骤/引用用例 -->
    <el-col :span="14">

      <el-tabs v-model="activeName">

        <!-- 接口列表 -->
        <el-tab-pane v-if="dataType === 'api'" label="接口列表" name="apiList">
          <apiListView
            ref="apiListView"
            :projectId="this.projectId"
            :dialogIsShow="dialogIsShow"
            :currentCaseId="caseId"
          ></apiListView>
        </el-tab-pane>

        <!-- 接口列表 -->
        <el-tab-pane v-if="dataType !== 'api'" label="元素列表" name="apiList">
          <elementListView
            ref="elementList"
            :data-type="dataType"
            :projectId="this.projectId"
            :dialogIsShow="dialogIsShow"
            :currentCaseId="caseId"
          ></elementListView>
        </el-tab-pane>

        <!-- 引用用例 -->
        <el-tab-pane label="引用用例" name="quoteCase">
          <quoteCaseView
            ref="quoteCase"
            :data-type="dataType"
            :tempCase="tempCase"
            :caseId="caseId"
          ></quoteCaseView>
        </el-tab-pane>

      </el-tabs>

    </el-col>

    <!-- api步骤编辑 -->
    <editApiStepView
      v-if="dataType === 'api'"
      ref="editStepView"
      :caseId="caseId"
    ></editApiStepView>

    <!-- ui步骤编辑 -->
    <editUiStepView
      v-else
      ref="editStepView"
      :data-type="dataType"
      :projectId="projectId"
      :caseId="caseId"
    ></editUiStepView>
  </el-row>


</template>

<script>


import stepListView from './stepList'
import apiListView from './apiList'
import elementListView from './elementList.vue'
import editApiStepView from "./editApiStep.vue";
import editUiStepView from "./editUiStep.vue";
import quoteCaseView from "./quoteCase";

import {postStep as apiPostStep} from "@/apis/apiTest/step";
import {postStep as webUiPostStep} from "@/apis/webUiTest/step";
import {postStep as appUiPostStep} from "@/apis/appUiTest/step";

export default {
  name: 'index',
  props: [
    'dataType',
    'projectId',
    'caseId',
    'tempCase'
  ],
  components: {
    stepListView,
    apiListView,
    elementListView,
    editApiStepView,
    editUiStepView,
    quoteCaseView
  },
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      dialogStatus: '',
      dialogIsShow: false,
      activeName: 'apiList',
      postStepUrl: ''
    }
  },

  methods: {},

  created() {

    if (this.dataType === 'api'){
      this.postStepUrl = apiPostStep
    }else if (this.dataType === 'webUi'){
      this.postStepUrl = webUiPostStep
    }else {
      this.postStepUrl = appUiPostStep
    }
  },

  mounted() {

    // 引用用例
    this.$bus.$on(this.$busEvents.quoteCaseToStep, (elementOrCase) => {
        this.postStepUrl(elementOrCase).then(response => {
          if (this.showMessage(this, response)) {
            this.$bus.$emit(this.$busEvents.drawerIsCommit, 'stepInfo')  // 重新请求步骤列表
          }
        })
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.quoteCaseToStep)
  }
}
</script>

<style scoped>

</style>
