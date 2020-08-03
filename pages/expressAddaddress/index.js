// pages/addAddress/index.js
const service = require('../../service/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addsName:'',  //姓名
    addsTel:'',  //电话
    province: '', //省
    city: '',   //市
    area: '',  //区
    inpcon:'',  //详细地址
    show: false,  //底部弹出显示
    inpshow:true,  //文本框层级显示
    subactive:false, //保存地址按钮颜色切换
    userid:'',  //用户id
    addid:'',  //地址id
    type:'',   //地址类型
    addedittype: '',  //添加=10和编辑=2类型 
  },
  //确定选择
  sureSelectAreaListener(e) {
    this.setData({
      show: false,
      inpshow:true,
      province: e.detail.currentTarget.dataset.province,
      city: e.detail.currentTarget.dataset.city,
      area: e.detail.currentTarget.dataset.area
    })
    this.alltrue()
  },
  //取消选择
  cancelbutton(){
    this.setData({
      inpshow:true
    })
  },
  
  //点击请选择省市区
  chooseAddress() {
  this.setData({
      show: true,
      inpshow:false
    })
  },
  //姓名监听
  inpName(e){
    this.setData({
      addsName: e.detail.value
    })
    this.alltrue()
  },
  //电话监听
  inpTel(e){
    this.setData({
      addsTel: e.detail.value
    })
    this.alltrue()
  },
  //详细地址
  inpmonitor(e){
    this.setData({
      inpcon:e.detail.value
    })
    this.alltrue()
  },
  //添加地址接口
  getadd(type){
    wx.showLoading({
      title: '加载中',
    })
    service.addaddress({
      address: this.data.inpcon,
      area: this.data.area,
      city: this.data.city,
      name: this.data.addsName,
      phone: this.data.addsTel,
      province: this.data.province,
      type: type,
      userId: this.data.userid
    }).then((res) => {
      console.log(res)
      if (res.data.result == 200) {
        wx.hideLoading()
        wx.navigateBack({
          delta: 1
        })
      } else {
        wx.showToast({
          title: '保存地址失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //编辑地址接口
  getedit(type){
    wx.showLoading({
      title: '加载中',
    })
    service.editaddress({
      address: this.data.inpcon,
      area: this.data.area,
      city: this.data.city,
      name: this.data.addsName,
      phone: this.data.addsTel,
      province: this.data.province,
      id:this.data.addid,
      type: type,
      userId: this.data.userid
    }).then((res) => {
      console.log(res)
      if (res.data.result == 200) {
        wx.hideLoading()
        wx.navigateBack({
          delta: 1
        })
      } else {
        wx.showToast({
          title: '保存地址失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //保存地址
  save_submit(){
    if (!this.data.subactive) {
      return;
    }
    if (!(/^[1][1-9][0-9]{9}$/.test(this.data.addsTel))){
      wx.showToast({
        title: '电话格式不正确',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if(this.data.addedittype==10){  //添加
    //添加分为两种：一种是添加寄件人1001，一种是添加收件人2001
      if (this.data.type == 1001) {
        this.getadd(1001)
      }
      if (this.data.type == 2001) {
        this.getadd(2001)
      }
    }
    if(this.data.addedittype==20){  //编辑
      //编辑也分为两种:寄件人编辑  收件人编辑
      if (this.data.type == 1001){
        this.getedit(1001)
      }
      if (this.data.type == 2001) {
        this.getedit(2001)
      }
    }
  },
  //判断信息全部填写
  alltrue() {
    if (this.data.addsName && 
        this.data.addsTel && 
        this.data.inpcon &&
        this.data.province&&
        this.data.city&&
        this.data.area) {
        this.setData({
          subactive: true
        })
    }else{
        this.setData({
          subactive: false
        })
    }
  },
  watch: {
    // getApp().Watchdata.setWatcher(this.data, this.watch);
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let editcode =options.editcode   //添加=1 编辑=2
    let userid = wx.getStorageSync('userId')  //获取用户id
    let type =options.type   //寄件人 和收件人类型
    this.setData({
      userid,
      type
    })
    if(editcode==1){ 
      console.log('添加')
        this.setData({
          addedittype: 10
        })
    }
    if(editcode==2){
      console.log('编辑')
      this.setData({
        addedittype: 20
      })
      var editdata = JSON.parse(options.editdata)
      let addid = editdata.id
      console.log(editdata)
      this.setData({
        addsName: editdata.name,  //姓名
        addsTel: editdata.phone,  //电话
        province: editdata.province, //省
        city: editdata.city,   //市
        area: editdata.area,  //区
        inpcon: editdata.address,  //详细地址
        addid:addid
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.alltrue()
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