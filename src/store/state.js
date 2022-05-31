/**
 * 定义需要用vuex管理的状态
 */

// 如果 localStorage.state 有值，则直接使用，否则视为第一次创建 state 对象，避免出现刷新页面时vuex状态丢失的情况，配合app.vue.mounted使用
export const state = localStorage.getItem('state') ? JSON.parse(localStorage.getItem('state')) : {
// export const state = {

  // 用户信息
  userName: null,
  token: null,
  title: '',
  roles: null,

  count: 2,
  minder: {},
  editor: {},
  working: {
    editing: false,
    saving: false,
    draging: false
  },
  callbackQueue: [],
  config: {
    // 右侧面板最小宽度
    ctrlPanelMin: 250,

    // 右侧面板宽度
    ctrlPanelWidth: parseInt(window.localStorage.__dev_minder_ctrlPanelWidth) || 250,

    // 分割线宽度
    dividerWidth: 3,

    // 默认语言
    defaultLang: 'zh-cn',

    // 放大缩小比例
    zoom: [10, 20, 30, 50, 80, 100, 120, 150, 200],

    // 图片上传接口
    imageUpload: 'server/imageUpload.php'
  }
}
