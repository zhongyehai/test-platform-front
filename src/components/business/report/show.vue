<template>
  <div>
    <div class="reportShow" style="line-height: 36px;">

      <!-- 有测试报告数据 -->
      <div v-show="reportData.details.length > 0">

        <!-- 第一行，头部信息 -->
        <div class="grid-content" style="background-color: #f5f5f5 !important;">
          <el-button
            type="primary"
            size="mini"
            round
            style="margin-left: 10px; margin-top: 5px;padding: 4px 10px ;"
            @click="isShowPic()"
          >{{ picStatus ? '隐藏统计图' : '展示统计图' }}
          </el-button>

          <el-select
            v-model="showCaseResultType"
            placeholder="用例展示类型"
            size="mini"
            style="margin-left: 10px; width: 130px"
            filterable
            default-first-option
          >
            <el-option
              v-for="item in showCaseResultTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <el-select
            v-model="showStepResultType"
            placeholder="步骤展示类型"
            size="mini"
            style="margin-left: 10px; width: 130px"
            filterable
            default-first-option
          >
            <el-option
              v-for="item in showStepResultTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <span style="float: right;font-size: 13px;color: #3a8ee6">
            <span v-if="dataType !== 'appUi'" style="margin-right: 10px">环境: {{
              runEnvDict[reportData.run_env]
            }}</span>
            <span style="margin-right: 10px">模式: {{ reportData.is_async === 1 ? '并行运行' : '串行运行' }}</span>
            <span style="margin-right: 10px">开始: {{ reportData.time.start_at }}</span>
            <!-- 执行耗时保留3为小数 -->
            <span style="margin-right: 10px"> 耗时: {{ reportData.time.duration.toString().slice(0, 5) }} 秒</span>

            <el-button
              v-if="!reportData.success"
              type="primary"
              size="mini"
              style="margin-right: 10px"
              @click.native="showHitDrawer('add')"
            >记录问题</el-button>

            <!-- Python脚本 -->
            <el-button
              type="primary"
              size="mini"
              style="margin-right: 10px"
              @click="showPythonScriptManage = true"
            >Python脚本</el-button>

            <!-- 删除报告 -->
            <el-popover
              v-model="deletePopoverIsShow"
              placement="top"
              popper-class="down-popover"
            >
              <p>确定删除此报告?</p>
              <p style="color: red">关联了失败记录的测试报告不会被删除</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="deletePopoverIsShow = false">取消</el-button>
                <el-button type="primary" size="mini" @click="deleteReport()">确定</el-button>
              </div>
              <el-button
                slot="reference"
                type="danger"
                size="mini"
                style="margin-right: 10px"
              >删除
              </el-button>
            </el-popover>

          </span>
        </div>

        <!-- 第二行，饼图 -->
        <el-row v-show="picStatus">
          <!-- 步骤 -->
          <el-col :span="12">
            <div style="height: 200px;float:left;">
              <ve-pie :data="caseChartData" :settings="caseChartSettings" height="200px" width="400px" />
            </div>
            <div style="margin-top:40px;font-size:14px;line-height:25px;font-weight:600">
              <div style="color: #927B8B">总数: {{ reportData.stat.teststeps.total }}</div>
              <div style="color: #19D4AE">成功: {{ reportData.stat.teststeps.successes }}</div>
              <div style="color: #FA6E86">失败: {{ reportData.stat.teststeps.failures }}</div>
              <div style="color: #E87C25">错误: {{ reportData.stat.teststeps.errors }}</div>
              <div style="color: #60C0DD">跳过: {{ reportData.stat.teststeps.skipped }}</div>
            </div>
          </el-col>

          <!-- 用例 -->
          <el-col :span="12">
            <div style="height: 200px;float:left;">
              <ve-ring :data="suiteChartData" :settings="suiteChartSettings" height="200px" width="350px" />
            </div>
            <div style="margin-top:40px;font-size:14px;line-height:25px;font-weight:600">
              <div style="color: #927B8B">总数: {{ reportData.stat.testcases.total }}</div>
              <div style="color: #19D4AE">成功: {{ reportData.stat.testcases.success }}</div>
              <div style="color: #FA6E86">失败: {{ reportData.stat.testcases.fail }}</div>
            </div>
          </el-col>
        </el-row>

        <!-- 第三行，用例和详情 -->
        <el-row>
          <!-- 用例、步骤列表 -->
          <el-col :span="8">
            <el-scrollbar>
              <div :style="{height:caseScrollbarHeight}">
                <el-collapse accordion>
                  <!-- 遍历用例 -->
                  <el-collapse-item
                    v-for="(case_data, case_index) in reportData['details']"
                    v-show="showCaseResultType === 'all' || showCaseResultType === case_data.success"
                    :key="case_index"
                  >
                    <template slot="title">
                      <el-tooltip
                        class="item"
                        effect="dark"
                        :content="case_data.records ? `${case_data.records.length}个步骤` : ''"
                        placement="top-start"
                      >
                        <div>
                          <el-row>
                            <el-col :span="case_data.case_id ? 19 : 24">
                              <div
                                style="font-weight:600 ;font-size: 15px;margin-left: 10px; overflow: hidden"
                                :style="case_data.success === true ? 'color:#409eff': 'color:rgb(255, 74, 74)'"
                              > {{ case_data.name }}
                              </div>
                            </el-col>
                            <el-col :span="case_data.case_id ? 5 : 0">
                              <el-button
                                v-if="case_data.case_id"
                                style="
                                margin-left: 20px;
                                float:right;
                                text-align:right"
                                size="mini"
                                type="text"
                                @click.stop.prevent="showCaseInfo(case_data.case_id)"
                              >打开用例
                              </el-button>
                            </el-col>
                          </el-row>
                        </div>
                      </el-tooltip>
                    </template>
                    <div>
                      <ol id="test" style="padding:5px;font-family:Times New Roman">
                        <!-- 遍历步骤 -->
                        <li
                          v-for="(step_data, step_index) in case_data['records']"
                          v-show="showStepResultType === 'all' || showStepResultType === step_data.status"
                          :key="step_index"
                          style="list-style-type:none;border-bottom: 1px solid #eee;margin-left: 10px"
                          :class="{
                            'active':case_index === showColor[0] && step_index === showColor[1],
                            'wire': step_index === 0
                          }"
                          @click="handleNodeClick(case_index, step_index)"
                        >
                          <div
                            :style="getStepColor(step_data.status)"
                          >
                            <span class="test-name">{{ step_data.name }}</span>
                            <span class="test-time">{{ step_data.meta_datas.stat.response_time_ms }} ms</span>
                            <el-tooltip
                              class="test-status"
                              effect="dark"
                              content="打开此步骤所在的用例，可查看和编辑"
                              placement="top-start"
                            >
                              <el-button
                                v-if="step_data.meta_datas.case_id"
                                :style="getStepColor(step_data.status)"
                                size="mini"
                                type="text"
                                class="test-status"
                                @click="showCaseInfo(step_data.meta_datas.case_id)"
                              >打开用例
                              </el-button>
                            </el-tooltip>
                            <el-tooltip
                              class="test-status"
                              effect="dark"
                              content="复制此步骤的数据到剪切板"
                              placement="top-start"
                            >
                              <el-button
                                v-if="dataType === 'api'"
                                v-clipboard:copy="getCopyData(step_data.meta_datas.data[0])"
                                v-clipboard:success="onCopy"
                                v-clipboard:error="onError"
                                size="mini"
                                type="text"
                                class="test-status"
                                :style="getStepColor(step_data.status)"
                              >复制数据
                              </el-button>
                              <el-button
                                v-else
                                v-clipboard:copy="getCopyData({
                                  extract_msgs: step_data.meta_datas.data[0].extract_msgs,
                                  request: step_data.meta_datas.data[0].request,
                                  test_action: step_data.meta_datas.data[0].test_action
                                })"
                                v-clipboard:success="onCopy"
                                v-clipboard:error="onError"
                                size="mini"
                                type="text"
                                class="test-status"
                                :style="getStepColor(step_data.status)"
                              >复制数据
                              </el-button>
                            </el-tooltip>
                            <!--                            <span-->
                            <!--                              class="test-status"-->
                            <!--                              style="margin-left: 30px"-->
                            <!--                              :style="getStepColor(step_data)"-->
                            <!--                            >{{ resultMapping[step_data.status] }}</span>-->
                          </div>
                        </li>
                      </ol>
                    </div>

                  </el-collapse-item>
                </el-collapse>
              </div>
            </el-scrollbar>
          </el-col>

          <!-- 详情页 -->
          <el-col :span="16">
            <el-scrollbar>
              <div :style="{height:caseScrollbarHeight}">
                <div
                  style="padding:10px;font-size: 14px;line-height: 25px;width: 100%;position:relative;"
                >
                  <el-collapse v-model="defaultShowResponseInFo">

                    <el-collapse-item v-if="dataType !== 'api'" name="1">
                      <template slot="title">
                        <div class="el-collapse-item-title"> 执行方式: {{
                          meta_datas.data[0].test_action.execute_name
                        }}
                        </div>
                      </template>
                      <div class="el-collapse-item-content">{{ meta_datas.data[0].test_action.execute_name }}</div>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType !== 'api'" name="2">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ '执行方式映射的方法：' }}</div>
                      </template>
                      <div class="el-collapse-item-content">{{ meta_datas.data[0].test_action.action }}</div>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType !== 'api'" name="3">
                      <template slot="title">
                        <div class="el-collapse-item-title">元素定位方式: {{
                          meta_datas.data[0].test_action.by_type
                        }}
                        </div>
                      </template>
                      <div class="el-collapse-item-content">{{ meta_datas.data[0].test_action.by_type }}</div>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType !== 'api'" name="4">
                      <template slot="title">
                        <div class="el-collapse-item-title">定位元素表达式 {{
                          meta_datas.data[0].test_action.element
                        }}
                        </div>
                      </template>
                      <div class="el-collapse-item-content">{{ meta_datas.data[0].test_action.element }}</div>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType !== 'api' && meta_datas.data[0].test_action.text" name="5">
                      <template slot="title">
                        <div class="el-collapse-item-title">输入内容: {{ meta_datas.data[0].test_action.text }}</div>
                      </template>
                      <div class="el-collapse-item-content">{{ meta_datas.data[0].test_action.text }}</div>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType !== 'api'" v-show="meta_datas.data[0].before" name="6">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ '执行前页面：' }}</div>
                      </template>
                      <div class="el-collapse-item-content">
                        <el-image :src="'data:image/jpg;base64,' + meta_datas.data[0].before " />
                      </div>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType !== 'api'" v-show="meta_datas.data[0].after" name="7">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ '执行后页面：' }}</div>
                      </template>
                      <div class="el-collapse-item-content">
                        <el-image :src="'data:image/jpg;base64,' + meta_datas.data[0].after " />
                      </div>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType === 'api'" name="8">
                      <template slot="title">
                        <div class="el-collapse-item-title">请求方法: {{ meta_datas.data[0].request.method }}</div>
                      </template>
                      <div class="el-collapse-item-content">{{ meta_datas.data[0].request.method }}</div>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType === 'api'" name="9">
                      <template slot="title">
                        <div class="el-collapse-item-title">请求地址: {{ meta_datas.data[0].request.url }}</div>
                      </template>
                      <div class="el-collapse-item-content">{{ meta_datas.data[0].request.url }}</div>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType === 'api'" name="10">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ '查询字符串参数：' }}</div>
                      </template>
                      <el-row>
                        <el-col :span="22">
                          <div v-if="meta_datas.data[0].request.params" style="margin-left: 100px">
                            <JsonViewer
                              :value="strToJson(meta_datas.data[0].request.params)"
                              :expand-depth="5"
                              copyable
                            />
                          </div>
                        </el-col>
                        <el-col :span="2">
                          <el-button
                            v-if="meta_datas.data[0].request.params"
                            v-clipboard:copy="getCopyData(meta_datas.data[0].request.params)"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onError"
                            size="mini"
                            type="primary"
                          >复制
                          </el-button>
                        </el-col>
                      </el-row>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType === 'api'" name="11">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ '头部参数：' }}</div>
                      </template>
                      <el-row>
                        <el-col :span="22">
                          <div v-if="meta_datas.data[0].request.headers" style="margin-left: 100px">
                            <JsonViewer
                              :value="strToJson(meta_datas.data[0].request.headers)"
                              :expand-depth="5"
                              copyable
                            />
                          </div>
                        </el-col>
                        <el-col :span="2">
                          <el-button
                            v-if="meta_datas.data[0].request.headers"
                            v-clipboard:copy="getCopyData(meta_datas.data[0].request.headers)"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onError"
                            size="mini"
                            type="primary"
                          >复制
                          </el-button>
                        </el-col>
                      </el-row>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType === 'api'" name="12">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ 'json参数：' }}</div>
                      </template>
                      <el-row>
                        <el-col :span="22">
                          <div v-if="meta_datas.data[0].request.json" style="margin-left: 100px">
                            <JsonViewer
                              :value="strToJson(meta_datas.data[0].request.json)"
                              :expand-depth="5"
                              copyable
                            />
                          </div>
                        </el-col>
                        <el-col :span="2">
                          <el-button
                            v-if="meta_datas.data[0].request.json"
                            v-clipboard:copy="getCopyData(meta_datas.data[0].request.json)"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onError"
                            size="mini"
                            type="primary"
                          >复制
                          </el-button>
                        </el-col>
                      </el-row>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType === 'api'" name="13">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ 'data参数：' }}</div>
                      </template>
                      <el-row v-if=" typeof meta_datas.data[0].request.data === 'object'">
                        <el-col :span="22">
                          <div v-if="meta_datas.data[0].request.data" style="margin-left: 100px">
                            <JsonViewer
                              :value="strToJson(meta_datas.data[0].request.data)"
                              :expand-depth="5"
                              copyable
                            />
                          </div>
                        </el-col>
                        <el-col :span="2">
                          <el-button
                            v-if="meta_datas.data[0].request.data"
                            v-clipboard:copy="getCopyData(meta_datas.data[0].request.data)"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onError"
                            size="mini"
                            type="primary"
                          >复制
                          </el-button>
                        </el-col>
                      </el-row>
                      <el-row v-if=" typeof meta_datas.data[0].request.data === 'string'">
                        <el-col :span="22">
                          <div v-if="meta_datas.data[0].request.data" style="margin-left: 100px">
                            <xmp>{{ formatXml(meta_datas.data[0].request.data) }}</xmp>
                          </div>
                        </el-col>
                        <el-col :span="2">
                          <el-button
                            v-if="meta_datas.data[0].request.data"
                            v-clipboard:copy="formatXml(meta_datas.data[0].request.data)"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onError"
                            size="mini"
                            type="primary"
                          >复制
                          </el-button>
                        </el-col>
                      </el-row>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType === 'api'" name="14">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ '文件参数：' }}</div>
                      </template>
                      <el-row>
                        <el-col :span="22">
                          <div v-if="meta_datas.data[0].request.files" style="margin-left: 100px">
                            <JsonViewer
                              :value="strToJson(meta_datas.data[0].request.files)"
                              :expand-depth="5"
                              copyable
                            />
                          </div>
                        </el-col>
                        <el-col :span="2">
                          <el-button
                            v-if="meta_datas.data[0].request.files"
                            v-clipboard:copy="getCopyData(meta_datas.data[0].request.files)"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onError"
                            size="mini"
                            type="primary"
                          >复制
                          </el-button>
                        </el-col>
                      </el-row>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType === 'api'" name="15">
                      <template slot="title">
                        <div class="el-collapse-item-title">发送请求时间: {{ meta_datas.stat.request_at }}</div>
                      </template>
                      <div class="el-collapse-item-content">{{ meta_datas.stat.request_at }}</div>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType === 'api'" name="16">
                      <template slot="title">
                        <div class="el-collapse-item-title">请求响应时间: {{ meta_datas.stat.response_at }}</div>
                      </template>
                      <div class="el-collapse-item-content">{{ meta_datas.stat.response_at }}</div>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType === 'api'" name="17">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ '响应json：' }}</div>
                      </template>
                      <el-row>
                        <el-col :span="22">
                          <div v-if="meta_datas.data[0].response.json" style="margin-left: 100px">
                            <JsonViewer
                              :value="strToJson(meta_datas.data[0].response.json)"
                              :expand-depth="5"
                              copyable
                            />
                          </div>
                        </el-col>
                        <el-col :span="2">
                          <el-button
                            v-if="meta_datas.data[0].response.json"
                            v-clipboard:copy="getCopyData(meta_datas.data[0].response.json)"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onError"
                            size="mini"
                            type="primary"
                          >复制
                          </el-button>
                        </el-col>
                      </el-row>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType === 'api'" name="18">
                      <template slot="title">
                        <div class="el-collapse-item-title">响应状态码: {{
                          meta_datas.data[0].response.status_code
                        }}
                        </div>
                      </template>
                      <div class="el-collapse-item-content">{{ meta_datas.data[0].response.status_code }}</div>
                    </el-collapse-item>

                    <el-collapse-item v-if="dataType === 'api'" name="19">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ '响应文本：' }}</div>
                      </template>
                      <div class="el-collapse-item-content" v-html="meta_datas.data[0].response.text" />
                    </el-collapse-item>

                    <el-collapse-item name="20">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ '执行测试时内存中的公共变量：' }}</div>
                      </template>
                      <el-row>
                        <el-col :span="22">
                          <div v-if="meta_datas.variables_mapping" style="margin-left: 100px">
                            <JsonViewer
                              :value="strToJson(meta_datas.variables_mapping)"
                              :expand-depth="5"
                              copyable
                            />
                          </div>
                        </el-col>
                        <el-col :span="2">
                          <el-button
                            v-if="meta_datas.variables_mapping"
                            v-clipboard:copy="getCopyData(meta_datas.variables_mapping)"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onError"
                            size="mini"
                            type="primary"
                          >复制
                          </el-button>
                        </el-col>
                      </el-row>
                    </el-collapse-item>

                    <el-collapse-item name="21">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ '提取数据：' }}</div>
                      </template>
                      <el-row>
                        <el-col :span="22">
                          <div v-if="meta_datas.data[0].extract_msgs" style="margin-left: 100px">
                            <JsonViewer
                              :value="strToJson(meta_datas.data[0].extract_msgs)"
                              :expand-depth="5"
                              copyable
                            />
                          </div>
                        </el-col>
                        <el-col :span="2">
                          <el-button
                            v-if="meta_datas.data[0].extract_msgs"
                            v-clipboard:copy="getCopyData(meta_datas.data[0].extract_msgs)"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onError"
                            size="mini"
                            type="primary"
                          >复制
                          </el-button>
                        </el-col>
                      </el-row>
                    </el-collapse-item>

                    <el-collapse-item name="22">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ '脚本print打印信息：' }}</div>
                      </template>
                      <el-row>
                        <el-col :span="22">
                          <pre
                            class="el-collapse-item-content"
                            style="text-align: left; overflow: auto"
                          >{{ meta_datas.redirect_print }}</pre>
                        </el-col>
                        <el-col :span="2">
                          <el-button
                            v-if="meta_datas.redirect_print"
                            v-clipboard:copy="getCopyData(meta_datas.redirect_print)"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onError"
                            size="mini"
                            type="primary"
                          >复制
                          </el-button>
                        </el-col>
                      </el-row>

                    </el-collapse-item>

                    <el-collapse-item v-show="attachment" name="23">
                      <template slot="title">
                        <div class="el-collapse-item-title"> {{ '错误信息：' }}</div>
                      </template>
                      <pre class="el-collapse-item-content" style="overflow: auto">{{ attachment }}</pre>
                    </el-collapse-item>

                  </el-collapse>
                </div>
              </div>
            </el-scrollbar>
          </el-col>
        </el-row>
      </div>

      <!-- 无测试报告数据 -->
      <div v-show="reportData.details.length === 0" class="str">
        无运行数据或所有运行数据均已跳过
      </div>

      <!-- 记录问题 -->
      <hitDrawer
        :run-test-type-list="runTestTypeList"
        :run-env-list="envList"
      />

      <!-- 打开用例 -->
      <caseDrawer
        :data-type="dataType"
        :current-project-id="caseProjectId"
        :current-set-id="caseSuiteId"
      />

      <!-- 选择运行环境 -->
      <selectRunEnv
        :data-type="dataType"
        :project-business-id="projectBusinessId"
      />

      <!-- 测试执行进度 -->
      <runProcess
        :data-type="dataType"
      />

      <el-drawer
        title="脚本管理"
        size="85%"
        :append-to-body="true"
        :visible.sync="showPythonScriptManage"
        :direction="direction"
      >
        <pythonScriptIndex />
      </el-drawer>

    </div>
  </div>

</template>

<script>

import JsonViewer from 'vue-json-viewer'
import vkbeautify from 'vkbeautify' // xml格式化组件
import hitDrawer from '@/views/assist/hits/drawer'
import pythonScriptIndex from '@/views/assist/script/index'
import caseDrawer from '@/components/business/case/drawer'

import { runEnvList } from '@/apis/config/runEnv'
import { deleteReport as deleteApiReport, reportDetail as apiReportDetail } from '@/apis/apiTest/report'
import { deleteReport as deleteWebUiReport, reportDetail as webUiReportDetail } from '@/apis/webUiTest/report'
import { deleteReport as deleteAppUiReport, reportDetail as appUiReportDetail } from '@/apis/appUiTest/report'
import { caseProject as apiGetCaseProject } from '@/apis/apiTest/case'
import { caseProject as webUiGetCaseProject } from '@/apis/webUiTest/case'
import { caseProject as appUiGetCaseProject } from '@/apis/appUiTest/case'

import { reportStepResultMapping } from '@/utils/mapping'
import selectRunEnv from '@/components/selectRunEnv.vue'
import runProcess from '@/components/runProcess.vue'

export default {
  name: 'ReportShow',
  components: {
    runProcess, selectRunEnv,
    caseDrawer,
    pythonScriptIndex,
    JsonViewer,
    hitDrawer
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ['dataType'],
  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      deletePopoverIsShow: false,
      showPythonScriptManage: false,
      runTestTypeList: [],
      envList: [],
      runEnvDict: {},

      // 选中打开用例
      caseProjectId: '',
      caseSuiteId: '',
      projectBusinessId: '',

      msg: { copyText: 'copy', copiedText: 'copied' },
      defaultShowResponseInFo: ['6', '7', '23'], // 默认展开报告详情的项
      showCaseResultType: 'all',
      showCaseResultTypeList: [
        { label: '展示全部用例', value: 'all' },
        { label: '展示成功的用例', value: true },
        { label: '展示失败的用例', value: false }
      ], // 根据用例结果类型展示报告

      showStepResultType: 'all',
      showStepResultTypeList: [
        { label: '展示全部步骤', value: 'all' },
        { label: '展示成功的步骤', value: 'success' },
        { label: '展示失败的步骤', value: 'failure' },
        { label: '展示错误的步骤', value: 'error' },
        { label: '展示跳过的步骤', value: 'skipped' }
      ], // 根据步骤结果类型展示报告
      caseChartSettings: {
        radius: 80,
        avoidLabelOverlap: false,
        offsetY: 110,
        itemStyle: {
          normal: {
            color: function(params) {
              const colorList = [
                'rgb(25,212,174)', 'rgb(250,110,134)', '#FE8463', '#60C0DD', '#E87C25', '#27727B',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
              ]
              return colorList[params.dataIndex]
            }
          }
        },
        label: {
          normal: { position: 'center', show: false }
        },
        labelLine: {
          normal: { show: false }
        }

      },

      suiteChartSettings: {
        radius: [50, 80],
        avoidLabelOverlap: false,
        offsetY: 110,
        itemStyle: {
          normal: {
            color: function(params) {
              const colorList = [
                'rgb(25,212,174)', 'rgb(250,110,134)', '#fb2828', '#E87C25', '#27727B',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
              ]
              return colorList[params.dataIndex]
            }
          }
        },
        label: {
          normal: { position: 'center', show: false }
        },
        labelLine: {
          normal: { show: false }
        }
      },
      caseScrollbarHeight: `${window.innerHeight * 0.85}px`, // 用例和步骤内容的高度
      picStatus: false, // 是否展示饼图
      showColor: [],
      attachment: '',
      meta_datas: {
        data: [{
          request: { body: null, url: null, headers: null, data: null, params: null, json: null },
          response: { content: null, json: null, status_code: null },
          test_action: { action: null, by_type: null, element: null, text: null }
        }],
        stat: {
          elapsed_ms: '',
          request_at: '',
          response_at: '',
          response_time_ms: ''
        }
      },
      caseChartData: {
        columns: ['caseName', 'num'],
        rows: [
          { 'caseName': '成功步骤', num: 0 },
          { 'caseName': '失败步骤', num: 0 },
          { 'caseName': '错误步骤', num: 0 },
          { 'caseName': '跳过步骤', num: 0 }
        ]
      },
      suiteChartData: {
        columns: ['name', 'num'],
        rows: [
          { 'name': '成功case', 'num': 0 }, { 'name': '失败case', 'num': 0 }
        ]
      },

      reportData: {
        'details': [{ name: '' }],
        'platform': { 'duration': '', 'python_version': '' },
        'stat': {
          'teststeps': {
            'errors': '',
            'expectedFailures': '',
            'failures': '',
            'skipped': '',
            'successes': '',
            'total': '',
            'unexpectedSuccesses': ''
          },
          'testcases': { 'fail': '', 'success': '', 'total': '' }
        },
        'time': { 'start_at': '', 'duration': 1, 'start_datetime': '' }
      },

      resultMapping: reportStepResultMapping,
      reportDetailUrl: '',
      deleteReportUrl: '',
      getCaseProjectUrl: ''
    }
  },

  created() {
    if (this.dataType === 'api') {
      this.reportDetailUrl = apiReportDetail
      this.deleteReportUrl = deleteApiReport
      this.getCaseProjectUrl = apiGetCaseProject
      this.defaultShowResponseInFo = ['12', '17', '21', '23']
    } else if (this.dataType === 'webUi') {
      this.reportDetailUrl = webUiReportDetail
      this.deleteReportUrl = deleteWebUiReport
      this.getCaseProjectUrl = webUiGetCaseProject
    } else {
      this.reportDetailUrl = appUiReportDetail
      this.deleteReportUrl = deleteAppUiReport
      this.getCaseProjectUrl = appUiGetCaseProject
    }

    // 获取环境列表
    runEnvList({}).then(response => {
      this.envList = response.data.data
      this.envList.forEach(env => {
        this.runEnvDict[env.code] = env.name
      })
    })

    this.getReportDataById()
  },

  methods: {
    deleteReport() {
      this.deleteReportUrl({ id: [this.$route.query.id] }).then(response => {
        if (this.showMessage(this, response)) {
          open(location, '_self').close()
        }
      })
    },

    getStepColor(status) {
      return status === 'success' ? 'color:#19D4AE'
        : status === true ? 'color:#19D4AE'
          : status === 'failure' ? 'color:#FA6E86'
            : status === false ? 'color:#FA6E86'
              : status === 'skipped' ? 'color:#60C0DD' : 'color:#E87C25'
    },

    // 打开用例信息
    showCaseInfo(caseId) {
      this.getCaseProjectUrl({ id: caseId }).then(response => {
        this.projectBusinessId = response.data.project.business_id
        this.caseProjectId = response.data.project.id
        this.caseSuiteId = response.data.suite.id
        this.$bus.$emit(
          this.$busEvents.drawerIsShow,
          'caseInfo',
          'edit',
          JSON.parse(JSON.stringify(response.data.case))
        )
      })
    },

    // 记录问题
    showHitDrawer(status) {
      this.$bus.$emit(
        this.$busEvents.drawerIsShow,
        'hit',
        status,
        {
          date: this.reportData.time.start_at,
          test_type: this.reportData.run_type,
          run_env: this.reportData.run_env,
          report_id: this.$route.query.id
        })
    },

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

    handleNodeClick(i1, i2) {
      this.showColor = [i1, i2]
      this.meta_datas = this.reportData['details'][i1]['records'][i2]['meta_datas']
      this.attachment = this.reportData['details'][i1]['records'][i2]['attachment']
    },

    // 获取测试报告具体内容
    getReportDataById() {
      const loading = this.$loading({
        lock: true,
        text: `${this.dataType === 'api' ? '测试报告' : 'ui自动化测试报告包含截图，'}数据较大，所以数据传输会稍久，请耐心等待`,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.reportDetailUrl({ 'id': this.$route.query.id }).then((response) => {
        loading.close()
        if (this.showMessage(this, response)) {
          this.reportData = response['data']
          this.meta_datas = this.reportData['details'][0]['records'][0]['meta_datas']
          this.attachment = this.reportData['details'][0]['records'][0]['attachment']
          // 渲染饼图需要的数据
          this.caseChartData['rows'][0]['num'] = this.reportData.stat.teststeps.successes
          this.caseChartData['rows'][1]['num'] = this.reportData.stat.teststeps.failures
          this.caseChartData['rows'][2]['num'] = this.reportData.stat.teststeps.errors
          this.caseChartData['rows'][3]['num'] = this.reportData.stat.teststeps.skipped
          this.suiteChartData['rows'][0]['num'] = this.reportData.stat.testcases.success
          this.suiteChartData['rows'][1]['num'] = this.reportData.stat.testcases.fail
        }
      }
      )
    },

    // 控制是否显示统计图
    isShowPic() {
      this.picStatus = !this.picStatus
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
