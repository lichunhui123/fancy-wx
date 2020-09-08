// pages/groupGoodDetail/index.js
const app = getApp();
const service = require('../../service/index.js'); 
const until = require('../../utils/util.js');
import floatObj from '../../utils/floatObj.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLogin:false,//是否登录
    shoppingNum:0,//购物车数量
    toTopshow: false, //详情底部置顶
    skuCode:null, //商品skuCode
    showDiscountPrice:false,//是否显示限时折扣价格
    goodsDetail:{}, //商品详情数据
    imgHttp:app.globalData.imgUrl,
    urlImg:[],  //购物车图片
    detailImg:[], //详情图片
    swiperNum:0, //轮播图当前页
    prurl:"",//分享图片
    iphone:false,  //苹果适配
    branchesId:'', //拼团站点id
    cloudBranchId:'', //云店站点id
    showShare:false,//显示分享弹窗
    showPoster:false,//显示海报图弹窗
    painting:{},
    wxCode:"",//小程序页面的小程序码 base64
    posterImage:"",//海报canvas图
  },
  //点击分享好友
  shareClick(){
    this.setData({
      showShare:true
    })
  },
  //取消分享
  cancelShare(){
    this.setData({
      showShare:false
    })
  },
  //点击取消海报弹窗
  closePoster(){
    this.setData({
      showPoster:false
    });
  },
  cancelBubble(){
    return false;
  },
  //弹出海报弹窗
  getPoster(){
    this.setData({
      showShare:false
    });
    wx.showLoading({
      title: '绘制分享图片中',
      mask: true
    });
    if(this.data.wxCode){
      this.createPosterImage();
    }else{
      service.getwxacodeunlimit({
        "page": "pages/fingerMallGoodDetail/index",
        "scene": this.data.skuCode,
        "width": 124
      }).then(res=>{
        if(res.data.result==200){
          this.setData({
            wxCode:res.data.data
          },()=>{
            this.createPosterImage();
          });
        }else{
          wx.hideLoading();
          wx.showToast({
            title: '当前网络状态较差，请稍后重试',
            icon: 'none',
            duration: 2000
          });
        }
      }).catch(()=>{
        wx.showToast({
          title: '当前网络状态较差，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        wx.hideLoading();
      });
    }
  },
  //生成海报图片
  createPosterImage(){
    let wxCode = this.data.wxCode;//小程序码 base64的格式
    //声明文件系统
    const fs = wx.getFileSystemManager();
    //随机定义路径名称
    let times = new Date().getTime();
    let codeimg = wx.env.USER_DATA_PATH + '/' + times + '.png';

    //将base64图片写入 转成水机图片
    fs.writeFile({
      filePath: codeimg,
      data: wxCode.slice(22),
      encoding: 'base64',
      success: () => {
        //写入成功了的话，新的图片路径就能用了
        let salesPrice = "";//销售价
        if(this.data.goodsDetail.activityId){//参加过活动
          salesPrice = (this.data.goodsDetail.discountPrice/100).toFixed(2);//折扣价
        }else{
          salesPrice = (this.data.goodsDetail.salesPrice).toFixed(2);//销售价
        }
        let price = "";//原价或者友商价
        if(this.data.goodsDetail.activityId){//参加过活动
          price = (this.data.goodsDetail.salesPrice).toFixed(2);//销售价
        }else{
          price = (this.data.goodsDetail.competitorPrice).toFixed(2);//友商价
        }
        let priceLeft = "174";//销售价小于10
        if(salesPrice<10){//销售价小于10
          priceLeft = "174";
        }else if(salesPrice<100&&salesPrice>=10){//销售价大于10，小于等于100
          priceLeft = "200";
        }else if(salesPrice<1000&&salesPrice>=100){
          priceLeft = "230";
        }else if(salesPrice>=1000){
          priceLeft = "260";
        }
        this.setData({
          showPoster:true,
          painting:{
            width: 556,
            height: 772,
            clear: true,
            views: [
              {
                type: 'rect',
                background:"#FFFFFF",//海报背景
                width: 556,
                height: 772,
                left:0,
                top:0
              },
              {
                type: 'text',
                content: '指尖生活派',//海报的title
                fontSize: 32,
                color: '#333333',
                textAlign: 'left',
                top: 40,
                left: 198,
                bolder: false
              },
              {
                type: 'image',
                url: this.data.imgHttp+this.data.urlImg[0],//详情图片
                top: 112,
                left: 40,
                width: 476,
                height: 476
              },
              {
                type: 'text',
                content: this.data.goodsDetail.skuName,//商品的名称
                fontSize: 28,
                color: '#333333',
                textAlign: 'left',
                top: 628,
                left: 30,
                width: 336,
                MaxLineNumber: 1,
                breakWord: true,
                bolder: false
              },
              {
                type: 'text',
                content: '￥',//售价的符号
                fontSize: 32,
                color: '#F2922F',
                textAlign: 'left',
                top: 692,
                left: 28
              },
              {
                type: 'text',
                content: salesPrice,//销售价
                fontSize: 52,
                color: '#F2922F',
                textAlign: 'left',
                top: 676,
                left: 56,
                bolder: true
              },
              {
                type: 'text',
                content: `￥${price}`,//原价或者友商价
                fontSize: 24,
                color: '#999999',
                textAlign: 'left',
                top: 698,
                left: priceLeft,
                textDecoration: 'line-through'
              },
              {
                type: 'image',
                url: codeimg,//当前页面的小程序码
                top: 618,
                left: 402,
                width: 124,
                height: 124
              },
            ]
          },
        });
        wx.hideLoading();
      }
    });
  },
  //分享海报
  posterGetImage (event) {
    wx.hideLoading()
    const { tempFilePath } = event.detail
    this.setData({
      posterImage: tempFilePath
    })
  },
  //海报保存
  posterSave(){
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterImage,
      success (res) {
        wx.showToast({
          title: '保存图片成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  //登录成功
  loginSuccess(){
    this.setData({showLogin:false});
    this.getDetailData();
    this.getShoppingNum();
    this.getAddressList() //获取地址
  },
  //获取默认地址
  getAddressList(){
    if(wx.getStorageSync("isdefault")){
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
            if (item.isDefault==1){
              wx.setStorageSync('isdefault', item);
            }
          })
        }
      }
    })
  },
  //详情数据
  getDetailData(){
    wx.showLoading({title:"加载中..."});
    service.querySkuInfo({
      skuCode:this.data.skuCode,
      userId:wx.getStorageSync('userId')
    }).then((res)=>{
      console.log('详情',res.data.data);
      this.stopPullDownRefresh();
      wx.hideLoading();
      let data =res.data.data;
      if (!data || data.code == 610 || data.code == 1) {//没有商品
        return;
      }
      if (res.data.result==200){
        //商品图片
        let imgs = data.goodsPics ? data.goodsPics.split(',') : '';
        //详情图片
        let ximg = data.goodsPicDetail ? data.goodsPicDetail.split(','):'';
        //当前用户添加购物车数
        data.cartNum=0;
        let showDiscountPrice = false;//是否显示限时折扣价格
        if(data.discountStatus == 10){//限时折扣活动
          if(data.limitPurchaseSettings==3&&data.userBoughtGoodsNum>=data.purchaseQuantity){//超过限购设置
            showDiscountPrice = false;
          }else{
            showDiscountPrice = true;
          }
        }
        this.setData({
          goodsDetail:data,
          urlImg:imgs,
          detailImg:ximg,
          showDiscountPrice
        });
        this.getCartsList();
        this.getShareImg();
      }
    })
  },
  //获取购物车list列表
  getCartsList() {
    const userId = wx.getStorageSync('userId');
    service.shoppinggoods({
      branchesId:this.data.branchId,
      smallBranchesId: this.data.cloudBranchId,
      userId: userId
    }).then((res)=>{
      if(res.data.data){
        const {cartEffectiveList} = res.data.data;
        this.setCartNum(cartEffectiveList);
      }
    })
  },
  //设置商品购物数量
  setCartNum(carts) {
    let t=this;
    let goodsDetail = t.data.goodsDetail;
    if(carts){
      carts.map((cart) => {
        if (
            cart.skuCode == goodsDetail.skuCode
        ) {
          goodsDetail.cartNum = cart.goodsNum;
        }
      })
    }
    this.setData({goodsDetail});
  },
  //获取购物车数量
  getShoppingNum(){
    service.shoppingnum({
      branchesId:this.data.branchId,
      smallBranchesId: this.data.cloudBranchId,
      userId: wx.getStorageSync('userId')
    }).then(res => {
      if (res.data.result == 200) {
        let sum=res.data.data.goodsNumber;
        if (sum > 99) {
          sum="99+";
        }
        this.setData({shoppingNum:sum});
      }
    })
  },
  //绘制分享图片
  getShareImg() {
    var thats = this;
    let promise1 = new Promise(function (resolve, reject) {
      /* 获得要在画布上绘制的图片 */
      wx.getImageInfo({
        src: thats.data.imgHttp+thats.data.urlImg[0],
        success: function (res) {
          resolve(res);
        }
      })
    });
    let promise2 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: '../../image/tianmi.png',
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
        [promise1, promise2, promise3]
    ).then(res => {
      /* 创建 canvas 画布 */
      const ctx = wx.createCanvasContext('shareImg');

      /* 绘制图像到画布  图片的位置你自己计算好就行 参数的含义看文档 */
      /* ps: 网络图片的话 就不用加../../路径了 反正我这里路径得加 */
      ctx.drawImage(res[0].path, 60, 0, 250, 250)
      ctx.drawImage('../../' + res[1].path, 0, 20, 130, 42)
      ctx.drawImage('../../' + res[2].path, 0, 230, 400, 86)

      /* 绘制文字 位置自己计算 参数自己看文档 */
      ctx.setTextAlign('left');                        //  位置

      ctx.setFillStyle('#3C2E2A');                   //分类
      ctx.setFontSize(22);
      if(this.data.goodsDetail.discountStatus==10){//限时折扣 活动
        ctx.fillText("限时折扣", 13, 49);
      }else{
        ctx.fillText("更好甄选", 13, 49);
      }

      ctx.setFillStyle('red');                    //  颜色
      ctx.setFontSize(36);                            //  字号
      if(this.data.goodsDetail.discountStatus==10){//限时折扣活动
        ctx.fillText(until.getNum(this.data.goodsDetail.discountPrice/100), 51,287);
      }else{
        ctx.fillText(until.getNum(this.data.goodsDetail.salesPrice), 51,287);
      }

      ctx.setFillStyle('red');
      ctx.setFontSize(22);
      ctx.fillText('￥', 30,286);

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
          quality:1,
          success: function (res) {
            /* 这里 就可以显示之前写的 预览区域了 把生成的图片url给image的src */
            thats.setData({
              prurl: res.tempFilePath,
              hidden: false
            });
          },
          fail: function (res) {
            console.log(res)
          }
        })
      })
    })
  },
  //分享好友
  onShareAppMessage(res) {
    // 转发成功
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let happenTime = [year, month, day].map(until.formatNumber).join('-');
    service.shareLog({
      appType: 0,
      happenTime: happenTime,
      page: "指尖电商商品详情分享",
      shareUrl: '/pages/fingerMallGoodDetail/index?skuCode=' + this.data.skuCode,
      userId: wx.getStorageSync("userId")
    }).then((res) => {
      console.log(res);
    });
    let shareImg = this.data.prurl.replace(/^http(?=:)/i, 'https');
    return {
      title: this.data.goodsDetail.skuName,
      path: '/pages/fingerMallGoodDetail/index?skuCode=' + this.data.skuCode,
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

  //轮播图滑动
  swiperChange(e) {
    const num = e.detail.current;
    this.setData({
      swiperNum: num
    })
  },
  //点击置顶
  gotoTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  //点击回首页
  grouphomeClick(){
    wx.reLaunch({
      url: '/pages/home/index',
    })
  },
  //点击去购物车
  shoppingClick(){
      wx.reLaunch({
        url: '/pages/shoppingCar/index',
      })
  },
  //加入购物车
  addShopping(){
    wx.showLoading({title:"加载中..."});
    const { goodsDetail} = this.data;
    ++goodsDetail.cartNum;
    service.addgoodnum({
      activityId:goodsDetail.activityId,
      goodsCode: this.data.skuCode,
      goodsNum: goodsDetail.cartNum,
      goodsResource: 10,  //来源拼团5 10为指尖商城 水管家20
      userId: wx.getStorageSync("userId")
    }).then((res)=>{
      wx.hideLoading();
      if (res.data.result==200){
        wx.showToast({
          title: '购物车添加成功！',
          icon: 'success',
          duration: 2000
        });
        this.getShoppingNum()
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //立即购买
  goBuy(){
    if (!wx.getStorageSync('isaddress')&&!wx.getStorageSync('isdefault')) {
      wx.showToast({
        title: '请添加收货地址',
        icon: 'none'
      });
      return
    }
    let presentAddress = wx.getStorageSync("presentAddress");//选择的站点
    let goods = this.data.goodsDetail;
    console.log(goods);
    if(goods.discountStatus == 10&&goods.limitPurchaseSettings==2&&goods.userBoughtGoodsNum>=goods.purchaseQuantity){//参与限时折扣活动
      wx.showToast({
        title: '您已超过限购数量',
        icon: 'none'
      });
      return
    }
    let discountPrice = goods.discountPrice;
    goods.branchesId=presentAddress?presentAddress.siteId:"";    //站点id
    goods.buyerMessage=null;
    goods.cartCode=null;
    goods.goodsCode=goods.skuCode;
    goods.goodsNum=1;
    goods.goodsResource=10;//定单来源 5 = 拼团，10=指尖商城，20=水管家，30=套餐
    goods.sendTime=null;
    goods.ticketNum=null;
    goods.goodsPic=goods.goodsPics?goods.goodsPics.split(",")[0]:"";
    goods.storeGoodsName=goods.skuName;
    goods.storeGoodsSpecification=goods.goodsSpec;
    goods.discountPriceT=floatObj.divide(discountPrice,100).toFixed(2);//分转元
    goods.grouponPriceT=goods.salesPrice;//元
    goods.grouponPrice=floatObj.multiply(goods.salesPrice,100);//元转分
    goods.discountPrice=goods.discountPrice;//分
    goods.limitPurchaseSettings=goods.limitPurchaseSettings;//限购设置
    goods.userBoughtGoodsNum=goods.userBoughtGoodsNum;//用户已购数量
    goods.purchaseQuantity=goods.purchaseQuantity;//限购数量
    let goodsList=[];
    goodsList.push(goods);
    let totalNum='';
    totalNum = goods.salesPrice;
    let encodeGood=encodeURIComponent(JSON.stringify(goodsList))
    wx.navigateTo({
      url: `/pages/shoppingOrder/index?goods=${encodeGood}&rental=${totalNum}&type=3`,
    })
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {skuCode,scene}=options;
    this.setData({
      skuCode:skuCode?skuCode:scene,
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
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点 
    this.setData({
      branchId:presentAddress?presentAddress.siteId:'',
      cloudBranchId:currentCloudShop?currentCloudShop.siteId:'',
    });
    if(wx.getStorageSync("userId")){
      this.getAddressList(); //获取地址
      this.getDetailData();
      this.getShoppingNum();
    }else{
      this.setData({showLogin:true});
    }
    let isIPhoneX = app.globalData.isIPhoneX;
    if(isIPhoneX){
      this.setData({
        iphone:isIPhoneX
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
    this.getDetailData();
  },
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

})