// pages/placeOrder/index.js
const service = require('../../service/index.js');
const util=require("../../utils/util.js")
import floatObj from '../../utils/floatObj.js'
import {getNum} from "../../utils/util";
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nextPagePickUp:false,//从购物车页面点击的自提还是配送 默认自提
    branchId:'', //拼团网点id
    cloudBranchId:'', //云店网点id
    imgUrl: app.globalData.imgUrl,
    phoneShow:true,  //手机授权
    topay:false,  //提交订单
    goodsList:[],    //拼团商品列表
    goodsunit: 0,  //商品共多少件
    groupmoney:0,   //拼团商品总额 元
    groupNum:0,    //拼团总计
    waterNum:0,   //水管家商品总额
    mealNum: 0, //套餐总额
    totalMoney:'0.00',//合计 元
    totalDiscount:0,//总优惠 元
    waterList:[], //水管家商品列表
    mealArr:[],  //套餐商品列表
    mealunit: 0,  //套餐件数
    userId:wx.getStorageSync('userId'), 
    discountCard: 0,//拼团优惠券信息 元
    noUse:false,  //不使用卡券
    kdisnum:null,   //可用张数
    communityName: '',   //社区名称----拼团
    takeAddress: '',   //取货地址-----拼团
    cloudArrivalTime:'',//预售活动的预计自提（到货）时间-云店
    cloudCommunityName: '',   //社区名称----云店
    cloudTakeAddress: '',   //取货地址-----云店
    newclaimTime:'',  //到货时间
    orderInfor:{
      claimTime: '',  //预计取货时间--按最晚
      pickupPerson: '',  //取货人
      personTel: '',   //取货人电话
      cloudpickupPerson: '',  //取货人
      cloudpersonTel: '',   //取货人电话
      cardxin:null,   //卡券信息 
      discountNum: 0, //拼团优惠金额 元
      discountCloudNum: 0, //云店优惠金额 元
      fullAcMoney:0, //满减活动减少金额 元
      secondHalfPrice:0,//第二件半价减少金额 元
      manyMorePrice:0,//多件多折减少的金额 元
      cardCloud:null,  //云店卡券code
      waterTotalMoney:0, //水商品总额 元
      mealTotalMoney:0,//水套餐商品总额 元
      groupTotalMoney:0,//拼团商品总额 元
      ecTotalMoney:0,//电商商品总额 元
      cloudTotalMoney:0,//云店商品总额 元
      totalNum: 0,  //合计 元
      smTabInd:'',  //云店自提\配送
      postage:0,  //配送费用
      striping:false, // 是否满足金额免配送费
    },
    noRemind:false,   //水桶押金下次不再提醒
    remindMask:true,  //水桶押金弹窗
    deliveryTime:false, //配送时间选择弹框
    wOrderName:'',  //水管家收货人
    wOrderTel: '',  //水管家收货人电话
    wOrderAddress:'',  //水管家收货人地址
    businessTime: [],  //配送时间
    operateWeek:[],   //营业时间
    wticket:0,  //水票抵扣数量
    waterticketTime:'尽快送达',  //水票配送时间
    waterticketData:{},  //水票使用
    waterticketDataBranchid:null, //水票网点id
    waterticketnum:1,  //水票数量
    waterticketRes:0,  //剩余水票
    waterticketinp:'', //水票留言
    waterStoreId:'',   //水站网点id
    orderCode:'',   //订单code
    type:'',   //跳转来源   我的水票=1  其他(拼团 水 云店 商城)=3
    payGroupCode: '',  //支付分组编码
    eCShopData:[], //电商数据
    ecunit:0,   //电商件数
    ecMoney:0,  //电商商品总额 元
    ecDisMoney:0, //电商运费总额 元
    smTabInd:'', //自提1  配送2  
    submitTrue:true, //允许提交
    cloudData:[], //云店数据
    clMoney:0,  //云店总额
    clunit:0,   //云店件数
    distance:true,  //是否在配送范围内
    dispatch:{},   //配送信息
    currKm:0,  //当前位置距离门店位置 m
    postage:0,  //配送费用
    striping:false, // 是否满足金额免配送费
    dispatchdata:{},  //配送信息
    satm:0,  //满足金额
    satr:0,  //满足距离
    consessArr:[], //订单云点非活动商品
    offcomGoodMoney:0, //未参与活动商品总价
    disCloudNum:0,  //云点可用优惠券数量
    checkdis:false, //云点选择卡券状态
    choosediscard:null, //云点选择卡券信息
    consupMoney:0,  //云店优惠金额 分
    fullAcMoney:0,  //满减活动所减金额
    secondHalfPrice:0,//第二件半价减少金额 元
    manyPriManyFoldsListStr:"",//多件多折活动折扣设置
    manyMorePrice:0,//多件多折减少的金额 元
    needPickUpTime:false,//是否需要选择自提时间 （如果全部是预售活动则不需要选择自提时间）
    showPickUpTime:false, //自提时间选择弹框--指尖云店自提订单
    smallTakeTime:null,//设置的自提时间段 以及备货时间--指尖云店自提订单
    smallTakeWeek:[],//设置的自提时间周--指尖云店自提订单
    pickUpTime:null,//所选的自提时间--指尖云店自提订单
    showCloudDeliveryTime:false,//配送时间选择弹框--指尖云店配送订单
    cloudDeliveryTime:null,//计算的可选的配送时间列表--指尖云店配送订单
    selectCloudDeliveryTime:null//所选的配送时间--指尖云店配送订单
  },
  //获取云店信息
  getCloudBranchInfo(){
    if(!this.data.cloudBranchId){//没有云店ID直接返回
      return;
    }
    service.getnewcommunity({
      branchId: this.data.cloudBranchId
    }).then(res => {
      if (res.data.result == 200) {
        let data = res.data.data;
        this.setData({
          cloudCommunityName: data?data.siteName:'',   //社区名称
          cloudTakeAddress:data?data.deliveryAddress:'',//取h地址
        })
      }
    })
  },
  //有弹窗时禁止底部的滚动
  catchtouchmove(){
    return false;
  },
  //水管家去首页
  goWaterHome(){
    wx.redirectTo({
      url:'/pages/water/index'
    })
  },
  //内容符合才允许提交订单
  conChange(){ 
    let judge1=true
    let judge2=true
    let judge3=true
    let judge4=true
    if(this.data.goodsList.length>0){ //拼团
      if(this.data.orderInfor.pickupPerson&&this.data.orderInfor.personTel){
        judge1=true
      }else{
        judge1=false
      }
    }
    if(this.data.cloudData.length>0&&this.data.smTabInd==1){ //云店自提
      if(this.data.needPickUpTime){//需要展示选择自提时间的入口时
        if(this.data.orderInfor.cloudpickupPerson&&this.data.orderInfor.cloudpersonTel&&this.data.pickUpTime){
          judge4=true
        }else{
          judge4=false
        }
      }else{
        if(this.data.orderInfor.cloudpickupPerson&&this.data.orderInfor.cloudpersonTel){
          judge4=true
        }else{
          judge4=false
        }
      }
    }
    if(this.data.waterList.length<1&&(this.data.cloudData.length>0&&this.data.smTabInd==2||this.data.eCShopData.length>0)){   //没有水 只有商城和云店
      let waterXin = wx.getStorageSync('isaddress')
      let isdefault = wx.getStorageSync('isdefault')
      if(waterXin||isdefault){
        judge2=true
      }else{
        judge2=false
      }
    }
    if(this.data.cloudData.length>0&&this.data.smTabInd==2){// 云店配送 判断是否在配送范围
      if(this.data.needPickUpTime){//需要展示选择配送时间的入口时
        if(this.data.distance&&this.data.cloudDeliveryTime){//云店配送时间
          judge3=true
        }else{
          judge3=false
        }
      }else{
        if(this.data.distance){
          judge3=true
        }else{
          judge3=false
        }
      }
    }
    if(judge1&&judge2&&judge3&&judge4){
      this.setData({
        submitTrue:true
      })
    }else{
      this.setData({
        submitTrue:false
      })
    }
  },
  //云店自提
  pickUp(){
    this.setData({
      smTabInd:1,
      ['orderInfor.smTabInd']:1
    },()=>{
      this.conChange()
      this.totalMoney()
    })
  },
  //打开云店自提弹窗
  getPickUpTime(){
    this.setData({
      showPickUpTime:true
    })
  },
  //取消云店自提的弹窗
  pickUpCancel(){
    this.setData({
      showPickUpTime:false
    })
  },
  //云店自提时间保存
  pickUpSave(e){
    //设置自提时间
    this.setData({
      showPickUpTime:false,
      pickUpTime:e.detail.selectTimes
    },()=>{
      console.log(e.detail.selectTimes);
      this.conChange()
    })
  },
  //云店配送
  courier(){
    let week = this.data.dispatchdata.smallOperateWeek.split(',');//配送的运营时间
    let weekTime = false;
    for(let i=0;i<week.length;i++){
      if(week[i]==1){
        weekTime = true;
        break;
      }
    }
    if(!weekTime){   //判断是否一周都没有运营时间
      wx.showToast({
        title: '商家已打烊，暂时无法配送，可选择商家自提',
        icon: 'none',
        duration:1800
      })
      return;
    }
    this.setData({
      smTabInd:2,
      ['orderInfor.smTabInd']:2
    },()=>{
      this.conChange()
      this.totalMoney()
    })
  },
  //打开云店配送弹窗
  getCloudDeliveryTime(){
    this.setData({
      showCloudDeliveryTime:true
    })
  },
  //取消云店配送的弹窗
  cloudDeliveryCancel(){
    this.setData({
      showCloudDeliveryTime:false
    })
  },
  //云店配送时间保存
  cloudDeliverySave(e){
    //设置配送时间
    let selectCloudDeliveryTime = e.detail.selectTimes;
    selectCloudDeliveryTime.defaultTime = false;
    this.setData({
      showCloudDeliveryTime:false,
      selectCloudDeliveryTime
    },()=>{
      console.log(e.detail.selectTimes);
      this.conChange()
    })
  },
  goAddress(){
    wx.navigateTo({
			url: '/pages/waterAddress/index?ecChoose=nodel',
		})
  },
	//电商选择地址
	ecAddressChoose(){
		wx.navigateTo({
			url: '/pages/waterAddress/index?ecChoose=nodel',
		})
	},
  //卖家留言
  leaveinp(e){
    let inpValue=e.detail.value
    let leaveinp = e.currentTarget.dataset.leaveinp
    let newdata = this.data.waterList.map(item => {
      if (item.waterStoreId == leaveinp) {
        item.leaveinp=inpValue
      }
      return item
    })
    this.setData({
      waterList: newdata
    })
  },
  //水管家配送返回
  deliverysure(e){
    let data=e.detail
    let month=util.formatHen(data.month.ltime).slice(0,10)
    let time = data.datime
    if(this.data.type==3){//跳转来源   其他(拼团 水 云店 商城)=3
      let newdata = this.data.waterList.map(item=>{
        if (item.waterStoreId == this.data.waterStoreId){
          item.deliverytime = typeof time == 'number' ? `${month} ${time}:00` : '尽快送达'
        }
        return item
      })
      this.setData({
        waterList: newdata
      })
    }
    if(this.data.type==1){//跳转来源   我的水票=1
      this.setData({
        waterticketTime: typeof time == 'number' ? `${month} ${time}:00` : '尽快送达'
      })
    }
  },
  //水管家配送取消
  deliverycancel(){
    this.setData({
      deliveryTime: false
    })
  },
  //水管家配送时间选择
  deliveryTime(e){
    if(this.data.type==3){
      let waterid = e.currentTarget.dataset.waterid
      this.setData({
        deliveryTime: true,
        waterStoreId: waterid
      }, () => {
        this.getWaterTicket()
      })
    }
    if(this.data.type==1){
      this.setData({
        deliveryTime: true,
      })
    }
  },
  //提醒点击确定
  hintSure(){
    this.setData({
      remindMask:false
      
    })
    if (this.data.noRemind) {
      wx.setStorageSync('noremind', 'noremind')
    } else {
      wx.setStorageSync('noremind', '')
    }
  },
  //水桶押金点击下次不再提醒
  noRemind(){
    this.setData({
      noRemind:!this.data.noRemind
    })
  },
  //拼团取货人
  pickPer(e){
    this.setData({
      ['orderInfor.pickupPerson']:e.detail.value,
    },()=>{
      this.conChange()
    })
  },
  //云店取货人
  cloudpickPer(e){
    this.setData({
      ['orderInfor.cloudpickupPerson']:e.detail.value,
    },()=>{
      this.conChange()
    })
  },
  //拼团取货人手机号
  pickTel(e) {
    let tel=e.detail.value
    if(tel&&tel[0]!='1'){
      tel=''
    }
    this.setData({
      ['orderInfor.personTel']: tel
    },()=>{
      this.conChange()
    })
  },
  //云店取货人手机号
  cloudpickTel(e) {
    let tel=e.detail.value
    if(tel&&tel[0]!='1'){
      tel=''
    }
    this.setData({
      ['orderInfor.cloudpersonTel']: tel
    },()=>{
      this.conChange()
    })
  },
  //关闭授权手机
  cancel(){
    this.setData({
      phoneShow:false
    })
    //场景 没有授权但有上次记录手机号，则使用上次手机号
    if (wx.getStorageSync('consignee')&& !wx.getStorageSync('phone')) {
      this.setData({
        ['orderInfor.personTel']: wx.getStorageSync('consignee') ? wx.getStorageSync('consignee').putTel : '',
        ['orderInfor.cloudpersonTel']: wx.getStorageSync('consignee') ? wx.getStorageSync('consignee').putTel1 : ''
      },()=>{
        this.conChange()
      })
    }
  },
  //确认授权手机
  getphone(e){
    this.setData({  //组件中判断是否存在上次记录，没有的话点击授权为授权手机号，相反为上次记录手机号
      ['orderInfor.personTel']: e.detail.phone,
      ['orderInfor.cloudpersonTel']: e.detail.cloudPhone
    },()=>{
      this.conChange()
    })
  },
  //确定提交订单按钮
  subOrder(){
    let t=this;
    if(!this.data.distance&&this.data.smTabInd==2){
      wx.showToast({
        title: '云店商品不在配送范围内，请重新选择送货方式',
        icon: 'none'
      })
      return
    }
    if(this.data.goodsList.length>0&&(!util.isGbOrEn(this.data.orderInfor.pickupPerson)||!this.data.orderInfor.pickupPerson)){
      wx.showToast({
        title: '收货人姓名不能为空，且只能为汉字和字母',
        icon: 'none'
      })
      return
    }
    if(this.data.cloudData.length>0&&this.data.smTabInd==1&&(!util.isGbOrEn(this.data.orderInfor.cloudpickupPerson)||!this.data.orderInfor.cloudpickupPerson)){
      wx.showToast({
        title: '收货人姓名不能为空，且只能为汉字和字母',
        icon: 'none'
      })
      return
    }
    if(this.data.goodsList.length>0 && !this.data.orderInfor.personTel){
      wx.showToast({
        title: '请填写"拼团"收货人手机号',
        icon: 'none'
      })
      return
    }
    if(this.data.cloudData.length>0 && !this.data.orderInfor.cloudpersonTel && this.data.smTabInd==1){
      wx.showToast({
        title: '请填写"云店"收货人手机号',
        icon: 'none'
      })
      return
    }
    if (this.data.goodsList.length>0 && this.data.orderInfor.personTel.length!=11){
      wx.showToast({
        title: '"拼团"收货人联系方式错误',
        icon: 'none'
      })
      return
    }
    if (this.data.cloudData.length>0 && this.data.orderInfor.cloudpersonTel.length!=11 && this.data.smTabInd==1){
      wx.showToast({
        title: '"云店"收货人联系方式错误',
        icon: 'none'
      })
      return
    }
    if (this.data.needPickUpTime&&!this.data.pickUpTime &&this.data.cloudData.length>0&&this.data.smTabInd==1){
      wx.showToast({
        title: '请选择云店自提时间',
        icon: 'none'
      })
      return
    }
    if (this.data.needPickUpTime&&!this.data.selectCloudDeliveryTime &&this.data.cloudData.length>0&&this.data.smTabInd==2){
      wx.showToast({
        title: '请选择云店配送时间',
        icon: 'none'
      })
      return
    }
    if(!this.data.submitTrue){   //提交按钮置灰不可提交
      return
    }
    if (this.data.goodsList.length > 0 && this.data.groupNum * 1 <= 0){  //防止总计和总额为0提交订单
      return
    }
    if (this.data.type==3 && this.data.goodsList.length < 1 && this.data.waterList.length<1&&this.data.mealArr.length<1 && this.data.eCShopData.length<1&&this.data.cloudData.length<1)    {
      return
    }  //防止无商品提交订单 
    //todo 不再需要弹出自提确认弹窗
    wx.showLoading({title:"加载中"});
    service.cloudStoredispatch({
      branchesId:this.data.cloudBranchId
    }).then(res=>{
      if(res.data.result==200){
        let data=res.data.data;
        if(this.data.smTabInd==1&&data.smallDeliveryStatus==20){//选择门店自提，但是配置关闭了门店自提
          wx.showToast({
            title: '商家已打烊，暂时无法自提，可选择商家配送',
            icon: 'none'
          })
          return
        }
        if(this.data.smTabInd==2&&data.smallDeliveryStatus==10){//选择门店配送，但是配置关闭了门店配送
          wx.showToast({
            title: '商家已打烊，暂时无法配送，可选择商家配送',
            icon: 'none'
          })
          return
        }
        //获取订阅消息模板Id
        service.getGroupTemplateId({
          templateFlag:1
        }).then((res)=>{
          wx.hideLoading();
          if(res.data.result==200){
            let tmpId=res.data.data.templateId;
            service.requestSubscribeMessage({
              tmplIds:tmpId,
            }).then((res)=>{
              t.orderSubmit();
            });
          }
        });
      }else{   //防止接口报错
        //获取订阅消息模板Id
        service.getGroupTemplateId({
          templateFlag:1
        }).then((res)=>{
          wx.hideLoading();
          if(res.data.result==200){
            let tmpId=res.data.data.templateId;
            service.requestSubscribeMessage({
              tmplIds:tmpId,
            }).then((res)=>{
              t.orderSubmit();
            });
          }
        });
      }
    })
  },
  //订单支付
  orderSubmit(){
    let t = this;
    if (this.onClick) {
      return;
    }
    wx.showLoading({
      mask: true,
      title: '加载中...',
    });
    this.onClick = true;
    let arr = []
    let waterdata = []
    if(this.data.type==3){
      this.data.waterList.forEach(item => {
        item.skuInfos.forEach(val => {
          val.deliverytime = item.deliverytime
          val.leaveinp = item.leaveinp
          val.goodsResource = val.goodsSource
          val.branchesId=item.branchesId
          waterdata.push(val)
        })
      })
      let newdata = [...this.data.goodsList,...waterdata, ...this.data.eCShopData,...this.data.cloudData,...this.data.mealArr]
      newdata.forEach(item => {
        let activityId="";
        if(item.activityId){
          if(item.type==90&&item.groupMethod){//多人拼团活动并且是拼团购买或者参团购买
            activityId = item.activityId;
          }
          if(item.type!=90){//其他活动
            activityId = item.activityId;
          }
        }
        let list = {
          activityId: activityId,//活动ID
          branchesId: item.branchesId,
          cartCode: item.cartCode ? item.cartCode : null,
          goodsCode: item.goodsCode,
          goodsNum: item.goodsNum ? item.goodsNum : item.goodsCount,
          goodsResource: item.goodsResource,
          groupCode:item.groupCode?item.groupCode:null,//拼团编码
          groupMethod:item.groupMethod?item.groupMethod:null,//1开团，2拼团
          sendTime: item.deliverytime != '尽快送达'&&item.deliverytime ? `${item.deliverytime}:00.000` : null,
          ticketNum: item.ticketCount,
          buyerMessage: item.leaveinp?item.leaveinp:null,
        }
        arr.push(list)
      })
    }
    if(this.data.type==1){
      let list = {
        branchesId: this.data.waterticketDataBranchid,
        goodsCode: this.data.waterticketData.skuCode,
        goodsResource: 20,
        goodsNum: this.data.waterticketnum,
        sendTime: this.data.waterticketTime != '尽快送达' ? `${this.data.waterticketTime}:00.000` : null,
        ticketNum: this.data.waterticketnum,
        buyerMessage: this.data.waterticketinp ? this.data.waterticketinp:null,
      }
      arr.push(list)
    }
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点
    let waterXin = wx.getStorageSync('isaddress');
    let isdefault = wx.getStorageSync('isdefault');
    let groupOrderName=this.data.orderInfor.pickupPerson;  //拼团订单取货人
    let groupOrderPhone=this.data.orderInfor.personTel;   //拼团取货人手机号
    let cloudOrderName=this.data.orderInfor.cloudpickupPerson;   //云店订单取货人
    let cloudOrderPhone=this.data.orderInfor.cloudpersonTel;    //云店取货人手机号
    let pickUpTime = this.data.pickUpTime;//云店选择的自提时间
    let smallEstimateReceiveTime = pickUpTime?pickUpTime.dates+" "+pickUpTime.hour+":"+pickUpTime.minute+":00":"";//自提时间拼接
    let selectCloudDeliveryTime = this.data.selectCloudDeliveryTime;//云店选择的配送时间
    let estimateDeliveryStartTime = selectCloudDeliveryTime?selectCloudDeliveryTime.date+" "+selectCloudDeliveryTime.startTime:'';//云店选择的配送开始时间
    let estimateDeliveryEndTime = selectCloudDeliveryTime?selectCloudDeliveryTime.date+" "+selectCloudDeliveryTime.endTime:'';//云店选择的配送开始时间
    service.createorder({
      branchesAddress: presentAddress?presentAddress.deliveryAddress:'',
      branchesId: presentAddress?presentAddress.siteId:'',
      smallBranchesId:currentCloudShop?currentCloudShop.siteId:'',
      cardCode: this.data.orderInfor.cardxin ? this.data.orderInfor.cardxin.cardCode:null,
      cardOrderId: this.data.orderInfor.cardxin ? this.data.orderInfor.cardxin.cardOrderId:null,
      cartInfos:arr,
      discountAmount: this.data.orderInfor.cardxin ? floatObj.multiply(this.data.orderInfor.cardxin.discountAmount,100):null,
      estimateReceiveTime: this.data.orderInfor.claimTime?this.data.orderInfor.claimTime+'':'',//拼团自提时间
      mecName: presentAddress?presentAddress.siteName:'',
      receiverName: groupOrderName?groupOrderName:null,
      receiverPhone: groupOrderPhone?groupOrderPhone:null,
      smallReceiverName: cloudOrderName?cloudOrderName:null,
      smallReceiverPhone: cloudOrderPhone?cloudOrderPhone:null,
      userId: wx.getStorageSync('userId'),
      orderPrice:floatObj.multiply(this.data.totalMoney,100),
      receiveAddressId:waterXin?waterXin.addId:isdefault?isdefault.addId:'',
      smallDelivery:this.data.smTabInd==1?'20':this.data.smTabInd==2?'10':null,
      smallCardCode:this.data.orderInfor.cardCloud,
      smallEstimateReceiveTime:this.data.smTabInd==1?smallEstimateReceiveTime:"",//云店自提时间
      estimateDeliveryStartTime:this.data.smTabInd==2&&this.data.needPickUpTime?estimateDeliveryStartTime:"",//云店配送开始时间
      estimateDeliveryEndTime:this.data.smTabInd==2&&this.data.needPickUpTime?estimateDeliveryEndTime:""//云店配送结束时间
    }).then(res => {
      if (res.data.result == 200) {
        wx.removeStorageSync('cloudiscount');
        let consignee = { 
          putName: this.data.orderInfor.pickupPerson,
          putTel: this.data.orderInfor.personTel,
          putName1: this.data.orderInfor.cloudpickupPerson,
          putTel1: this.data.orderInfor.cloudpersonTel
        }
        wx.setStorageSync('consignee', consignee)
        this.setData({
          orderCode: res.data.data.orderCode,
          payGroupCode: res.data.data.payGroupCode
        }, () => {
          let toPay = res.data.data.toPay
          if (toPay==0){
            wx.hideLoading();
            wx.showToast({
              title: '支付成功！',
              icon: 'none'
            })
            wx.redirectTo({
              url: '../../pages/shoppingPaySucceed/paySucceed?totalMoney=' + this.data.totalMoney,
            })
            return
          }
          service.payMyOrder({
            openId: wx.getStorageSync("openId"),
            userId: wx.getStorageSync("userId"),
            orderCodes: this.data.orderCode
          }).then((res) => {
            t.onClick = false;
            if (res.data.result == 200) {
              service.wxPay(res.data.data).then(() => {
                wx.showToast({
                  title: '支付成功！',
                  icon: 'none',
                  duration: 1000
                });
                wx.redirectTo({
                  url: '../../pages/shoppingPaySucceed/paySucceed?totalMoney=' + this.data.totalMoney,
                })
              }).catch((d) => {
                t.onClick = false;
                wx.hideLoading();
                wx.showModal({
                  title: '温馨提示',
                  showCancel: false,
                  content: '未支付订单将在30分钟内取消，请尽快完成支付~',
                  success: (res) => {
                    if (res.confirm) {
                      wx.redirectTo({
                        url: '../../pages/personalOrderDetail/index?orderCode=' + this.data.orderCode + '&payGroupCode=' + this.data.payGroupCode+'&orderStatus=10' ,
                      })
                    }
                  }
                });
              })
            } else {
              t.onClick = false;
              wx.hideLoading();
              wx.showToast({
                title: res.data.message,
                icon: 'none'
              })
            }
          }).catch(() => { 
            t.onClick = false; 
          }) 
        })
      } else {
        t.onClick = false;
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    }).catch(() => { 
      t.onClick = false; 
      wx.showToast({ 
        title: '当前网络状态较差，请稍后重试', 
        icon: 'none' 
      }) 
    }) 
  },
  //取消订单
  changeMask(e){
    this.setData({
      topay:false
    })
  },
  //拼团选择优惠券
  special(){
    let arr = []
    this.data.goodsList.forEach(item => {
      let list = {
        activityId: item.activityId,
        goodsCode: item.goodsCode,
        goodsNum: item.goodsNum,
        goodsResource: item.goodsResource
      }
      arr.push(list)
    })
    wx.navigateTo({
      url: '/pages/shoppingDiscount/index?cartCode=' + JSON.stringify(arr),
    })
  },
  //云店选择优惠券
  cloudCheckSpecial(){
    wx.navigateTo({
	   url: '/pages/shoppingDiscountCloud/index?cartCode=' + JSON.stringify(this.data.consessArr)+ '&offcomGoodMoney=' + this.data.offcomGoodMoney,
    })
  },
  //获取最优的卡券
  getbestCoupon(){
    let arr = []
    this.data.goodsList.forEach(item => {
      let list = {
        activityId: item.activityId,
        goodsCode: item.goodsCode,
        goodsNum: item.goodsNum,
        goodsResource: item.goodsResource
      }
      arr.push(list)
      
    })
    service.getbestcoupon({
      skuInfoDtos: arr,
      userId: this.data.userId
    }).then(res=>{
      if(res.data.result==200){
        let data = res.data.data
        if(data){
          data.discountAmount = getNum(floatObj.divide(data.discountAmount, 100))
        let storage=wx.getStorageSync('discount')
        if(storage){        //本地有存储就取存储的值
          if (storage == '不使用') {
            this.setData({
              noUse: true,
              ['orderInfor.cardxin']: null,
              discountCard:0,
              ['orderInfor.discountNum']: 0,
              totalDiscount:0,//总优惠
            },()=>{
              this.getHj()
            })
          } else {
            if (storage.discountAmount) {
            this.setData({
              noUse: false,
              ['orderInfor.cardxin']:storage,
              discountCard: storage.discountAmount,
              ['orderInfor.discountNum']: storage.discountAmount,
            },()=>{
              this.getHj()
            })
            }
          }
        } else {   //相反取最优的卡券
          this.setData({
            ['orderInfor.cardxin']:data,
            discountCard:data.discountAmount,
            ['orderInfor.discountNum']: data.discountAmount,
          },()=>{
            this.getHj()
          })
        }
        }
      }
    })
  },
  //获取可用卡券张数
  getDiscountList() {
    let arr=[]
    this.data.goodsList.forEach(item => {
      let list={
        activityId: item.activityId,
        goodsCode: item.goodsCode,
        goodsNum: item.goodsNum,
        goodsResource: item.goodsResource
      }
      arr.push(list)
    })
    service.getcoupon({
      skuInfoDtos: arr,
      userCode: this.data.userId
    }).then(res => {
      if (res.data.result == 200) {
        let list=[]
        list= res.data.data
        if(list.length>0){
          this.setData({
            kdisnum:list.length
          })
        }else{
          this.setData({
            kdisnum:0
          })
        }
      }
    })
  },
  //套餐详情
  mealDetail(e) {
    let meals = e.currentTarget.dataset.meals
    let newdata = this.data.mealArr.map(item => {
      if (item.skuId == meals) {
        item.detailshow = !item.detailshow
      }
      return item
    })
    this.setData({
      mealArr: newdata
    })
  },
  //获取配送时间  
  getWaterTicket(){
    service.getdispatchingtime({
      platform: "wx",
      requestCode: 4002,
      params: JSON.stringify({
        waterstoreId: this.data.waterStoreId,
      })
    }).then(res=>{
      if(res.data.result==0){
        let startTime = parseInt(res.data.data.operateStartTime.split(":00")[0], 10);
        let endTime = parseInt(res.data.data.operateEndTime.split(":00")[0], 10);
        let businessTime = [];
        for (let i = startTime; i <= endTime; i++) {
          businessTime.push(i);
        }
        let operateWeek = res.data.data.operateWeek
        let oper=operateWeek.every(item=>item==0)
        if(oper){
          wx.showToast({
            title: `该水站不支持自定义配送时间，水站将尽快为您送达~`,
            icon: 'none'
          })
          return
        }
        this.setData({
          businessTime: businessTime,
          operateWeek: operateWeek
        })
      }
    })
  },
  //获取水管家订单商品整合
  getWaterOrderList(waterArr){
    if(waterArr.length>0){
      let newarr=[]
      waterArr.forEach(item=>{
        let list={
          branchesId: item.branchesId,
          cartCode: item.cartCode,
          goodsCode: item.goodsCode,
          goodsCount: item.goodsNum,
          goodsPic: item.goodsPic,
          grouponPrice: item.grouponPrice,
          storeGoodsName: item.storeGoodsName,
          storeGoodsSpecification: item.storeGoodsSpecification,
          userId: wx.getStorageSync('userId')
        }
        newarr.push(list)
      })
      service.getwaterorderlist({
        orderInfoReqDtos:newarr
      }).then(res=>{
        if(res.data.result==200){
          let data = res.data.data.storeAndSkuInfos
          let wticket=0
          data.forEach(item=>{
            item.goodsPriceSum = getNum(floatObj.divide(item.goodsPriceSum,100))
            let ticketCount=0  //单个商品总价
            let goodnum=0  //商品件数
            item.skuInfos.forEach(val=>{
              val.goodSum = getNum(floatObj.divide(floatObj.multiply(val.grouponPrice, val.goodsCount),100))
              val.grouponPrice = getNum(floatObj.divide(val.grouponPrice,100))
              ticketCount += val.ticketCount
              goodnum += val.goodsCount
            })
            item.ticketCount = ticketCount
            item.goodnum=goodnum
            item.deliverytime='尽快送达'
            wticket+=item.ticketCount
            item.leaveinp=''
          })
          this.setData({
            waterNum: res.data.data.orderPrice, //水管家商品金额 分
            ['orderInfor.waterTotalMoney']:floatObj.divide(res.data.data.orderPrice,100), //水管家商品金额 分转元
            waterList: data,
            wticket: wticket,
          },()=>{
            this.totalMoney()
            
          })
        }
      })
    }
  },
  //配送距离
  getCloudDistance(){
    if(this.smTabInd==2){
      wx.showLoading({
        mask: true,
        title: '请稍后...',
      });
    }
    service.cloudStoredistance({
      address: this.data.wOrderAddress,
      branchesId: this.data.cloudBranchId
    }).then(res=>{
      wx.hideLoading();
      console.log('距离',res)
      if(res.data.result==200){
        this.setData({
          distance:res.data.data.isExceed,//是否超出配送范围
          currKm:res.data.data.distance //单位m
        },()=>{
          let cloudDeliveryTime=util.getCloudDeliveryTime({
            smallOperateWeek:this.data.dispatchdata.smallOperateWeek,//配送工作日 '1,0,1,0,1,0,1'
            smallOperateTime:this.data.dispatchdata.smallOperateTime,//设置的配送时间段
            smallDelStockTime:this.data.dispatchdata.smallDeliveryStockTime,//配送订单备货时间
            smallKmDelTime:this.data.dispatchdata.smallDeliveryTime,//1公里配送时长
            distance:this.data.currKm,//距当前下单地点的距离 m
          });
          this.setData({
            cloudDeliveryTime,
            selectCloudDeliveryTime:{//所选的配送时间--指尖云店配送订单
              defaultTime:true,//没有选择 默认选一个
              date:cloudDeliveryTime[0].ldates,//"2021-01-18"
              startTime:cloudDeliveryTime[0].timeList.length>0?cloudDeliveryTime[0].timeList[0].startTime:'',//"12:00"
              endTime:cloudDeliveryTime[0].timeList.length>0?cloudDeliveryTime[0].timeList[0].endTime:'',//"12:30"
              today:cloudDeliveryTime[0].today,//true or false
              week:cloudDeliveryTime[0].lweekChina//"周一"
            }
          },()=>{
            this.conChange()
          });
          this.totalMoney()
        })
      }
    }).catch(()=>{//获取距离失败时
      wx.hideLoading();
      let cloudDeliveryTime=util.getCloudDeliveryTime({
        smallOperateWeek:this.data.dispatchdata.smallOperateWeek,//配送工作日 '1,0,1,0,1,0,1'
        smallOperateTime:this.data.dispatchdata.smallOperateTime,//设置的配送时间段
        smallDelStockTime:this.data.dispatchdata.smallDeliveryStockTime,//配送订单备货时间
        smallKmDelTime:this.data.dispatchdata.smallDeliveryTime,//1公里配送时长
        distance:0,//距当前下单地点的距离 m
      });
      this.setData({
        cloudDeliveryTime,
        selectCloudDeliveryTime:{//所选的配送时间--指尖云店配送订单
          defaultTime:true,//没有选择 默认选一个
          date:cloudDeliveryTime[0].ldates,//"2021-01-18"
          startTime:cloudDeliveryTime[0].timeList[0].startTime,//"12:00"
          endTime:cloudDeliveryTime[0].timeList[0].endTime,//"12:30"
          today:cloudDeliveryTime[0].today,//true or false
          week:cloudDeliveryTime[0].lweekChina//"周一"
        }
      },()=>{
        this.conChange()
      });
    })
  },
  //获取云店配置信息
  getColudDispatch(){
    service.cloudStoredispatch({
      branchesId:this.data.cloudBranchId
    }).then(res=>{
      if(res.data.result==200){
        let data=res.data.data;
        let smallTakeTime={
          startTime:data.smallTakeTime?JSON.parse(data.smallTakeTime).startTime:"",//自提开始时间
          endTime:data.smallTakeTime?JSON.parse(data.smallTakeTime).endTime:"",//自提结束时间
          smallStockTime:data.smallStockTime,//备货时间
        };
        this.setData({
          dispatchdata:data,
          smallTakeTime,
          smallTakeWeek:data.smallTakeWeek?data.smallTakeWeek.split(','):[]
        })
        if(data.smallDeliveryStatus==20 || !this.data.nextPagePickUp){//默认只有配送方式 或者有自提和配送在购物车页面点击切换到配送方式
          this.setData({
            smTabInd:2,
            ['orderInfor.smTabInd']:2
          },()=>{
            this.conChange()
          })
        }else{
          if(this.data.smTabInd!=2){
            this.setData({
              smTabInd:1,
              ['orderInfor.smTabInd']:1
            },()=>{
              this.conChange()
            })
          }
        }
        data.freeShipping=getNum(data.freeShipping/100)
        this.setData({
          dispatch:data
        },()=>{
          this.getCloudDistance()
        })
      }else{   //防止接口报错 默认为自提
        this.setData({
          smTabInd:1,
          ['orderInfor.smTabInd']:1
        },()=>{
          this.conChange()
        })
      }
    })
  },
  //获取指尖商城配送费
  getMallDisMoney(){
    let waterXin = wx.getStorageSync('isaddress');
    let isdefault = wx.getStorageSync('isdefault');
    let areaName = "";
    if(waterXin){
      areaName = waterXin.districtName;
    }else{
      areaName = isdefault.districtName;
    }
    if(!areaName){
      return;
    }
    let mallCartInfoDtos = [];
    this.data.eCShopData.forEach(item=>{
      mallCartInfoDtos.push({
        goodsCode: item.goodsCode,//商品编码
        goodsNum: item.goodsNum ? item.goodsNum : item.goodsCount,//商品数量
      })
    })
    service.getMallDisMoney({
      areaName:areaName,//地区名称
      mallCartInfoDtos:mallCartInfoDtos//商品列表
    }).then(res=>{
      if(res.data.result==200){
        this.setData({
          ecDisMoney:res.data.data.distribution,//电商运费总额 元
        },()=>{
          this.totalMoney()
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let type=options.type;
    if(type==3){
      let goods = JSON.parse(decodeURIComponent(options.goods));
      let groupArr = [];
      let waterArr = [];
      let mealArr = [];
      let ecMallArr= [];
      let cloudData= [];
      goods.forEach(item=>{
        if(item.goodsResource==5){
          groupArr.push(item)
        }
        if(item.goodsResource==20){
          waterArr.push(item)
        }
        if(item.goodsResource==30){
          mealArr.push(item)
        }
        if(item.goodsResource==10){
          ecMallArr.push(item)
        }
        if(item.goodsResource==40){
          cloudData.push(item)
        }
      })
      this.getWaterOrderList(waterArr)  //水整合
      if(waterArr.length<1){  //没有水商品直接取消弹框
        this.setData({
          remindMask: false
        })
      }
      
      let goodsunit=0  //拼团件数
      let groupmoney=0  //拼团总额
      let times = []
      let max=''
      if(groupArr.length>0){
        groupArr.forEach(val=>{
          val.goodsNum=val.goodsNum?val.goodsNum:'1'
          goodsunit += val.goodsNum * 1
          val.markItem = val.discountStatus == 10 ? val.discountPrice * val.goodsNum : val.grouponPrice * val.goodsNum
          val.goodItem= getNum(floatObj.divide(val.markItem,100))
          groupmoney += val.markItem*1
        })
        times = groupArr.map(item=>{
          return item.arriveTime
        })
        max = Math.max.apply(null, times); //配送时间
      }

      let ecunit=0  //电商商品件数
      let ecMoney=0  //电商商品总额
      if(ecMallArr.length>0){
        ecMallArr.forEach(val=>{
          val.goodsNum=val.goodsNum?val.goodsNum:'1';
          val.originalPriceT = getNum(floatObj.divide((val.grouponPrice*1) * (val.goodsNum * 1),100));//商品 原价
          ecunit += val.goodsNum * 1;
          val.markItem = 0 ;// 单个商品总价 分
          if(val.discountStatus == 10) {//参与限时折扣活动
            if(val.limitPurchaseSettings!=3){//不限制
              val.markItem = (val.discountPrice * 1) * (val.goodsNum * 1);
              ecMoney += (val.discountPrice * 1) * (val.goodsNum * 1)
            }
            // 限时折扣活动（在前多少件参与折扣条件内按折扣价算）
            if(val.limitPurchaseSettings==3&& (val.userBoughtGoodsNum*1 + val.goodsNum*1)<= (val.purchaseQuantity*1))   {
              val.markItem = (val.discountPrice * 1) * (val.goodsNum * 1);
              ecMoney += (val.discountPrice * 1) * (val.goodsNum * 1)
            }
            // 限时折扣活动（超出前多少件参与折扣条件按原价算）
            if(val.limitPurchaseSettings==3&&(val.userBoughtGoodsNum*1 + val.goodsNum*1)>(val.purchaseQuantity*1)){
              if(val.userBoughtGoodsNum*1<val.purchaseQuantity*1){  //用户历史购买小于限购数
                let num = val.purchaseQuantity*1 - val.userBoughtGoodsNum*1
                val.markItem += (val.discountPrice*1) * (num * 1);
                ecMoney += (val.discountPrice*1) * (num * 1);
                let num2 = val.goodsNum*1 - num;
                val.markItem += (val.grouponPrice*1) * (num2 * 1);
                ecMoney += (val.grouponPrice*1) * (num2 * 1)
              }else{
                val.markItem = (val.grouponPrice*1) * (val.goodsNum * 1);
                ecMoney += (val.grouponPrice*1) * (val.goodsNum * 1)
              }
            }
          }else{//不参与限时折扣活动
            val.markItem = (val.grouponPrice*1) * (val.goodsNum * 1);
            ecMoney += (val.grouponPrice*1) * (val.goodsNum * 1)  //总额
          }
          val.goodItem= getNum(floatObj.divide(val.markItem,100))
        })
      }

      let clunit=0 ; //云店商品件数
      let clMoney=0;  //云店商品总额
      let clMoneyno = 0 ; //未计算减去金额
      let consessArr = [];
      let offcomGoodMoney = 0;  //未参与活动商品总价
      let fullAcMoney = 0 ;//满减活动减少金额
      let secondHalfPrice = 0; //第二件半价减少金额
      let manyMorePrice =0;//多件多折减少金额
      let manyPriManyFoldsLists=[];//多件多折设置列表
      let cloudArrivalTime = "";//云店预售活动预计自提（到货）时间；
      let needPickUpTime = false;//是否需要显示选择自提时间
      if(cloudData.length>0){
        let fullDecMoneyList = [] ;//用来提取组合商品满减信息
        let fullDecMoney = 0;  //组合商品/参与满减商品的总额
        let manyPriManyFoldsList = [];//多件多折设置
        let maxDiscount = 0;//多件多折的最高折扣
        let combineG = false;//是否有满减活动
        let manyPriCombine = false;//多件多折组合商品集合
        combineG = cloudData.some(clv=> clv.activitySet==2 );//是否是满减活动的组合商品
        manyPriCombine = JSON.parse(JSON.stringify(cloudData.filter(clv=> clv.activitySet==2&&clv.type==70 )));//多件多折的组合商品集合
        let manyPriGoodsNum = 0;//多件多折的组合商品总数量
        cloudData.forEach(val => {
          val.goodsNum=val.goodsNum?val.goodsNum:'1';
          clunit += val.goodsNum * 1;
          val.originalPriceT = getNum(floatObj.divide((val.grouponPrice*1) * (val.goodsNum * 1),100));//商品 原价
          if(val.type!=80){//如果全部是好物预售则不展示选择自提时间
            needPickUpTime = true;
          }
          // （云店非活动商品）
          if(!val.type) {
			      consessArr.push({skuCode : val.goodsCode , price : (val.grouponPrice*1) * (val.goodsNum * 1)});//云店 非活动商品集合
            //consessArr.push(val.goodsCode);
            val.markItem = (val.grouponPrice*1) * (val.goodsNum * 1);
            val.goodItem= getNum(floatObj.divide(val.markItem,100)) ;
            clMoney += val.markItem*1 ;
            clMoneyno += (val.grouponPrice*1) * (val.goodsNum * 1);
			      offcomGoodMoney += val.markItem * 1
          }
          if(val.type ==10&& val.limitPurchaseSettings!=3){//限时折扣活动并且 限购设置是1：不限购  2：每人每种商品限购*件
            val.markItem = (val.discountPrice*1) * (val.goodsNum * 1);
            val.goodItem= getNum(floatObj.divide(val.markItem,100)) ;
            clMoney += val.markItem*1 ;
            clMoneyno += (val.discountPrice*1) * (val.goodsNum * 1);
          }else{
            // 云店限时折扣活动（在前多少件参与折扣条件内按折扣价算）
            if(val.type == 10&&val.limitPurchaseSettings==3&& (val.userBoughtGoodsNum*1 + val.goodsNum*1)<= (val.purchaseQuantity*1)){
              val.markItem = (val.discountPrice*1) * (val.goodsNum * 1)
              val.goodItem= getNum(floatObj.divide(val.markItem,100))
              clMoney += val.markItem*1 
              clMoneyno += (val.discountPrice*1) * (val.goodsNum * 1)
            }
            // 云店限时折扣活动（超出前多少件参与折扣条件按原价算）
            if(val.type == 10&&val.limitPurchaseSettings==3&&(val.userBoughtGoodsNum*1 + val.goodsNum*1)>(val.purchaseQuantity*1)){
              val.markItem = (val.grouponPrice * 1) * (val.goodsNum * 1)
              if(val.userBoughtGoodsNum*1<val.purchaseQuantity*1){  //用户历史购买小于限购数
                let num = val.purchaseQuantity*1 - val.userBoughtGoodsNum*1
                clMoney += (val.discountPrice*1) * (num * 1)
                clMoneyno += (val.discountPrice*1) * (num * 1)
                let num2 = val.goodsNum*1 - num
                clMoney += (val.grouponPrice*1) * (num2 * 1)
                clMoneyno += (val.grouponPrice*1) * (num2 * 1)
                let num3 =(val.discountPrice*1) * (num * 1) + (val.grouponPrice*1) * (num2 * 1);
                val.goodItem= getNum(floatObj.divide(num3,100)) 
              }else{
                clMoney += (val.grouponPrice*1) * (val.goodsNum * 1)
                clMoneyno += (val.grouponPrice*1) * (val.goodsNum * 1)
                val.goodItem= getNum(floatObj.divide(val.markItem*1,100)) 
              }
            }
          }
          if(val.type == 20 ){//满减活动
            let itemMoney = (val.grouponPrice*1) * (val.goodsNum * 1)
            val.markItem = (val.grouponPrice * 1) * (val.goodsNum * 1)
            val.goodItem= getNum(floatObj.divide(val.markItem,100))
            clMoneyno += val.markItem
            fullDecMoney += itemMoney
            if(val.fullDecMoneyList && val.fullDecMoneyList.length>0){  //有满减活动
              let newList= [...val.fullDecMoneyList]   //reverse()会改变原数组，这里通过...拷贝（拷贝一级）
              let list = newList.reverse()
              fullDecMoneyList = list
              if(!combineG){  //非真说明是单个商品
                  for(let i=0 ;i<list.length;i++){
                    if(itemMoney >= floatObj.multiply(list[i].fullMoney*1,100)){
                      fullAcMoney += floatObj.multiply(list[i].decMoney*1,100)
                      itemMoney -= floatObj.multiply(list[i].decMoney*1,100)
                      break
                    }
                  }
                }
                clMoney += itemMoney
            }
          }
          if(val.type == 50 ){//买一送一
            val.markItem = (val.grouponPrice * 1) * (val.goodsNum * 1) 
            val.goodItem= getNum(floatObj.divide(val.markItem,100)) 
            clMoney += val.markItem*1 
            clMoneyno += (val.grouponPrice*1) * (val.goodsNum * 1)//总额
          }
          if(val.type == 60 ){//第二件半价
            val.markItem = (val.grouponPrice * 1) * (val.goodsNum * 1)
            val.goodItem = getNum(floatObj.divide(val.markItem,100))
            clMoney += val.markItem*1 ;
            if(val.goodsNum*1>=2){//购买数量大于2的需要减去数量除于2的向下取整数的一半价格
              let minusNum = Math.floor(val.goodsNum / 2);
              clMoney -= (val.grouponPrice*1)/2*(minusNum);//合计 减去第二件半价
              secondHalfPrice += (val.grouponPrice*1)/2*(minusNum);//第二件半价减少金额
            }
            
            clMoneyno += (val.grouponPrice*1) * (val.goodsNum * 1);//总额
          }
          if(val.type == 70){//多件多折 
            let itemMoney = (val.grouponPrice*1) * (val.goodsNum * 1)
            val.markItem = (val.grouponPrice * 1) * (val.goodsNum * 1) 
            val.goodItem = getNum(floatObj.divide(val.markItem,100))
            clMoneyno += val.markItem //用原价计算总金额
            if(val.manyPriManyFoldsList && val.manyPriManyFoldsList.length>0){  //有多件多折设置
              manyPriManyFoldsLists = val.manyPriManyFoldsList;//多件多折 折扣设置列表
              let newList= [...val.manyPriManyFoldsList];   //reverse()会改变原数组，这里通过...拷贝（拷贝一级）
              let list = newList.reverse();
              manyPriManyFoldsList = list;
              for(let i=0 ;i<list.length;i++){//循环获取最高折扣率
                if(getNum(floatObj.divide(list[i].discount*1,100))<maxDiscount||maxDiscount==0){
                  maxDiscount = getNum(floatObj.divide(list[i].discount*1,100));//最高折扣率
                }
              }
              if(!manyPriCombine||manyPriCombine.length==0||manyPriCombine.length==1){//说明活动是单个商品多件多折  或者是组合商品但是只有1个商品
                for(let i=0 ;i<list.length;i++){
                  if(val.goodsNum*1 >= list[i].count*1){//购买数量大于活动设置的数量
                    let discount = getNum(floatObj.divide(list[i].discount*1,100));//折扣率
                    clMoney += (list[i].count*1) * (val.grouponPrice*1) * discount;//达到购买数量的那一部分按相应的折扣计算
                    manyMorePrice += (list[i].count*1) * (val.grouponPrice*1) - (list[i].count*1) * (val.grouponPrice*1) * discount;//多件多折活动减少的金额
                    if(val.amountExceeded==1){//超过购买数量按照原价购买
                      clMoney += (val.goodsNum*1 - list[i].count*1) * (val.grouponPrice*1);
                    }else{//超过购买数量按照最高折扣购买
                      clMoney += (val.goodsNum*1 - list[i].count*1) * (val.grouponPrice*1) * maxDiscount;
                      manyMorePrice += (val.goodsNum*1 - list[i].count*1) * (val.grouponPrice*1) - (val.goodsNum*1 - list[i].count*1)  * (val.grouponPrice*1) * maxDiscount;//多件多折活动减少的金额
                    }
                    break
                  }
                }
              }else{
                manyPriGoodsNum += val.goodsNum*1;//组合商品总数量
              }
            }
          }
          if(val.type == 80){//好物预售
            cloudArrivalTime = cloudArrivalTime?cloudArrivalTime:val.expectedArrivalTime;//预计自提（到货）时间
            val.markItem = (val.prePrice * 1 * 100) * (val.goodsNum * 1) //预售价 元转分
            val.goodItem= getNum(floatObj.divide(val.markItem,100))//预售价 分转元
            clMoney += val.markItem*1 
            clMoneyno += (val.prePrice * 1 * 100) * (val.goodsNum * 1)//用预售价计算总额
          }
          if(val.type == 90){//多人拼团
            if(val.groupMethod){//参与拼团
              val.markItem = (val.prePrice * 1 * 100) * (val.goodsNum * 1) //拼团价 元转分
              val.goodItem= getNum(floatObj.divide(val.markItem,100))//拼团价
              clMoney += val.markItem*1 
              clMoneyno += (val.prePrice * 1 * 100) * (val.goodsNum * 1)//用拼团价计算总额
            }else{//不参与拼团直接购买
              val.markItem = (val.grouponPrice * 1) * (val.goodsNum * 1) //原价
              val.goodItem= getNum(floatObj.divide(val.markItem,100)) //原价
              clMoney += val.markItem*1 
              clMoneyno += (val.grouponPrice*1) * (val.goodsNum * 1)//用原价计算总额
            }
          }
        })
        if(combineG ){  //云店满减活动组合商品
          if(fullDecMoneyList.length>0){
            let reduceNum= 0
            for(let i=0 ;i<fullDecMoneyList.length;i++){
              if(fullDecMoney >= floatObj.multiply(fullDecMoneyList[i].fullMoney*1,100)){
                reduceNum = (fullDecMoneyList[i].decMoney*1)
                fullAcMoney = floatObj.multiply(reduceNum,100)
                clMoney -= floatObj.multiply(reduceNum,100)
                break
              }
            }
          }
        }
        if(manyPriCombine&&manyPriCombine.length>1){ //多件多折的组合商品集合大于1个商品时
          let newGoodsNum=0;//当前商品数量和前几个商品的数量累计的总数量
          let newGoodsNum1=0;//剩余可以计算折扣的商品件数
          manyPriCombine.forEach((val,index) => {
            let itemMoney = (val.grouponPrice*1) * (val.goodsNum * 1)
            newGoodsNum += val.goodsNum;
            for(let i=0 ;i<manyPriManyFoldsList.length;i++){
              if(manyPriGoodsNum >= manyPriManyFoldsList[i].count*1){//多件多折的组合商品数量大于活动设置的数量
                let discount = getNum(floatObj.divide(manyPriManyFoldsList[i].discount*1,100));//折扣率
                if(newGoodsNum <= manyPriManyFoldsList[i].count*1){//如果当前商品数量和前几个商品的数量的累计数量 <= 设置的最大数量
                  newGoodsNum1 = manyPriManyFoldsList[i].count*1-newGoodsNum;//剩余可以计算折扣的商品件数
                  clMoney += (val.goodsNum*1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                  manyMorePrice += (val.goodsNum*1) * (val.grouponPrice*1) - (val.goodsNum*1) * (val.grouponPrice*1) * discount;//多件多折活动减少的金额
                }else{//如果当前商品数量和前几个商品的数量累计数量 > 设置的数量
                  if(newGoodsNum1==0){//剩余可以计算折扣的商品件数置为0时
                    if(index==0 && val.goodsNum > manyPriManyFoldsList[i].count*1){//如果第一件商品的数量就大于活动设置的数量
                      clMoney += (manyPriManyFoldsList[i].count*1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                      manyMorePrice += (manyPriManyFoldsList[i].count*1) * (val.grouponPrice*1) - (manyPriManyFoldsList[i].count*1) * (val.grouponPrice*1) * discount; // 已减少的金额
                      if(val.amountExceeded==1){//超过购买数量按照原价购买
                        clMoney += (val.goodsNum - manyPriManyFoldsList[i].count*1) * (val.grouponPrice*1);
                      }else{//超过购买数量按照最高折扣购买
                        clMoney += (val.goodsNum - manyPriManyFoldsList[i].count*1) * (val.grouponPrice*1) * maxDiscount;
                        manyMorePrice += (val.goodsNum - manyPriManyFoldsList[i].count*1) * (val.grouponPrice*1) - (val.goodsNum - manyPriManyFoldsList[i].count*1) * (val.grouponPrice*1) * maxDiscount; // 已减少的金额
                      }
                    }else{
                      if(val.amountExceeded==1){//超过购买数量按照原价购买
                        clMoney += (val.goodsNum*1) * (val.grouponPrice*1);
                      }else{//超过购买数量按照最高折扣购买
                        clMoney += (val.goodsNum*1) * (val.grouponPrice*1) * maxDiscount;
                        manyMorePrice += (val.goodsNum*1) * (val.grouponPrice*1) - (val.goodsNum*1) * (val.grouponPrice*1) * maxDiscount;//多件多折活动减少的金额
                      }
                    }
                  }else{//剩余可以计算折扣的商品件数置不为0时
                    if(val.goodsNum > newGoodsNum1){// 如果当前商品的数量 大于 剩余可以计算折扣的商品件数
                      clMoney += (newGoodsNum1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                      manyMorePrice += (newGoodsNum1) * (val.grouponPrice*1) - (newGoodsNum1) * (val.grouponPrice*1) * discount;//多件多折活动减少的金额
                      if(val.amountExceeded==1){//超过购买数量按照原价购买
                        clMoney += (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1);
                      }else{//超过购买数量按照最高折扣购买
                        clMoney += (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1)  * maxDiscount;
                        manyMorePrice += (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1) - (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1)  * maxDiscount;//多件多折活动减少的金额
                      }
                      newGoodsNum1 = 0;//剩余可以计算折扣的商品件数置为0
                    }else{// 如果当前商品的数量 等于 剩余可以计算折扣的商品件数
                      clMoney += (val.goodsNum*1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                      manyMorePrice += (val.goodsNum*1) * (val.grouponPrice*1) - (val.goodsNum*1) * (val.grouponPrice*1) * discount;//多件多折活动减少的金额
                    }
                  }
                }
                break;
              }
            }
          })
        }
      }

      let mealunit = 0  //套餐件数
      let mealNum = 0  //套餐总额
      if(mealArr.length>0){
        mealArr.forEach(el=>{
          mealunit += el.goodsNum*1
          el.grouponPriceT= getNum(floatObj.divide(el.grouponPrice,100))
          el.markItem = (el.grouponPrice*1) * el.goodsNum
          el.goodItem = getNum(floatObj.divide(el.markItem,100))
          mealNum+=el.markItem*1
        })
      }
      let manyPriManyFoldsListStr = "";//多件多折设置字符串
      if(manyPriManyFoldsLists.length>0){
        manyPriManyFoldsLists.forEach((val)=>{
          manyPriManyFoldsListStr += val.count+"件"+val.discount/10+"折，";
        })
      } 
      this.setData({
        ['orderInfor.pickupPerson']: wx.getStorageSync('consignee') ? wx.getStorageSync('consignee').putName : wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo').nickName:'',  //拼团用户名
        ['orderInfor.cloudpickupPerson']: wx.getStorageSync('consignee') ? wx.getStorageSync('consignee').putName1 : wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo').nickName:'',  //云店用户名
        nextPagePickUp: options.pickup=="true"||!options.pickup?true:false,//购物车页面点击的自提和配送 true是自提 false是配送
        needPickUpTime,//如果云店商品全部是好物预售活动则不展示选择自提时间入口
        newclaimTime: util.formatHen(max).substring(0, 10),
        groupmoney: floatObj.divide(groupmoney, 100),   //拼团金额 分转元
        ['orderInfor.groupTotalMoney']:floatObj.divide(groupmoney, 100), //拼团金额 分转元
        goodsList: groupArr, //拼团商品
        goodsunit,  //拼团件数
        ['orderInfor.rental']: options.rental,
        ['orderInfor.claimTime']: max,
        type:3,
        mealArr: mealArr,  //套餐商品
        mealNum: floatObj.divide(mealNum, 100),  //套餐金额 元
        ['orderInfor.mealTotalMoney']: floatObj.divide(mealNum, 100), //套餐金额 元
        mealunit,   //套餐件数
        eCShopData:ecMallArr, //电商商品
        ecMoney: floatObj.divide(ecMoney, 100), //电商金额 分转元
        ['orderInfor.ecTotalMoney']:floatObj.divide(ecMoney, 100), //电商金额 分转元
        ecunit,   //电商件数
        cloudData:cloudData, //云店商品
        cloudArrivalTime:cloudArrivalTime,//预售活动预计自提（到货）时间
        ['orderInfor.cloudArrivalTime']:cloudArrivalTime,//预售活动预计自提（到货）时间
        clMoney: floatObj.divide(clMoney, 100), //云店合计 分转元
        clMoneyno: floatObj.divide(clMoneyno, 100), //云店商品金额 分转元
        ['orderInfor.cloudTotalMoney']:floatObj.divide(clMoneyno, 100), //云店商品金额 分转元
        clunit,   //云店件数
		    consessArr,
        offcomGoodMoney,
        fullAcMoney:floatObj.divide(fullAcMoney,100),
        ['orderInfor.fullAcMoney']:floatObj.divide(fullAcMoney,100),
        secondHalfPrice:floatObj.divide(secondHalfPrice,100),//第二件半价减少金额
        ['orderInfor.secondHalfPrice']:floatObj.divide(secondHalfPrice,100),//第二件半价减少金额
        manyPriManyFoldsListStr:manyPriManyFoldsListStr?manyPriManyFoldsListStr.substr(0,manyPriManyFoldsListStr.length-1):"",//多件多折 折扣设置
        manyMorePrice:floatObj.divide(manyMorePrice,100),//多件多折减少的金额
        ['orderInfor.manyMorePrice']:floatObj.divide(manyMorePrice,100),//多件多折减少的金额
      },()=>{
        this.getHj()  //拼团计算优惠
      })
    }
    if(type==1){
      let waterdata = JSON.parse(decodeURIComponent(options.goods))
      waterdata.goods.sellPrice = floatObj.divide(waterdata.goods.sellPrice,100)
      this.setData({
        type:1,
        businessTime: waterdata.businessTime,  //配送时间
        operateWeek: waterdata.operateWeek,   //营业时间
        waterticketRes: waterdata.ticketCount, //水票剩余数量
        waterticketData:waterdata.goods,  //水票商品信息
        waterticketDataBranchid:waterdata.branchesId
      })
    }
  },
  //水票减少
  goodDel(){
    if (this.data.waterticketnum>1){
      this.setData({
        waterticketnum: --this.data.waterticketnum
      })
    }
  },
  //水票添加
  goodAdd(){
    if (this.data.waterticketnum<this.data.waterticketRes){
      this.setData({
        waterticketnum: ++this.data.waterticketnum
      })
    }else{
      wx.showToast({
        title: `您可用水票只有${this.data.waterticketRes}张~`,
        icon: 'none'
      })
    }
  },
  //水票输入
  goodInp(e){
    let inpValue=e.detail.value
    if(inpValue<1){
      inpValue=1
    }
    if (inpValue > this.data.waterticketRes){
      inpValue = this.data.waterticketRes
      wx.showToast({
        title: `您可用水票只有${this.data.waterticketRes}张~`,
        icon: 'none'
      })
    }
    this.setData({
      waterticketnum:inpValue
    })
  },
  //水票留言
  waterticketinp(e){
    let inpvalue=e.detail.value
    this.setData({
      waterticketinp:inpvalue
    })
  },
  //计算拼团合计
  getHj(){
    let numZ = floatObj.multiply(this.data.groupmoney, 100)   //拼团总金额转为分
    let numY = floatObj.multiply(this.data.discountCard, 100)    //将优惠券金额转为分计算
    let sum = numZ - numY      //合计金额-分  
    if(numZ>0){   //总金额大于0
      if (numY > 0 && this.data.discountCard){  
        this.setData({
          groupNum: floatObj.divide(sum, 100)
        },()=>{
          this.totalMoney()
        })  //合计金额再转为元
      }else{ 
        this.setData({  //优惠券小于等于0合计=总额
          groupNum: floatObj.divide(numZ, 100)
        },()=>{
          this.totalMoney()
        })  //合计金额再转为元
      }
    }
  },
	//云店计算优惠
	cloudHj(){
    let storage = wx.getStorageSync('cloudiscount')
		if(storage){
			if (storage =='nouse'){//不使用优惠券
				this.setData({
          checkdis:false,
          choosediscard:null,
          ['orderInfor.cardCloud']: null,
          ['orderInfor.discountCloudNum']: 0,
          consupMoney: 0,
          totalDiscount: 0,
				})
			}else{
        //10-优惠券 30-折扣券
        if(((storage.cardType == 10)&&!storage.cardAmount)||(storage.cardType == 30&&!storage.discount)){
          this.setData({
            checkdis:false,
            choosediscard:null,
            ['orderInfor.cardCloud']: null,
            ['orderInfor.discountCloudNum']: 0,
          })
          return
        } 
        //一个商品只能参与一个活动
        let numZ = 0;//云店商品总额 单位分
        this.data.cloudData.forEach(val=>{
          if(!val.type){//首先是没有参加过限时折扣，满减活动等其他活动
            if(storage.applicableGoods==0){//适用全部商品
              numZ+=(val.grouponPrice*1) * (val.goodsNum * 1);//分
            }else{
              let goodsHasCard = storage.skuCodes.includes(val.goodsCode);//找到适用于该商品的优惠券
              if(goodsHasCard){//找到适用于该商品的优惠券
                numZ+=(val.grouponPrice*1) * (val.goodsNum * 1);//分
              }
            }
          }
        });
				if (storage.cardType == 10 || storage.cardType==20){//优惠券
          storage.moneyT = floatObj.divide(storage.cardAmount, 100) //优惠券金额 分转元
          let numY = storage.cardAmount
          let sum =0
          if(numZ>numY){
            sum = numY
          }else{
            sum= numZ
          }
					this.setData({
						consupMoney: sum,//云店商品参加优惠券和折扣券 后的优惠金额 分
						['orderInfor.discountCloudNum']: getNum(floatObj.divide(sum, 100)),//云店商品参加优惠券和折扣券 后的优惠金额 元
					}, () => {
						this.totalMoney()
					})
				}
				if (storage.cardType == 30) {//折扣券
          storage.discountRatioT = floatObj.divide(storage.discount, 100).toFixed(1) //几折 除100
					let discountRatio = storage.discount  //折扣 后端返回折扣单位是*100的
					let sum = (numZ * 1) * discountRatio * 1
          let disNum = floatObj.divide(sum, 1000)
          let gapNum = floatObj.subtract(numZ ,disNum)
          let sum2 = 0
          if(numZ>gapNum){
            sum2 = gapNum
          }else{
            sum2 = numZ
          }
					
					this.setData({
						consupMoney: sum2,//云店商品参见优惠券和折扣券 后的优惠金额 分
						['orderInfor.discountCloudNum']: floatObj.divide(sum2, 100)//云店商品参加优惠券和折扣券 后的优惠金额 元
					}, () => {
						this.totalMoney()
					})
        }
        this.setData({
					checkdis: true,
					choosediscard:storage,
					['orderInfor.cardCloud']: storage.cardCode,
				})
			}
		}
	},
  //计算总合计
  totalMoney(){
    let groupNum = floatObj.multiply(this.data.groupNum,100) //拼团金额
    let mealNum = floatObj.multiply(this.data.mealNum,100)  //套餐金额
    let ecNum = floatObj.multiply(this.data.ecMoney,100)  //商城金额
    let ecDisMoney = floatObj.multiply(this.data.ecDisMoney,100)  //指尖商城运费金额 元转分
    let clNum = floatObj.multiply(this.data.clMoney,100)  //云店金额
    let consupMoney =this.data.consupMoney  //云店优惠金额

    // 配送费计算
    if(this.data.cloudData.length>0&&this.data.smTabInd==2&&this.data.distance){  //在 配送范围内并且是选中上架配送的云店商品 满足配送条件
      let satm=this.data.dispatch.freeShipping;  //免配送金额 元
      let basetance=floatObj.multiply(this.data.dispatch.basicDeliveryDistance,1000)||0 ;//基础配送距离 km转换成m
      let basics=this.data.dispatch.basicDeliveryCost ; //基础配送费 分
      let beyond=this.data.dispatch.addDeliveryCost ;//超出配送费 分
      let satr=floatObj.multiply(this.data.dispatch.freeDistance,1000) ;//免配送距离 km转m
      this.setData({
        satm,//免配送金额 元
        satr//免配送距离 m
      });
      let newNum=0;
      if(this.data.currKm*1>basetance*1){//当前位置距离门店的距离大于基础配送距离
        let kmNum=Math.ceil(floatObj.divide(this.data.currKm*1 - basetance*1,1000))
        newNum = basics*1 + beyond*kmNum
      }else{//否者只是基础配送费
        newNum = basics
      }
      this.setData({
        postage:getNum(floatObj.divide(newNum,100)),
        ['orderInfor.postage']:getNum(floatObj.divide(newNum,100))
      });
      if((satm*1>=0 && clNum/100>=satm) && (satr*1>=0&&this.data.currKm<=satr)){ //云店满足条件 不加配送费
        this.setData({
          postage:'0.00',
          ['orderInfor.postage']:'0.00',
          striping:true,
          ['orderInfor.striping']:true
        })
      }else{
        clNum+=newNum
        this.setData({  
          striping:false,
          ['orderInfor.striping']:false
        })
      }
    }else{
      this.setData({
        postage:'0.00',
        ['orderInfor.postage']:'0.00'
      })
    }
    let zmoney = groupNum*1 + mealNum*1 + this.data.waterNum*1 + ecNum*1 + ecDisMoney*1 + clNum*1 - consupMoney*1
    let totalDiscount = this.data.orderInfor.discountCloudNum*1 + this.data.fullAcMoney*1 + this.data.discountCard*1 + this.data.secondHalfPrice*1 + this.data.manyMorePrice*1;//总的优惠 拼团+云店
    let totalDiscountSplit = totalDiscount.toString().split(".");
    if(totalDiscountSplit.length>1&&totalDiscountSplit[1].length>3){
      totalDiscount = totalDiscount.toFixed(3);
    }
    if(this.data.cloudData.length>0&&zmoney<=1){//如果有云店商品时 合计小于等于0 设为0.01元=1分
      zmoney=1;
    }
    this.setData({
      totalDiscount:totalDiscount,//总的优惠 元
      totalMoney: floatObj.divide(zmoney,100),//分转元
      ['orderInfor.totalNum']: floatObj.divide(zmoney,100) //分转元
    })
  },
	//获取云店可用卡券
	getDisCloudList() {
    if(this.data.consessArr.length>0){
      service.cloudUsableOrder({
        branchesId: this.data.cloudBranchId,
        proList: this.data.consessArr,
        useStatus: 10,  //未使用卡券
        userId: wx.getStorageSync('userId'),
        //price:this.data.offcomGoodMoney
      }).then(res => {
        if (res.data.result == 200) {
          let list = res.data.data
          if(list&&list.length>0){
            this.setData({
              disCloudNum: list.length
            })
          }
        }
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
    wx.hideShareMenu()  //禁止用户分享
    if(wx.getStorageSync('noremind')=='noremind'){  //水管家提醒弹框
      this.setData({
        remindMask:false
      })
    }
    let waterXin = wx.getStorageSync('isaddress')
    let isdefault = wx.getStorageSync('isdefault')
    if(waterXin){   //水管家收货人信息
      this.setData({
        wOrderName: waterXin.name,
        wOrderTel: waterXin.phone,
        wOrderAddress: `${waterXin.provinceName == waterXin.cityName ? waterXin.cityName : waterXin.provinceName + waterXin.cityName}${waterXin.districtName}${waterXin.address}`,
      })
    }else{
      this.setData({
        wOrderName: isdefault.name,
        wOrderTel: isdefault.phone,
        wOrderAddress: `${isdefault.provinceName == isdefault.cityName ? isdefault.cityName : isdefault.provinceName + isdefault.cityName}${isdefault.districtName}${isdefault.address}`,
      })
    }
    if(!waterXin&&!isdefault){
      this.setData({
        wOrderName: '',
        wOrderTel: '',
        wOrderAddress: '',
      })
    }
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点 
    this.setData({  //拼团收货信息
      userId: wx.getStorageSync('userId'), 
      communityName: presentAddress?presentAddress.siteName:'',   //社区名称
      takeAddress: presentAddress?presentAddress.deliveryAddress:'',//取h地址
      branchId:presentAddress?presentAddress.siteId:"", //拼团网点id
      cloudBranchId:currentCloudShop?currentCloudShop.siteId:"", //云店网点id
      totalDiscount:0,//总的优惠金额
      consupMoney:0,//云店总优惠金额
    },()=>{
      this.getCloudBranchInfo();
      this.conChange()
    })
    if (this.data.type == 3) {
      this.totalMoney()  //计算金额
      if(this.data.goodsList.length>0){ //存在拼团的商品
        this.getbestCoupon()  //最优卡券
        this.getDiscountList() //可用卡券张数
      }
      if(this.data.cloudData.length>0){
        this.getColudDispatch()  //配送信息
				this.getDisCloudList() //云店可用优惠券
				this.cloudHj()
      }
      if(this.data.eCShopData.length>0){//指尖商城商品
        this.getMallDisMoney();//获取指尖商城的运费
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