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
    isNewOpen: true, //判断当前页面是新打开还是从其他页面返回 
    srcolloff:false,    //购物车弹层
    pageNum: 1,        //当前页数
    pageSize: 10,     //每页数量
    imgUrl: app.globalData.imgUrl,
    goodsList:[],       //水商品列表
    goodMealdata:{},   //商品套餐
    mealIndex:0,      //套餐默认第一个选中
    mealnum:1,   //套餐数量
    needBeforeChangeShopp:true,//在触发购物车数量变化时是否需要处理函数
    shoppingDatas:[],//接口返回未处理的购物车数据
    shoppingData: [],   //购物车商品
    shoppNum: 0,      //购物车数量
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
        this.getshoppingData()
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
            this.getshoppingData()
          })
        }else{
          this.getshoppingData();
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
  
  //添加地址
  chooseAddress(){
    this.setData({
      isNewOpen:true
    })
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
    this.setData({
      isNewOpen:false
    })
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
    this.setData({
      isNewOpen:false
    })
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
    if(this.submit){
      return;
    }
    this.submit=true;
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
        this.getshoppingData()
      } else {
        this.submit = false;//防止重复提交
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    }).catch(res=>{
      this.submit = false;
    })
  },
  //商品减少
  goodDel(e) {
    if(this.submit){
      return;
    }
    this.submit=true;
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
          this.getshoppingData()
        } else {
          this.submit = false;//防止重复提交
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }).catch(res=>{
        this.submit = false;
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
            shoppingData: [],
            shoppingExpireData: [],
            totalValue: '0.00'
          })
          this.shoppingnum()
          this.getshoppingData()
        } else {
          this.submit = false;//防止重复提交
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }).catch(res=>{
        this.submit = false;
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
    let { branchesId, skuCode, id, carCode,goodnum} = dooditem
    if (inpValue >= 1) {
      service.addgoodnum({
        branchesId: branchesId,
        userId: wx.getStorageSync('userId'),
        skuId: id,
        goodsCode: skuCode,
        goodsResource: 20,  //商品来源
        goodsNum: inpValue,
      }).then(res => {
        if (res.data.result != 200) {
          let newdata = this.data.goodsList.map(item => {     //购物车清空需要手动给列表清0
            if (id == item.id) {
              item.goodnum = goodnum
            }
            return item
          })
          this.setData({
            goodsList: newdata,
          })
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }else{
          this.shoppingnum()
          this.getshoppingData()
        }
      })
    } else {
      service.delshoppinggoods({
        cartCodes: [carCode]
      }).then(res => {
        if (res.data.result == 200) {
          this.shoppingnum()
          this.getshoppingData()
        }
      })
    }
  },
  //购物车商品在改变数量时需要判断是否有地址
  beforeChangeShopp(){
    if (!wx.getStorageSync('isaddress')) {
      this.setData({
        waterMask: true
      })
      return
    }
  },
  //购物车商品数量修改时回调函数
  changeShoppGood(){
    this.shoppingnum();
    this.getshoppingData();
  },
  //购物车商品
  getshoppingData() {
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
          
          let newdata = [...cloudData,...data,...waterData,...ecData,...mealData]
          this.setData({
            shoppingDatas: Adata,
            shoppingData: newdata
          },()=>{
            this.updatagood(this.data.shoppingData)  //购物车列表关联
          })
        }else{
          this.setData({
            shoppingDatas: [],
            shoppingData: []
          })
        }
      }
    })
  },
  //购物车数量和cartcode赋值给对应列表数据
  updatagood(data) {
    let newdataNum = this.data.goodsList.map(item => {
      item.goodnum=0;
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
    },()=>{
      this.submit = false;//防止重复提交
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
          shoppNum: res.data.data.goodsNumber
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
    if(this.data.isNewOpen){//需要重新加载数据
      this.setData({
        goodsList: [],
        shoppingData:[],
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
    }else{
      this.getshoppingData();
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