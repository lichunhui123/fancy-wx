const app = getApp();
const service = require('../../service/index.js');
const QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
let discountTimer=null;//限时折扣定时器
Page({
  /**
   * 页面的初始数据
   */
  data: {
    path:"",//需要跳转的目标页或者组件
    imgUrl: app.globalData.imgUrl,
    swiperNum: 0,//第几张轮播图
    entranceNum:0,//入口第几屏
    notice:{
      takeExpress:0,
      sendExpress:0,
      payWait:0,
      receive:0,
    },//通知提示
    bannerConfig:[
      {
        headBannerPic:"/mallImages/20200717/EFhypsFC7WPrFz3TGyrwz6twQXETXw32.png",//banner图片地址
      },
      {
        headBannerPic:"/mallImages/20200717/Zit5FAN6DdMkSXTxrym5ScXF83Ry73ye.png",//banner图片地址
      },
      {
        headBannerPic:"/mallImages/20200717/MCpWGAkCbxtdbQYjTXb3bz5Jba55XZQj.png",//banner图片地址
      },
      {
        headBannerPic:"/mallImages/20200717/MXREk5GbSSSSTeE4bXX2awTMxkZ2m5py.png",//banner图片地址
      }
    ],//banner配置
    cloudStore:[],//指尖云店-精选
    fingerMall:[],//指尖电商
    branchId: '',  //拼团站点id
    cloudBranchId:'', //云店站点id
    crownShow:false, //会员码弹框
    receiptBarCode:"",//会员码
    selectAddress:"北京",  //选择的收货地址
    hasLocation:false, //是否有定位
    shoppnum:0,   //购物车数量
    startX: 0, //开始移动时距离左
    endX: 0, //结束移动时距离左
    datas: [], //限时折扣商品列表
    systemInfo:null, //设备信息
    city:'', //选择城市/定位城市
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
        if(!that.data.selectAddress){//如果没有选择收货地址 获取当前定位地址
          that.getLocal(longitude, latitude);
        }
        if(!that.data.branchId||!that.data.cloudBranchId){
          that.getLocalT(longitude, latitude); //获取最近的站点
        }
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
        let city = wx.getStorageSync("city") ? wx.getStorageSync("city") : res.result.ad_info.city;
        if (wx.getStorageSync("setAddress")) {
          city = wx.getStorageSync("setAddress").cityName;
        }
        wx.setStorageSync('city', city);
        this.setData({
          city:city,
          selectAddress: res.result.address
        });
        //查询首页云店商品
        let address={
          cityName:city,
          longitude: long,
          latitude: lati
        };
        this.queryHomePagSmallPro(address);
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
        if(!this.data.branchesId){
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
                },()=>{
                  this.getBannerConfig();      //获取banner配置
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
                wx.setStorageSync('currentCloudShop',data[0]);
                //设置最近的站点ID
                this.setData({
                  cloudBranchId:data[0].siteId
                });
              }
            }
          })
        }
      },
    });
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
                  selectAddress:itemData.provinceName+itemData.cityName+itemData.districtName+itemData.address
                });
              }else{
                this.setData({
                  selectAddress:item.provinceName+item.cityName+item.districtName+item.address
                });
              }
            }
          })
        }
      }
    })
  },
  //banner swiper轮播事件
  swiperChange(e){
    const num = e.detail.current;
    this.setData({
      swiperNum: num
    })
  },
  //入口swiper轮播事件
  entranceChange(e){
    const num = e.detail.current;
    this.setData({
      entranceNum: num
    })
  },
  //获取banner配置
  getBannerConfig(){
    service.getBannerConfig({
      storeId: this.data.branchId //店铺Id
    }).then((res)=>{
      let banner = res.data.data;
      if(banner&&banner.length>0){
        this.setData({
          bannerConfig:banner
        })
      }else{
        this.setData({
          bannerConfig:[
            {
              headBannerPic:"/mallImages/20200717/EFhypsFC7WPrFz3TGyrwz6twQXETXw32.png",//banner图片地址
            },
            {
              headBannerPic:"/mallImages/20200717/Zit5FAN6DdMkSXTxrym5ScXF83Ry73ye.png",//banner图片地址
            },
            {
              headBannerPic:"/mallImages/20200717/MCpWGAkCbxtdbQYjTXb3bz5Jba55XZQj.png",//banner图片地址
            },
            {
              headBannerPic:"/mallImages/20200717/MXREk5GbSSSSTeE4bXX2awTMxkZ2m5py.png",//banner图片地址
            }
          ]
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
      wx.navigateTo({
        url:`/pages/bannerActivity/index?activityCode=${item.activityCode}&index=${index}`
      })
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
  //取快递点击
  takeSomething(){
    this.setData({
      showLogin: true,
      path: "scanPickUp"
    });
  },
  //优惠券点击
  discountTicket(){
    this.setData({
      showLogin:true,
      path:"discount"
    });
  },
  //to指尖拼团
  goGroupPage(){
    this.setData({
      showLogin:true,
      path:"group"
    });
  },
  //to云店
  goSmallShopPage(){
    this.setData({
      showLogin:true,
      path:"cloudStore"
    });
  },
  //to更好甄选（指尖商城）
  goFingerMall(){
    this.setData({
      showLogin:true,
      path:"fingerMall"
    });
  },
  //to扫码自助购
  goSelfHelpPurchasing(){
    this.setData({
      showLogin:true,
      path:"selfHelpPurchasing"
    });
  },
  //to水管家
  goWater(){
    this.setData({
      showLogin:true,
      path:"water"
    });
  },
  //to我的快递
  goExpress(){
    this.setData({
      showLogin:true,
      path:"express"
    });
  },
  //查询指尖云店-指尖精选商品
  queryHomePagSmallPro(address){
    let long = address.longitude;
    let lati = address.latitude;
    service.queryHomePagSmallPro({
      cityName:address.cityName,
      longitude:long,//经度
      latitude:lati,//纬度
      tudeType:"1005"
    }).then(res=>{
      if(res.data.result==200){
        let data = res.data.data;
        let goods = [];
        if(data&&data.length>0){
          data.forEach(val=>{
            val.showGoodsPic = val.goodsPic?val.goodsPic.split(",")[0]:"";
            val.cartNum = 0;
            goods.push(val);
          })
        }
        this.setData({
          cloudStore:goods
        },()=>{
          if(wx.getStorageSync('userId')){
            this.getshoppingGoods();
          }
        })
      }
    })
  },
  //指尖云店商品详情
  cloudGoodsDetailClick(e){
    let { goodsCode}=e.currentTarget.dataset.itdetail;
    wx.navigateTo({
      url: '/pages/cloudStoreDetail/index?storeGoodsId=' + goodsCode,
    })
  },
  //指尖云店商品添加购物车
  cloudGoodsAddCar(e){
    let item= e.currentTarget.dataset.goodsitem;
    this.setData({
      cloudGoodsItem:item,
      showLogin: true,
      path: "cloudGoodsAddCar"
    });
  },
  //指尖云店商品加入购物车商品
  cloudGoodsAddCardata() {
    let { goodsCode,activityCode,branchesId,resource } = this.data.cloudGoodsItem;
    let shoppingNum='';
    let newGoodsData=this.data.cloudStore.map(item=>{
      item.cartNum++;
      shoppingNum=item.cartNum
      return item
    });
    this.setData({
      cloudStore:newGoodsData
    });
    service.addgoodnum({
      activityId:activityCode,
      branchesId: branchesId,
      userId: wx.getStorageSync("userId"),
      goodsResource: resource,  //来源拼团5 10为指尖商城 水管家20 指尖云店40
      goodsCode:goodsCode,
      goodsNum: shoppingNum
    }).then(res => {
      if (res.data.result == 200) {
        wx.showToast({
          title: '添加成功！',
        });
        app.shoppingNum();
        this.getshoppingGoods()
      }else{
        wx.showToast({
          title: res.data.message,
          icon:'none'
        })
      }
    })
  },
  //更好甄选（限时折扣）进去逛逛
  limitgoGroup(){
    wx.navigateTo({
      url: '/pages/group/index?type=10',
    })
  },
  //更好甄选（限时折扣）
  getTimeLimitData(){
    service.queryActivityGoodsList({
      userId:wx.getStorageSync("userId")?wx.getStorageSync("userId"):null,
      pageSize: 10,
      pageNum:1,
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
            datas: newdata
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
  //rpx转px
  rpxshift(rpx){
    let mypx = rpx / 750 * this.data.systemInfo.windowWidth
    return mypx
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
  //更好甄选（限时折扣）点击进入
  limitClick(){
    this.setData({
      showLogin: true,
      path: "limitGroup"
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
          });
        }
        this.setData({
          fingerMall:mallGoodsList
        });
      }
    })
  },
  //更好甄选（指尖云店）商品详情
  fingerMallGoodsDetailClick(e) {
    let { skuCode } = e.currentTarget.dataset.itdetail;
    wx.navigateTo({
      url: '/pages/fingerMallGoodDetail/index?skuCode=' + skuCode,
    })
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
  //更好甄选（指尖电商）商品加入购物车商品
  getshoppingdata() {
    let { skuCode,activityId } = this.data.fingerMallItem;
    let shoppingNum='';
    let newGoodsData=this.data.fingerMall.map(da=>{
      da.mallGoodsInfos.map(va=>{
        if(va.skuCode==skuCode){
          va.cartNum++;
          shoppingNum=va.cartNum
        }
      });
      return da
    });
    this.setData({
      fingerMall:newGoodsData
    });
    service.addgoodnum({
      activityId:activityId,
      goodsCode: skuCode,
      goodsNum: shoppingNum,
      goodsResource: 10,  //来源拼团5 10为指尖商城 水管家20
      userId: wx.getStorageSync("userId")
    }).then(res => {
      if (res.data.result == 200) {
        wx.showToast({
          title: '添加成功！',
        });
        app.shoppingNum();
        this.getshoppingGoods()
      }else{
        wx.showToast({
          title: res.data.message,
          icon:'none'
        })
      }
    })
  },
  //查询购物车商品
  getshoppingGoods(){
    service.shoppinggoods({
      branchesId: this.data.branchId,
      smallBranchesId: this.data.cloudBranchId,
      userId: wx.getStorageSync("userId")
    }).then(res => {
      if (res.data.result == 200) {
        if (res.data.data) {
          this.updatagood(res.data.data);
        }
      }
    })
  },
  //购物车数量和cartcode赋值给对应列表数据------4
  updatagood(data){
    //指尖云店
    if(this.data.cloudStore.length>0){
      let cartSmallCart = data.cartSmallEffectiveList;
      if(cartSmallCart.length>0){
        let newdata = this.data.cloudStore.map(item=>{
          cartSmallCart.forEach(re=>{
            if(item.goodsCode == re.goodsCode){
              item.cartNum = re.goodsNum;
            }
          })
          return item;
        })
        this.setData({
          cloudStore: newdata
        })
      }
    }
    //更好甄选-指尖电商
    if(this.data.fingerMall.length>0){
      let fingerMallCart = data.cartMallEffectiveList;
      if(fingerMallCart.length>0){
        let newdata = this.data.fingerMall.map(item => {
          item.mallGoodsInfos.forEach(gs => {
            fingerMallCart.forEach(re => {
              if (gs.skuCode == re.goodsCode) {
                gs.cartNum = re.goodsNum
              }
            })
          })
          return item
        })
        this.setData({
          fingerMall: newdata
        })
      }
    }
  },
  //判断登陆成功
  loginSuccess(){
    this.setData({showLogin:false});
    this.getAddreddList()
    if(this.data.path=="homeAddress"){
      wx.navigateTo({
        url: '/pages/homeAddress/index',
      })
    }
    //取件
    if(this.data.path=="scanPickUp"){
      wx.navigateTo({
        url:"/pages/scanPickUp/index"
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
    //跳转优惠券
    if(this.data.path=="discount"){
      wx.navigateTo({
        url: '/pages/homeDiscount/index',
      })
    }
    //跳转指尖拼团
    if(this.data.path=="group"){
      wx.navigateTo({
        url: '/pages/group/index?type=20',
      })
    }
    //跳转云店
    if(this.data.path=="cloudStore"){
      wx.navigateTo({
        url: '/pages/cloudStore/index',
      })
    }
    //更好甄选（指尖商城）
    if(this.data.path=="fingerMall"){
      wx.navigateTo({
        url: '/pages/fingerMall/index',
      })
    }
    //跳转自助购页
    if(this.data.path=="selfHelpPurchasing"){
      wx.navigateTo({
        url: '/pages/selfHelpPurchasing/index',
      })
    }
    //跳转水管家
    if(this.data.path=="water"){
      wx.navigateTo({
        url: '/pages/water/index',
      })
    }
    //跳转发快递页
    if(this.data.path=="express"){
      wx.removeStorageSync("expressInfo");//先清除一下缓存
      wx.navigateTo({
        url: '/pages/expressNotTake/index',
      })
    }
    //跳转到附近站点页
    if(this.data.path=="nearbyStores"){
      wx.navigateTo({
        url: '/pages/nearbyStores/index',
      })
    }
    //指尖云店添加购物车
    if(this.data.path == "cloudGoodsAddCar"){
      this.cloudGoodsAddCardata();
    }
    //更好甄选（指尖商城）添加购物车
    if (this.data.path == "fingerMallAddShop") {
      this.getshoppingdata()
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
    clearInterval(discountTimer);
    let systemInfo = wx.getSystemInfoSync(); //获取设备信息
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点
    this.setData({
      branchId:presentAddress?presentAddress.siteId:'',
      cloudBranchId:currentCloudShop?currentCloudShop.siteId:'',
      datas:[],
      systemInfo,
      selectAddress:'',
    },()=>{
      if(this.data.branchId){//如果有选择网点
        this.getBannerConfig();      //获取banner配置
      }
    });
    if(wx.getStorageSync("isaddress")) {//如果有选择收货地址
      let itemData = wx.getStorageSync("isaddress");
      this.setData({
        selectAddress:itemData.provinceName+itemData.cityName+itemData.districtName+itemData.address
      });
      this.queryHomePagSmallPro(itemData);
    }else if(wx.getStorageSync("isdefault")){//如果有默认收货地址
      let itemData = wx.getStorageSync("isdefault");
      this.setData({
        selectAddress:itemData.provinceName+itemData.cityName+itemData.districtName+itemData.address
      });
      this.queryHomePagSmallPro(itemData);
    }
    if(wx.getStorageSync('userId')){
      this.queryNoticeByUserId();//查询用户通知提示
      app.shoppingNum()
    }
    this.getTimeLimitData();     //限时折扣
    this.getUserLocation();      //获取当前位置
    this.queryMallGoodsList();   //指尖电商商品列表
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
    this.setData({
      datas: [],
    });
    clearInterval(discountTimer);
    wx.showLoading({title:"加载中..."});
    if(wx.getStorageSync("isaddress")) {//如果有选择收货地址
      let itemData = wx.getStorageSync("isaddress");
      this.queryHomePagSmallPro(itemData);
    }else if(wx.getStorageSync("isdefault")){//如果有默认收货地址
      let itemData = wx.getStorageSync("isdefault");
      this.queryHomePagSmallPro(itemData);
    }
    if(wx.getStorageSync('userId')){
      this.queryNoticeByUserId();//查询用户通知提示
      app.shoppingNum()
    }
    this.getTimeLimitData();     //限时折扣
    this.getUserLocation();      //附件站点
    this.queryMallGoodsList();   //跟好甄选（指尖电商）商品列表
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
  /**
   * 限时折扣轮播
   */
  move: function (lr,d) {
    let datas = this.data.datas;
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
        ["datas[" + i + "].animation"]: animation.export(),
        ["datas[" + i + "].zIndex"]: data.zIndex,
      })

    }
  },
  left: function () {
    let last = this.data.datas.pop(); //获取数组的最后一个
    this.data.datas.unshift(last); //放到数组的第一个
    this.move(0,0);
  },
  right: function () {
    let first = this.data.datas.shift(); //获取数组的第一个
    this.data.datas.push(first); //放到数组的最后一个位置
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