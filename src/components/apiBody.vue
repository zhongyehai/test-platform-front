<template>
  <div>
    <div style="text-align: center">
      <el-radio v-model="tempBodyType" label="form">form-data</el-radio>
      <el-radio v-model="tempBodyType" label="urlencoded">form-urlencoded</el-radio>
      <el-radio v-model="tempBodyType" label="json">json</el-radio>
      <el-radio v-model="tempBodyType" label="text">xml / 文本</el-radio>
      <el-popover class="el_popover_class" placement="top-start" trigger="hover">
        <div>发送请求时会使用此处选择的数据类型</div>
        <el-button slot="reference" type="text" icon="el-icon-question" />
      </el-popover>
    </div>

    <div v-show="tempBodyType === 'form'">
      <dataFormView
        ref="dataFormView"
        :data-form="tempDataForm"
      />
    </div>

    <div v-show="tempBodyType === 'urlencoded'">
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
        :data-json="dataUrlencoded"
      />
    </div>

    <div v-show="tempBodyType === 'json'">
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
        :data-json="dataJson"
      />
    </div>

    <div v-show="tempBodyType === 'text'">
      <el-input v-model="tempDataText" type="textarea" :rows="17" />
    </div>

  </div>

</template>

<script>
import dataFormView from '@/components/Inputs/dataForm'
import jsonEditorView from '@/components/jsonView'

export default {
  name: 'ApiEditBody',
  components: {
    dataFormView,
    jsonEditorView
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'bodyType', 'dataJson', 'dataForm', 'dataText', 'dataUrlencoded'
  ],
  data() {
    return {
      tempBodyType: 'json',
      tempDataJson: {},
      tempDataForm: [],
      tempDataUrlencoded: {},
      tempDataText: null
    }
  },
  watch: {

    'bodyType': {
      handler(newVal, oldVal) {
        this.tempBodyType = newVal || 'json'
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
    }

  },

  created() {
    this.tempBodyType = this.bodyType || 'json'
    this.tempDataJson = JSON.stringify(this.dataJson) || JSON.stringify({})
    this.tempDataUrlencoded = JSON.stringify(this.dataUrlencoded) || JSON.stringify({})
    this.tempDataForm = this.dataForm
    this.tempDataText = this.dataText || null
  },

  methods: {}
}
</script>

<style scoped>

</style>
