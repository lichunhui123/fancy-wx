// pages/waterAddaddress/index.js
const service = require('../../service/index.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
const util=require("../../utils/util.js")
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    onclick:true,
    switch1: false,   //默认开关
    show:false,      //底部弹框显示
    inpshow:true,   //input出现蒙层消失
    addsName: '',  //姓名
    addsTel: '',  //电话
    inpcon: '',  //详细地址
    province:'', //省
    city:'',    //市
    area:'',   //区
    type:"",  //1添加 2编辑
    subactive:false, //判断信息是否填写完整，按钮变亮
    addid:null,  
    longitude: '',  //经度
    latitude: '',   //纬度
    getRegion:[],  //附近地址
    reginShow:false, //附近地址显示
    toler:1,  //默认按钮显示
  },
  //定位到当前位置
  locator(){
    wx.showLoading({
      title: '定位中',
    })
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log(res);
        let longitude = res.longitude
        let latitude = res.latitude
        this.setData({
          longitude,
          latitude
        })
        this.getLocal(longitude, latitude)
      },
      fail: function (res) {
        wx.showToast({
          title: '亲，记得打开手机定位哟！',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  // 获取当前地理位置 
  getLocal(longitude, latitude) {
    qqmapsdk.reverseGeocoder({
      location: {
        longitude: longitude,
        latitude: latitude
      },
      success: (res) => {
        console.log('地理位置', res.result)
        let address = res.result.address_component
        this.setData({
          province:address.province,
          city:address.city,
          area:address.district,
          inpcon: address.street_number
        },()=>{
          this.alltrue()
        })
      },
      complete:()=>{
        wx.hideLoading()
      }
    });
  },
  //添加地址//编辑地址
  getAddreddList(requestCode) {
    let data={
      userid: wx.getStorageSync('userId'),
      id:this.data.addid,
      name: this.data.addsName,
      phone: this.data.addsTel,
      address: this.data.inpcon,
      isDefault: this.data.toler==3 ? 1 :this.data.switch1? 1 : 2,
      provinceName: this.data.province,
      cityName: this.data.city,
      districtName: this.data.area,
    }
    if (this.data.onclick) {
      this.setData({
        onclick: false
      })
      wx.showLoading({ 
        title: '加载中', 
      }) 
      service.getwateraddresslist({
        "platform": "wx",
        "requestCode": requestCode,
        "params": JSON.stringify(data)
      }).then(res => {
        wx.hideLoading()
        if (res.data.result == 0 || res.data.result == 200) {
          wx.navigateBack({
            success: () => {
              this.setData({
                onclick: true
              })
            }
          })
        } else {
          this.setData({
            onclick: true
          })
          wx.showToast({
            title: res.data.message,
            duration: 1500,
            icon: 'none',
          })
        }
      }).catch(()=>{
        this.setData({
          onclick: true
        })
      })
    }
  },
  //判断信息全部填写
  alltrue() {
    if (this.data.addsName &&
      this.data.addsTel &&
      this.data.inpcon &&
      this.data.province &&
      this.data.city &&
      this.data.area) {
      this.setData({
        subactive: true
      })
    } else {
      this.setData({
        subactive: false
      })
    }
  },
  //姓名监听
  inpName(e) {
    
    this.setData({
      addsName: e.detail.value
    },()=>{
      this.alltrue()
    })
  },
  //电话监听
  inpTel(e) {
    let tel=e.detail.value
    if(tel&&tel[0]!='1'){
      tel=''
    }
    this.setData({
      addsTel: tel
    },()=>{
      this.alltrue()
    })
  },
  //详细地址
  inpmonitor(e) {
    this.setData({
      inpcon: e.detail.value
    },()=>{
      this.alltrue()
    })
    this.getRegionLocal(e.detail.value)
  },
  //详细地址输入失去焦点
  textfocus(){
    this.setData({
      reginShow:false
    })
  },
  //模糊搜索附近地址
  getRegionLocal(val) {
    qqmapsdk.search({
      keyword: `${this.data.province}${this.data.city}${this.data.area}${val}`,
      success: (res) => {
        console.log('附近地址', res)
        if(res.data.length>0){
          this.setData({
            getRegion:res.data,
            reginShow:true
          })
        }else{
          wx.hideLoading()
          this.setData({
            getRegion: [],
            reginShow: false
          })
        }
      },
      fail: (res) => {
        wx.hideLoading()
        this.setData({
          getRegion: [],
          reginShow:false
        })
      }
    });
  },
  //附近地址点击
  reginClick(e){
    let reginitem = e.currentTarget.dataset.reginitem
    this.setData({
      inpcon: reginitem.address,
      reginShow:false
    },()=>{
      this.alltrue()
    })
  },
  
  //开关
  onChange(event) {
    const detail = event.detail;
    this.setData({
      switch1: detail.value
    })
  },
  //点击请选择省市区
  chooseAddress() {
    this.setData({
      show: true,
      inpshow:false
    })
  },
  //取消选择
  cancelbutton() {
    this.setData({
      inpshow: true
    })
  },
  //确定选择
  sureSelectAreaListener(e) {
    console.log(e.detail.currentTarget.dataset);
    this.setData({
      show: false,
      inpshow: true,
      province: e.detail.currentTarget.dataset.province,
      city: e.detail.currentTarget.dataset.city,
      area: e.detail.currentTarget.dataset.area
    },()=>{
      this.alltrue()
    })
    
  },
  //编辑地址
  editAddress(){

  },
  //保存
  addAddress() {
    if (!this.data.subactive) {
      return;
    }
    if (!util.isGbOrEn(this.data.addsName)){
      wx.showToast({
        title: '请输入文字、字母或者数字',
        icon: 'none'
      })
      return;
    }
    if (this.data.addsTel.length!=11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return;
    }
    if(this.data.type==1){
      this.getAddreddList(1000)
    }
    if(this.data.type==2){
      this.getAddreddList(1001)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    qqmapsdk = new QQMapWX({
      key: 'O4ZBZ-YJULU-7HOVK-4U4X7-36X67-KCFE2'
    });
    let type =options.type
    let toler =options.toler
    if(type==1){  //1添加  
      console.log(toler)
      this.setData({
        type:1,
        addid:null,    //添加的时候清空addid
        toler,
      })
    }
    if(type==2){ //2编辑
      let addid= options.addid
      service.getwateraddresslist({
        "platform": "wx",
        "requestCode": 1009,
        "params": JSON.stringify({ id: addid })
      }).then(res=>{
        if (res.data.result == 0 || res.data.result == 200) {
          let data = res.data.data
          this.setData({
            switch1: data.isDefault == 2 ? false : true, //默认开关
            addsName: data.name,  //姓名
            addsTel: data.phone,  //电话
            inpcon: data.address,  //详细地址
            province: data.provinceName, //省
            city: data.cityName,    //市
            area: data.districtName,   //区
            toler,
          },()=>{
            this.alltrue()
          })
        }
      })
      this.setData({
        type:2,
        addid: addid
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