<template>

  <div>

    <!-- 结构树/页面列表 -->
    <el-tabs v-model="pageTab" class="table_padding">

      <!-- 页面列表 -->
      <el-tab-pane label="页面列表" name="pageList">

        <el-table
          ref="pageListTable"
          v-loading="tableLoadingIsShow"
          element-loading-text="正在排序中"
          element-loading-spinner="el-icon-loading"
          :data="pageList"
          row-key="id"
          stripe
          @cell-dblclick="cellDblclick"
        >
          <el-table-column prop="num" label="序号" align="center" min-width="10%">
            <template slot-scope="scope">
              <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip="true" prop="name" align="center" label="页面名称" min-width="20%">
            <template slot-scope="scope">
              <span> {{ scope.row.name }} </span>
            </template>
          </el-table-column>

          <el-table-column
            v-if="dataType==='webUi'"
            :show-overflow-tooltip="true"
            prop="addr"
            align="center"
            min-width="50%"
          >
            <template slot="header">
              <el-tooltip
                class="item"
                effect="dark"
                placement="top-start"
              >
                <div slot="content">
                  <div>在页面元素处新增/修改地址（定位方式为【页面地址】）后，会自动同步到此处</div>
                </div>
                <span> 页面地址 <i style="color: #409EFF" class="el-icon-warning" /></span>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <span> {{ scope.row.addr || '未设置' }} </span>
            </template>
          </el-table-column>

          <!--          <el-table-column :show-overflow-tooltip=true prop="create_user" align="center" label="创建者" min-width="10%">-->
          <!--            <template slot-scope="scope">-->
          <!--              <span>{{ parseUser(scope.row.create_user) }}</span>-->
          <!--            </template>-->
          <!--          </el-table-column>-->

          <!--          <el-table-column :show-overflow-tooltip=true prop="create_user" align="center" label="最后修改人" min-width="12%">-->
          <!--            <template slot-scope="scope">-->
          <!--              <span>{{ parseUser(scope.row.update_user) }}</span>-->
          <!--            </template>-->
          <!--          </el-table-column>-->

          <el-table-column label="操作" align="center" min-width="20%">
            <template slot-scope="scope">

              <!--修改页面-->
              <el-button
                type="text"
                size="mini"
                style="margin-right: 8px"
                @click="showEditForm(scope.row)"
              >修改
              </el-button>

              <!-- 复制页面 -->
              <el-popover
                :ref="scope.row.id"
                v-model="scope.row.copyPopoverIsShow"
                placement="top"
                style="margin-right: 10px"
                popper-class="down-popover"
              >
                <p>复制此页面并生成新的页面?</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="cancelCopyPopover(scope.row)">取消</el-button>
                  <el-button type="primary" size="mini" @click="clickCopyPage(scope.row)">确定</el-button>
                </div>
                <el-button
                  slot="reference"
                  type="text"
                  size="mini"
                >复制页面</el-button>
              </el-popover>

              <!--上传元素-->
              <el-button
                type="text"
                size="mini"
                style="margin-right: 8px"
                @click="showUploadFileDialog(scope.row)"
              >导入元素
              </el-button>

              <!-- 删除页面 -->
              <el-popover
                :ref="scope.row.id"
                v-model="scope.row.deletePopoverIsShow"
                placement="top"
                popper-class="down-popover"
              >
                <p>确定删除【{{ scope.row.name }}】?</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
                  <el-button type="primary" size="mini" @click="delPage(scope.row)">确定</el-button>
                </div>
                <el-button
                  slot="reference"
                  style="color: red"
                  type="text"
                  size="mini"
                  :loading="scope.row.isShowDeleteLoading"
                >删除</el-button>
              </el-popover>
            </template>
          </el-table-column>

        </el-table>

        <el-drawer
          :title="'上传元素'"
          size="40%"
          :wrapper-closable="false"
          :visible.sync="uploadFileDrawerIsShow"
          :direction="direction"
        >
          <el-row style="margin-left: 20px;margin-right: 20px">
            <el-col :span="12">
              <el-upload
                class="upload-demo"
                :action="uploadElementDirUrl"
                :show-file-list="false"
                :on-success="uploadFile"
              >
                <el-button size="mini" type="primary">选择文件</el-button>
              </el-upload>
            </el-col>

            <el-col :span="12">
              <el-button size="mini" type="primary" style="float: right" @click="downloadTemplate">下载模板</el-button>
            </el-col>
          </el-row>
          <div class="demo-drawer__footer">
            <el-button size="small" @click="uploadFileDrawerIsShow = false">关闭</el-button>
          </div>
        </el-drawer>

        <pagination
          v-show="pageTotal>0"
          :total="pageTotal"
          :page.sync="pageNum"
          :limit.sync="pageSize"
          @pagination="getPageList"
        />
      </el-tab-pane>

    </el-tabs>

    <editPageDrawer
      :data-type="dataType"
      :current-project="currentProject"
      :current-project-id="currentProjectId"
      :current-module-id="currentModuleId"
    />

    <addPageDrawer
      :data-type="dataType"
      :current-project-id="currentProjectId"
      :current-module-id="currentModuleId"
    />

  </div>
</template>

<script>
import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'

import editPageDrawer from '@/components/business/page/editPageDrawer.vue'
import addPageDrawer from '@/components/business/page/addPageDrawer.vue'

import { getFindElementOption } from '@/utils/getConfig'

import { pageList as appPageList, deletePage as appDeletePage, pageSort as appPageSort } from '@/apis/appUiTest/page'
import {
  uploadElement as appUploadElement,
  uploadElementDir as appUploadElementDir,
  downloadElementTemplate as appDownloadElementTemplate
} from '@/apis/appUiTest/element'

import {
  pageList as webUiPageList,
  deletePage as webUiDeletePage,
  pageSort as webUiPageSort
} from '@/apis/webUiTest/page'
import {
  uploadElement as webUiUploadElement,
  uploadElementDir as webUiUploadElementDir,
  downloadElementTemplate as webUiDownloadElementTemplate
} from '@/apis/webUiTest/element'

export default {
  name: 'Index',
  components: {
    Pagination,
    editPageDrawer,
    addPageDrawer
  },

  // 接收父组件传参的key
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType'
  ],
  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      tableLoadingIsShow: false, // 请求列表等待响应的状态
      pageTab: 'pageList', //  tab页的显示

      currentModuleId: '',
      currentProjectId: '',
      currentProject: '',

      // 页面数据列表
      pageNum: 1,
      pageSize: 20,
      pageTotal: 0,
      pageList: [],

      // 文件上传框打开状态
      uploadElementDirUrl: '',
      uploadFileDrawerIsShow: false,
      fileDataList: [],
      currentPage: '',

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],

      pageListUrl: '',
      deletePageUrl: '',
      pageSortUrl: '',
      uploadElementUrl: '',
      downloadElementTemplateUrl: ''

    }
  },

  created() {
    if (this.dataType === 'appUi') {
      this.pageListUrl = appPageList
      this.deletePageUrl = appDeletePage
      this.pageSortUrl = appPageSort
      this.uploadElementUrl = appUploadElement
      this.uploadElementDirUrl = appUploadElementDir
      this.downloadElementTemplateUrl = appDownloadElementTemplate
    } else {
      this.pageListUrl = webUiPageList
      this.deletePageUrl = webUiDeletePage
      this.pageSortUrl = webUiPageSort
      this.uploadElementUrl = webUiUploadElement
      this.uploadElementDirUrl = webUiUploadElementDir
      this.downloadElementTemplateUrl = webUiDownloadElementTemplate
    }

    getFindElementOption(this, this.dataType) // 获取定位方式

    this.oldList = this.pageList.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  mounted() {
    // 点击树时，请求对应的页面列表
    this.$bus.$on(this.$busEvents.treeIsChoice, (_type, moduleId, projectId, project) => {
      if (_type === 'module') {
        this.currentModuleId = moduleId
        this.currentProjectId = projectId
        this.currentProject = project
        this.getPageList()
      }
    })

    // 页面抽屉提交成功、元素为url，则重新请求页面列表
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type) => {
      if (['pageInfo', 'elementIsUrl'].indexOf(_type) !== -1) {
        this.getPageList()
      }
    })
  },

  // 页面销毁的时候，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
    this.$bus.$off(this.$busEvents.treeIsChoice)
  },

  methods: {

    // 双击单元格复制
    cellDblclick(row, column, cell, event) {
      const that = this
      const data = row[column.property]
      this.$copyText(typeof (data) === 'string' ? data : JSON.stringify(data)).then(
        function(e) {
          that.$message.success('复制成功')
        }
      )
    },

    // 打开编辑框
    showEditForm(row) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'pageInfo', 'edit', JSON.parse(JSON.stringify(row)))
    },

    cancelCopyPopover(row) {
      this.$set(row, 'copyPopoverIsShow', false)
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    // 从excel导入接口
    showUploadFileDialog(row) {
      this.uploadFileDrawerIsShow = true
      this.currentPage = row
    },

    // 删除页面
    delPage(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'isShowDeleteLoading', true)
      this.deletePageUrl({ 'id': row.id }).then(response => {
        this.$set(row, 'isShowDeleteLoading', false)
        if (this.showMessage(this, response)) {
          this.getPageList()
        }
      })
    },

    // 复制页面
    clickCopyPage(page) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'pageInfo', 'copy', JSON.parse(JSON.stringify(page)))
      this.$set(page, 'copyPopoverIsShow', false)
    },

    // 根据模块内容获取页面列表
    getPageList(params) {
      this.tableLoadingIsShow = true
      this.pageListUrl({
        'moduleId': this.currentModuleId,
        'pageNum': this.pageNum,
        'pageSize': this.pageSize
      }).then(response => {
        this.pageList = response.data.data
        this.pageTotal = response.data.total

        this.oldList = this.pageList.map(v => v.id)
        this.newList = this.oldList.slice()
      })
      this.tableLoadingIsShow = false
    },

    // 下载接口模板
    downloadTemplate() {
      this.downloadElementTemplateUrl().then(response => {
        const blob = new Blob([response], {
          type: 'application/vnd.ms-excel' // 将会被放入到blob中的数组内容的MIME类型
        })
        // 保存文件到本地
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob) // 生成一个url
        a.download = '元素导入模板'
        a.click()
      })
    },

    // 从excel导入元素
    uploadFile(response, file) {
      const form = new FormData()
      form.append('file', file.raw)
      form.append('id', this.currentPage.id)
      this.uploadElementUrl(form).then((response) => {
        if (this.showMessage(this, response)) {
          this.fileDataList = []
          this.uploadFileDrawerIsShow = false
        }
      }
      )
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.pageListTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.pageList.splice(evt.oldIndex, 1)[0]
          this.pageList.splice(evt.newIndex, 0, targetRow)
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          this.pageSortUrl({
            List: this.newList,
            pageNum: this.pageNum,
            pageSize: this.pageSize
          }).then(response => {
            this.showMessage(this, response)
            this.tableLoadingIsShow = false
          })
        }
      })
    }
  }
}
</script>

<style>

</style>
