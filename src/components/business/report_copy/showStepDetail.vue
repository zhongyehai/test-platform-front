<template>
  <div>
    <div v-show="stepData.case_id !== undefined">
      <el-collapse v-model="defaultShowDetailInfo">
        <el-collapse-item v-show="stepData.attachment" name="attachment">
          <template slot="title">
            <div class="el-collapse-item-title"> {{ '错误信息：' }}</div>
          </template>
          <pre class="el-collapse-item-content" style="overflow: auto; color: #FA6E86">{{ stepData.attachment }}</pre>
        </el-collapse-item>

        <el-collapse-item v-show="stepData.validation_results && stepData.validation_results.length > 0" name="validationResults">
          <template slot="title">
            <div class="el-collapse-item-title"> {{ '断言详情：' }}</div>
          </template>
          <div>
            <el-table
              size="mini"
              :data="stepData.validation_results"
              stripe
              style="width: 100%"
              @cell-dblclick="cellDblclick"
            >
              <el-table-column prop="check_value" label="数据源" align="center" min-width="30%">
                <template slot-scope="scope">
                  <span> {{ scope.row.check_value }} </span>
                </template>
              </el-table-column>

              <el-table-column prop="comparator" label="断言方式" align="center" min-width="25%">
                <template slot-scope="scope">
                  <span> {{ scope.row.comparator_str }} </span>
                </template>
              </el-table-column>

              <el-table-column prop="expect" label="预期结果" align="center" min-width="30%">
                <template slot-scope="scope">
                  <span> {{ scope.row.expect }} </span>
                </template>
              </el-table-column>

              <el-table-column prop="check_result" label="断言结果" align="center" min-width="15%">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.check_result === 'pass' ? 'success' : 'danger'">
                    {{ scope.row.check_result === 'pass' ? '通过' : '不通过' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>

        <el-collapse-item v-if="dataType === 'api'" name="apiTestRequest">
          <template slot="title">
            <div class="el-collapse-item-title">请求信息：</div>
          </template>
          <el-collapse v-model="defaultShowRequestInFo" style="margin-left: 10px; margin-right: 10px">

            <el-descriptions class="margin-top" :column="2" border>
              <el-descriptions-item>
                <template slot="label"> 请求方法 </template>
                {{ stepData.request.method }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template slot="label"> 请求地址 </template>
                {{ stepData.request.url }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template slot="label"> 发送时间 </template>
                {{ stepData.stat ? stepData.stat.request_at : '-' }}
              </el-descriptions-item>
            </el-descriptions>

            <el-row>
              <el-col :span="12">
                <el-collapse-item name="request_headers">
                  <template slot="title">
                    <div class="el-collapse-item-title"> {{ '头部参数：' }}</div>
                  </template>
                  <el-row>
                    <el-col :span="16">
                      <div v-if="stepData.request.headers">
                        <JsonViewer
                          :value="strToJson(stepData.request.headers)"
                          :expand-depth="5"
                          copyable
                        />
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <el-button
                        v-if="stepData.request.headers"
                        v-clipboard:copy="getCopyData(stepData.request.headers)"
                        v-clipboard:success="onCopy"
                        v-clipboard:error="onError"
                        size="mini"
                        type="primary"
                      >复制json
                      </el-button>
                      <br>
                      <br>
                      <el-button
                        v-if="Object.keys(stepData.request.headers).length > 0"
                        v-clipboard:copy="getCopyDataAsKV(stepData.request.headers)"
                        v-clipboard:success="onCopy"
                        v-clipboard:error="onError"
                        size="mini"
                        type="primary"
                      >复制为k:v
                      </el-button>
                    </el-col>
                  </el-row>
                </el-collapse-item>
              </el-col>
              <el-col :span="12">
                <el-collapse-item name="request_params">
                  <template slot="title">
                    <div class="el-collapse-item-title"> {{ '查询字符串参数：' }}</div>
                  </template>
                  <el-row>
                    <el-col :span="16">
                      <div v-if="stepData.request.params">
                        <JsonViewer
                          :value="strToJson(stepData.request.params)"
                          :expand-depth="5"
                          copyable
                        />
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <el-button
                        v-if="stepData.request.params"
                        v-clipboard:copy="getCopyData(stepData.request.params)"
                        v-clipboard:success="onCopy"
                        v-clipboard:error="onError"
                        size="mini"
                        type="primary"
                      >复制json
                      </el-button>
                    </el-col>
                  </el-row>
                </el-collapse-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-collapse-item name="request_data">
                  <template slot="title">
                    <div class="el-collapse-item-title"> {{ 'data参数：' }}</div>
                  </template>
                  <el-row v-if=" typeof stepData.request.data === 'object'">
                    <el-col :span="16">
                      <div v-if="stepData.request.data">
                        <JsonViewer
                          :value="strToJson(stepData.request.data)"
                          :expand-depth="5"
                          copyable
                        />
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <el-button
                        v-if="stepData.request.data"
                        v-clipboard:copy="getCopyData(stepData.request.data)"
                        v-clipboard:success="onCopy"
                        v-clipboard:error="onError"
                        size="mini"
                        type="primary"
                      >复制json
                      </el-button>
                      <br>
                      <br>
                      <el-button
                        v-if="Object.keys(stepData.request.data).length > 0"
                        v-clipboard:copy="getCopyDataAsKV(stepData.request.data)"
                        v-clipboard:success="onCopy"
                        v-clipboard:error="onError"
                        size="mini"
                        type="primary"
                      >复制为k:v
                      </el-button>
                    </el-col>
                  </el-row>
                  <el-row v-if=" typeof stepData.request.data === 'string'">
                    <el-col :span="20">
                      <div v-if="stepData.request.data" style="margin-left: 30px">
                        <xmp>{{ formatXml(stepData.request.data) }}</xmp>
                      </div>
                    </el-col>
                    <el-col :span="4">
                      <el-button
                        v-if="stepData.request.data"
                        v-clipboard:copy="formatXml(stepData.request.data)"
                        v-clipboard:success="onCopy"
                        v-clipboard:error="onError"
                        size="mini"
                        type="primary"
                      >复制
                      </el-button>
                    </el-col>
                  </el-row>
                </el-collapse-item>
              </el-col>
              <el-col :span="12">
                <el-collapse-item name="request_file">
                  <template slot="title">
                    <div class="el-collapse-item-title"> {{ '文件参数：' }}</div>
                  </template>
                  <el-row>
                    <el-col :span="16">
                      <div v-if="stepData.request.files">
                        <JsonViewer
                          :value="strToJson(stepData.request.files)"
                          :expand-depth="5"
                          copyable
                        />
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <el-button
                        v-if="stepData.request.files"
                        v-clipboard:copy="getCopyData(stepData.request.files)"
                        v-clipboard:success="onCopy"
                        v-clipboard:error="onError"
                        size="mini"
                        type="primary"
                      >复制
                      </el-button>
                    </el-col>
                  </el-row>
                </el-collapse-item>
              </el-col>
            </el-row>

            <el-collapse-item name="request_json">
              <template slot="title">
                <div class="el-collapse-item-title"> {{ 'json参数：' }}</div>
              </template>
              <el-row>
                <el-col :span="22">
                  <div v-if="stepData.request.json" style="margin-left: 100px">
                    <JsonViewer
                      :value="strToJson(stepData.request.json)"
                      :expand-depth="5"
                      copyable
                    />
                  </div>
                </el-col>
                <el-col :span="2">
                  <el-button
                    v-if="stepData.request.json"
                    v-clipboard:copy="getCopyData(stepData.request.json)"
                    v-clipboard:success="onCopy"
                    v-clipboard:error="onError"
                    size="mini"
                    type="primary"
                  >复制
                  </el-button>
                </el-col>
              </el-row>
            </el-collapse-item>

          </el-collapse>
        </el-collapse-item>

        <el-collapse-item v-if="dataType === 'api'" name="apiTestResponse">
          <template slot="title">
            <div class="el-collapse-item-title">响应信息: </div>
          </template>
          <el-collapse v-model="defaultShowResponseInFo" style="margin-left: 10px; margin-right: 10px">

            <el-descriptions class="margin-top" :column="2" border>
              <el-descriptions-item>
                <template slot="label"> 响应时间 </template>
                {{ stepData.stat ? stepData.stat.response_at : '-' }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template slot="label"> 响应状态码 </template>
                {{ stepData.response.status_code }}
              </el-descriptions-item>
            </el-descriptions>

            <el-collapse-item name="response_text">
              <template slot="title">
                <div class="el-collapse-item-title"> {{ '响应文本：' }}</div>
              </template>
              <!-- 可能返回的是个html文件，<!DOCTYPE 开头-->
              <pre
                v-if="stepData.response.text && stepData.response.text.startsWith('<!DOCTYPE')"
                class="el-collapse-item-content"
                style="overflow: auto"
              >{{ stepData.response.text }}</pre>
              <div v-else class="el-collapse-item-content" v-html="stepData.response.text" />
            </el-collapse-item>

            <el-collapse-item name="response_json">
              <template slot="title">
                <div class="el-collapse-item-title"> {{ '响应json：' }}</div>
              </template>
              <el-row>
                <el-col :span="22">
                  <div v-if="stepData.response.json" style="margin-left: 100px">
                    <JsonViewer
                      :value="strToJson(stepData.response.json)"
                      :expand-depth="5"
                      copyable
                    />
                  </div>
                </el-col>
                <el-col :span="2">
                  <el-button
                    v-if="stepData.response.json"
                    v-clipboard:copy="getCopyData(stepData.response.json)"
                    v-clipboard:success="onCopy"
                    v-clipboard:error="onError"
                    size="mini"
                    type="primary"
                  >复制
                  </el-button>
                </el-col>
              </el-row>
            </el-collapse-item>
          </el-collapse>

        </el-collapse-item>

        <el-collapse-item v-if="dataType !== 'api'" name="uiTestExecuteInfo">
          <template slot="title">
            <div class="el-collapse-item-title">执行信息：</div>
          </template>

          <el-collapse v-model="defaultShowExecuteInFo" style="margin-left: 30px; margin-right: 30px">
            <el-descriptions class="margin-top" :column="2" border>
              <el-descriptions-item>
                <template slot="label"> 执行方式 </template>
                {{ stepData.test_action.execute_name }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template slot="label"> 输入内容 </template>
                {{ stepData.test_action.text }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template slot="label"> 元素定位方式 </template>
                {{ stepData.test_action.by_type }}
              </el-descriptions-item>

              <el-descriptions-item>
                <template slot="label"> 元素定位表达式 </template>
                {{ stepData.test_action.element }}
              </el-descriptions-item>
            </el-descriptions>

            <el-row>
              <el-col :span="12">
                <el-collapse-item name="execute_before_page">
                  <template slot="title">
                    <div class="el-collapse-item-title"> {{ '执行前页面：' }}</div>
                  </template>
                  <div v-loading="beforeImgIsLoading">
                    <el-image
                      v-show="stepData.before"
                      :src="'data:image/jpg;base64,' + stepData.before "
                      :preview-src-list="[
                        'data:image/jpg;base64,' + stepData.before,
                        'data:image/jpg;base64,' + stepData.after
                      ]"
                    />
                    <span v-show="!stepData.before">没有截图</span>
                  </div>
                </el-collapse-item>
              </el-col>
              <el-col :span="12">
                <el-collapse-item name="execute_after_page">
                  <template slot="title">
                    <div class="el-collapse-item-title"> {{ '执行后页面：' }}</div>
                  </template>
                  <div v-loading="afterImgIsLoading">
                    <el-image
                      v-show="stepData.after"
                      :src="'data:image/jpg;base64,' + stepData.after "
                      :preview-src-list="[
                        'data:image/jpg;base64,' + stepData.before,
                        'data:image/jpg;base64,' + stepData.after
                      ]"
                    />
                    <span v-show="!stepData.after">没有截图</span>
                  </div>
                </el-collapse-item>
              </el-col>
            </el-row>
          </el-collapse>

        </el-collapse-item>

        <el-collapse-item name="variablesMapping">
          <template slot="title">
            <div class="el-collapse-item-title"> {{ '执行测试时内存中的公共变量：' }}</div>
          </template>
          <el-row>
            <el-col :span="22">
              <div v-if="stepData.variables_mapping" style="margin-left: 100px">
                <JsonViewer
                  :value="strToJson(stepData.variables_mapping)"
                  :expand-depth="5"
                  copyable
                />
              </div>
            </el-col>
            <el-col :span="2">
              <el-button
                v-if="stepData.variables_mapping"
                v-clipboard:copy="getCopyData(stepData.variables_mapping)"
                v-clipboard:success="onCopy"
                v-clipboard:error="onError"
                size="mini"
                type="primary"
              >复制
              </el-button>
            </el-col>
          </el-row>
        </el-collapse-item>

        <el-collapse-item name="extractMsg">
          <template slot="title">
            <div class="el-collapse-item-title"> {{ '提取数据：' }}</div>
          </template>
          <el-row>
            <el-col :span="22">
              <div v-if="stepData.extract_msgs" style="margin-left: 100px">
                <JsonViewer
                  :value="strToJson(stepData.extract_msgs)"
                  :expand-depth="5"
                  copyable
                />
              </div>
            </el-col>
            <el-col :span="2">
              <el-button
                v-if="stepData.extract_msgs"
                v-clipboard:copy="getCopyData(stepData.extract_msgs)"
                v-clipboard:success="onCopy"
                v-clipboard:error="onError"
                size="mini"
                type="primary"
              >复制
              </el-button>
            </el-col>
          </el-row>
        </el-collapse-item>

        <el-collapse-item name="redirectPrint">
          <template slot="title">
            <div class="el-collapse-item-title"> {{ '脚本print打印信息：' }}</div>
          </template>
          <el-row>
            <el-col :span="22">
              <pre
                class="el-collapse-item-content"
                style="text-align: left; overflow: auto"
              >{{ stepData.redirect_print }}</pre>
            </el-col>
            <el-col :span="2">
              <el-button
                v-if="stepData.redirect_print"
                v-clipboard:copy="getCopyData(stepData.redirect_print)"
                v-clipboard:success="onCopy"
                v-clipboard:error="onError"
                size="mini"
                type="primary"
              >复制
              </el-button>
            </el-col>
          </el-row>

        </el-collapse-item>
      </el-collapse>
    </div>

    <div v-show="stepData.case_id === undefined" class="str">
      请选择步骤
    </div>
  </div>
</template>

<script>

import JsonViewer from 'vue-json-viewer'
import vkbeautify from 'vkbeautify' // xml格式化组件

export default {
  name: 'ShowStep',
  components: {
    JsonViewer
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'stepData', 'beforeImgIsLoading', 'afterImgIsLoading'
  ],

  data() {
    return {
      defaultShowDetailInfo: ['attachment', 'apiTestRequest', 'apiTestResponse', 'uiTestExecuteInfo', 'redirectPrint'], // 默认展开报告详情的项
      defaultShowRequestInFo: ['request_json'], // 接口自动化，请求信息
      defaultShowResponseInFo: ['response_text', 'response_json'], // 接口自动化，响应信息
      defaultShowExecuteInFo: ['execute_before_page', 'execute_after_page'] // UI自动化，执行信息
    }
  },

  methods: {

    formatXml(xml) {
      var text = xml
      if (xml && xml.length > 0) {
        text = vkbeautify.xml(xml)
        // console.log('xml: ', xml)
        // console.log('text: ', text)
      }
      return text
    },

    // 获取复制的内容，如果是字符串，则直接返回，否则转为字符串后返回
    getCopyData(data) {
      if (typeof data === 'string') {
        return data
      }
      return this.jsonToStr(data)
    },

    // 获取复制的内容，返回key:value的字符串，方便直接粘贴到postman调试
    getCopyDataAsKV(data) {
      // console.log(data)
      let str_data = ''
      Object.keys(data).forEach(key => {
        str_data += `${key}:${data[key]}\n`
      })

      return str_data
    },

    // 复制成功
    onCopy(e) {
      this.$message.success('内容已复制到剪贴板')
    },

    // 复制失败
    onError(e) {
      this.$message.error('内容复制失败')
    },

    // 解析字符串为json
    strToJson(str) {
      try {
        return JSON.parse(str)
      } catch (err) {
        return str
      }
    },

    // json转换为字符串
    jsonToStr(jsonObj) {
      try {
        return JSON.stringify(jsonObj, null, 4)
      } catch (err) {
        return jsonObj
      }
    },

    cellDblclick(row, column, cell, event) {
      const that = this
      const data = row[column.property]
      const copy_data = typeof (data) === 'string' ? data : JSON.stringify(data)
      this.$copyText(copy_data).then(
        function(e) {
          that.$message.success('复制成功')
        }
      )
    }

  }
}

</script>

<style scoped>
.el-collapse-item-title {
  font-weight: 600;
  font-size: 15px;
  margin-left: 10px;
  color: #409eff
}
.el-collapse-item-error-title {
  font-weight: 600;
  font-size: 15px;
  margin-left: 10px;
  color: #FA6E86;
}

.el-collapse-item-content {
  text-align: center;
}

.el-main {
  line-height: 36px;
}

.wire {
  border-top: 1px solid #eee;

}

.active {
  background: #f7f7f7;
  font-weight: 600;
}

.case-name {
  display: inline-block;
  word-break: break-all;
  font-size: 14px;
  width: 100% !important;
}

.test-name {
  display: inline-block;
  word-break: break-all;
  font-size: 16px;
  width: 100% !important;
}

.test-status {
  text-transform: capitalize;
  font-size: 13px;
  float: right !important;
  margin-right: 20px;
}

.step-operate {
  text-transform: capitalize;
  font-size: 13px;
  float: right !important;
  margin-right: 20px;
}

.grid-content {
  min-height: 36px;
}

.content {
  height: auto;
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
  border-bottom: 1px solid #d0d0d0;
}

/* 用例名文字描述 */
/deep/ .el-collapse-item__header {
  /*height: 40px;*/
  /*line-height: 25px;*/
  line-height: 150%;
  height: auto;
  padding: 10px 0;
}

.str {
  font-size: 30px;
  text-align: center;
  margin-top: 10%;
}
</style>
