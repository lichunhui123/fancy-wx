// pages/personalEditOrder/index.js
const service = require('../../service/index.js');
const wxDiscode = require('../../wxParse/wxDiscode.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderCode:"",//订单编号
    receiveAddressId:"",//地址ID
    name:"",//收货人
    phone:"",//收货电话
    province:"",//省
    city:"",//市
    district:"",//区
    address:"",//详细地址
    submit:false,
  }, 
  //点击确认修改按钮
  sureEdit(){
    if(!this.submit){
      wx.showLoading({title:"请求中..."});
      this.submit = true;
      service.editOfcOrder({
        orderCode:this.data.orderCode,//订单编码
        receiveAddressId:this.data.receiveAddressId,//地址ID
      }).then((res)=>{
        wx.hideLoading();
        this.submit = false;
        if(res.data.result==200){
          wx.navigateBack({//返回到订单详情页面
            delta:2
          })
        }else{
          wx.showToast({
            title: res.data.message,
            icon: 'none',
          })
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.addressInfo){
      let addressInfo = JSON.parse(options.addressInfo);
      this.setData({
        receiveAddressId:addressInfo.addId,//地址ID
        name:addressInfo.name,//收货人
        phone:addressInfo.phone,//收货地址
        province:addressInfo.provinceName,//省
        city:addressInfo.cityName,//市
        district:addressInfo.districtName,//区
        address:addressInfo.address,//详细地址
      })
    }
    if(options.orderCode){//订单编号
      this.setData({
        orderCode:options.orderCode
      })
    }
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