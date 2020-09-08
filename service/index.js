const API = require('./api.js').API;
const guangtongAjax = (prams)=>{
  const { url, acType, data } = prams;
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: acType,
      data: data,
      header: {
        'content-type': 'application/json', // 默认值
        "token":wx.getStorageSync('token')||''
      },
      success(res) {
        if (res.data.result==200){
          if (res.header.refreshToken) {
            wx.setStorageSync('token', res.header.refreshToken)
          }
          resolve(res)
        }else if(res.data.result==611){
          wx.hideLoading();
          let userInfo = wx.getStorageSync('userInfo');
          if(!userInfo){
            return;
          }
          wx.showToast({
            title: '登录超时',
            icon: 'none',
            duration: 2000
          });
          wx.login({
            success: function (res) {
              if (res.code) {
                wx.request({
                  url: API.LOGIN, //仅为示例，并非真实的接口地址
                  method: "post",
                  data: {
                    code: res.code,
                    avatarUrl: userInfo.avatarUrl,
                    nickName: userInfo.nickName,
                    /*encryptedData: res1.encryptedData,
                    iv: res1.iv*/
                  },
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success(res) {
                    wx.setStorageSync('openId', res.data.data.openId);
                    wx.setStorageSync('userId', res.data.data.userId);
                    let token = res.data.data.token;
                    wx.setStorageSync("token", token);
                    wx.reLaunch({
                      url: '/pages/home/index',
                    })
                  },
                  fail(res) {
                    wx.showToast({
                      title: '当前网络状态较差，请稍后重试',
                      icon: 'none',
                      duration: 2000
                    })
                  }
                })
              }
            }
          })
        }else{
          resolve(res)
        }
        
      },
      fail(res) {
        wx.showToast({
          title: '当前网络状态较差，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        reject(res)
      }
    })
  })
};
//订阅消息
const requestSubscribeMessage = (data)=>{
  return new Promise((resolve, reject) => {
    wx.getSetting({
      withSubscriptions:true,
      success(res){
        console.log(res);
        if(res.subscriptionsSetting.itemSettings){
          if(res.subscriptionsSetting.itemSettings[data[0]]!=="reject"){
            wx.requestSubscribeMessage({
              tmplIds: data.tmplIds,
              success (res) {
                resolve(res);
              },
              fail (res) {
                reject(res);
              }
            })
          }else{
            resolve();
          }
        }else{
          wx.requestSubscribeMessage({
            tmplIds: data.tmplIds,
            success (res) {
              resolve(res);
            },
            fail (res) {
              reject(res);
            }
          })
        }
      }
    });
  })
};
//获取订阅消息模板ID
const getGroupTemplateId= (param) =>{
  return guangtongAjax({
    data: param,
    url: API.GETGROUPTEMPLATEID,
    acType: 'post'
  })
};
//登录
const getUser = (param) => {
  return guangtongAjax({
    data: param,
    url: API.LOGIN,
    acType: 'post'
  })
};
//查询待取件数量
const queryWaitingCount = (param) => {
  return guangtongAjax({
    data: param,
    url: API.QUERYWAITINGCOUNT,
    acType: 'post'
  })
};
//查询指尖电商商品列表
const queryMallGoodsList = (param) => {
  return guangtongAjax({
    data: param,
    url: API.QUERYMALLGOODSLIST,
    acType: 'post'
  })
};
//获取指尖电商的商品详情
const querySkuInfo = (param) => {
  return guangtongAjax({
    data: param,
    url: API.QUERYSKUINFO,
    acType: 'post'
  })
};
//查询限时折扣商品列表
const queryActivityGoodsList = (param) => {
  return guangtongAjax({
    data: param,
    url: API.QUERYACTIVITYGOODSLIST,
    acType: 'post'
  })
};
//首页附近门店
const getLatelyBranhcesForFifteen = (param) => {
  return guangtongAjax({
    data: param,
    url: API.NEARBYBRANCH,
    acType: 'post'
  })
};
//特惠商品 热销爆品
const getPreferenceHot = (cityName)=>{
  return guangtongAjax({
    //data:param,
    url:API.PREFERENCEHOT+"?cityName="+cityName,
    acType:'post'
  })
};
//查询门店
const getSearchStore = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.SEARCHSTORE,
    acType: 'post'
  })
};
//附近门店地图标记点
const getNearbyStore = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.NEARBYSTORE,
    acType: 'post'
  })
};
//水管家订单支付
const payWaterHistoryOrder = (param)=>{
  return guangtongAjax({
    data:param,
    url:API.PAY_WATERHISTORYORDER,
    acType:'post'
  })
};
//扫码获取商品信息
const scanByBarCode = (param)=>{
  return guangtongAjax({
    data:param,
    url:API.SCANBYBARCODE,
    acType:'post'
  })
};
//扫码自助购订单支付获取code
const getCode = (param)=>{
  return guangtongAjax({
    data:param,
    url:API.GETCODE,
    acType:'post'
  })
};
//扫码自助购支付
const orderPay = (param)=>{
  return guangtongAjax({
    data:param,
    url:API.ORDERPAY,
    acType:'post'
  })
};
//购买记录
const orderList = (param)=>{
  return guangtongAjax({
    data:param,
    url:API.ORDERLIST,
    acType:'post'
  })
};
//支付成功后
const confirmOrder = (param)=>{
  return guangtongAjax({
    data:param,
    url:API.CONFIRMORDER,
    acType:'post'
  })
};
//获取绑定手机
const getPhone = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GET_PHONE}`,
    acType: 'post'
  })
};
//获取用户信息
const getUserInfo = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GETUSERINFO}`,
    acType: 'post'
  })
};
//获取扫码签收的列表数据
const getScanPickList = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GETSCANPICKLIST}`,
    acType: 'post'
  })
};
//扫码取件保存
const saveScanForWx = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.SAVESCANFORWX}`,
    acType: 'post'
  })
};
//绑定手机发送验证码
const sendCode = (param)=>{
  return guangtongAjax({
    data:param,
    url:API.SENDSMSCODE,
    acType:'post'
  })
};
//绑定手机
const bindPhone = (param) => {
  return guangtongAjax({
    data: param,
    url: API.BINDPHONE,
    acType: 'post'
  })
};
//地址簿列表数据
const addresslist = (param) => {
  return guangtongAjax({
    data: param,
    url: API.ADDRESS_LIST,
    acType: 'post'
  })
};
//添加地址
const addaddress = (param) => {
  return guangtongAjax({
    data: param,
    url: API.ADD_ADDRESS,
    acType: 'post'
  })
};
//编辑地址   DELETE_ADDRESS
const editaddress = (param) => {
  return guangtongAjax({
    data: param,
    url: API.EDIT_ADDRESS,
    acType: 'post'
  })
};
//删除地址   
const deleteaddress = (param) => {
  return guangtongAjax({
    data: param,
    url: API.DELETE_ADDRESS,
    acType: 'post'
  })
};
//发快递我的订单-我的寄件
const userQueryOrderList = (param) => {
  return guangtongAjax({
    data: param,
    url: API.USERQUERYORDERLIST,
    acType: 'post'
  })
};
//我的取件
const querySignInfo = (param) => {
  return guangtongAjax({
    data: param,
    url: API.QUERYSIGNINFO,
    acType: 'post'
  })
};
//发快递订单详情 GETORDERWU
const getOrderDetail = (param)=>{
  return guangtongAjax({
    data:param,
    url:API.GETORDERDETAIL,
    acType:'post'
  })
};
//发快递订单物流详情 
const getOrderwu = (param) => {
  return guangtongAjax({
    data: param,
    url: API.GETORDERWU,
    acType: 'post'
  })
};
//快递取消订单  
const cancelorder = (param) => {
  return guangtongAjax({
    data: param,
    url: API.CANCEL_ORDER,
    acType: 'post'
  })
};
const getcity = (param) => {
  return guangtongAjax({
    data: param,
    url: API.GET_CITY,
    acType: 'post'
  })
};
//发快递下单
const addExpressOrder = (param)=>{
  return guangtongAjax({
    data:param,
    url:API.ADDEXPRESSORDER,
    acType:'post'
  })
};
//根据业务类型获取快递公司列表
const queryCarrierByType= (param)=>{
  return guangtongAjax({
    data:param,
    url:API.QUERYCARRIERBYTYPE,
    acType:'post'
  })
};
//发快递根据重量和寄收地址获取寄付价格
const getPriceByWeightAndArea= (param)=>{
  return guangtongAjax({
    data:param,
    url:API.GETPRICEBYWEIGHTANGAREA,
    acType:'post'
  })
};
//根据地址业务场景获取门店列表
const getBranchesByAddrAndBiz= (param)=>{
  return guangtongAjax({
    data:param,
    url:API.GETBRANCHESBYADDRANDBIZ,
    acType:'post'
  })
};
//指尖拼团头部分类 
const getgrouptype = (param) => {
  return guangtongAjax({
    data: param,
    url: API.GET_GROUP_TYPE,
    acType: 'post'
  })
};
//指尖拼团商品列表 
const getgrouplist= (param) => {
  return guangtongAjax({
    data: param,
    url: API.GET_GROUP_LIST,
    acType: 'post'
  })
};
//指尖拼团商品详情  
const getgoodsdetail = (param) => {
  return guangtongAjax({
    data: param,
    url: API.GET_GOODS_DETAIL,
    acType: 'post'
  })
};
//分享日志   
const shareLog = (param) => {
  return guangtongAjax({
    data: param,
    url: API.SHARELOG,
    acType: 'post'
  })
};
//添加商品数量   
const addgoodnum = (param) => {
  return guangtongAjax({
    data: param,
    url: API.ADD_GOODSNUM, 
    acType: 'post'
  })
};
//购物车商品   
const shoppinggoods = (param) => {
  return guangtongAjax({
    data: param,
    url: API.SHOPPING_GOODS, 
    acType: 'post'
  })
};
//购物车数量  
const shoppingnum = (param) => {
  return guangtongAjax({
    data: param,
    url: API.GET_SHOPP_NUM,
    acType: 'post'
  })
};
//清空购物车   
const delshoppinggoods = (param) => {
  return guangtongAjax({
    data: param,
    url: API.DEL_SHOPPGOODS,
    acType: 'post'
  })
};
//获取首页bannerconfig
const getBannerConfig=(param)=>{
  return guangtongAjax({
    data:param,
    url:`${API.GETBANNERCONFIG}`,
    acType:'post'
  })
};
//banner活动详情页
const getBannerDetail=(param)=>{
  return guangtongAjax({
    data:param,
    url:`${API.BANNERCONFIGDETAIL}`,
    acType:'post'
  })
};
//管理员登录修改城市定位
const adminLogin=(param)=>{
  return guangtongAjax({
    data:param,
    url:`${API.ADMINLOGIN}`,
    acType:'post'
  })
};
//获取开放城市
const getOpenCity=(param)=>{
  return guangtongAjax({
    data:param,
    url:`${API.GETOPENCITY}`,
    acType:'post'
  })
};
//热销爆品信息   
const gethomehotsale = (param) => {
  return guangtongAjax({
    data: param,
    url: API.GET_HOME_HOTSALE,
    acType: 'post'
  })
};
//获取站点信息    
const getcommunity = (param) => {
  return guangtongAjax({
    data: param,
    url: API.GET_COMMUNITY,
    acType: 'post'
  })
};
//优惠券   
const getcoupondata = (param) => {
  return guangtongAjax({
    data: param,
    url: API.GET_COUPON_HOME,
    acType: 'post'
  })
};
//查询用户基本信息
const getCusUserEntity = (param) => {
  return guangtongAjax({
    data: param,
    url: API.GET_CUSUSERENTITY,
    acType: 'post'
  })
};
//查询用户基本信息
const updateUserInfo = (param) => {
  return guangtongAjax({
    data: param,
    url: API.UPDATE_USERINFO,
    acType: 'post'
  })
};

//获取会员码
const getReceiptBarcode = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.GET_RECEIPTBARCODE,
    acType: "post"
  })
};
//获取用户合伙人信息
const getMyPartner = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.GET_MYPARENTER,
    acType: "post"
  })
};
//获取拼团历史订单
const getHistoryOrderList = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.GET_HISTORYORDERLIST,
    acType: "post"
  })
};
//获取拼团历史订单数量
const getHistoryOrderNum = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.GET_HISTORYORDERNUM,
    acType: "post"
  })
};
//删除拼团历史订单数量
const cancelHistoryOrder = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.CANCEL_HISTORYORDER,
    acType: "post"
  })
};
//拼团历史订单支付
const payHistoryOrder = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.PAY_HISTORYORDER,
    acType: "post"
  })
};
//拼团历史订单支付成功
const historyOrderSuccess = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.GET_HISTORYORDERSUCCESS,
    acType: "post"
  })
};
//我的拼团订单列表
const getOrderList = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.GET_ORDERLIST,
    acType: "post"
  })
};
//云店订单确认收货
const mallReceipt = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.MALLRECEIPT,
    acType: 'post'
  })
};
//获取我的订单数量
const getOrderNum = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.GET_ORDERNUM,
    acType: "post"
  })
};
//我的拼团订单详情
const getOrderInfo = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.GET_ORDERDEDETAIL,
    acType: "post"
  })
};
//取消我的拼团订单
const cancelMyOrder = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.CANCEL_MYORDER,
    acType: "post"
  })
};
//立即付款 我的拼团订单
const payMyOrder = (param)=>{
  return guangtongAjax({
    data: param,
    url: API.PAY_MYORDER,
    acType: "post"
  })
};
//提交订单匹配适用卡券
const getcoupon = (param) => {
  return guangtongAjax({
    data: param,
    url: API.GET_COUPON,
    acType: "post"
  })
}; 
//提交订单匹配适用卡券  
const getbestcoupon = (param) => {
  return guangtongAjax({
    data: param,
    url: API.GET_BESTCOUPON,
    acType: "post"
  })
}; 
//生成订单  
const createorder = (param) => {
  return guangtongAjax({
    data: param,
    url: API.CREATE_ORDER,
    acType: "post"
  })
}; 
//重新获取最新的站点 
const getnewcommunity = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GET_COMMUNITYNEW}`,
    acType: 'post'
  })
};
//调取微信支付功能   
const wxPay = (param) => {
  return new Promise((resolve,reject)=>{
    wx.requestPayment({
      timeStamp: param.timestamp,
      nonceStr: param.nonceStr,
      package: param.packageStr,
      signType: param.signType,
      paySign: param.sign,
      success(res) {
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
};
//查询最新的邀新活动详情
const getLastNewInviteActivity = (param)=>{
  return guangtongAjax({
    data: param,
    url: `${API.GET_LASTNEWINVITEACTIVITY}`,
    acType: 'post'
  })
};

// 水管家相关接口

//水管家收货地址  
const getwateraddresslist = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GET_WATER_ADDRESSLISET}`,
    acType: 'post'
  })
};
//修改水地址更改状态  
const setwaterorderamend = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.SET_WATERADDRESSAMEND}`,
    acType: 'post'
  })
};
//水管家商品列表   
const getwaterlist = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GET_WATERLIST}`,
    acType: 'post'
  })
};
//水管家商品详情    
const getwaterdetail = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GET_WATERDETAIL}`,
    acType: 'post'
  })
};
//水管家商品套餐   
const getwatermeal = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GET_WATERMEAL}`,
    acType: 'post'
  })
};
//获取水管家历史订单列表   
const getWaterHistoryOrderList = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GET_WATERHISTORYORDERLIST}`,
    acType: 'post'
  })
};
//获取水管家商品配送时间  
const getdispatchingtime = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GET_DISPATCHINGTIME}`,
    acType: 'post'
  })
};
//获取我的水票总数   
const getmywaterticketnum = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GET_WATER_TICKETNUM}`,
    acType: 'post'
  })
};
//获取我的水票    
const getmywaterticket = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GET_WATER_TICKET}`,
    acType: 'post'
  })
};
//获取我的水票    
const userwaterticket = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.USERWATERTICKET}`,
    acType: 'post'
  })
};
//水管家历史订单取消订单
const cancelWaterHistoryOrder = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.CANCEL_WATERHISTORYORDER}`,
    acType: 'post'
  })
};
//水管家历史订单取消派送单
const cancelWaterHistorySendOrder = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.CANCEL_WATERHISTORYSENDORDER}`,
    acType: 'post'
  })
};
//水管家历史订单一键订单   
const waterHistoryReminder = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.WATERHISTORYREMINDER}`,
    acType: 'post'
  })
};
//水管家订单商品整合 
const getwaterorderlist = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GET_WATERORDERLIST}`,
    acType: 'post'
  })
};
//取消水管家派送单
const waterCancelSend = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.WATER_CANCEL_SEND}`,
    acType: 'post'
  })
};
//待付款订单详情
const getWaitePayOrderDetail = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GET_WAITEPAYORDERDETAIL}`,
    acType: 'post'
  })
};
//水管家订单一键催单
const waterOrderReminder = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.WATERORDERREMINDER}`,
    acType: 'post'
  })
};

//云店相关接口

//云店商品头部分组接口
const cloudStoreHeadType = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.CLOUDSTOREHEADTYPE}`,
    acType: 'post'
  })
};
//云店商品列表接口
const cloudStoreGoods = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.CLOUDSTOREGOODS}`,
    acType: 'post'
  })
};
//云店商品详情
const cloudStoreGoodDetail= (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.CLOUDSTOREGOODETAIL}`,
    acType: 'post'
  })
};
//云店配送距离查询
const cloudStoredistance= (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.CLOUDSTOREDISTANCE}`,
    acType: 'post'
  })
};
//云店配送信息
const cloudStoredispatch= (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.CLOUDSTOREDISPATCH}`,
    acType: 'post'
  })
};
//云店-营销卡券接口
const cloudMarkingOrder= (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.CLOUDSMARKINGORDER}`,
    acType: 'post'
  })
};
//云店-用户领取卡券
const cloudDraowOrder= (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.CLOUDSDRAOWORDER}`,
    acType: 'post'
  })
};
//云店-提交订单查询可用卡券
const cloudUsableOrder= (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.CLOUDSUSABLEORDER}`,
    acType: 'post'
  })
};
//查询指尖商城运费
const getMallDisMoney= (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GETMALLDISMONEY}`,
    acType: 'post'
  })
};
//云店-多人拼团活动详情查询拼团列表
const getPeopleGroup= (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GETPEOPLEGROUP}`,
    acType: 'post'
  })
};
//首页查询用户通知提示
const queryNoticeByUserId= (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.QUERYNOTICEBYUSERID}`,
    acType: 'post'
  })
};
//首页查询指尖云店商品-云店精选
const queryHomePagSmallPro= (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.QUERYHOMEPAGESMALLPRO}`,
    acType: 'post'
  })
};
//首页查询指尖云店商品-好物预售 好货团团
const getSmallGoodsListByActivity= (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GETSMALLGOODSLISTBYACTIVITY}`,
    acType: 'post'
  })
};
//查询更好甄选（指尖电商）的分类列表
const fingerMallClass = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.FINGERMALLCLASS}`,
    acType: 'post'
  })
};
//查询更好甄选（指尖电商）的商品列表
const fingerMallGetGoods = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.FINGERMALLGETGOODS}`,
    acType: 'post'
  })
};
//更改更好甄选（指尖云店）订单状态 确认收货
const fingerMallConfirmReceipt = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.FINGERMALLCONFIRMRECEIPT}`,
    acType: 'post'
  })
};
//获取指定页面小程序码
const getwxacodeunlimit = (param) => {
  return guangtongAjax({
    data: param,
    url: `${API.GETWXCODEUNLIMIT}`,
    acType: 'post'
  })
};
module.exports = {
  requestSubscribeMessage,
  getGroupTemplateId,
  getUser,
  queryWaitingCount,
  queryMallGoodsList,
  querySkuInfo,
  queryActivityGoodsList,
  getLatelyBranhcesForFifteen,
  getPreferenceHot,
  getSearchStore,
  getNearbyStore,
  payWaterHistoryOrder,
  scanByBarCode,
  getCode,
  orderPay,
  orderList,
  confirmOrder,
  getPhone,
  getUserInfo,
  getScanPickList,
  saveScanForWx,
  sendCode,
  bindPhone,
  addExpressOrder,
  queryCarrierByType,
  getPriceByWeightAndArea,
  getBranchesByAddrAndBiz,
  addresslist,
  addaddress,
  editaddress,
  deleteaddress,
  userQueryOrderList,
  querySignInfo,
  getOrderDetail,
  cancelorder,
  getcity,
  getOrderwu,
  getgrouptype,
  getgrouplist,
  getgoodsdetail,
  shareLog,
  addgoodnum,
  shoppinggoods,
  shoppingnum,
  delshoppinggoods,
  getBannerConfig,
  getBannerDetail,
  adminLogin,
  getOpenCity,
  gethomehotsale,
  getcommunity,
  getcoupondata,
  getCusUserEntity,
  updateUserInfo,
  getReceiptBarcode,
  getMyPartner,
  getHistoryOrderList,
  getHistoryOrderNum,
  cancelHistoryOrder,
  payHistoryOrder,
  wxPay,
  historyOrderSuccess,
  getOrderList,
  mallReceipt,
  getOrderNum,
  getOrderInfo,
  cancelMyOrder,
  payMyOrder,
  getcoupon,
  getbestcoupon,
  createorder,
  getnewcommunity,
  getLastNewInviteActivity,
  getwateraddresslist,
  getwaterlist,
  getwaterdetail,
  getwatermeal,
  getWaterHistoryOrderList,
  getdispatchingtime,
  getmywaterticket,
  getmywaterticketnum,
  cancelWaterHistoryOrder,
  cancelWaterHistorySendOrder,
  waterHistoryReminder,
  getwaterorderlist,
  waterCancelSend,
  getWaitePayOrderDetail,
  userwaterticket,
  setwaterorderamend,
  waterOrderReminder,
  cloudStoreGoods,
  cloudStoreHeadType,
  cloudStoreGoodDetail,
  cloudStoredispatch,
  cloudStoredistance,
  cloudMarkingOrder,
  cloudDraowOrder,
  cloudUsableOrder,
  getMallDisMoney,
  getPeopleGroup,
  queryNoticeByUserId,
  queryHomePagSmallPro,
  getSmallGoodsListByActivity,
  fingerMallClass,
  fingerMallGetGoods,
  fingerMallConfirmReceipt,
  getwxacodeunlimit
};