var util = require('../../utils/util.js');
var service = require('../../service/index.js');
var formatLocation = util.formatLocation;
// pages/setAddress/setAddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    city: wx.getStorageSync('city'),
    address: '',
    location: null,
    selectIndex: -1,
    selectAddress: {},
    showCity:false,
    citydata:null,
    enterType:''
  },
  //账户input事件
  changeUserName(e){
    let regRule = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
    if (e.detail.value.match(regRule)) {
      e.detail.value = e.detail.value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
    }
    e.detail.value = e.detail.value.replace(/[^0-9.]+/, '');
    this.setData({
      userName:e.detail.value.slice(0, 11)
    });
  },
  //密码事件
  changePwd(e){
    let regRule = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
    if (e.detail.value.match(regRule)) {
      e.detail.value = e.detail.value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
    }
    e.detail.value = e.detail.value.replace(/[^0-9.]+/, '');
    this.setData({
      password:e.detail.value
    });
  },
  //登录
  loginSubmit(){
    let t=this;
    if(!this.data.userName){
      wx.showToast({
        title:"请输入账户",
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if(!this.data.password){
      wx.showToast({
        title:"请输入密码",
        icon: 'none',
        duration: 2000
      });
      return;
    }
    wx.showLoading({title:"加载中"});
    service.adminLogin({
      userName:this.data.userName,
      password:this.data.password
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        wx.showToast({
          title:"登录成功",
          icon: 'none',
          duration: 2000
        });
        t.setData({showCity:true});
        t.getOpenCity();
      }else{
        wx.showToast({
          title:res.data.message,
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  //获取城市
  getOpenCity(){
    wx.showLoading({title:"加载中"});
    service.getOpenCity({
      userName:this.data.userName,
      password:this.data.password,
      sceneId:this.data.enterType==10?5:6,//云店6，拼团5
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        let citydata=[];
        let list = res.data.data;
        if(list){
          list.map((item)=>{
            let json={
              cityName:item.cityName,
              long: item.txCoordinate.lon,
              lati: item.txCoordinate.lat,
              address: "",
              active:false
            };
            citydata.push(json);
          });
        }
        this.setData({citydata});
      }
    })
  },
  //选择城市
  selectCity (e) {
    let i = e.target.dataset.index;
    this.setData({
      selectIndex: i,
      selectAddress: this.data.citydata[i],
    });
    this.data.citydata.map((item)=>{
      item.active=false;
    });
    this.data.citydata[i].active=true;
    this.setData({citydata:this.data.citydata});
    console.log(this.data.selectAddress);
  },
  onShow: function () {
    wx.hideShareMenu()
    this.setData({
      city: wx.getStorageSync('city'),
      address: wx.getStorageSync('setAddress'),
      location: wx.getStorageSync('setLocation')
    });
  },
  onLoad: function (options) {
    console.log(options)
    let enterType=options.enterType
    this.setData({
      enterType
    })
  },
  //确认切换
  gotoIndex : function () {
    if (this.data.selectIndex > -1) {
      wx.setStorageSync('setAddress', this.data.selectAddress);
      if (!wx.getStorageSync("setAddress")) {
        return;
      }
      wx.setStorageSync('presentAddress', '');
      wx.setStorageSync('currentCloudShop','');
      wx.setStorageSync('historyAddress', '');
      wx.setStorageSync('historyCloudShop','');
      wx.redirectTo({
        url: '/pages/homeCommunity/index?setaddress=1&enterType='+this.data.enterType,
      })
    } else {
      return;
    }
  }
});