let config = require("../../config.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    declarativeValueAmount:"",//保价
    guaranteeValueAmount:0,//保费
  },
  //保价输入框校验e
  changeDeclarativeValueAmount(e){
    e.detail.value = e.detail.value.replace(/[^0-9.]+/, '');
    console.log(e.detail.value.replace(/[^0-9.]+/, ''))
    if(e.detail.value>300000){
      wx.showToast({
        title: "请输入30万元以下的保价（包含30万）",
        icon: 'none',
        duration: 2000
      });
      e.detail.value=e.detail.value.substring(0,e.detail.value.length-1);
    }
    let declarativeValueAmount=e.detail.value;
    this.setDeclarativeValueAmount(declarativeValueAmount);
  },
  setDeclarativeValueAmount(declarativeValueAmount){
    let cost=0;
    if(declarativeValueAmount>0&&declarativeValueAmount<=500){
      cost=1;
    }
    if(declarativeValueAmount>500&&declarativeValueAmount<=1000){
      cost=2;
    }
    if(declarativeValueAmount>1000){
      cost=Math.round(declarativeValueAmount*0.005);
    }
    this.setData({
      declarativeValueAmount:declarativeValueAmount,//物品声明价值
      guaranteeValueAmount:cost//保费
    })
  },
  //确定
  sure(){
    // if(!this.data.declarativeValueAmount){
    //   wx.showToast({
    //     title: "请输入保价",
    //     icon: 'none',
    //     duration: 2000
    //   });
    //   return;
    // }
    let expressInfo=wx.getStorageSync("expressInfo");
    expressInfo.declarativeValueAmount=this.data.declarativeValueAmount;//物品声明价值
    expressInfo.guaranteeValueAmount=this.data.guaranteeValueAmount;//保费
    wx.setStorageSync("expressInfo",expressInfo);
    wx.navigateBack();
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
    let expressInfo=wx.getStorageSync("expressInfo");
    if(expressInfo.declarativeValueAmount){
      this.setDeclarativeValueAmount(expressInfo.declarativeValueAmount);
    }
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