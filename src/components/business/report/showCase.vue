<template>
  <div>

    <!--    {{ caseData }}-->
    <!--    <br>-->
    <!--    <br>-->

    <el-descriptions class="margin-top" :column="2" border>
      <el-descriptions-item>
        <template slot="label"> 用例名 </template>
        {{ caseData.name }}
      </el-descriptions-item>

      <el-descriptions-item>
        <template slot="label"> 执行状态 </template>
        {{ caseData.result }}
      </el-descriptions-item>

      <el-descriptions-item>
        <template slot="label"> 错误信息 </template>
        {{ caseData.error_msg }}
      </el-descriptions-item>
    </el-descriptions>

    <div style="margin-top: 20px">
      变量：
      <div>
        {{ JSON.parse(caseData.case_data).variables }}
      </div>
    </div>

    <div style="margin-top: 20px">
      头部信息：
      <div>
        {{ JSON.parse(caseData.case_data).headers }}
      </div>
    </div>

    <!--    <el-descriptions class="margin-top" :column="2" border>-->
    <!--      <div v-for="(value, key) in JSON.parse(caseData.case_data).variables" :key="key">-->
    <!--        <el-descriptions-item>-->
    <!--          <template slot="label"> 变量key </template>-->
    <!--          {{ key }}-->
    <!--        </el-descriptions-item>-->
    <!--        <el-descriptions-item>-->
    <!--          <template slot="label"> 变量value </template>-->
    <!--          {{ value }}-->
    <!--        </el-descriptions-item>-->
    <!--      </div>-->
    <!--    </el-descriptions>-->

    <!--    <el-table-->
    <!--      :data="JSON.parse(caseData.case_data).variables"-->
    <!--      stripe-->
    <!--      style="width: 100%"-->
    <!--    >-->
    <!--      <el-table-column prop="check_value" label="数据源" align="center" min-width="30%">-->
    <!--        <template slot-scope="scope">-->
    <!--          <span> {{ scope.row }} </span>-->
    <!--        </template>-->
    <!--      </el-table-column>-->

    <!--      <el-table-column prop="comparator" label="断言方式" align="center" min-width="25%">-->
    <!--        <template slot-scope="scope">-->
    <!--          <span> {{ scope.row }} </span>-->
    <!--        </template>-->
    <!--      </el-table-column>-->

    <!--      <el-table-column prop="expect" label="预期结果" align="center" min-width="30%">-->
    <!--        <template slot-scope="scope">-->
    <!--          <span> {{ scope.row }} </span>-->
    <!--        </template>-->
    <!--      </el-table-column>-->

    <!--    </el-table>-->

    <!--      <el-collapse v-model="defaultShowDetailInfo">-->
    <!--        <el-collapse-item v-show="stepData.attachment" name="01">-->
    <!--          <template slot="title">-->
    <!--            <div class="el-collapse-item-title"> {{ '备注信息：' }}</div>-->
    <!--          </template>-->
    <!--          <pre class="el-collapse-item-content" style="overflow: auto">{{ stepData.attachment }}</pre>-->
    <!--        </el-collapse-item>-->

    <!--        <el-collapse-item v-show="stepData.validation_results && stepData.validation_results.length > 0" name="02">-->
    <!--          <template slot="title">-->
    <!--            <div class="el-collapse-item-title"> {{ '断言详情：' }}</div>-->
    <!--          </template>-->
    <!--          <div>-->
    <!--            <el-table-->
    <!--              :data="stepData.validation_results"-->
    <!--              stripe-->
    <!--              style="width: 100%"-->
    <!--              @cell-dblclick="cellDblclick"-->
    <!--            >-->
    <!--              <el-table-column prop="check_value" label="数据源" align="center" min-width="30%">-->
    <!--                <template slot-scope="scope">-->
    <!--                  <span> {{ scope.row.check_value }} </span>-->
    <!--                </template>-->
    <!--              </el-table-column>-->

    <!--              <el-table-column prop="comparator" label="断言方式" align="center" min-width="25%">-->
    <!--                <template slot-scope="scope">-->
    <!--                  <span> {{ scope.row.comparator_str }} </span>-->
    <!--                </template>-->
    <!--              </el-table-column>-->

    <!--              <el-table-column prop="expect" label="预期结果" align="center" min-width="30%">-->
    <!--                <template slot-scope="scope">-->
    <!--                  <span> {{ scope.row.expect }} </span>-->
    <!--                </template>-->
    <!--              </el-table-column>-->

    <!--              <el-table-column prop="check_result" label="断言结果" align="center" min-width="15%">-->
    <!--                <template slot-scope="scope">-->
    <!--                  <el-tag :type="scope.row.check_result === 'pass' ? 'success' : 'danger'">-->
    <!--                    {{ scope.row.check_result === 'pass' ? '通过' : '不通过' }}-->
    <!--                  </el-tag>-->
    <!--                </template>-->
    <!--              </el-table-column>-->
    <!--            </el-table>-->
    <!--          </div>-->
    <!--        </el-collapse-item>-->

    <!--        <el-collapse-item v-if="dataType === 'api'" name="03">-->
    <!--          <template slot="title">-->
    <!--            <div class="el-collapse-item-title">请求信息：</div>-->
    <!--          </template>-->
    <!--          <el-collapse v-model="defaultShowRequestInFo" style="margin-left: 30px; margin-right: 30px">-->

    <!--            -->

    <!--            <el-row>-->
    <!--              <el-col :span="12">-->
    <!--                <el-collapse-item name="request_01">-->
    <!--                  <template slot="title">-->
    <!--                    <div class="el-collapse-item-title"> {{ '头部参数：' }}</div>-->
    <!--                  </template>-->
    <!--                  <el-row>-->
    <!--                    <el-col :span="20">-->
    <!--                      <div v-if="stepData.request.headers" style="margin-left: 30px">-->
    <!--                        <JsonViewer-->
    <!--                          :value="strToJson(stepData.request.headers)"-->
    <!--                          :expand-depth="5"-->
    <!--                          copyable-->
    <!--                        />-->
    <!--                      </div>-->
    <!--                    </el-col>-->
    <!--                    <el-col :span="4">-->
    <!--                      <el-button-->
    <!--                        v-if="stepData.request.headers"-->
    <!--                        v-clipboard:copy="getCopyData(stepData.request.headers)"-->
    <!--                        v-clipboard:success="onCopy"-->
    <!--                        v-clipboard:error="onError"-->
    <!--                        size="mini"-->
    <!--                        type="primary"-->
    <!--                      >复制-->
    <!--                      </el-button>-->
    <!--                    </el-col>-->
    <!--                  </el-row>-->
    <!--                </el-collapse-item>-->
    <!--              </el-col>-->
    <!--              <el-col :span="12">-->
    <!--                <el-collapse-item name="request_02">-->
    <!--                  <template slot="title">-->
    <!--                    <div class="el-collapse-item-title"> {{ '查询字符串参数：' }}</div>-->
    <!--                  </template>-->
    <!--                  <el-row>-->
    <!--                    <el-col :span="20">-->
    <!--                      <div v-if="stepData.request.params" style="margin-left: 30px">-->
    <!--                        <JsonViewer-->
    <!--                          :value="strToJson(stepData.request.params)"-->
    <!--                          :expand-depth="5"-->
    <!--                          copyable-->
    <!--                        />-->
    <!--                      </div>-->
    <!--                    </el-col>-->
    <!--                    <el-col :span="4">-->
    <!--                      <el-button-->
    <!--                        v-if="stepData.request.params"-->
    <!--                        v-clipboard:copy="getCopyData(stepData.request.params)"-->
    <!--                        v-clipboard:success="onCopy"-->
    <!--                        v-clipboard:error="onError"-->
    <!--                        size="mini"-->
    <!--                        type="primary"-->
    <!--                      >复制-->
    <!--                      </el-button>-->
    <!--                    </el-col>-->
    <!--                  </el-row>-->
    <!--                </el-collapse-item>-->
    <!--              </el-col>-->
    <!--            </el-row>-->

    <!--            <el-row>-->
    <!--              <el-col :span="12">-->
    <!--                <el-collapse-item name="request_03">-->
    <!--                  <template slot="title">-->
    <!--                    <div class="el-collapse-item-title"> {{ 'data参数：' }}</div>-->
    <!--                  </template>-->
    <!--                  <el-row v-if=" typeof stepData.request.data === 'object'">-->
    <!--                    <el-col :span="20">-->
    <!--                      <div v-if="stepData.request.data" style="margin-left: 30px">-->
    <!--                        <JsonViewer-->
    <!--                          :value="strToJson(stepData.request.data)"-->
    <!--                          :expand-depth="5"-->
    <!--                          copyable-->
    <!--                        />-->
    <!--                      </div>-->
    <!--                    </el-col>-->
    <!--                    <el-col :span="4">-->
    <!--                      <el-button-->
    <!--                        v-if="stepData.request.data"-->
    <!--                        v-clipboard:copy="getCopyData(stepData.request.data)"-->
    <!--                        v-clipboard:success="onCopy"-->
    <!--                        v-clipboard:error="onError"-->
    <!--                        size="mini"-->
    <!--                        type="primary"-->
    <!--                      >复制-->
    <!--                      </el-button>-->
    <!--                    </el-col>-->
    <!--                  </el-row>-->
    <!--                  <el-row v-if=" typeof stepData.request.data === 'string'">-->
    <!--                    <el-col :span="20">-->
    <!--                      <div v-if="stepData.request.data" style="margin-left: 30px">-->
    <!--                        <xmp>{{ formatXml(stepData.request.data) }}</xmp>-->
    <!--                      </div>-->
    <!--                    </el-col>-->
    <!--                    <el-col :span="4">-->
    <!--                      <el-button-->
    <!--                        v-if="stepData.request.data"-->
    <!--                        v-clipboard:copy="formatXml(stepData.request.data)"-->
    <!--                        v-clipboard:success="onCopy"-->
    <!--                        v-clipboard:error="onError"-->
    <!--                        size="mini"-->
    <!--                        type="primary"-->
    <!--                      >复制-->
    <!--                      </el-button>-->
    <!--                    </el-col>-->
    <!--                  </el-row>-->
    <!--                </el-collapse-item>-->
    <!--              </el-col>-->
    <!--              <el-col :span="12">-->
    <!--                <el-collapse-item name="request_04">-->
    <!--                  <template slot="title">-->
    <!--                    <div class="el-collapse-item-title"> {{ '文件参数：' }}</div>-->
    <!--                  </template>-->
    <!--                  <el-row>-->
    <!--                    <el-col :span="20">-->
    <!--                      <div v-if="stepData.request.files" style="margin-left: 100px">-->
    <!--                        <JsonViewer-->
    <!--                          :value="strToJson(stepData.request.files)"-->
    <!--                          :expand-depth="5"-->
    <!--                          copyable-->
    <!--                        />-->
    <!--                      </div>-->
    <!--                    </el-col>-->
    <!--                    <el-col :span="4">-->
    <!--                      <el-button-->
    <!--                        v-if="stepData.request.files"-->
    <!--                        v-clipboard:copy="getCopyData(stepData.request.files)"-->
    <!--                        v-clipboard:success="onCopy"-->
    <!--                        v-clipboard:error="onError"-->
    <!--                        size="mini"-->
    <!--                        type="primary"-->
    <!--                      >复制-->
    <!--                      </el-button>-->
    <!--                    </el-col>-->
    <!--                  </el-row>-->
    <!--                </el-collapse-item>-->
    <!--              </el-col>-->
    <!--            </el-row>-->

    <!--            <el-collapse-item name="request_05">-->
    <!--              <template slot="title">-->
    <!--                <div class="el-collapse-item-title"> {{ 'json参数：' }}</div>-->
    <!--              </template>-->
    <!--              <el-row>-->
    <!--                <el-col :span="22">-->
    <!--                  <div v-if="stepData.request.json" style="margin-left: 100px">-->
    <!--                    <JsonViewer-->
    <!--                      :value="strToJson(stepData.request.json)"-->
    <!--                      :expand-depth="5"-->
    <!--                      copyable-->
    <!--                    />-->
    <!--                  </div>-->
    <!--                </el-col>-->
    <!--                <el-col :span="2">-->
    <!--                  <el-button-->
    <!--                    v-if="stepData.request.json"-->
    <!--                    v-clipboard:copy="getCopyData(stepData.request.json)"-->
    <!--                    v-clipboard:success="onCopy"-->
    <!--                    v-clipboard:error="onError"-->
    <!--                    size="mini"-->
    <!--                    type="primary"-->
    <!--                  >复制-->
    <!--                  </el-button>-->
    <!--                </el-col>-->
    <!--              </el-row>-->
    <!--            </el-collapse-item>-->

    <!--          </el-collapse>-->
    <!--        </el-collapse-item>-->

    <!--        <el-collapse-item v-if="dataType === 'api'" name="04">-->
    <!--          <template slot="title">-->
    <!--            <div class="el-collapse-item-title">响应信息: </div>-->
    <!--          </template>-->
    <!--          <el-collapse v-model="defaultShowResponseInFo" style="margin-left: 30px; margin-right: 30px">-->

    <!--            <el-descriptions class="margin-top" :column="2" border>-->
    <!--              <el-descriptions-item>-->
    <!--                <template slot="label"> 响应时间 </template>-->
    <!--                {{ stepData.stat ? stepData.stat.response_at : '-' }}-->
    <!--              </el-descriptions-item>-->

    <!--              <el-descriptions-item>-->
    <!--                <template slot="label"> 响应状态码 </template>-->
    <!--                {{ stepData.response.status_code }}-->
    <!--              </el-descriptions-item>-->
    <!--            </el-descriptions>-->
    <!--            <el-collapse-item name="response_01">-->
    <!--              <template slot="title">-->
    <!--                <div class="el-collapse-item-title"> {{ '响应文本：' }}</div>-->
    <!--              </template>-->
    <!--              <div class="el-collapse-item-content" v-html="stepData.response.text" />-->
    <!--            </el-collapse-item>-->

    <!--            <el-collapse-item name="response_02">-->
    <!--              <template slot="title">-->
    <!--                <div class="el-collapse-item-title"> {{ '响应json：' }}</div>-->
    <!--              </template>-->
    <!--              <el-row>-->
    <!--                <el-col :span="22">-->
    <!--                  <div v-if="stepData.response.json" style="margin-left: 100px">-->
    <!--                    <JsonViewer-->
    <!--                      :value="strToJson(stepData.response.json)"-->
    <!--                      :expand-depth="5"-->
    <!--                      copyable-->
    <!--                    />-->
    <!--                  </div>-->
    <!--                </el-col>-->
    <!--                <el-col :span="2">-->
    <!--                  <el-button-->
    <!--                    v-if="stepData.response.json"-->
    <!--                    v-clipboard:copy="getCopyData(stepData.response.json)"-->
    <!--                    v-clipboard:success="onCopy"-->
    <!--                    v-clipboard:error="onError"-->
    <!--                    size="mini"-->
    <!--                    type="primary"-->
    <!--                  >复制-->
    <!--                  </el-button>-->
    <!--                </el-col>-->
    <!--              </el-row>-->
    <!--            </el-collapse-item>-->
    <!--          </el-collapse>-->

    <!--        </el-collapse-item>-->

    <!--        <el-collapse-item v-if="dataType !== 'api'" name="05">-->
    <!--          <template slot="title">-->
    <!--            <div class="el-collapse-item-title">执行信息：</div>-->
    <!--          </template>-->

    <!--          <el-collapse v-model="defaultShowExecuteInFo" style="margin-left: 30px; margin-right: 30px">-->
    <!--            <el-descriptions class="margin-top" :column="2" border>-->
    <!--              <el-descriptions-item>-->
    <!--                <template slot="label"> 执行方式 </template>-->
    <!--                {{ stepData.test_action.execute_name }}-->
    <!--              </el-descriptions-item>-->

    <!--              <el-descriptions-item>-->
    <!--                <template slot="label"> 输入内容 </template>-->
    <!--                {{ stepData.test_action.text }}-->
    <!--              </el-descriptions-item>-->

    <!--              <el-descriptions-item>-->
    <!--                <template slot="label"> 元素定位方式 </template>-->
    <!--                {{ stepData.test_action.by_type }}-->
    <!--              </el-descriptions-item>-->

    <!--              <el-descriptions-item>-->
    <!--                <template slot="label"> 元素定位表达式 </template>-->
    <!--                {{ stepData.test_action.element }}-->
    <!--              </el-descriptions-item>-->
    <!--            </el-descriptions>-->

    <!--            <el-row>-->
    <!--              <el-col :span="12">-->
    <!--                <el-collapse-item name="execute_01">-->
    <!--                  <template slot="title">-->
    <!--                    <div class="el-collapse-item-title"> {{ '执行前页面：' }}</div>-->
    <!--                  </template>-->
    <!--                  <div v-show="stepData.before" class="el-collapse-item-content">-->
    <!--                    <el-image :src="'data:image/jpg;base64,' + stepData.before " />-->
    <!--                  </div>-->
    <!--                  <div v-show="!stepData.before" class="el-collapse-item-content">-->
    <!--                    <span>无</span>-->
    <!--                  </div>-->
    <!--                </el-collapse-item>-->
    <!--              </el-col>-->
    <!--              <el-col :span="12">-->
    <!--                <el-collapse-item name="execute_02">-->
    <!--                  <template slot="title">-->
    <!--                    <div class="el-collapse-item-title"> {{ '执行后页面：' }}</div>-->
    <!--                  </template>-->
    <!--                  <div v-show="stepData.after" class="el-collapse-item-content">-->
    <!--                    <el-image :src="'data:image/jpg;base64,' + stepData.after " />-->
    <!--                  </div>-->
    <!--                  <div v-show="!stepData.after" class="el-collapse-item-content">-->
    <!--                    <span>无</span>-->
    <!--                  </div>-->
    <!--                </el-collapse-item>-->
    <!--              </el-col>-->
    <!--            </el-row>-->
    <!--          </el-collapse>-->

    <!--        </el-collapse-item>-->

    <!--        <el-collapse-item name="06">-->
    <!--          <template slot="title">-->
    <!--            <div class="el-collapse-item-title"> {{ '执行测试时内存中的公共变量：' }}</div>-->
    <!--          </template>-->
    <!--          <el-row>-->
    <!--            <el-col :span="22">-->
    <!--              <div v-if="stepData.variables_mapping" style="margin-left: 100px">-->
    <!--                <JsonViewer-->
    <!--                  :value="strToJson(stepData.variables_mapping)"-->
    <!--                  :expand-depth="5"-->
    <!--                  copyable-->
    <!--                />-->
    <!--              </div>-->
    <!--            </el-col>-->
    <!--            <el-col :span="2">-->
    <!--              <el-button-->
    <!--                v-if="stepData.variables_mapping"-->
    <!--                v-clipboard:copy="getCopyData(stepData.variables_mapping)"-->
    <!--                v-clipboard:success="onCopy"-->
    <!--                v-clipboard:error="onError"-->
    <!--                size="mini"-->
    <!--                type="primary"-->
    <!--              >复制-->
    <!--              </el-button>-->
    <!--            </el-col>-->
    <!--          </el-row>-->
    <!--        </el-collapse-item>-->

    <!--        <el-collapse-item name="07">-->
    <!--          <template slot="title">-->
    <!--            <div class="el-collapse-item-title"> {{ '提取数据：' }}</div>-->
    <!--          </template>-->
    <!--          <el-row>-->
    <!--            <el-col :span="22">-->
    <!--              <div v-if="stepData.extract_msgs" style="margin-left: 100px">-->
    <!--                <JsonViewer-->
    <!--                  :value="strToJson(stepData.extract_msgs)"-->
    <!--                  :expand-depth="5"-->
    <!--                  copyable-->
    <!--                />-->
    <!--              </div>-->
    <!--            </el-col>-->
    <!--            <el-col :span="2">-->
    <!--              <el-button-->
    <!--                v-if="stepData.extract_msgs"-->
    <!--                v-clipboard:copy="getCopyData(stepData.extract_msgs)"-->
    <!--                v-clipboard:success="onCopy"-->
    <!--                v-clipboard:error="onError"-->
    <!--                size="mini"-->
    <!--                type="primary"-->
    <!--              >复制-->
    <!--              </el-button>-->
    <!--            </el-col>-->
    <!--          </el-row>-->
    <!--        </el-collapse-item>-->

    <!--        <el-collapse-item name="08">-->
    <!--          <template slot="title">-->
    <!--            <div class="el-collapse-item-title"> {{ '脚本print打印信息：' }}</div>-->
    <!--          </template>-->
    <!--          <el-row>-->
    <!--            <el-col :span="22">-->
    <!--              <pre-->
    <!--                class="el-collapse-item-content"-->
    <!--                style="text-align: left; overflow: auto"-->
    <!--              >{{ stepData.redirect_print }}</pre>-->
    <!--            </el-col>-->
    <!--            <el-col :span="2">-->
    <!--              <el-button-->
    <!--                v-if="stepData.redirect_print"-->
    <!--                v-clipboard:copy="getCopyData(stepData.redirect_print)"-->
    <!--                v-clipboard:success="onCopy"-->
    <!--                v-clipboard:error="onError"-->
    <!--                size="mini"-->
    <!--                type="primary"-->
    <!--              >复制-->
    <!--              </el-button>-->
    <!--            </el-col>-->
    <!--          </el-row>-->

    <!--        </el-collapse-item>-->
    <!--      </el-collapse>-->

  </div>
</template>

<script>

import JsonViewer from 'vue-json-viewer'

export default {
  name: 'ShowStep',
  components: {
    JsonViewer
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'caseData'
  ],

  data() {
    return {

    }
  },

  methods: {

  }
}

</script>

<style scoped>

</style>
