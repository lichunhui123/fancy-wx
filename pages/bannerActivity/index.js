const service = require('../../service/index.js');
const app = getApp();
Page({
  data: {
    branchesId: "",//网点ID
    showLogin: true,//显示授权登录组件 判断是否授权登录
    options: null,//参数
    cartNum: 0,//购物车数量
    adsBannerPic: "",//头部图片
    firstList: null,//第一次获取的list
    navigateDtoList: null,//商品列表
    imgUrl: app.globalData.imgUrl,//图片域名
    isNewOpen:true,//是否是第一次打开页面
  },
  //登录成功回调
  loginSuccess(data) {
    this.setData({showLogin:false});
    if(data.detail){//说明是第一次授权登录
      let presentAddress = wx.getStorageSync("presentAddress");//选择的站点
      if (presentAddress) {
        this.getCarts();
        this.getCartsList();
      }
    }
  },
  //获取活动详情
  getBannerDetail(addCart) {
    let t = this;
    if (!addCart) {
      wx.showLoading({title: "加载中..."});
    }
    service.getBannerDetail({
      activityCode: t.data.options.activityCode,
      index: t.data.options.index
    }).then((res) => {
      let detail = res.data.data;
      this.setData({
        firstList: detail.navigateDtoList
      });
      this.getCartsList();
      this.setData({
        adsBannerPic: detail.adsBannerPic
      });
      wx.setNavigationBarTitle({
        title: detail.adsTitle
      })
    })
  },
  //获取购物车list列表
  getCartsList() {
    const userId = wx.getStorageSync('userId');
    service.shoppinggoods({
      branchesId: this.data.branchesId,
      userId: userId
    }).then((res) => {
      if (res.data.data) {
        const {cartEffectiveList} = res.data.data;
        this.setCartNum(cartEffectiveList);
      } else {
        this.setCartNum();
      }
    })
  },
  setCartNum(carts) {
    let t = this;
    this.data.firstList.map((item) => {
      let goods = item.skuDtoList;
      goods.map((goodsObj) => {
        goodsObj.cartNum = 0;
        if (carts) {
          carts.map((cart) => {
            if (
              cart.activityGoodsId == goodsObj.activityGoodsId &&
              cart.activityId == goodsObj.activityId
            ) {
              goodsObj.cartNum = cart.goodsNum;
            }
          })
        }
      });
      item.skuDtoList = goods;
    });
    this.setData({navigateDtoList: this.data.firstList});
    wx.hideLoading();
    setTimeout(() => {//防止重复提交状态
      t.hasClick = false;
    }, 1000);
    console.log(this.data.navigateDtoList);
  },
  //获取购物车数量
  getCarts() {
    let t = this;
    service.shoppingnum({
      branchesId: this.data.branchesId,
      userId: wx.getStorageSync('userId'),
      smallBranchesId:wx.getStorageSync('currentCloudShop')?wx.getStorageSync('currentCloudShop').siteId:''
    }).then((res) => {
      let cartNum = res.data.data.goodsNumber;
      t.setData({cartNum});
    })
  },
  //添加购物车
  addUpdateCart: function (e) {
    const goods = e.currentTarget.dataset['goods'];
    console.log(goods);
    if (this.hasClick) {//防止重复提交状态
      return;
    }
    this.hasClick = true;//防止重复提交状态
    //添加购物车
    this.addNewCart(goods);
  },
  //添加购物车
  addNewCart(goods) {
    wx.showLoading({title: "加载中..."});
    const userId = wx.getStorageSync('userId');
    const {activityId, goodsCode, cartNum, goodsSource} = goods;
    console.log(goods)
    service.addgoodnum({
      activityId: activityId,
      branchesId: this.data.branchesId,
      goodsCode: goodsCode,
      goodsNum: cartNum + 1 || 1,
      goodsResource: goodsSource,
      userId: userId
    }).then((res) => {
      wx.hideLoading();
      if (res.data.result == 200) {
        let carNum = ++this.data.cartNum;
        this.getCartsList();
        this.setData({cartNum:carNum});
      } else {
        this.hasClick = false;
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //商品减少
  delNewCart(e){
    if(this.hasClick){
      return;
    }
    this.hasClick=true;
    wx.showLoading({
      title: '加载中',
    })
    let dooditem = e.currentTarget.dataset['goods'];
    const userId = wx.getStorageSync('userId');
    let { activityId, goodsCode, cartNum, goodsSource, carCode} = dooditem
      if (cartNum>1){
        service.addgoodnum({
          activityId: activityId,
          branchesId: this.data.branchesId,
          goodsCode: goodsCode,
          goodsNum: cartNum - 1,
          goodsResource: goodsSource,
          userId: userId
        }).then(res => {
          wx.hideLoading()
          if (res.data.result == 200) {
            let carNum = --this.data.cartNum;
            this.getCartsList();
            this.setData({cartNum:carNum});
          }else{
            this.hasClick = false;
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        }).catch(res=>{
          this.hasClick = false;
       })
      }else{
        wx.showLoading({
          title: '加载中',
        })
        service.delshoppinggoods({
          cartCodes: [carCode]
        }).then(res => {
          wx.hideLoading()
          if (res.data.result == 200) {
            let carNum = --this.data.cartNum;
            this.getCartsList();
            this.setData({cartNum:carNum});
          }else{
            this.hasClick = false;
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        }).catch(res=>{
          this.hasClick = false;
       })
      }
  },
  //input框数量输入
  changeInput(e){
    let inpValue=e.detail.value;
    let dooditem = e.currentTarget.dataset['goods'];
    const userId = wx.getStorageSync('userId');
    let { activityId, goodsCode, cartNum, goodsSource, carCode} = dooditem;
    if(inpValue>=1){
      service.addgoodnum({
        activityId: activityId,
        branchesId: this.data.branchesId,
        goodsCode: goodsCode,
        goodsNum: cartNum - 1,
        goodsResource: goodsSource,
        userId: userId
      }).then(res => {
        if (res.data.result != 200) {
          this.getCartsList();
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }else{
          let carNum = this.data.cartNum+(inpValue-cartNum);
          this.getCartsList();
          this.setData({cartNum:carNum});
        }
      })
    }else{
      service.delshoppinggoods({
        cartCodes: [carCode]
      }).then(res => {
        if (res.data.result == 200) {
          let carNum = this.data.cartNum+(inpValue-cartNum);
          this.getCartsList();
          this.setData({cartNum:carNum});
        }
      })  
    }
  },
  stopinp(){ 
    //input框冒泡
  },
  //跳转详情页
  goDetail: function (e) {
    this.setData({
      isNewOpen:false
    })
    const activityId = e.currentTarget.dataset['activityid'];
    const goodsId = e.currentTarget.dataset['goodsid'];
    wx.navigateTo({
      url: `/pages/groupGoodDetail/index?storeGoodsId=${goodsId}&activityId=${activityId}`,
    })
  },
  //跳转购物车页
  goBuyCar() {
    wx.reLaunch({
      url: `/pages/shoppingCar/index`
    })
  },
  onLoad: function (options) {
    this.setData({
      options
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
    let presentAddress = wx.getStorageSync("presentAddress");//选择的站点
    this.setData({
      branchesId: presentAddress ? presentAddress.siteId :"",    //站点id
    },()=>{
      if(this.data.isNewOpen){//第一次打开页面
        this.getBannerDetail();
      }else{//从详情页面返回到此页面
        if(userId){//登录才调用购物车列表接口
          this.getCartsList();
        }
      }
      if(userId){//登录才调用购物车数量接口
        this.getCarts();
      }
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
});