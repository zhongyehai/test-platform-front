<template>

  <div class="app-container">
    <el-row>
      <el-col :span="11" style="float: left">
        <div style="margin-bottom: 20px; text-align: center; font-size: 25px; color: #fb015b">token字符串</div>
        <el-input v-model="tokenStr" size="mini" type="textarea" rows="20" :placeholder="'token字符串'" />
        <div v-show="errorMsg" style="padding-top: 10px; color: red">
          <span> {{ errorMsg }}</span>
        </div>
      </el-col>

      <el-col :span="11" style="float: right">
        <div style="margin-bottom: 20px; text-align: center; font-size: 25px; color: #fb015b">解析后的内容</div>

        <div style="font-size: 14px; color: #d63aff">HEADER</div>
        <json-viewer
          :value="parsedToken.header"
          :expand-depth="5"
          copyable
          boxed
          sort
        />

        <div style="margin-top: 20px; font-size: 14px; color: #00b9f1">PAYLOAD</div>
        <json-viewer
          :value="parsedToken.payload"
          :expand-depth="5"
          copyable
          boxed
          sort
        >
          <template v-slot:copy>
            <el-button
              v-clipboard:copy="getCopyData(parsedToken.payload)"
              v-clipboard:success="onCopy"
              v-clipboard:error="onError"
              style="margin-top: 20px; float:right"
              size="mini"
              type="primary"
            >复制
            </el-button>
          </template>
        </json-viewer>

      </el-col>

    </el-row>

  </div>

</template>

<script>

export default {
  name: 'Token',
  data() {
    return {
      tokenStr: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6Ilx1N2JhMVx1NzQwNlx1NTQ1OCIsInJvbGVfbGlzdCI6WzEsMl0sImFwaV9wZXJtaXNzaW9ucyI6WyJhZG1pbiJdLCJidXNpbmVzc19saXN0IjpbMV0sImV4cCI6MTcwMjU1MTk5NS4yOTMzOTN9.lqJk2M-43D6Mqs3izacxwdQdMqE-DMTY1O30U35itZM',
      errorMsg: undefined,
      buttonIsLoading: false
    }
  },

  computed: {
    parsedToken: function() {
      try {
        const stringList = this.tokenStr.split('.')
        const parsed = {
          header: this.parseData(stringList[0]),
          payload: this.parseData(stringList[1])
        }
        this.errorMsg = undefined
        return parsed
      } catch (e) {
        this.errorMsg = ' * 无法解析，请检查token是否正确'
        return {
          header: {},
          payload: {}
        }
      }
    }
  },

  methods: {

    parseData(data) {
      return JSON.parse(decodeURIComponent(escape(window.atob(data.replace(/-/g, '+').replace(/_/g, '/')))))
    },

    // 复制成功
    onCopy(e) {
      this.$message.success('内容已复制到剪贴板')
    },

    // 复制失败
    onError(e) {
      this.$message.error('内容复制失败')
    },

    // 获取复制的内容，如果是字符串，则直接返回，否则转为字符串后返回
    getCopyData(data) {
      if (typeof data === 'string') {
        return data
      }
      return this.jsonToStr(data)
    },

    // json转换为字符串
    jsonToStr(jsonObj) {
      try {
        return JSON.stringify(jsonObj, null, 4)
      } catch (err) {
        return jsonObj
      }
    }
  }
}
</script>

<style scoped>

</style>
