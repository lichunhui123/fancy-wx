const app = getApp();
const service = require('../../service/index.js');
const QQMapWX= require('../../utils/qqmap-wx-jssdk.js');
const until=require('../../utils/util.js');
import floatObj from "../../utils/floatObj.js"
var qqmapsdk;
let discountTimer=null;//限时折扣定时器
Page({
  /**
   * 页面的初始数据
   */
  data: {
    toTopshow:false,//返回顶部
    branchId: '',  //拼团站点id
    cloudBranchId:'', //云店站点id
    systemInfo:null, //设备信息
    crownShow:false, //会员码弹框
    receiptBarCode:"",//会员码
    selectAddress:"北京",  //选择的收货地址
    storageAddress:null,//本地缓存的地址信息
    city:'', //选择城市/定位城市
    longitude:'',  //经度
    latitude:'',   //纬度
    orderIndex:"",//跳转订单页面
    showLogin:false,//显示登陆弹窗
    path:"",//点击跳转的页面
    imgUrl: app.globalData.imgUrl,
    swiperCurrent:0,
    bannerConfig:[
      {
        headBannerPic:"mallImages/20210419/RZD8DFXFsHiJWwQrrDRb65WrfcQRjicc.png",//banner图片地址
      },
      {
        headBannerPic:"mallImages/20210419/idxRZRzMmbpKAfBR26t5D3ffDJFGyXK3.png",//banner图片地址
      },
      {
        headBannerPic:"mallImages/20210419/znGx3SGbF3jeRMtrPwDptC6ZEGPPCjMZ.png",//banner图片地址
      },
      {
        headBannerPic:"mallImages/20210419/2h3EZ5bZYYpXNsbKy2bCyQedT3Y2AYfd.png",//banner图片地址
      }
    ],//banner配置
    bannerType:'',//1代表更好甄选 2 拼团
    notice:{
      takeExpress:0,
      sendExpress:0,
      payWait:0,
      receive:0,
    },//通知提示
    anchorPointerType:1,//1-指尖云店 2-更好甄选 3-饮用水
    cloudType:"",//30-全部 10-自提 20-配送
    cloudStoreActivityType:0,//1-精选 2-限时折扣 3-一起团 4-好货预售 5-全场满减 6-买一送一 7-第二件半价 8-多件多折
    goodsInfo:null,//跳转商品详情页面保存的商品信息
    nearHasCloud:true,//精选商品是否有门店的商品
    slectedGoods:[],//精选商品
    selectedGoodsLen:0,//精选商品的列表长度
    selectedGoodsClass:"",//精选商品父级class
    cloudStoreDiscount:[],//限时折扣商品列表
    cloudStoreDiscountClass:"",//限时折扣父级class
    groupTogether:[],//多人拼团商品列表
    groupTogetherClass:"",//多人拼团父级class
    preSale:[],//好物预售商品列表
    preSaleClass:"",//好物预售父级class
    allFullReduction:[],//全场满减商品列表
    allFullReductionLen:"",//全场满减列表长度
    twoForOne:[],//买一送一商品列表
    twoForOneClass:"",//买一送一父级class
    twoHalfPrice:[],//第二件半价商品列表
    twoHalfPriceClass:"",//第二件半价父级class
    morePieceMoreDiscount:[],//多件多折商品列表
    morePieceMoreDiscountClass:"",//多件多折父级class
    colleBranches:[],//收藏门店的列表
    colleBranchesId:"",//点击收藏门店时门店ID
    waterListClass:"",//饮用水列表的父级class 两个商品:'activite_bottomtwo' 三个商品:'activite_bottomthree'
    waterList:[],//饮用水商品列表
    fingerMallDiscountList:[],//更好甄选的限时折扣商品列表
    fingerMallList:[],//更好甄选的商品列表
    fingerMallClassCode:"",//分类编码
    startX: 0, //开始移动时距离左
    endX: 0, //结束移动时距离左
    maskShow:false,//系统卡券
    coupondata:[],  //卡券数据
    shoppnum:0,   //购物车数量
    shoppingGoods:[],//购物车列表
    goodsCarItem:null,//商品添加购物车时存放的信息
    goodsCarType:'',//类型 minus-购物车减少 add-购物车添加 input-购物车输入
    goodsCarInput:0,//购物车输入的数量
  },
  //登录成功
  loginSuccess(data){
    this.setData({showLogin:false});
    if(data.detail){//第一次登录
      if(this.data.path=="receiptBarcode"||this.data.path == "updateCar"){//跳转页面的不用发送以下的请求
        this.getAddreddList(); //获取默认地址  并且会获取饮用水列表 如果没有选择云店默认查询最近的云店地址
        this.queryNoticeByUserId();//查询用户通知提示
        this.queryColleBranches();//查询用户收藏门店列表
        if(this.data.waterList.length>0||this.data.fingerMallList.length>0){
          this.getshoppingGoods();//获取购物车列表
        }
        app.shoppingNum();//获取购物车数量
        if(this.data.cloudBranchId){
          this.queryCardListBySelectSystem();//系统卡券弹框
        }
      }
    }
    //进入地址选择页面
    if(this.data.path=="homeAddress"){
      wx.navigateTo({
        url: '/pages/homeAddress/index',
      })
    }
    //跳转收发快递页
    if(this.data.path=="express"){
      wx.removeStorageSync("expressInfo");//先清除一下缓存
      wx.navigateTo({
        url: '/pages/expressNotTake/index',
      })
    }
    //会员码
    if(this.data.path=="receiptBarcode"){
      wx.showLoading({
        title:"加载中..."
      });
      service.getReceiptBarcode({
        userId:wx.getStorageSync("userId"),
      }).then((res)=>{
        wx.hideLoading();
        if(res.data.result=="200"){
          this.setData({
            receiptBarCode:res.data.data.receiptBarCode,
            crownShow:true
          });
        }
      })
    }
    //我的订单
    if(this.data.path=="order"){
      wx.navigateTo({
        url:"/pages/personalOrderList/index?index="+this.data.orderIndex
      })
    }
    //跳转门店列表页面
    if(this.data.path == "cloudStoreList"){
      wx.navigateTo({
        url: '/pages/cloudStoreList/index',
      })
    }
    //跳转门店首页
    if(this.data.path == "cloudStoreHome"){
      until.changeCurrentCloudShop(this.data.colleBranchesId);
    }
    //跳转商品分类页面
    if(this.data.path == "goodsGroupPage"){
      let {groupCode,goodsSource,branchesId,activityCode,type} = this.data.goodsInfo;
      let code = null;
      if(activityCode){//优选取活动编码
        code = activityCode;
      }else{
        code = groupCode;
      }
      if(goodsSource==10){//更好甄选 （商城）
        wx.navigateTo({
          url: '/pages/fingerMall/index?classCode='+code,
        })
      }else{//云店
        until.changeCurrentCloudShop(branchesId,1);
        wx.navigateTo({
          url: '/pages/cloudStore/index?groupCode='+code+'&navtype='+type,
        })
      }
    }
    //跳转到云店活动详情页面
    if(this.data.path == "cloudStoreActivity"){
      if(this.data.cloudStoreActivityType==1&&!this.data.nearHasCloud){//精选商品没有门店的商品全是甄选的商品
        wx.navigateTo({
          url: '/pages/fingerMall/index',
        })
      }else{
        wx.navigateTo({
          url: '/pages/cloudStoreActivity/index?type='+this.data.cloudStoreActivityType,
        })
      }
    }
    //跳转水管家
    if(this.data.path=="water"){
      wx.navigateTo({
        url: '/pages/water/index',
      })
    }
    //更好甄选（限时折扣）进去逛逛
    if(this.data.path=="group"){
      wx.navigateTo({
        url: '/pages/group/index?type=10',
      })
    }
    //更好甄选（指尖商城）
    if(this.data.path=="fingerMall"){
      let url="/pages/fingerMall/index";
      if(this.data.fingerMallClassCode){
        url = '/pages/fingerMall/index?classCode=' + this.data.fingerMallClassCode;
      }
      wx.navigateTo({
        url: url,
      })
    }
    //更好甄选（指尖商城）或者水管家添加购物车
    if(this.data.path == "updateCar") {
      this.updateCarAction()
    }
  },
  //to我的快递
  goExpress(){
    this.setData({
      showLogin:true,
      path:"express"
    });
  },
  //点击获取会员码弹出弹层
  getReceiptBarcode(){
    this.setData({
      showLogin:true,
      path:"receiptBarcode"
    });
  },
  //关闭会员码页面
  cancelmask(){
    this.setData({
      crownShow:false
    })
  },
  //点击跳转我的订单页面
  goOrder(e){
    let index = e.currentTarget.dataset.index;
    this.setData({
      showLogin: true,
      path: "order",
      orderIndex:index
    });
  },
  //查看附件门店
  goCloudStoreList(){
    this.setData({
      showLogin:true,
      path:"cloudStoreList"
    });
  },
  //点击商品跳转到商品的分类列表页面
  goGoodsGroupPage(e){
    let goodsInfo = e.currentTarget.dataset.goods;
    this.setData({
      showLogin: true,
      path: "goodsGroupPage",
      goodsInfo
    });
  },
  //进店逛逛
  goCloudStoreHome(e){
    let branchesId = e.currentTarget.dataset.branchesid;
    this.setData({
      showLogin:true,
      path:"cloudStoreHome",
      colleBranchesId:branchesId
    });
  },
  //to水管家首页
  goWater(){
    this.setData({
      showLogin:true,
      path:"water"
    });
  },
  //云店、甄选、饮用水锚点点击
  anchorPointer(e){
    let type = e.currentTarget.dataset.type;
    this.setData({
      anchorPointerType:type
    })
    var query =  wx.createSelectorQuery()//创建节点查询器
    query.select('#anchorPointer'+type).boundingClientRect()//选择id为comment的节点并查询的它布局位置
    query.exec(function(res) {//执行请求
      wx.pageScrollTo({
        scrollTop: res[0].top,//滚动到页面节点的上边界坐标
        duration: 500   // 滚动动画的时长
      });
    })
  },
  //全部、自提、配送点击切换
  cloudTypeChange(e){
    if(this.hasCloudTypeClick){//防止重复点击
      return;
    }
    wx.showLoading({title:"加载中..."});
    this.hasCloudTypeClick = true;
    let type = e.currentTarget.dataset.type;
    this.setData({
      cloudType:type
    },()=>{
      this.needLongAndLat(this.data.longitude,this.data.latitude,1);
      setTimeout(()=>{
        wx.hideLoading();
        this.hasCloudTypeClick = false;//防止重复点击
      },2000)
    })
  },
  //跳转到云店活动详情页面
  goCloudStoreActivity(e){
    let type = e.currentTarget.dataset.type;
    this.setData({
      showLogin:true,
      path:"cloudStoreActivity",
      cloudStoreActivityType:type
    });
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
        if(!that.data.selectAddress){//如果没有选择收货地址 获取当前定位地址
          that.getLocal(longitude, latitude);
        }
        if(!that.data.branchId||!that.data.cloudBranchId){
          that.getLocalT(longitude, latitude); //获取最近的站点
        }
      },
      fail: function (res) {
        that.needLongAndLat();  //需要用到经纬度的请求方法
        if(!that.data.branchId||!that.data.cloudBranchId){
          that.getLocalT(); //如果没有选择云店默认查询最近的云店
        }
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
    qqmapsdk.reverseGeocoder({
      location: {
        longitude: long,
        latitude: lati
      },
      success: (res)=> {
        let city = wx.getStorageSync("city") ? wx.getStorageSync("city") : res.result.ad_info.city;
        if (wx.getStorageSync("setAddress")) {
          city = wx.getStorageSync("setAddress").cityName;
        }
        wx.setStorageSync('city', city);
        this.setData({
          city:city,
          selectAddress: res.result.address
        });
      },
      fail: function (res) {
      }
    });
  },
  // 获取最近站点位置
  getLocalT(x,y) {
    let city=''
    if(wx.getStorageSync("isaddress")){//如果选择过收货地址和水管家收货地址相通
      city=wx.getStorageSync("isaddress").cityName;
      x = wx.getStorageSync("isaddress").longitude;
      y = wx.getStorageSync("isaddress").latitude;
    }else if(wx.getStorageSync("isdefault")){//如果有水管家默认收货地址相通
      city=wx.getStorageSync("isaddress").cityName;
      x = wx.getStorageSync("isdefault").longitude;
      y = wx.getStorageSync("isdefault").latitude;
    }else if(wx.getStorageSync("setAddress")){//如果设置过当前所在城市
      city = wx.getStorageSync("setAddress").cityName;
      x = wx.getStorageSync("setAddress").long;
      y = wx.getStorageSync("setAddress").lati;
    } 
    qqmapsdk.reverseGeocoder({
      location: {
        longitude: x,
        latitude: y
      },
      success: (res)=> {
        if (!city) {
          city = res.result.ad_info.city
        }
        if(!this.data.branchId){
          service.getcommunity({
            cityName: city,
            longitude: x,
            latitude: y,
            scenes:[5],
            searchContent: '',
          }).then((res)=>{
            if(res.data.result==200){
              //缓存最近
              let data=res.data.data
              if(data&&data.length>0){
                wx.setStorageSync('presentAddress',data[0]);
                //设置最近的站点ID
                this.setData({
                  branchId:data[0].siteId
                });
              }
            }
          })
        }
        if(!this.data.cloudBranchId){
          service.getcommunity({
            cityName: city,
            longitude: x,
            latitude: y,
            scenes:[6],
            searchContent: '',
          }).then((res)=>{
            if(res.data.result==200){
              let data=res.data.data
              if(data&&data.length>0){
                wx.setStorageSync('currentCloudShop',{siteId:data[0].siteId});
                //设置最近的站点ID
                this.setData({
                  cloudBranchId:data[0].siteId
                },()=>{
                  if(wx.getStorageSync("userId")){
                    this.queryCardListBySelectSystem();//系统卡券弹框
                  }
                });
              }
            }
          })
        }
      },
    });
  },
  //需要用到经纬度的请求
  needLongAndLat(longitude, latitude, noWater){
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
    this.getSelectedGoods(x,y);//获取精选商品列表
    this.getDiscountInLimitedTime(x,y);//获取限时折扣商品列表
    this.getGroupTogether(x,y);//获取多人拼团商品列表
    this.getGoodsPresale(x,y);//获取好物预售商品列表
    this.getAllFullReduction(x,y);//获取全场满减商品列表
    this.getTwoForOne(x,y);//获取买一送一商品列表
    this.getTwoHalfPrice(x,y);//获取第二件半价商品列表
    this.getMorePieceMoreDiscount(x,y);//获取多件多折商品列表
    if(!noWater){
      this.getWaterlist(x,y);//获取饮用水业务列表
    }
  },
  //收货地址选择
  nearSite(){
    this.setData({
      showLogin:true,
      path:"homeAddress"
    });
  },
  //获取默认地址（首次进入小程序如果用户以前有默认地址展示默认地址；）
  getAddreddList(){
    if(this.data.storageAddress){//有缓存的地址信息时
      this.needLongAndLat();  //需要用到经纬度的请求方法
      if(!this.data.branchId||!this.data.cloudBranchId){
        this.getLocalT(); //如果没有选择云店默认查询最近的云店
      }
      return;
    }
    service.getwateraddresslist({
      "platform": "wx",
      "requestCode": 1004,
      "params": "{userId:" + wx.getStorageSync('userId') + ",pageNo:1,pageSize:20}"
    }).then(res=>{
      if (res.data.result == 0 || res.data.result == 200){
        if(res.data.data.length>0){
          res.data.data.forEach(item=>{
            if (item.isDefault==1){  //有默认收货地址
              wx.setStorageSync('isdefault', item)
              if(wx.getStorageSync("isaddress")) {//如果有选择收货地址
                let itemData = wx.getStorageSync("isaddress");
                this.setData({
                  storageAddress:itemData,
                  selectAddress:itemData.provinceName+itemData.cityName+itemData.districtName+itemData.address
                });
              }else{
                this.setData({
                  storageAddress:item,
                  selectAddress:item.provinceName+item.cityName+item.districtName+item.address
                });
              }
            }
          })
        }
      }
      this.getUserLocation();//获取授权 并且获取水商品
    })
  },
  //获取banner配置
  getBannerConfig(){
    service.queryBannerConfigList({}).then((res)=>{//优先调用更好甄选的banner
      let fingerMallBanner=res.data.data;
      if(fingerMallBanner&&fingerMallBanner.length>0){
        this.setData({
          bannerConfig:fingerMallBanner,
          bannerType:1,
          swiperNum:0,
          swiperCurrent:0,
        })
      }else{//获取拼团的banner
        service.getBannerConfig({
          storeId: this.data.branchId //店铺Id
        }).then((res)=>{
          let banner = res.data.data;
          if(banner&&banner.length>0){
            this.setData({
              bannerConfig:banner,
              bannerType:2,
              swiperNum:0,
              swiperCurrent: 0,
            })
          }else{
            this.setData({
              bannerConfig:[
                {
                  headBannerPic:"mallImages/20210419/RZD8DFXFsHiJWwQrrDRb65WrfcQRjicc.png",//banner图片地址
                },
                {
                  headBannerPic:"mallImages/20210419/idxRZRzMmbpKAfBR26t5D3ffDJFGyXK3.png",//banner图片地址
                },
                {
                  headBannerPic:"mallImages/20210419/znGx3SGbF3jeRMtrPwDptC6ZEGPPCjMZ.png",//banner图片地址
                },
                {
                  headBannerPic:"mallImages/20210419/2h3EZ5bZYYpXNsbKy2bCyQedT3Y2AYfd.png",//banner图片地址
                }
              ]
            })
          }
        })
      }
    })
    
  },
  //跳转到banner活动页
  goThematicActivities(e){
    let dataset = e.currentTarget.dataset;
    let item = dataset['item'];//banner信息
    let index = dataset['index'];//banner数组下标
    //需要跳转到转转小程序
    if(item.adsTitle=="转转小程序"){
      let url=`https://m.zhuanzhuan.com/zz-fe-platform/app-core/recovery/index?isShowMenu=1&tabType=1&channelSource=${item.channelCode}`;
      let path=`/pages/webview/bridge?url=${encodeURIComponent(url)}`;
      wx.navigateToMiniProgram({
        appId: 'wx9df7443125e6f01a',
        path: path,
        extraData: {
          foo: 'bar'
        },
        success(res) {
          // 打开成功
        }
      });
      return;
    }
    //banner活动配置页必须要有图片或者导航名称加商品列表才可以跳转
    if(item.adsBannerPic||(item.navigateDtoList&&item.navigateDtoList.length>0)){
      if(this.data.bannerType==1){
        wx.navigateTo({
          url:`/pages/fingerMallBannerActivity/index?index=${index}`
        })
      }else{
        wx.navigateTo({
          url:`/pages/bannerActivity/index?activityCode=${item.activityCode}&index=${index}`
        })
      }
    }
  },
  //查询用户通知提示
  queryNoticeByUserId(){
    service.queryNoticeByUserId({
      userId:wx.getStorageSync("userId")
    }).then(res=>{
      if(res.data.result==200){
        this.setData({
          notice:res.data.data,//通知提示
        })
      }
    })
  },
  //获取云店精选商品
  getSelectedGoods(longitude,latitude){
    service.getSelectedGoods({
      latitude:latitude,
      longitude:longitude,
      smallDeliveryStatus:this.data.cloudType  //10自提，20配送，30全部
    }).then((res)=>{
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          let mallGoodsInfos = data.mallGoodsInfos;
          let smallGoodsListActivityResDtoList = data.smallGoodsListActivityResDtoList;
          let selectedGoods = [];
          let nearHasCloud = false;
          if(smallGoodsListActivityResDtoList&&smallGoodsListActivityResDtoList.length>0){
            nearHasCloud = true;
            smallGoodsListActivityResDtoList.forEach((item)=>{
              if(item.smallGoodsList){
                item.smallGoodsList.forEach((val)=>{
                  let salesPrice = "";
                  if(val.discountPrice){//折扣价
                    salesPrice = floatObj.divide(val.discountPrice,100);
                  }else if(val.prePrice){//预售价 团购价
                    salesPrice = val.prePrice;
                  }else{
                    salesPrice = val.showSalesPrice;
                  }
                  selectedGoods.push({
                    goodsSource:val.goodsSource,//来源 云店40
                    goodsName:val.goodsName,//商品名称
                    goodsPic:val.goodsPic.split(",")[0],//商品图片
                    salesPrice:until.getNum(salesPrice),//价格
                    spec:val.spec,//规格
                    groupCode:val.groupCode,//分组code
                    activityCode:val.activityCode,//活动编码
                    goodsCode:val.goodsCode,//商品编码
                    type:val.type,//活动类型
                    branchesName:item.branchesName,//门店名称
                    branchesId:item.branchesId,//门店ID
                  })
                })
              }
            })
          }
          if(mallGoodsInfos){
            mallGoodsInfos.forEach((item)=>{
              let salesPrice = "";
              if(item.discountPrice){
                salesPrice = floatObj.divide(item.discountPrice,100);
              }else{
                salesPrice = item.salesPrice;
              }
              selectedGoods.push({
                goodsSource:item.goodsSource,//来源 甄选10
                goodsName:item.skuName,//商品名称
                goodsPic:item.goodsPics.split(",")[0],//商品图片
                salesPrice:until.getNum(salesPrice),//价格
                spec:item.spec,//规格
                groupCode:item.classCode,//分组code
                activityCode:item.activityCode,//活动编码
                goodsCode:item.skuCode,//商品编码
              })
            })
          }
          selectedGoods = selectedGoods.slice(0,32);
          let selectedGoodsClass="";//父级class
          let selectedGoodsLen=selectedGoods.length;//精选商品的长度
          let result = [];
          if(selectedGoods.length==2){
            selectedGoodsClass="choicenessList_two"; 
          }else if(selectedGoods.length==3){
            selectedGoodsClass="choicenessList_three"; 
          }else if(selectedGoods.length>=4){//大于等于4需要处理
            for(let i=0;i<selectedGoods.length;i+=4) {
              result.push(selectedGoods.slice(i, i + 4));
            }
          }
          this.setData({
            selectedGoods:result.length>0?result:selectedGoods,
            selectedGoodsLen,
            selectedGoodsClass,
            nearHasCloud
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
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          let cloudStoreDiscount = [];
          data.forEach((item)=>{
            if(item.smallGoodsList){//组合数据
              item.smallGoodsList.forEach((val)=>{
                val.branchesName=item.branchesName//门店名称
              })
              cloudStoreDiscount.push(...item.smallGoodsList);
            }
          })
          cloudStoreDiscount = cloudStoreDiscount.slice(0,30);
          let cloudStoreDiscountClass="";//父级class
          if(cloudStoreDiscount.length==2){
            cloudStoreDiscountClass="goodspre_bottomtwo"; 
          }else if(cloudStoreDiscount.length==3){
            cloudStoreDiscountClass="goodspre_bottomthree"; 
          }else if(cloudStoreDiscount.length>=4){//大于等于4
            cloudStoreDiscountClass="goodspre_bottomfour";
          }
          this.setData({
            cloudStoreDiscount,//限时折扣商品列表
            cloudStoreDiscountClass,//限时折扣父级class
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
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          let groupTogether = [];
          data.forEach((item)=>{
            if(item.smallGoodsList){//组合数据
              item.smallGoodsList.forEach((val)=>{
                val.branchesName=item.branchesName//门店名称
              })
              groupTogether.push(...item.smallGoodsList);
            }
          })
          groupTogether = groupTogether.slice(0,30);
          let groupTogetherClass="";//父级class
          if(groupTogether.length==2){
            groupTogetherClass="activite_bottomtwo"; 
          }else if(groupTogether.length==3){
            groupTogetherClass="activite_bottomthree"; 
          }else if(groupTogether.length>=4){//大于等于4
            groupTogetherClass="activite_bottomfour";
          }
          this.setData({
            groupTogether,//多人拼团商品列表
            groupTogetherClass,//多人拼团父级class
          })
        }
      }
    })
  },
  //获取好物预售商品
  getGoodsPresale(longitude,latitude){
    service.getGoodsPresale({
      latitude:latitude,
      longitude:longitude,
      smallDeliveryStatus:this.data.cloudType  //10自提，20配送，30全部
    }).then((res)=>{
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          let preSale = [];
          data.forEach((item)=>{
            if(item.smallGoodsList){//组合数据
              item.smallGoodsList.forEach((val)=>{
                val.branchesName=item.branchesName//门店名称
              })
              preSale.push(...item.smallGoodsList);
            }
          })
          preSale = preSale.slice(0,30);
          let preSaleClass="";//父级class
          if(preSale.length==2){
            preSaleClass="goodspre_bottomtwo"; 
          }else if(preSale.length==3){
            preSaleClass="goodspre_bottomthree"; 
          }else if(preSale.length>=4){//大于等于4
            preSaleClass="goodspre_bottomfour";
          }
          this.setData({
            preSale,//好物预售商品列表
            preSaleClass,//好物预售父级class
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
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          let allFullReduction = [];
          data.forEach((item)=>{
            if(item.smallGoodsList){//组合数据
              item.smallGoodsList.forEach((val)=>{
                val.branchesName=item.branchesName//门店名称
              })
              allFullReduction.push(...item.smallGoodsList);
            }
          })
          allFullReduction = allFullReduction.slice(0,30);
          let allFullReductionLen = allFullReduction.length;
          let result=[];
          if(allFullReduction.length>=3){//大于等于3
            for(let i=0;i<allFullReduction.length;i+=3) {
              result.push(allFullReduction.slice(i, i + 3));
            }
          }
          this.setData({
            allFullReduction:result.length>0?result:allFullReduction,//全场满减商品列表
            allFullReductionLen//全场满减的数据长度
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
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          let twoForOne = [];
          data.forEach((item)=>{
            if(item.smallGoodsList){//组合数据
              item.smallGoodsList.forEach((val)=>{
                val.branchesName=item.branchesName//门店名称
              })
              twoForOne.push(...item.smallGoodsList);
            }
          })
          twoForOne = twoForOne.slice(0,30);
          let twoForOneClass="";//父级class
          if(twoForOne.length==2){
            twoForOneClass="activite_bottomtwo"; 
          }else if(twoForOne.length==3){
            twoForOneClass="activite_bottomthree"; 
          }else if(twoForOne.length>=4){//大于等于4
            twoForOneClass="activite_bottomfour";
          }
          this.setData({
            twoForOne,//买一送一商品列表
            twoForOneClass,//买一送一父级class
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
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          let twoHalfPrice = [];
          data.forEach((item)=>{
            if(item.smallGoodsList){//组合数据
              item.smallGoodsList.forEach((val)=>{
                val.branchesName=item.branchesName//门店名称
              })
              twoHalfPrice.push(...item.smallGoodsList);
            }
          })
          twoHalfPrice = twoHalfPrice.slice(0,30);
          let twoHalfPriceClass="";//父级class
          if(twoHalfPrice.length==2){
            twoHalfPriceClass="goodspre_bottomtwo"; 
          }else if(twoHalfPrice.length==3){
            twoHalfPriceClass="goodspre_bottomthree"; 
          }else if(twoHalfPrice.length>=4){//大于等于4
            twoHalfPriceClass="goodspre_bottomfour";
          }
          this.setData({
            twoHalfPrice,//第二件半价商品列表
            twoHalfPriceClass,//第二件半价父级class
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
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          let morePieceMoreDiscount = [];
          data.forEach((item)=>{
            if(item.smallGoodsList){//组合数据
              item.smallGoodsList.forEach((val)=>{
                val.branchesName=item.branchesName//门店名称
              })
              morePieceMoreDiscount.push(...item.smallGoodsList);
            }
          })
          morePieceMoreDiscount = morePieceMoreDiscount.slice(0,30);
          let morePieceMoreDiscountClass="";//父级class
          if(morePieceMoreDiscount.length==2){
            morePieceMoreDiscountClass="goodspre_bottomtwo"; 
          }else if(morePieceMoreDiscount.length==3){
            morePieceMoreDiscountClass="goodspre_bottomthree"; 
          }else if(morePieceMoreDiscount.length>=4){//大于等于4
            morePieceMoreDiscountClass="goodspre_bottomfour";
          }
          this.setData({
            morePieceMoreDiscount,//多件多折商品列表
            morePieceMoreDiscountClass//多件多折父级class
          })
        }
      }
    })
  },
  //查询收藏的门店列表
  queryColleBranches(){
    service.queryColleBranches({
      userId:wx.getStorageSync("userId")
    }).then((res)=>{
      if(res.data.result==200){
        this.setData({
          colleBranches:res.data.data
        })
      }
    })
  },
  //获取饮用水（水管家）列表
  getWaterlist(longitude,latitude){
    if(!wx.getStorageSync('userId')){
      return;
    }
    service.getwaterlist({
      longitude:longitude,  //经度
      latitude:latitude,   //纬度
      userId: wx.getStorageSync('userId'),
    }).then(res=>{
      if(res.data.result==200){
        let data = res.data.data;
        let dataList=data?data.splice(0,3):[];
        if(dataList){
          dataList.forEach(item=>{
            item.goodsPhotos = item.goodsPhotos.split(',')[0];
            item.salesPrice = until.getNum(floatObj.divide(item.sellPrice,100));//销售价
            item.goodsResource=20; //来源拼团5 指尖商城10 水管家20 添加购物车时使用
            item.skuId= item.id;// 添加购物车时使用
          })
          let waterListClass = "";
          if(dataList.length==2){
            waterListClass="activite_bottomtwo";
          }else if(dataList.length==3){
            waterListClass="activite_bottomthree";
          }
          this.setData({
            waterList:dataList,
            waterListClass
          },()=>{
            if(dataList.length>0){
              this.getshoppingGoods();//请求购物车商品列表
            }
          });
        }
      }
    })
  },
  //获取更好甄选（限时折扣）
  getFingerMallDiscountList(){
    service.queryActivityGoodsList({
      userId:wx.getStorageSync("userId")?wx.getStorageSync("userId"):null,
      pageNum:1,
      pageSize: 10
    }).then((res) => {
      if (res.data.result == 200) {
        wx.stopPullDownRefresh();
        let data = res.data.data;
        if(data){
          let fiveo=this.rpxshift(100)  //兼容不用机型的处理
          let teno=this.rpxshift(200)
          let minus=this.rpxshift(-700)
          if(data.length<=3){
            data.forEach((item,index)=>{
              if(index==0){
                item.zIndex=5
                item.left=0
                item.animation= null
                item.scale=1
                item.few=''
              }
              else if(index==1){
                item.zIndex=4
                item.left=fiveo
                item.animation= null
                item.scale=0.8
                item.few=''
              }
              else if(index==2){
                item.zIndex=3
                item.left=teno
                item.animation= null
                item.scale=0.6
                item.few=''
              }
              item.discountPrice = (item.discountPrice / 100).toFixed(2);//折扣价
              item.goodsPic = item.goodsPic.split(',')[0];
            })
          }
          if(data.length>3){
            data.forEach((item,index)=>{
              if(index==0){
                item.zIndex=6
                item.left=minus
                item.animation= null
                item.scale=1
                item.few=''
              }
              else if(index==1){
                item.zIndex=5
                item.left=0
                item.animation= null
                item.scale=1
                item.few=''
              }
              else if(index==2){
                item.zIndex=4
                item.left=fiveo
                item.animation= null
                item.scale=0.8
                item.few=''
              }
              else if(index==3){
                item.zIndex=3
                item.left=teno
                item.animation= null
                item.scale=0.6
                item.few=''
              }
              else{
                item.zIndex=2
                item.left=teno
                item.animation= null
                item.scale=0.4
                item.few=''
              }
              item.discountPrice = (item.discountPrice / 100).toFixed(2);//折扣价
              item.goodsPic = item.goodsPic.split(',')[0];
            })
          }
          let json3={
            zIndex: 6,
            left: minus,
            animation: null,
            scale: 1,
            few:'few',
            goodsPic: "mallImages/20191106/eb0d99bd58074cec8567e9d3435a8a86.png",
            picDetail: "mallImages/20191106/e88be33b6e684e7189a6e4c8d5215bce.png",
          }
          let json1={
            zIndex: 4,
            left: fiveo,
            animation: null,
            scale: 0.8,
            few:'few',
            goodsPic: "mallImages/20191106/eb0d99bd58074cec8567e9d3435a8a86.png",
            picDetail: "mallImages/20191106/e88be33b6e684e7189a6e4c8d5215bce.png",
          }
          let json2={
            zIndex: 3,
            left: teno,
            animation: null,
            scale: 0.6,
            few:'few',
            goodsPic: "mallImages/20191106/8ff912837d0141cab946fc49160c4042.png",
            picDetail: "mallImages/20191106/2e369325ad494bd9b43de85de2ad41cc.png",
          }
          let newdata= []
          if(data.length==1){
            newdata=[...data,json1,json2]
          }
          if(data.length==2){
            newdata=[json3,...data,json2]
          }
          if(data.length==3){
            newdata=[json3,...data]
          }
          if(data.length>3){
            newdata=data
          }
          this.setData({
            fingerMallDiscountList: newdata //限时折扣的数据
          },()=>{
            if(data.length>0){
              this.move(0,1);
              discountTimer = setInterval(() => {  //定时器，两秒执行一次
                this.left()
              }, 2000);
            }
          })
        }
      }
    })
  },
  //更好甄选（限时折扣）跳转
  moveClick(e){
    clearInterval(discountTimer);
    let { goodsCode,few} = e.currentTarget.dataset.inda;
    if(few=='few'){
      discountTimer = setInterval(() => {  //定时器，两秒执行一次
        this.left()
      }, 2000);
      return
    }
    wx.navigateTo({
      url: '/pages/fingerMallGoodDetail/index?skuCode=' + goodsCode,
    })
  },
  //更好甄选（限时折扣）进去逛逛
  limitClick(){
    this.setData({
      showLogin:true,
      path:"group"
    });
  },
  //更好甄选（指尖云店）商品详情
  fingerMallGoodsDetailClick(e) {
    let { skuCode } = e.currentTarget.dataset.itdetail;
    wx.navigateTo({
      url: '/pages/fingerMallGoodDetail/index?skuCode=' + skuCode,
    })
  },
  //更好甄选（指尖云店）查看更多
  viewMore(e){
    let { classCode } = e.currentTarget.dataset.itdetail;
    this.setData({
      showLogin:true,
      path:"fingerMall",
      fingerMallClassCode:classCode
    });
  },
  //查询更好甄选(指尖电商)商品列表
  queryMallGoodsList(){
    service.queryMallGoodsList({}).then((res)=>{
      if(res.data.result==200){
        let mallGoodsList = [];
        if(res.data.data&&res.data.data.mallGoodsList){
          mallGoodsList = res.data.data.mallGoodsList;
          mallGoodsList.map((item,index)=>{
            item.id=index+1;
            item.num=1;
            item.mallGoodsInfos.map(it=>{
              it.goodsPics = it.goodsPics.split(',')[0];
              it.goodsResource=10; //来源拼团5 指尖商城10 水管家20
              it.discountPrice=it.activityId?until.getNum(floatObj.divide(it.discountPrice,100)):null;//折扣价
              it.salesPrice=until.getNum(it.salesPrice);//销售价
              it.competitorPrice=until.getNum(it.competitorPrice);//友商价
            })
          });
        }
        this.setData({
          fingerMallList:mallGoodsList
        },()=>{
          if(mallGoodsList.length>0){
            this.getshoppingGoods();//请求购物车商品列表
          }
        });
      }
    })
  },
  //查询购物车商品
  getshoppingGoods(){
    if(!wx.getStorageSync("userId")){
      return;
    }
    service.shoppinggoods({
      branchesId: this.data.branchId,
      smallBranchesId: this.data.cloudBranchId,
      userId: wx.getStorageSync("userId")
    }).then(res => {
      if (res.data.result == 200) {
        if (res.data.data) {
          this.setData({
            shoppingGoods:res.data.data
          });
          this.updatagood(res.data.data);
        }else{
          this.setData({
            shoppingGoods:[]
          });
          this.updatagood([]);
        }
      }else{
        this.updatagood([]);
      }
    }).catch(()=>{
      this.updatagood([]);
    })
  },
  //购物车数量和cartcode赋值给对应列表数据
  updatagood(data){
    //更好甄选-指尖电商
    if(this.data.fingerMallList.length>0){
      let fingerMallCart = data.cartMallEffectiveList;
      let newdata = this.data.fingerMallList.map(item => {
        item.mallGoodsInfos.forEach(gs => {
          gs.goodsNum = 0;
          if(fingerMallCart&&fingerMallCart.length>0){
            fingerMallCart.forEach(re => {
              if (gs.skuCode == re.goodsCode) {
                gs.goodsNum = re.goodsNum;
                gs.cartCode = re.cartCode;   //商品减少为0(相当于删除)需要cartcode
              }
            })
          }
        })
        return item
      })
      this.setData({
        fingerMallList: newdata
      })
    }
    //饮用水
    if(this.data.waterList.length>0){
      let waterCart = data.cartWaterEffectiveList;
      let newdata = this.data.waterList.map(item => {
        item.goodsNum=0;
        if(waterCart&&waterCart.length>0){
          waterCart.forEach(re => {
            if (item.skuCode == re.goodsCode) {
              item.goodsNum = re.goodsNum;
              item.cartCode = re.cartCode;   //商品减少为0(相当于删除)需要cartcode
            }
          })
        }
        return item
      })
      this.setData({
        waterList: newdata
      })
    }
    this.submit=false;//防止重复点击
  },
  //更好甄选（指尖电商）添加购物车授权
  addCarClick(e){
    let item= e.currentTarget.dataset.goodsitem;
    this.setData({
      fingerMallItem:item,
      showLogin: true,
      path: "fingerMallAddShop"
    });
  },
  //购物车数量的修改加或者减或者输入
  updateCar(e){
    let inpValue=e.detail.value;//购物车输入的数量
    let type =e.currentTarget.dataset.type;//类型 minus-购物车减少 add-购物车添加 input-购物车输入
    let goods =e.currentTarget.dataset.goods;//商品信息
    this.setData({
      goodsCarItem:goods,
      goodsCarType:type,
      goodsCarInput:type=="input"?inpValue:0,
      showLogin: true,
      path: "updateCar"
    });
  },
  //购物车数量的修改加或者减或者输入的正常请求函数
  updateCarAction(){
    if(this.submit){
      return;
    }
    this.submit=true;
    wx.showLoading({
      title: '加载中',
    })
    let { skuCode, activityId, goodsNum, goodsResource, cartCode, skuId, branchesId} = this.data.goodsCarItem;
    let shoppingNum=0;
    if(this.data.goodsCarType=="add"){//加购物车
      shoppingNum = ++goodsNum;
    }else
    if(this.data.goodsCarType=="minus"){//减购物车
      shoppingNum = --goodsNum;
    }else
    if(this.data.goodsCarType=="input"){//购物车输入
      shoppingNum = this.data.goodsCarInput;
    }
    if(shoppingNum>=1){
      service.addgoodnum({
        branchesId: branchesId,
        activityId: activityId,
        goodsCode: skuCode,
        goodsNum: shoppingNum,
        goodsResource: goodsResource,  //来源拼团5 10为指尖商城 水管家20
        userId: wx.getStorageSync("userId"),
        skuId: skuId
      }).then(res => {
        wx.hideLoading();
        if (res.data.result == 200) {
          this.getshoppingGoods();//更新购物车列表
          if(this.data.goodsCarType=="add"){//加购物车
            ++app.globalData.shoppingNum;
          }else
          if(this.data.goodsCarType=="minus"){//减购物车
            --app.globalData.shoppingNum;
          }else
          if(this.data.goodsCarType=="input"){//购物车输入
            app.globalData.shoppingNum = app.globalData.shoppingNum+(shoppingNum-goodsNum);
          }
          this.updateBuyCarNum(app.globalData.shoppingNum);
        }else{
          this.updatagood(this.data.shoppingGoods);//更新商品列表的购物车信息
          this.submit = false;//防止重复点击
          wx.showToast({
            title: res.data.message,
            icon:'none'
          })
        }
      }).catch(()=>{
        this.updatagood(this.data.shoppingGoods);//更新商品列表的购物车信息
        this.submit = false;//防止重复点击
      })
    }else{
      service.delshoppinggoods({
        cartCodes: [cartCode]
      }).then(res => {
        wx.hideLoading();
        if (res.data.result == 200) {
          this.getshoppingGoods();//更新购物车列表
          if(this.data.goodsCarType=="minus"){//减购物车
            --app.globalData.shoppingNum;
          }else
          if(this.data.goodsCarType=="input"){//购物车输入
            app.globalData.shoppingNum = app.globalData.shoppingNum+(shoppingNum-goodsNum);
          }
          this.updateBuyCarNum(app.globalData.shoppingNum);
        }else{
          this.updatagood(this.data.shoppingGoods);//更新商品列表的购物车信息
          this.submit = false;//防止重复点击
          wx.showToast({
            title: res.data.message,
            icon:'none'
          })
        }
      }).catch(()=>{
        this.updatagood(this.data.shoppingGoods);//更新商品列表的购物车信息
        this.submit = false;//防止重复点击
      })
    }
  },
  // 更新tabBar购物车数量
  updateBuyCarNum(sum){
    if (sum > 0) {
      wx.setTabBarBadge({
        index: 1,
        text: sum + ''
      })
      if (sum > 99) {
        wx.setTabBarBadge({
          index: 1,
          text: '99+'
        })
      }
    }else{
      wx.removeTabBarBadge({
        index: 1,
        text:''
      })
    }
  },
  //input框冒泡
  stopinp(){},
  //关闭系统卡券弹框
  closeBtn(){
    this.setData({
      maskShow:false
    })
  },
  //系统发放卡券
  queryCardListBySelectSystem(){
    service.queryCardListBySelectSystem({
      userId:wx.getStorageSync('userId'),
      branchId:this.data.cloudBranchId,
      useStatus:10,
      source:'wx',
    }).then(res=>{
      if(res.data.result==200){
        let data=res.data.data;
        if(data){
          data.forEach(item=>{
            item.startTime =until.formitTime(item.startTime,20);
            item.endTime=until.formitTime(item.endTime,20);
            item.cardAmount=floatObj.divide(item.cardAmount,100);
            item.fullAmountPrice=JSON.parse(item.fullAmountPrice);
            item.useThreshold = item.useThreshold?floatObj.divide(item.useThreshold,100):'-'
            item.mecName=item.mecName;
            item.discount = item.cardType==30?floatObj.divide(item.discount,100):floatObj.divide(item.discount,10)
          });
          if(data.length>0){
            this.setData({
              maskShow:true,
              coupondata:data,
              mecName:data[0].mecName
            })
          }
        }
      }
    })
  },
  //弹出弹层 底部禁止滑动
  catchtouchmove(){
    return;
  },
  //点击置顶
  gotoTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    })
    this.setData({anchorPointerType:1})
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
    wx.getNetworkType({//监听网络状态
      success (res) {
        const networkType = res.networkType;
        if(networkType=="none"){
          wx.redirectTo({
            url:"../../pages/networkTimeout/networkTimeout"
          })
        }
      }
    });
    //网络变化
    wx.onNetworkStatusChange((res)=>{
      if(!res.isConnected){
        wx.redirectTo({
          url:"../../pages/networkTimeout/networkTimeout"
        })
      }
    });
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showLoading({title:"加载中..."});
    clearInterval(discountTimer);
    let systemInfo = wx.getSystemInfoSync(); //获取设备信息
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点
    this.setData({
      branchId:presentAddress?presentAddress.siteId:'',
      cloudBranchId:currentCloudShop?currentCloudShop.siteId:'',
      systemInfo,
      selectAddress:'',
    },()=>{
      this.getBannerConfig();      //获取banner配置
      if(this.data.cloudBranchId){//如果有云店站点
        if(wx.getStorageSync('userId')){
          this.queryCardListBySelectSystem();//系统卡券弹框
        }
      }
    });
    if(wx.getStorageSync("isaddress")) {//如果有选择收货地址
      let itemData = wx.getStorageSync("isaddress");
      this.setData({
        storageAddress:itemData,
        selectAddress:itemData.provinceName+itemData.cityName+itemData.districtName+itemData.address
      });
    }else if(wx.getStorageSync("isdefault")){//如果有默认收货地址
      let itemData = wx.getStorageSync("isdefault");
      this.setData({
        storageAddress:itemData,
        selectAddress:itemData.provinceName+itemData.cityName+itemData.districtName+itemData.address
      });
    }
    if(wx.getStorageSync('userId')){//已登录
      this.getAddreddList(); //获取默认地址  并且会获取饮用水列表 如果没有选择云店默认查询最近的云店地址
      this.queryNoticeByUserId();//查询用户通知提示
      this.queryColleBranches();//查询用户收藏门店列表
      app.shoppingNum();//查询购物车数量
    }else{//未登录
      this.getUserLocation();      //获取当前位置 并且会获取饮用水列表 如果没有选择云店默认查询最近的云店地址
    }
    this.queryMallGoodsList();   //更好甄选（指尖电商）商品列表
    this.getFingerMallDiscountList(); //获取更好甄选限时折扣
    setTimeout(()=>{
      wx.hideLoading();
    },2000)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(discountTimer);
    this.setData({
      notice:{
        takeExpress:0,
        sendExpress:0,
        payWait:0,
        receive:0,
      },//通知提示
    })
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
    let t=this;
    wx.showLoading({title:"加载中..."});
    clearInterval(discountTimer);
    let systemInfo = wx.getSystemInfoSync(); //获取设备信息
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点
    this.setData({
      branchId:presentAddress?presentAddress.siteId:'',
      cloudBranchId:currentCloudShop?currentCloudShop.siteId:'',
      systemInfo,
      selectAddress:'',
    },()=>{
      this.getBannerConfig();//获取banner配置
      if(this.data.cloudBranchId){//如果有云店站点
        if(wx.getStorageSync('userId')){
          this.queryCardListBySelectSystem();//系统卡券弹框
        }
      }
    });
    if(wx.getStorageSync("isaddress")) {//如果有选择收货地址
      let itemData = wx.getStorageSync("isaddress");
      this.setData({
        storageAddress:itemData,
        selectAddress:itemData.provinceName+itemData.cityName+itemData.districtName+itemData.address
      });
    }else if(wx.getStorageSync("isdefault")){//如果有默认收货地址
      let itemData = wx.getStorageSync("isdefault");
      this.setData({
        storageAddress:itemData,
        selectAddress:itemData.provinceName+itemData.cityName+itemData.districtName+itemData.address
      });
    }
    if(wx.getStorageSync('userId')){
      this.getAddreddList(); //获取默认地址  并且会获取饮用水列表 如果没有选择云店默认查询最近的云店地址
      this.queryNoticeByUserId();//查询用户通知提示
      this.queryColleBranches();//查询用户收藏门店列表
      app.shoppingNum();//查询购物车数量
    }else{
      this.getUserLocation(); //获取当前位置 并且会获取饮用水列表 如果没有选择云店默认查询最近的云店地址
    }
    this.queryMallGoodsList();   //更好甄选（指尖电商）商品列表
    this.getFingerMallDiscountList();     //更好甄选限时折扣
    setTimeout(()=>{
      wx.hideLoading();
      t.stopPullDownRefresh();
    },1000);
  },
  // 停止刷新方法
  stopPullDownRefresh() {
    wx.stopPullDownRefresh({
      complete(res) { }
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

  },
  //页面滚动
  onPageScroll(e) {
    if (e.scrollTop > 500) {
      this.setData({
        toTopshow: true
      })
    } else {
      this.setData({
        toTopshow: false
      })
    }
  },
  //rpx转px
  rpxshift(rpx){
    let mypx = rpx / 750 * this.data.systemInfo.windowWidth
    return mypx
  },
  //限时折扣轮播
  move: function (lr,d) {
    let datas = this.data.fingerMallDiscountList;
    for (let i = 0; i < datas.length; i++) {
      let data = datas[i];
      let animation
      if(lr==1||d==1){
        animation= wx.createAnimation({
          duration: 0
        });
      }else{
        animation = wx.createAnimation({
          duration: 350
        });
      }
      animation.translateX(data.left).scale(data.scale).step();
      this.setData({
        ["fingerMallDiscountList[" + i + "].animation"]: animation.export(),
        ["fingerMallDiscountList[" + i + "].zIndex"]: data.zIndex,
      })

    }
  },
  left: function () {
    let last = this.data.fingerMallDiscountList.pop(); //获取数组的最后一个
    this.data.fingerMallDiscountList.unshift(last); //放到数组的第一个
    this.move(0,0);
  },
  right: function () {
    let first = this.data.fingerMallDiscountList.shift(); //获取数组的第一个
    this.data.fingerMallDiscountList.push(first); //放到数组的最后一个位置
    this.move(1,0);
  },
  //手指触发开始移动
  moveStart: function (e) {
    clearInterval(discountTimer)
    let startX = e.changedTouches[0].pageX;
    this.setData({
      startX
    });
  },
  //手指触摸后移动完成触发事件
  moveItem: function (e) {
    clearInterval(discountTimer)
    let endX = e.changedTouches[0].pageX;
    this.setData({
      endX: endX
    });
    //计算手指触摸偏移距离
    let moveX = this.data.startX - this.data.endX;
    if (moveX > 20) {
      this.left();

    } //向左移动
    if (moveX < -20) {
      this.right();
    }
    discountTimer = setInterval(() => {  //定时器，两秒执行一次
      this.left()
    }, 2000);
  },
})