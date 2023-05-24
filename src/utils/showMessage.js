exports.install = function(Vue) {
  // 删除内容确认框
  Vue.prototype.confirmBox = function(func, arg, msg) {
    this.$confirm(`此操作将永久删除 <strong style="color: red;"> ${msg} </strong> ,是否继续?`, '提示', {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      func(arg)
    }).catch(() => {
    })
  }

  // 根据接口响应状态弹框提示业务处理状态
  Vue.prototype.showMessage = function(_this, response) {
    // 根据响应信息的状态码，以不同状态的弹框提示message
    if (response.status >= 500) {
      _this.$message({ showClose: true, message: response.message, type: 'error' })
      return false
    } else if (response.status >= 400) {
      _this.$message({ showClose: true, message: response.message, type: 'warning' })
      return false
    } else {
      _this.$message({ showClose: true, message: response.message, type: 'success' })
      return true
    }
  }
}
