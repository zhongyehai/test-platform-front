<template>
  <div class="item">
    <div class="title">
<!--      <div class="tags">-->
<!--        <div class="tag" v-for="(tag, key) in data.tags" :key="key" :style="{ 'background': colorInit(tag) }">{{-->
<!--            tag-->
<!--          }}-->
<!--        </div>-->
<!--      </div>-->
      {{ data.title }}
      <div style="float: right">
        <el-button @click="showDetail(data.id)">{{data.status === 'todo' ? '编辑' : '详情' }}</el-button>
      </div>
    </div>
    <div class="options">
      <p v-for="(option, key) in data.options" :key="key">{{ option }}</p>
      <p>{{ userDict[data.create_user] }} 创建于 {{ data.create_time }}</p>
      <p v-if="data.status == 'done'">{{ userDict[data.done_user] }} 完成于 {{ data.done_time }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import {bus, busEvent} from "@/utils/bus-events";

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => {
      return {
        title: '',
        tags: [],
        options: []
      }
    }
  },
  status: {
    type: String,
    required: true,
    default: 'todo'
  },
  userDict: {
    type: Object,
    default: {}
  }
})

const colorInit = computed(() => {
  return (tag: string) => {
    const array = [
      {color: '#57c05d', tag: '新增'},
      {color: '#67a4dc', tag: '优化'}
    ]
    const obj = array.find(obj => {
      return obj.tag === tag
    })
    return obj && obj.tag ? obj.color : '#67a4dc'
  }
})

const showDetail = (dataId: number) => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'edit-todo', content: dataId});
}

</script>

<style lang="scss" scoped>
.item {
  background: #fff;
  width: calc(100% - 40px);
  min-height: 50px;
  margin-bottom: 15px;
  border-radius: 8px;
  padding: 10px 15px;
  overflow: hidden;
  white-space: normal;
  cursor: pointer;

  .tags {
    display: inline-block;
    margin-right: 10px;

    .tag {
      color: #fff;
      border-radius: 16px;
      padding: 2px 8px;
      height: 26px;
      line-height: 26px;
      font-weight: 400;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      border: 1px solid transparent;
    }
  }

  .title {
    font-size: 16px;
    margin-right: 8px;
    line-height: 20px;
  }

  .options {
    font-size: 12px;
    color: #999;
    padding-top: 10px;
  }
}
</style>
