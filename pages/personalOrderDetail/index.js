// pages/personalOrderDetail/index.js
const app=getApp();
const service = require("../../service/index");
import floatObj from "../../utils/floatObj";
import {changeCurrentCloudShop} from "../../utils/util";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    branchId:"",//云店站点id
    branchName:"",//云店站点名称
    cityName:"",//云店的所在城市名称
    imgUrl: app.globalData.imgUrl,
    orderCode:'',//订单编号
    payGroupCode:'',//支付分组编码 todo 待付款状态查询接口需要
    payOrderCode:null,//待付款状态 去支付时传参orderCode数组
    orderStatus:'',//订单状态
    imgHttp:app.globalData.imgUrl,
    zitiOrderDetails:null,//待付款 自提订单
    peisongOrderDetails:null,//待付款 配送订单
    orderDetails:null,//其它状态订单详情
    timeout:'',
    zero:false,
    iphone:false, //适配iphonex
    orderResource:"",//只有一个订单时的订单类型
    surplusCount:"",//云店多人拼团活动剩余的拼团人数
    groupDoneTime:"",//剩余拼团时间
    storeGoodsId:"",//云店多人拼团商品编码
    activityCode:"",//云店多人拼团活动的活动编码
    groupCode:"",//云店多人拼团活动的订单时的拼团编码
    groupStatus:"",//云店多人拼团活动的订单商品的拼团状态 0已取消，1：进行中，2：已完成
    maskShow:false,//再次购买阴影
    productList:"",//弹框商品
    auditStatus:'',//审核状态 1:通过 0：驳回
    orderType:'',//自提20 配送10
    soldOutGoodsDtoList:'',//下架商品
    cartGoodsInfoList:'',//加入购物车商品
    editFlag:'',//修改地址标识：0，不可修改，1，可修改，默认为1
    refundStatus:'',//退款状态：1：已退款，2：退款中
    skuId:'',//再次购买显示
    reason:'',//退款原因
    hasTicket:false,//水票购买显示
    ticketDeduction:''//使用水票1 未使用0
  },
   //关闭弹框我在想想
   cancelmask: function (e) {
    this.triggerEvent('cancelbutton')
    this.setData({
      maskShow: false,
    })
  },
    //跳转到购物车页面
  toHome(){
    this.addGoodCard();
  },
  //剩余拼团时间倒计时
  groupCountDownTime(time){
    let tm= time.substring(0, 19);//拼团结束时间
    let doneTime= (new Date(tm.replace(/-/g,"/"))).getTime();
    let times = (doneTime - (new Date()).getTime()) / 1000;
    let timer = null;
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
      hour= hour;
      minute= minute;
      second= second;
      this.setData({
        groupDoneTime:hour+":"+minute+":"+second
      })
      if (times < 0) {
        clearInterval(timer);
      }
    },1000)  
  },
  //获取分享图片
  getShareImg(item){
    var thats = this;
      let promise1 = new Promise(function (resolve, reject) {
        /* 获得要在画布上绘制的图片 */
        wx.getImageInfo({
          src: thats.data.imgHttp+item.orderItemList[0].goodsPhoto,
          success: function (res) {
            resolve(res);
          }
        })
      });
      let promise2 = new Promise(function (resolve, reject) {
        wx.getImageInfo({
          src: '../../image/smallIcon.png',
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
        ctx.drawImage('../../' + res[1].path, 0, 0, 86, 86)
        ctx.drawImage('../../' + res[2].path, 0, 230, 400, 86)

        /* 绘制文字 位置自己计算 参数自己看文档 */
        ctx.setTextAlign('left');                        //  位置

        ctx.setFillStyle('red');                    //  颜色
        ctx.setFontSize(36);                            //  字号
        ctx.fillText(floatObj.divide(item.orderPrice,100).toFixed(2), 51,287);

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
                shareImg: res.tempFilePath,
                hidden: false
              });
            },
            fail: function (res) {
            }
          })
        })
      })
  },
  //套餐详情
  mealDetail(e) {
    let meals = e.currentTarget.dataset.meals;
    let orderDetails = [];
    if(this.data.orderStatus != 10){
      orderDetails = this.data.orderDetails;
      let newdata = orderDetails.map(item => {
        item.orderItemList.map(val=>{
          if (val.orderCode == meals) {
            val.detailshow = !val.detailshow
          }
        })
        return item
      })
      this.setData({
        orderDetails: newdata
      })
    }else{
      orderDetails = this.data.peisongOrderDetails;
      let newdata = orderDetails.orderList.map(item => {
        item.orderItemList.map(val=>{
          if (val.orderCode == meals) {
            val.detailshow = !val.detailshow
          }
        })
        return item
      })
      orderDetails.orderList = newdata;
      this.setData({
        peisongOrderDetails: orderDetails
      })
    }
  },
  //获取订单详情
  getOrderInfo(){
    let that=this;
    wx.showLoading({
      title:"加载中..."
    });
    if(this.data.orderStatus==10){//待付款状态
      service.getWaitePayOrderDetail({
        payGroupCode:that.data.payGroupCode
      }).then((res)=>{
        that.getWaitePayOrderSuccess(res);
      });
    }else{//其它状态
      service.getOrderInfo({
        orderCode:that.data.orderCode
      }).then((res)=>{
        wx.hideLoading();
        if (res.data.result == 200) {
          let info=res.data.data;
          let hasTicket = false;
          info.ticketDeduction=0;//水票抵扣
          info.createTime = info.createTime.substring(0,19);//下单时间
          if(info.orderResource==5){//拼团
            info.estimateReceiveTime = info.estimateReceiveTime?info.estimateReceiveTime.substring(0,10):"";//预计取货时间
          }else if(info.orderResource==20||info.orderResource==30){//水管家
            info.estimateReceiveTime = info.estimateReceiveTime?info.estimateReceiveTime.substring(0,19):"";//预约时间
          }
          info.receiveTime = info.receiveTime ? info.receiveTime.substring(0, 19) : '';
          if(info.orderResource==20){//水管家
            info.orderItemList.forEach(val => {
              if (val.ticketDeduction > 0) {//水票展示
                hasTicket = true;
              }
              info.ticketDeduction+=val.ticketDeduction;//水票抵扣数
            })
          }
          if (info.orderResource==30){//水套餐
            info.orderItemList.forEach(val => {
              val.detailshow = false;
              let obj = {
                goodsPhoto: val.goodsPhoto,
                goodsName: val.goodsName,
                seriesCount: val.seriesCount,
                main:1
              };
              val.giftGoodsList.unshift(obj)
            })
          }
          if(info.orderResource==40){//云店
            let receiveTime = info.estimateReceiveTime;//自提时间
            info.estimateReceiveTime = receiveTime?receiveTime.substring(5):"";//自提时间
            let delStartTime = info.estimateDeliveryStartTime;//配送开始时间
            let delEndTime = info.estimateDeliveryEndTime;//配送结束时间
            info.estimateDeliveryTime = delStartTime?delStartTime.substring(5)+"-"+delEndTime.substring(11):"";//配送时间
            info.buyOneGetOneList=[];//买一送一 赠品列表
            info.secondHalfPriceDiscount = 0;//第二件半价优惠信息 分
            info.manyPriManyFolds="";//多件多折的折扣设置
            info.orderItemList.forEach(val=>{
              if(val.activityType==50){//买一送一
                info.buyOneGetOneList.push({
                  goodsPhoto:val.goodsPhoto,
                  goodsCount:val.goodsCount
                })
              }
              if(val.activityType==60){//第二件半价
                if(val.goodsCount>=2){
                  let minusNum = Math.floor(val.goodsCount / 2);
                  info.secondHalfPriceDiscount+=(val.goodsPrice*1*0.5*minusNum);
                }
              }
              if(val.activityType==70){//多件多折
                let manyPriManyFolds = "";
                if(info.manyPriManyFoldsLists&&info.manyPriManyFoldsLists.length>0){
                  info.manyPriManyFoldsLists.forEach(el=>{
                    manyPriManyFolds += el.count+"件"+el.discount/10+"折，";
                  });
                  info.manyPriManyFolds = manyPriManyFolds.substring(0,manyPriManyFolds.length-1);
                }else{
                  info.manyPriManyFolds = "多件多折";
                }
              }
              if(val.activityType==80){//好物预售
                info.goodsThingToBooking = true;
              }
              if(val.activityType==90&&info.groupCode){//多人拼团 是参团或者开团购买
                info.manyPeopleGroup = true;
              }
            });
            //多人拼团活动 并且是参团或者发起拼团购买 并且是待收货-自提和待配送-配送还没拼团成功的状态
            if(info.orderResource==40&&(this.data.orderStatus==20||this.data.orderStatus==30||this.data.orderStatus==31)&&info.groupCode&&info.groupStatus==1){
              that.groupCountDownTime(info.groupDoneTime);
              that.getShareImg(info);
            }
          }
          that.setData({
            orderResource: info.orderResource,//门店类型
            branchId: info.branchesId,//云店站点ID
            branchName: info.mecName,//云店站点名称
            groupCode:info.groupCode,//云店 多人拼团活动的拼团编码
            groupStatus:info.groupStatus,//云店 多人拼团活动拼团状态 0已取消，1：进行中，2：已完成
            surplusCount:info.surplusCount,//云店 多人拼团的剩余拼团人数
            storeGoodsId:info.orderItemList[0].goodsCode,//云店多人拼团商品编码
            activityCode:info.orderItemList[0].activityId,//云店多人拼团活动的活动编码
            orderDetails: [info],//订单详情数据
            payOrderCode: [that.data.orderCode], //待付款状态 去支付时传参orderCode数组
            orderType:info.orderType,//配送方式 自提20 配送10
            goodsPhoto:info.goodsPhoto?info.goodsPhoto:"",//商品图片
            orderItemCode:info.orderItemCode?info.orderItemCode:"",
            editFlag:info.editFlag,//修改订单的状态
            refundStatus:info.refundStatus,//退款按钮
            orderStatus:info.orderStatus,//订单状态
            auditStatus: info.auditStatus,//审核状态
            skuId:info.skuId?info.skuId:"",
            hasTicket:hasTicket//水票
          },()=>{
            if(info.orderResource==40&&info.groupCode&&info.groupStatus==1){
              this.getBranchInfo();
            }
          });
        }else{
          wx.showToast({
            title: '当前网络状态较差，请稍后重试',
            icon: 'none',
            duration: 2000
          })
        }
      });
    }
  },
  //获取门店信息
  getBranchInfo(){
    service.getnewcommunity({
      branchId: this.data.branchId
    }).then(res => {
      if(res.data.result==200){
        this.setData({
          cityName:res.data.data.cityName
        })
      }
    })
  },
  //待付款订单详情获取成功
  getWaitePayOrderSuccess(res){
    let that=this;
    wx.hideLoading();
    if (res.data.result == 200) {
      let info=res.data.data;//返回的数据
      let zitiOrderDetails=null;//自提订单详情数据
      let peisongOrderDetails=null;//配送订单详情数据
      let payOrderCode=[];//待付款状态 去支付时传参orderCode数组
      info.map((item,index)=>{
        item.createTime = item.createTime?item.createTime.substring(0,19):"";//下单时间
        if(item.orderResource==5){//拼团
          item.estimateReceiveTime = item.estimateReceiveTime?item.estimateReceiveTime.substring(0,10):"";//预计取货时间
        }else if(item.orderResource==20||item.orderResource==30){//水管家
          item.estimateReceiveTime = item.estimateReceiveTime?item.estimateReceiveTime.substring(0,19):"";//预约时间
        }
        item.receiveTime = item.receiveTime ? item.receiveTime.substring(0, 19):'';
        if(item.orderResource==20){//水管家
          item.ticketDeduction = 0;//抵扣的水票
          item.orderItemList.forEach(val=>{
            item.ticketDeduction += val.ticketDeduction;
          })
        }
        if(item.orderResource==30){//套餐
          item.orderItemList.forEach(val=>{
            val.detailshow = false;
            let obj = {
              goodsPhoto: val.goodsPhoto,
              goodsName: val.goodsName,
              seriesCount: val.seriesCount,
              main:1
            };
            val.giftGoodsList.unshift(obj);
          })
        }
        if(item.orderResource==40){//云店
          let receiveTime = item.estimateReceiveTime;//自提时间
          item.estimateReceiveTime = receiveTime?receiveTime.substring(5):"";//自提时间
          let delStartTime = item.estimateDeliveryStartTime;//配送开始时间
          let delEndTime = item.estimateDeliveryEndTime;//配送结束时间
          item.estimateDeliveryTime = delStartTime?delStartTime.substring(5)+"-"+delEndTime.substring(11):"";//配送时间
          item.buyOneGetOneList = [];//买一送一 赠品列表
          item.secondHalfPriceDiscount = 0;//第二件半价优惠信息 分
          item.manyPriManyFolds = "";//多件多折的折扣设置
          item.orderItemList.forEach(val=>{
            if(val.activityType==50){//买一送一
              item.buyOneGetOneList.push({
                goodsPhoto:val.goodsPhoto,
                goodsCount:val.goodsCount
              })
            }
            if(val.activityType==60){//第二件半价
              if(val.goodsCount>=2){
                let minusNum = Math.floor(val.goodsCount / 2);
                item.secondHalfPriceDiscount+=(val.goodsPrice*1*0.5*minusNum);
              }
            }
            if(val.activityType==70){//多件多折
              let manyPriManyFolds = "";
              if(item.manyPriManyFoldsLists&&item.manyPriManyFoldsLists.length>0){
                item.manyPriManyFoldsLists.forEach(el=>{
                  manyPriManyFolds += el.count+"件"+el.discount/10+"折，";
                });
                item.manyPriManyFolds = manyPriManyFolds.substring(0,manyPriManyFolds.length-1);
              }else{
                item.manyPriManyFolds = "多件多折";
              }
            }
            if(val.activityType==80){//好物预售
              item.goodsThingToBooking = true;
            }
            if(val.activityType==90&&item.groupCode){//多人拼团 是参团或者开团购买
              item.manyPeopleGroup = true;
            }
          })
        }
        if(item.orderType==10){//配送订单  比如水管家+云店（配送）+电商  只有一个收货地址
          if(peisongOrderDetails&&peisongOrderDetails.orderList.length>0){
            peisongOrderDetails.orderList.push(item);
          }else{
            peisongOrderDetails={
              receiverName:item.receiverName,//取货人姓名
              receiverPhone:item.receiverPhone,//取货人手机号
              receiverAddress:item.receiverAddress,//取货地址
              createTime:item.createTime,//下单时间
              orderList:[item]
            };
          }
        }else if(item.orderType==20){ //自提订单  比如拼团+云店（自提） 可以是多个自提站点
          if(zitiOrderDetails&&zitiOrderDetails.orderList.length>0){
            zitiOrderDetails.orderList.push(item);
          }else{
            zitiOrderDetails={
              orderList:[item]
            };
          }
        }
        payOrderCode.push(item.orderCode);
      });
      that.setData({
        zitiOrderDetails: zitiOrderDetails,//自提订单详情数据
        peisongOrderDetails: peisongOrderDetails,//配送订单详情数据
        payOrderCode: payOrderCode//待付款状态 去支付时传参orderCode数组
      });
      let createTime = new Date(res.data.data[0].createTime.split(".")[0].replace(/-/g,"/")).getTime();
      let nowTime = new Date().getTime();
      let newCreateTime = createTime;
      if(createTime>nowTime){//如果创建时间大于当前时间 赋值当前时间
        newCreateTime=nowTime;
      }
      let overTime=newCreateTime+30*60*1000;//超时时间
      that.formDate(overTime,nowTime);//订单超时时间
    }else{
      wx.showToast({
        title: '当前网络状态较差，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    }
  },
  //复制订单编号
  copy(e){
    const orderCode = e.currentTarget.dataset.ordercode;
    wx.setClipboardData({
      data: orderCode,
      success: function (res) {
        wx.showToast({
          title: '已复制到粘贴板',
          icon:'none'
        });
      }
    });
  },
  //待付款倒计时
  formDate(t,nowTime){
    let that = this;
    let time=nowTime?nowTime:new Date().getTime();
    if(t>time){
      let date = new Date(t - time);
      //分
      let m = date.getMinutes();
      if (m < 10) {
        m = '0' + m
      }
      //秒
      let s = date.getSeconds();
      if (s < 10) {
        s = "0" + s
      }
      this.setData({
        timeout: m + ":" + s
      });
      let ss = setTimeout(function () {
        that.formDate(t)
      }, 1000);
      if (t - time < 0) {
        clearTimeout(ss);
        this.setData({
          timeout: "00:00",
          zero:true
        })
      }
    }else{
      this.setData({
        timeout: "00:00",
        zero:true
      });
    }
  },
  //待付款状态 取消订单
  cancelOrder(e) {
    let t = this;
    wx.showModal({
      content: '确定取消订单？',
      cancelColor:"#999999",
      confirmColor:"#F2922F",
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title:"加载中..."
          })
          service.cancelMyOrder({
            getPayGroupCode: t.data.payGroupCode,
            userId:wx.getStorageSync("userId")
          }).then((data) => {
            wx.hideLoading();
            if (data.data.result == 200){
              wx.showToast({
                title: '取消成功！',
                icon: 'none',
                duration: 1000
              });
              t.setData({//订单状态变成已取消
                zero:true
              })
            }else{
              wx.showToast({
                title: data.data.message,
                icon: 'none',
                duration: 1000
              });
            }
          }).catch(() => {
            wx.hideLoading();
            wx.showToast({
              title: '取消失败！',
              icon: 'none',
              duration: 2000
            })
          })
        } else if (res.cancel) {

        }
      }
    })
  },
  //去支付
  goPay(){
    let t=this;
    wx.showLoading({title: '加载中'});
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
  //去支付
  orderSubmit(){
    let t=this;
    if(this.onClick){
      return;
    }
    this.onClick=true;
    wx.showLoading({
      mask: true,
      title: '加载中...',
    });
    let param={
      openId:wx.getStorageSync("openId"),
      userId:wx.getStorageSync("userId"),
      orderCodes:t.data.payOrderCode
    };
    service.payMyOrder(
        param
    ).then((res)=>{
      if(res.data.result==200){
        service.wxPay(res.data.data).then(() => {
          t.onClick=false;
          wx.showToast({
            title: '支付成功！',
            icon: 'none',
            duration: 1000
          });
          setTimeout(()=>{
            wx.redirectTo({
              url: '../../pages/shoppingPaySucceed/paySucceed',
            })
          },1000);
        }).catch((d) => {
          t.onClick=false;
          wx.hideLoading();
          wx.showModal({
            title: '温馨提示',
            showCancel: false,
            content: '未支付订单将在30分钟内取消，请尽快完成支付~',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
              }
            }
          });
        })
      }else{
        t.onClick=false;
        wx.hideLoading();
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //一键催单
  waterReminder(e){
    let sendCodeRespDto = e.currentTarget.dataset.sendinfo;
    service.waterOrderReminder({
      createTime:sendCodeRespDto.createTime,//派送单创建时间
      sendId:sendCodeRespDto.sendId,//派送单id
      sendNo:sendCodeRespDto.sendNo,//派送单编号
      waterStoreId:sendCodeRespDto.waterStoreId,
      userId:wx.getStorageSync("userId"),//客户ID
      userName:wx.getStorageSync("userInfo").nickName,//客户姓名
      remarks:""//提示消息
    }).then((res)=>{
      if(res.data.result==200){
        wx.showToast({
          title: '催单成功！',
          icon: 'none',
          duration: 1000
        });
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 1000
        });
      }
    })
  },
  //确认收货
  confirmReceipt(e){
    let t=this;
    wx.showModal({
      content:'确定已收到货？',
      cancelColor:"#999999",
      confirmColor:"#F2922F",
      success(res){
        if (res.confirm) {//点击确认
          if(t.data.orderResource==40){//云店
            service.mallReceipt({
              operatorId: wx.getStorageSync("userId"),//操作人ID
              orderCode: t.data.orderCode//订单编号
            }).then(res => {
              if (res.data.result == 200) {
                wx.showToast({
                  title: '订单确认收货成功！',
                  icon: 'none',
                  duration: 2000
                });
                t.setData({
                  orderStatus:40
                });
              } else {
                wx.showToast({
                  title: res.data.message,
                  icon: 'none',
                  duration: 2000
                });
              }
            })
          }else{//更好甄选（指尖商城）
            service.fingerMallConfirmReceipt({
              updateId: wx.getStorageSync("userId"),//操作人ID
              orderCode: t.data.orderCode,//订单编号
              type:2//确认发货
            }).then(res => {
              if (res.data.result == 200) {
                wx.showToast({
                  title: '订单确认收货成功！',
                  icon: 'none',
                  duration: 2000
                });
                t.setData({
                  orderStatus:40
                });
              } else {
                wx.showToast({
                  title: res.data.message,
                  icon: 'none',
                  duration: 2000
                });
              }
            })
          }
        }
      }
    })
  },    
  //申请退款
  drawBack(){
    let item = this.data.orderDetails[0];
    let receiverName=item.receiverName;//收货人
    let receiverPhone=item.receiverPhone;//收货联系电话
    let orderResource = item.orderResource;//门店类型
    let refundStatus=item.refundStatus;//退款状态：1：已退款，2：退款中，0：退款失败
    let orderStatus=item.orderStatus;//配送类型
    if(refundStatus==null){
      wx.navigateTo({
        url: `/pages/applicationForDrawback/index?receiverName=${receiverName}&receiverPhone=${receiverPhone}&orderCode=${this.data.orderCode}&orderResource=${orderResource}&orderStatus=${orderStatus}`,
      })
    }else{
      wx.navigateTo({
        url: `/pages/personalOrderDetail/index?refundStatus=${refundStatus}`,
      })
    }
  },
  //再次购买经纬度
  goShoppingCar() {
    let isdefault=wx.getStorageSync('isdefault');
    let isaddress=wx.getStorageSync('isaddress');
    let latitude='';
    let longitude='';
    if(isaddress){
     latitude=isaddress.latitude;
     longitude=isaddress.longitude;
     this.buyAgainCheck(latitude,longitude);
    }else if(isdefault){
      latitude=isdefault.latitude;
      longitude=isdefault.longitude;
      this.buyAgainCheck(latitude,longitude);
    }else{
      this.getUserLocation();
    }
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
        that.buyAgainCheck(latitude,longitude);
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
  //再次购买
  buyAgainCheck(latitude,longitude){
    let currentCloudShop=wx.getStorageSync('currentCloudShop');//获取本地存储
    wx.showLoading({
      title:"加载中..."
    });
    service.buyAgainCheck({
      branchesId:currentCloudShop?currentCloudShop.siteId:"",
      orderCode:this.data.orderCode,
      latitude:latitude,
      longitude:longitude,
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result!==200){
        wx.showToast({
          title: '当前网络状态较差，请稍后重试',
          icon: 'none',
        });
        return;
      }
      let soldOutGoodsDtoList=res.data.data.soldOutGoodsDtoList;//已下架商品
      let cartGoodsInfoList=res.data.data.cartGoodsInfoList;//加入购物车商品
      if(soldOutGoodsDtoList.length>0&&cartGoodsInfoList.length>0){//已下架商品和加入购物车商品
       this.setData({
        soldOutGoodsDtoList:soldOutGoodsDtoList,
        maskShow:true,
        cartGoodsInfoList:cartGoodsInfoList,
       })
      }else if(soldOutGoodsDtoList.length>0&&cartGoodsInfoList.length==0){//只有已下架的商品
        wx.showToast({
          title: '订单中的商品都卖光了，再看看其他商品吧~',
          icon: 'none',
        });
      }else{
        this.setData({
          cartGoodsInfoList:cartGoodsInfoList
        },()=>{
          this.addGoodCard();
        })
      }
    })
  },
  //添加购物车的方法
  addGoodCard(){
    wx.showLoading({
      title:'加载中'
    })
    service.saveShoppingCartList(
      this.data.cartGoodsInfoList
    ).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        wx.reLaunch({
          url: `/pages/shoppingCar/index`,
        })
      }else{//购买失败
        wx.showToast({
          title: res.data.message,
          icon: 'none',
        });
      }
    })
  },
  //修改订单
  editOrder() {
    wx.navigateTo({
      url: `/pages/waterAddress/index?orderCode=${this.data.orderCode}`,
    })
  },
  //查看退款进度
  schedule(){
    wx.showLoading({
      title:"加载中..."
    });
    service.getOrderInfo({
      orderCode:this.data.orderCode,
      refundMessage:this.data.reason
     }).then((res)=>{
       wx.hideLoading();
     if(res.data.result==200){
       let auditStatus = res.data.data.auditStatus;
       let refundStatus = res.data.data.refundStatus;
       console.log(auditStatus,refundStatus)
      wx.navigateTo({
        url: `/pages/applicationForDrawbackResult/index?auditStatus=${auditStatus}&refundStatus=${refundStatus}&orderResource=${this.data.orderResource}&orderStatus=${this.data.orderStatus}`,
      })
     }else{
       wx.showToast({
         title: res.data.message,
         icon:'none',
       })
     }
     })
  },
  //进店选购
  goBranch(){
    changeCurrentCloudShop(this.data.branchId);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderCode:options.orderCode?options.orderCode:"",
      payGroupCode:options.payGroupCode?options.payGroupCode:"",
      orderStatus:options.orderStatus?options.orderStatus:"",
      orderResource: options.orderResource?options.orderResource:"",
    });
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
    //wx.hideShareMenu()
    let isIPhoneX = app.globalData.isIPhoneX;
    if (isIPhoneX) {
      this.setData({
        iphone: isIPhoneX
      })
    }
    this.getOrderInfo();
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
    //只有正在进行的多人拼团活动的待配送 待收货订单才又分享
    if(this.data.groupCode&&this.data.groupStatus==1&&(this.data.orderStatus==20||this.data.orderStatus==30||this.data.orderStatus==31)){
      let shareCloundShop = {
        cityName:this.data.cityName,
        siteId:this.data.branchId,
        siteName:this.data.branchName,
      };
      let shareImg = this.data.shareImg&&this.data.shareImg.replace(/^http(?=:)/i, 'https');
      return {
        title: `还差${this.data.surplusCount}人即可成团，快来一起拼吧！`, 
        path: '/pages/cloudStoreDetail/index?storeGoodsId=' + this.data.storeGoodsId + '&activityCode=' + this.data.activityCode + '&groupCode=' + this.data.groupCode + '&userId='+ wx.getStorageSync("userId") + '&groupShare=true'+'&shareCloundShop=' + JSON.stringify(shareCloundShop),
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
    }
  }
})