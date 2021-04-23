// pages/waterGoodDetail/index.js
const app = getApp();
const API = require("../../service/api").API;
const service = require('../../service/index.js');
const until = require('../../utils/util.js');
import floatObj from '../../utils/floatObj.js';
const WxParse = require('../../wxParse/wxParse.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgHttp: app.globalData.imgUrl,
    itemDetail:{}, //详情数据
    mealItemDetail:{}, //套餐详情
    urlImg: [],  //购物车图片
    detailImg: [], //详情图片
    swiperNum: 0, //轮播图当前页
    toTopshow: false, //详情底部置顶
    iphone: false,  //苹果适配
    shoppingNum: 0,//购物车数量
    mealShow:false, //选择套餐弹窗
    goodsSpec:"", //规格
    packing:'',  //包装
    sellNum:'',  //已售数量
    skuCode:'',  //商品编码
    id:'',   //商品id
    waterStoreId:'',  //水站id
    branchesId: '',   //水网点
    type:'',  //商品和套餐 20为商品  30为套餐
    mealId:'',  //套餐id
    itdetail:{},  
    showLogin:false, //登录
    prurl:'',
    distance:'',  //距离
    addressc:'',  //水站地址
  },
  //立即购买 
  goBuy() {
    if(this.data.type==20){
      let itemData=this.data.itemDetail
      console.log(itemData)
      let newitemData={
        branchesId: itemData.branchesId,
        cartCode:null,
        goodsCode: itemData.skuCode,
        goodsNum: 1,
        goodsPic: itemData.goodsPic,
        grouponPrice: floatObj.multiply(itemData.sellPrice,100),
        storeGoodsName: itemData.skuName,
        storeGoodsSpecification: this.data.goodsSpec,
        goodsResource:20
      }
      let list=[]
      list.push(newitemData)
      let encodeGood=encodeURIComponent(JSON.stringify(list))
      wx.navigateTo({
        url: `/pages/shoppingOrder/index?goods=${encodeGood}&rental=0&type=3`,
      })
    }
    if(this.data.type==30){
      if (!wx.getStorageSync('isaddress')) {
        wx.showToast({
          title: '请添加收货地址',
          icon: 'none'
        })
        return
      }
      let mealItemDetail = this.data.mealItemDetail
      let newList = []
      if (mealItemDetail.giftGoodsList) {
        newList = [mealItemDetail.waterMealsMasterInfoDto, ...mealItemDetail.giftGoodsList]
      }
      newList = [mealItemDetail.waterMealsMasterInfoDto]
      if(newList.length>0){
        newList.forEach(item => {
          item.giftName = item.skuName
          item.giftNum = item.num
          item.giftPic=item.goodsPic
        })
      }
      let newmealDetail = {
        detailshow:false,
        goodsPic: mealItemDetail.waterMealsMasterInfoDto.goodsPic,
        branchesId: this.data.branchesId,
        cartCode: null,
        goodsCode: mealItemDetail.seriesSkuCode,
        goodsNum: 1,
        grouponPrice: floatObj.multiply(mealItemDetail.price,100),
        storeGoodsName: mealItemDetail.seriesName,
        goodsResource: 30,
        mealGift: newList
      }
      let zlist = []
      zlist.push(newmealDetail)
      console.log(2222222,zlist)
      let encodeGood=encodeURIComponent(JSON.stringify(zlist))
      wx.navigateTo({
        url: `/pages/shoppingOrder/index?goods=${encodeGood}&rental=0&type=3`,
      })
    }
  },
  //获取商品详情数据
  getGoodDetail(){
    let isaddress = wx.getStorageSync('isaddress')
    service.getwaterdetail({
      address: `${isaddress.provinceName == isaddress.cityName ? isaddress.cityName : isaddress.provinceName + isaddress.cityName}${isaddress.districtName}${isaddress.address}`,
      packing: this.data.packing,
      sellNum: this.data.sellNum,
      skuCode: this.data.skuCode,
      waterStoreId: this.data.waterStoreId
    }).then(res=>{
      let data=res.data.data
      if(res.data.result==200){
        wx.stopPullDownRefresh()
        //购物车图片
        let imgs = data.goodsPhotos ? data.goodsPhotos.split(',') : '';
        //详情图片
        let ximg = data.goodsProfile ? data.goodsProfile.split(',') : '';
        //价格
        data.sellPrice = floatObj.divide(data.sellPrice,100).toFixed(2); 
        data.goodnum=0
        this.setData({
          urlImg: imgs,
          detailImg: ximg,
          itemDetail:data
        },()=>{
          this.updatanum()
          this.getShareImg()
        })
      }
    })
  },
  //获取套餐详情
  getmealDetail(){
    let that=this;
    service.getwatermeal({
      setMealId: this.data.mealId,
      branchesId:this.data.branchesId
    }).then(res=>{
      let data = res.data.data
      if (res.data.result == 200) {
        wx.stopPullDownRefresh()
        //购物车图片
        let imgs = data.setmealImg ? data.setmealImg.split(',') : '';
        //详情图片
        let ximg = data.goodsProfile ? data.goodsProfile : '';
        WxParse.wxParse('article', 'html', ximg, that,5);
        //价格
        data.price = floatObj.divide(data.price, 100).toFixed(2);
        data.goodnum = 0
        this.setData({
          urlImg: imgs,
          //detailImg: ximg,
          mealItemDetail: data
        }, () => {
          this.updatanum()
          this.getShareImg()
        })
      }
    })
  },
  //加入购物车
  addShopping() {
    if (this.data.type == 30 && !wx.getStorageSync('isaddress')){
      wx.showToast({
        title: '请添加收货地址',
        icon: 'none'
      })
      return
    }
    if(this.submit){
      return;
    }
    this.submit=true;//开关控制重复添加购物车的操作
    wx.showLoading({ title: "加载中..." });
    const userId = wx.getStorageSync('userId');
    service.addgoodnum({
      skuId: this.data.type==20?this.data.id:this.data.mealId,
      branchesId: this.data.type == 20 ? this.data.itemDetail.branchesId : this.data.branchesId,
      goodsCode: this.data.type == 20 ? this.data.itemDetail.skuCode : this.data.mealItemDetail.seriesSkuCode,
      goodsNum: this.data.type == 20 ?++this.data.itemDetail.goodnum:++this.data.mealItemDetail.goodnum,
      goodsResource: this.data.type==20?20:30,  
      userId: userId
    }).then((res) => {
      wx.hideLoading();
      if (res.data.result == 200) {
        wx.showToast({
          title: '购物车添加成功！',
          icon: 'success',
          duration: 2000
        });
        this.getShoppingNum()
      } else {
        this.submit=false;//开关控制重复添加购物车的操作
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //轮播图滑动
  swiperChange(e) {
    const num = e.detail.current;
    this.setData({
      swiperNum: num
    })
  },
  //页面滚动
  onPageScroll(e) {
    if (e.scrollTop > 400) {
      this.setData({
        toTopshow: true
      })
    } else {
      this.setData({
        toTopshow: false
      })
    }
  },
  //点击置顶
  gotoTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  //点击回首页
  grouphomeClick() {
    wx.reLaunch({
      url: '/pages/home/index',
    })
  },
  //点击去购物车
  shoppingClick() {
    wx.reLaunch({
      url: '/pages/shoppingCar/index',
    })
  },
  //拨打电话
  phoneClick(){
    let tel = this.data.itemDetail.tel
    wx.makePhoneCall({
      phoneNumber: tel
    })
  },
  //更新商品数量
  updatanum(){
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点 
    service.shoppingnum({
      branchesId:presentAddress?presentAddress.siteId:'',
      smallBranchesId:currentCloudShop?currentCloudShop.siteId:'',
      userId: wx.getStorageSync('userId'),
      goodsResource :this.data.type==20?20:30,
      goodsCode: this.data.type == 20 ? this.data.itemDetail.skuCode : this.data.mealItemDetail.seriesSkuCode,
    }).then(res => {
      if (res.data.result == 200) {
        let sum = res.data.data.goodsNumber;
        if(this.data.type==20){
          this.setData({ 
            ['itemDetail.goodnum']:sum,
          });
        }
        if(this.data.type==30){
          this.setData({
            ['mealItemDetail.goodnum']: sum,
          });
        }
      }
    })
  },
  //获取购物车数量
  getShoppingNum() {
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点 
    service.shoppingnum({
      branchesId:presentAddress?presentAddress.siteId:'',
      smallBranchesId:currentCloudShop?currentCloudShop.siteId:'',
      userId: wx.getStorageSync('userId')
    }).then(res => {
      this.submit=false;//开关控制重复添加购物车的操作
      if (res.data.result == 200) {
        let sum = res.data.data.goodsNumber;
        if (sum > 99) {
          sum = "99+";
        }
        this.setData({ shoppingNum: sum });
      }
    })
  },
  //绘制分享图片
  getShareImg() {
    var thats = this;
    let promise1 = new Promise(function (resolve, reject) {
      /* 获得要在画布上绘制的图片 */
      wx.getImageInfo({
        src: thats.data.imgHttp + thats.data.urlImg[0],
        success: function (res) {
          resolve(res);
        }
      })
    });
    let promise3 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: '../../image/share_buy_btn.png',
        success: function (res) {
          resolve(res);
        }
      })
    });
    Promise.all(
      [promise1, promise3]
    ).then(res => {
      /* 创建 canvas 画布 */
      let price=''
      if(this.data.type==20){
        price = this.data.itemDetail.sellPrice
      }
      if(this.data.type==30){
        price = this.data.mealItemDetail.price
      }
      const ctx = wx.createCanvasContext('shareImg');

      /* 绘制图像到画布  图片的位置你自己计算好就行 参数的含义看文档 */
      /* ps: 网络图片的话 就不用加../../路径了 反正我这里路径得加 */
      ctx.drawImage(res[0].path, 60, 0, 250, 250)
      ctx.drawImage('../../' + res[1].path, 0, 230, 400, 86)

      /* 绘制文字 位置自己计算 参数自己看文档 */
      ctx.setTextAlign('left');                        //  位置

      ctx.setFillStyle('red');                    //  颜色
      ctx.setFontSize(36);                            //  字号
      ctx.fillText(price, 51, 287);

      ctx.setFillStyle('red');
      ctx.setFontSize(22);
      ctx.fillText('￥', 30, 286);

      /* 绘制 */
      ctx.stroke()
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 400,
          height: 320,
          destWidth: 800,
          destHeight: 640,
          canvasId: 'shareImg',
          quality: 1,
          success: function (res) {
            /* 这里 就可以显示之前写的 预览区域了 把生成的图片url给image的src */
            thats.setData({
              prurl: res.tempFilePath,
              hidden: false
            });
          },
          fail: function (res) {
          }
        })
      })
    })
  },
  //分享好友
  onShareAppMessage(res) {
    // 转发成功
    let shareImg = this.data.prurl.replace(/^http(?=:)/i, 'https');
    let newitdetail = JSON.stringify(this.data.itdetail)
    let title=''
    if(this.data.type==20){
      title = this.data.itemDetail.skuName
    }
    if(this.data.type==30){
      title = this.data.mealItemDetail.seriesName
    }
    return {
      title: title,
      path: '/pages/home/index',
      imageUrl: shareImg,
      success: function (res) {
      },
      fail: function (res) {
        // 转发失败
        wx.showToast({
          title: '当前网络状态较差，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },
  //登录成功
  loginSuccess() {
    this.setData({ showLogin: false });
    this.getShoppingNum();
    if (this.data.type == 20) {
      this.getGoodDetail()
    }
    if (this.data.type == 30) {
      this.getmealDetail()
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let itdetail=JSON.parse(options.itdetail)
    this.setData({
      itdetail:itdetail
    })
    if (options.type==20){
      let distance = itdetail.distance
      if (distance >= 1000) {
        distance = (distance / 1000).toFixed(1) + "km"
      } else {
        distance = distance + "m";
      }
      this.setData({
        goodsSpec: itdetail.goodsSpec,
        packing: itdetail.packing,
        sellNum:itdetail.sellNum,
        skuCode:itdetail.skuCode,
        waterStoreId: itdetail.waterStoreId,
        branchesId: itdetail.branchesId,
        type:options.type,
        id: itdetail.id,
        distance: distance,
        addressc:itdetail.address
      })
    }
    if(options.type==30){
      this.setData({
        mealId: itdetail.id,
        waterStoreId: itdetail.waterStoreId,
        branchesId: itdetail.branchesId,
        type: options.type,
      })
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
    if(wx.getStorageSync('userId')){
      this.getShoppingNum();
      if (this.data.type == 20) {
        this.getGoodDetail()
      }
      if (this.data.type == 30) {
        this.getmealDetail()
      }
    }else{
      this.setData({ showLogin: true });
    }
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
    this.getShoppingNum();
    if (this.data.type == 20) {
      this.getGoodDetail()
    }
    if (this.data.type == 30) {
      this.getmealDetail()
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
})