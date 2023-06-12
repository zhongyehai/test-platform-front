<template>
  <div>
    <el-button
      type="primary"
      size="mini"
      style="margin-left:20px; float: right"
      @click="formatDataToJson()"
    >格式化
    </el-button>
    <dataJsonView
      ref="dataJsonView"
      :data-json="tempDataJson"
    />
  </div>
</template>

<script>
import dataJsonView from '@/components/Inputs/dataJson'

export default {
  name: 'JsonEditorView',
  components: { dataJsonView },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataJson'
  ],
  data() {
    return {
      tempDataJson: ''
    }
  },

  watch: {
    'dataJson': {
      handler(newVal, oldVal) {
        this.tempDataJson = JSON.stringify(newVal) || JSON.stringify({})
      }
    }
  },

  created() {
    this.tempDataJson = JSON.stringify(this.dataJson) || JSON.stringify({})
  },

  methods: {
    // 格式化json字符串
    formatDataToJson() {
      try {
        this.tempDataJson = JSON.stringify(JSON.parse(this.$refs.dataJsonView.tempDataJson), null, 4)
      } catch (err) {
        this.$message({ showClose: true, message: 'json格式错误', type: 'warning' })
      }
    }
  }
}
</script>

<style scoped>

</style>
