const app = getApp();
const service = require('../../service/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId:"",
    branchId:"",//拼团站点ID
    cloudBranchId:"",//云店站点ID
    imgUrl: app.globalData.imgUrl,
    shoppNum:0, //购物车数量
    hasStart:true,//是否已开始
    countdownTime:{//指尖云店-好物预售 距开始时间
      day: '00',
      hour: '00',
      minute: '00',
      second: '00',
    },
    preSaleGoods:[],//好物预售商品列表
    pageNum:1,  //当前页数
    pageSize:10, //每页数量
    listNum:0, //数据返回长度
    noMore:false,//没有更多了
  },
  //指尖云店商品详情
  cloudGoodsDetailClick(e){
    let { goodsCode,activityCode}=e.currentTarget.dataset.itdetail;
    wx.navigateTo({
      url: '/pages/cloudStoreDetail/index?storeGoodsId=' + goodsCode + '&activityCode=' + activityCode
    })
  },
  //跳转购物车页
  goBuyCar() {
    wx.reLaunch({
      url: `/pages/shoppingCar/index`
    })
  },
  //购物车数量
  shoppingNum(){
    service.shoppingnum({
      smallBranchesId: this.data.cloudBranchId,
      branchesId:this.data.branchId,
      userId: this.data.userId,
    }).then(res=>{
      if(res.data.result==200){
        this.setData({
          shoppNum: res.data.data.goodsNumber
        });
      }
    })
  },
  //查询指尖云店-好物预售 好货团团
  getSmallGoodsListByActivity(){
    wx.showLoading({
      title:"加载中..."
    });
    clearInterval(this.timer);
    service.getSmallGoodsListByActivity({
      branchesId:this.data.cloudBranchId,
      type:80, //80-好物预售 90-多人拼团
      pageNo: this.data.pageNum,
      pageSize: this.data.pageSize,
    }).then(res=>{
      wx.stopPullDownRefresh();
      wx.hideLoading();
      if(res.data.result==200){
        let data = res.data.data;
        if(data&&data.length>0){
          let noMore = false;//没有更多了
          if(data.length<this.data.pageSize){
            noMore = true;
          }
          let hasStart = false;//是否已开始
          let startTime = (new Date(data[0].startTime.replace(/-/g,"/"))).getTime();
          let times = (startTime - (new Date()).getTime()) / 1000;//距开始时间
          if(times<=0){
            hasStart = true;//是否已开始
          }else{
            this.countdown(times);
          }
          let result = data.map(item=>{
            item.goodsPic=item.goodsPic.split(',')[0];
            item.goodnum=0;
            item.carCode='';
            return item;
          });
          result=[...this.data.preSaleGoods,...result];
          this.setData({
            hasStart,//好物预售活动是否已开始
            preSaleGoods:result,//指尖云店-好物预售
            listNum:result.length,
            noMore
          },()=>{
            if(wx.getStorageSync('userId')){
              this.getshoppingGoods();
            }
          })
        }else{
          this.setData({
            listNum:0
          })
        }
      }else{
        this.setData({
          listNum:0
        })
      }
    })
  },
  //倒计时时间计算
  countdown(times) {
    this.timer = null;
    this.timer = setInterval(() => {
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
      times--;

      this.setData({
        countdownTime: {
          day: day,
          hour: hour,
          minute: minute,
          second: second,
        },
      });
      if (times <= 0) {
        clearInterval(this.timer);
      }
    }, 1000);
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
    //指尖云店 好物预售
    if(this.data.preSaleGoods.length>0){
      let cartSmallCart = data.cartSmallEffectiveList;
      if(cartSmallCart.length>0){
        let newdata = this.data.preSaleGoods.map(item=>{
          cartSmallCart.forEach(re=>{
            if(item.goodsCode == re.goodsCode){
              item.goodnum = re.goodsNum;
              item.carCode = re.cartCode;
            }
          });
          return item;
        });
        console.log();
        this.setData({
          preSaleGoods: newdata
        })
      }
    }
  },
  //好物预售商品添加按钮
  goodAddGray(){
    wx.showToast({
      title: "活动未开始",
      icon: 'none'
    })
  },
  //商品添加
  goodAdd(e){
    wx.showLoading({
      title: '加载中',
    });
    let dooditem =e.currentTarget.dataset.additem;
    let { goodsCode,goodnum,branchesId,activityCode} = dooditem;
    service.addgoodnum({
      activityId:activityCode,
      branchesId: branchesId,
      userId: this.data.userId,
      goodsResource: 40,  //来源拼团5 水管家20 40指尖云店
      goodsCode: goodsCode,
      goodsNum: ++goodnum
    }).then(res=>{
      wx.hideLoading();
      if(res.data.result==200){
        this.refreshShopping()
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //商品减少
  goodDel(e){
    wx.showLoading({
      title: '加载中',
    });
    let dooditem = e.currentTarget.dataset.delitem;
    let { goodsCode,carCode, goodnum,branchesId,activityCode} = dooditem;
    if (goodnum>1){
      service.addgoodnum({
        activityId:activityCode,
        branchesId: branchesId,
        userId: this.data.userId,
        goodsResource: 40,  //来源拼团5 水管家20 40指尖云店
        goodsCode:goodsCode,
        goodsNum: --goodnum
      }).then(res => {
        wx.hideLoading()
        if (res.data.result == 200) {
          this.refreshShopping()
        }else{
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    }else{
      wx.showLoading({
        title: '加载中',
      });
      service.delshoppinggoods({
        cartCodes: [carCode]
      }).then(res => {
        wx.hideLoading();
        if (res.data.result == 200) {
          this.goodnumreset(goodsCode);
          this.refreshShopping()
        }else{
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    }
  },
  //input框数量输入
  goodInp(e){
    let inpValue=e.detail.value;
    let dooditem = e.currentTarget.dataset.inpitem;
    let { goodsCode, carCode,branchesId,activityCode} = dooditem;
    if(inpValue>=1){
      service.addgoodnum({
        activityId:activityCode,
        branchesId: branchesId,
        userId:this.data.userId,
        goodsCode: dooditem.goodsCode,
        goodsResource:  40,  //来源拼团5 水管家20 40指尖云店
        goodsNum: inpValue,
      }).then(res => {
        this.refreshShopping();
        if (res.data.result != 200) {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    }else{
      service.delshoppinggoods({
        cartCodes: [carCode]
      }).then(res => {
        if (res.data.result == 200) {
          let newdata = this.data.preSaleGoods.map(item => {     //购物车清空需要手动给列表清0
            if (goodsCode == item.goodsCode) {
              item.goodnum = 0
            }
            return item
          });
          this.setData({
            preSaleGoods:newdata,
          });
          this.refreshShopping()
        }
      })
    }
  },
  //列表手动赋值为0（列表商品数量是根据购物车数量取的，购物车某商品数量小于1时商品不存在，列表需要手动赋值0）
  goodnumreset(goodsCode) {
    let newdataNum = this.data.preSaleGoods.map(item => {
      if (goodsCode == item.goodsCode) {
        item.goodnum = 0
      }
      return item
    });
    this.setData({
      preSaleGoods: newdataNum
    })
  },
  //更新购物车数量
  refreshShopping(){
    this.shoppingNum();//获取购物车数量
    this.getshoppingGoods();//
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
      userId:wx.getStorageSync("userId"),
      branchId:presentAddress?presentAddress.siteId:'',
      cloudBranchId:currentCloudShop?currentCloudShop.siteId:'',
      hasStart:true,//是否已开始
      countdownTime:{//指尖云店-好物预售 距开始时间
        day: '00',
        hour: '00',
        minute: '00',
        second: '00',
      },
      preSaleGoods:[],//好物预售商品列表
      pageNum:1,  //当前页数
    });
    wx.hideShareMenu();
    this.shoppingNum();//获取购物车数量
    this.getSmallGoodsListByActivity();//获取好物预售商品列表
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
    this.setData({
      hasStart:true,//是否已开始
      countdownTime:{//指尖云店-好物预售 距开始时间
        day: '00',
        hour: '00',
        minute: '00',
        second: '00',
      },
      preSaleGoods:[],//好物预售商品列表
      pageNum:1,  //当前页数
    });
    this.shoppingNum();//获取购物车数量
    this.getSmallGoodsListByActivity();//获取好物预售商品列表
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.listNum<10){  //加载数据小于10条不再加载
      return;
    }else{
      this.setData({
        pageNum: ++this.data.pageNum
      },()=>{
        this.getSmallGoodsListByActivity()
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})