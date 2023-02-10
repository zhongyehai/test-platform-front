// bus监听事件常量方式

export default {

  // 缓存数据
  data: {
    executeTypeList: [],  // ui自动化步骤的执行方式
    executeTypeDict: {},  // ui自动化步骤的执行方式

    extractMappingList: [],  // ui自动化数据提取方法映射
    extractMappingDict: {},  // ui自动化数据提取方法映射

    assertMappingList: [],  // ui自动化断言方法映射
    assertMappingDict: {},  // ui自动化断言方法映射

    findElementOptionList: [],  // ui自动化的定位方式
    findElementOptionDict: {},  // ui自动化的定位方式
  },

  // 抽屉
  drawerIsShow: 'drawerIsShow',  // 打开抽屉
  drawerIsCommit: 'drawerIsCommit',  // 抽屉已提交
  drawerIsOpen: 'drawerIsOpen',  // 同步抽屉打开状态

  // 下拉框
  selectorChoice: 'selectorChoice',  // 下拉框选中事件

  // 树
  treeIsChoice: 'treeIsChoice', // 树选中事件
  treeIsDone: 'treeIsDone',  // 树组装完成事件

  quoteCaseToStep: 'quoteCaseToStep',  // 引用用例事件
  changeData: 'changeData',  // 监听的数据发生了改变
}
