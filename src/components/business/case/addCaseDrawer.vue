<template>
  <el-drawer
    title="新增用例"
    size="95%"
    :wrapper-closable="false"
    :append-to-body="true"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >

    <div style="margin-left: 20px; margin-right: 20px">
      <el-form size="mini" label-width="100px">
        <el-form-item label="用例归属" class="is-required" style="margin-bottom: 5px">
          <el-select v-model="caseSuiteLabel" placeholder="请选择用例集" size="mini" style="width: 100%">
            <el-option :value="[]" style="height: auto">
              <el-tree
                ref="suiteTree"
                :data="caseSuiteTree"
                show-checkbox
                node-key="id"
                check-strictly
                highlight-current
                :props="defaultProps"
                @check-change="handleNodeClick"
              />
            </el-option>
          </el-select>

        </el-form-item>
      </el-form>

      <el-table
        ref="dataTable"
        :data="tempData"
        stripe
        size="mini"
        row-key="id"
      >

        <el-table-column label="序号" header-align="center" min-width="4%">
          <template slot-scope="scope">
            <div>{{ scope.$index + 1 }}</div>
          </template>
        </el-table-column>

        <el-table-column header-align="center" min-width="20%">
          <template slot="header">
            <span><span style="color: red">*</span>用例名字</span>
          </template>
          <template slot-scope="scope">
            <el-input v-model="scope.row.name" size="mini" type="textarea" :rows="1" />
          </template>
        </el-table-column>

        <el-table-column header-align="center" min-width="30%">
          <template slot="header">
            <span><span style="color: red">*</span>用例描述</span>
          </template>
          <template slot-scope="scope">
            <el-input v-model="scope.row.desc" size="mini" type="textarea" :rows="1" />
          </template>
        </el-table-column>

        <el-table-column label="操作" header-align="center" min-width="6%">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
              <el-button
                v-show="scope.$index === 0 || scope.$index === tempData.length - 1"
                type="text"
                size="mini"
                icon="el-icon-plus"
                @click.native="addRow(true)"
              />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
              <el-button
                v-show="isShowDelButton(scope.$index)"
                type="text"
                size="mini"
                icon="el-icon-minus"
                style="color: red"
                @click.native="delRow(scope.$index)"
              />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" placement="top-end" content="清除数据">
              <el-button
                v-show="tempData.length === 1"
                type="text"
                size="mini"
                icon="el-icon-circle-close"
                style="color: red"
                @click.native="clearData()"
              />
            </el-tooltip>
          </template>
        </el-table-column>

      </el-table>
    </div>

    <div class="demo-drawer__footer">

      <el-button size="mini" @click=" drawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        size="mini"
        type="primary"
        :loading="submitLoadingIsShow"
        @click="addCase()"
      >
        {{ '保存' }}
      </el-button>
    </div>

  </el-drawer>

</template>

<script>

import { postCase as apiPostCase } from '@/apis/apiTest/case'
import { getCaseSuite as apiGetCaseSuite } from '@/apis/apiTest/suite'

import { postCase as webUiPostCase } from '@/apis/webUiTest/case'
import { getCaseSuite as webUiGetCaseSuite } from '@/apis/webUiTest/suite'

import { postCase as appUiPostCase } from '@/apis/appUiTest/case'
import { getCaseSuite as appUiGetCaseSuite } from '@/apis/appUiTest/suite'

export default {
  name: 'AddCaseDrawer',
  components: {

  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'currentSetId'
  ],
  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      drawerType: '',
      drawerIsShow: false,

      tempData: [{ id: `${Date.now()}`, name: null, desc: null }],
      suiteId: '',
      submitLoadingIsShow: false,
      isShowDebugLoading: false,
      caseSuiteTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      caseSuiteLabel: '',
      postCaseUrl: '',
      getCaseSuiteUrl: ''
    }
  },

  watch: {
    'drawerIsShow': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal && this.currentSetId) {
          this.getCaseSuiteUrl({ 'id': this.currentSetId }).then(response => {
            this.caseSuiteLabel = response.data.name
            this.$refs.suiteTree.setCheckedKeys([this.currentSetId])
          })
        }
      }
    }
  },

  mounted() {
    // 监听 添加用例指令
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, command) => {
      if (_type === 'caseInfo') {
        if (command === 'add') {
          this.suiteId = this.currentSetId
          this.initNewTempData()
          this.submitLoadingIsShow = false
          this.drawerIsShow = true
        }
      }
    })

    // 监听、接收用例集树
    this.$bus.$on(this.$busEvents.treeIsDone, (_type, caseSuiteTree) => {
      if (_type === 'caseSuite') {
        this.caseSuiteTree = caseSuiteTree
      }
    })
  },

  created() {
    if (this.dataType === 'api') {
      this.postCaseUrl = apiPostCase
      this.getCaseSuiteUrl = apiGetCaseSuite
    } else if (this.dataType === 'webUi') {
      this.postCaseUrl = webUiPostCase
      this.getCaseSuiteUrl = webUiGetCaseSuite
    } else {
      this.postCaseUrl = appUiPostCase
      this.getCaseSuiteUrl = appUiGetCaseSuite
    }
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
    this.$bus.$off(this.$busEvents.treeIsDone)
  },

  methods: {
    addRow() {
      this.tempData.push({ id: `${Date.now()}`, name: null, desc: null })
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempData.length === 1 && index === 0)
    },

    // 删除一行
    delRow(index) {
      this.tempData.splice(index, 1)
    },

    // 清除数据
    clearData() {
      this.tempData[0].name = null
      this.tempData[0].desc = null
    },

    // 打开添加步骤抽屉
    showAddStepDrawer() {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'showAddStepDrawer')
    },

    // 初始化新增用例模板
    initNewTempData() {
      this.tempData = [{ id: `${Date.now()}`, name: null, desc: null }]
    },

    // 勾选树事件
    handleNodeClick(data, checked, node) {
      this.suiteId = data.id
      if (checked && [data.id] !== this.$refs.suiteTree.getCheckedKeys()) {
        this.$refs.suiteTree.setCheckedKeys([data.id]) // 选中
        this.caseSuiteLabel = data.name
      }
    },

    // 新增用例
    addCase() {
      this.submitLoadingIsShow = true
      this.postCaseUrl({ suite_id: this.suiteId, case_list: this.tempData }).then(response => {
        this.submitLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsCommit, 'caseInfo')
          if (this.tempData.length === 1) { // 如果只增加一条用例，则新增完后打开编辑框
            this.$bus.$emit(
              this.$busEvents.drawerIsShow,
              'caseInfo',
              'edit',
              JSON.parse(JSON.stringify(response.data))
            )
          }
          this.drawerIsShow = false
        }
      })
    }

  }
}
</script>

<style scoped>

</style>
