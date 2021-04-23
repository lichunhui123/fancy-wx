// pages/groupGoodDetail/index.js
const app = getApp();
const API = require("../../service/api").API;
const service = require('../../service/index.js'); 
const until = require('../../utils/util.js');
import floatObj from '../../utils/floatObj.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    branchId:"",  //拼团站点id
    cloudBranchId:'',  //云店站点id
    showLogin:false,//是否登录
    shoppingNum:0,//购物车数量
    toTopshow: false, //详情底部置顶
    activityId:null, //活动id
    storeGoodsId:null, //商品id
    goodsDetail:{}, //商品详情数据
    totalPeople:0,//购买人数
    avatars:null,//购买记录人列表
    imgHttp:app.globalData.imgUrl,
    urlImg:[],  //购物车图片
    detailImg:[], //详情图片
    swiperNum:0, //轮播图当前页
    countdownTime: {
      day: '00',
      hour: '00',
      minute: '00',
      second: '00',
    },
    prurl:"",//分享图片
    showNull:false,//站点下没有商品
    iphone:false,  //苹果适配
  },
  //登录成功
  loginSuccess(){
    this.setData({showLogin:false});
    this.getDetailData();
    this.getHistoryUser();
    this.getShoppingNum();
  },
  //详情数据
  getDetailData(){
    wx.showLoading({title:"加载中..."});
    service.getgoodsdetail({
      branchId: this.data.branchId,
      activityId: this.data.activityId,
      storeGoodsId: this.data.storeGoodsId,
    }).then((res)=>{
      console.log('详情',res.data.data);
      this.stopPullDownRefresh();
      wx.hideLoading();
      let data =res.data.data;
      if (!data || data.code == 610 || data.code == 1) {//没有商品
        this.setData({
          showNull: true
        });
        return;
      }
      if (res.data.result==200){
        //购物车图片
        let imgs = data.goodsPhotos ? data.goodsPhotos.split(',') : '';
        //详情图片
        let ximg = data.picDetail ? data.picDetail.split(','):'';
        //折扣价格
        data.discountPrice = (data.discountPrice/100).toFixed(2); 
        //自提时间
        data.zitiTime = this.getzitiTime(data.arriveTime) ;
        //购物数量 默认值
        data.cartNum = 0;
        //结束时间
        let tm=data.endTime.substring(0, 19);
        let endtime= (new Date(tm.replace(/-/g,"/"))).getTime();
        if (data.repertory>0){
          this.countdown((endtime - (new Date()).getTime()) / 1000)
        }else{
          this.countdown(0)
        }
        this.setData({
          goodsDetail:data,
          urlImg:imgs,
          detailImg:ximg,
          showNull: false
        });
        this.getCartsList();
        this.getShareImg();
      }
    })
  },
  //获取购买记录
  getHistoryUser(){
    let t=this;
    let data={
      groupGoodsId:this.data.storeGoodsId,
      pageNum:1,
      pageSize:10
    };
    wx.request({
      url: API.GET_HISTORY_USER,
      method: "post",
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded', // 默认值
        "token":wx.getStorageSync('token')||''
      },
      success(res) {
        let list=res.data.data.list;
        list.forEach(item=>{
          let nickname=item.nickname;
          item.nickname=nickname.substr(0,1)+'**'+nickname.substr(nickname.length-1,1);
        })
        t.setData({
          totalPeople: res.data.data.total,
          avatars: res.data.data.list
        })
      },
      fail(res) {
        wx.showToast({
          title: '当前网络状态较差，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
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
            cart.activityGoodsId == goodsDetail.activityGoodsId &&
            cart.activityId == goodsDetail.activityId
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
      this.submit=false;//开关控制重复添加购物车的操作
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

      ctx.setFillStyle('#3C2E2A');
      ctx.setFontSize(22);
      ctx.fillText(this.data.goodsDetail.groupCategory, 13, 49);

      ctx.setFillStyle('red');                    //  颜色
      ctx.setFontSize(36);                            //  字号
      ctx.fillText(this.data.goodsDetail.grouponPrice.toFixed(2), 51,287);

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
      page: "指尖拼团商品详情分享",
      shareUrl: '/pages/groupGoodDetail/index?storeGoodsId=' + this.data.storeGoodsId + '&activityId=' + this.data.activityId,
      userId: wx.getStorageSync("userId")
    }).then((res) => {
      console.log(res);
    });
    let shareImg = this.data.prurl.replace(/^http(?=:)/i, 'https');
    return {
      title: this.data.goodsDetail.storeGoodsName,
      path: '/pages/groupGoodDetail/index?storeGoodsId=' + this.data.storeGoodsId + '&activityId=' + this.data.activityId,
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
  //倒计时时间计算
  countdown(times) {
    let timer = null;
    timer = setInterval(() => {
      let day = 0,
        hour = 0,
        minute = 0,
        second = 0;//时间默认值
      if (times > 0) {
        day = Math.floor(times / (60 * 60 * 24));
        hour = Math.floor(times / (60 * 60)) - (day * 24);
        minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
        second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
      }
      if (day <= 9) day = '0' + day;
      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;
      //
      times--;

      this.setData({
        countdownTime: {
          day: day,
          hour: hour,
          minute: minute,
          second: second,
        },
      })
      if (times < 0) {
        // this.onLoad()
        clearInterval(timer);
      }
    }, 1000);
  },
  //自提时间
  getzitiTime(timestamp) {
    const date = timestamp.substring(5,7)+"月"+timestamp.substring(8,10)+"日";
    return date
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
    if(this.submit){
      return;
    }
    this.submit=true;//开关控制重复添加购物车的操作
    wx.showLoading({title:"加载中..."});
    const userId = wx.getStorageSync('userId');
    const branchId = this.data.branchId;
    let {goodsSource} = this.data.goodsDetail
    const { activityId, storeGoodsId, goodsDetail} = this.data;
    ++goodsDetail.cartNum;
    service.addgoodnum({
      activityId: activityId,
      branchesId: branchId,
      goodsCode: storeGoodsId,
      goodsNum: goodsDetail.cartNum,
      goodsResource: goodsSource,  //来源拼团5 水管家20
      userId: userId
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
        this.submit=false;//开关控制重复添加购物车的操作
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
    let goods = this.data.goodsDetail;
    goods.goodsResource = goods.goodsSource;
    goods.arriveTime = until.formatTimestamp(goods.arriveTime);
    goods.discountPriceT=goods.discountPrice;//元
    goods.grouponPriceT=goods.grouponPrice.toFixed(2);//元
    goods.grouponPrice=floatObj.multiply(goods.grouponPrice,100);//元转分
    goods.discountPrice=floatObj.multiply(goods.discountPrice,100);//元转分
    let goodsList=[];
    goodsList.push(goods);
    console.log(goods);
    let totalNum=''
    if (goods.discountStatus==10){
      totalNum = goods.discountPrice
    }else{
      totalNum = goods.grouponPrice
    }
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
    let {activityId, storeGoodsId}=options;
    this.setData({
      activityId,
      storeGoodsId,
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
      branchId: presentAddress?presentAddress.siteId:"",    //站点id
      cloudBranchId:currentCloudShop?currentCloudShop.siteId:'',
    });
    if(wx.getStorageSync("userId")){
      this.getDetailData();
      this.getHistoryUser();
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