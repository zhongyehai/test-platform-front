// bus监听事件常量方式

export default {
  // 接口测试
  api: {
    // 树组件
    apiProjectTreeChoiceProject: 'apiProjectTreeChoiceProject',  // 服务树选中服务事件
    apiModuleTreeIsDone: 'apiModuleTreeIsDone',  // 模块树组装完成事件
    // 下拉框
    apiProjectSelectorChoiceProject: 'apiProjectSelectorChoiceProject',  // 服务下拉框选中服务事件
    apiModuleSelectorChoiceModule: 'apiModuleSelectorChoiceModule',  // 模块下拉框选中模块事件
    apiMethodSelectorChoiceMethod: 'apiMethodSelectorChoiceMethod',  // 请求方法下拉框选中请求方法事件
    // 服务
    apiShowProjectDrawer: 'apiShowProjectDrawer',  // 服务抽屉的状态，新增/编辑
    apiClickProjectEnv: 'apiClickProjectEnv',  // 服务环境编辑
    apiShowEnvSynchronizer: 'apiShowEnvSynchronizer',  // 服务环境同步编辑
    apiEnvSynchronizerIsSuccess: 'apiEnvSynchronizerIsSuccess',  // 服务环境同步完成
    apiProjectDrawerCommitSuccess: 'apiProjectDrawerCommitSuccess',  // 服务抽屉的提交状态
    apiEnvIsCommit: 'apiEnvIsCommit',  // 服务环境的提交状态
    apiSaveProjectEnv: 'apiSaveProjectEnv',  // 服务环境的提交状态
    // 接口
    apiApiDrawerStatus: 'apiApiDrawerStatus',  // 接口抽屉的状态，新增/编辑
    apiApiDrawerCommitSuccess: 'apiApiDrawerCommitSuccess',  // 接口抽屉的提交状态
    // 用例集
    apiCaseSetTreeIsDone: 'apiCaseSetTreeIsDone',  // 用例集树组装完成事件
    // 用例
    apiCaseDrawerStatus: 'apiCaseDrawerStatus',  // 用例抽屉的状态，新增/编辑
    apiCaseDrawerCommitSuccess: 'apiCaseDrawerCommitSuccess',  // 用例抽屉的提交状态
    // 步骤
    apiIsAddStepTriggerSaveCase: 'apiIsAddStepTriggerSaveCase',  // 在添加步骤时触发的 保存用例，这个时候保存后不关闭 用例的抽屉
    apiAddApiToStep: 'apiAddApiToStep', // 接口转为步骤
    apiEditStep: 'apiEditStep', // 编辑步骤
    apiAddStepIsCommit: 'apiAddStepIsCommit', // 新增步骤提交
    apiEditStepIsCommit: 'apiEditStepIsCommit', // 编辑步骤提交
    // 函数文件
    apiAddFuncFileDrawerIsShow: 'apiAddFuncFileDrawerIsShow',  // 打开新增函数文件框
    apiEditFuncFileData: 'apiEditFuncFileData',  // 编辑函数文件内容
    apiEditFuncFileIsCommit: 'apiEditFuncFileIsCommit',  // 编辑函数文件已经提交
    apiAddFuncFileIsCommit: 'apiAddFuncFileIsCommit',  // 新增函数文件已经提交
    // 定时任务
    apiTaskDrawerIsShow: 'apiTaskDrawerIsShow',  // 打开定时任务编辑框
    apiTaskDrawerIsCommit: 'apiTaskDrawerIsCommit',  // 定时任务已提交
  },

  // 配置管理
  config: {
    configDrawerIsShow: 'configDrawerIsShow',  // 打开配置编辑框
    configDrawerIsCommit: 'configDrawerIsCommit',  // 配置已提交
  },

  // 文件管理
  file: {
    uploadFileDialogIsShow: 'uploadFileDialogIsShow',  // 打开文件上传
    uploadFileIsCommit: 'uploadFileIsCommit',  // 文件上传已提交
  },

  // ui测试
  ui: {
    // 树组件 监听事件
    uiModuleTreeIsDone: 'uiModuleTreeIsDone',  // 模块树组装完成事件
    uiProjectTreeChoiceProject: 'uiProjectTreeChoiceProject',  // 项目树选择事件
    // 项目
    uiShowApiProjectDrawer: 'uiShowApiProjectDrawer',  // 服务抽屉的状态，新增/编辑
    uiClickApiProjectEnv: 'uiClickApiProjectEnv',  // 服务环境编辑
    uiShowEnvSynchronizer: 'uiShowEnvSynchronizer',  // 服务环境同步编辑
    uiEnvSynchronizerIsSuccess: 'uiEnvSynchronizerIsSuccess',  // 服务环境同步完成
    uiProjectDialogCommitSuccess: 'uiProjectDialogCommitSuccess',  // 服务抽屉的提交状态
    uiSaveProjectEnv: 'uiSaveProjectEnv',  // 保存服务环境
    uiEnvIsCommit: 'uiEnvIsCommit',  // 服务环境的提交状态
    // 页面
    uiPageDrawerIsOpen: 'uiPageDrawerIsOpen',  // 页面抽屉打开
    uiPageDrawerStatus: 'uiPageDrawerStatus',  // 页面抽屉的状态，新增/编辑
    uiPageDrawerCommitSuccess: 'uiPageDrawerCommitSuccess',  // 页面抽屉的提交状态
    // 元素
    uiElementDrawerStatus: 'uiElementDrawerStatus',  // 元素抽屉的状态，新增/编辑
    uiElementDrawerCommitSuccess: 'uiElementDrawerCommitSuccess',  // 元素抽屉的提交状态
    uiElementIsUrl: 'uiElementIsUrl',  // 元素是url
    // 用例集
    uiCaseSetTreeIsDone: 'uiCaseSetTreeIsDone',
    // 用例
    uiCaseDrawerStatus: 'uiCaseDrawerStatus',
    uiCaseDrawerCommitSuccess: 'uiCaseDrawerCommitSuccess',
    uiIsAddStepTriggerSaveCase: 'uiIsAddStepTriggerSaveCase',
    uiQuoteCaseToStep: 'uiQuoteCaseToStep',
    // 步骤
    uiShowStepDrawer: 'uiShowStepDrawer',
    uiAddStepIsCommit: 'uiAddStepIsCommit', // 新增步骤提交事件，把此步骤添加到步骤列表
    uiEditStepIsCommit: 'uiEditStepIsCommit', // 修改步骤提交事件，更改对应的步骤数据
    uiGetElementByPage: 'uiGetElementByPage', // 根据页面id获取元素

    // 定时任务
    uiTaskDrawerIsShow: 'uiTaskDrawerIsShow',  // 打开定时任务编辑框
    uiTaskDrawerIsCommit: 'uiTaskDrawerIsCommit',  // 定时任务已提交
  },

  // 缓存数据
  data: {
    configTypeList: [], // 配置类型列表
    userDict: {},  // 用户数据
    executeTypeList: [],  // ui自动化步骤的执行方式
    executeTypeDict: {},  // ui自动化步骤的执行方式
    // extractTypeList: [],  // ui自动化数据提取方式
    // extractTypeDict: {},  // ui自动化数据提取方式
    extractMappingList: [],  // ui自动化数据提取方法映射
    extractMappingDict: {},  // ui自动化数据提取方法映射
    assertMappingList: [],  // ui自动化断言方法映射
    assertMappingDict: {},  // ui自动化断言方法映射
    findElementOptionList: [],  // ui自动化的定位方式
    findElementOptionDict: {},  // ui自动化的定位方式
  },

}
