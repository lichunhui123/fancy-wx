const service = require('../../service/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    oldPhone:"",//旧手机号
    phone:"",//手机号
    verification:"",//验证码
    buttonState:false,//绑定按钮状态
    isverific:false,//发生验证码状态
    countNum:60,//倒计时
    countState: false,//倒计时状态
  },
  //手机号输入事件
  changePhone(e){
    let regRule = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
    if (e.detail.value.match(regRule)) {
      e.detail.value = e.detail.value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
    }
    e.detail.value = e.detail.value.replace(/[^0-9.]+/, '');
    this.setData({
      phone:e.detail.value.slice(0, 11)
    });
    this.validate();
    if (e.detail.value.length >= 11) {
      this.setData({
        isverific: true
      })
    }else{
      this.setData({
        isverific: false
      })
    }
  },
  //验证码输入事件
  changeVerification(e){
    let regRule = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
    if (e.detail.value.match(regRule)) {
      e.detail.value = e.detail.value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
    }
    this.setData({
      verification:e.detail.value.slice(0, 5)
    });
    this.validate();
  },
  //验证绑定按钮的激活状态
  validate(){
    if (this.data.phone.length >= 11 && this.data.verification.length >= 5) {
      this.setData({
        buttonState: true
      })
    } else {
      this.setData({
        buttonState: false
      })
    }
  },
  //发送验证码
  getVerification(e) {
    if(this.hasVerClick||!this.data.isverific){
      return;
    }
    let phone = this.data.phone;
    let userId = wx.getStorageSync('userId');
    const that = this;
    this.hasVerClick = true;
    wx.showLoading({title:"加载中"});
    // 调接口，调成功倒计时
    service.sendCode({
      phone:phone,
      userId:userId
    }).then((res)=>{
      wx.hideLoading();
      that.hasVerClick = false;
      if (res.data.code === 0) {
        that.setData({
          countState: true
        });
        that.interval = setInterval(() => that.tick(), 1000);
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  //倒计时
  tick() {
    const {countNum} = this.data;
    const that = this;
    this.setData({
      countNum: countNum - 1
    }, () => {
      if (this.data.countNum <= 0) {
        clearInterval(that.interval);
        this.setData({
          countNum: 60,
          isverific: true,
          countState: false
        })
      }
    })
  },
  //绑定按钮点击
  submitButtonFn() {
    if( this.hasBindClick || !this.data.buttonState ){
      return;
    }
    const that = this;
    let phone = this.data.phone;
    let userId = wx.getStorageSync('userId');
    let code = this.data.verification;
    this.hasBindClick = true;
    wx.showLoading({title:"加载中"});
    service.bindPhone({
      phone,
      userId,
      code
    }).then((res)=>{
      wx.hideLoading();
      that.hasBindClick = false;
      if (res.data.code === 0) {
        wx.showToast({
          title: "绑定成功",
          icon: 'none',
          duration: 2000
        });
        that.setData({
          buttonState: false,
        });
        setTimeout(()=>{
          //返回
          wx.navigateBack();
        },2000)
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({oldPhone:options.phone});
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
    wx.hideShareMenu()
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