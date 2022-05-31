<template>
  <div>
    <el-button
      type="primary"
      size="mini"
      style="margin-left:20px; float: right"
      @click="formatDataToJson()">格式化
    </el-button>
    <dataJsonView
      ref="dataJsonView"
      :dataJson="tempDataJson"
    ></dataJsonView>
  </div>
</template>

<script>
import dataJsonView from "@/components/Inputs/dataJson";

export default {
  name: "jsonEditorView",
  components: {dataJsonView},
  props: ['dataJson'],
  data() {
    return {
      tempDataType: '',
      tempDataJson: '',
    }

  },

  methods: {
    // 格式化json字符串
    formatDataToJson() {
      try {
        this.tempDataJson = JSON.stringify(JSON.parse(this.$refs.dataJsonView.tempDataJson), null, 4)
      } catch (err) {
        this.$message({showClose: true, message: 'json格式错误', type: 'warning'})
      }
    },
  },

  created() {
    this.tempDataJson = JSON.stringify(this.dataJson) || JSON.stringify({})
  },

  watch: {
    'dataJson': {
      handler(newVal, oldVal) {
        this.tempDataJson = JSON.stringify(newVal) || JSON.stringify({})
      }
    }
  }
}
</script>

<style scoped>

</style>
