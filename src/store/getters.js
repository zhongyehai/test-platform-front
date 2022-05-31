// const getters = {
//   sidebar: state => state.app.sidebar,
//   device: state => state.app.device,
//   token: state => state.user.token,
//   avatar: state => state.user.avatar,
//   name: state => state.user.name
// }
// export default getters

// export const getters = {
//   sidebar: state => state.app.sidebar,
//   device: state => state.app.device,
//   avatar: state => state.user.avatar,
//
//   token: state => state.user.token,
//   roles: state => state.user.roles,
//   name: state => state.user.userName
// }
// export const getters =  state => {
//   return {
//     sidebar: state.app.sidebar,
//     device: state.app.device,
//     token: state.user.token,
//     avatar: state.user.avatar,
//     name: state.user.name
//   }
// }
//
// export const count = state => {
//   return state.count;
// }
//
// export const working = state => {
//   return {
//     saving: state.working.saving,
//     draging: state.working.draging,
//     editing: state.working.editing
//   }
// }
//
// export const config = state => {
//   return {
//     ctrlPanelMin: state.config.ctrlPanelMin,
//     ctrlPanelWidth: state.config.ctrlPanelWidth,
//     dividerWidth: state.config.dividerWidth,
//     defaultLang: state.config.defaultLang,
//     zoom: state.config.zoom
//   }
// }
//
// export const getMinder = state => {
//   return state.minder
// }
//
// export const getEditor = state => {
//   return state.editor
// }




const getters = {
  // element-admin
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  avatar: state => state.avatar,
  token: state => state.token,
  roles: state => state.roles,
  userName: state => state.userName,

  // 自定义
  count: state => state.count,
  saving: state => state.working.saving,
  draging: state => state.working.draging,
  editing: state => state.working.editing,


  ctrlPanelMin: state => state.config.ctrlPanelMin,
  ctrlPanelWidth: state => state.config.ctrlPanelWidth,
  dividerWidth: state => state.config.dividerWidth,
  defaultLang: state => state.config.defaultLang,
  zoom: state => state.config.zoom,

  minder: state => state.minder,
  editor: state => state.editor,
}
export default getters
