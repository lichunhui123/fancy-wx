const service = require("../../service/index");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId:"",
    icon:"",//头像
    nickname:"用户",//昵称
    phone:"",//手机号
    sexArr:[{id:"1",name:"男"},{id:"2",name:"女"}],//性别集合
    sexIndex:0,//性别选中下标
    sex:0,//性别
    startDate:"1900-01-01",//生日开始日期
    endDate:"",//生日结束日期
    birthday:"",//已选择生日
  },
  //获取用户基本信息
  getCusUserEntity(){
    let t=this;
    wx.showLoading({
      title: '加载中',
    });
    service.getCusUserEntity({
      userId:wx.getStorageSync("userId")
    }).then((res)=>{
      wx.hideLoading();
      this.stopPullDownRefresh();
      if(res.data.result==200){
        let userInfo = res.data.data;
        let sexIndex = 0;
        if(userInfo.sex==1){//男
          sexIndex = 0;
        }else if(userInfo.sex==2){//女
          sexIndex = 1;
        }
        this.setData({
          userId:wx.getStorageSync("userId"),
          icon:userInfo.icon?userInfo.icon:"",//头像
          nickname:userInfo.nickname?userInfo.nickname:"",//昵称
          phone:userInfo.phone?userInfo.phone:"",//手机号
          sexIndex:sexIndex,//性别下标
          sex:userInfo.sex?userInfo.sex:"",//性别
          birthday:userInfo.birthday?userInfo.birthday.substring(0,10):"",//生日
        })
      }else{
        wx.showToast({
          title: '当前网络状态较差，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }

    })
  },
  //跳转绑定手机页面
  toBindPhone(){
    wx.navigateTo({url:"../../pages/personalBindPhone/index"})
  },
  //跳转更换绑定页面
  toChangePhone(){
    wx.navigateTo({url:"../../pages/personalChangePhone/index?phone="+this.data.phone})
  },
  //性别修改
  changeSex(e){
    let t=this;
    this.setData({sexIndex:e.detail.value,sex:t.data.sexArr[e.detail.value]['id']});
    service.updateUserInfo({
      sex:t.data.sexArr[e.detail.value]['id'],
      birthday:t.data.birthday,
      userId:t.data.userId,
    }).then((res)=>{
      if(res.data.result==200){
        wx.showToast({
          title: '性别修改成功',
          icon: 'none',
          duration: 2000
        })
      }else{
        wx.showToast({
          title: '当前网络状态较差，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //生日修改
  changeDate(e){
    let t=this;
    this.setData({birthday:e.detail.value});
    service.updateUserInfo({
      sex:t.data.sex,
      birthday:e.detail.value,
      userId:t.data.userId
    }).then((res)=>{
      if(res.data.result==200){
        wx.showToast({
          title: '生日修改成功',
          icon: 'none',
          duration: 2000
        })
      }else{
        wx.showToast({
          title: '当前网络状态较差，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideShareMenu();
    this.getCusUserEntity();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getCusUserEntity();
  },
  // 停止刷新方法
  stopPullDownRefresh() {
    wx.stopPullDownRefresh({
      complete(res) {
      }
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})