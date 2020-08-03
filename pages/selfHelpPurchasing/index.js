const service = require('../../service/index.js');
import floatObj from '../../utils/floatObj.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    branch:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    
  },
  //去往购物车
  goBuyCar(e){
    let tableIndex=e.target.dataset.index;
    if(!this.data.branch){//没有店铺
      wx.showToast({title:"请扫描店铺二维码",icon:"none"});
      return;
    }
    wx.navigateTo({
      url:"/pages/selfHelpShoppingCar/index?tableIndex="+tableIndex+"&branch="+JSON.stringify(this.data.branch)
    })
  },
  //url解析
  queryParam(url){
    let param={};
    if(url.lastIndexOf("?")>-1){
      let query = url.split("?")[1];
      let arr = query.split("&");
      arr.map((item,index)=>{
        let json = item.split("=");
        param[json[0]]=json[1];
      })
    }
    return param;
  },
  //扫一扫店铺二维码
  branchScan(){
    let t=this;
    wx.scanCode({
      scanType:['barCode', 'qrCode','datamatrix'],//一维码,二维码,Data Matrix 码
      success(res){
        console.log(res);
        let branchUrl = res.result;//当前门店url信息
        let branch={};//当前门店信息
        let json = t.queryParam(branchUrl);
        branch.mecName=json.name;
        branch.branchesId=json.branchesId;
        if(json.branchesId){
          t.setData({branch});
          wx.showModal({
            title:'提示',
            content:`当前店铺：${json.name}`,
            showCancel:false,
            confirmColor:'#F2922F',
            confirmText:"购买商品",
            success(){
              t.goodsScan();
            }
          });
        }else{
          wx.showToast({title:"无法识别店铺，请重新扫描",icon:"none"});
        }
      },
      fail(res){}
    })
  },
  //商品扫一扫
  goodsScan(){
    let t=this;
    if(!this.data.branch){//没有店铺
      wx.showToast({title:"请扫描店铺二维码",icon:"none"});
      return;
    }
    wx.scanCode({
      scanType:['barCode', 'qrCode','datamatrix'],//一维码,二维码,Data Matrix 码
      success(res){
        console.log(res);
        let code = res.result;
        let branch = t.data.branch;//当前门店信息
        wx.showLoading({
          title: '加载中',
        });
        service.scanByBarCode({
          barcode: code,//"6924743917774" 商品条码
          storeId: branch.branchesId,//"1" //门店ID
        }).then((res)=>{
          wx.hideLoading();
          console.log(res.data);
          if(res.data.result==200){
            let data = res.data.data;
            if(!data){//没有返回商品时
              wx.showModal({
                title:'提示',
                content:res.data.message,
                showCancel:false,
                confirmColor:'#F2922F',
                success(){
                  t.goodsScan();
                }
              });
              return;
            }
            let goodsList = wx.getStorageSync("goodsList")||[];
            let hasGoods = false;
            for(let i=0;i<goodsList.length;i++){
              if(goodsList[i].skuCode==data.skuCode){
                ++goodsList[i].num;
                goodsList[i].updateTime=new Date();
                hasGoods = true;
                break;
              }
            }
            if(!hasGoods){
              goodsList.unshift({
                num:1,//数量
                salesPrice:floatObj.divide(data.salesPrice,100).toFixed(2),//商品售价（获取的是分需要除于100转成元）
                barcode:data.barcode,//条形码
                brand:data.brand,//品牌
                skuCode:data.skuCode,//商品编码
                skuName:data.skuName,//商品名称
                specification:data.specification,//商品规格
                version:data.version,//商品版本号
                storeId:data.storeId,//店的ID
                updateTime:new Date()//更新时间
              });
            }
            wx.setStorageSync("goodsList",goodsList);
            wx.navigateTo({
                url:"/pages/selfHelpShoppingCar/index?branch="+JSON.stringify(branch)
            })
          }else{
            wx.showModal({
              title:'提示',
              content:res.data.message,
              showCancel:false,
              confirmColor:'#F2922F',
              success(){
                t.goodsScan();
              }
            })
          }
        });
      },
      fail(res){

      }
    })
  }
});