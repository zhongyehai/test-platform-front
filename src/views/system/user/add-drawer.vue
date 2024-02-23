<template>
  <div>
    <el-drawer v-model="drawerIsShow" title="新增用户" size="90%">
      <el-form
          ref="ruleFormRef"
          :model="formData">

        <el-form-item prop="user_list" class="is-required" size="small">
          <el-table
              :data="formData.user_list"
              style="width: 100%"
              stripe
              :height="tableHeight"
              row-key="id">

            <el-table-column label="序号" header-align="center" min-width="4%">
              <template #default="scope">
                <div>{{ scope.$index + 1 }}</div>
              </template>
            </el-table-column>

            <el-table-column  prop="name" align="center" min-width="12%">
              <template slot="header" #header="scope">
                <span><span style="color: red">*</span>用户名</span>
              </template>

              <template #default="scope">
                <el-input v-model="scope.row.name" size="small" />
              </template>
            </el-table-column>

            <el-table-column  prop="account" align="center" min-width="12%">
              <template slot="header" #header="scope">
                <span><span style="color: red">*</span>账号</span>
              </template>
              <template #default="scope">
                <el-input v-model="scope.row.account" size="small" />
              </template>
            </el-table-column>

            <el-table-column  prop="password" align="center" min-width="15%">
              <template slot="header" #header="scope">
                <span><span style="color: red">*</span>密码</span>
              </template>
              <template #default="scope">
                <el-input v-model="scope.row.password" size="small" />
              </template>
            </el-table-column>

            <el-table-column  align="center" min-width="20%">
              <template slot="header" #header="scope">
            <span>
              <span style="color: red">*</span>
              业务线
              <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                <div>
                  <div>1、仅有当前业务线权限的用户才能看到此服务</div>
                  <div>2、若要修改用户业务线权限，需登录管理员账号，在用户管理处修改</div>
                </div>
                <el-button slot="reference" type="text" icon="el-icon-question" />
              </el-popover>
            </span>
              </template>
              <template #default="scope">
                <el-select
                    v-model="scope.row.business_list"
                    multiple
                    filterable
                    default-first-option
                    clearable
                    size="small"
                    style="width: 100%"
                    placeholder="请选择业务线"
                    class="filter-item"
                >
                  <el-option
                      v-for="item in props.businessList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                  />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column  align="center" min-width="15%">
              <template slot="header" #header="scope">
                <span><span style="color: red">*</span>角色</span>
              </template>
              <template #default="scope">
                <el-select
                    v-model="scope.row.role_list"
                    size="small"
                    placeholder="请选择角色"
                    multiple
                    filterable
                    style="width:100%"
                >
                  <el-option
                      v-for="role in roleList"
                      :key="role.name"
                      :label="role.name"
                      :value="role.id"
                  />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column fixed="right"  align="center" label="操作" min-width="8%">
              <template #default="scope">
                <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
                  <el-button
                      v-show="scope.$index === 0 || scope.$index === formData.user_list.length - 1"
                      type="text"
                      size="small"
                      @click.native="addRow"
                  ><i class="iconfont icon-testadd"></i></el-button>
                </el-tooltip>

                <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
                  <el-button
                      v-show="isShowDelButton(scope.$index)"
                      type="text"
                      size="small"
                      style="color: red"
                      @click.native="delRow(scope.$index)"
                  ><i class="iconfont icon-testreduce"></i></el-button>
                </el-tooltip>

                <el-tooltip class="item" effect="dark" placement="top-end" content="清除数据">
                  <el-button
                      v-show="formData.user_list.length === 1"
                      type="text"
                      size="small"
                      style="color: red"
                      @click.native="clearData()"
                  ><i class="iconfont icon-testdelete1"></i></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>

      <template #footer>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
          <el-button
              type="primary"
              size="small"
              :loading="submitButtonIsLoading"
              @click="addData"
          >
            {{ '保存' }}
          </el-button>
        </div>
      </template>

    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {ElMessage} from 'element-plus'
import {bus, busEvent} from "@/utils/bus-events";
import {PostUser} from "@/api/system/user";

const props = defineProps({
  roleList: {
    default: [],
    type: Array
  },
  businessList: {
    default: [],
    type: Array
  },
})

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'addUser') {
    resetForm()
    drawerIsShow.value = true
  }
}

const getNewData = () => {
  return {
    id: `${Date.now()}`,
    name: null,
    account: null,
    password: null,
    role_list: [],
    business_list: []
  }
}

const addRow = () => {
  formData.value.user_list.push(getNewData())
}
const isShowDelButton = (index: number) => {
  return !(formData.value.user_list.length === 1 && index === 0)
}

// 删除一行
const delRow = (index: number) => {
  formData.value.user_list.splice(index, 1)
}

const clearData = () => {
  formData.value.user_list[0] = getNewData()
}


const sendEvent = () => {
  bus.emit(busEvent.drawerIsCommit, {eventType: 'user'});
};

const drawerIsShow = ref(false)
let submitButtonIsLoading = ref(false)
const tableHeight = localStorage.getItem('tableHeight')
const formData = ref({
  user_list: []
})
const validateUserList =  () => {
  if (formData.value.user_list.length === 1 && (
      !formData.value.user_list[0].name &&
      !formData.value.user_list[0].account &&
      !formData.value.user_list[0].password &&
      formData.value.user_list[0].role_list.length < 1 &&
      formData.value.user_list[0].business_list.length < 1)){
    return ElMessage.warning('请填写数据')
  }else {
    for (let index=0; index < formData.value.user_list.length; index++){
      let user = formData.value.user_list[index]
      if (user.name || user.account || user.password || user.role_list.length > 0 || user.business_list.length > 0){
        if (!user.name || !user.account || !user.password || user.role_list.length < 1  || user.business_list.length < 1){
          return ElMessage.warning(`请完善第 ${index + 1} 行数据`)
        }
      }
    }
  }
}

const resetForm = () => {
  formData.value = {
    user_list: [getNewData()]
  }
}


const addData = () => {
  if (!validateUserList()) {
    submitButtonIsLoading.value = true
    PostUser(formData.value).then(response => {
      submitButtonIsLoading.value = false
      if (response) {
        sendEvent()
        drawerIsShow.value = false
      }
    })
  }
}

</script>


<style scoped lang="scss">

</style>
