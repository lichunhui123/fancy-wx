// pages/homeAddress/index.js
const service = require('../../service/index.js');
const QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nodata:false,  //没有数据
    selectAddress:"",//选择的地址
    addressList:[],  //地址列表
    showLogin:true,
  },
  loginSuccess(){
    this.setData({showLogin:false});
    this.getAddressList();
  },
  //添加地址
  addAddress(){
    if (this.data.addressList.length>=10){
      wx.showToast({
        title: '最多添加10条地址~',
        icon: 'none'
      });
      return;
    }else{
      if(this.data.addressList.length==0){
        wx.navigateTo({
          url: '/pages/waterAddaddress/index?type=1&toler=3',
        })
      }else{
        wx.navigateTo({
          url: '/pages/waterAddaddress/index?type=1&toler=1',
        })
      }
    }
  },
  // 微信授权定位
  getUserLocation(){
    let that = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      });
                      //再次授权，调用wx.getLocation的API
                      that.getLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的API
          that.getLocation();
        } else {
          //调用wx.getLocation的API
          that.getLocation();
        }
      }
    })
  },
  // 微信获得经纬度
  getLocation(){
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        let latitude = res.latitude;
        let longitude = res.longitude;
        that.getLocal(longitude, latitude);
      },
      fail: function (res) {
        that.setData({hasLocation:false});
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
    let long = longitude;
    let lati = latitude;
    if(wx.getStorageSync("setAddress")){//如果设置过当前所在城市
      long = wx.getStorageSync("setAddress").long;
      lati = wx.getStorageSync("setAddress").lati;
    }
    qqmapsdk.reverseGeocoder({
      location: {
        longitude: long,
        latitude: lati
      },
      success: (res)=> {
        console.log('地理位置',res.result);
        this.setData({
          selectAddress: res.result.address
        })
      },
      fail: function (res) {
      }
    });
  },
  //获取地址列表
  getAddressList(){
    wx.showLoading({
      title: '加载中',
    });
    service.getwateraddresslist({
      "platform": "wx",
      "requestCode": 1004,
      "params": "{userId:" + wx.getStorageSync('userId') + ",pageNo:1,pageSize:20}"
    }).then(res=>{
      wx.hideLoading();
      if (res.data.result == 0 || res.data.result == 200){
        let data=res.data.data;
        if(wx.getStorageSync("isaddress")){//如果有选择收货地址 设置当前选中
          data.forEach((item)=>{
            if(item.id==wx.getStorageSync("isaddress").id){
              item.active=true;
            }
          });
        }else if(wx.getStorageSync("isdefault")){//如果有默认收货地址 设置当前选中
          data.forEach((item)=>{
            if(item.id==wx.getStorageSync("isdefault").id){
              item.active=true;
            }
          });
        }
        this.setData({
          addressList:data
        });
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
  //选择地址
  select(e){
    let itemdata=e.currentTarget.dataset.itemdata;
    console.log(itemdata);
    this.data.addressList.forEach((item)=>{
      item.active=false;
      if(item.id==itemdata.id){
        item.active=true;
      }
    });
    this.setData({
      addressList:this.data.addressList,
      selectAddress:itemdata.provinceName+itemdata.cityName+itemdata.districtName+itemdata.address
    });
    wx.setStorageSync('isaddress',itemdata);
    this.setWaterOrderAmend()
    wx.reLaunch({
      url: '../../pages/home/index'
    })
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    qqmapsdk = new QQMapWX({
      key: 'O4ZBZ-YJULU-7HOVK-4U4X7-36X67-KCFE2'
    });
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
    if(wx.getStorageSync("isaddress")){//如果有选择的收货地址
      let itemdata = wx.getStorageSync("isaddress");
      this.setData({
        selectAddress:itemdata.provinceName+itemdata.cityName+itemdata.districtName+itemdata.address
      });
    }else if(wx.getStorageSync("isdefault")){//如果有默认收货地址
      let itemdata = wx.getStorageSync("isdefault");
      this.setData({
        selectAddress:itemdata.provinceName+itemdata.cityName+itemdata.districtName+itemdata.address
      });
    }else{
      this.getUserLocation();
    }
    if(wx.getStorageSync("userId")){
      this.getAddressList();
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