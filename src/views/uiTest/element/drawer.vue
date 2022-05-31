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

          <el-form ref="dataForm" :model="tempElement" label-width="100px">
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

            <el-form-item :label="'元素表达式'" prop="element" size="mini" class="is-required">
              <el-input v-model="tempElement.element"/>
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
import {postElement, putElement} from '@/apis/uiTest/element'

export default {
  name: 'drawer',
  props: [
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
        desc: null
      },
      submitButtonIsLoading: false,
      submitButtonIsShow: true,
      pageId: '',
      isSendForPage: false  // 标记是否发送给页面管理，更新页面地址
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
        page_id: this.tempElement.page_id,
        module_id: this.tempElement.module_id,
        project_id: this.tempElement.project_id,
      }
    },

    // 新增元素
    addElement() {
      this.submitButtonIsLoading = true
      postElement(this.getProjectForCommit()).then(response => {
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
      putElement(this.getProjectForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.sendIsCommitStatus()
        }
      })
    },

    // 数据提交成功后，向父组件发送提交成功的消息，父组件重新请求元素列表
    sendIsCommitStatus() {
      this.$bus.$emit(this.$busEvents.ui.uiElementDrawerCommitSuccess, 'success')
      // 如果提交的是页面地址，则发送给页面管理
      // if (this.tempElement.by === 'url') {
      //   this.$bus.$emit(this.$busEvents.ui.uiElementIsUrl, {pageId: this.pageId, addr: this.tempElement.element})
      // }
      // console.log('this.isSendForPage: ', this.isSendForPage)
      // console.log('this.tempElement: ', JSON.stringify(this.tempElement))
      if (this.isSendForPage){
        this.$bus.$emit(this.$busEvents.ui.uiElementIsUrl, {
          pageId: this.pageId,
          addr: this.tempElement.by === 'url' ? this.tempElement.element: ''
        })
      }
      this.drawerIsShow = false
    },

  },

  mounted() {

    this.$bus.$on(this.$busEvents.ui.uiElementDrawerStatus, (status, data) => {
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
      this.drawerIsShow = true
    })

    this.$bus.$on(this.$busEvents.ui.uiPageDrawerCommitSuccess, (status, pageId) => {
      this.pageId = pageId
    })

    this.$bus.$on(this.$busEvents.ui.uiPageDrawerIsOpen, (pageId) => {
      this.pageId = pageId
    })
  },

  created() {
    this.pageId = this.currentPageId
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.ui.uiElementDrawerStatus)
    this.$bus.$off(this.$busEvents.ui.uiPageDrawerCommitSuccess)
    this.$bus.$off(this.$busEvents.ui.uiPageDrawerIsOpen)
  },

  watch: {
    'tempElement.by': {
      deep: true,
      handler(newVal, oldVal) {
        // 新url，或者其他元素改为url
        if (newVal === 'url') {
            this.isSendForPage = true
        } else if (oldVal === 'url' && newVal !== 'url') {  // 把url改为其他元素
          this.isSendForPage = true
        }else {
          this.isSendForPage = false
        }

      }
    }
  }
}
</script>

<style scoped>

</style>
