// pages/placeOrder/topayfor/index.js
const service = require('../../../service/index.js');
const util = require("../../../utils/util.js")
import floatObj from '../../../utils/floatObj.js'
import {getNum} from "../../../utils/util.js";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    orderInfor:Object,
    ordergoods:Object, //拼团
    watergoods:Object, //水
    mealgoods:Object,  //套餐
    eCShopData:Object,  //商城
    cloudData:Object,  //云店
    wticket:String,//水票抵扣
  },
  lifetimes: {
    attached() {
      console.log(this.properties.orderInfor.claimTime)
      if(this.properties.orderInfor.claimTime){//拼团自提时间
        this.setData({
          claimTime: util.formatHen(this.properties.orderInfor.claimTime).substring(0,10),
          createTime: this.properties.orderInfor.claimTime+'',
        })
      }
      if(this.properties.orderInfor.pickUpTime){//云店自提时间
        this.setData({
          pickUpTime:this.properties.orderInfor.pickUpTime
        })
      }
      if(this.properties.ordergoods.length>0&&this.properties.orderInfor.smTabInd==1){//有拼团并且有云店自提订单
        this.setData({
          TabShow:true
        })
      }else{
        this.setData({
          TabShow:false
        })
        if(this.properties.ordergoods.length>0){
          this.setData({
            pinorclo:1
          })
        }
        if(this.properties.orderInfor.smTabInd==1){
          this.setData({
            pinorclo:2
          })
        }
      }
      let groupDis = floatObj.multiply(this.properties.orderInfor.discountNum,100);//拼团优惠 *100元转分
      let cloudDis = floatObj.multiply(this.properties.orderInfor.discountCloudNum, 100);//云店优惠 *100元转分
      let fullAcMoney =  floatObj.multiply(this.properties.orderInfor.fullAcMoney, 100);//云店满减优惠 *100元转分
      let secondHalfPrice =  floatObj.multiply(this.properties.orderInfor.secondHalfPrice, 100);//云店第二件半价优惠 *100元转分
      let manyMorePrice =  floatObj.multiply(this.properties.orderInfor.manyMorePrice, 100);//云店多件多折优惠 *100元转分
      let discountNum = groupDis + cloudDis + fullAcMoney + secondHalfPrice + manyMorePrice;//总的优惠金额
      let waterTotalMoney=floatObj.multiply(this.properties.orderInfor.waterTotalMoney, 100); //水商品总额*100元转分
      let mealTotalMoney=floatObj.multiply(this.properties.orderInfor.mealTotalMoney, 100);//水套餐商品总额*100元转
      let groupTotalMoney=floatObj.multiply(this.properties.orderInfor.groupTotalMoney, 100);//拼团商品总额 *100元转分
      let ecTotalMoney=floatObj.multiply(this.properties.orderInfor.ecTotalMoney, 100);//电商商品总额 *100元转分
      let cloudTotalMoney=floatObj.multiply(this.properties.orderInfor.cloudTotalMoney, 100);//云店商品总额 *100元转分
      let totalMoney = waterTotalMoney+mealTotalMoney+groupTotalMoney+ecTotalMoney+cloudTotalMoney;//总额 分
      let discountNumSplit = discountNum.toString().split(".");
      if(discountNumSplit.length>1&&discountNumSplit[1].length>3){
        discountNum = discountNum.toFixed(3);
      }
      this.setData({
        discountNum: floatObj.divide(discountNum, 100),
        totalMoney: floatObj.divide(totalMoney, 100)
      })
    }
  },
  ready() {
    let presentAddress = wx.getStorageSync("presentAddress");//选择的站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//选择的站点
    this.setData({
      communityName: presentAddress?presentAddress.siteName:'',   //网点名称
      takeAddress: presentAddress?presentAddress.deliveryAddress:'',   //网点地址
      cloudCommunityName: currentCloudShop?currentCloudShop.siteName:'',   //网点名称
      cloudTakeAddress: currentCloudShop?currentCloudShop.deliveryAddress:'',   //网点地址
    })
  },
  /**
   * 组件的初始数据
   */
  data: {
    pickUpTime:'', //指尖云店自提订单 自提时间
    claimTime:'',  //预计取货时间   2019-20-1
    createTime:'',  //生成订单取货时间  2019-20-1 13:23:45
    orderCode:'',     //订单code
    communityName:'',   //网点名称
    takeAddress: '',   //网点地址
    orderTrue:false,  
    payGroupCode:'',  
    pinorclo:1 , //拼团云店tab
    TabShow:false, //tab显示
    totalMoney:0,//商品总额
	  discountNum:0,  //已优惠金额
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //拼团点击
    groupTabClick(){
      this.setData({
        pinorclo:1
      })
    },
    //云店点击
    cloudTabClick(){
      this.setData({
        pinorclo:2
      })
    },
    //蒙层点击
    maskClick(e) {
      this.triggerEvent('maskfalse', false)
    },
    //去结算
    goToPay(){
      let t=this;
      if(this.onClick){
        return;
      }
      this.onClick=true;
      wx.showLoading({title:"加载中"});
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
    },
    //去结算支付
    orderSubmit(){
      let t=this;
      wx.showLoading({
        mask: true,
        title: '支付中',
      });
      let arr=[]
      let waterdata=[]
      this.properties.watergoods.forEach(item=>{
        item.skuInfos.forEach(val => {
          val.deliverytime = item.deliverytime
          val.leaveinp = item.leaveinp
          val.goodsResource = val.goodsSource
          val.branchesId = item.branchesId
          waterdata.push(val)
        })
      })
      let newdata = [...this.properties.ordergoods, ...waterdata, ...this.properties.eCShopData, ...this.properties.cloudData, ...this.properties.mealgoods,]
      newdata.forEach(item=>{
        let activityId="";
        if(item.activityId){
          if(item.type==90&&item.groupMethod){//多人拼团活动并且是拼团购买或者参团购买
            activityId = item.activityId;
          }
          if(item.type!=90){//其他活动
            activityId = item.activityId;
          }
        }
        let list={
          activityId: activityId,//活动ID
          branchesId: item.branchesId,
          cartCode: item.cartCode ? item.cartCode:'',
          goodsCode: item.goodsCode,
          goodsNum: item.goodsNum ? item.goodsNum : item.goodsCount,
          goodsResource: item.goodsResource,
          groupCode:item.groupCode?item.groupCode:null,//拼团编码
          groupMethod:item.groupMethod?item.groupMethod:null,//1开团，2拼团
          sendTime: item.deliverytime != '尽快送达' && item.deliverytime? `${item.deliverytime}:00.000` : null,
          ticketNum: item.ticketCount,
          buyerMessage: item.leaveinp ? item.leaveinp : null
        }
        arr.push(list)
      })
      let presentAddress = wx.getStorageSync("presentAddress");//选择的站点
      let currentCloudShop = wx.getStorageSync("currentCloudShop");//最近的站点
      let waterXin = wx.getStorageSync('isaddress')
      let isdefault = wx.getStorageSync('isdefault')
      let groupOrderName=this.properties.orderInfor.pickupPerson  //拼团订单取货人
      let groupOrderPhone=this.properties.orderInfor.personTel    //拼团取货人手机号
      let cloudOrderName=this.properties.orderInfor.cloudpickupPerson   //云店订单取货人
      let cloudOrderPhone=this.properties.orderInfor.cloudpersonTel    //云店取货人手机号
      let pickUpTime = this.properties.orderInfor.pickUpTime;//云店选择的自提时间
      let smallEstimateReceiveTime=pickUpTime.dates+" "+pickUpTime.hour+":"+pickUpTime.minute+":00";
      service.createorder({
        branchesAddress: presentAddress?presentAddress.deliveryAddress:'',
        branchesId: presentAddress?presentAddress.siteId:'',
        smallBranchesId:currentCloudShop?currentCloudShop.siteId:'',
        cardCode: this.properties.orderInfor.cardxin ? this.properties.orderInfor.cardxin.cardCode:null,
        cardOrderId: this.properties.orderInfor.cardxin ? this.properties.orderInfor.cardxin.cardOrderId:null,
        cartInfos:arr,
        discountAmount: this.properties.orderInfor.cardxin ? floatObj.multiply(this.properties.orderInfor.cardxin.discountAmount,100):null,
        estimateReceiveTime: this.data.createTime,
        mecName: presentAddress?presentAddress.siteName:'',
        receiverName: groupOrderName?groupOrderName:null,
        receiverPhone: groupOrderPhone?groupOrderPhone:null,
        smallReceiverName: cloudOrderName?cloudOrderName:null,
        smallReceiverPhone: cloudOrderPhone?cloudOrderPhone:null,
        userId: wx.getStorageSync('userId'),
        orderPrice:floatObj.multiply(this.properties.orderInfor.totalNum,100),
        receiveAddressId:waterXin?waterXin.addId:isdefault?isdefault.addId:'',
        smallDelivery:this.properties.orderInfor.smTabInd==1?20:this.properties.orderInfor.smTabInd==2?'10':null,
        smallCardCode:this.properties.orderInfor.cardCloud,
        smallEstimateReceiveTime//云店自提时间
      }).then(res=>{
          if(res.data.result==200){
            wx.removeStorageSync('cloudiscount');
            let consignee = { 
              putName: this.properties.orderInfor.pickupPerson,
              putTel: this.properties.orderInfor.personTel,
              putName1: this.properties.orderInfor.cloudpickupPerson,
              putTel1: this.properties.orderInfor.cloudpersonTel
            }
            wx.setStorageSync('consignee', consignee)
            this.setData({
              orderTrue:true,
              orderCode: res.data.data.orderCode,
              payGroupCode: res.data.data.payGroupCode
            },()=>{
              service.payMyOrder({
                openId: wx.getStorageSync("openId"),
                userId: wx.getStorageSync("userId"),
                orderCodes: this.data.orderCode
              }).then((res) => {
                t.onClick=false;
                if(res.data.result==200){
                  service.wxPay(res.data.data).then(() => {
                    wx.showToast({
                      title: '支付成功！',
                      icon: 'none',
                      duration: 1000
                    });
                    wx.redirectTo({
                      url: '../../pages/shoppingPaySucceed/paySucceed?totalMoney='+t.properties.orderInfor.totalNum,
                    })
                  }).catch((d) => {
                    t.onClick=false;
                    wx.hideLoading();
                    wx.showModal({
                      title: '温馨提示',
                      showCancel: false,
                      content: '未支付订单将在30分钟内取消，请尽快完成支付~',
                      success:(res)=> {
                        if (res.confirm) {
                          wx.redirectTo({
                            url: '../../pages/personalOrderDetail/index?orderCode=' + this.data.orderCode + '&payGroupCode=' + this.data.payGroupCode + '&orderStatus=10' ,
                          })
                        }
                      }
                    });
                  })
                } else {
                  t.onClick=false;
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
          }else{
            t.onClick=false;
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
      }).catch(() => { 
        t.onClick = false; 
      }) 
    }
  }
})
