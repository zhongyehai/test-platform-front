<template>
  <div>

    <!-- 新增/修改页面表单 -->
    <el-drawer
      title="新增页面"
      size="80%"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >
      <div style="margin-left: 20px; margin-right: 20px">

        <el-form label-width="80px">
          <el-form-item label="所属模块" class="is-required" style="margin-bottom: 5px">
            <el-select v-model="moduleLabel" placeholder="请选择模块" size="mini" style="width: 100%">
              <el-option :value="[]" style="height: auto">
                <el-tree
                  ref="moduleTree"
                  :data="moduleTree"
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
              <span><span style="color: red">*</span>页面名称</span>
            </template>
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" size="mini" type="textarea" :rows="1" />
            </template>
          </el-table-column>

          <el-table-column header-align="center" min-width="30%">
            <template slot="header">
              <span>页面描述</span>
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
          type="primary"
          size="mini"
          :loading="isShowSubmitLoading"
          @click="addPage() "
        >
          {{ '保存页面' }}
        </el-button>

      </div>
    </el-drawer>

  </div>

</template>

<script>

import { getModule as appUiGetModule } from '@/apis/appUiTest/module'
import { postPage as appUiPostPage } from '@/apis/appUiTest/page'

import { getModule as webUiGetModule } from '@/apis/webUiTest/module'
import { postPage as webUiPostPage } from '@/apis/webUiTest/page'

export default {
  name: 'Drawer',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'currentProjectId', 'currentModuleId'
  ],
  data() {
    return {
      drawerIsShow: false, // 抽屉是否打开
      direction: 'rtl', // 抽屉打开方式
      moduleTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      moduleLabel: '',
      isShowSubmitLoading: false,
      tempData: [{ id: `${Date.now()}`, name: null, desc: null }],
      getModuleUrl: '',
      postPageUrl: ''
    }
  },

  watch: {

    'drawerIsShow': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.getModuleUrl({ 'id': this.currentModuleId }).then(response => {
            this.moduleLabel = response.data.name
            this.$refs.moduleTree.setCheckedKeys([this.currentModuleId])
          })
        }
      }
    }
  },

  created() {
    if (this.dataType === 'webUi') {
      this.getModuleUrl = webUiGetModule
      this.postPageUrl = webUiPostPage
    } else {
      this.getModuleUrl = appUiGetModule
      this.postPageUrl = appUiPostPage
    }
  },

  mounted() {
    // 监听、接收模块树
    this.$bus.$on(this.$busEvents.treeIsDone, (_type, moduleTree) => {
      if (_type === 'module') {
        this.moduleTree = moduleTree
      }
    })

    // 监听 页面编辑框命令事件
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, command, page) => {
      if (_type === 'pageInfo') {
        if (command === 'add') {
          this.tempData = [{ id: `${Date.now()}`, name: null, desc: null }]
          this.isShowSubmitLoading = false
          this.drawerIsShow = true
        }
      }
    })
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

    // 勾选树事件
    handleNodeClick(data, checked, node) {
      if (checked && [data.id] !== this.$refs.moduleTree.getCheckedKeys()) {
        this.$refs.moduleTree.setCheckedKeys([data.id]) // 选中
        this.moduleLabel = data.name
      }
    },

    // 提交添加页面
    addPage() {
      const module_id = this.$refs.moduleTree.getCheckedKeys()[0]
      this.isShowSubmitLoading = true
      this.postPageUrl({ project_id: this.currentProjectId, module_id: module_id, page_list: this.tempData }).then(response => {
        this.isShowSubmitLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsCommit, 'pageInfo')
          if (this.tempData.length === 1) { // 如果只增加一条用例，则新增完后打开编辑框
            this.$bus.$emit(
              this.$busEvents.drawerIsShow, 'pageInfo', 'edit', JSON.parse(JSON.stringify(response.data))
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
