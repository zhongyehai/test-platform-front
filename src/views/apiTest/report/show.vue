<template>
  <div>
    <!--    <reportHeader></reportHeader>-->
    <!--    <div class="reportShow" style="line-height: 36px;font-family:LiSu">-->
    <div class="reportShow" style="line-height: 36px;">
      <!-- 第一行，头部信息 -->
      <el-row>
        <el-col :span="24">
          <div class="grid-content" style="background-color: #f5f5f5 !important;">
            <el-button type="primary" round style="padding: 4px 10px ;" v-show="false">{{ null }}</el-button>
            <el-button type="primary" size="mini" round style="margin-top: 5px;padding: 4px 10px ;"
                       @click.native="isShowPic(false)"
                       v-show="this.picStatus"
            >隐藏统计图
            </el-button>
            <el-button type="primary" size="mini" round style="padding: 4px 10px ;"
                       @click.native="isShowPic(true)"
                       v-show="!this.picStatus"
            >展示统计图
            </el-button>
            <el-dropdown @command="handleCommand" style="line-height:15px;margin-left:10px;color: #3a8ee6;">
                          <span class="el-dropdown-link">
                            根据状态筛选用例<i class="el-icon-arrow-down el-icon--right"></i>
                          </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="None">全部用例</el-dropdown-item>
                <el-dropdown-item command="success">成功的用例</el-dropdown-item>
                <el-dropdown-item command="error">失败的用例</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <span style="font-family: Source Sans Pro;float: right;font-size: 13px;color: #3a8ee6;margin-right: 40px">
            总共耗时: {{ this.reportData.time.duration }} 秒
          </span>
            <span style="font-family: Source Sans Pro;float: right;font-size: 13px;color: #3a8ee6;margin-right: 40px">
            开始时间: {{ this.reportData.time.start_at }}
          </span>
            <span style="font-family: Source Sans Pro;float: right;font-size: 13px;color: #3a8ee6;margin-right: 40px">
            执行模式: {{ this.reportData.run_type === 1 ? "并行运行" : "串行运行" }}
          </span>
            <span style="font-family: Source Sans Pro;float: right;font-size: 13px;color: #3a8ee6;margin-right: 40px">
            运行环境: {{ runEnvDict[reportData.run_env] }}
          </span>
          </div>
        </el-col>
      </el-row>

      <!-- 第二行，饼图 -->
      <el-row v-show="this.picStatus">
        <!-- 步骤 -->
        <el-col :span="10"
                style="border-style:solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;border-width: 1px;"
        >
          <div style="height: 200px;float:left;">
            <ve-pie :data="caseChartData" :settings="caseChartSettings" height="200px" width="400px"></ve-pie>
          </div>
          <ol style="margin-top:5px;font-size:14px;line-height:25px" class="remote-line">
            <li style="font-weight:700;font-size:16px">步骤概况</li>
            <li style="font-weight:600;color: rgb(146, 123, 139)">总数:{{ this.reportData.stat.teststeps.total }}</li>
            <li style="color: rgb(25,212,174);font-weight:600">成功:{{ this.reportData.stat.teststeps.successes }}</li>
            <li style="color: rgb(250,110,134);font-weight:600">失败:{{ this.reportData.stat.teststeps.failures }}</li>
            <li style="color: #E87C25;font-weight:600">错误:{{ this.reportData.stat.teststeps.errors }}</li>
            <li style="color: #60C0DD;font-weight:600">跳过:{{ this.reportData.stat.teststeps.skipped }}</li>
          </ol>
        </el-col>

        <!-- 用例 -->
        <el-col :span="14" style="border-width: 1px;">
          <div style="height: 200px;float:left;">
            <ve-ring :data="suiteChartData" :settings="suiteChartSettings" height="200px"
                     width="350px"
            ></ve-ring>
          </div>
          <ol style="margin-top:5px;font-size:14px;line-height:25px" class="remote-line">
            <li style="font-weight:700;font-size:16px">用例概况</li>
            <li style="font-weight:600;color: rgb(146, 123, 139)">总数:{{ this.reportData.stat.testcases.total }}
            </li>
            <li style="color: rgb(25,212,174);font-weight:600">成功:{{ this.reportData.stat.testcases.success }}
            </li>
            <li style="color: rgb(250,110,134);font-weight:600">失败:{{ this.reportData.stat.testcases.fail }}</li>
          </ol>
        </el-col>
      </el-row>

      <!-- 第三行，用例和详情 -->
      <el-row>
        <!-- 用例、步骤列表 -->
        <el-col :span="6"
                style="border-style:solid;border-color: rgb(234, 234, 234) #ffffff #ffffff #ffffff;border-width: 1px;"
        >
          <el-scrollbar>
            <div :style={height:picHeight}>
              <el-collapse accordion>
                <!-- 遍历用例 -->
                <el-collapse-item
                  v-for="(item, index) in reportData['details']"
                  :key="index"
                  v-show="item.success === true ? showScene[0]: showScene[1]"
                >
                  <template slot="title">
                    <el-tooltip class="item"
                                effect="dark"
                                :content="item.records ? `${item.records.length}个步骤` : ''"
                                placement="top-start">
                      <div style="font-weight:600 ;font-size: 15px;margin-left: 10px; overflow: hidden"
                           :style="item.success === true ? 'color:#409eff': 'color:rgb(255, 74, 74)'">
                        {{ item.name }}
                      </div>
                    </el-tooltip>
                  </template>
                  <div>
                    <ol id="test" style="padding:5px;font-family:Times New Roman">
                      <!-- 遍历步骤 -->
                      <li style="list-style-type:none;border-bottom: 1px solid #eee;margin-left: 10px"
                          :class="{'active':index === showColor[0] && index1 === showColor[1], 'wire': index1 === 0}"
                          v-for="(item1, index1) in item['records']"
                          :key="index1"
                          @click="handleNodeClick(index, index1)"
                      >
                        <div :style="item1.status === 'success' ? 'color:#67c23a': 'color:rgb(255, 74, 74)'">
                          <span class="test-name">{{ item1.name }}</span>
                          <span class="test-time">{{ item1.meta_datas.stat.response_time_ms }} ms</span>
                          <span class="test-status right pass">{{ item1.status }}</span>
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
        <el-col :span="18"
                style="border-style:solid;border-color:rgb(234, 234, 234) #ffffff rgb(234, 234, 234) rgb(234, 234, 234);border-width: 1px;font-family:Serif"
        >


          <el-scrollbar :wrapStyle={height:picHeight}>
            <div :style={height:picHeight}>

              <div style="padding:10px;font-size: 14px;line-height: 25px;width: 100%;position:relative;"
                   border="0" cellpadding="0" cellspacing="0">


                <el-collapse v-model="defaultShowResponseInFo">

                  <el-collapse-item name="1">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "请求方法：" }}</div>
                    </template>
                    <div class="el-collapse-item-content">{{ this.meta_datas.data[0].request.method }}</div>
                  </el-collapse-item>

                  <el-collapse-item name="2">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "请求地址：" }}</div>
                    </template>
                    <div class="el-collapse-item-content">{{ this.meta_datas.data[0].request.url }}</div>
                  </el-collapse-item>

                  <el-collapse-item name="3">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "查询字符串参数：" }}</div>
                    </template>
                    <el-row>
                      <el-col :span="20">
                        <div style="margin-left: 100px" v-if="this.meta_datas.data[0].request.params">
                          <JsonViewer
                            :value="strToJson(this.meta_datas.data[0].request.params)"
                            :expand-depth="5"
                            copyable
                          ></JsonViewer>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <el-button
                          size="mini"
                          v-if="this.meta_datas.data[0].request.params"
                          v-clipboard:copy="getCopyData(this.meta_datas.data[0].request.params)"
                          v-clipboard:success="onCopy"
                          v-clipboard:error="onError"
                        >复制
                        </el-button>
                      </el-col>
                    </el-row>
                  </el-collapse-item>

                  <el-collapse-item name="4">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "头部参数：" }}</div>
                    </template>
                    <el-row>
                      <el-col :span="20">
                        <div style="margin-left: 100px" v-if="this.meta_datas.data[0].request.headers">
                          <JsonViewer
                            :value="strToJson(this.meta_datas.data[0].request.headers)"
                            :expand-depth="5"
                            copyable
                          ></JsonViewer>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <el-button
                          size="mini"
                          v-if="this.meta_datas.data[0].request.headers"
                          v-clipboard:copy="getCopyData(this.meta_datas.data[0].request.headers)"
                          v-clipboard:success="onCopy"
                          v-clipboard:error="onError"
                        >复制
                        </el-button>
                      </el-col>
                    </el-row>
                  </el-collapse-item>

                  <el-collapse-item name="5">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "json参数：" }}</div>
                    </template>
                    <el-row>
                      <el-col :span="20">
                        <div style="margin-left: 100px" v-if="this.meta_datas.data[0].request.json">
                          <JsonViewer
                            :value="strToJson(this.meta_datas.data[0].request.json)"
                            :expand-depth="5"
                            copyable
                          ></JsonViewer>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <el-button
                          size="mini"
                          v-if="this.meta_datas.data[0].request.json"
                          v-clipboard:copy="getCopyData(this.meta_datas.data[0].request.json)"
                          v-clipboard:success="onCopy"
                          v-clipboard:error="onError"
                        >复制
                        </el-button>
                      </el-col>
                    </el-row>
                  </el-collapse-item>

                  <el-collapse-item name="6">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "data参数：" }}</div>
                    </template>
                    <el-row v-if=" typeof this.meta_datas.data[0].request.data === 'object'">
                      <el-col :span="20">
                        <div style="margin-left: 100px" v-if="this.meta_datas.data[0].request.data">
                          <JsonViewer
                            :value="strToJson(this.meta_datas.data[0].request.data)"
                            :expand-depth="5"
                            copyable
                          ></JsonViewer>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <el-button
                          size="mini"
                          v-if="this.meta_datas.data[0].request.data"
                          v-clipboard:copy="getCopyData(this.meta_datas.data[0].request.data)"
                          v-clipboard:success="onCopy"
                          v-clipboard:error="onError"
                        >复制
                        </el-button>
                      </el-col>
                    </el-row>
                    <el-row v-if=" typeof this.meta_datas.data[0].request.data === 'string'">
                      <el-col :span="20">
                        <div style="margin-left: 100px" v-if="this.meta_datas.data[0].request.data">
                          <xmp>{{ formatXml(meta_datas.data[0].request.data) }}</xmp>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <el-button
                          size="mini"
                          v-if="this.meta_datas.data[0].request.data"
                          v-clipboard:copy="formatXml(this.meta_datas.data[0].request.data)"
                          v-clipboard:success="onCopy"
                          v-clipboard:error="onError"
                        >复制
                        </el-button>
                      </el-col>
                    </el-row>
                  </el-collapse-item>

                  <el-collapse-item name="7">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "请求时间：" }}</div>
                    </template>
                    <div class="el-collapse-item-content">{{ this.meta_datas.stat.request_at }}</div>
                  </el-collapse-item>

                  <el-collapse-item name="8">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "响应时间：" }}</div>
                    </template>
                    <div class="el-collapse-item-content">{{ this.meta_datas.stat.response_at }}</div>
                  </el-collapse-item>

                  <el-collapse-item name="9">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "响应状态码：" }}</div>
                    </template>
                    <div class="el-collapse-item-content">{{ this.meta_datas.data[0].response.status_code }}</div>
                  </el-collapse-item>

                  <el-collapse-item name="10">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "响应编码：" }}</div>
                    </template>
                    <div class="el-collapse-item-content">{{ this.meta_datas.data[0].response.encoding }}</div>
                  </el-collapse-item>

                  <el-collapse-item name="11">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "响应头部信息：" }}</div>
                    </template>
                    <el-row>
                      <el-col :span="20">
                        <div style="margin-left: 100px" v-if="this.meta_datas.data[0].response.headers">
                          <JsonViewer
                            :value="strToJson(this.meta_datas.data[0].response.headers)"
                            :expand-depth="5"
                            copyable
                          ></JsonViewer>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <el-button
                          size="mini"
                          v-if="this.meta_datas.data[0].response.headers"
                          v-clipboard:copy="getCopyData(this.meta_datas.data[0].response.headers)"
                          v-clipboard:success="onCopy"
                          v-clipboard:error="onError"
                        >复制
                        </el-button>
                      </el-col>
                    </el-row>
                  </el-collapse-item>

                  <el-collapse-item name="12">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "响应json：" }}</div>
                    </template>
                    <el-row>
                      <el-col :span="20">
                        <div style="margin-left: 100px" v-if="this.meta_datas.data[0].response.json">
                          <JsonViewer
                            :value="strToJson(this.meta_datas.data[0].response.json)"
                            :expand-depth="5"
                            copyable
                          ></JsonViewer>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <el-button
                          size="mini"
                          v-if="this.meta_datas.data[0].response.json"
                          v-clipboard:copy="getCopyData(this.meta_datas.data[0].response.json)"
                          v-clipboard:success="onCopy"
                          v-clipboard:error="onError"
                        >复制
                        </el-button>
                      </el-col>
                    </el-row>
                  </el-collapse-item>

                  <el-collapse-item name="13">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "响应文本：" }}</div>
                    </template>
                    <div class="el-collapse-item-content" v-html="this.meta_datas.data[0].response.text"></div>
                  </el-collapse-item>

                  <el-collapse-item name="14">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "提取数据：" }}</div>
                    </template>
                    <el-row>
                      <el-col :span="20">
                        <div style="margin-left: 100px" v-if="this.meta_datas.data[0].extract_msgs">
                          <JsonViewer
                            :value="strToJson(this.meta_datas.data[0].extract_msgs)"
                            :expand-depth="5"
                            copyable
                          ></JsonViewer>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <el-button
                          size="mini"
                          v-if="this.meta_datas.data[0].extract_msgs"
                          v-clipboard:copy="getCopyData(this.meta_datas.data[0].extract_msgs)"
                          v-clipboard:success="onCopy"
                          v-clipboard:error="onError"
                        >复制
                        </el-button>
                      </el-col>
                    </el-row>
                  </el-collapse-item>

                  <el-collapse-item name="15">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "发送请求时内存中的公共变量：" }}</div>
                    </template>
                    <el-row>
                      <el-col :span="20">
                        <div style="margin-left: 100px" v-if="this.meta_datas.variables_mapping">
                          <JsonViewer
                            :value="strToJson(this.meta_datas.variables_mapping)"
                            :expand-depth="5"
                            copyable
                          ></JsonViewer>
                        </div>
                      </el-col>
                      <el-col :span="4">
                        <el-button
                          size="mini"
                          v-if="this.meta_datas.variables_mapping"
                          v-clipboard:copy="getCopyData(this.meta_datas.variables_mapping)"
                          v-clipboard:success="onCopy"
                          v-clipboard:error="onError"
                        >复制
                        </el-button>
                      </el-col>
                    </el-row>
                  </el-collapse-item>

                  <el-collapse-item name="16">
                    <template slot="title">
                      <div class="el-collapse-item-title"> {{ "错误信息：" }}</div>
                    </template>
                    <pre class="el-collapse-item-content" style="overflow: auto">{{ this.attachment }}</pre>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </el-scrollbar>
        </el-col>
      </el-row>
    </div>
  </div>

</template>

<script>


import JsonViewer from "vue-json-viewer";
import vkbeautify from "vkbeautify";

import {getConfigByName} from '@/apis/config/config'
import {getReport} from '@/apis/apiTest/report'

export default {
  name: 'reportShow',
  components: {
    JsonViewer,
  },
  data() {

    this.caseChartSettings = {
      radius: 80,
      avoidLabelOverlap: false,
      offsetY: 110,
      itemStyle: {
        normal: {
          color: function (params) {
            let colorList = [
              'rgb(25,212,174)', 'rgb(250,110,134)', '#FE8463', '#60C0DD', '#E87C25', '#27727B',
              '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
              '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
            ]
            return colorList[params.dataIndex]
          }
        }
      },
      label: {
        normal: {position: 'center', show: false}
      },
      labelLine: {
        normal: {show: false}
      }

    }
    this.suiteChartSettings = {
      radius: [50, 80],
      avoidLabelOverlap: false,
      offsetY: 110,
      itemStyle: {
        normal: {
          color: function (params) {
            let colorList = [
              'rgb(25,212,174)', 'rgb(250,110,134)', '#fb2828', '#E87C25', '#27727B',
              '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
              '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
            ]
            return colorList[params.dataIndex]
          }
        }
      },
      label: {
        normal: {position: 'center', show: false}
      },
      labelLine: {
        normal: {show: false}
      }
    }
    return {
      runEnvDict: {},
      msg: {copyText: 'copy', copiedText: 'copied'},
      // 响应信息，默认展开全部
      defaultShowResponseInFo: ['1', '2', '3', '4', '5', '6', '12', '13', '14', '16'],
      caseChartSettings: {
        radius: 80,
        avoidLabelOverlap: false,
        offsetY: 110,
        itemStyle: {
          normal: {
            color: function (params) {
              let colorList = [
                'rgb(25,212,174)', 'rgb(250,110,134)', '#FE8463', '#60C0DD', '#E87C25', '#27727B',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
              ]
              return colorList[params.dataIndex]
            }
          }
        },
        label: {
          normal: {position: 'center', show: false}
        },
        labelLine: {
          normal: {show: false}
        }

      },

      suiteChartSettings: {
        radius: [50, 80],
        avoidLabelOverlap: false,
        offsetY: 110,
        itemStyle: {
          normal: {
            color: function (params) {
              let colorList = [
                'rgb(25,212,174)', 'rgb(250,110,134)', '#fb2828', '#E87C25', '#27727B',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
              ]
              return colorList[params.dataIndex]
            }
          }
        },
        label: {
          normal: {position: 'center', show: false}
        },
        labelLine: {
          normal: {show: false}
        }
      },

      reportId: '',
      picHeight: '635px',
      picStatus: true,
      active: true,
      showScene: [true, true],
      statusShow: [true, true, true, true, true, true, true, true, true],
      showColor: [],
      attachment: '',
      meta_datas: {
        data: [{
          request: {body: null, url: null, headers: null, data: null, params: null, json: null},
          response: {content: null, json: null, status_code: null}
        }]
      },
      caseChartData: {
        columns: ['caseName', 'num'],
        rows: [
          {'caseName': '成功步骤', num: 0}, {'caseName': '失败步骤', num: 0},
          {'caseName': '错误步骤', num: 0}, {'caseName': '跳过步骤', num: 0}
        ]
      },
      suiteChartData: {
        columns: ['name', 'num'],
        rows: [
          {'name': '成功case', 'num': 0}, {'name': '失败case', 'num': 0}
        ]
      },

      reportData: {
        'details': [{name: ''}],
        'platform': {'duration': '', 'python_version': ''},
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
          'testcases': {'fail': '', 'success': '', 'total': ''}
        },
        'time': {'start_at': '', 'duration': 1, 'start_datetime': ''}

      }
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

    handleCommand(command) {
      // this.getReportDataById(command);
      if (command === 'error') {
        this.showScene = [false, true]
      } else if (command === 'success') {
        this.showScene = [true, false]
      } else {
        this.showScene = [true, true]
      }
    },
    optimizeShow(dict) {
      if (dict) {
        let line = ''
        for (let key in dict) {
          line = line + key + ':' + dict[key] + '\n'
        }
        return line
      }
    },
    showInfo() {
      this.statusShow = [true, true, true, false, false, false, false, false, true]

    },
    showAll() {
      this.statusShow = [true, true, true, true, true, true, true, true, true]

    },
    showError() {
      this.statusShow = [false, false, false, false, false, false, false, false, false]

    },

    // 获取环境配置
    getEnvDict() {
      getConfigByName({'name': 'run_test_env'}).then(response => {
        this.runEnvDict = JSON.parse(response.data.value)
      })
    },

    // 获取测试报告具体内容
    getReportDataById() {
      getReport({'id': this.$route.query.id}).then((response) => {
          // console.log(response)
          if (this.showMessage(this, response)) {
            this.reportData = response['data']
            this.meta_datas = this.reportData['details'][0]['records'][0]['meta_datas']
            this.attachment = this.reportData['details'][0]['records'][0]['attachment']
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

    isShowPic(isShow) {
      if (isShow) {
        this.picStatus = true
        this.picHeight = '635px'
      } else {
        this.picStatus = false
        this.picHeight = '835px'
      }
    }
  },

  // mounted() {
  //   this.getReportDataById()
  // },

  created() {
    this.getEnvDict()
    this.getReportDataById()
  },
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

.remote-line {
  list-style-type: none;
}

.active {
  background: #f7f7f7;
  font-weight: 600;
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
</style>
