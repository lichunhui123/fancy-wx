const config = require('../../config.js');
const app = getApp();
const until = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showGrowthValueToast:false,//显示积分成长值的提示
    growth:0,//成长值
    credits:0,//积分
  },
  gotoHomeBtn : function (){
    wx.switchTab({
      url: '../../pages/home/index'
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
  }
});