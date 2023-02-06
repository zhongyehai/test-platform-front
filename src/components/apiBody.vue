<template>
  <div>
    <div style="text-align: center">
      <el-radio v-model="tempDataType" label="form">form-data</el-radio>
      <el-radio v-model="tempDataType" label="urlencoded">form-urlencoded</el-radio>
      <el-radio v-model="tempDataType" label="json">json</el-radio>
      <el-radio v-model="tempDataType" label="text">xml / 文本</el-radio>
      <el-popover class="el_popover_class" placement="top-start" trigger="hover">
        <div>发送请求时会使用此处选择的数据类型</div>
        <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
      </el-popover>
    </div>

    <div v-show="tempDataType === 'form'">
      <dataFormView
        ref="dataFormView"
        :data-form="tempDataForm"
      ></dataFormView>
    </div>

    <div v-show="tempDataType === 'urlencoded'">
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
          ref="urlencodedEditorView"
          :dataJson="dataUrlencoded"
      ></jsonEditorView>
    </div>

    <div v-show="tempDataType === 'json'">
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

    <div v-show="tempDataType === 'text'">
      <el-input v-model="tempDataText" type="textarea" :rows="17"></el-input>
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
  props: ['dataType', 'dataJson', 'dataForm', 'dataText', 'dataUrlencoded'],
  data() {
    return {
      tempDataType: 'json',
      tempDataJson: {},
      tempDataForm: [],
      tempDataUrlencoded: {},
      tempDataText: null,
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (command, api) => {
      this.tempDataType = api.data_type
      this.tempDataJson = JSON.stringify(api.data_json)
      this.tempDataForm = api.data_form
      this.tempDataUrlencoded = JSON.stringify(api.data_urlencoded)
      this.tempDataText = api.data_text
    })
  },

  // 组件销毁前，关闭bus监听请求方法选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  created() {
    this.tempDataType = this.dataType || 'json'
    this.tempDataJson = JSON.stringify(this.dataJson) || JSON.stringify({})
    this.tempDataUrlencoded = JSON.stringify(this.dataUrlencoded) || JSON.stringify({})
    this.tempDataForm = this.dataForm
    this.tempDataText = this.dataText || null
  },

  methods: {},
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

    'dataUrlencoded': {
      handler(newVal, oldVal) {
        this.tempDataUrlencoded = JSON.stringify(newVal) || JSON.stringify({})
      }
    },

    'dataForm': {
      handler(newVal, oldVal) {
        this.tempDataForm = newVal
      }
    },

    'dataText': {
      handler(newVal, oldVal) {
        this.tempDataText = newVal
      }
    },

  }
}
</script>

<style scoped>

</style>
