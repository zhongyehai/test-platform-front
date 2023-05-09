<template>

  <!-- 步骤管理组件 -->
  <div>

    <!-- 步骤列表 -->
    <stepListView
      ref="stepListView"
      :data-type="dataType"
      :project-id="projectId"
      :case-id="caseId"
    />

    <!-- 添加步骤/引用用例 -->
    <el-drawer
      title="新增步骤"
      size="85%"
      :append-to-body="true"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >
      <el-tabs v-model="activeName" style="margin-left: 20px">

        <!-- 接口列表 -->
        <el-tab-pane v-if="dataType === 'api'" label="接口列表" name="apiList">
          <apiListView
            ref="apiListView"
            :project-id="projectId"
            :current-case-id="caseId"
          />
        </el-tab-pane>

        <!-- 元素列表 -->
        <el-tab-pane v-if="dataType !== 'api'" label="元素列表" name="apiList">
          <elementListView
            ref="elementList"
            :data-type="dataType"
            :project-id="projectId"
            :current-case-id="caseId"
          />
        </el-tab-pane>

        <!-- 引用用例 -->
        <el-tab-pane label="引用用例" name="quoteCase">
          <quoteCaseView
            ref="quoteCase"
            :data-type="dataType"
            :project-id="projectId"
            :case-id="caseId"
          />
        </el-tab-pane>

      </el-tabs>
    </el-drawer>

    <!-- api步骤编辑 -->
    <editApiStepView
      v-if="dataType === 'api'"
      ref="editStepView"
      :case-id="caseId"
      :data-type="dataType"
    />

    <!-- ui步骤编辑 -->
    <editUiStepView
      v-else
      ref="editStepView"
      :data-type="dataType"
      :case-id="caseId"
    />
  </div>

</template>

<script>

import stepListView from './stepList'
import apiListView from './apiList'
import elementListView from './elementList.vue'
import editApiStepView from './editApiStep.vue'
import editUiStepView from './editUiStep.vue'
import quoteCaseView from './quoteCase'

import { postStep as apiPostStep } from '@/apis/apiTest/step'
import { postStep as webUiPostStep } from '@/apis/webUiTest/step'
import { postStep as appUiPostStep } from '@/apis/appUiTest/step'

export default {
  name: 'Index',
  components: {
    stepListView,
    apiListView,
    elementListView,
    editApiStepView,
    editUiStepView,
    quoteCaseView
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'projectId', 'caseId'
  ],
  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      drawerIsShow: false,
      activeName: 'apiList',
      postStepUrl: ''
    }
  },

  created() {
    if (this.dataType === 'api') {
      this.postStepUrl = apiPostStep
    } else if (this.dataType === 'webUi') {
      this.postStepUrl = webUiPostStep
    } else {
      this.postStepUrl = appUiPostStep
    }
  },

  mounted() {
    // 打开添加步骤抽屉
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, caseId) => {
      if (_type === 'showAddStepDrawer') {
        this.drawerIsShow = true
      }
    })

    // 引用用例
    this.$bus.$on(this.$busEvents.quoteCaseToStep, (testCase, status) => {
      if (testCase) {
        this.postStepUrl(testCase).then(response => {
          if (this.showMessage(this, response)) {
            this.$bus.$emit(this.$busEvents.drawerIsCommit, 'stepInfo') // 重新请求步骤列表
            this.$bus.$emit(this.$busEvents.quoteCaseToStep, null, 'quoteCaseToStepSuccess') // 重新请求步骤列表
          }
        })
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
    this.$bus.$off(this.$busEvents.quoteCaseToStep)
  },

  methods: {}
}
</script>

<style scoped>

</style>
