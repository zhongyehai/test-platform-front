<template>
  <div>
    <el-drawer
      :title="drawerType === 'edit' ? '修改元素' : '新增元素'"
      size="70%"
      :append-to-body="true"
      :wrapperClosable="false"
      :visible.sync="drawerIsShow"
      :direction="direction">
      <div class="demo-drawer__content">

        <div style="margin-left: 20px;margin-right: 20px">

          <el-form ref="dataForm" :model="tempElement" label-width="120px">
            <el-form-item :label="'元素名'" prop="name" size="mini" class="is-required">
              <el-input v-model="tempElement.name"/>
            </el-form-item>

            <el-form-item :label="'定位方式'" prop="by" size="mini" class="is-required">
              <el-select
                v-model="tempElement.by"
                filterable
                default-first-option
                clearable
                size="mini"
                style="width:100%"
                placeholder="请选择定位方式">
                <el-option
                  v-for="option in $busEvents.data.findElementOptionList"
                  :key="option.label"
                  :label="option.label"
                  :value="option.value"
                ></el-option>
              </el-select>
            </el-form-item>

            <el-form-item
              label="元素表达式"
              prop="element"
              class="is-required">
              <el-input
                size="mini"
                v-model="tempElement.element"
                :placeholder="tempElement.by === 'coordinate' ? '请填写坐标：(x, y)，如(538, 1816)' : '元素表达式'"
                :style="{'width': tempElement.by === 'coordinate' ? '98%' : '100%'}"
              />
              <el-popover
                v-show="tempElement.by === 'coordinate'"
                class="el_popover_class"
                placement="top-start"
                trigger="hover">
                <div>请填写坐标：(x, y)</div>
                <div>如坐标x为538, y为1816，则填写: (538, 1816)</div>
                <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
              </el-popover>
            </el-form-item>

            <el-form-item label="等待超时时间" class="is-required" style="margin-bottom: 5px">
              <el-input-number size="mini" v-model="tempElement.wait_time_out" :min="2"></el-input-number>
              <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                <div>
                  1、等待元素出现的超时时间，最少设置为2秒 <br>
                  2、若在此时间内，元素出现，则立即执行步骤，若超过此时间，元素仍未出现，则报错 <br>
                  3、若元素管理处已设置超时时间，以步骤处设置的为准
                </div>
                <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
              </el-popover>
            </el-form-item>

            <el-form-item :label="'备注'" prop="desc" size="mini">
              <el-input v-model="tempElement.desc" size="mini" type="textarea" :rows="5" :placeholder="'元素描述'">
              </el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <div class="demo-drawer__footer">
        <el-button
          v-show="submitButtonIsShow"
          type="primary"
          size="mini"
          @click="drawerType === 'edit' ? changElement() : addElement() "
          :loading="submitButtonIsLoading"
        >保存
        </el-button>
      </div>

    </el-drawer>
  </div>
</template>

<script>
import {postElement as appPostElement, putElement as appPutElement} from '@/apis/appUiTest/element'
import {postElement as webUiPostElement, putElement as webUiPutElement} from '@/apis/webUiTest/element'

export default {
  name: 'drawer',
  props: [
    'dataType',
    'currentProjectId',
    'currentModuleId',
    'currentPageId'
  ],
  components: {},
  data() {
    return {
      drawerIsShow: false,  // 抽屉的显示状态
      direction: 'rtl',  // 抽屉打开方式
      drawerType: '',

      // 临时数据，添加、修改
      tempElement: {
        id: null,
        name: null,
        by: null,
        element: null,
        desc: null,
        wait_time_out: 5,
      },
      submitButtonIsLoading: false,
      submitButtonIsShow: true,
      pageId: '',
      isSendForPage: false,  // 标记是否发送给页面管理，更新页面地址

      element_label: '',

      postElementUrl: '',
      putElementUrl: ''
    }
  },

  methods: {

    // 初始化临时元素数据 (新增)
    initTempElement() {
      this.tempElement = {
        id: null,
        name: null,
        by: null,
        element: null,
        desc: null,
        wait_time_out: 5,
        page_id: this.pageId,
        module_id: this.currentModuleId,
        project_id: this.currentProjectId
      }
      this.submitButtonIsShow = true
    },

    // 初始化临时元素数据 (修改)
    updateTempElement(row) {
      this.tempElement.id = row.id
      this.tempElement.name = row.name
      this.tempElement.by = row.by
      this.tempElement.element = row.element
      this.tempElement.desc = row.desc
      this.tempElement.wait_time_out = row.wait_time_out
      this.tempElement.page_id = row.page_id
      this.tempElement.module_id = row.module_id
      this.tempElement.project_id = row.project_id
      this.submitButtonIsShow = true
    },

    // 获取数据提交给后端
    getProjectForCommit() {
      return {
        id: this.tempElement.id,
        name: this.tempElement.name,
        by: this.tempElement.by,
        element: this.tempElement.element,
        desc: this.tempElement.desc,
        wait_time_out: this.tempElement.wait_time_out,
        page_id: this.tempElement.page_id,
        module_id: this.tempElement.module_id,
        project_id: this.tempElement.project_id,
      }
    },

    // 新增元素
    addElement() {
      this.submitButtonIsLoading = true
      this.postElementUrl(this.getProjectForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.tempElement.id = response.data.id
          this.sendIsCommitStatus()
        }
      })
    },

    // 修改元素
    changElement() {
      this.submitButtonIsLoading = true
      this.putElementUrl(this.getProjectForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.sendIsCommitStatus()
        }
      })
    },

    // 数据提交成功后，向父组件发送提交成功的消息，父组件重新请求元素列表
    sendIsCommitStatus() {
      this.$bus.$emit(this.$busEvents.drawerIsCommit, 'elementInfo')
      // 如果提交的是页面地址，则发送给页面管理
      if (this.isSendForPage) {
        this.$bus.$emit(this.$busEvents.drawerIsCommit, 'elementIsUrl')
      }
      this.drawerIsShow = false
    },

  },

  mounted() {

    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, status, data) => {
      if (_type === 'elementInfo') {
        if (status === 'add') {  // 新增
          this.drawerType = 'add'
          this.initTempElement()
        } else if (status === 'edit') {  // 修改
          this.drawerType = 'edit'
          this.updateTempElement(data)
        } else if (status === 'copy') {  // 复制
          this.drawerType = 'add'
          this.updateTempElement(data)
        }

        if (this.tempElement.by === null) {
          this.tempElement.by = this.$busEvents.data.findElementOptionList[0].label
        }

        this.drawerIsShow = true
      }
    })

    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, pageId) => {
      if (_type === 'pageInfo') {
        this.pageId = pageId
      }
    })

    this.$bus.$on(this.$busEvents.drawerIsOpen, (_type, pageId) => {
      if (_type === 'pageInfo') {
        this.pageId = pageId
      }
    })
  },

  created() {
    if (this.dataType === 'webUi') {
      this.postElementUrl = webUiPostElement
      this.putElementUrl = webUiPutElement
    } else {
      this.postElementUrl = appPostElement
      this.putElementUrl = appPutElement
    }

    this.pageId = this.currentPageId
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
    this.$bus.$off(this.$busEvents.drawerIsCommit)
    this.$bus.$off(this.$busEvents.drawerIsOpen)
  },

  watch: {
    'tempElement.by': {
      deep: true,
      handler(newVal, oldVal) {
        // 新url，或者其他元素改为url
        if (newVal === 'url') {
          this.isSendForPage = true
        } else this.isSendForPage = oldVal === 'url' && newVal !== 'url';

      }
    }
  }
}
</script>

<style scoped>

</style>
