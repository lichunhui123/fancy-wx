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
    branchId:"",
    currentCloudShop:null,//当前门店信息
    showLogin:false,//是否登录
    shoppingNum:0,//购物车数量
    toTopshow: false, //详情底部置顶
    activityCode:null, //活动编码
    storeGoodsId:null, //商品id
    shareCloundShop:null,//分享商品时所带的门店信息
    goodsDetail:{}, //商品详情数据
    imgHttp:app.globalData.imgUrl,
    urlImg:[],  //购物车图片
    detailImg:[], //详情图片
    swiperNum:0, //轮播图当前页
    prurl:"",//分享图片
    showNull:false,//站点下没有商品
    iphone:false,  //苹果适配
    dispatchdata:{},  //配送信息
    countdownTime: {   //限时折扣 好物预售倒计时
      day: '00',
      hour: '00',
      minute: '00',
      second: '00',
    },
    hasDrawDiscountList:[],//已领取卡券列表
    discountList:[],  //未卡券列表
    hasStart:false,//好物预售活动是否已开始
    hasEnd:false,//多人拼团活动已结束
    groupCode:null,//多人拼团活动分享链接打开获取的 团购编码
    groupAnotherCode:null,//通过点击拼团列表的去拼团时获取的 团购编码 或者 订单分享的链接点击打开的详情页面底部的去拼团按钮点击获取的团购编码
    groupShare:false,//多人拼团 订单分享的链接点击打开详情页面
    groupStatus:"",//多人拼团 订单分享的链接点击打开详情页面 该商品是否已拼团成功  0已取消，1：进行中，2：已完成 3：未开始
    groupList:[],//当前拼团列表
    showGroupMore:false,//是否展示拼团列表弹窗
    groupMethod:"",//1开团，2拼团 点击跳转提交订单页面需要此参数判断是否是拼团购买还是 直接购买
    groupNumGreaterThenOne:false,//当所有拼团人数剩余人数均大于1人时
    showShare:false,//显示分享的弹层
    postUrl:"",//请求小程序码的请求接口
    goodsInfo:{},//绘制海报商品相关的信息
    formdata:{},//获取海报的小程序码的请求接口入参
    wxCodeScene:"",//分享海报小程序码识别的参数
    selfShareGroup:false,//通过我的订单分享的多人拼团活动的分享人是自己时的标识
  },
  //获取云店信息
  getCloudBranchInfo(){
    return new Promise((resolve,reject)=>{
      if(!this.data.branchId){//没有云店ID直接返回
        resolve();
      }else{
        service.getnewcommunity({
          branchId: this.data.branchId
        }).then(res => {
          if (res.data.result == 200) {
            let data = res.data.data;
            let currentCloudShop={
              cityName:data.cityName,
              siteId:data.siteId,
              siteName:data.siteName,
            };
            this.setData({
              currentCloudShop
            },()=>{
              resolve();
            })
          }else{
            resolve();
          }
        }).catch(()=>{
          reject();
        })
      }
    })
  },
  //判断是否通过分享海报小程序码识别的
  judgeShareScene(){
    let wxCodeScene = this.data.wxCodeScene;
    if(wxCodeScene){
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      service.getSmallWxCodeUnlimit({
        uuid:wxCodeScene
      }).then((res)=>{
        if(res.data.result==200){
          let data = res.data.data;
          let shareCloundShop = {//获取到分享时的站点信息
            cityName:data.cityName,
            siteId:data.siteId,
            siteName:data.siteName,
          };
          wx.hideLoading();
          this.setData({
            activityCode:data.activityCode,
            storeGoodsId:data.storeGoodsId,
            shareCloundShop
          },()=>{
            this.judgeShareShop();//判断分享的门店信息是否与当前所选信息一致
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
      })
    }else{
      this.judgeShareShop();//判断分享的门店信息是否与当前所选信息一致
    }
  },
  //判断分享的门店信息是否与当前所选信息一致
  judgeShareShop(){
    let t=this;
    let currentCloudShop = this.data.currentCloudShop;//选择的站点
    let shareCloundShop = this.data.shareCloundShop;//分享时商品所带的门店信息
    if(shareCloundShop){//分享的详情页面打开时
      if(currentCloudShop){//有当前的所选的门店时
        if(currentCloudShop.siteId!=shareCloundShop.siteId){//分享所带的门店与当前所选门店不一致时
          wx.showModal({
            title:"温馨提示",
            content:`您当前所在门店为【${currentCloudShop.cityName}-${currentCloudShop.siteName}】,是否切换到【${shareCloundShop.cityName}-${shareCloundShop.siteName}】查看该商品`,
            cancelColor:"#999999",
            confirmColor:"#F2922F",
            success(res){
              if (res.confirm){//点击确认
                wx.setStorageSync('currentCloudShop', {siteId:shareCloundShop.siteId});//直接切换一下门店
                t.setData({
                  branchId: shareCloundShop.siteId,    //站点id
                  currentCloudShop:shareCloundShop 
                },()=>{
                  t.getDetailData();
                  t.getShoppingNum();
                  t.getColudDispatch()
                });
              }else{
                t.getDetailData();
                t.getShoppingNum();
                t.getColudDispatch()
              }
            },
          })
        }else{//分享所带的门店与当前所选门店一致时
          this.getDetailData();
          this.getShoppingNum();
          this.getColudDispatch()
        }
      }else{//没有选择当前门店时 直接赋值分享的站点ID
        wx.setStorageSync('currentCloudShop', {siteId:shareCloundShop.siteId});//直接切换一下门店
        this.setData({
          branchId: this.data.shareCloundShop.siteId,    //站点id
          currentCloudShop:shareCloundShop 
        },()=>{
          this.getDetailData();
          this.getShoppingNum();
          this.getColudDispatch()
        });
      }
    }else{//正常的点击进入详情页面打开时
      this.getDetailData();
      this.getShoppingNum();
      this.getColudDispatch()
    }
  },
  //领取券
  drawDiscount(){
		let arr = [this.data.goodsDetail.goodsCode]
    wx.navigateTo({
			url: '/pages/drawDiscount/index?draowQ=' + JSON.stringify(arr),
    })
  },
  //查询有已领取的卡券和还未领取的卡券
  getDiscountList(code){
    service.cloudMarkingOrder({
      branchesId: this.data.branchId,
      skuCode: [code],
      userId: wx.getStorageSync('userId')
    }).then(res => {
      if(res.data.result==200){
        let list=res.data.data.notClaimedList||[];
        list.forEach(item=>{
          item.cardMoneyT = item.cardMoney?floatObj.divide(item.cardMoney,100):'-'
          item.useThresholdT = item.useThreshold?floatObj.divide(item.useThreshold,100):'-'
          item.discountRatioT =item.discountRatio?floatObj.divide(item.discountRatio,100):'-'
        })
        let hasDrawDiscountList = res.data.data.claimedList||[];//已领取卡券
        hasDrawDiscountList.forEach(item=>{
          item.cardMoneyT = item.cardMoney?floatObj.divide(item.cardMoney,100):'-'
          item.useThresholdT = item.useThreshold?floatObj.divide(item.useThreshold,100):'-'
          item.discountRatioT =item.discountRatio?floatObj.divide(item.discountRatio,100):'-'
        })
        this.setData({
          discountList:list,
          hasDrawDiscountList:hasDrawDiscountList
        })
      }
    })
  },
  //查询多人成团活动的拼团列表
  getPeopleGroup(){
    service.getPeopleGroup({
      activityCode : this.data.activityCode!=null?this.data.activityCode:"",//活动编码
      goodsCode : this.data.storeGoodsId,//商品编码
    }).then(res=>{
        if(res.data.result==200){
          let data = res.data.data;
          if(data&&data.length>0){
            let groupNumGreaterThenOne = true;
            data.forEach(val=>{
              if(val.userInfoList[0].userId==wx.getStorageSync("userId")){//当前用户所发起的拼团
                val.isSelf = true;
              }
              if(val.surplusCount==1){//当有一个拼团剩余人数等于1时
                groupNumGreaterThenOne = false;
              }
            })
            this.setData({
              groupList:data,
              groupNumGreaterThenOne
            })
            this.groupCountDownTime();
          }
        }
    })
  },
  //拼团列表倒计时
  groupCountDownTime(){
    let groupList=this.data.groupList;
    groupList.forEach(val=>{
      let tm= val.doneTime.substring(0, 19);//拼团结束时间
      let doneTime= (new Date(tm.replace(/-/g,"/"))).getTime();
      let times = (doneTime - (new Date()).getTime()) / 1000;
      val.hour= "00";
      val.minute= "00";
      val.second= "00";
      let timer = null;
      clearInterval(timer);
      timer = setInterval(() => {
        let hour = 0,
          minute = 0,
          second = 0;//时间默认值
        if (times > 0) {
          hour = Math.floor(times / (60 * 60));
          minute = Math.floor(times / 60) - (hour * 60);
          second = Math.floor(times) - (hour * 60 * 60) - (minute * 60);
        }
        if (hour <= 9) hour = '0' + hour;
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        times--;
        val.hour= hour;
        val.minute= minute;
        val.second= second;
        this.setData({
          groupList
        })
        if (times < 0) {
          clearInterval(timer);
        }
      },1000)  
    });
  },
  //查看更多已开团列表
  checkGroupMore(){
    this.setData({
      showGroupMore:true
    })
  },
  //关闭拼团列表弹窗
  closeGroupMore(){
    this.setData({
      showGroupMore:false
    })
  },
  //倒计时时间计算
  countdown(times) {
    let timer = null;
    clearInterval(timer);
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
        clearInterval(timer);
        if(this.data.goodsDetail.type==80&&!this.data.hasStart){//好物预售 活动已开始
          this.setData({
            hasStart:true
          })
        }
      }
    }, 1000);
  },
  //登录成功
  loginSuccess(){
    this.setData({showLogin:false});
    this.getCloudBranchInfo().then(()=>{
      this.judgeShareShop();
    })
  },
  //详情数据
  getDetailData(){
    wx.showLoading({title:"加载中..."});
    console.log("branchId",this.data.branchId);
    console.log("storeGoodsId",this.data.storeGoodsId);
    console.log("activityCode",this.data.activityCode);
    console.log("userId",wx.getStorageSync('userId'));
    console.log("groupCode",this.data.groupCode);
    service.cloudStoreGoodDetail({
      branchesId:this.data.branchId,
      goodsCode: this.data.storeGoodsId,
      activityCode : this.data.activityCode!='null'?this.data.activityCode:"",//活动编码
      userId:wx.getStorageSync('userId'),
      groupCode: this.data.groupCode?this.data.groupCode:"",//拼团编码
    }).then((res)=>{
      console.log('详情',res);
      this.stopPullDownRefresh();
      wx.hideLoading();
      //todo 由于wx.showLoading挡住了wx.showToast 所以只能在loading隐藏后在显示toast提示
      if(this.data.selfShareGroup){//如果是自己分享的多人拼团活动
        wx.showToast({
          title: '不能参与自己的团哦~',
          icon: 'none',
          duration: 2000
        })
      }
      let data =res.data.data;
      if (!data) {//没有商品
        this.setData({
          showNull: true
        });
        return;
      }
      this.getDiscountList(data.goodsCode)   //获取卡券
      if (res.data.result==200){
        //购物车图片
        let imgs = data.goodsPic ? data.goodsPic.split(',') : [];
        //详情图片
        let ximg = data.goodsPicDetail ? data.goodsPicDetail.split(','):[];
        //购物数量 默认值为0
        data.cartNum = 0;
        data.averagePrice = ((data.salesPrice+data.salesPrice/2)/2).toFixed(2);
        data.goodsName = data.goodsName.length>38?data.goodsName.substring(0,38)+"...":data.goodsName;
        if(data.type==10){//活动是限时折扣，调用计时
          let tm=data.endTime.substring(0, 19);
          let endTime= (new Date(tm.replace(/-/g,"/"))).getTime();
          if (endTime>0){
            this.countdown((endTime - (new Date()).getTime()) / 1000)
          }else{
            this.countdown(0)
          }
        }
        if(data.type==80){//活动是好物预售，调用计时
          let tm=data.startTime.substring(0, 19);//开始时间
          let startTime= (new Date(tm.replace(/-/g,"/"))).getTime();
          let tmd=data.endTime.substring(0, 19);//结束时间
          let endTime= (new Date(tmd.replace(/-/g,"/"))).getTime();
          if (startTime>0){
            let times = 0;
            if(startTime > (new Date()).getTime()){//未开始
              times = (startTime - (new Date()).getTime()) / 1000;
              this.setData({
                hasStart:false
              })
            }else{//已开始
              times = (endTime - (new Date()).getTime()) / 1000;
              this.setData({
                hasStart:true
              })
            }
            this.countdown(times)
          }else{
            this.countdown(0)
          }
        }
        if(data.type==90){//多人拼团活动
          let tmd=data.endTime.substring(0, 19);//结束时间
          let endTime= (new Date(tmd.replace(/-/g,"/"))).getTime();
          if((new Date()).getTime()>endTime){//活动已结束
            this.setData({
              hasEnd:true
            })
          }else{
            this.getPeopleGroup();//查询团购列表
          }
        }
        let list=data.weChatInfoList;
        if(list!==null){
          list.forEach(item=>{
            let name=item.name;
            item.name=name.substr(0,1)+'**'+name.substr(name.length-1,1);
          })
          data.weChatInfoList=list;
        }
        this.setData({
          goodsDetail:data,
          groupStatus:data.status,//拼团状态 0:取消 1:进行中 2:已完成
          urlImg:imgs,
          detailImg:ximg,
          showNull: false
        });
        this.updatanum()
        this.getShareImg();
      }
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
      goodsResource :40,
      goodsCode:this.data.goodsDetail.goodsCode,
    }).then(res => {
      if (res.data.result == 200) {
        let sum = res.data.data.goodsNumber;
        if(sum>0){
          this.setData({ 
            ['goodsDetail.cartNum']:sum,
          });
        }
      }
    })
  },
  //获取购物车数量
  getShoppingNum(){
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点 
    service.shoppingnum({
      branchesId:presentAddress?presentAddress.siteId:'',
      smallBranchesId:currentCloudShop?currentCloudShop.siteId:'',
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
  //点击分享打开弹层
  shareClick(){
    let salePrice = "";//销售价
    let price = "";//原价
    let {type,disCountPrice,prePrice,salesPrice,goodsName}=this.data.goodsDetail;
    if(type==10){// 限时折扣活动
      salePrice = Number(disCountPrice).toFixed(2);
      price = salesPrice.toFixed(2);//原价 = 销售价
    }else if(type==80||type==90){//好物预售活动 多人拼团活动
      salePrice = prePrice.toFixed(2);
      price = salesPrice.toFixed(2);//原价 = 销售价
    }else{
      salePrice = salesPrice.toFixed(2);
      price = "";//原价 = 友商价
    }
    let {siteId,siteName,distance,colonel,deliveryAddress,cityName,longitude,latitude} = this.data.currentCloudShop;//当前云店的站点信息
    this.setData({
      postUrl:"createSmallWxCode",//获取小程序码的请求接口
      showShare:true,
      formdata:{//获取小程序码的请求入参
        page: "pages/cloudStoreDetail/index",
        width: 124,
        activityCode: this.data.activityCode,
        cityName,
        colonel,
        deliveryAddress,
        distance,
        latitude,
        longitude,
        siteId,
        siteName,
        storeGoodsId: this.data.storeGoodsId,
      },
      goodsInfo:{
        urlImg:this.data.imgHttp+this.data.urlImg[0],//海报的商品图片
        goodsName,//海报的商品名称
        salePrice,//海报的商品售价
        price,//海报的商品原价或者友商价
        siteName
      }
    });
  },
  //关闭分享弹层
  cancelShare(){
    this.setData({
      showShare:false,
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
      if(thats.data.goodsDetail.groupName){
        wx.getImageInfo({
          src: '../../image/tianmi.png',
          success: function (res) {
            resolve(res);
          }
        })
      }else{
        resolve();
      }
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
      if(thats.data.goodsDetail.groupName){//分组标签
       ctx.drawImage('../../' + res[1].path, 0, 20, 130, 42)
      }
      ctx.drawImage('../../' + res[2].path, 0, 230, 400, 86)

      /* 绘制文字 位置自己计算 参数自己看文档 */
      ctx.setTextAlign('left');                        //  位置
      
      if(thats.data.goodsDetail.groupName){//分组标签
        ctx.setFillStyle('#3C2E2A');
        ctx.setFontSize(22);
        ctx.fillText(thats.data.goodsDetail.groupName+'', 13, 49);
      }

      ctx.setFillStyle('red');                    //  颜色
      ctx.setFontSize(36);                            //  字号
      let price = 0;//价格
      if(thats.data.goodsDetail.type==10){// 限时折扣
        price = thats.data.goodsDetail.disCountPrice;
      }else if(thats.data.goodsDetail.type==80||thats.data.goodsDetail.type==90){//好物预售 多人拼团
        price = thats.data.goodsDetail.prePrice;
      }else{
        price = thats.data.goodsDetail.salesPrice;
      }
      ctx.fillText(price, 51,287);//价格

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
      page: "云店商品详情分享",
      shareUrl: '/pages/cloudStoreDetail/index?storeGoodsId=' + this.data.storeGoodsId + '&activityCode=' + this.data.activityCode,
      userId: wx.getStorageSync("userId")
    });
    let shareImg = this.data.prurl.replace(/^http(?=:)/i, 'https');
    return {
      title: this.data.goodsDetail.goodsName, 
      path: '/pages/cloudStoreDetail/index?storeGoodsId=' + this.data.storeGoodsId + '&activityCode=' + this.data.activityCode + '&shareCloundShop=' + JSON.stringify(this.data.currentCloudShop),
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
    if(this.submit){
      return;
    }
    this.submit=true;//开关控制重复添加购物车的操作
    wx.showLoading({title:"加载中..."});
    const userId = wx.getStorageSync('userId');
    const branchId = this.data.branchId;
    let {goodsCode} = this.data.goodsDetail
    const { goodsDetail} = this.data;
    ++goodsDetail.cartNum;
    service.addgoodnum({
      activityId: goodsDetail.activityCode,
      branchesId: branchId,
      goodsCode: goodsCode,
      goodsNum: goodsDetail.cartNum,
      goodsResource: 40,  //来源云店
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
  //配送信息
  getColudDispatch(){
    service.cloudStoredispatch({
      branchesId:this.data.branchId
    }).then(res=>{
      if(res.data.result==200){
        let data=res.data.data
        this.setData({
          dispatchdata:data
        })
      }
    })
  },
  //参加其他人的拼团购买
  goGroupBuy(e){
    let groupCode = e.currentTarget.dataset.groupcode;
    this.setData({
      groupMethod:2,
      groupAnotherCode:groupCode
    },()=>{
      this.goBuy()  //跳转提交订单页
    })
  },
  //去开团
  goOpenGroupBuy(){
    this.setData({
      groupMethod:1
    },()=>{
      this.goBuy()  //跳转提交订单页
    })
  },
  //立即购买
  goBuy(){
    if(this.data.goodsDetail.salableCount==0 && this.data.goodsDetail.frozenCount>0){
      //当剩余库存为0 并且冻结库存不为0时
      wx.showToast({
        title: '有用户未付款，还有机会~',
        icon: 'none',
        duration:1800
      })
      return;
    }
    //判断该店仅支持配送的时候
    let deliveryStatus=this.data.dispatchdata.smallDeliveryStatus
    if(deliveryStatus&&deliveryStatus!=30&&deliveryStatus!=10){
      let week=this.data.dispatchdata.smallOperateWeek.split(',')
      let inday=new Date().getDay()-1
      let newinday=inday<=0?6:inday
      let busniess=week[newinday]
      if(busniess!=1){   //判断当天是否休息
        wx.showToast({
          title: '指尖云店商品已打烊，暂时无法配送',
          icon: 'none',
          duration:1800
        })
        return;
      }
      let StTime= JSON.parse(this.data.dispatchdata.smallOperateTime).startTime
      let DyTime= JSON.parse(this.data.dispatchdata.smallOperateTime).endTime
      let sthour=StTime?StTime.split(':')[0]:0
      let stminute=StTime?StTime.split(':')[1]:0
      let dishour=DyTime?DyTime.split(':')[0]:0
      let disminute=DyTime?DyTime.split(':')[1]:0
      let hour=new Date().getHours()  //当前时
      let minute=new Date().getMinutes()  //当前分
      if(sthour>hour||(sthour==hour&&stminute>minute)){ //判断是否在营业期间
        wx.showToast({
          title: '指尖云店商品已打烊，暂时无法配送',
          icon: 'none',
          duration:1800
        })
        return;
      }
      if(dishour<hour||(dishour==hour&&disminute<minute)){ //判断是否在营业期间
        wx.showToast({
          title: '指尖云店商品已打烊，暂时无法配送',
          icon: 'none',
          duration:1800
        })
        return;
      }
    }
    let goods = this.data.goodsDetail;
    let newitemData={
      branchesId: goods.branchesId,
      cartCode:null,
      goodsCode: goods.goodsCode,
      goodsNum: 1,
      goodsCartPic: goods.goodsCartPic?goods.goodsCartPic:"",
      grouponPrice:goods.salesPrice?floatObj.multiply( goods.salesPrice, 100):0,//原价 元传分
      discountPrice:goods.disCountPrice?floatObj.multiply( goods.disCountPrice, 100):0 ,//折扣价 元传分
      discountPriceT:goods.disCountPrice,//折扣价
      grouponPriceT:goods.salesPrice,//原价
      prePrice:goods.prePrice?goods.prePrice:0,//预售价 元
      storeGoodsName: goods.goodsName,
      storeGoodsSpecification: goods.goodsSpec,
      goodsResource:goods.resource,
      fullDecMoneyList:goods.fullDecMoneyList,//满减活动设置
      manyPriManyFoldsList:goods.manyPriManyFoldsList,//多件多折设置
      amountExceeded:goods.amountExceeded,//限购设置 1 =超过购买数量按原价购买，2=超过购买数量按最高折扣价购买
      type:goods.type,
      activitySet:goods.activitySet,
      limitPurchaseSettings:goods.limitPurchaseSettings,
      userBoughtGoodsNum:goods.userBoughtGoodsNum,
      purchaseQuantity:goods.purchaseQuantity,
      activityId:goods.activityCode,
      groupMethod:this.data.groupMethod,//拼团购买 "":直接购买 1:开团 2:拼团
      groupCode:this.data.groupAnotherCode,//团购编码
      expectedArrivalTime:goods.expectedArrivalTime,//云店预售活动预计自提（到货）时间
    }
    let list=[newitemData]
    let totalNum = goods.salesPrice
    let encodeGood=encodeURIComponent(JSON.stringify(list))
    wx.redirectTo({
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
    let {activityCode,storeGoodsId,groupCode,userId,groupShare,shareCloundShop,scene}=options;
    if(scene){//小程序码识别的路由参数
      this.setData({
        wxCodeScene:scene,
      })
    }
    if(storeGoodsId){//商品Id
      this.setData({
        storeGoodsId,
      })
    }
    if(activityCode){
      this.setData({
        activityCode,//活动编码
      })
    }
    if(groupShare){//多人拼团从订单页面点击分享渠道
      this.setData({
        groupShare:true,
      })
    }
    if(groupCode){
      this.setData({
        groupCode,//多人拼团分享链接获取的 团购编码
      })
    }
    if(shareCloundShop){//分享时所带的门店信息
      this.setData({
        shareCloundShop:JSON.parse(shareCloundShop)
      })
    }
    if(userId==wx.getStorageSync("userId")){//通过我的订单分享的多人拼团活动的分享人是自己
      this.setData({
        selfShareGroup:true
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
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//选择的站点
    this.setData({
      branchId: currentCloudShop?currentCloudShop.siteId:"",    //站点id
      groupMethod:""
    });
    if(wx.getStorageSync("userId")){
      this.getCloudBranchInfo().then(()=>{
        this.judgeShareScene();
      })
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
    this.setData({
      groupList:[],
      countdownTime: {   //限时折扣 好物预售倒计时
        day: '00',
        hour: '00',
        minute: '00',
        second: '00',
      },
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