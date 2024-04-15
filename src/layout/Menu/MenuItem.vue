<template>
  <template v-if="!menu.hideMenu">
    <el-sub-menu v-if="showMenuType === 2" :index="pathResolve" :show-timeout="0" :hide-timeout="0">
      <template #title>
        <component class="el-menu-item-icon" :is="getIcon(menu.meta.icon)" v-if="menu.meta.icon"></component>
        <span>{{ menu.meta.title }}</span>
      </template>
      <menu-item v-for="(item, key) in menu.children" :key="key" :menu="item" :basePath="pathResolve" />
    </el-sub-menu>
    <app-link v-else-if="showMenuType === 1" :to="pathResolve">
      <el-menu-item :index="pathResolve" v-if="!menu.children[0].children || menu.children[0].children.length === 0">
        <component class="el-menu-item-icon" :is="getIcon(menu.children[0].meta.icon || menu.meta.icon)" v-if="menu.children[0].meta.icon || menu.meta.icon"></component>
        <template #title>{{ menu.children[0].meta.title }}</template>
      </el-menu-item>
      <el-sub-menu v-else :index="pathResolve" :show-timeout="0" :hide-timeout="0">
        <template #title>
          <component class="el-menu-item-icon" :is="getIcon(menu.children[0].meta.icon || menu.meta.icon)" v-if="menu.children[0].meta.icon || menu.meta.icon"></component>
          <span>{{ menu.children[0].meta.title }}</span>
        </template>
        <menu-item v-for="(item, key) in menu.children[0].children" :key="key" :menu="item" :basePath="pathResolve" />
      </el-sub-menu>
    </app-link>
    <app-link v-else :to="pathResolve">
      <el-menu-item :index="pathResolve">
        <component class="el-menu-item-icon" :is="getIcon(menu.meta.icon)"></component>
        <template #title>{{ menu.meta.title }}</template>
      </el-menu-item>
    </app-link>
  </template>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import * as iconPark from '@icon-park/vue-next';
import appLink from './Link.vue'
import { isBackMenu } from '@/config'
export default defineComponent({
  name: 'menu-item',
  props: {
    menu: {
      type: Object,
      required: true
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  components: {
    appLink
  },
  setup(props) {
    const menu = props.menu
    // console.log('menu: ', menu)
    // todo: 优化if结构
    const showMenuType = computed(() => { // 0: 无子菜单， 1：有1个子菜单， 2：显示上下级子菜单
      if (menu.children && (menu.children.length > 1 || (menu.children.length === 1 && menu.alwayShow))) {
        return 2
      } else if (menu.children && menu.children.length === 1 && !menu.alwayShow) {
        return 1
      } else {
        return 0
      }
    })
    // todo: 优化多层if
    const pathResolve = computed(() => {
      let path = ''
      if (showMenuType.value === 1) {
        if (menu.children[0].path.charAt(0) === '/') {
          path = menu.children[0].path
        } else {
          let char = '/'
          if (menu.path.charAt(menu.path.length - 1) === '/') {
            char = ''
          }
          path = menu.path + char + menu.children[0].path
        }
      } else {
        path = menu.path
      }
      path = props.basePath ? props.basePath + '/' + path : path
      return path
    })

    const getIcon = (iconName: string) => {
      const normalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
      return iconPark[normalizedIconName] || null;
    }

    return {
      showMenuType,
      pathResolve,
      isBackMenu,
      getIcon
    }
  }
})
</script>

<style lang="scss" scoped>
.el-sub-menu {
  text-align: left;
}
.el-menu-item {
  text-align: left;
}
.el-menu-item .el-menu-item-icon,
.el-sub-menu__title .el-menu-item-icon {
  padding-right: 8px;
  display: grid;
  place-items: center; /* 将内容垂直居中 */
}

</style>
