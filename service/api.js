/**
 * 小程序配置文件
 */

// 此处主机域名是腾讯云解决方案分配的域名
// 小程序后台服务解决方案：https://www.qcloud.com/solution/la
// 正式环境
var host = "https://generalstore.gtexpress.cn";
var hostGroup = "https://generalstore.gtexpress.cn/gt-group-wx-api";
var env = "production";
// 预发布环境
// var host = "https://pre-generalstore.gtexpress.cn";
// var hostGroup = "https://pre-generalstore.gtexpress.cn/gt-group-wx-api";
// var env = "pre";
// 测试环境2
// var host = "https://test02-generalstore.gtexpress.cn";
// var hostGroup = "https://test02-generalstore.gtexpress.cn/gt-group-wx-api";
// var env = "test";
// 测试环境1
// var host = "https://test-generalstore.gtexpress.cn";
// var hostGroup = "https://test-generalstore.gtexpress.cn/gt-group-wx-api";
// var env = "test";
// 开发环境
// var host = "https://dev-generalstore.gtexpress.cn";
// var hostGroup = "https://dev-generalstore.gtexpress.cn/gt-group-wx-api";
// var env = "dev";


const API = {
  GETGROUPTEMPLATEID: `${hostGroup}/collect/getGroupTemplateId`,//获取订阅消息模板ID
  LOGIN: `${hostGroup}/user/indexLogin`,//登录接口
  QUERYWAITINGCOUNT: `${hostGroup}/api/communityGroupon/queryWaitingCount`,//查询待取件数量
  QUERYACTIVITYGOODSLIST: `${hostGroup}/api/communityGroupon/queryActivityGoodsList`,//查询限时折扣商品列表
  QUERYMALLGOODSLIST: `${hostGroup}/api/communityGroupon/queryMallGoodsList`,//查询指尖电商商品列表
  QUERYSKUINFO: `${hostGroup}/mall/sku/querySkuInfo`,//获取指尖电商的商品详情
  NEARBYBRANCH: `${hostGroup}/home/branches/getLatelyBranhcesForFifteen`,//获取首最近的一家店铺
  PREFERENCEHOT: `${hostGroup}/homePageActivityGoods/select`,//特惠商品 热销爆品
  SEARCHSTORE: `${hostGroup}/home/branches/getNearbyBrancehsBySearchKey`,//附近门店地图标记
  NEARBYSTORE: `${hostGroup}/home/branches/getNearbyBrancehsForTwenty`,//附近门店搜索
  PAY_WATERHISTORYORDER: `${host}/gt-water-wtorder/api/order/getPaymentAdapter`,//水管家历史订单支付
  SCANBYBARCODE: `${hostGroup}/cvs/sku/scanByBarcode`,//扫码获取商品信息
  GETCODE: `${hostGroup}/cvs/order/getCode`,//扫码自助购订单支付获取code
  ORDERPAY: `${hostGroup}/cvs/order/saveOrder`,//扫码自助购订单支付
  ORDERLIST: `${hostGroup}/cvs/order/getOrderDetailList`,//购买记录
  CONFIRMORDER: `${hostGroup}/cvs/order/cvsConfirmOrder`,//支付成功后调用
  GET_PHONE: `${hostGroup}/api/user/getWxPhone4Home`,//获取绑定手机
  GETUSERINFO: `${host}/gt-crm/api/user/getUserInfo`,//获取用户信息
  GETSCANPICKLIST: `${host}/page/express-wx-api/scannerPick/queryToBeSignInfo`,//查询待签收数据
  SAVESCANFORWX: `${host}/page/express-wx-api/scannerPick/saveSignForWx`,//扫码取件保存
  SENDSMSCODE: `${host}/gt-crm/api/user/sendSmsCode`,//发送验证码
  BINDPHONE: `${host}/gt-crm/api/user/bindPhone`,//绑定手机号
  ADDEXPRESSORDER: `${host}/gt-express-wx-api/send/orderInfo/addOrder`,//发快递下单
  QUERYCARRIERBYTYPE: `${host}/gt-express-wx-api/sendTask/queryCarrierByType`,//根据业务类型获取快递公司列表
  GETPRICEBYWEIGHTANGAREA: `${host}/gt-express-wx-api/sendTask/getPriceByWeightAndArea`,//根据重量和寄收地址获取寄付价格
  GETBRANCHESBYADDRANDBIZ: `${host}/gt-express-wx-api/sendTask/getBranchesByAddrAndBiz`,//根据地址业务场景获取门店列表
  ADDRESS_LIST: `${host}/gt-express-wx-api/address/getAddressBootList`,  //寄收地址簿列表
  ADD_ADDRESS: `${host}/gt-express-wx-api/address/addAddressBook`,   //添加地址
  EDIT_ADDRESS: `${host}/gt-express-wx-api/address/updateAddressBook`,   //编辑地址
  DELETE_ADDRESS: `${host}/gt-express-wx-api/address/delAddressBook`,  //删除地址
  USERQUERYORDERLIST: `${host}/gt-express-wx-api/send/orderInfo/userQueryOrderList`,  //发快递我的订单-我的寄件
  QUERYSIGNINFO: `${host}/gt-express-wx-api/scannerPick/querySignInfo`, //我的取件
  GETORDERDETAIL: `${host}/gt-express-wx-api/send/orderInfo/userQueryOrderInfo`,//发快递订单详情
  GETORDERWU: `${host}/gt-express-wx-api/address/getLogisticsInfo`,  //发快递订单物流信息
  CANCEL_ORDER: `${host}/gt-express-wx-api/send/orderInfo/cancelOrder`,  //快递订单取消
  GET_CITY: `${host}/page/express-wx-api/area/query/region`,   //获取地址城市
  GET_GROUP_TYPE: `${hostGroup}/api/communityGroupon/queryHomeTypeOrCategoryTabList`,   //指尖拼团分类
  GET_GROUP_LIST: `${hostGroup}/api/communityGroupon/queryHomeGoodsList`,   //指尖拼团商品列表
  GET_GOODS_DETAIL: `${hostGroup}/api/communityGroupon/queryActivityGoodsDetail`,   //指尖拼团商品详情
  GET_HISTORY_USER: `${hostGroup}/api/communityGroupon/getGroupGoodsPurchaseHistory`,   //指尖拼团详情购买记录
  SHARELOG: `${hostGroup}/api/cus/share/saveLog`,//分享日志
  ADD_GOODSNUM: `${hostGroup}/shoppingCart/saveShoppingCart`,   //添加指尖拼图商品数量
  SHOPPING_GOODS: `${hostGroup}/shoppingCart/queryShoppingCartList`,   //购物车列表
  GET_SHOPP_NUM: `${hostGroup}/shoppingCart/queryShoppingCartNum`,   //购物车数量
  DEL_SHOPPGOODS: `${hostGroup}/shoppingCart/deleteShoppingCart`,   //清空购物车
  GETBANNERCONFIG: `${hostGroup}/api/communityGroupon/getBannerConfig`,//获取banner配置
  BANNERCONFIGDETAIL: `${hostGroup}/api/communityGroupon/getBannerConfigDetail`,//获取banner活动详情
  ADMINLOGIN: `${hostGroup}/api/groupAdmin/auth`,//管理员登录修改城市
  GETOPENCITY: `${hostGroup}/api/groupAdmin/getOpenCity`,//获取开放城市
  GET_HOME_HOTSALE: `${hostGroup}/api/communityGroupon/queryHotSaleGoods`,   //热销爆品信息
  GET_COMMUNITY: `${hostGroup}/home/branches/queryBranchesLatelyForParam`,   //获取站点信息
  GET_COUPON_HOME: `${hostGroup}/api/card/queryCardListByUserAndGoodsAndStatus`,   //获取卡券信息
  GET_CUSUSERENTITY: `${hostGroup}/api/cus/getCusUserEntity`,//查询用户基本信息
  UPDATE_USERINFO: `${hostGroup}/api/cus/updateUserSexOrBirthday`,//更改用户生日和性别
  GET_WATERTICKET: `${host}/wtorder/api/send/sendBusiess`,//获取用户水票数
  GET_RECEIPTBARCODE: `${hostGroup}/api/cus/getReceiptBarCode`,//获取会员码
  GET_MYPARENTER: `${hostGroup}/wxapi/getMyPartner`,//获取用户合伙人信息
  GET_HISTORYORDERLIST: `${hostGroup}/api/groupOrder/getAllOrderList`,//获取拼团历史订单
  GET_HISTORYORDERNUM: `${hostGroup}/api/groupOrder/getAllOrderListNums`,//获取订单数量接口
  GET_HISTORYORDERINFO: `${hostGroup}/api/groupOrder/getOrderInfo`,//获取拼团历史订单详情
  CANCEL_HISTORYORDER: `${hostGroup}/groupOrder/cancelAndUpdateOrder`,//取消拼团历史订单
  PAY_HISTORYORDER: `${hostGroup}/GroupPay/onLineGroupPay`,//拼团历史订单支付
  GET_HISTORYORDERSUCCESS: `${hostGroup}/GroupPay/confirmGroupOrder`,//拼团历史订单支付成功
  GET_ORDERLIST: `${hostGroup}/ofcOrder/queryUserOrderList`,//我的订单列表查询
  MALLRECEIPT: `${hostGroup}/ofcOrder/mallReceipt`,//云店订单确认收货
  GET_ORDERNUM: `${hostGroup}/ofcOrder/queryUserOrderNum`,//获取订单数量接口
  GET_ORDERDEDETAIL: `${hostGroup}/ofcOrder/queryUserOrderDetail`,//我的订单详情
  CANCEL_MYORDER: `${hostGroup}/ofcOrder/cancelOfcOrder`,//取消我的订单
  PAY_MYORDER: `${hostGroup}/ofcOrder/ofcOrderPay`,//订单支付
  GET_COUPON: `${hostGroup}/shoppingCart/queryCardBySkuInfos`,//订单适用卡券
  GET_BESTCOUPON: `${hostGroup}/shoppingCart/queryOptimalCard`,//订单最优卡券
  CREATE_ORDER: `${hostGroup}/ofcOrder/saveOfcOrder`,//生成订单
  GET_COMMUNITYNEW: `${hostGroup}/api/branch/queryBranchesById`,//首页重新获取站点信息
  GET_LASTNEWINVITEACTIVITY: `${hostGroup}/api/cus/getLatestNewInviteActivity`,//查询最新的邀新活动详情
  // 水管家相关接口
  GET_WATER_ADDRESSLISET: `${host}/wtuser/receiveAddress/addressBusiness`,//水管家收货地址列表
  SET_WATERADDRESSAMEND: `${hostGroup}/shoppingCart/updateWaterGoodsStatus`,//地址修改更改状态
  GET_WATERLIST: `${hostGroup}/waterHomePage/queryHomePageList`,//水管家商品列表
  GET_WATERDETAIL: `${hostGroup}/waterHomePage/selectWaterGoodsInfo`,//水管家商品详情
  GET_WATERMEAL: `${hostGroup}/waterHomePage/selectWtSetMealByParam`,//水管家商品套餐
  GET_WATERORDERLIST: `${hostGroup}/ofcOrder/cartToOrderService`,//水管家订单商品整合
  GET_WATERHISTORYORDERLIST: `${host}/wtorder/order/queryOrders`,//水管家历史订单列表
  GET_DISPATCHINGTIME: `${host}/wtorder/order/getOpenTimes`,//获取商品配送时间
  GET_WATER_TICKETNUM: `${hostGroup}/api/ticket/queryWaterTicketCount`,   //获取我的水票总数
  GET_WATER_TICKET: `${hostGroup}/api/ticket/queryWaterTicketByUserId`,   //获取我的水票
  USERWATERTICKET: `${hostGroup}/api/ticket/useWaterTicket`,   //查询水票能否立即使用
  CANCEL_WATERHISTORYORDER: `${host}/wtorder/api/order/cancellationOrder`,//水管家历史订单取消订单
  CANCEL_WATERHISTORYSENDORDER: `${host}/wtorder/api/sends/cancelSend`,//水管家历史订单取消派送单
  WATERHISTORYREMINDER: `${host}/wtorder/api/sends/getSaveUrge`,//水管家历史订单一键催单
  WATER_CANCEL_SEND: `${hostGroup}/api/wtsend/cancelSend`,//取消水管家派送单
  GET_WAITEPAYORDERDETAIL: `${hostGroup}/ofcOrder/queryUserWaitPayOrderListDetail`,//待付款订单详情
  WATERORDERREMINDER: `${hostGroup}/ofcOrder/clickReminder`,//水管家订单一键催单
  CLOUDSTOREHEADTYPE: `${hostGroup}/small/getSmallClassList`,  //云店商品头部分组
  CLOUDSTOREGOODS: `${hostGroup}/small/getSmallGoodsList`,  //云店商品列表
  CLOUDSTOREGOODETAIL: `${hostGroup}/small/getSmallGoodsInfo`,  //云店商品详情
  CLOUDSTOREDISTANCE: `${hostGroup}/small/isExceedDistance`,  //云店配送距离查询
  CLOUDSTOREDISPATCH: `${hostGroup}/small/querySmallDelivery`,  //云店配送信息
  CLOUDSMARKINGORDER: `${hostGroup}/branchesMarketingCard/queryNotClaimedCardList`,  //云店-营销卡券接口
  CLOUDSDRAOWORDER: `${hostGroup}/branchesMarketingCard/claimedCard`,  //云店-用户领取卡券
  CLOUDSUSABLEORDER: `${hostGroup}/branchesMarketingCard/queryProCanUseCard`,  //云店-提交订单查询可用卡券
  GETMALLDISMONEY:`${hostGroup}/ofcOrder/getMallDisMoney`,//查询指尖商城运费
  GETPEOPLEGROUP: `${hostGroup}/ofcOrder/getPeopleGroup`,//查询多人拼团活动详情中的拼团列表
  QUERYNOTICEBYUSERID: `${hostGroup}/homePage/queryNoticeByUserId`,//首页查询用户通知提示
  QUERYHOMEPAGESMALLPRO: `${hostGroup}/homePage/queryHomePageSmallPro`,//查询首页指尖云店商品信息--云店精选
  GETSMALLGOODSLISTBYACTIVITY: `${hostGroup}/homePage/getSmallGoodsListByActivity`,//查询首页指尖云店商品信息-好物预售 好货团团
  FINGERMALLCLASS: `${hostGroup}/mall/sku/queryMallClass`,//查询更好甄选（指尖电商）的分类列表
  FINGERMALLGETGOODS: `${hostGroup}/mall/sku/querySkuInfoByClass`,//查询更好甄选（指尖电商）商品列表
  FINGERMALLCONFIRMRECEIPT: `${hostGroup}/ofcOrder/changeOrderStatues`,//更改更好甄选（指尖电商）订单状态 确认收货
  GETWXCODEUNLIMIT: `${hostGroup}/mall/sku/getwxacodeunlimit`,//获取指定页面小程序码
};
module.exports =
{
  API,
  hostGroup,
  env
};
