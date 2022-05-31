exports.install = function (Vue) {

  // 删除内容确认框
  Vue.prototype.confirmBox = function (func, arg, msg) {
    this.$confirm(`此操作将永久删除 <strong style="color: red;"> ${msg} </strong> ,是否继续?`, '提示', {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      func(arg);
    }).catch(() => {
    });
  };

  // 根据接口响应状态弹框提示业务处理状态
  Vue.prototype.showMessage = function (_this, response) {
    // 根据响应信息的状态码，以不同状态的弹框提示message
    if (response.status >= 500) {
      _this.$notify.error(response.message);
      return false
    } else if (response.status >= 400) {
      _this.$notify.warning(response.message);
      return false
    } else {
      _this.$notify.success(response.message);
      return true
    }
  };

  // 显示接口业务响应状态为2xx的信息
  Vue.prototype.showSuccess = function (_this, response) {
    if (response.status < 300) {
      _this.$notify.success(response.message);
      return true
    }
  };

  // 显示接口业务响应状态为4xx的信息
  Vue.prototype.showFail = function (_this, response) {
    if (400 <= response.status < 500) {
      _this.$notify.warning(response.message);
      return true
    }
  };

  // 显示接口业务响应状态为5xx的信息
  Vue.prototype.showErrorResponse = function (_this, response) {
    if (400 <= response.status < 500) {
      _this.$notify.error(response.message);
      return true
    }
  };

  // 显示接口业务响应状态为5xx的信息
  Vue.prototype.showError = function (_this, message) {
    _this.$notify.error(message);
  };

};
