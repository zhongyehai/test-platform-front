<template>
  <div style="margin: 20px">
    <el-select v-model="mineStatus" placeholder="请选择" size="mini">
      <el-option :value="mineStatusValue" style="height: auto">//option展开高度太小，把height设置为auto就好啦
        <el-tree
          ref="setTree"
          :data="data"
          show-checkbox
          node-key="id"
          check-strictly
          highlight-current
          :props="defaultProps"
          :default-expanded-keys="[]"
          :default-checked-keys="[]"
          @check-change="handleNodeClick"
        ></el-tree>
      </el-option>
    </el-select>
  </div>

</template>
<script>
export default {
  data() {
    return {
      mineStatus: "",
      mineStatusValue: [],
      set_id: '',
      data: [
        {
          id: 1,
          name: "一级 1",
          children: [
            {
              id: 4,
              name: "二级 1-1"
            }
          ]
        },
        {
          id: 2,
          name: "一级 2",
          children: [
            {
              id: 5,
              name: "二级 2-1"
            },
            {
              id: 6,
              name: "二级 2-2"
            }
          ]
        },
        {
          id: 3,
          name: "一级 3",
          children: [
            {
              id: 7,
              name: "二级 3-1"
            },
            {
              id: 8,
              name: "二级 3-2"
            }
          ]
        }
      ],
      defaultProps: {
        children: "children",
        label: "name"
      }
    };
  },
  methods: {

    // 勾选树事件
    handleNodeClick(data, checked, node) {
      if (checked) {
        this.$refs.setTree.setCheckedKeys([data.id])
        this.mineStatus = data.name
      }
    }
  }
};
</script>
