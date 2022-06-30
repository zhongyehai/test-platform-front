<template>
  <div>
    <div style="text-align: center">
      <el-radio v-model="activeName" label="data">form-data</el-radio>
      <el-radio v-model="activeName" label="json">json</el-radio>
      <el-radio v-model="activeName" label="xml">xml</el-radio>
      <el-popconfirm placement="top" hide-icon title="发送请求时会使用此处选择的数据类型">
        <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
      </el-popconfirm>
    </div>

    <div v-show="activeName === 'data'">
      <dataFormView :data-form="tempDataForm" ref="dataFormView"></dataFormView>
    </div>

    <div v-show="activeName === 'json'">
      <!-- 使用示例 -->
      <el-collapse accordion>
        <el-collapse-item>
          <template slot="title">
            <div style="color:#409eff"> 点击查看示例</div>
          </template>
          <div style="margin-left: 20px">
            可以使用自定义函数，也可以使用自定义变量
            <pre>
  {
    "key1": "123",
    "key2": "$extract_name_2",  // 自定义变量（提取的变量）
    "key3": "some_data$extract_name_2",  // 字符串+自定义变量拼接
    "key4": "${do_something()}",  // 自定义函数
    "key5": "${do_something(1, b=2)}",  // 带参数的自定义函数
    "key6": "${do_something($extract_name_1)}",  // 自定义函数传自定义变量为参数
    "key7": "${do_something($extract_name_1, b=$extract_name_2)}",  // 自定义函数指定位置传参
    "key8": "some_data${do_something($extract_name_1, b=$extract_name_2)}",  // 字符串+自定义函数拼接
    "key9": "${do_something($extract_name_1, b=$extract_name_2)}some_data"   // 字符串+自定义函数拼接
  }
  <span style="margin-top: 5px"><span style="color: red">注</span>：不支持 自定义变量+字符串的拼接，如：$extract_name_2some_data</span>
              </pre>
          </div>
        </el-collapse-item>
      </el-collapse>
      <jsonEditorView
          ref="jsonEditorView"
          :dataJson="dataJson"
      ></jsonEditorView>
    </div>

    <div v-show="activeName === 'xml'">
      <el-input v-model="tempDataXml" type="textarea" :rows="17"></el-input>
    </div>

  </div>

</template>

<script>
import dataFormView from "@/components/Inputs/dataForm";
import dataJsonView from "@/components/Inputs/dataJson";
import jsonEditorView from "@/components/jsonView";


export default {
  name: "apiEditBody",
  components: {
    dataFormView,
    dataJsonView,
    jsonEditorView
  },
  props: ['dataType', 'dataJson', 'dataForm', 'dataXml'],
  data() {
    return {
      activeName: 'json',

      // form-data的类型，文本还是文件
      formDataTypes: ['string', 'file'],

      // form-data 的 空数据格式
      formDataFormat: {key: null, data_type: null, remark: null, value: null},

      // 当前上传文件的数据的索引值，上传文件后直接修改
      currentTempApiDataFormIndex: '',

      tempDataType: '',
      tempDataJson: '',
      tempDataForm: '',
      tempDataXml: null,
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.api.apiApiDrawerStatus, (command, api) => {
      this.tempDataType = api.data_type
      this.tempDataJson = JSON.stringify(api.data_json)
      this.tempDataForm = api.data_form
      this.tempDataXml = api.data_xml
    })
  },

  // 组件销毁前，关闭bus监听请求方法选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.api.apiApiDrawerStatus)
  },

  created() {
    this.tempDataType = this.dataType || 'json'
    this.tempDataJson = JSON.stringify(this.dataJson) || JSON.stringify({})
    this.tempDataForm = this.dataForm || [{key: null, data_type: null, remark: null, value: null}]
    this.tempDataXml = this.dataXml || null
  },

  methods: {

    // 格式化json字符串
    formatDataToJson() {
      try {
        this.tempDataJson = JSON.stringify(JSON.parse(this.$refs.dataJsonView.tempDataJson), null, 4)
      } catch (err) {
        this.$notify.error('json格式错误')
      }
    },
  },
  watch: {

    'dataType': {
      handler(newVal, oldVal) {
        this.tempDataType = newVal || 'json'
      }
    },

    'dataJson': {
      handler(newVal, oldVal) {
        this.tempDataJson = JSON.stringify(newVal) || JSON.stringify({})
      }
    },

    'dataForm': {
      handler(newVal, oldVal) {
        this.tempDataForm = newVal || [{key: null, data_type: null, remark: null, value: null}]
      }
    },

    'dataXml': {
      handler(newVal, oldVal) {
        this.tempDataXml = newVal
      }
    },

  }
}
</script>

<style scoped>

</style>
