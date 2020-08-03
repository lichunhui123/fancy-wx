// pages/addressbook/index.js
const service = require('../../service/index.js');
const App = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    itemData: [],
    userid:'',  //用户id
    type:null,  //地址簿类型
    addscode:'', //寄件人=1  收件人=2
  },
  //点击地址跳转
  clickitem(e) {
    let it=e.currentTarget.dataset.inda
    console.log(it)
    let expressInfo=wx.getStorageSync("expressInfo")
    if(it.type==1001){ //寄件人
      expressInfo.sendAddress=it
      wx.setStorageSync("expressInfo", expressInfo)
    }
    if(it.type==2001){  //收件人
      expressInfo.receiveAddress = it
      wx.setStorageSync("expressInfo", expressInfo)
    }
    wx.navigateBack({  //返回发快递页
      delta:1
    })
  },
  //添加地址
  add_submit(){
    let addstype=this.data.type
    wx.navigateTo({
      url: '/pages/expressAddaddress/index?editcode=1&type='+addstype,
    })
  },
  //编辑地址
  addsedit(e){
    let addstype = this.data.type
    let itemdetail= e.currentTarget.dataset.itemdetail
    wx.navigateTo({
      url: '/pages/expressAddaddress/index?editcode=2&type=' + addstype +'&editdata=' + JSON.stringify(itemdetail),
    })
  },
  touchS: function (e) {  // touchstart
    let startX = App.Touches.getClientX(e)
    startX && this.setData({ startX })
  },
  touchM: function (e) {  // touchmove
    let itemData = App.Touches.touchM(e, this.data.itemData, this.data.startX)
    itemData && this.setData({ itemData })

  },
  touchE: function (e) {  // touchend
    const width = 140  // 定义操作列表宽度
    let itemData = App.Touches.touchE(e, this.data.itemData, this.data.startX, width)
    itemData && this.setData({ itemData })
  },
  itemDelete (e) {  // itemDelete
    let itemid = e.currentTarget.dataset.id
    wx.showModal({
      title:"提示",
      content: '确定删除此地址？',
      cancelColor: "#999999",
      confirmColor: "#F2922F",
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定')
          service.deleteaddress({
            id: itemid
          }).then((res) => {
            console.log(res)
            if (res.data.result == 200) {
              this.getaddsList()
            }
          })
        }
      }
    })
  },
  //获取列表数据接口
  getlist(type){
    wx.showLoading({
      title: '加载中',
    })
    service.addresslist({
      type: type,
      userId: this.data.userid
    }).then((res) => {
      if (res.data.result == 200) {
        wx.hideLoading()
        this.setData({
          itemData: res.data.data
        })
      }
    })
  },
  getaddsList(){  //列表数据
    if(this.data.addscode==1){
      this.getlist(1001)
    }
    if(this.data.addscode==2){
      this.getlist(2001)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let userid=wx.getStorageSync('userId')
    this.setData({
      userid
    })
    if (options.addscode == 1) {   //点击寄件人地址簿进来的
      this.setData({
        type:1001,
        addscode:1
      })
      wx.setNavigationBarTitle({
        title: '寄件人地址簿',
      })
      this.getaddsList()
    }
    if(options.addscode==2){  //点击收件人地址簿进来的
      this.setData({
        type: 2001,
        addscode:2
      })
      wx.setNavigationBarTitle({
        title: '收件人地址簿',
      })
      this.getaddsList()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getaddsList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})