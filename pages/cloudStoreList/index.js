// pages/cloudStoreList/index.js
const service = require('../../service/index.js');
const app = getApp();
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var utils=require('../../utils/util.js')
var qqmapsdk;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.globalData.imgUrl,
    cityName: wx.getStorageSync('city'),
    citydata:[],
    selectCity:0,
    LocalAddress:null,  //位置所有信息
    allCommunity:null,//所有的网点信息列表
    cloudStoreName:'',//云店名称
    cloudDeliveryAddress:'',//云店地址
    latitude:'',
    longitude:'',
    historyAddress: wx.getStorageSync('historyAddress') || null,
    currentCloudShop: wx.getStorageSync('currentCloudShop') || null, //云店
    historyCloudShop: wx.getStorageSync('historyCloudShop') || null,
    listData:[],//附近门店列表 
    collectData:[],//已收藏云店列表
    shareCloudStore:null,
    loadMore:3,//查看更多数量
    loadMoreShow:false,//查看更多显示
    source:""//页面跳转来源
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
        },()=>{
          let historyCloudShop = wx.getStorageSync('historyCloudShop') || null;
          if(historyCloudShop){
            this.getBranch(historyCloudShop.siteId,2);
          }
          this.queryColleBranches()
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
  //搜索点击跳转
  seachClick(){
    wx.navigateTo({
      url: '/pages/homeCommunitySeach/index?enterType='+20,
    })
  },
  //获取城市
  getOpenCity(){
    wx.showLoading({title:"加载中"});
    service.getOpenCity({
      userName:17876317688,
      password:874122,
      sceneId:6,//云店6，拼团5
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
              lati: item.txCoordinate.lat
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
    let value=e.detail.value;
    let selectAddress=this.data.citydata[value];
    this.setData({
      selectCity:value,
      cityName:selectAddress.cityName
    })
    wx.setStorageSync('city', selectAddress.cityName);
    wx.setStorageSync('setAddress', selectAddress);
    if (!wx.getStorageSync("setAddress")) {
      return;
    }
    this.getcommunityData();
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
        let cityName = wx.getStorageSync("city") ? wx.getStorageSync("city") : res.result.ad_info.city;
        if (wx.getStorageSync("setAddress")) {
          cityName = wx.getStorageSync("setAddress").cityName;
        }else if(wx.getStorageSync("isaddress")){//如果选择过收货地址和水管家收货地址相通
          cityName = wx.getStorageSync("isaddress").cityName;
        }else if(wx.getStorageSync("isdefault")){//如果有水管家默认收货地址相通
          cityName = wx.getStorageSync("isdefault").cityName;
        }
        wx.setStorageSync('city', cityName) 
        this.setData({
          cityName: cityName,
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
    wx.showLoading({title:"加载中"});
    let cityName=this.data.cityName;
    let x=this.data.longitude;let y=this.data.latitude;
    if(wx.getStorageSync("setAddress")){//如果设置过当前所在城市
      x = wx.getStorageSync("setAddress").long;
      y = wx.getStorageSync("setAddress").lati;
      cityName = wx.getStorageSync("setAddress").cityName;
    }else if(wx.getStorageSync("isaddress")){//如果选择过收货地址和水管家收货地址相通
      x = wx.getStorageSync("isaddress").longitude;
      y = wx.getStorageSync("isaddress").latitude;
      cityName = wx.getStorageSync("isaddress").cityName;
    }else if(wx.getStorageSync("isdefault")){//如果有水管家默认收货地址相通
      x = wx.getStorageSync("isdefault").longitude;
      y = wx.getStorageSync("isdefault").latitude;
      cityName = wx.getStorageSync("isdefault").cityName;
    }
    let scene=6
    service.getcommunity({
      cityName: cityName,
      longitude: x,
      latitude: y,
      scenes:[scene],
      searchContent: ''
    }).then((res)=>{
      wx.hideLoading();
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
          return;
        }
        data.forEach(item=>{
          if (item.distance >= 1000) {
            item.distance = (item.distance / 1000).toFixed(1)+"km"
          } else {
            item.distance = item.distance + "m";
          }
          //附近云店自提和配送
          if(item.smallDeliveryStatus==30){
            item.smallDeliveryStatus="支持自提/配送"
          }
          if(item.smallDeliveryStatus==10){
            item.smallDeliveryStatus="支持自提"
          }
          if(item.smallDeliveryStatus==20){
            item.smallDeliveryStatus="支持配送"
          }
          //活动类型
          item.activityStr='';
          let activityList=item.activityList||[];
          if(activityList.includes(10)){
            item.activityStr+="折扣·"
          }if(activityList.includes(20)){
            item.activityStr+="满减·"
          }if(activityList.includes(50)){
            item.activityStr+="买一送一·"
          }if(activityList.includes(60)){
            item.activityStr+="第二件半价·"
          }if(activityList.includes(70)){
            item.activityStr+="多件多折·"
          }if(activityList.includes(80)){
            item.activityStr+="好物预售·"
          }if(activityList.includes(90)){
            item.activityStr+="多人拼团·"
          }
          item.activityStr=item.activityStr.substring(0,item.activityStr.length-1)
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
        });
        this.setData({
          allCommunity:newData,
          listData:data
        });
      }
    })
  },
  //获取站点
  getBranch(branchId,type) {
    let x=this.data.longitude;let y=this.data.latitude;
    if(wx.getStorageSync("setAddress")){//如果设置过当前所在城市
      x = wx.getStorageSync("setAddress").long;
      y = wx.getStorageSync("setAddress").lati;
    }else if(wx.getStorageSync("isaddress")){//如果选择过收货地址和水管家收货地址相通
      x = wx.getStorageSync("isaddress").longitude;
      y = wx.getStorageSync("isaddress").latitude;
    }else if(wx.getStorageSync("isdefault")){//如果有水管家默认收货地址相通
      x = wx.getStorageSync("isdefault").longitude;
      y = wx.getStorageSync("isdefault").latitude;
    }
    if (branchId) {
      let data={
        branchId: branchId,
      }
      if(type==2){
        data.longitude=x;
        data.latitude=y;
      }
      service.getnewcommunity(data).then(res => {
        if (res.data.result == 200) {
          let data = res.data.data
          if(type==1){//当前门店
            let currentCloudShop=this.data.currentCloudShop;
            currentCloudShop.siteName=data.siteName;
            currentCloudShop.deliveryAddress=data.deliveryAddress;
            let smallDeliveryStatus=data.smallDeliveryStatus;//自提配送
            if(smallDeliveryStatus==10){
              currentCloudShop.smallDelivery="支持自提"
            }else if(smallDeliveryStatus==20){
              currentCloudShop.smallDelivery="支持配送"
            }else{
              currentCloudShop.smallDelivery="支持自提/配送"
            }
            currentCloudShop.branchesImg=data.branchesImg;//图片
            this.setData({
              currentCloudShop
            })
          }else if(type==2){//曾用门店
            let historyCloudShop=this.data.historyCloudShop;
            let distance = data.distance;
            if (distance >= 1000) {
              distance = (distance / 1000).toFixed(1)+"km"
            } else {
              distance = distance + "m";
            }
            historyCloudShop.siteName=data.siteName;
            historyCloudShop.distance=distance;
            let smallDeliveryStatus=data.smallDeliveryStatus;//自提配送
            if(smallDeliveryStatus==10){
              historyCloudShop.smallDelivery='支持自提'
            }else if(smallDeliveryStatus==20){
              historyCloudShop.smallDelivery='支持配送'
            }else{
              historyCloudShop.smallDelivery='支持自提/配送'
            }
            historyCloudShop.branchesImg=data.branchesImg;//图片
            historyCloudShop.cardList=data.cardList;//卡券列表
            historyCloudShop.activityList=data.activityList;///活动
            //活动类型
            let activityStr='';
            let activityList=historyCloudShop.activityList||[];
            if(activityList.includes(10)){
              activityStr+="优惠·"
            }if(activityList.includes(20)){
              activityStr+="满减·"
            }if(activityList.includes(50)){
              activityStr+="买一送一·"
            }if(activityList.includes(60)){
              activityStr+="第二件半价·"
            }if(activityList.includes(70)){
              activityStr+="多件多折·"
            }if(activityList.includes(80)){
              activityStr+="好物预售·"
            }if(activityList.includes(90)){
              activityStr+="多人成团·"
            }
            historyCloudShop.activityStr=activityStr.substring(0,activityStr.length-1)
            this.setData({
              historyCloudShop
            })
          }
        }
      })
    }
  },
  //跳转云店首页
  goCloudStore(e){
    let branchId=e.currentTarget.dataset.branchid;
    utils.changeCurrentCloudShop(branchId,1);
    if(this.data.source){
      wx.navigateBack({
        delta:1
      })
    }else{
      wx.redirectTo({
        url:"/pages/cloudStoreHome/index"
      })
    }
  },
  //查询已收藏云店信息
  queryColleBranches(){
    let x=this.data.longitude;let y=this.data.latitude;
    if(wx.getStorageSync("setAddress")){//如果设置过当前所在城市
      x = wx.getStorageSync("setAddress").long;
      y = wx.getStorageSync("setAddress").lati;
    }else if(wx.getStorageSync("isaddress")){//如果选择过收货地址和水管家收货地址相通
      x = wx.getStorageSync("isaddress").longitude;
      y = wx.getStorageSync("isaddress").latitude;
    }else if(wx.getStorageSync("isdefault")){//如果有水管家默认收货地址相通
      x = wx.getStorageSync("isdefault").longitude;
      y = wx.getStorageSync("isdefault").latitude;
    }
    service.queryColleBranches({
      userId:wx.getStorageSync('userId'),
      x: x,
      y: y,
    }).then((res)=>{
      let data=res.data.data;
      if(res.data.result==200){
        data.forEach(item=>{
          if (item.distance >= 1000) {
            item.distance = (item.distance / 1000).toFixed(1)+"km"
          } else {
            item.distance = item.distance + "m";
          }
          //附近云店自提和配送
          if(item.smallDeliveryStatus==30){
            item.smallDeliveryStatus="支持自提/配送"
          }
          if(item.smallDeliveryStatus==10){
            item.smallDeliveryStatus="支持自提"
          }
          if(item.smallDeliveryStatus==20){
            item.smallDeliveryStatus="支持配送"
          }
          //活动类型
          item.activityStr='';
          let activityList=item.activityList||[];
          if(activityList.includes(10)){
            item.activityStr+="折扣·"
          }if(activityList.includes(20)){
            item.activityStr+="满减·"
          }if(activityList.includes(50)){
            item.activityStr+="买一送一·"
          }if(activityList.includes(60)){
            item.activityStr+="第二件半价·"
          }if(activityList.includes(70)){
            item.activityStr+="多件多折·"
          }if(activityList.includes(80)){
            item.activityStr+="好物预售·"
          }if(activityList.includes(90)){
            item.activityStr+="多人拼团·"
          }
          item.activityStr=item.activityStr.substring(0,item.activityStr.length-1)
        });
        this.setData({
          collectData:data,
          loadMoreShow:data.length>3
        })
      }
    })
  },
  //取消收藏点击
  noCollect(e){
    var branchId=e.currentTarget.dataset.branchid;
    if(this.submit){
      return
    }
    this.submit=true;
    service.cancelColleBranches({
      branchesId:branchId,
      userId:wx.getStorageSync('userId')
    }).then((res)=>{
      this.submit=false;
      if(res.data.result==200){
        wx.showToast({
          title: '取消收藏成功',
          icon:'none',
          duration:2000
        })
        this.setData({
          colleType:false
        })
        this.queryColleBranches()
      }
    })
  },
  //查看更多点击
  loadMore(){
    this.setData({
      loadMore:this.data.collectData.length,
      loadMoreShow:false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    qqmapsdk = new QQMapWX({
      key: 'O4ZBZ-YJULU-7HOVK-4U4X7-36X67-KCFE2'
    });
    if(options.source){//页面跳转来源
      this.setData({source:options.source})
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
    this.getUserLocation();
    this.getOpenCity();
    this.getBranch(currentCloudShop.siteId,1);
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
    this.getUserLocation();
    this.getOpenCity();
    this.getBranch(currentCloudShop.siteId,1);
    this.queryColleBranches();//查询已收藏的门店信息
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