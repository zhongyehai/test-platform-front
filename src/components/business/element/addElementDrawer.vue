<template>
  <div>

    <!-- 新增/修改页面表单 -->
    <el-drawer
      title="新增元素"
      size="95%"
      :wrapper-closable="false"
      :append-to-body="true"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >
      <div style="margin-left: 20px; margin-right: 20px">

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
              <span><span style="color: red">*</span>元素名</span>
            </template>
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" size="mini" type="textarea" :rows="1" />
            </template>
          </el-table-column>

          <el-table-column header-align="center" min-width="15%">
            <template slot="header">
              <span><span style="color: red">*</span>定位方式</span>
            </template>
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.by"
                filterable
                default-first-option
                clearable
                size="mini"
                style="width:100%"
                placeholder="请选择定位方式"
              >
                <el-option
                  v-for="option in $busEvents.data.findElementOptionList"
                  :key="option.label"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column header-align="center" min-width="30%">
            <template slot="header">
              <span><span style="color: red">*</span>元素表达式</span>
            </template>
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.element"
                size="mini"
                type="textarea"
                :rows="1"
                :placeholder="
                  scope.row.by === 'bounds' ? '如元素坐标范围为[918,1079][1080,1205]，则填写: ([918,1079], [1080,1205])' :
                  scope.row.by === 'coordinate' ? '请填写具体坐标: (x, y)' : '元素表达式'
                "
              />
            </template>
          </el-table-column>

          <el-table-column v-if="dataType==='appUi'" header-align="center" min-width="20%">
            <template slot="header">
              <span>
                <span style="color: red">*</span>
                参照设备
                <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                  <div>元素定位时参照的设备，用于坐标定位时计算元素的具体位置</div>
                  <el-button slot="reference" type="text" icon="el-icon-question" />
                </el-popover>
              </span>
            </template>
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.template_device"
                :disabled="scope.row.by !== 'bounds'"
                filterable
                size="mini"
                style="width: 100%"
                placeholder="请选则元素定位时参照的设备"
              >
                <el-option
                  v-for="script in deviceList"
                  :key="script.id"
                  :label="script.name"
                  :value="script.id"
                />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column header-align="center" min-width="15%">
            <template slot="header">
              <span>元素描述</span>
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
          @click="addElement() "
        >
          {{ '保存元素' }}
        </el-button>

      </div>
    </el-drawer>

  </div>

</template>

<script>

import { postElement as appPostElement } from '@/apis/appUiTest/element'
import { postElement as webUiPostElement } from '@/apis/webUiTest/element'

export default {
  name: 'Drawer',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'currentProject', 'currentProjectId', 'currentModuleId', 'currentPageId', 'deviceList'
  ],
  data() {
    return {
      drawerIsShow: false, // 抽屉是否打开
      direction: 'rtl', // 抽屉打开方式

      isShowSubmitLoading: false,
      wait_time_out: this.dataType === 'appUi' ? 3 : 5,
      tempData: [{
        id: `${Date.now()}`,
        name: null,
        by: null,
        element: null,
        template_device: this.dataType === 'appUi' ? this.currentProject.template_device : undefined,
        desc: null,
        wait_time_out: this.wait_time_out
      }],
      postElementUrl: ''
    }
  },

  created() {
    if (this.dataType === 'webUi') {
      this.postElementUrl = webUiPostElement
    } else {
      this.postElementUrl = appPostElement
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, status, page_id) => {
      if (_type === 'elementInfo') {
        if (status === 'add') { // 新增
          this.drawerType = 'add'
          this.tempData = [{
            id: `${Date.now()}`,
            name: null,
            by: null,
            element: null,
            template_device: this.dataType === 'appUi' ? this.currentProject.template_device : undefined,
            desc: null,
            wait_time_out: this.wait_time_out
          }]
          this.drawerIsShow = true
        }
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    addRow() {
      this.tempData.push({
        id: `${Date.now()}`,
        name: null,
        by: null,
        element: null,
        template_device: this.dataType === 'appUi' ? this.currentProject.template_device : undefined,
        desc: null,
        wait_time_out: this.wait_time_out
      })
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempData.length === 1 && index === 0)
    },

    // 删除一行
    delRow(index) {
      this.tempData.splice(index, 1)
    },

    // 提交添加页面
    addElement() {
      this.isShowSubmitLoading = true
      this.postElementUrl({
        project_id: this.currentProjectId,
        module_id: this.currentModuleId,
        page_id: this.currentPageId,
        element_list: this.tempData
      }).then(response => {
        this.isShowSubmitLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsCommit, 'elementInfo')
          this.drawerIsShow = false
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
