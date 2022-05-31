// 测试过时间未运行结束的提示
export function runTestTimeOutMessage(that){
  return {
    title: '测试长时间未运行结束',
    dangerouslyUseHTMLString: true,
    message: '测试【<span style="color: red">' + that.$busEvents.runTimeout + '</span>】秒内未运行结束，有以下2种情况，请确认<br>' +
      '1、用例解析过程中，执行自定义函数报错，此情况请到【<span style="color: red">执行错误记录</span>】查看详细信息，并修改自定义函数<br>' +
      '2、测试用例本身运行时间就应该超过【' + that.$busEvents.runTimeout + '】秒，此情况请等待测试执行结束并到【<span style="color: red">测试报告</span>】页查看测试报告<br>',
    type: 'warning',
    duration: 0
  }
}
