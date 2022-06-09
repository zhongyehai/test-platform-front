<template>

  <el-dialog
    title="上传文件"
    :append-to-body="true"
    :visible.sync="fileUploadDialogIsShow"
    :close-on-click-modal="false"
    width="30%">
<!--    :modal-append-to-body="false"-->
    <el-upload
      multiple
      class="upload-demo"
      ref="upload"
      :action="uploadUrl"
      :auto-upload="false"
      :on-change="onChange"
      :on-remove="handleRemove"
      :file-list="tempFileList">
      <el-button size="small" type="primary">选择文件</el-button>
    </el-upload>

    <div style="height: 20px"></div>

    <el-button v-show="tempFileList.length > 0" size="small" type="primary" @click="submitUpload">上传到服务器</el-button>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="fileUploadDialogIsShow = false">关闭</el-button>
    </div>

  </el-dialog>

</template>


<script>
import {uploadApi, fileCheck, filePost} from "@/apis/testWork/file";

export default {
  name: 'uploadFile',
  data() {
    return {

      // 缓存文件列表
      tempFileList: [],

      // 上传接口
      uploadUrl: uploadApi,

      // 上传文件窗口
      fileUploadDialogIsShow: false,

      // 文件类型
      fileType: 'case'
    }
  },

  methods: {

    // 选中文件事件, 检验文件是否已存在
    onChange(file, fileList) {
      // 检验文件是否已存在
      fileCheck({fileType: this.fileType, 'name': file.name}).then(response => {
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
          });
        }
      })
      this.tempFileList = fileList
    },

    // 从缓存中删除文件
    handleRemove(file, fileList, isCover) {
      // 从文件列表点x组件会自动删
      // isCover 为 true，则代表用户选择了不覆盖文件，需要执行删除代码
      if (isCover) {
        fileList.splice(fileList.indexOf(file), 1)
      }
      this.tempFileList = fileList
    },

    // 提交上传的文件到服务器
    submitUpload() {

      // 把文件添加到form
      let form = new FormData()
      form.append('fileType', this.fileType)
      this.tempFileList.forEach(file => {
        form.append('files', file.raw)
      });

      // 上传form到服务器
      filePost(form).then((response) => {
          this.closeDialog(response)
        }
      );
    },

    // 关闭Dialog
    closeDialog(response) {
      if (this.showMessage(this, response)) {
        this.fileUploadDialogIsShow = false
        this.tempFileList = []
        // 发送上传成功的消息
        this.$bus.$emit(this.$busEvents.file.uploadFileIsCommit, true, response.data)
      }
    }
  },

  mounted() {
    // 监听 Dialog 打开事件
    this.$bus.$on(this.$busEvents.file.uploadFileDialogIsShow, (fileType) => {
      this.fileType = fileType
      this.fileUploadDialogIsShow = true
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.file.uploadFileDialogIsShow)
  },
}
</script>

<style scoped>

</style>
