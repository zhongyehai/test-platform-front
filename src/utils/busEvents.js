// bus监听事件常量方式

export default {

  // 缓存数据
  data: {
    permissions: [], // 用户的前端权限地址

    dataTypeMappingList: [], // 数据类型枚举
    skipIfTypeMappingList: [], // 跳过类型枚举

    responseDataSourceMappingList: [], // 接口响应数据源枚举

    apiTestAssertMappingList: [], // 接口自动化断言方法映射

    uiTestExecuteTypeDict: {}, // ui自动化执行类型

    uiTestExtractMappingList: [], // ui自动化数据提取方法映射
    uiTestExtractMappingDict: {}, // ui自动化数据提取方法映射

    assertMappingList: [], // ui自动化断言方法映射
    assertMappingDict: {}, // ui自动化断言方法映射

    findElementOptionList: [], // ui自动化的定位方式
    findElementOptionDict: {}, // ui自动化的定位方式

    runServerList: [], // app自动化运行服务器
    runPhoneList: [], // app自动化运行手机
    runBrowserNameDict: {}, // ui自动化运行浏览器

    keyboardKeyCodeList: [] // 模拟键盘输入code
  },

  // 抽屉
  drawerIsShow: 'drawerIsShow', // 打开抽屉
  drawerIsCommit: 'drawerIsCommit', // 抽屉已提交
  drawerIsOpen: 'drawerIsOpen', // 同步抽屉打开状态

  // 下拉框
  selectorChoice: 'selectorChoice', // 下拉框选中事件

  // 树
  treeIsChoice: 'treeIsChoice', // 树选中事件
  treeIsDone: 'treeIsDone', // 树组装完成事件

  quoteCaseToStep: 'quoteCaseToStep', // 引用用例事件
  changeData: 'changeData' // 监听的数据发生了改变
}
