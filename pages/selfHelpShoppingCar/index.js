const service = require('../../service/index.js');
import floatObj from '../../utils/floatObj.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    branchName:'',//当前店铺名
    tableIndex:1,
    total:0,//总价
    showConfirm:false,
    noSelect:false,//有没有已选商品
    noRecord:false,//有没有购买记录
    allSelect:true,//全选状态
    goodsList:null,//购物车商品
    orderDetailList:null,//购买记录列表
    pageNum:1,//页码
    pageSize:10,//每页数据
    noMore:false,//没有更多了
    confirmConfig:null,
    loseTime:30*60*1000,//10分钟过期
  },
  //tab切换
  tabClick(e){
    let tableIndex=e.target.dataset.tableindex;
    if(this.data.tableIndex==tableIndex){
      return;
    }
    if(tableIndex==2){
      this.getOrderList();
    }
    this.setData({tableIndex,pageNum:1});
  },
  //弹窗后页面禁止滑动
  myCatchTouch(){
    return;
  },
  //弹窗确认点击事件
  sureClick(){
    //console.log(123);
    if(this.hasLose){
      //console.log(123);
      this.onReady();
    }
    this.setData({showConfirm:false})
  },
  //商品选择事件
  select(e){
    let skuCode = e.target.dataset.skucode;//商品编码
    let allSelect = true;
    this.data.goodsList.forEach((item)=>{
      if(item.skuCode==skuCode){
        item.chiose = !item.chiose;
      }
      if(!item.chiose){
        allSelect = false
      }
    });
    this.setData({goodsList:this.data.goodsList,allSelect});
    this.takeMoney();
  },
  //全选
  allSelect(){
    let allSelect = !this.data.allSelect;
    this.data.goodsList.forEach((item)=>{
      item.chiose = allSelect;
    });
    this.setData({
      allSelect,
      goodsList:this.data.goodsList
    });
    this.takeMoney();
  },
  //计算总价
  takeMoney(){
    let total = 0;
    this.data.goodsList.forEach((item)=>{
      if(item.chiose){
        total=floatObj.add(total,floatObj.multiply(item.salesPrice,item.num));
      }
    });
    this.setData({
      total: total.toFixed(2)
    })
  },
  //购物数加1
  plus(e){
    let skuCode = e.target.dataset.skucode;//商品编码
    let goodsList = [];
    this.data.goodsList.forEach((item)=>{
      if(item.skuCode==skuCode){
        ++item.num;
        item.updateTime=new Date()//更新时间
      }
      goodsList.push({
        num:item.num,//数量
        salesPrice:item.salesPrice,//商品售价
        barcode:item.barcode,//条形码
        brand:item.brand,//品牌
        skuCode:item.skuCode,//商品编码
        skuName:item.skuName,//商品名称
        specification:item.specification,//商品规格
        version:item.version,//商品版本号
        storeId:item.storeId,//店的ID
        updateTime:new Date()//更新时间
      });
    });
    this.setData({goodsList:this.data.goodsList});
    wx.setStorageSync("goodsList",goodsList);//重新设置缓存
    this.takeMoney();
  },
  //购物数减1
  minus(e){
    let skuCode = e.target.dataset.skucode;//商品编码
    let goodsList = [];
    this.data.goodsList.forEach((item)=>{
      if(item.skuCode==skuCode){
        if(item.num<=1){
          item.num = 1;
        }else{
          --item.num;
        }
        item.updateTime=new Date()//更新时间
      }
      goodsList.push({
        num:item.num,//数量
        salesPrice:item.salesPrice,//商品售价
        barcode:item.barcode,//条形码
        brand:item.brand,//品牌
        skuCode:item.skuCode,//商品编码
        skuName:item.skuName,//商品名称
        specification:item.specification,//商品规格
        version:item.version,//商品版本号
        storeId:item.storeId,//店的ID
        updateTime:new Date()//更新时间
      });
    });
    this.setData({goodsList:this.data.goodsList});
    wx.setStorageSync("goodsList",goodsList);//重新设置缓存
    this.takeMoney();
  },
  //删除
  delete(e){
    let t=this;
    let skuCode = e.target.dataset.skucode;//商品编码
    wx.showModal({
      content:"确认删除该商品？",
      showCancel:true,
      cancelColor:"#999999",
      confirmColor:"#F2922F",
      success(res){
        if (res.confirm) {
          let noSelect = false;
          let goodsList = t.data.goodsList;
          let goodsListStorage = wx.getStorageSync("goodsList");//缓存中的商品列表
          for(let i=0;i<goodsList.length;i++){
            if(goodsList[i].skuCode==skuCode){
              goodsList.splice(i,1);
              break;
            }
          }
          for(let i=0;i<goodsListStorage.length;i++){
            if(goodsListStorage[i].skuCode==skuCode){
              goodsListStorage.splice(i,1);
              break;
            }
          }
          if(goodsList.length==0){
            noSelect = true;
          }
          t.setData({goodsList,noSelect});
          t.takeMoney();
          wx.setStorageSync("goodsList",goodsListStorage);//重新设置缓存
        }
      }
    })
  },
  //继续扫码
  scanCode(){
    let t=this;
    let noSelect = false;
    wx.scanCode({
      scanType:['barCode', 'qrCode','datamatrix'],//一维码,二维码,Data Matrix 码
      success(res){
        console.log(res);
        let code = res.result;
        let branch = t.branch;//当前门店信息
        wx.showLoading({
          title: '加载中',
        });
        service.scanByBarCode({
          barcode: code, //商品条码
          storeId: branch.branchesId //门店ID
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
                confirmColor:'#F2922F'
              });
              return;
            }
            let goodsList = t.data.goodsList||[];
            let goodsListStorage = wx.getStorageSync("goodsList")||[];//缓存的商品
            let hasGoods = false;
            for(let i=0;i<goodsList.length;i++){
              if(goodsList[i].skuCode==data.skuCode){
                ++goodsList[i].num;
                goodsList[i].updateTime=new Date();
                break;
              }
            }
            for(let i=0;i<goodsListStorage.length;i++){
              if(goodsListStorage[i].skuCode==data.skuCode){
                ++goodsListStorage[i].num;
                goodsListStorage[i].updateTime=new Date();
                hasGoods = true;
                break;
              }
            }
            if(!hasGoods){
              let goods={
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
              };
              goodsListStorage.unshift(goods);
              goods.chiose=true;
              goodsList.unshift(goods);
            }
            if(goodsList.length==0){
              noSelect = true;
            }
            wx.setStorageSync("goodsList",goodsListStorage);
            t.setData({goodsList,noSelect,tableIndex:1});
            t.takeMoney();
          }else{
            wx.showModal({
              title:'提示',
              content:res.data.message,
              showCancel:false,
              confirmColor:'#F2922F'
            })
          }
        });
      },
      fail(res){

      }
    })
  },
  //去结算
  goPay(){
    let t=this;
    let hasChiose = false;
    let goodsList = this.data.goodsList||[];//当前门店的商品列表
    let nowDate = new Date().getTime();
    let content = [];
    let orderSkuRequestDtos = [];
    let goodsListStorage = wx.getStorageSync("goodsList")||[];//缓存的商品
    for(let i=0;i<goodsList.length;i++){
      let updateTime = new Date(goodsList[i].updateTime).getTime();
      if(goodsList[i].chiose){
        hasChiose = true;
      }
      if((nowDate-updateTime)>t.data.loseTime){//有已失效的商品
        content.push({
          title:goodsList[i].skuName,
          standard:goodsList[i].specification,
          tip:"商品已失效"
        })
      }
      if(goodsList[i].chiose){//支付传参
        orderSkuRequestDtos.push({
          count:goodsList[i].num,//商品数量
          salesPrice:floatObj.multiply(goodsList[i].salesPrice,100),//商品单价(需要转成分)
          skuBarcode:goodsList[i].barcode,//商品条形码
          skuBrand:goodsList[i].brand,//商品品牌
          skuCode:goodsList[i].skuCode,//商品编号
          skuName:goodsList[i].skuName,//商品名称
          skuSpecification:goodsList[i].specification,//商品规格
          skuVersion:goodsList[i].version,//商品版本
          totalMoney:goodsList[i].num*floatObj.multiply(goodsList[i].salesPrice,100)//商品总价(需要转成分)
        })
      }
      for(let j=0;j<goodsListStorage.length;j++){
        if(goodsListStorage[j].skuCode == goodsList[i].skuCode){
          goodsListStorage.splice(j,1);
          break;
        }
      }
    }
    //是否有勾选商品
    if(!hasChiose){
      wx.showToast({
        title: "请选择要结算的商品",
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if(content.length>0){
      t.hasLose = true;
      t.setData({
        showConfirm:true,
        confirmConfig:{
          title:"提示",
          content:content,
          confirmText:"确定",
          confirmColor:"#F2922F"
        }
      });
      return;
    }else{
      t.hasLose = false;
    }
    if(t.hasPay){//防止重复提交
      return;
    }
    //获取code
    t.hasPay = true;
    wx.showLoading({
      title: '加载中',
    });
    service.getCode().then((res)=>{
      console.log(res);
      if(res.data.result!=200){
        wx.hideLoading();
        t.hasPay = false;
        return;
      }
      let code = res.data.data;
      let branch = t.branch;//当前门店
      let data = {
        branchesId:branch.branchesId,//门店ID
        branchesName:branch.mecName,//门店名
        code:code,
        money:floatObj.multiply(t.data.total,100),
        openId:wx.getStorageSync("openId"),
        userId:wx.getStorageSync("userId"),
        orderSkuRequestDtos:orderSkuRequestDtos
      };
      service.orderPay(
          data
      ).then((res)=>{
        wx.hideLoading();
        t.hasPay = false;
        console.log(res.data);
        if (res.data.result == 200) {
          //如果是正常,返回值里取出来支付信息处理
          let resData = res.data.data.orderPayResponse;
          wx.requestPayment({
            timeStamp: resData.timestamp,
            nonceStr: resData.noncestr,
            package: resData.packageStr,
            signType: resData.signType,
            paySign: resData.sign,
            success: function(re) {
              //支付成功调用接口
              wx.showToast({
                title: "支付成功",
                icon: 'none',
                duration: 2000
              });
              wx.setStorageSync("goodsList",goodsListStorage);//重新设置购物车缓存
              t.setData({goodsList:null,noSelect:true,tableIndex:2});
              t.getOrderList();
            },
            fail: function(err) {
              /*wx.showToast({
                title: err.errMsg,
                icon: 'none',
                duration: 2000
              });*/
            },
          });
        }else {//有库存不足的和下架的商品 或者支付失败
          let purchaseCheckError = res.data.data.purchaseResponseDto;
          let contentList = [];
          if (purchaseCheckError && purchaseCheckError.invalidSku) {//下架的商品
            purchaseCheckError.invalidSku.forEach((item) => {
              contentList.push({
                title: item.skuName,
                standard: item.specification,
                tip: "商品已下架"
              })
            })
          }
          if (purchaseCheckError && purchaseCheckError.inventoryNotEnough) {//库存不足
            purchaseCheckError.inventoryNotEnough.forEach((item) => {
              contentList.push({
                title: item.skuName,
                standard: item.specification,
                tip: "库存不足"
              })
            })
          }
          if (contentList.length > 0) {
            t.setData({
              showConfirm: true,
              confirmConfig: {
                title: "提示",
                content: contentList,
                confirmText: "确定",
                confirmColor: "#F2922F"
              }
            })
          } else {
            wx.showToast({
              title: "支付失败",
              icon: 'none',
              duration: 2000
            });
          }
        }
      }).catch(()=>{
        t.hasPay = false;
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 2000
        });
      })
    }).catch(()=>{
      t.hasPay = false;
    });

  },
  //获取购买记录
  getOrderList(){
    let t=this;
    wx.showLoading({
      title:"加载中..."
    });
    service.orderList({
      pageNum:t.data.pageNum,
      pageSize:t.data.pageSize,
      sceneId:6
    }).then((res)=>{
      console.log(res);
      wx.hideLoading();
      if(res.data.result==200){
        let orderDetailList=t.data.orderDetailList;
        let data = res.data.data;
        let noRecord = false;
        let noMore = false;
        if(t.data.pageNum==1){
          if(!data){
            noRecord = true;
          }else{
            orderDetailList = data.list;
          }
        }else{
          if(data==null||(data&&data.list.length<t.data.pageSize)){//请求没有返回10条数据
            noMore = true;
          }
          if(data&&data.list){
            orderDetailList = t.data.orderDetailList.concat(data.list);
          }
        }
        t.setData({orderDetailList,noRecord,noMore});
      }else{
        if(t.data.pageNum==1) {
          t.setData({noRecord:true});
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.tableIndex){
      if(options.tableIndex==2){
        this.getOrderList();
      }
      this.setData({tableIndex:options.tableIndex});
    }
    this.branch = JSON.parse(options.branch);//店铺信息
    this.setData({branchName:this.branch.mecName});
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.hasPay = false;//防止去结算点击多次
    let noSelect = false;
    let goodsList = [];//需要展示当前店铺的商品
    let goodsListStorage = wx.getStorageSync("goodsList")||[];//缓存的商品
    let goodsListStroageClone = wx.getStorageSync("goodsList")||[];
    let branch = this.branch;//当前门店信息
    let nowDate = new Date().getTime();
    for(let i=0;i<goodsListStorage.length;i++){
      let updateTime = new Date(goodsListStorage[i].updateTime).getTime();
      if((nowDate-updateTime)>this.data.loseTime){//已失效
        for(let j=0;j<goodsListStroageClone.length;j++){
          if(goodsListStroageClone[j].skuCode == goodsListStorage[i].skuCode){
            goodsListStroageClone.splice(j,1);
            break;
          }
        }
      }else{//未失效
        if(goodsListStorage[i]&&goodsListStorage[i].storeId==branch.branchesId){//判断缓存商品的店铺是否是当前的店铺
          goodsList.push(goodsListStorage[i]);
        }
      }
    }
    wx.setStorageSync("goodsList",goodsListStroageClone);//重新设置缓存
    goodsList.forEach((item)=>{
      item.chiose = true;
    });
    if(goodsList.length==0){
      noSelect = true;
    }
    this.setData({goodsList,noSelect});
    this.takeMoney();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideShareMenu()
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
  onReachBottom() {
    if(this.data.tableIndex!=2){
      return;
    }
    if(this.data.noMore){
      return;
    }
    let pageNum = ++this.data.pageNum;
    this.setData({
      pageNum
    });
    this.getOrderList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
});