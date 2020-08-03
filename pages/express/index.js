let config = require("../../config.js");
let service = require("../../service/index.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showSelectExpress:false,//选择快递弹层
    showSelectWeight:false,//重量弹层
    showVolume:false,//填写体积弹层
    branchesInfo:null,//网点信息 接口获取
    sendAddress:null,//寄件人地址信息
    /*sendAddress:{//寄件人地址信息
      id:"",//地址id
      name:"",//用户名
      phone:"",//手机
      province:"",//省
      city:"",//市
      area:"",//区
      address:"",//详细地址
    },*/
    receiveAddress:null,//收件人地址信息
    expressData:null,//快递公司数据
    expressCompany:null,//快递公司已选择
    /*expressCompany:{
      parentName:"京东快递",
      parentCode:1,//快递code
      agreedPrice:"1",//协议价格
      skuRegionPriceId:"123",//协议价格ID
    },//快递公司已选择*/
    weight:"1",//重量默认值
    declarativeValueAmount:"",//保价
    guaranteeValueAmount:0,//保费
    volume:{//体积
      long:"",//长
      width:"",//宽
      height:"",//高
    },
    freightPrice:0,//寄付价格 协议价格 + 保费
    agreedPrice:0,//协议价格 大于1kg时保存的价格
    agree:true,//我已阅读
    submitStatus:false,
    isPhoneX:false,
  },
  //快递服务协议  
  protocolClick(){
      wx.navigateTo({
        url: '/pages/expressProtocol/index',
      })
  },
  //验证下单按钮状态
  validate(){
    if(
        this.data.sendAddress&&
        this.data.receiveAddress&&
        this.data.expressCompany&&
        this.data.weight&&
        this.data.volume.long&&
        this.data.volume.width&&
        this.data.volume.height&&
        this.data.agree&&
        parseInt(this.data.agreedPrice)>0
    ){
      this.setData({submitStatus:true})
    }else{
      this.setData({submitStatus:false})
    }
  },
  //获取缓存
  getStorage(){
    let expressInfo=wx.getStorageSync("expressInfo");//先获取缓存
    //console.log(expressInfo);
    wx.removeStorageSync("expressInfo");//再清除缓存
    if(expressInfo){
      //获取网点信息
      this.setData({
        branchesInfo:expressInfo.branchesInfo,//网点信息
        sendAddress:expressInfo.sendAddress,//寄件人地址信息
        receiveAddress:expressInfo.receiveAddress,//收件人地址信息
        expressData:expressInfo.expressData,//快递公司
        expressCompany:expressInfo.expressCompany,//已选择快递
        weight:expressInfo.weight,//重量
        declarativeValueAmount:expressInfo.declarativeValueAmount,//保价（物品声明价值）
        guaranteeValueAmount:expressInfo.guaranteeValueAmount,//保费
        volume:expressInfo.volume,//体积
        agreedPrice:expressInfo.agreedPrice,//协议价格 大于1kg时保存的价格
        agree:expressInfo.agree
      });
      //修改寄件人地址和收件人地址需要 需要请求附件站点 重新获取协议价格
      if(expressInfo.source==1){
        this.getSendTaskBranchesInfo(expressInfo.sendAddress);
        this.getPriceByWeightAndArea();
      }
      this.setFreightPrice();//设置寄付价格
    }else{
      //获取快递公司列表
      this.queryCarrierByType();
    }
  },
  //设置缓存
  setStorage(source){
    let expressInfo={
      branchesInfo:this.data.branchesInfo,//网点信息
      sendAddress:this.data.sendAddress,//寄件人地址信息
      receiveAddress:this.data.receiveAddress,//收件人地址信息
      expressData:this.data.expressData,//快递公司
      expressCompany:this.data.expressCompany,//已选择快递
      weight:this.data.weight,//重量
      declarativeValueAmount:this.data.declarativeValueAmount?this.data.declarativeValueAmount:"",//保价（物品声明价值）
      guaranteeValueAmount:this.data.guaranteeValueAmount,//保费
      volume:this.data.volume,//体积
      agree:this.data.agree,
      agreedPrice:this.data.agreedPrice,//协议价格 大于1kg时保存的价格
      source,
    };
    wx.setStorageSync("expressInfo",expressInfo)
  },
  //设置寄付价格 协议价格 + 保费
  setFreightPrice(){
    let guaranteeValueAmount = this.data.guaranteeValueAmount;//保费
    let price = 0;//快递的协议价格
    if(this.data.agreedPrice){
      price = this.data.agreedPrice;//协议价格
    }
    let freightPrice = price +guaranteeValueAmount;//寄付价格
    this.setData({freightPrice});
    this.validate();
  },
  //寄件人地址簿
  sendClick(){
    this.setStorage(1);
    wx.navigateTo({
      url: '/pages/expressAddsbook/index?addscode=1',
    })
  },
  //收件人地址簿
  receiveClick() {
    this.setStorage(1);
    wx.navigateTo({
      url: '/pages/expressAddsbook/index?addscode=2',
    })
  },
  //选择站点
  goSelectSite(){
    this.setStorage(2);
    let sendAddress=JSON.stringify(this.data.sendAddress);
    if(this.data.branchesInfo){
      if(sendAddress){
        wx.navigateTo({
          url: '/pages/expressSelectSite/index?sendAddress='+sendAddress,
        })
      }
    }
  },
  //选择快递公司
  selectExpress(){
    if (this.data.expressData.length==0){
      wx.showToast({
        title: "未查询到快递公司",
        icon: 'none',
        duration: 2000
      })
    }else{
      this.setData({ showSelectExpress: true })
    }
  },
  //快递选择确定
  sureExpress(val){
    this.setData({showSelectExpress:false,expressCompany:val.detail});
    this.getPriceByWeightAndArea();//根据重量和寄收地址获取协议价格
    this.validate();
  },
  //关闭选择快递公司弹层
  closeExpress(){
    this.setData({showSelectExpress:false})
  },
  //选择重量
  selectWeight(){
    this.setData({showSelectWeight:true})
  },
  //重量选择确定
  sureWeight(val){
    //设置重量
    this.setData({showSelectWeight:false,weight:val.detail.weight});
    this.getPriceByWeightAndArea();//根据重量和寄收地址获取协议价格
    this.validate();
  },
  //重量选择取消
  cancelWeight(){
    this.setData({showSelectWeight:false})
  },
  //保价
  goSupportValue(){
    this.setStorage(2);
    wx.navigateTo({
      url: '/pages/expressSupportValue/index',
    })
  },
  //填写体积
  fillVolume(){
    this.setData({showVolume:true})
  },
  //填写体积确认
  sureVolume(val){
    this.setData({
      showVolume:false,
      volume:val.detail
    });
    this.validate();
  },
  //填写体积关闭
  closeVolume(){
    this.setData({showVolume:false})
  },
  //已阅读快件服务协议
  agreeClick(){
    let agree=!this.data.agree;
    this.setData({agree});
    this.validate();
  },
  //我的订单
  orderfn(){
    wx.redirectTo({
      url: "/pages/expressOrder/index",
    })
  },
  //未取件
  signFor(){
    wx.redirectTo({
      url: "/pages/expressNotTake/index",
    })
  },
  //获取网点列表 循环获取最近的一个
  getSendTaskBranchesInfo(sendAddress){
    let t=this;
    if(sendAddress&&sendAddress.province){
      wx.showLoading({title:"加载中..."});
      service.getBranchesByAddrAndBiz({
        cityName:sendAddress.city,
        address:sendAddress.province+sendAddress.city+sendAddress.area+sendAddress.address
      }).then((res)=>{
        wx.hideLoading();
        if(res.data.result==200){
          let data = res.data.data;
          console.log(t.data.branchesInfo);
          if (!data){
            this.setData({submitStatus:false,branchesInfo:null});
            wx.showToast({
              title: "未匹配到服务门店",
              icon: 'none',
              duration: 2000
            })
          }else{
            //如果当前请求的网点ID不和已经选择的网点ID相同 才重新赋值
            if(!t.data.branchesInfo||(data[0].id!=t.data.branchesInfo.id)){
              t.setData({
                branchesInfo: data[0],//网点信息
              });
            }
          }
        }else{
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },
  //获取快递公司
  queryCarrierByType(){
    let t=this;
    this.setData({
      expressData:null,//快递公司
      expressCompany:null,
    });
    wx.showLoading({title:"加载中..."});
    service.queryCarrierByType({
      type:2,//类型 1-只有派件 2-只有揽件 3-派件+揽件
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result==200){
        let data = res.data.data;
        let carriersList = [];
        if (data){
          data.map((item, index) => {
            if (item.carrierCode.lastIndexOf("jingdong")>-1) {
              carriersList.push(item);
            }
          });
          t.setData({
            expressData: carriersList,//快递公司
            expressCompany: carriersList[0] ? carriersList[0] : null
          });
          //根据重量和寄收地址获取协议价格
          t.getPriceByWeightAndArea();
          t.validate();
        }else{
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  //发快递根据重量和寄收地址获取寄付价格
  getPriceByWeightAndArea(){
    let t=this;
    if(t.data.sendAddress&&t.data.receiveAddress){//已选择寄件和收件地址
      wx.showLoading({title:"加载中..."});
      service.getPriceByWeightAndArea({
        carrierCode:t.data.expressCompany.code,//快递公司code
        startProvince:t.data.sendAddress.province,//始发省
        startCity:t.data.sendAddress.city,//始发市
        endProvince:t.data.receiveAddress.province,//到达省
        endCity:t.data.receiveAddress.city,//到达市
        weight:t.data.weight,
      }).then((res)=>{
        wx.hideLoading();
        if(res.data.result==200){
          t.setData({agreedPrice:res.data.data.price});
          t.setFreightPrice();
        }else{
          t.setData({agreedPrice:0});
          let message = "";
          if(res.data.message){
            message = res.data.message;
          }else{
            message = "当前网络状态较差，请稍后重试";
          }
          wx.showToast({
            title: message,
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },
  //快递下单
  addExpressOrder(){
    let t=this;
    if(this.data.submitStatus){
      wx.getNetworkType({
        success (res) {
          const networkType = res.networkType;
          if(networkType=="none"){//无网络状态时
            wx.showToast({
              title: "网络异常，请稍后重试！",
              icon: 'none',
              duration: 2000
            });
          }else{
            wx.showLoading({title:"加载中..."});
            service.addExpressOrder({
              branchesId:t.data.branchesInfo.id,//网点id
              carrierCode:t.data.expressCompany.code,//快递公司code
              createId:wx.getStorageSync("userId"),//创建人ID
              declarativeValueAmount:t.data.declarativeValueAmount,//声明价值
              freightPrice:t.data.freightPrice,//寄付价格
              guaranteeValueAmount:t.data.guaranteeValueAmount,//保费
              receiveAddressId:t.data.receiveAddress.id,//收件人地址簿id
              //regionPriceId:t.data.expressCompany.skuRegionPriceId,//协议价格id
              sendAddressId:t.data.sendAddress.id,//发件人地址簿id
              vloumHeight:t.data.volume.height,//包裹高度
              vloumLong:t.data.volume.long,//包裹长度
              vloumWidth:t.data.volume.width,//包裹宽度
              weight:t.data.weight//重量
            }).then((res)=>{
              wx.hideLoading();
              if(res.data.result==200){
                let data = res.data.data;
                wx.showToast({
                  title: "下单成功",
                  icon: 'none',
                  duration: 2000
                });
                wx.setStorageSync("sendAddress",t.data.sendAddress);
                wx.redirectTo({
                  url:`/pages/expressSuccess/index?name=${data.linkName}&phone=${data.linkPhone}&address=${data.address}&mecName=${data.mecName}`
                })
              }else{
                wx.showToast({
                  title: "服务异常，请稍后重试！",
                  icon: 'none',
                  duration: 2000
                })
              }
            });
          }
        }
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(this.data.url);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({sendAddress:wx.getStorageSync("sendAddress")});
    if(wx.getStorageSync("sendAddress")){
      this.getSendTaskBranchesInfo(wx.getStorageSync("sendAddress"));
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getStorage();
    let isIPhoneX = app.globalData.isIPhoneX;
    if (isIPhoneX) {
      this.setData({
        isPhoneX: isIPhoneX
      })
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