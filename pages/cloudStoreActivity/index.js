const app = getApp();
const service = require('../../service/index.js');
import {changeCurrentCloudShop} from "../../utils/util.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type:"",//1:精选商品 2:限时折扣 3:多人拼团 4:好物预售 5:全场满减 6:买一送一 7:第二件半价 8:多件多折 
    selectAddress:null,//选择的地址
    longitude:"",//经度
    latitude:"",//纬度
    imgUrl: app.globalData.imgUrl,
    activityInfo:[],//活动数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    if(!wx.getStorageSync("userId")){//未登录跳转首页
      wx.switchTab({
        url:"/pages/home/index"
      })
    }
    this.setData({
      type:options.type
    })
  },
  //商品点击事件
  goodsClick(e){
    let { goods } = e.currentTarget.dataset;
    let { goodsCode, branchesId, activityCode, groupCode, type } = goods;
    if(type==90){//多人拼团活动商品
      let code = null;
      if(activityCode){//优选取活动编码
        code = activityCode;
      }else{
        code = groupCode;
      }
      changeCurrentCloudShop(branchesId,1);
      wx.navigateTo({
        url: '/pages/cloudStore/index?groupCode='+code+'&navtype='+type,
      })
      return;
    }
    if(this.submit){
      return;
    }
    this.submit=true;
    wx.showLoading({
      title: '加载中',
    })
    goods.goodsNum=0;//已添加的购物车数量
    service.shoppinggoods({
      smallBranchesId: branchesId,//云店的站点ID
      branchesId: "",//拼团的站点ID
      userId: wx.getStorageSync("userId")
    }).then((res)=>{
      if(res.data.result==200){
        let data = res.data.data;
        if(data){
          let cloudData = data.cartSmallEffectiveList?data.cartSmallEffectiveList:[];//云店商品
          for(let i=0;i<cloudData.length;i++){
            if(cloudData[i].goodsCode==goodsCode){
              goods.goodsNum = cloudData[i].goodsNum;
              break;
            }
          }
        }
      }
      this.addCarAndGoGroupList(goods);
    }).catch(res=>{
      this.addCarAndGoGroupList(goods);
   })
  },
  //添加购物车并且跳转分类页面
  addCarAndGoGroupList(goods){
    let { goodsCode, goodsSource, branchesId, activityCode, goodsNum, groupCode, type } = goods;
    let code = null;
    if(activityCode){//优选取活动编码
      code = activityCode;
    }else{
      code = groupCode;
    }
    service.addgoodnum({
      activityId:activityCode,
      branchesId: branchesId,
      userId: wx.getStorageSync("userId"),
      goodsResource: goodsSource,  //商品来源
      goodsCode: goodsCode,
      goodsNum: ++goodsNum 
    }).then(res=>{
      wx.hideLoading();
      this.submit = false;
      if(res.data.result==200){
        changeCurrentCloudShop(branchesId,1);
        wx.navigateTo({
          url: '/pages/cloudStore/index?groupCode='+code+'&navtype='+type,
        })
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    }).catch(res=>{
       this.submit = false;
    })
  },
  //查看更多
  lookMore(e){
    let {branchesid,groupcode} = e.currentTarget.dataset;
    let type="";
    if(this.data.type==2){//限时折扣
      type=10;
    }else if(this.data.type==5){//全场满减
      type=20;
    }else if(this.data.type==6){//买一送一
      type=50;
    }else if(this.data.type==6){//第二件半价
      type=60;
    }else if(this.data.type==8){//多件多折
      type=70;
    }else if(this.data.type==4){//好物预售
      type=80;
    }else if(this.data.type==3){//多人拼团
      type=90;
    }
    changeCurrentCloudShop(branchesid,1);
    if(!groupcode){
      groupcode="";
    }
    wx.navigateTo({
      url: '/pages/cloudStore/index?groupCode='+groupcode+'&navtype='+type,
    })
  },
  //进店
  goCloudStoreHome(e){
    let branchesId = e.currentTarget.dataset.branchesid;
    changeCurrentCloudShop(branchesId);
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
        if(wx.getStorageSync("setAddress")){//如果设置过当前所在城市
          longitude = wx.getStorageSync("setAddress").long;
          latitude = wx.getStorageSync("setAddress").lati;
        }
        that.setData({
          longitude,
          latitude
        })
        that.needLongAndLat(longitude,latitude);//需要用到经纬度的请求方法
      },
      fail: function (res) {
        if(that.data.selectAddress){
          that.needLongAndLat();  //需要用到经纬度的请求方法
          return;
        }
        wx.showToast({
          title: '亲，记得打开手机定位哟！',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //需要请求活动详情接口
  needLongAndLat(longitude, latitude){
    let x=longitude;let y=latitude;
    if(wx.getStorageSync("isaddress")){//如果选择过收货地址和水管家收货地址相通
      x = wx.getStorageSync("isaddress").longitude;
      y = wx.getStorageSync("isaddress").latitude;
    }else if(wx.getStorageSync("isdefault")){//如果有水管家默认收货地址相通
      x = wx.getStorageSync("isdefault").longitude;
      y = wx.getStorageSync("isdefault").latitude;
    }else if(wx.getStorageSync("setAddress")){//如果设置过当前所在城市
      x = wx.getStorageSync("setAddress").long;
      y = wx.getStorageSync("setAddress").lati;
    } 
    if(!x&&!y){//没有经纬度时不请求接口
      return;
    }
    if(this.data.type==1){
      this.getSelectedGoods(x,y);//获取精选商品列表
    }else if(this.data.type==2){
      this.getDiscountInLimitedTime(x,y);//获取限时折扣商品列表
    }else if(this.data.type==3){
      this.getGroupTogether(x,y);//获取多人拼团商品列表
    }else if(this.data.type==4){
      this.getGoodsPresale(x,y);//获取好物预售商品列表
    }else if(this.data.type==5){
      this.getAllFullReduction(x,y);//获取全场满减商品列表
    }else if(this.data.type==6){
      this.getTwoForOne(x,y);//获取买一送一商品列表
    }else if(this.data.type==7){
      this.getTwoHalfPrice(x,y);//获取第二件半价商品列表
    }else if(this.data.type==8){
      this.getMorePieceMoreDiscount(x,y);//获取多件多折商品列表
    }
  },
  //获取云店精选商品
  getSelectedGoods(longitude,latitude){
    service.getSelectedGoods({
      latitude:latitude,
      longitude:longitude,
      smallDeliveryStatus:this.data.cloudType  //10自提，20配送，30全部
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          let activityInfo = data.smallGoodsListActivityResDtoList||[];//活动数据
          this.setData({
            activityInfo
          })
        }
      }
    })
  },
  //获取限时折扣商品
  getDiscountInLimitedTime(longitude,latitude){
    service.getDiscountInLimitedTime({
      latitude:latitude,
      longitude:longitude,
      smallDeliveryStatus:this.data.cloudType  //10自提，20配送，30全部
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          this.setData({
            activityInfo:data//活动数据
          })
        }
      }
    })
  },
  //获取多人拼团商品
  getGroupTogether(longitude,latitude){
    service.getGroupTogether({
      latitude:latitude,
      longitude:longitude,
      smallDeliveryStatus:this.data.cloudType  //10自提，20配送，30全部
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          this.setData({
            activityInfo:data//活动数据
          })
        }
      }
    })
  },
  //获取多人拼团商品
  getGoodsPresale(longitude,latitude){
    service.getGoodsPresale({
      latitude:latitude,
      longitude:longitude,
      smallDeliveryStatus:this.data.cloudType  //10自提，20配送，30全部
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          this.setData({
            activityInfo:data//活动数据
          })
        }
      }
    })
  },
  //获取全场满减商品
  getAllFullReduction(longitude,latitude){
    service.getAllFullReduction({
      latitude:latitude,
      longitude:longitude,
      smallDeliveryStatus:this.data.cloudType  //10自提，20配送，30全部
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          this.setData({
            activityInfo:data//活动数据
          })
        }
      }
    })
  },
  //获取买一送一商品
  getTwoForOne(longitude,latitude){
    service.getTwoForOne({
      latitude:latitude,
      longitude:longitude,
      smallDeliveryStatus:this.data.cloudType  //10自提，20配送，30全部
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          this.setData({
            activityInfo:data//活动数据
          })
        }
      }
    })
  },
  //获取第二件半价商品
  getTwoHalfPrice(longitude,latitude){
    service.getTwoHalfPrice({
      latitude:latitude,
      longitude:longitude,
      smallDeliveryStatus:this.data.cloudType  //10自提，20配送，30全部
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          this.setData({
            activityInfo:data//活动数据
          })
        }
      }
    })
  },
  //获取多件多折商品
  getMorePieceMoreDiscount(longitude,latitude){
    service.getMorePieceMoreDiscount({
      latitude:latitude,
      longitude:longitude,
      smallDeliveryStatus:this.data.cloudType  //10自提，20配送，30全部
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          this.setData({
            activityInfo:data//活动数据
          })
        }
      }
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
    wx.showLoading({
      title:"加载中..."
    });
    let selectAddress=false;
    if(wx.getStorageSync("isaddress")) {//如果有选择收货地址
      selectAddress=true;
    }else if(wx.getStorageSync("isdefault")){//如果有默认收货地址
      selectAddress=true;
    }
    this.setData({
      selectAddress:selectAddress
    },()=>{
      this.getUserLocation();
    });
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