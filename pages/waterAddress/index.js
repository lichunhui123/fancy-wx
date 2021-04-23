// pages/waterAddress/index.js
const service = require('../../service/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    source:"",//页面来源
    nodata:false,  //没有数据
    addressList:[],  //地址列表
    addid:'',  //编辑时的addid
    ecChoose:'', //电商地址页
  },
  //修改地址更改状态
  setWaterOrderAmend(){
    let isaddress = wx.getStorageSync('isaddress')
    if(isaddress){
      service.setwaterorderamend({
        address: `${isaddress.provinceName == isaddress.cityName ? isaddress.cityName : isaddress.provinceName + isaddress.cityName}${isaddress.districtName}${isaddress.address}`,
        cityName:isaddress.cityName,
        userId: wx.getStorageSync('userId')
      }).then(res=>{
      })
    }
  },
  //地址点击
  addreddClick(e){
    if(this.data.source=="personal"){//页面来源我的页面
      return;
    }
    let data = e.currentTarget.dataset.itemdata
    if(this.data.orderCode){//如果是订单详情页面点击进入的话此处需要跳转至确认地址修改页面
      wx.navigateTo({
        url: `/pages/personalEditOrder/index?orderCode=${this.data.orderCode}&addressInfo=${JSON.stringify(data)}`,
      });
      return;
    }
    wx.setStorageSync('isaddress', data)
    this.setWaterOrderAmend()
    wx.navigateBack({})
  },
  //编辑地址
  addsedit(e){
    let item=e.currentTarget.dataset.itemaddid
    console.log(item)
    wx.setStorageSync('isdefault', '')
    this.setData({
      addid:item.addId
    })
    if(item.isDefault==1){
      wx.navigateTo({
        url: '/pages/waterAddaddress/index?type=2&toler=3&addid='+item.addId,
      })
    }else{
      wx.navigateTo({
        url: '/pages/waterAddaddress/index?type=2&toler=1&addid='+item.addId,
      })
    }
    
  },

  //添加地址
  addAddress(){
    if (this.data.addressList.length>=10){
      wx.showToast({
        title: '最多添加10条地址~',
        icon: 'none'
      })
      return
    }else{
      wx.navigateTo({
        url: '/pages/waterAddaddress/index?type=1&toler=1',
      })
    }
  },
  //第一次添加地址
  oneAddAddress(){
      wx.navigateTo({
        url: '/pages/waterAddaddress/index?type=1&toler=3',
      })
  },
  //删除地址
  delAddress(e) {
    let addid = e.currentTarget.dataset.itemaddid
    let isDefault = e.currentTarget.dataset.adddefault
    // let inde = e.currentTarget.dataset.inde
    wx.showModal({
      content: '确定删除？',
      cancelColor: "#999999",
      confirmColor: '#F2922F',
      success: (res) => {
        if (res.confirm) {
          service.getwateraddresslist({
            "platform": "wx",
            "requestCode": 1002,  //删除
            "params": JSON.stringify({ id: addid })
          }).then(res => {
            if (res.data.result == 0||res.data.result==200) {
              // this.data.addressList.splice(inde, 1)
              // this.setData({
              //   addressList: this.data.addressList
              // })
              // if (this.data.addressList.length<1){
                this.getAddreddList()
              if (isDefault==1){
                wx.setStorageSync('isdefault', '')
                this.getAddreddList(1)
              }
              wx.setStorageSync('isaddress', '')
            }
          })
        }
      }
    })
  },
  //删除默认将下个地址设为默认
  setAddreddList() {
    let lists=this.data.addressList
    if(lists.length>0){
      let data={
        userid: wx.getStorageSync('userId'),
        id:lists[0].addId,
        name: lists[0].name,
        phone: lists[0].phone,
        address: lists[0].address,
        isDefault: 1,
        provinceName: lists[0].provinceName,
        cityName: lists[0].cityName,
        districtName: lists[0].districtName,
      }
        service.getwateraddresslist({
          "platform": "wx",
          "requestCode": 1001,
          "params": JSON.stringify(data)
        }).then(res => {
          if (res.data.result == 0 || res.data.result == 200) {
            this.getAddreddList()
          }
        })
    }
  },
  //获取地址列表
  getAddreddList(isDefault){
    wx.showLoading({
      title: '加载中',
    })
    service.getwateraddresslist({
      "platform": "wx",
      "requestCode": 1004,
      "params": "{userId:" + wx.getStorageSync('userId') + ",pageNo:1,pageSize:20}"
    }).then(res=>{
      wx.hideLoading()
      if (res.data.result == 0 || res.data.result == 200){
        this.setData({
          addressList:res.data.data
        },()=>{
          if(isDefault==1){
            this.setAddreddList()
          }
        })
        if(res.data.data.length>0){
          res.data.data.forEach(item=>{
            if (item.isDefault==1){
              wx.setStorageSync('isdefault', item)
            }
            if (wx.getStorageSync('isaddress')) { 
              if (wx.getStorageSync('isaddress').addId == item.addId) {  //获取地址列表时如果本地已经存过地址，需要重新更新地址信息
                wx.setStorageSync('isaddress', item)
                this.setWaterOrderAmend()
              }
            }
          })
        }
        if (!res.data.data || res.data.data.length < 1) {
          this.setData({
            nodata: true
          })
        } else {
          this.setData({
            nodata: false
          })
        }
      }else{
        this.setData({
          nodata: false
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.source){//从个人中心进入
      this.setData({
        source:options.source
      })
    }
    if(options.ecChoose){//从提交订单页面点击地址进入
      this.setData({
        ecChoose:options.ecChoose
      })
    }
    if(options.orderCode){//从我的订单详情页面点击修改订单进入
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
      this.getAddreddList()
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