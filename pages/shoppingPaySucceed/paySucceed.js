const config = require('../../config.js');
const app = getApp();
const until = require('../../utils/util.js');
const service = require('../../service/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showGrowthValueToast:false,//显示积分成长值的提示
    growth:0,//成长值
    credits:0,//积分
    listData:[],//指尖电商列表数据
    showGoodsContent:false,
  },
  //返回首页
  gotoHomeBtn : function (){
    wx.switchTab({
      url: '../../pages/home/index'
    })
  },
  //查看订单
  lookListBtn:function(){
    wx.redirectTo({
      url:'../../pages/personalOrderList/index'
    })
  },
  //获取指尖电商的商品列表
  querySkuInfoTwo(){
    service.querySkuInfoTwo({}).then(res=>{
      let data=res.data.data;
      if(data&&data.length>0){
        let dataDispose=data.map(item=>{
          item.goodsPics=item.goodsPics.split(',')[0],
          item.skuName=item.skuName,
          item.goodsSpec=item.goodsSpec
          return item
        })
        this.setData({
          listData:dataDispose,
        })
      } 
    })
  },
  //更好甄选（指尖云店）商品详情
  fingerMallGoodsDetailClick(e) {
    let { skuCode } = e.currentTarget.dataset.itdetail;
    wx.navigateTo({
      url: '/pages/fingerMallGoodDetail/index?skuCode=' + skuCode,
    })
  },
  onShow() {
  
  },
  onLoad(options){
    let totalMoney = Math.floor(options.totalMoney);
    console.log(totalMoney);
    this.setData({
      showGrowthValueToast:true,//显示积分成长值的提示
      growth:totalMoney,//成长值
      credits:totalMoney,//积分
    });
    this.querySkuInfoTwo()
  }
});