<template>
  <div style="border:1px solid rgb(234, 234, 234) ">
    <el-container>
      <editor
        ref="jsonEditor"
        v-model="tempDataJson"
        style="font-size: 15px"
        lang="json"
        theme="chrome"
        width="100%"
        :height="tableHeight + 'px'"
        :options="editorOptions"
        @init="initJsonEditor"
      />
    </el-container>
  </div>

</template>

<script>

export default {
  name: 'DataJson',
  components: {
    editor: require('vue2-ace-editor')
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataJson'
  ],
  data() {
    return {
      tableHeight: 500,
      tempDataJson: '{}',
      editorOptions: {
        // 设置代码编辑器的样式
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        tabSize: 2,
        showPrintMargin: false // 去除编辑器里的竖线
      }
    }
  },
  watch: {
    'dataJson': {
      handler(newVal, oldVal) {
        this.tempDataJson = this.jsonToObj(newVal)
      }
    }
  },

  created() {
    this.tableHeight = window.innerHeight * 0.55
    this.tempDataJson = this.jsonToObj(this.dataJson)
  },

  methods: {
    // 初始化 json 编辑器
    initJsonEditor() {
      require('brace/ext/language_tools')
      require('brace/mode/json')
      require('brace/theme/chrome')
      require('brace/snippets/json')
    },

    jsonToObj(data) {
      try {
        return JSON.stringify(JSON.parse(data), null, 4)
      } catch (e) {
        this.$notify.error('json格式错误')
        return data
      }
    }
  }
}
</script>

<style scoped>

</style>
