const service = require('../../service/index.js');
const app = getApp();
import floatObj from '../../utils/floatObj.js';
import {changeCurrentCloudShop} from "../../utils/util.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.globalData.imgUrl,
    showIndex:1,//卡券显示几个
    branchId:"",    //云店站点id
    cloudStoreName:"",//云店名称
    deliveryAddress:"",//云店地址
    groupBranchId:"",//拼团站点id
    userId:"",   //用户id
    classType:[],  //云店商品分组
    cloundInfo:null, //云店运营信息
    colleType:false,//是否收藏
    discountList:[],//优惠券
    showDiscountCoupon:false, //是否显示优惠券的弹窗
    showLogin:false,//是否登录
    shareCloundShop:null,//分享商品时所带的门店信息
    shoppNum:0, //购物车数量
    shoppingDatas:[],//接口返回的购物车信息
    shoppingData:[], //购物车商品
    shareCloudStore:null,//分享门店参数
    groupClass:"",
    groupCount:5,//分组数量
    disActiviteList:[],//限时折扣活动商品
    disActiviteListlen:0,//限时折扣活动列表长度
    disActiviteCode:'',//限时折扣code
    disActiviteListClass:'',//限时折扣活动class
    preSaleActivityGoodsList:[],//好货预售商品
    preSaleActivityGoodsListlen:0,//好货预售列表长度
    preSaleActivityGoodsListClass:'',//好货预售class
    preSaleCode:'',//好货预售code
    groupActivityGoodsList:[],//一起团商品
    groupActivityGoodsListlen:0,//一起团列表长度
    groupActivityGoodsListClass:'',//一起团class
    groupActivityCode:'',//一起团code
    fulldecrActivityGoodsList:[],//全场满减商品
    fullDecMoneyList:[],//满减金额
    fulldecrActivityGoodsListlen:0,//全场满减列表长度
    fulldecrActivityGoodsListClass:'',//全场满减class
    fulldecrCode:'',//满减code
    buyOneGetOneActivityGoodsList:[],//买一送一商品
    buyOneGetOneActivityGoodsListlen:0,//买一送一列表长度
    buyOneGetOneActivityGoodsListClass:'',//买一送一class
    buyOneGetOneCode:'',//买一送一code
    manyPriceActivityGoodsList:[],//多件多折商品
    manyPriceActivityGoodsListlen:0,//多件多折列表长度
    manyPriceActivityGoodsListClass:'',//多件多折class
    manyPriceCode:'',//
    halfPriceActivityGoodsList:[],//第二件半价商品
    halfPriceActivityGoodsListlen:0,//第二件半价列表长度
    halfPriceActivityGoodsListClass:'',//第二件半价class
    halfPriceCode:'',
    buynoeGroupListlen:0,//组合买一送一列表长度
    selectedGoodsList:[],//云店精选商品
    loadMoreShow:false,//查看更多显示
    path:"",//点击跳转的页面
    disTime: {   //限时折扣倒计时
      day: '00',
      hour: '00',
      minute: '00',
      second: '00',
    },
    groupTime: {   //一起团倒计时
      day: '00',
      hour: '00',
      minute: '00',
      second: '00',
    },
  },
  //获取门店营业信息
  getCloudSetting(){
    service.cloudStoredispatch({
      branchesId:this.data.branchId,
      userId:wx.getStorageSync('userId')
    }).then((res)=>{
      if(res.data.result==200){
        this.setData({
          cloundInfo:res.data.data,
          colleType:res.data.data.colleType
        })
      }
    })
  },
  //收藏门店
  collectBranch(){
    if(this.submit){
      return;
    }
    this.submit=true;
    service.queryCellectBranch({
      branchesId:this.data.branchId,
      userId:wx.getStorageSync('userId')
    }).then((res)=>{
      this.submit=false;
      if(res.data.result==200){
        wx.showToast({
          title: '收藏成功',
          icon:'none',
          duration:2000
        })
          this.setData({
            colleType:true
          })
      }else{
        wx.showToast({
          icon:'none',
          title: res.data.message,
        })
      }
    })
  },
  //取消收藏门店
  noCollect(){
    if(this.submit){
      return
    }
    this.submit=true;
    service.cancelColleBranches({
      branchesId:this.data.branchId,
      userId:wx.getStorageSync('userId')
    }).then((res)=>{
      this.submit=false;
      if(res.data.result==200){
        wx.showToast({
          title: '取消收藏成功',
          icon:'none',
          duration:2000
        })
        this.setData({
          colleType:false
        })
      }
    })
  },
  //拨打店铺电话
  makePhoneCall(){
    let phone=this.data.cloundInfo.dobusinessPhone;
    wx.makePhoneCall({
      phoneNumber: phone, //仅为示例，并非真实的电话号码
      success(){},
      fail(){},
    })
  },
  //获取最新站点
  getcomm() {
    let currentCloud = wx.getStorageSync('currentCloudShop')
    if(this.data.shareCloudStore){
      currentCloud = this.data.shareCloudStore;
    }
    if (currentCloud) {
      service.getnewcommunity({
        branchId: currentCloud.siteId
      }).then(res => {
        if (res.data.result == 200) {
          let data = res.data.data
          this.setData({
            cloudStoreName: data?data.siteName:'',//云店名称
            deliveryAddress: data?data.deliveryAddress:''//云店地址
          })
        }
      })
    }
  },
  //获取优惠券列表
  queryCardList(){
    service.queryCloudCardList({
      branchesId:this.data.branchId,
      userId:this.data.userId
    }).then((res)=>{
      if(res.data.result==200){
        let notClaimedList = res.data.data.notClaimedList||[];//未领取
        let claimedList = res.data.data.claimedList||[];//已领取
        if(claimedList.length>0){
          claimedList.forEach(val=>{
            val.usetag = true//设置已领取标识
          }) 
        }
        let newlist= [...notClaimedList,...claimedList];
        if(newlist.length>0){
          newlist.forEach(item=>{
            item.cardMoneyT = item.cardMoney?floatObj.divide(item.cardMoney,100):'-';//分转元
            item.fullMoneyT = item.fullMoney?floatObj.divide(item.fullMoney,100):'-';//分转元
            item.discountRatioT =item.discountRatio?floatObj.divide(item.discountRatio,100):'-';//分转元
            item.startTime = item.startTime?item.startTime:'-'
            item.endTime = item.endTime?item.endTime:'-'
          })
          this.setData({
            discountList:newlist
          })
        }else{
          this.setData({
            discountList:[]
          })
        }
      }
    })
  },
  //弹出弹层 底部禁止滑动
  catchtouchmove(){
    return false;
  },
  //展开优惠券弹窗
  downDiscountCoupon(){
    this.setData({
      showDiscountCoupon:true
    })
  },
  //关闭优惠券弹窗
  closeDiscountCoupon(){
    this.setData({
      showDiscountCoupon:false
    })
  },
  //领取卡券
  drawCoupon(e){
    let cardCode = e.target.dataset.cardcode;
    this.drawCouponServer(cardCode);
  },
  //卡券弹层中的领取卡券回调事件
  getCoupon(e){
    let cardCode = e.detail.cardCode;
    this.drawCouponServer(cardCode);
  },
  //领取卡券的请求
  drawCouponServer(cardCode){
    wx.showLoading({
      title: '加载中',
    })
    service.cloudDraowOrder({
      userId: wx.getStorageSync('userId'),
      cardCode: cardCode
    }).then(res => {
      wx.hideLoading();
      if(res.data.result==200){
        wx.showToast({
          title: "领取成功",
          icon: 'none'
        })
        let discountList = this.data.discountList.map((item)=>{
          if(item.cardCode==cardCode){
            item.usetag = true//设置已领取标识
          }
          return item;
        });
        this.setData({discountList});
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //登录成功
  loginSuccess(){
    this.setData({showLogin:false});
    this.queryCardList();
    this.refreshShopping();
  },
  //跳转云店列表页
  cloudStoreList(){
    if(this.data.shareCloudStore){
      wx.navigateTo({
        url: '/pages/cloudStoreList/index',
      })
    }else{
      wx.navigateTo({
        url: '/pages/cloudStoreList/index?source=storeHome',
      })
    }
  },
  //跳转云店搜索
  cloudSearch(){
    wx.navigateTo({
      url: '/pages/cloudStoreSearch/index',
    })
  },
  //跳转云店分类列表页
  gocloudStore(e){
    let {groupcode,type}=e.currentTarget.dataset;//自定义属性
    wx.navigateTo({
      url: '/pages/cloudStore/index?groupCode='+groupcode+'&navtype='+type,
    })
  },
  //购物车商品数量变化的回调函数
  changeShoppGood(){
    this.refreshShopping();
  },
  //刷新购物车相关
  refreshShopping(){
    if (!wx.getStorageSync("userId")) {
      return;
    }
    this.shoppingnum() //购物车数量
    this.getshoppingData()//购物车列表
  },
  //购物车数量
  shoppingnum(){
    service.shoppingnum({
      smallBranchesId: this.data.branchId,
      branchesId:this.data.groupBranchId,
      userId: this.data.userId,
    }).then(res=>{
      if(res.data.result==200){
        this.setData({
          shoppNum: res.data.data.goodsNumber
        })
      }
    })
  },
  //购物车商品--------3
  getshoppingData(){
    service.shoppinggoods({
      smallBranchesId: this.data.branchId,
      branchesId:this.data.groupBranchId,
      userId: this.data.userId
    }).then(res=>{
      if(res.data.result==200){
        if(res.data.data){
          let Adata=res.data.data
          let data = Adata.cartEffectiveList?Adata.cartEffectiveList:[];//拼团商品
          let waterData = Adata.cartWaterEffectiveList?Adata.cartWaterEffectiveList:[];//水管家商品
          let mealData = Adata.cartMealEffectiveList?Adata.cartMealEffectiveList:[];//水票套餐商品
          let ecData = Adata.cartMallEffectiveList?Adata.cartMallEffectiveList:[];//指尖电商
          let cloudData = Adata.cartSmallEffectiveList?Adata.cartSmallEffectiveList:[];//云店商品
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
          },()=>{
            this.updatagood(this.data.shoppingData)  //购物车列表关联
          })
        }
      }
    })
  },
  //购物车数量和cartcode赋值给对应列表数据------4
  updatagood(data){
    let disActiviteList =[];
    if (this.data.disActiviteListLen>0&&this.data.disActiviteListLen<4){//限时折扣
      disActiviteList = this.data.disActiviteList.map(item => {
        if(!item.length){
          item.goodsNum = 0;
          item.cartCode = "";
          data.map(el => {
            if (item.goodsCode == el.goodsCode) {
              item.goodsNum = el.goodsNum     //商品数量
              item.cartCode = el.cartCode   //商品减少为0(相当于删除)需要cartcode
            }
          })
          return item
        }
      })
    }
    let preSaleActivityGoodsList=[];//好货预售
    preSaleActivityGoodsList = this.data.preSaleActivityGoodsList.map(item => {
      if (!item.length) {
        item.goodsNum = 0;
        item.cartCode = "";
        data.map(el => {
          if (item.goodsCode == el.goodsCode) {
            item.goodsNum = el.goodsNum     //商品数量
            item.cartCode = el.cartCode   //商品减少为0(相当于删除)需要cartcode
          }
        })
        return item
      }
    })
    let fulldecrActivityGoodsList=[];
    if (this.data.fulldecrActivityGoodsListlen > 0&&this.data.fulldecrActivityGoodsListlen < 4) {//全场满减
      fulldecrActivityGoodsList = this.data.fulldecrActivityGoodsList.map(item => {
        if (!item.length) {
          item.goodsNum = 0;
          item.cartCode = "";
          data.map(el => {
            if (item.goodsCode == el.goodsCode) {
              item.goodsNum = el.goodsNum     //商品数量
              item.cartCode = el.cartCode   //商品减少为0(相当于删除)需要cartcode
            }
          })
          return item
        }
      })
    }
    let buyOneGetOneActivityGoodsList=[];//买一送一
    buyOneGetOneActivityGoodsList = this.data.buyOneGetOneActivityGoodsList.map(item => {
      if (!item.length) {
        item.goodsNum = 0;
        item.cartCode = "";
        data.map(el => {
          if (item.goodsCode == el.goodsCode) {
            item.goodsNum = el.goodsNum     //商品数量
            item.cartCode = el.cartCode   //商品减少为0(相当于删除)需要cartcode
          }
        })
        return item
      }
    })
    let manyPriceActivityGoodsList=[];//多件多折
    manyPriceActivityGoodsList = this.data.manyPriceActivityGoodsList.map(item => {
      if (!item.length) {
        item.goodsNum = 0;
        item.cartCode = "";
        data.map(el => {
          if (item.goodsCode == el.goodsCode) {
            item.goodsNum = el.goodsNum     //商品数量
            item.cartCode = el.cartCode   //商品减少为0(相当于删除)需要cartcode
          }
        })
        return item
      }
    })
    let halfPriceActivityGoodsList=[];//第二件半价
    halfPriceActivityGoodsList = this.data.halfPriceActivityGoodsList.map(item => {
      if (!item.length) {
        item.goodsNum = 0;
        item.cartCode = "";
        data.map(el => {
          if (item.goodsCode == el.goodsCode) {
            item.goodsNum = el.goodsNum     //商品数量
            item.cartCode = el.cartCode   //商品减少为0(相当于删除)需要cartcode
          }
        })
        return item
      }
    })
    let selectedGoodsList=[];//云店精选
    selectedGoodsList = this.data.selectedGoodsList.map(item => {
      if (!item.length) {
        item.goodsNum = 0;
        item.cartCode = "";
        data.map(el => {
          if (item.goodsCode == el.goodsCode) {
            item.goodsNum = el.goodsNum     //商品数量
            item.cartCode = el.cartCode   //商品减少为0(相当于删除)需要cartcode
          }
        })
        return item
      }
    })
    this.setData({
      disActiviteList:this.data.disActiviteListLen>0&&this.data.disActiviteListLen<4?disActiviteList:this.data.disActiviteList,
      preSaleActivityGoodsList,
      fulldecrActivityGoodsList:this.data.fulldecrActivityGoodsListlen > 0&&this.data.fulldecrActivityGoodsListlen < 4?fulldecrActivityGoodsList:this.data.fulldecrActivityGoodsList,
      buyOneGetOneActivityGoodsList,
      manyPriceActivityGoodsList,
      halfPriceActivityGoodsList,
      selectedGoodsList
    })
    this.submit = false;//防止重复提交
  },
  //查询云店分组列表
  getSmallClassList(){
    service.getSmallClassList({
      branchesId: this.data.groupBranchId,//拼团
      smallBranchesId: this.data.branchId,//云店
      userId: this.data.userId
    }).then((res)=>{
      if(res.data.result==200){
        let typedata=res.data.data;
        let groupClass="goods_typethree";//默认3个
        if(typedata.length>=5){
          if(typedata.length>5){
            this.setData({
              groupCount:4
            })
          }else{
            this.setData({
              groupCount:5
            })
          }
          groupClass="goods_typefive";
        }else if(typedata.length==4){
          groupClass="goods_typefour";
        }else if(typedata.length==3){
          groupClass="goods_typethree";
        }
        if(typedata.length){
          this.setData({
            classType: typedata,
            groupClass
          },()=>{})
        }
      }
    })
  },
  //查询云店活动列表
  queryCloudStoreActivite(){
    wx.showLoading({title:"加载中..."})
    service.queryCloudStoreActivite({
      branchesId:this.data.branchId
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        wx.stopPullDownRefresh();
        let data=res.data.data;
        if(data){
          //限时折扣
          let disActiviteList=data.discountActivityGoodsList;
          let disActiviteListClass="";//父级class
          let disActiviteListLen=disActiviteList.length;//精选商品的长度
          let disEndTime = disActiviteListLen>0?disActiviteList[0].endTime:"";//限时折扣活动结束时间
          let disActiviteCode = disActiviteListLen>0?disActiviteList[0].activityCode:"";//限时折扣活动的编码
          let result = [];
          if(disActiviteList.length==2){
            disActiviteListClass="discountList_two"; 
          }else if(disActiviteList.length==3){
            disActiviteListClass="discountList_three"; 
          }else if(disActiviteList.length>=4){//大于等于4需要处理
            for(let i=0;i<disActiviteList.length;i+=4) {
              result.push(disActiviteList.slice(i, i + 4));
            }
          }
          //好货预售
          let preSaleActivityGoodsList=data.preSaleActivityGoodsList;
          let preSaleActivityGoodsListClass="";//父级class
          let preSaleActivityGoodsListlen=preSaleActivityGoodsList.length;//好货预售商品长度
          if(preSaleActivityGoodsListlen==2){
            preSaleActivityGoodsListClass="goodspre_bottomtwo";
          }else if(preSaleActivityGoodsListlen==3){
            preSaleActivityGoodsListClass="goodspre_bottomthree";
          }else if(preSaleActivityGoodsListlen>=4){
            preSaleActivityGoodsListClass="goodspre_bottomfour";
          }
          //一起团
          let groupActivityGoodsList=data.groupActivityGoodsList;
          let groupActivityGoodsListClass="";//父级class
          let groupActivityGoodsListlen=groupActivityGoodsList.length;//好货预售商品长度
          if(groupActivityGoodsListlen==2){
            groupActivityGoodsListClass="activite_bottomtwo";
          }else if(groupActivityGoodsListlen==3){
            groupActivityGoodsListClass="activite_bottomthree";
          }else if(groupActivityGoodsListlen>=4){
            groupActivityGoodsListClass="activite_bottomfour";
          }
          //全场满减
          let fulldecrActivityGoodsList=data.fulldecrActivityGoodsList;
          let fulldecrActivityGoodsListClass="";
          let fulldecrActivityGoodsListlen=fulldecrActivityGoodsList.length;//全场满减商品长度
          let fulldecrCode = fulldecrActivityGoodsListlen>0?fulldecrActivityGoodsList[0].activityCode:"";//限时折扣活动的编码
          let result1 = [];
          if(fulldecrActivityGoodsList.length==2){
            fulldecrActivityGoodsListClass="discountList_two"; 
          }else if(fulldecrActivityGoodsList.length==3){
            fulldecrActivityGoodsListClass="discountList_three"; 
          }else if(fulldecrActivityGoodsList.length>=4){//大于等于4需要处理
            for(let i=0;i<fulldecrActivityGoodsList.length;i+=4) {
              result1.push(fulldecrActivityGoodsList.slice(i, i + 4));
            }
          }
          //买一送一
          let buyOneGetOneActivityGoodsList=data.buyOneGetOneActivityGoodsList;
          let buyOneGetOneActivityGoodsListClass="";//父级class
          let buyOneGetOneActivityGoodsListlen=buyOneGetOneActivityGoodsList.length;//买一送一商品长度
          if(buyOneGetOneActivityGoodsListlen==2){
            buyOneGetOneActivityGoodsListClass="buyone_bottomtwo";
          }else if(buyOneGetOneActivityGoodsListlen==3){
            buyOneGetOneActivityGoodsListClass="buyone_bottomthree";
          }else if(buyOneGetOneActivityGoodsListlen>=4){
            buyOneGetOneActivityGoodsListClass="buyone_bottomfour";
          }
          //多件多折
          let manyPriceActivityGoodsList=data.manyPriceActivityGoodsList;
          let manyPriceActivityGoodsListClass="";//父级class
          let manyPriceActivityGoodsListlen=manyPriceActivityGoodsList.length;//多件多折商品长度
          if(manyPriceActivityGoodsListlen==2){
            manyPriceActivityGoodsListClass="buyone_bottomtwo";
          }else if(manyPriceActivityGoodsListlen==3){
            manyPriceActivityGoodsListClass="buyone_bottomthree";
          }else if(manyPriceActivityGoodsListlen>=4){
            manyPriceActivityGoodsListClass="buyone_bottomfour";
          }
          //第二件半价
          let halfPriceActivityGoodsList=data.halfPriceActivityGoodsList;
          let halfPriceActivityGoodsListClass="";//父级class
          let halfPriceActivityGoodsListlen=halfPriceActivityGoodsList.length;//多件多折商品长度
          if(halfPriceActivityGoodsListlen==2){
            halfPriceActivityGoodsListClass="buyone_bottomtwo";
          }else if(halfPriceActivityGoodsListlen==3){
            halfPriceActivityGoodsListClass="buyone_bottomthree";
          }else if(halfPriceActivityGoodsListlen>=4){
            halfPriceActivityGoodsListClass="buyone_bottomfour";
          }
          //云店精选
          let selectedGoodsList=data.selectedGoodsList;
          this.setData({
            disActiviteList:result.length>0?result:disActiviteList,//限时折扣商品
            disActiviteListLen,//限时折扣列表长度
            disActiviteListClass,//限时折扣活动class
            preSaleActivityGoodsList:data.preSaleActivityGoodsList,//好货预售
            preSaleActivityGoodsListlen:preSaleActivityGoodsList.length,//好货预售列表长度
            preSaleActivityGoodsListClass,//好货预售活动class
            groupActivityGoodsList:data.groupActivityGoodsList,//一起团
            groupActivityGoodsListlen:groupActivityGoodsList.length,//一起团列表长度
            groupActivityGoodsListClass,//一起团活动class
            fulldecrActivityGoodsList:result1.length>0?result1:fulldecrActivityGoodsList,//全场满减商品
            fulldecrActivityGoodsListlen:fulldecrActivityGoodsListlen,//全场满减列表长度
            fulldecrActivityGoodsListClass,//全场满减class
            fullDecMoneyList:fulldecrActivityGoodsListlen>0?fulldecrActivityGoodsList[0].fullDecMoneyList:[],
            buyOneGetOneActivityGoodsList:data.buyOneGetOneActivityGoodsList,//买一送一商品
            buyOneGetOneActivityGoodsListlen:buyOneGetOneActivityGoodsList.length,//买一送一列表长度
            buyOneGetOneActivityGoodsListClass,//买一送一活动class
            manyPriceActivityGoodsList:data.manyPriceActivityGoodsList,//多件多折商品
            manyPriceActivityGoodsListlen:manyPriceActivityGoodsList.length,//多件多折列表长度
            manyPriceActivityGoodsListClass,//多件多折活动class
            halfPriceActivityGoodsList:data.halfPriceActivityGoodsList,//第二件半价商品
            halfPriceActivityGoodsListlen:halfPriceActivityGoodsList.length,//第二件半价列表长度
            halfPriceActivityGoodsListClass,//第二件半价活动
            selectedGoodsList:selectedGoodsList,//云店精选
            disActiviteCode:disActiviteCode,//限时折扣code
            preSaleCode:preSaleActivityGoodsList.length>0?preSaleActivityGoodsList[0].activityCode:'',//好货预售code
            groupActivityCode:groupActivityGoodsList.length>0?groupActivityGoodsList[0].activityCode:'',//一起团code
            fulldecrCode:fulldecrCode,//满减code
            buyOneGetOneCode:buyOneGetOneActivityGoodsList.length>0?buyOneGetOneActivityGoodsList[0].activityCode:'',//买一送一code
            halfPriceCode:halfPriceActivityGoodsList.length>0?halfPriceActivityGoodsList[0].activityCode:'',//第二件半价code
            manyPriceCode:manyPriceActivityGoodsList.length>0?manyPriceActivityGoodsList[0].activityCode:'',//多件多折code
            disEndTime:disEndTime,//限时折扣结束时间
            groupEndTime:groupActivityGoodsList.length>0?groupActivityGoodsList[0].endTime:'',//一起团结束时间
          },()=>{
            this.refreshShopping();
          })
          clearInterval(this.dis);
          if(disActiviteList.length>0){
            let disEndTime=disActiviteList[0].endTime;
            let endtime= (new Date(disEndTime.replace(/-/g,"/"))).getTime();
            if (endtime>0){
              let times = (endtime - (new Date()).getTime()) / 1000
              this.countdown(times,'dis');
            }else{
              this.countdown(0,'dis')
            }
          }
          clearInterval(this.group);
          if(groupActivityGoodsList.length>0){
            let groupEndTime=groupActivityGoodsList[0].endTime;
            let endtime= (new Date(groupEndTime.replace(/-/g,"/"))).getTime();
            if (endtime>0){
              let times = (endtime - (new Date()).getTime()) / 1000
              this.countdown(times,'group');
            }else{
              this.countdown(0,'group')
            }
          }
        }
      }else{
        this.refreshShopping();
      }
    }).catch(()=>{
      this.refreshShopping();
    })
  },
   //倒计时时间计算
  countdown(times,timer) {
    this[timer] = null;
    this[timer] = setInterval(() => {
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
      let countdownTime={
        day: day,
        hour: hour,
        minute: minute,
        second: second
      }
      if(timer=="dis"){//
        this.setData({
          disTime:countdownTime
        })
      }else{
        this.setData({
          groupTime:countdownTime
        })
      }
     
      if (times < 0) {
        clearInterval(this[timer]);
      }
    }, 1000);
  },
  //查看更多点击
  loadMoreShow(){
    this.setData({
      loadMore:this.data.selectedGoodsList.length,
      loadMoreShow:false,
    })
  },
  //点击商品跳转到商品的分类列表页面
  goGoodsDetail(e){
    let { goodsCode,activityCode}=e.currentTarget.dataset.goods;
    wx.navigateTo({
      url: '/pages/cloudStoreDetail/index?storeGoodsId=' + goodsCode + '&activityCode='+activityCode,
    })
  },
  //点击更多跳转列表页
  goCloudStore(e){
    let {groupcode,type}=e.currentTarget.dataset;//自定义属性
    if(!groupcode){
      groupcode="";
    }
    if(!type){
      type="";
    }
    wx.navigateTo({
      url: '/pages/cloudStore/index?groupCode='+groupcode+'&navtype='+type,
    })
  },
  //购物车数量的修改加或者减或者输入
  updateCar(e){
    let inpValue=e.detail.value;//购物车输入的数量
    let type =e.currentTarget.dataset.type;//类型 minus-购物车减少 add-购物车添加 input-购物车输入
    let goods =e.currentTarget.dataset.goods;//商品信息
    if(this.submit){
      return;
    }
    this.submit=true;
    wx.showLoading({
      title: '加载中',
    })
    let { goodsCode, branchesId, activityCode, goodsNum , cartCode } = goods;
    let shoppingNum=0;
    if(type=="add"){//加购物车
      shoppingNum = ++goodsNum;
    }else
    if(type=="minus"){//减购物车
      shoppingNum = --goodsNum;
    }else
    if(type=="input"){//购物车输入
      shoppingNum = inpValue;
    }
    if(shoppingNum>=1){
      service.addgoodnum({
        activityId:activityCode,
        branchesId: branchesId,
        userId: this.data.userId,
        goodsResource: 40,  //商品来源
        goodsCode: goodsCode,
        goodsNum: shoppingNum
      }).then(res => {
        wx.hideLoading();
        if (res.data.result == 200) {
          this.refreshShopping();//更新购物车列表
        }else{
          this.updatagood(this.data.shoppingData);//更新商品列表的购物车信息
          this.submit = false;//防止重复点击
          wx.showToast({
            title: res.data.message,
            icon:'none'
          })
        }
      }).catch(()=>{
        this.updatagood(this.data.shoppingData);//更新商品列表的购物车信息
        this.submit = false;//防止重复点击
      })
    }else{
      service.delshoppinggoods({
        cartCodes: [cartCode]
      }).then(res => {
        wx.hideLoading();
        if (res.data.result == 200) {
          this.refreshShopping();//更新购物车列表
        }else{
          this.updatagood(this.data.shoppingData);//更新商品列表的购物车信息
          this.submit = false;//防止重复点击
          wx.showToast({
            title: res.data.message,
            icon:'none'
          })
        }
      }).catch(()=>{
        this.updatagood(this.data.shoppingData);//更新商品列表的购物车信息
        this.submit = false;//防止重复点击
      })
    }
  },
  //input框冒泡
  stopinp(){},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      shareCloudStore:options.shareCloudStore?JSON.parse(options.shareCloudStore):null
    })
    if(options.shareCloudStore){//分享点击过来的门店直接切换到此门店
      changeCurrentCloudShop(options.shareCloudStore,1);
    }
    let t=this;
    //判断卡券显示几个
    wx.getSystemInfo({
      success (res) {
        let showIndex=1;
        if(res.windowWidth>=414){
          showIndex = 2;
        }
        t.setData({
          showIndex
        })
      }
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
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店选择的站点
    let presentAddress = wx.getStorageSync("presentAddress");//拼团选择的站点
    if(this.data.shareCloudStore){
      currentCloudShop = this.data.shareCloudStore;
    }
    if(this.data.branchId!=currentCloudShop.siteId){//说明切换了站点
      this.setData({
        branchId: currentCloudShop?currentCloudShop.siteId:'',    //云店站点id
        groupBranchId:presentAddress?presentAddress.siteId:'',    //拼团站点id
        userId: wx.getStorageSync('userId'),   //用户id
      },()=>{
        if(currentCloudShop){
          this.getCloudSetting();
          this.getcomm();//获取最新站点
          this.getSmallClassList();//查询云店分组商品
          this.queryCloudStoreActivite();//查询云店活动列表
        }
        if(wx.getStorageSync("userId")){
          this.queryCardList();
        }else{
          this.setData({showLogin:true});
        }
      })
    }else{
      if(currentCloudShop){
        this.getCloudSetting();
      }
      if(wx.getStorageSync("userId")){
        this.queryCardList();
        this.refreshShopping();
      }else{
        this.setData({showLogin:true});
      }
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
    let t=this;
    let currentCloudShop=wx.getStorageSync('currentCloudShop');
    if(currentCloudShop){
      this.getCloudSetting();
      this.getcomm();//获取最新站点
      this.getSmallClassList();//查询云店分组商品
      this.queryCloudStoreActivite();//云店活动列表
    }
    if(wx.getStorageSync("userId")){
      this.queryCardList();
    }else{
      this.setData({showLogin:true});
    }
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
    let shareCloundShop = {siteId:this.data.branchId};
    return {
      title:this.data.cloudStoreName+"-"+this.data.deliveryAddress,
      imageUrl:"https://img.goola.cn/mallImages/20210408/xJdZy5jsmWGJbSiw6ZTyJMCpnzAXHj3m.png",
      path: '/pages/cloudStoreHome/index?shareCloudStore='+JSON.stringify(shareCloundShop),
    }
  }
})