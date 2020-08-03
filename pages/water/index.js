// pages/water/index.js
const service = require('../../service/index.js');
import floatObj from '../../utils/floatObj.js'
import {getNum} from "../../utils/util";
const app = getApp();
const QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    srcolloff:false,    //购物车弹层
    pageNum: 1,        //当前页数
    pageSize: 10,     //每页数量
    imgUrl: app.globalData.imgUrl,
    goodsList:[],       //水商品列表
    goodMealdata:{},   //商品套餐
    mealIndex:0,      //套餐默认第一个选中
    mealnum:1,   //套餐数量
    shoppingdata: [],   //购物车商品
    shoppingdata1: [], //购物车过期
    shoppnum: 0,      //购物车数量
    totalValue: '0.00',  //总价
    noData: false,      //无数据
    waterMask:false,   //填写地址
    buyMeal:false,    //购买套餐
    iphone: false,   //苹果适配
    currentSite:'', //当前站点
    shoppingAddress:'',   //地址
    addressShow:false,   //收货地址显示
    shopbottom:false,   //底部区域
    branchId:'',       //拼团站点id
    cloudBranchId:'',   //云店站点id
    lastnum:0,   //已加入购物车的数量
    cityName:'' ,  //城市名称
    longitude:'',  //经度
    latitude:'',   //纬度
    reduceNum:0,  //已减金额
    fullMax:false,  //满足最大的满减设置
    preOrNext:{},  //相差金额和下次减金额
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
        let address = res.result.address;
        let cityName=res.result.ad_info.city
				if (!this.data.shoppingAddress) {
        this.setData({
          shoppingAddress: address,
          cityName,
          longitude:long,
          latitude:lati
        },()=>{
          this.getWaterlist()
        })
				}
      },
      fail: function (res) {
      }
    });
  },
  //to购物车
  shoppingClick(){
    wx.reLaunch({
      url: '/pages/shoppingCar/index',
    })
  },
  //套餐体系点击        
  mealxClick(e){
    let mealxind = e.currentTarget.dataset.mealxind
    this.setData({
      mealIndex:mealxind,
      mealnum:1
    },()=>{
      this.updatanum()
    })
  },
  //套餐添加
  mealAdd(){
    this.setData({
      mealnum: ++this.data.mealnum
    })
  },
  //套餐减少
  mealDel() {
    if(this.data.mealnum>1){
      this.setData({
        mealnum: --this.data.mealnum
      })
    }
  },
  //套餐input输入
  mealInp(e){
    let inpValue = e.detail.value
    this.setData({
      mealnum:inpValue
    })
  },
  //套餐加入购物车
  addShopping(){
    if (!wx.getStorageSync('isaddress')) {
      this.setData({
        waterMask: true
      })
      return
    }
    this.setData({
      buyMeal: false,
    })
    let goodMealdata = this.data.goodMealdata  //所有套系
    console.log(goodMealdata,this.data.mealIndex)
    let currentData = goodMealdata.seriesList[this.data.mealIndex]  //当前点击的套系
    service.addgoodnum({
      branchesId: currentData.branchesId,
      userId: wx.getStorageSync('userId'),
      goodsResource: 30,  //来源套餐
      goodsCode: currentData.seriesSkuCode,
      goodsNum: this.data.lastnum*1+ this.data.mealnum*1,
      skuId: currentData.id,
    }).then(res => {
      if (res.data.result == 200) {
        this.shoppingnum()
        this.getshoppingdata()
        wx.showToast({
          title: '成功加入购物车~',
          icon: 'none'
        })
        this.setData({
          mealIndex: 0,   //重置为0
          mealnum: 1,  //重置为1
        })
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //购买套餐
  buyMeal(e) {
    let eldata = e.currentTarget.dataset.eldata
    eldata.seriesList.forEach(item => {
      item.price = getNum(floatObj.divide(item.price,100))
      item.setMealImg=item.setMealImg.split(',')[0]
    })
    this.setData({
      buyMeal: true,
      goodMealdata: eldata,
      mealIndex: 0,   //每次购买套餐将下标重置为0
      mealnum: 1,  //每次购买套餐套餐数量重置为1
    },()=>{
      this.updatanum()
    })
  },
  //更新套餐商品数量
  updatanum() {
    service.shoppingnum({
      branchesId:this.data.branchId,
      smallBranchesId: this.data.cloudBranchId,
      userId: wx.getStorageSync('userId'),
      goodsResource :30,
      goodsCode: this.data.goodMealdata.seriesList[this.data.mealIndex].seriesSkuCode,
    }).then(res => {
      if (res.data.result == 200) {
        let sum = res.data.data.goodsNumber;
        this.setData({
          lastnum: sum,
        });
      }
    })
  },
  //取消购买套餐
  cancelMeal() {
    this.setData({
      buyMeal: false
    })
  },
  //水管家商品列表   
  getWaterlist(){
    wx.showLoading({
      title: '加载中',
    })
    service.getwaterlist({
      longitude:this.data.longitude,  //经度
      latitude:this.data.latitude,   //纬度
      userId: wx.getStorageSync('userId'),
    }).then(res=>{
      wx.hideLoading()
      let dataList=res.data.data
      if(res.data.result==200){
        wx.stopPullDownRefresh()
        if(dataList){
          dataList.forEach(item=>{
            item.goodsPhotos = item.goodsPhotos.split(',')[0]
            item.sellPrice = getNum(floatObj.divide(item.sellPrice,100))
            item.goodnum = 0
            item.carCode = ''
          })
          this.setData({
            noData: false,
            goodsList: dataList
          },()=>{
            if (!wx.getStorageSync('isaddress')) {
              return
            }
            this.getshoppingdata()
          })
        }else{
          this.setData({
            noData: true,
            goodsList: []
          })
        }
      }else{
        wx.stopPullDownRefresh()
        this.setData({
          noData: true,
          goodsList: []
        })
      }
    }).catch(() => { 
      wx.stopPullDownRefresh()
      this.setData({
        noData: true,
        goodsList: []
      }) 
    }) 
  },
  
  //购物袋点击
  buydaiClick() {
    this.setData({
      srcolloff: !this.data.srcolloff
    })
  },
  //立即购买
  buyNow() {
    if (!wx.getStorageSync('isaddress')) {
      this.setData({
        waterMask: true
      })
      return
    }
    wx.switchTab({
      url: '/pages/shoppingCar/index',
    })
  },
  //空白处点击收回购物车
  showoff() {
    this.setData({
      srcolloff: false
    })
  },
  //添加地址
  chooseAddress(){
    wx.navigateTo({
      url: '/pages/waterAddress/index',
    })
  },
  //水详情跳转 
  waterItemClick(e){
    if (!wx.getStorageSync('isaddress')) {
      this.setData({
        waterMask: true
      })
      return
    }
    let itdetail = e.currentTarget.dataset.itdetail;
    let arr={}
    arr.packing = itdetail.packing
    arr.sellNum = itdetail.sellNum
    arr.skuCode=itdetail.skuCode
    arr.waterStoreId = itdetail.waterStoreId
    arr.branchesId=itdetail.branchesId
    arr.id = itdetail.id
    arr.goodsSpec = itdetail.goodsSpec
    arr.distance = itdetail.distance
    arr.address = itdetail.address
    let newitdetail=JSON.stringify(arr)
    wx.navigateTo({
      url: '/pages/waterGoodDetail/index?itdetail=' + newitdetail+'&type=20',
    })
  },
  //套餐详情跳转
  mealDetail(){
    if (!wx.getStorageSync('isaddress')) {
      this.setData({
        waterMask: true
      })
      return
    }
    let id = this.data.goodMealdata.seriesList[this.data.mealIndex].id
    let branchesId = this.data.goodMealdata.seriesList[this.data.mealIndex].branchesId
    let waterStoreId = this.data.goodMealdata.waterStoreId
    let mealarr={}
    mealarr.id=id
    mealarr.waterStoreId = waterStoreId
    mealarr.branchesId = branchesId
    let newmealarr = JSON.stringify(mealarr)
      wx.navigateTo({
        url: '/pages/waterGoodDetail/index?itdetail=' + newmealarr + '&type=30',
      })
  },
  stopinp() {
    //input框冒泡
  },
  //填写地址取消
  maskcal(){
    this.setData({
      waterMask:false
    })
  },
  //商品添加
  goodAdd(e) {
    if (!wx.getStorageSync('isaddress')){
      this.setData({
        waterMask:true
      })
      return
    }
    wx.showLoading({
      title: '加载中',
    })
    let dooditem = e.currentTarget.dataset.additem
    let { branchesId, skuCode , goodnum ,id} = dooditem
    service.addgoodnum({
      branchesId: branchesId,
      userId: wx.getStorageSync('userId'),
      goodsResource: 20,  //商品来源
      goodsCode: skuCode,
      goodsNum: ++goodnum,
      skuId: id,
    }).then(res => {
      wx.hideLoading()
      if (res.data.result == 200) {
        this.shoppingnum()
        this.getshoppingdata()
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //商品减少
  goodDel(e) {
    if (!wx.getStorageSync('isaddress')) {
      this.setData({
        waterMask: true
      })
      return
    }
    wx.showLoading({
      title: '加载中',
    })
    let dooditem = e.currentTarget.dataset.delitem
    let { branchesId, skuCode, goodnum, id, carCode } = dooditem
    if (goodnum > 1) {
      service.addgoodnum({
        branchesId: branchesId,
        userId: wx.getStorageSync('userId'),
        goodsResource: 20,  //来源拼团5 水管家20
        skuId: id,
        goodsCode: skuCode,
        goodsNum: --goodnum
      }).then(res => {
        wx.hideLoading()
        if (res.data.result == 200) {
          this.shoppingnum()
          this.getshoppingdata()
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    } else {
      wx.showLoading({
        title: '加载中',
      })
      service.delshoppinggoods({
        cartCodes: [carCode]
      }).then(res => {
        wx.hideLoading()
        if (res.data.result == 200) {
          let newdata = this.data.goodsList.map(item => {     //购物车清空需要手动给列表清0
            if (id == item.id ) {
              item.goodnum = 0
            }
            return item
          })
          this.setData({
            goodsList: newdata,
            shoppingdata: [],
            shoppingdata1: [],
            totalValue: '0.00'
          })
          this.shoppingnum()
          this.getshoppingdata()
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    }
  },
  //input框数量输入
  goodInp(e) {
    if (!wx.getStorageSync('isaddress')) {
      this.setData({
        waterMask: true
      })
      return
    }
    let inpValue = e.detail.value
    let dooditem = e.currentTarget.dataset.inpitem
    let { branchesId, skuCode, id, carCode} = dooditem
    if (inpValue >= 1) {
      service.addgoodnum({
        branchesId: branchesId,
        userId: wx.getStorageSync('userId'),
        skuId: id,
        goodsCode: skuCode,
        goodsResource: 20,  //商品来源
        goodsNum: inpValue,
      }).then(res => {
        this.shoppingnum()
        this.getshoppingdata()
        if (res.data.result != 200) {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    } else {
      service.delshoppinggoods({
        cartCodes: [carCode]
      }).then(res => {
        if (res.data.result == 200) {
          let newdata = this.data.goodsList.map(item => {     //购物车清空需要手动给列表清0
            if (id == item.id) {
              item.goodnum = 0
            }
            return item
          })
          this.setData({
            goodsList: newdata,
            shoppingdata: [],
            shoppingdata1: [],
            totalValue: '0.00'
          })
          this.shoppingnum()
          this.getshoppingdata()
        }
      })
    }
  },
  //购物车商品添加
  shopgoodAdd(e) {
    if (!wx.getStorageSync('isaddress')) {
      this.setData({
        waterMask: true
      })
      return
    }
    wx.showLoading({
      title: '加载中',
    })
    let shadditem = e.currentTarget.dataset.shadditem
    let { skuId, goodsCode, goodsResource, goodsNum, branchesId, activityId} = shadditem
    service.addgoodnum({
      branchesId: branchesId,
      userId: wx.getStorageSync('userId'),
      goodsResource: goodsResource,  //商品来源
      skuId: skuId,
      goodsCode: goodsCode,
      goodsNum: ++goodsNum,
      activityId: activityId
    }).then(res => {
      wx.hideLoading()
      if (res.data.result == 200) {
        this.shoppingnum()
        this.getshoppingdata()
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //购物车商品减少
  shopgoodDel(e) {
    if (!wx.getStorageSync('isaddress')) {
      this.setData({
        waterMask: true
      })
      return
    }
    wx.showLoading({
      title: '加载中',
    })
    let shdelitem = e.currentTarget.dataset.shdelitem
    let { skuId, cartCode, goodsCode, goodsResource, goodsNum, branchesId, activityId} = shdelitem
    if (goodsNum > 1) {
      service.addgoodnum({
        branchesId: branchesId,
        userId: wx.getStorageSync('userId'),
        goodsResource: goodsResource,  //来源拼团5 水管家20
        skuId: skuId,
        goodsCode: goodsCode,
        goodsNum: --goodsNum,
        activityId: activityId
      }).then(res => {
        wx.hideLoading()
        if (res.data.result == 200) {
          this.shoppingnum()
          this.getshoppingdata()
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    } else {
      wx.showLoading({
        title: '加载中',
      })
      service.delshoppinggoods({
        cartCodes: [cartCode]
      }).then(res => {
        wx.hideLoading()
        if (res.data.result == 200) {
          let newdata = this.data.goodsList.map(item => {     //购物车清空需要手动给列表清0
            if (skuId == item.id) {
              item.goodnum = 0
            }
            return item
          })
          this.setData({
            goodsList: newdata,
            shoppingdata: [],
            shoppingdata1: [],
            totalValue: '0.00'
          })
          this.shoppingnum()
          this.getshoppingdata()
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    }
  },
  //购物车input数量输入
  shopgoodInp(e) {
    if (!wx.getStorageSync('isaddress')) {
      this.setData({
        waterMask: true
      })
      return
    }
    let inpValue = e.detail.value
    let shinpitem = e.currentTarget.dataset.shinpitem
    let { skuId, cartCode, goodsCode, goodsResource, branchesId, activityId} = shinpitem
    if (inpValue >= 1) {
      service.addgoodnum({
        branchesId: branchesId,
        userId: wx.getStorageSync('userId'),
        goodsResource: goodsResource,  //来源拼团5 水管家20
        skuId: skuId,
        goodsCode: goodsCode,
        goodsNum: inpValue,
        activityId: activityId
      }).then(res => {
        this.shoppingnum()
        this.getshoppingdata()
        if (res.data.result != 200) {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    } else {
      service.delshoppinggoods({
        cartCodes: [cartCode]
      }).then(res => {
        if (res.data.result == 200) {
          let newdata = this.data.goodsList.map(item => {     //购物车清空需要手动给列表清0
            if (skuId == item.id) {
              item.goodnum = 0
            }
            return item
          })
          this.setData({
            goodsList: newdata,
            shoppingdata: [],
            shoppingdata1: [],
            totalValue: '0.00'
          })
          this.shoppingnum()
          this.getshoppingdata()
        }
      })
    }
  },
  //清空购物车
  emptygood() {
    if (this.data.shoppnum > 0) {
      let arr = [];
      this.data.shoppingdata.forEach(item => {  //上架的清空
        arr.push(item.cartCode)
      })
      this.data.shoppingdata1.forEach(el => {  //下架的清空
        arr.push(el.cartCode)
      })
      wx.showModal({
        title: '提示',
        content: '确定清空购物车吗？',
        confirmColor: '#F2922F',
        success: (res) => {
          if (res.confirm) {
            wx.showLoading({
              title: '加载中',
            })
            service.delshoppinggoods({
              cartCodes: arr
            }).then(res => {
              wx.hideLoading()
              if (res.data.result == 200) {
                let newdata = this.data.goodsList.map(item => {     //购物车清空需要手动给列表清0
                  item.goodnum = 0
                  return item
                })
                this.setData({
                  goodsList: newdata,
                  shoppingdata: [],
                  shoppingdata1: [],
                  totalValue: '0.00'
                })
                this.shoppingnum()     //购物车数量
                this.getshoppingdata()   //购物车列表
              } else {
                wx.showToast({
                  title: res.data.message,
                  icon: 'none'
                })
              }
            })
          }
        }
      })
    }
  },
  //购物车商品
  getshoppingdata() {
    service.shoppinggoods({
      branchesId:this.data.branchId,
      smallBranchesId: this.data.cloudBranchId,
      userId: wx.getStorageSync('userId')
    }).then(res => {
      if (res.data.result == 200) {
        if(res.data.data){
          let Adata=res.data.data
          let data = Adata.cartEffectiveList?Adata.cartEffectiveList:[]
          let datax = Adata.cartExpireList?Adata.cartExpireList:[]
          let waterData = Adata.cartWaterEffectiveList?Adata.cartWaterEffectiveList:[]
          let mealData = Adata.cartMealEffectiveList?Adata.cartMealEffectiveList:[]
          let ecData = Adata.cartMallEffectiveList?Adata.cartMallEffectiveList:[]
          let cloudData = Adata.cartSmallEffectiveList?Adata.cartSmallEffectiveList:[]
          let allsum = 0;
          if (data&&data.length > 0) {
            data.forEach(item => {
              if (item.discountStatus == 10) {   //计算总价格
                allsum += (item.discountPrice * 1) * (item.goodsNum * 1)
              }
              if (item.discountStatus != 10) {
                allsum += (item.grouponPrice * 1) * (item.goodsNum * 1)
              }

              item.discountPrice = getNum(item.discountPrice / 100)
              item.friendSellPrice = getNum(item.friendSellPrice / 100)
              item.grouponPrice = getNum(item.grouponPrice / 100)
            })
          }
          if (waterData&&waterData.length > 0) {
            waterData.forEach(wat => {
              allsum += (wat.grouponPrice * 1) * (wat.goodsNum * 1)
              wat.grouponPrice = getNum(wat.grouponPrice / 100)
            })
          }
          if (ecData&&ecData.length > 0) {
            ecData.forEach(ec => {
              if (ec.discountStatus == 10) {   //计算总价格
                allsum += (ec.discountPrice * 1) * (ec.goodsNum * 1)
              }
              if (ec.discountStatus != 10) {
                allsum += (ec.grouponPrice * 1) * (ec.goodsNum * 1)
              }
              ec.discountPrice = getNum(ec.discountPrice / 100)
              ec.friendSellPrice = getNum(ec.friendSellPrice / 100)
              ec.grouponPrice = getNum(ec.grouponPrice / 100)
            })
          }
          if (mealData&&mealData.length > 0) {
            mealData.forEach(meal => {
              allsum += ( meal.grouponPrice * 1) * (meal.goodsNum * 1 )
              meal.grouponPrice = getNum(meal.grouponPrice / 100)
            })
          }
          let combineG = false;//满减活动的组合商品集合
          let manyPriCombine = false;//多件多折组合商品集合
          if (cloudData&&cloudData.length > 0) {
            this.setData({ fullMax:false });
            let fullDecMoneyList = [] //用来提取组合商品满减信息
            let fullDecMoney =0  //组合商品/参与满减商品的总额
            let manyPriManyFoldsList = [];//多件多折设置
            let maxDiscount = 0;//多件多折的最高折扣
            combineG = cloudData.some(clv=> clv.activitySet==2&&clv.type==20 );//是否是满减活动的组合商品
            manyPriCombine = JSON.parse(JSON.stringify(cloudData.filter(clv=> clv.activitySet==2&&clv.type==70 )));//多件多折的组合商品集合
            let manyPriGoodsNum = 0;//多件多折的组合商品总数量
            cloudData.forEach(val => {
              val.nodis=false
              val.discountRatio=val.discountRatio?(val.discountRatio/10):0
              // （云店非活动商品）
              if(val.discountStatus !=10 &&!val.type) {
                allsum += (val.grouponPrice*1) * (val.goodsNum * 1)
              }
              if(val.type ==10&& val.limitPurchaseSettings!=3){
                allsum += (val.discountPrice*1) * (val.goodsNum * 1)
              }else{
                // 云店限时折扣活动（在前多少件参与折扣条件内按折扣价算）
                if(val.type == 10&&val.limitPurchaseSettings==3&& (val.userBoughtGoodsNum*1 + val.goodsNum*1)<= (val.purchaseQuantity*1))   {
                  allsum += (val.discountPrice * 1) * (val.goodsNum * 1)
                }
                // 云店限时折扣活动（超出前多少件参与折扣条件按原价算）
                if(val.type == 10&&val.limitPurchaseSettings==3&&(val.userBoughtGoodsNum*1 + val.goodsNum*1)>(val.purchaseQuantity*1)){
                  if(val.userBoughtGoodsNum*1<val.purchaseQuantity*1){  //用户历史购买小于限购数
                    let num = val.purchaseQuantity*1 - val.userBoughtGoodsNum*1
                    allsum += (val.discountPrice*1) * (num * 1)
                    let num2 = val.goodsNum*1 - num
                    allsum += (val.grouponPrice*1) * (num2 * 1)
                  }else{
                    allsum += (val.grouponPrice*1) * (val.goodsNum * 1)
                    val.nodis=true
                  }
                }
              }
              if(val.type == 20 ){
                let itemMoney = (val.grouponPrice*1) * (val.goodsNum * 1)
                fullDecMoney += itemMoney
                if(val.fullDecMoneyList && val.fullDecMoneyList.length>0){  //有满减活动
                  let newList= [...val.fullDecMoneyList]   //reverse()会改变原数组，这里通过...拷贝（拷贝一级）
                  let list = newList.reverse()
                  fullDecMoneyList = list
                  if(!combineG){  //非真说明是单个商品
                      for(let i=0 ;i<list.length;i++){
                        if(itemMoney >= floatObj.multiply(list[i].fullMoney*1,100)){
                          itemMoney -= floatObj.multiply(list[i].decMoney*1,100)
                          break
                        }
                      }
                    }
                  allsum += itemMoney
                }
              }
              if(val.type == 50 ){//买一送一  直接按原价计算
                allsum += (val.grouponPrice*1) * (val.goodsNum * 1);               
              }
              if(val.type == 60){//第二件半价 
                allsum += (val.grouponPrice*1) * (val.goodsNum * 1); 
                if(val.goodsNum*1>=2){//购买数量大于2的需要减去数量除于2的向下取整数的一半价格
                  let minusNum = Math.floor(val.goodsNum / 2);
                  allsum -= (val.grouponPrice*1)/2*(minusNum);
                }
                val.averagePrice = getNum(floatObj.divide(((val.grouponPrice*1)+(val.grouponPrice*1)/2)/2,100));//买2件均价
              }
              if(val.type == 70){//多件多折 
                if(val.manyPriManyFoldsList && val.manyPriManyFoldsList.length>0){  //有多件多折设置
                  let newList= [...val.manyPriManyFoldsList];   //reverse()会改变原数组，这里通过...拷贝（拷贝一级）
                  let list = newList.reverse();
                  manyPriManyFoldsList = list;
                  for(let i=0 ;i<list.length;i++){//循环获取最高折扣率
                    if(getNum(floatObj.divide(list[i].discount*1,100))<maxDiscount||maxDiscount==0){
                      maxDiscount = getNum(floatObj.divide(list[i].discount*1,100));//最高折扣率
                    }
                  }
                  if(!manyPriCombine||manyPriCombine.length==0){//说明活动是单个商品多件多折
                    for(let i=0 ;i<list.length;i++){
                      if(val.goodsNum*1 >= list[i].count*1){//购买数量大于活动设置的数量
                        let discount = getNum(floatObj.divide(list[i].discount*1,100));//折扣率
                        allsum += (list[i].count*1) * (val.grouponPrice*1) * discount;//达到购买数量的那一部分按相应的折扣计算
                        if(val.amountExceeded==1){//超过购买数量按照原价购买
                          allsum += (val.goodsNum*1 - list[i].count*1) * (val.grouponPrice*1);
                        }else{//超过购买数量按照最高折扣购买
                          allsum += (val.goodsNum*1 - list[i].count*1) * (val.grouponPrice*1) * maxDiscount;
                        }
                        break
                      }
                    }
                  }else{
                    manyPriGoodsNum += val.goodsNum*1;//组合商品总数量
                  }
                }
              }
              if(val.type == 80 ){//好物预售  直接按预售价计算
                allsum += (val.prePrice*1*100) * (val.goodsNum * 1);  
                val.prePrice = getNum(val.prePrice*1);//预售价          
              }
              val.discountPrice = getNum(val.discountPrice / 100)
              val.grouponPrice = getNum(val.grouponPrice / 100)
            })
            if(combineG ){  //满减活动的组合商品集合
              if(fullDecMoneyList.length>0){
                let reduceNum= 0
                for(let i=0 ;i<fullDecMoneyList.length;i++){
                  if(fullDecMoney >= floatObj.multiply(fullDecMoneyList[i].fullMoney*1,100)){
                    reduceNum = (fullDecMoneyList[i].decMoney*1)
                    this.setData({ reduceNum })
                    if(i == 0){
                      this.setData({ fullMax:true })
                    }else{
                      let preItem = fullDecMoneyList[i-1]  //上一个满减设置，比当前的大
                      let differNum = floatObj.multiply(preItem.fullMoney*1,100)  - fullDecMoney  //计算相差金额
                      let json ={
                        differNum:getNum(floatObj.divide(differNum,100)),
                        nextNum: preItem.decMoney
                      }
                      this.setData({
                        preOrNext:json
                      })
                    }
                    allsum -= floatObj.multiply(reduceNum,100)
                    break
                  }
                }
                if(reduceNum==0){  //说明一个满减条件也没满足
                  let len =fullDecMoneyList.length
                  let differNum= floatObj.multiply(fullDecMoneyList[len-1].fullMoney*1,100) - fullDecMoney
                  let json ={
                    differNum:getNum(floatObj.divide(differNum,100)),
                    nextNum: fullDecMoneyList[len-1].decMoney
                  }
                  this.setData({
                    preOrNext:json,
                    reduceNum:0
                  })
                }
              }
            }
            if(manyPriCombine&&manyPriCombine.length>0){ //多件多折的组合商品集合
              let newGoodsNum=0;//当前商品数量和前几个商品的数量累计的总数量
              let newGoodsNum1=0;//剩余可以计算折扣的商品件数
              manyPriCombine.forEach(val => {
                newGoodsNum += val.goodsNum;
                for(let i=0 ;i<manyPriManyFoldsList.length;i++){
                  if(manyPriGoodsNum >= manyPriManyFoldsList[i].count*1){//多件多折的组合商品数量大于活动设置的数量
                    let discount = getNum(floatObj.divide(manyPriManyFoldsList[i].discount*1,100));//折扣率
                    if(newGoodsNum <= manyPriManyFoldsList[i].count*1){//如果当前商品数量和前几个商品的数量的累计数量 <= 设置的最大数量
                      newGoodsNum1 = manyPriManyFoldsList[i].count*1-newGoodsNum;//剩余可以计算折扣的商品件数
                      allsum += (val.goodsNum*1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                    }else{//如果当前商品数量和前几个商品的数量累计数量 > 设置的数量
                      if(newGoodsNum1==0){//剩余可以计算折扣的商品件数置为0时
                        if(val.amountExceeded==1){//超过购买数量按照原价购买
                          allsum += (val.goodsNum*1) * (val.grouponPrice*1);
                        }else{//超过购买数量按照最高折扣购买
                          allsum += (val.goodsNum*1) * (val.grouponPrice*1) * maxDiscount;
                        }
                      }else{//剩余可以计算折扣的商品件数置不为0时
                        if(val.goodsNum > newGoodsNum1){// 如果当前商品的数量 大于 剩余可以计算折扣的商品件数
                          newGoodsNum1 = 0;//剩余可以计算折扣的商品件数置为0
                          allsum += (newGoodsNum1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                          if(val.amountExceeded==1){//超过购买数量按照原价购买
                            allsum += (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1);
                          }else{//超过购买数量按照最高折扣购买
                            allsum += (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1) * maxDiscount;
                          }
                        }else{// 如果当前商品的数量 等于 剩余可以计算折扣的商品件数
                          allsum += (val.goodsNum*1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                        }
                      }
                    }
                    break;
                  }
                }
              })
            }
          }else{
            this.setData({ fullMax:true })
          }
          //总金额转为元保存
          this.setData({
            totalValue: getNum(floatObj.divide(allsum, 100))
          })
        datax.forEach(el=>{
          el.discountPrice = getNum(el.discountPrice / 100)
          el.friendSellPrice = getNum(el.friendSellPrice / 100)
          el.grouponPrice = getNum(el.grouponPrice / 100)
        })
          let newdata = [...cloudData,...data,...waterData,...ecData,...mealData]
        this.setData({
          shoppingdata: newdata,
          shoppingdata1:datax,
          combineGood:combineG
        },()=>{
          this.updatagood(this.data.shoppingdata)  //购物车列表关联
        })
        }else{
          this.setData({
            shoppingdata: [],
            shoppingdata1: [],
            totalValue:'0.00',
            fullMax:true
          })
        }
      }
    })
  },
  //购物车数量和cartcode赋值给对应列表数据
  updatagood(data) {
    let newdataNum = this.data.goodsList.map(item => {
      data.map(el => {
        if (item.id == el.skuId) {
          item.goodnum = el.goodsNum     //商品数量
          item.carCode = el.cartCode   //清空购物车需要cartcode
          item.nodis = el.nodis
        }
      })
      return item
    })
    this.setData({
      goodsList: newdataNum
    })
  },
  //购物车数量
  shoppingnum() {
    if (!wx.getStorageSync('isaddress')) {
      return
    }
    service.shoppingnum({
      branchesId:this.data.branchId,
      smallBranchesId: this.data.cloudBranchId,
      userId: wx.getStorageSync('userId'),
    }).then(res => {
      if (res.data.result == 200) {
        this.setData({
          shoppnum: res.data.data.goodsNumber
        })
        if (res.data.data.goodsNumber < 1) {  //购物车数量小于1隐藏购物袋
          this.setData({
            srcolloff: false
          })
        }
      }
    })
  },
  //套餐立即购买 
  goBuy(){
    if (!wx.getStorageSync('isaddress')) {
      this.setData({
        waterMask: true
      })
      return
    }
    let goodData = this.data.goodMealdata.seriesList[this.data.mealIndex]
    let mealId = goodData.id
    service.getwatermeal({
      setMealId: mealId
    }).then(res => {
      if(res.data.result==200){
        let data=res.data.data;
        let newList=[];
        let waterMealsMasterInfoDto = [data.waterMealsMasterInfoDto];//主商品
        if(waterMealsMasterInfoDto.length>0){
          waterMealsMasterInfoDto.forEach(item=>{
            newList.push({
              giftName:item.skuName,
              giftPic:item.goodsPic,
              giftNum:item.num,
              main:1
            })
          })
        }
        if(data.giftGoodsList&&data.giftGoodsList.length>0){//赠品
          data.giftGoodsList.forEach(item=>{
            newList.push({
              giftName:item.skuName,
              giftPic:item.goodsPic,
              giftNum:item.num,
            })
          })
        }
        let list = []
        let goodPrice = floatObj.multiply(goodData.price, 100)* this.data.mealnum
        goodData.goodsResource = 30
        goodData.goodsNum = this.data.mealnum
        goodData.grouponPrice = floatObj.multiply(goodData.price,100)
        goodData.goodsCode = goodData.seriesSkuCode
        goodData.goodsPic = goodData.setMealImg
        goodData.mealGift=newList
        list.push(goodData)
        this.setData({
          buyMeal:false
        })
        let encodeGood=encodeURIComponent(JSON.stringify(list))
        wx.navigateTo({
          url: `/pages/shoppingOrder/index?goods=${encodeGood}&rental=${goodPrice}&type=3`,
        })
      }
    })
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
		if (!wx.getStorageSync('isaddress')) {
			let isdefault = wx.getStorageSync('isdefault');
			if(isdefault){
				wx.setStorageSync('isaddress', isdefault);
				console.log(333333,isdefault)
				this.setData({
					addressShow: true,
					shoppingAddress: `${isdefault.provinceName == isdefault.cityName ? isdefault.cityName : isdefault.provinceName + isdefault.cityName}${isdefault.districtName}${isdefault.address}`,
          cityName: isdefault.cityName,
          longitude:isdefault.longitude,
          latitude:isdefault.latitude
				}, () => {
					this.getWaterlist()
				}) 
			}
		}
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点
    this.setData({
      goodsList: [],
			shoppingAddress: '',
      branchId:presentAddress?presentAddress.siteId:'',
      cloudBranchId:currentCloudShop?currentCloudShop.siteId:'',
    });
    if (wx.getStorageSync('isaddress')){   //点击选择的地址存在
      let isaddress = wx.getStorageSync('isaddress');
      this.setData({
        addressShow:true,
        shoppingAddress: `${isaddress.provinceName == isaddress.cityName ? isaddress.cityName : isaddress.provinceName + isaddress.cityName}${isaddress.districtName}${isaddress.address}`,
        cityName: isaddress.cityName,
        longitude:isaddress.longitude,
        latitude:isaddress.latitude
      },()=>{
        this.getWaterlist()
      })
    } else if (wx.getStorageSync('isdefault')){  //默认地址存在
      let isdefault = wx.getStorageSync('isdefault');
      wx.setStorageSync('isaddress', isdefault);
      this.setData({
        addressShow:true,
        shoppingAddress: `${isdefault.provinceName == isdefault.cityName ? isdefault.cityName : isdefault.provinceName + isdefault.cityName}${isdefault.districtName}${isdefault.address}`,
        cityName: isdefault.cityName,
        longitude:isdefault.longitude,
        latitude:isdefault.latitude
      },()=>{
        this.getWaterlist()
      })   
    }else{   //没有默认地址和选择地址就显示当前站点位置
      this.getUserLocation();
    }
    this.shoppingnum();
    let isIPhoneX = app.globalData.isIPhoneX;
    if (isIPhoneX) {
      this.setData({
        iphone: isIPhoneX
      })
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
    this.getWaterlist()
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