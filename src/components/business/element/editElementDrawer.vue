<template>
  <div>
    <el-drawer
      :title="tempElement.id ? '修改元素' : '新增元素'"
      size="70%"
      :append-to-body="true"
      :wrapper-closable="false"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >
      <div class="demo-drawer__content">

        <div style="margin-left: 20px;margin-right: 20px">

          <el-form ref="dataForm" :model="tempElement" label-width="120px">
            <el-form-item :label="'元素名'" prop="name" size="mini" class="is-required">
              <el-input v-model="tempElement.name" />
            </el-form-item>

            <el-form-item :label="'定位方式'" prop="by" size="mini" class="is-required">
              <el-select
                v-model="tempElement.by"
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
            </el-form-item>

            <el-form-item label="元素表达式" prop="element" size="mini" class="is-required">
              <el-input
                v-model="tempElement.element"
                size="mini"
                type="textarea"
                :rows="1"
                :placeholder="
                  tempElement.by === 'bounds' ? '如元素坐标范围为[918,1079][1080,1205]，则填写: ([918,1079], [1080,1205])' :
                  tempElement.by === 'coordinate' ? '请填写具体坐标: (x, y)' : '元素表达式'"
                :style="{'width': ['bounds', 'coordinate'].indexOf(tempElement.by) !== -1 ? '98%' : '100%'}"
              />
              <el-popover
                v-show="['bounds', 'coordinate'].indexOf(tempElement.by) !== -1"
                class="el_popover_class"
                placement="top-start"
                trigger="hover"
              >
                <div v-show="tempElement.by === 'bounds'">
                  <div>请填写定位工具上bounds字段的值：[[x1, y1], [x2, y2]]</div>
                  <div>如坐标为[918,1079][1080,1205]，则填写: ([918,1079], [1080,1205])</div>
                </div>
                <div v-show="tempElement.by === 'coordinate'">
                  <div>请填写具体坐标值：(x, y)</div>
                  <div>如坐标为(918,1079)，则填写: (918,1079)</div>
                </div>
                <el-button slot="reference" type="text" icon="el-icon-question" />
              </el-popover>
            </el-form-item>

            <el-form-item
              v-if="dataType==='appUi' && tempElement.by === 'bounds'"
              label="参照设备"
              prop="template_device"
              size="mini"
              class="is-required"
            >
              <el-select
                v-model="tempElement.template_device"
                filterable
                size="mini"
                style="width: 98%"
                placeholder="请选则元素定位时参照的设备"
              >
                <el-option
                  v-for="script in deviceList"
                  :key="script.id"
                  :label="script.name"
                  :value="script.id"
                />
              </el-select>
              <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                <div>元素定位时参照的设备，用于坐标定位时计算元素的具体位置</div>
                <el-button slot="reference" type="text" icon="el-icon-question" />
              </el-popover>
            </el-form-item>

            <el-form-item label="等待超时时间" size="mini" class="is-required">
              <el-input-number v-model="tempElement.wait_time_out" size="mini" :min="2" />
              <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                <div>
                  1、等待元素出现的超时时间，最少设置为2秒 <br>
                  2、若在此时间内，元素出现，则立即执行步骤，若超过此时间，元素仍未出现，则报错 <br>
                  3、若元素管理处已设置超时时间，以步骤处设置的为准
                </div>
                <el-button slot="reference" type="text" icon="el-icon-question" />
              </el-popover>
            </el-form-item>

            <el-form-item :label="'备注'" prop="desc" size="mini">
              <el-input v-model="tempElement.desc" size="mini" type="textarea" :rows="5" :placeholder="'元素描述'" />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <div class="demo-drawer__footer">
        <el-button
          v-show="submitButtonIsShow"
          type="primary"
          size="mini"
          :loading="submitButtonIsLoading"
          @click="tempElement.id ? changElement() : addElement()"
        >保存
        </el-button>
      </div>

    </el-drawer>
  </div>
</template>

<script>
import { postElement as appPostElement, putElement as appPutElement } from '@/apis/appUiTest/element'
import { postElement as webUiPostElement, putElement as webUiPutElement } from '@/apis/webUiTest/element'

export default {
  name: 'Drawer',
  components: {},
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'currentProjectId', 'currentModuleId', 'currentPageId', 'deviceList'
  ],
  data() {
    return {
      drawerIsShow: false, // 抽屉的显示状态
      direction: 'rtl', // 抽屉打开方式

      // 临时数据，添加、修改
      tempElement: {
        id: null,
        name: null,
        by: null,
        element: null,
        template_device: undefined,
        desc: null,
        wait_time_out: 5
      },
      submitButtonIsLoading: false,
      submitButtonIsShow: true,
      isSendForPage: false, // 标记是否发送给页面管理，更新页面地址

      element_label: '',
      postElementUrl: '',
      putElementUrl: ''
    }
  },

  watch: {
    'tempElement.by': {
      deep: true,
      handler(newVal, oldVal) {
        // 新url，或者其他元素改为url
        if (newVal === 'url') {
          this.isSendForPage = true
        } else this.isSendForPage = oldVal === 'url' && newVal !== 'url'
      }
    }
  },

  created() {
    if (this.dataType === 'webUi') {
      this.putElementUrl = webUiPutElement
      this.postElementUrl = webUiPostElement
    } else {
      this.putElementUrl = appPutElement
      this.postElementUrl = appPostElement
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, status, element) => {
      if (_type === 'elementInfo') {
        if (status === 'edit') { // 修改
          this.tempElement.id = element.id
          this.updateTempElement(JSON.parse(JSON.stringify(element)))
        } else if (status === 'copy') { // 复制
          this.tempElement.id = ''
          this.updateTempElement(JSON.parse(JSON.stringify(element)))
        }

        if (this.tempElement.by === null) {
          this.tempElement.by = this.$busEvents.data.findElementOptionList[0].value
        }
        this.submitButtonIsLoading = false
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
    this.$bus.$off(this.$busEvents.drawerIsCommit)
    this.$bus.$off(this.$busEvents.drawerIsOpen)
  },

  methods: {

    // 初始化临时元素数据 (修改)
    updateTempElement(row) {
      this.tempElement.name = row.name
      this.tempElement.by = row.by
      this.tempElement.element = row.element
      this.tempElement.template_device = row.template_device
      this.tempElement.desc = row.desc
      this.tempElement.wait_time_out = row.wait_time_out
      this.tempElement.page_id = row.page_id
      this.tempElement.module_id = row.module_id
      this.tempElement.project_id = row.project_id
      this.submitButtonIsShow = true
      this.drawerIsShow = true
    },

    // 获取数据提交给后端
    getProjectForCommit() {
      return {
        id: this.tempElement.id,
        name: this.tempElement.name,
        by: this.tempElement.by,
        element: this.tempElement.element,
        template_device: this.tempElement.template_device,
        desc: this.tempElement.desc,
        wait_time_out: this.tempElement.wait_time_out,
        page_id: this.tempElement.page_id,
        module_id: this.tempElement.module_id,
        project_id: this.tempElement.project_id
      }
    },

    // 新增元素
    addElement() {
      this.submitButtonIsLoading = true
      this.postElementUrl({
        page_id: this.tempElement.page_id,
        module_id: this.tempElement.module_id,
        project_id: this.tempElement.project_id,
        element_list: [this.tempElement]
      }).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
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
    }

  }
}
</script>

<style scoped>

</style>
