// pages/location/index.js
const service = require('../../service/index.js')
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex:1,//第几页
    pageSize:10,//每页条数
    longitude:'',  //经度
    latitude:'',   //纬度
    city:'',   //所在城市
    LocalAddress:null,  //位置所有信息
    allCommunity:null,//所有的网点信息列表
    listData:[],  //列表数据
    presentAddress: wx.getStorageSync('presentAddress') || null,  //拼团
    historyAddress: wx.getStorageSync('historyAddress') || null,
    currentCloudShop: wx.getStorageSync('currentCloudShop') || null, //云店
    historyCloudShop: wx.getStorageSync('historyCloudShop') || null,
    setAddressCount:0,//设置地址跳转点击次数 20次后跳转页面
    enterType:'',   //进入类型  10拼团选择进入  20云店选择进入
    setaddress:'',  //设置过城市
  },
  //搜索点击跳转
  seachClick(){
    wx.navigateTo({
      url: '/pages/homeCommunitySeach/index?enterType='+this.data.enterType +'&setaddress='+this.data.setaddress,
    })
  },
  // 微信授权定位
  getUserLocation() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: (res)=> {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: (dataAu)=> {
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
      success:(res)=> {
        let longitude= res.longitude
        let latitude=res.latitude
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
      success: (res)=> {
        console.log('地理位置',res.result)
        let city = wx.getStorageSync("city") ? wx.getStorageSync("city") : res.result.ad_info.city;
        if (wx.getStorageSync("setAddress")) {
          city = wx.getStorageSync("setAddress").cityName;
        }
        wx.setStorageSync('city', city)
        this.setData({
          city: city,
          LocalAddress: res.result
        }, () => {
          this.getcommunityData()
        })
      },
      fail: function (res) {
      }
    });
  },
  //获取门店数据列表
  getcommunityData(){
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
      scenes:[scene],
      searchContent: ''
    }).then((res)=>{
      console.log(res.data.data)
      this.stopPullDownRefresh();
      if(res.data.result==200){
        let data =res.data.data;
        let newData=[];
        if(!data){
          wx.hideLoading();
          wx.showToast({
            title: '暂无门店信息！',
            icon:'none'
          })
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/home/index',
            })
          }, 1000);
          return;
        }
        data.forEach(item=>{
          if (item.distance >= 1000) {
            item.distance = (item.distance / 1000).toFixed(1)+"km"
          } else {
            item.distance = item.distance + "m";
          }
          if(this.data.enterType==10){
            if (wx.getStorageSync('presentAddress') || wx.getStorageSync('historyAddress')){
              if (wx.getStorageSync('presentAddress') && item.siteId == wx.getStorageSync('presentAddress').siteId){
                return
              }
              if (wx.getStorageSync('historyAddress') && item.siteId == wx.getStorageSync('historyAddress').siteId){
                return;
              }
              newData.push(item);
            }else{
              newData.push(item);
            }
          }
          if(this.data.enterType==20){
            if (wx.getStorageSync('currentCloudShop') || wx.getStorageSync('historyCloudShop')){
              if (wx.getStorageSync('currentCloudShop') && item.siteId == wx.getStorageSync('currentCloudShop').siteId){
                return
              }
              if (wx.getStorageSync('historyCloudShop') && item.siteId == wx.getStorageSync('historyCloudShop').siteId){
                return;
              }
              newData.push(item);
            }else{
              newData.push(item);
            }
          }
        });
        this.setData({
          allCommunity:newData
        });
        this.paging();
      }
    })
  },
  //分页
  paging(){
    wx.hideLoading();
    let t=this;
    let data = [];
    this.data.allCommunity.map((item,index)=>{
      if(index<t.data.pageIndex*t.data.pageSize){
        data.push(item);
      }
    });
    this.setData({
      listData:data
    });
  },
  //附近门店点击
  nearbyClick(e){
    var itdata = e.currentTarget.dataset.itdata;
    //将点击的门店存入本地，方便再次进入
    if(this.data.enterType==10){  //拼团业务
      wx.setStorageSync('presentAddress', itdata)
      //记录上次的门店
      let willhistoryData=this.data.presentAddress
      this.setData({
        presentAddress:itdata
      },()=>{
        this.setData({
          historyAddress:willhistoryData
        })
        //将历史的门店页存入本地，方便再次进入
        wx.setStorageSync('historyAddress', willhistoryData)
        this.homeback()
      })
    }
    if(this.data.enterType==20){  //云店业务
      wx.setStorageSync('currentCloudShop', itdata)
      //记录上次的门店
      let willhistoryData=this.data.currentCloudShop
      this.setData({
        currentCloudShop:itdata
      },()=>{
        this.setData({
          historyCloudShop:willhistoryData
        })
        //将历史的门店页存入本地，方便再次进入
        wx.setStorageSync('historyCloudShop', willhistoryData)
        this.homeback()
      })
    }
  },
  //当前门店点击跳转到选择设置地址页面
  setAddress(){
    this.setData({
      setAddressCount: this.data.setAddressCount + 1
    });
    if (this.data.setAddressCount === 20) {
      this.setData({
        setAddressCount: 0
      });
      wx.navigateTo({
        url: '../setAddress/setAddress?enterType='+this.data.enterType
      })
    }
  },
  //曾用门店点击
  historyComm(e){
    var hisdata = e.currentTarget.dataset.hisdata
    //将点击的门店存入本地，方便再次进入
    if(this.data.enterType==10){  //拼团业务
      wx.setStorageSync('presentAddress', hisdata)
      //记录上次的门店
      let willhistoryData = this.data.presentAddress
      this.setData({
        presentAddress: hisdata,
        historyAddress: willhistoryData
      })
        //将历史的门店页存入本地，方便再次进入
        wx.setStorageSync('historyAddress', willhistoryData)
    }
    if(this.data.enterType==20){  //云店业务
      wx.setStorageSync('currentCloudShop', hisdata)
      //记录上次的门店
      let willhistoryData = this.data.currentCloudShop
      this.setData({
        currentCloudShop: hisdata,
        historyCloudShop: willhistoryData
      })
        //将历史的门店页存入本地，方便再次进入
        wx.setStorageSync('historyCloudShop', willhistoryData)
    }
    this.homeback()
  },
  //返回首页
  homeback(){
    if(this.data.setaddress==1){
      wx.navigateBack({
        delta:2
      })
    }else{
      wx.navigateBack({
        delta:1
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
    wx.showLoading({
      title:"加载中..."
    });
    console.log(options)
    let enterType=options.enterType?options.enterType:10
    let setaddress = options.setaddress?options.setaddress:''
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
    this.getUserLocation()
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
    let t=this;
    if(t.data.pageIndex>Math.ceil(t.data.allCommunity.length/t.data.pageSize)){
      return;
    }
    wx.showLoading({
      title:"加载中..."
    });
    setTimeout(()=>{
      wx.hideLoading();
      t.setData({
        pageIndex:++t.data.pageIndex
      });
      t.paging();
    },1000);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})