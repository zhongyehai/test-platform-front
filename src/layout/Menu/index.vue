<template>
  <el-scrollbar>
    <el-menu
      class="layout-menu system-scrollbar"
      background-color="var(--system-menu-background)"
      text-color="var(--system-menu-text-color)"
      active-text-color="var(--system-primary-color)"
      :default-active="activeMenu"
      :class="isCollapse? 'collapse': ''"
      :collapse="isCollapse"
      :collapse-transition="false"
      :unique-opened="expandOneMenu"
    >
      <menu-item v-for="(menu, key) in allRoutes" :key="key" :menu="menu" />
    </el-menu>
  </el-scrollbar>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import MenuItem from './MenuItem.vue'
export default defineComponent({
  components: {
    MenuItem
  },
  setup() {
    const isAdmin: string = localStorage.getItem('isAdmin') || '0'
    const userPermissions: Array = JSON.parse(localStorage.getItem('permissions') || '[]')  // 用户的权限
    const store = useStore()
    const isCollapse = computed(() => store.state.app.isCollapse)
    const expandOneMenu = computed(() => store.state.app.expandOneMenu)
    const allRoutes = useRouter().options.routes

    // 把没有权限的菜单标记为隐藏，不展示给用户
    let menuPath = ''
    const filterMenu = (routes: any[]) => {
      if (routes instanceof Array){
        routes.forEach(menu => {
          if (menu.redirect){  // 一级菜单
            menuPath = menu.path
            if (isAdmin !== '1' && userPermissions.indexOf(menu.path) === -1){
              menu.hideMenu = true
            }
          }
          if (menu.children){  // 有子菜单
            menu.children.forEach((childMenu: any[]) => {
              filterMenu(childMenu)
            })
          }
        })
      }else {
        if (isAdmin !== '1' && userPermissions.indexOf(`${menuPath}/${routes.path}`) === -1){
          routes.hideMenu = true
        }
      }
    }
    filterMenu(allRoutes)

    // TODO 去除没有权限的路由地址
    const route = useRoute()
    const activeMenu: any = computed(() => {
      const { meta, path } = route;
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    });
    onMounted(() => {

    })
    return {
      isCollapse,
      expandOneMenu,
      allRoutes,
      activeMenu,
    }
  }
})
</script>

<style lang="scss" scoped>
  .el-scrollbar {
    background-color: var(--system-menu-background);
  }
  .layout-menu {
    width: 100%;
    border: none;
    &.collapse {
      margin-left: 0px;
    }
    :deep() {
      .el-menu-item, .el-sub-menu {
        background-color: var(--system-menu-background) !important;
      }
      .el-menu-item i, .el-menu-item-group__title, .el-sub-menu__title i {
        color: var(--system-menu-text-color);
      }
      .el-menu-item, .el-sub-menu__title{
        &.is-active {
          background-color: var(--system-primary-color) !important;
          color: var(--system-primary-text-color) !important;
          i {
            color: var(--system-primary-text-color) !important;
          }
          &:hover {
            background-color: var(--system-primary-color) !important;
            color: var(--system-primary-text-color) !important;
          }
        }
        &:hover {
          background-color: var(--system-menu-hover-background) !important;
        }
      }
      .el-sub-menu {
        &.is-active {
          >.el-sub-menu__title, >.el-sub-menu__title i {
            color: var(--system-menu-submenu-active-color) !important;
          }
        }
        .el-menu-item {
          background-color: var(--system-menu-children-background) !important;
          &.is-active {
            background-color: var(--system-primary-color) !important;
            color: var(--system-primary-text-color) !important;
            &:hover {
              background-color: var(--system-primary-color) !important;
              color: var(--system-primary-text-color) !important;
            }
          }
          &:hover {
            background-color: var(--system-menu-hover-background) !important;
          }
        }
        .el-sub-menu {
          .el-sub-menu__title {
            background-color: var(--system-menu-children-background) !important;
            &:hover {
              background-color: var(--system-menu-hover-background) !important;
            }
          }
        }
      }
    }
  }
</style>
