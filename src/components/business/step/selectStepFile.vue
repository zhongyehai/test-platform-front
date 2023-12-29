<template>
  <el-dialog
    title="选择文件"
    :append-to-body="true"
    :visible.sync="selectDialogIsShow"
    :close-on-click-modal="false"
    width="60%"
  >
    <!-- 选择文件 -->
    <el-form label-width="120px">
      <el-tooltip class="item" effect="dark" content="可覆盖已存在的文件" placement="right-end" style="margin-left: 20px">
        <el-button type="primary" size="mini" @click.native="openFileUploadDialog">上传文件</el-button>
      </el-tooltip>
    </el-form>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      size="mini"
      :data="serverFileList"
      stripe
    >
      <el-table-column prop="id" label="编号" align="center" min-width="5%">
        <template slot-scope="scope">
          <span> {{ (page_num - 1) * page_size + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip prop="name" align="center" label="文件名" min-width="40%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="10%">
        <template slot-scope="scope">
          <!-- 选择文件 -->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            :loading="scope.row.downloadLoadingIsShow"
            @click.native="selectCurrentFile(scope.row.name)"
          >选择</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="page_num"
      :limit.sync="page_size"
      @pagination="getFileList"
    />

    <!-- 上传文件 -->
    <el-dialog
      title="上传文件"
      :append-to-body="true"
      :visible.sync="fileUploadDialogIsShow"
      :close-on-click-modal="false"
      width="30%"
    >
      <!--    :modal-append-to-body="false"-->
      <el-upload
        ref="upload"
        class="upload-demo"
        :action="uploadUrl"
        :auto-upload="false"
        :on-change="onChange"
        :on-remove="handleRemove"
        :file-list="tempFile"
      >
        <el-button size="small" type="primary">选择文件</el-button>
      </el-upload>

      <div style="height: 20px" />

      <el-button v-show="tempFile.length > 0" size="small" type="primary" @click="submitUpload">上传到服务器</el-button>

      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="fileUploadDialogIsShow = false">关闭</el-button>
      </div>

    </el-dialog>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="selectDialogIsShow = false">关闭</el-button>
    </div>
  </el-dialog>

</template>

<script>
import { uploadApi, fileCheck, filePost, fileList } from '@/apis/assist/file'
import Pagination from '@/components/Pagination'

export default {
  name: 'UploadFile',
  components: { Pagination },
  data() {
    return {
      tempFile: [], // 缓存文件列表
      serverFileList: [], // 服务器已有的文件列表
      listLoading: false,
      total: 0,
      page_num: 1,
      page_size: 20,
      uploadUrl: uploadApi, // 上传接口
      selectDialogIsShow: false, // 选择文件窗口
      fileUploadDialogIsShow: false, // 上传文件窗口
      fileType: 'case'// 文件类型
    }
  },

  mounted() {
    // 监听 Dialog 打开事件
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type) => {
      if (_type === 'selectStepFile') {
        this.selectDialogIsShow = true
        if (this.serverFileList.length === 0) {
          // 获取文件列表，让用户选择
          this.getFileList()
        }
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  methods: {

    // 获取文件列表
    getFileList() {
      this.listLoading = true
      fileList({ page_num: this.page_num, page_size: this.page_size, file_type: this.fileType }).then(response => {
        this.listLoading = false
        this.serverFileList = response.data.data
        this.total = response.data.total
      })
    },

    // 选择当前文件
    selectCurrentFile(fileName) {
      this.$bus.$emit(this.$busEvents.drawerIsCommit, 'selectStepFile', fileName)
      this.selectDialogIsShow = false
    },

    // 选中文件事件, 检验文件是否已存在
    onChange(file, fileList) {
      // 检验文件是否已存在
      fileCheck({ file_type: this.fileType, file_name: file.name }).then(response => {
        if (response.message.indexOf('已存在') !== -1) {
          // 确认是否继续上传，不上传则从缓存中删除
          this.$confirm(`${response.message}，是否覆盖?`, '提示', {
            confirmButtonText: '覆盖',
            cancelButtonText: '不覆盖',
            type: 'warning'
          }).then(() => {
          }).catch(() => {
            // 选择不覆盖，则把文件从缓存中删除
            this.handleRemove(file, fileList, true)
          })
        }
      })
      this.tempFile = fileList
    },

    // 从缓存中删除文件
    handleRemove(file, fileList, isCover) {
      // 从文件列表点x组件会自动删
      // isCover 为 true，则代表用户选择了不覆盖文件，需要执行删除代码
      if (isCover) {
        fileList.splice(fileList.indexOf(file), 1)
      }
      this.tempFile = fileList
    },

    // 提交上传的文件到服务器
    submitUpload() {
      // 把文件添加到form
      const form = new FormData()
      form.append('file_type', this.fileType)
      this.tempFile.forEach(file => {
        form.append('files', file.raw)
      })

      // 上传form到服务器
      const loading = this.$loading({ lock: true, text: '文件上传中', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, 0.7)' })
      filePost(form).then((response) => {
        loading.close()
        this.closeDialog(response)
      }
      )
    },

    openFileUploadDialog() {
      this.fileUploadDialogIsShow = true
    },

    // 关闭Dialog
    closeDialog(response) {
      if (this.showMessage(this, response)) {
        this.fileUploadDialogIsShow = false
        this.tempFile = []
        this.getFileList()
      }
    }
  }
}
</script>

<style scoped>

</style>
