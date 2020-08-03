const service = require('../../service/index.js')
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
  var qqmapsdk;
  Page({

    /**
     * 页面的初始数据
     */
    data: {
      longitude:'',  //经度
      latitude:'',   //纬度
      city:'',   //所在城市
      LocalAddress:null,  //位置所有信息
      listData: [],  //列表数据
      presentAddress: wx.getStorageSync('presentAddress') || null,  //拼团
      historyAddress: wx.getStorageSync('historyAddress') || null,
      currentCloudShop: wx.getStorageSync('currentCloudShop') || null, //云店
      historyCloudShop: wx.getStorageSync('historyCloudShop') || null,
      inpValue: "", //input框内容
      nodataimg:false,  //初次进入页面nodata图片不显示
      enterType:10, //进入类型  10拼团选择进入  20云店选择进入
      setaddress:''
  },
  //input监听
  inpwatch(e){
    this.setData({
      inpValue:e.detail.value
    },()=>{
      this.setData({
        listData:[]
      })
      if(this.data.inpValue){
        this.setData({
          nodataimg:true
        })
        this.getcommunityData()
      }
    })
  },
  // 微信授权定位
  getUserLocation() {
    wx.getSetting({
      success: (res) => {
        this.getLocation();  //先获取经纬度
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: (res) => {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: (dataAu) => {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })

                      //再次授权，调用wx.getLocation的API
                      this.getLocation();
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
          this.getLocation();
        } else {
          //调用wx.getLocation的API
          this.getLocation();
        }
      }
    })
  },
  // 微信获得经纬度 
  getLocation: function () {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
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
        let city = wx.getStorageSync("city") ? wx.getStorageSync("city") : res.result.ad_info.city;
        wx.setStorageSync('city', city)
        this.setData({
          city: city,
          LocalAddress: res.result
        })
      },
      fail: function (res) {
        // console.log(res);
      }
    });
  },
  //获取社区数据列表
  getcommunityData(){
    wx.showLoading({
      title: '加载中',
    });
    let cityName="";
    let longitude="";
    let latitude="";
    if (wx.getStorageSync("setAddress")) {
      cityName = wx.getStorageSync("setAddress").cityName;
      longitude = wx.getStorageSync("setAddress").long;
      latitude = wx.getStorageSync("setAddress").lati;
    } else {
      cityName = this.data.city;
      longitude = this.data.longitude;
      latitude = this.data.latitude;
    }
    let scene=this.data.enterType==10?5:this.data.enterType==20?6:''
    service.getcommunity({
      cityName: cityName,
      longitude: longitude,
      latitude: latitude,
      scenes: [scene],
      searchContent: this.data.inpValue
    }).then((res) => {
      this.stopPullDownRefresh();
      if (res.data.result == 200) {
        wx.hideLoading()
        let data = res.data.data
        if(data){
          data.forEach(item => {
            if (item.distance >= 1000) {
              item.distance = (item.distance / 1000).toFixed(1) + "km"
            } else {
              item.distance = item.distance + "m";
            }
          })
          this.setData({
            listData: data
          })
        }
      }else{
        wx.hideLoading()
      }
    })
  },
  //input清除按钮点击
    delInp(){
      this.setData({
        inpValue:'',
        listData: [],
        nodataimg:true
      })
      setTimeout(() => {
        this.setData({
          inpValue: ''
        })
      }, 100)
    },
  //附近社区点击
  nearbyClick(e){
    var itdata = e.currentTarget.dataset.itdata
    //将点击的社区存入本地，方便再次进入
    if(this.data.enterType==10){  //拼团业务
        wx.setStorageSync('presentAddress', itdata)
        //记录上次的社区
        var willhistoryData = this.data.presentAddress
        this.setData({
          presentAddress: itdata
        }, () => {
          this.setData({
            historyAddress: willhistoryData
          })
          //将历史的社区页存入本地，方便再次进入
          wx.setStorageSync('historyAddress', willhistoryData)
        this.homeback()
      })
    }
    if(this.data.enterType==20){  //云店业务
      wx.setStorageSync('currentCloudShop', itdata)
        //记录上次的社区
        var willhistoryData = this.data.currentCloudShop
        this.setData({
          currentCloudShop: itdata
        }, () => {
          this.setData({
            historyCloudShop: willhistoryData
          })
          //将历史的社区页存入本地，方便再次进入
          wx.setStorageSync('historyCloudShop', willhistoryData)
        this.homeback()
      })
    }

  },
  //返回首页
  homeback(){
    if(this.data.setaddress==1){
      wx.navigateBack({
        delta:3
      })
    }else{
      wx.navigateBack({
        delta:2
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
    let enterType=options.enterType
    let setaddress=options.setaddress
    this.setData({
      enterType,
      setaddress
    },()=>{
      this.getUserLocation();
    })
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
    let presentAddress = wx.getStorageSync('presentAddress')||null;
    let historyAddress = wx.getStorageSync('historyAddress') || null;
    let currentCloudShop = wx.getStorageSync('currentCloudShop') || null;
    let historyCloudShop = wx.getStorageSync('historyCloudShop') || null;
    this.setData({
      presentAddress,
      historyAddress,
      currentCloudShop,
      historyCloudShop,
    })
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
    this.getUserLocation();
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
