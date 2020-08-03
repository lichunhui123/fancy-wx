// pages/shopping/index.js
const service = require('../../service/index.js');
import floatObj from '../../utils/floatObj.js';
import {getNum} from "../../utils/util";
const app= getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.globalData.imgUrl,
    showLogin: false,//显示授权登录弹层
    delbtn:false,   //删除按钮显示
    shoppingdata:[],  //购物车未下架商品
    shoppingdata1:[],   //购物车下架商品
    branchId:'',   //拼团站点id
    cloudBranchId:'',  //云店站点id
    userId:wx.getStorageSync('userId'),    //用户id
    totalValue:'0.00',  //总价格
    discountAmount:0,  //优惠减
    shoppnum:0,   //购物车数量
    allSelect:false,   //全选按钮
    closenum:0,  //结算商品数量
    savearr:[],  //保存编辑前的状态
    saveallselect:null,  //保存保存状态
    noData:false,  //无数据
    smallFlag:false,  //云店是否休息
    combineGood:false, //是满减活动组合商品
    fullDecMoneyList:[], //满减活动组合商品集合
    manyPriCombineGood:false,//是多件多折组合商品
    manyPriManyFoldsList:[],//多件多折组合商品集合
    reduceNum:0,  //已减金额
    fullMax:false,  //满足最大的满减设置
    preOrNext:{},  //相差金额和下次减金额
    manyPriMany:0, //多件多折已优惠金额
    countMax:false, //满足最大的多件多折设置
    manyPriManyNext:{},//下一阶梯还差几件商品享受多少折扣
    draowQ:[], //有无云店未参与活动的商品
    cardCode:null,//有无云店的优惠圈信息
  },
  //获取云店是否有可领取的卡券
	getDisCloudList() {
    if(this.data.draowQ.length>0){
      service.cloudMarkingOrder({
        branchesId: this.data.cloudBranchId,
        skuCode: this.data.draowQ,
        userId: wx.getStorageSync('userId')
      }).then(res => {
        if(res.data.result==200){
          if(res.data.data&&res.data.data.notClaimedList&&res.data.data.notClaimedList.length>0){
            let list=res.data.data.notClaimedList;
            this.setData({
              cardCode:list
            })
          }else{
            this.setData({
              cardCode:null
            })
          }
        }
      })
    }
	},
  //云店领取优惠券
  drawDiscount(){
    wx.navigateTo({
      url: '/pages/drawDiscount/index?draowQ='+JSON.stringify(this.data.draowQ),
    })
  },
  //去凑单
  goCloudShop(){
    wx.navigateTo({
      url: '/pages/cloudStore/index',
    })
  },
  //去登录
  tologon(){
    this.setData({
      showLogin:true
    })
  },
  //登录成功
  loginSuccess(){
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点 
    this.setData({
      showLogin: false,
      branchId:presentAddress?presentAddress.siteId:'',
      cloudBranchId:currentCloudShop?currentCloudShop.siteId:'',
      userId:wx.getStorageSync('userId'),
    },()=>{
      this.getAddreddList()
      app.shoppingNum()
    })
  },
  //去首页
  toHome(){
    wx.switchTab({
      url: '/pages/home/index',
    })
  },
  //全选点击
  checkall(){
    if (!this.data.delbtn){ //非编辑时的全选
      this.setData({
        allSelect:!this.data.allSelect
      },()=>{
        if (this.data.allSelect) {  //全选选中
          let newdata = this.data.shoppingdata.map(item => {
            item.select = true
            return item
          })
          this.setData({
            shoppingdata: newdata,
            closenum:newdata.length
          },()=>{
            this.getdiscountm()  //计算最优减
            this.countTotal()   //计算总额
          })
        } else { //全选未选中
          let newdata1 = this.data.shoppingdata.map(item => {
            item.select = false
            return item
          })
          this.setData({
            shoppingdata: newdata1,
            closenum: 0,
            discountAmount: 0
          },()=>{
            this.countTotal()
          })
        }
      }) 
    } else {   //编辑时的全选
      this.setData({
        allSelect: !this.data.allSelect
      }, () => {
        if (this.data.allSelect){ //全选删除
          let newdata = this.data.shoppingdata.map(item => {  //上架商品全选
            item.select = true
            return item
          }) 
          let newdataT = this.data.shoppingdata1.map(el => {  //下架商品全选
            el.select = true
            return el
          })
          this.setData({
            shoppingdata: newdata,
            shoppingdata1:newdataT
          })
        }else{   //未全选
          let newdata = this.data.shoppingdata.map(item => {
            item.select = false
            return item
          })
          let newdataT = this.data.shoppingdata1.map(el => {
            el.select = false
            return el
          })
          this.setData({
            shoppingdata: newdata,
            shoppingdata1: newdataT
          })
        }
      })
    }
  },
  //勾选商品
  selectClick(e){
    let selectitem=e.currentTarget.dataset.selectitem
    let {cartCode} = selectitem
    let newdata = this.data.shoppingdata.map(item => {
      if (cartCode == item.cartCode) {
        item.select=!item.select
      }
      return item
    })
    this.setData({
      shoppingdata: newdata,  
    },()=>{
      this.getdiscountm()
      this.countTotal()
    })
    if (!this.data.delbtn){   //非编辑的勾选
      let num=0
      //勾选的商品数量
      newdata.forEach(el=>{
        if(el.select){
          num++
        }
      })
      this.setData({
        closenum: num 
      })
      let selectTure=this.data.shoppingdata.every(item=>item.select)   //判断是否全部勾选
      if(selectTure){   
        this.setData({
          allSelect: true
        })
      }else{
        this.setData({
          allSelect:false
        })
      }
    }else{     //编辑时的勾选
      let editw = this.data.shoppingdata.every(item => item.select)
        if (this.data.shoppingdata1.length > 0) {  //判断购物车上架和下架两种商品的全选
          let editx = this.data.shoppingdata1.every(item => item.select)
          if (editw && editx) {   //上架和下架都勾选才全选
            this.setData({
              allSelect: true
            })
          } else {
            this.setData({
              allSelect: false
            })
          }
        }else{    //判断只有上架商品的全选
          if (editw) {
            this.setData({
              allSelect: true
            })
          } else {
            this.setData({
              allSelect: false
            })
          }
        } 
    }
  },
  //下架勾选
  xselectClick(e){
    let selectx = e.currentTarget.dataset.selectx
    let {cartCode } = selectx
    let newdata = this.data.shoppingdata1.map(item => {
      if (cartCode == item.cartCode) {
        item.select = !item.select
      }
      return item
    })
    this.setData({
      shoppingdata1: newdata
    })
    let editx = this.data.shoppingdata1.every(item => item.select)
      if (this.data.shoppingdata.length > 0) {  //判断购物车上架和下架两种商品的全选
        let editw = this.data.shoppingdata.every(item => item.select)
        if (editx && editw) {
          this.setData({
            allSelect: true
          })
        } else {
          this.setData({
            allSelect: false
          })
        }
      } else {    //判断只有下架商品的全选
        if (editx) {
          this.setData({
            allSelect: true
          })
        } else {
          this.setData({
            allSelect: false
          })
        }
      }
  },
  //购物车商品减少
  shopgoodDel(e) {
    let shdelitem = e.currentTarget.dataset.shdelitem
    let { activityId, branchesId, cartCode, goodsCode, goodsResource, goodsNum, skuId} = shdelitem
    if (goodsNum > 1) {   //大于1时正常减
        service.addgoodnum({
          skuId: skuId,
          activityId: activityId,
          branchesId: branchesId,
          goodsCode: goodsCode,
          goodsNum: --goodsNum,
          goodsResource: goodsResource,  //来源拼团5 水管家20
          userId: wx.getStorageSync('userId')
        }).then(res => {
            
          if (res.data.result == 200) {
            this.getshoppingdata()
            app.shoppingNum()
          }else{
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        })
      }else {  
        wx.showModal({
          content: '确认删除商品？',
          cancelColor: "#999999",
          confirmColor: '#F2922F',
          success: (res) => {
            if (res.confirm) {
              service.delshoppinggoods({
                cartCodes: [cartCode]
              }).then(res => {
                if (res.data.result == 200) {
                  this.setData({
                    totalValue: '0.00',
                    allSelect: false
                  })
                  this.getshoppingdata()
                  app.shoppingNum()
                }else{    //错误返回信息
                  wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                  })
                }
              })
            }
          }
        })
      }
  },
  //购物车商品添加
  shopgoodAdd(e) {
    let shadditem = e.currentTarget.dataset.shadditem
    let { activityId, branchesId, goodsCode, goodsResource, goodsNum ,skuId} = shadditem
    service.addgoodnum({
      skuId: skuId,
      branchesId: branchesId,
      userId: wx.getStorageSync('userId'),
      goodsResource: goodsResource,  //来源拼团5 水管家20
      activityId: activityId,
      goodsCode: goodsCode,
      goodsNum: ++goodsNum,
    }).then(res => {
      if (res.data.result == 200) {
        this.getshoppingdata()
        app.shoppingNum()
      }else{
        wx.showToast({
          title: res.data.message,
          duration: 2000,
          icon: 'none'
        })
      }
    })
  },
  //删除单个商品
  delGood(e){
    let itemCartCode = e.currentTarget.dataset.cartcode
    let { cartCode} =itemCartCode
    wx.showModal({
      content: '确认删除商品？',
      cancelColor: "#999999",
      confirmColor: '#F2922F',
      success: (res) => {
        if (res.confirm) {
          service.delshoppinggoods({
            cartCodes: [cartCode]
          }).then(res => {
            if (res.data.result == 200) {
              this.setData({
                totalValue: '0.00'
              })
              this.getshoppingdata()
              app.shoppingNum()
            }else{
              wx.showToast({
                title: res.data.message,
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  //购物车input数量输入
  shopgoodInp(e) {
    let inpValue = e.detail.value
    let shinpitem = e.currentTarget.dataset.shinpitem
    let { activityId, branchesId, cartCode, goodsCode, goodsResource, skuId} = shinpitem
      if (inpValue >= 1) {
        service.addgoodnum({
          skuId:skuId,
          activityId: activityId,
          branchesId: branchesId,
          goodsCode: goodsCode,
          goodsNum: inpValue,
          goodsResource: goodsResource,  //来源拼团5 水管家20
          userId: wx.getStorageSync('userId')
        }).then(res => {
            this.getshoppingdata()
            app.shoppingNum()
          if (res.data.result != 200) {    
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        })
      }else{
        wx.showModal({
          content: '确认删除商品？',
          cancelColor: "#999999",
          confirmColor: '#F2922F',
          success: (res) => {
            if (res.confirm) {
              service.delshoppinggoods({
                cartCodes: [cartCode]
              }).then(res => {
                if (res.data.result == 200) {
                  this.setData({
                    totalValue: '0.00'
                  })
                  this.getshoppingdata()
                  app.shoppingNum()
                }else{
                  wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                  })
                }
              })
            }
            if (res.cancel){
              let newdata = this.data.shoppingdata.map(item => {
                if (cartCode == item.cartCode) {
                  item.goodsNum = 1
                }
                return item
              })
              service.addgoodnum({
                skuId:skuId,
                activityId: activityId,
                branchesId: branchesId,
                goodsCode: goodsCode,
                goodsNum: 1,
                goodsResource: goodsResource,  //来源拼团5 水管家20
                userId: wx.getStorageSync('userId')
              }).then(res => {
                  this.getshoppingdata()
                  app.shoppingNum()
                if (res.data.result != 200) {    
                  wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                  })
                }
              })
              this.setData({
                shoppingdata: newdata
              },()=>{
                this.countTotal()
              })
            }
          }
        })
      }
  },
  //计算价格
  countTotal(){
    let allsum = 0
    let newdata = this.data.shoppingdata
    let fullDecMoneyList = [] //用来提取组合商品满减信息
    let fullDecMoney =0  //组合商品/参与满减商品的总额
    let manyPriCombine = JSON.parse(JSON.stringify(newdata.filter(clv=> clv.activitySet==2&&clv.type==70 )));//多件多折的组合商品集合;//多件多折组合商品集合
    let manyPriManyFoldsList = [];//多件多折设置
    let maxDiscount = 0;//多件多折的最高折扣
    let maxCount = 0;//多件多折的最大设置数量
    let manyPriGoodsNum = 0;//多件多折的组合商品总数量
    let manyPriMany = 0;//多件多折商品已减的金额
    let countMax = false;//多件多折商品已达到最大设置
    let manyPriManyNext = {count:0,discount:0};//多件多折活动下一级提示
    this.setData({ fullMax:false,countMax:false });//重置 达到最大的满减设置的条件
    newdata.forEach(item=>{
      if(item.select){
        //未参与折扣(不包括云店的活动商品)
        if(item.discountStatus !=10 &&!item.type) {
          allsum += (item.grouponPrice*1) * (item.goodsNum * 1)
        }
        //参与折扣（不包括云店的活动商品）
        if(item.discountStatus == 10 &&!item.type) {
          allsum += (item.discountPrice*1) * (item.goodsNum * 1)
        }
        //云店限时折扣活动
        if(item.type ==10&& item.limitPurchaseSettings!=3){
          allsum += (item.discountPrice*1) * (item.goodsNum * 1)
        }else{
          //在前多少件参与折扣条件内按折扣价算
          if(item.type ==10&& item.limitPurchaseSettings==3&& (item.userBoughtGoodsNum*1 + item.goodsNum*1)<= (item.purchaseQuantity*1)){
            allsum += (item.discountPrice*1) * (item.goodsNum * 1)
          }
          //超出前多少件参与折扣条件按原价算
          if(item.type ==10&& item.limitPurchaseSettings==3&&(item.userBoughtGoodsNum*1 + item.goodsNum*1)>(item.purchaseQuantity*1)){
            if(item.userBoughtGoodsNum*1<item.purchaseQuantity*1){  //用户历史购买小于限购数量
              let num = item.purchaseQuantity*1 - item.userBoughtGoodsNum*1
              allsum += (item.discountPrice*1) * (num * 1)
              let num2 = item.goodsNum*1 - num
              allsum += (item.grouponPrice*1) * (num2 * 1)
            }else{
              allsum += (item.grouponPrice*1) * (item.goodsNum * 1)
            }
          }
        }
        //云店满减活动（单个商品满减放到循环里进行计算）
        if(item.type == 20 ) {
          let itemMoney = (item.grouponPrice*1) * (item.goodsNum * 1);
          fullDecMoney += itemMoney;
          if(item.fullDecMoneyList && item.fullDecMoneyList.length>0){
            let newList= [...item.fullDecMoneyList]   //reverse()会改变原数组，这里通过...拷贝（拷贝一级）
            let list = newList.reverse()  //后端满减设置是按从小到大返回（需要进行反转，从大到小进行判断）
            if(!this.data.combineGood){  //非真说明是单个商品
              for(let i=0 ;i<list.length;i++){
                if(itemMoney >= floatObj.multiply(list[i].fullMoney*1,100)){
                  itemMoney -= floatObj.multiply(list[i].decMoney*1,100)
                  break  
                }
              }
            }
            allsum += itemMoney
          }
        }
        if(item.type == 50 ){//买一送一  直接按原价计算
          allsum += (item.grouponPrice*1) * (item.goodsNum * 1);               
        }
        if(item.type == 60){//第二件半价 
          allsum += (item.grouponPrice*1) * (item.goodsNum * 1); 
          if(item.goodsNum*1>=2){//购买数量大于2的需要减去数量除于2的向下取整数的一半价格
            let minusNum = Math.floor(item.goodsNum / 2);
            allsum -= (item.grouponPrice*1)/2*(minusNum);
          }
        }
        if(item.type == 70){//多件多折 
          if(item.manyPriManyFoldsList && item.manyPriManyFoldsList.length>0){  //有多件多折设置
            let newList= [...item.manyPriManyFoldsList];   //reverse()会改变原数组，这里通过...拷贝（拷贝一级）
            let list = newList.reverse();
            for(let i=0 ;i<list.length;i++){//循环获取最高折扣率
              if(getNum(floatObj.divide(list[i].discount*1,100))<maxDiscount||maxDiscount==0){
                maxDiscount = getNum(floatObj.divide(list[i].discount*1,100));//最高折扣率
              }
              if(list[i].count>maxCount||maxCount==0){
                maxCount = list[i].count;//多件多折最大的折扣的数量
              }
            }
            if(!manyPriCombine||manyPriCombine.length==0){//说明活动是单个商品多件多折
              if(item.goodsNum*1 >= maxCount){//已达到最大的折扣设置数量
                countMax = true;
              }else{
                countMax = false;
              }
              for(let i=0 ;i<list.length;i++){
                if(item.goodsNum*1 >= list[i].count*1){//购买数量大于活动设置的数量
                  if(!countMax){//没有达到最大的设置数量
                    manyPriManyNext.count = list[i-1].count-item.goodsNum*1,//下一级数量
                    manyPriManyNext.discount = list[i-1].discount;//下一级折扣
                  }
                  let discount = getNum(floatObj.divide(list[i].discount*1,100));//折扣率
                  allsum += (list[i].count*1) * (item.grouponPrice*1) * discount;//达到购买数量的那一部分按相应的折扣计算
                  manyPriMany += (list[i].count*1) * (item.grouponPrice*1) - (list[i].count*1) * (item.grouponPrice*1) * discount; // 已减少的金额
                  if(item.amountExceeded==1){//超过购买数量按照原价购买
                    allsum += (item.goodsNum*1 - list[i].count*1) * (item.grouponPrice*1);
                  }else{//超过购买数量按照最高折扣购买
                    allsum += (item.goodsNum*1 - list[i].count*1) * (item.grouponPrice*1) * maxDiscount;
                    manyPriMany += (item.goodsNum*1 - list[i].count*1) * (item.grouponPrice*1) - (item.goodsNum*1 - list[i].count*1) * (item.grouponPrice*1) * maxDiscount; // 已减少的金额
                  }
                  break
                }
              }
            }else{
              manyPriGoodsNum += item.goodsNum*1;//组合商品总数量
            }
          }
        }
        if(item.type == 80 ){//好物预售  直接按预售价计算
          allsum += (item.prePrice*1*100) * (item.goodsNum * 1);               
        }
      }
      if(item.type == 20 ) {  //下面这些数据不能放到选中商品中去计算(将数据提取出来供组合商品计算)
        if(item.fullDecMoneyList && item.fullDecMoneyList.length>0){  //有满减活动
          this.setData({
            fullDecMoneyList:item.fullDecMoneyList
          })
          let newList= [...item.fullDecMoneyList]
          let list = newList.reverse()
          fullDecMoneyList = list
        }
      }
      if(item.type == 70){//多件多折 
        if(item.manyPriManyFoldsList && item.manyPriManyFoldsList.length>0){  //有多件多折
          this.setData({
            manyPriManyFoldsList:item.manyPriManyFoldsList
          })
          let newList= [...item.manyPriManyFoldsList]
          let list = newList.reverse()
          manyPriManyFoldsList = list
        }
      }
    })
    //云店满减活动 (组合商品 在循环外进行计算)
    if(this.data.combineGood){
      if(fullDecMoneyList.length>0){
        let reduceNum = 0;//达到满减设置后 可以满减的金额
        for(let i=0 ;i<fullDecMoneyList.length;i++){
          if(fullDecMoney >= floatObj.multiply(fullDecMoneyList[i].fullMoney*1,100)){
            reduceNum = (fullDecMoneyList[i].decMoney*1)
            this.setData({ reduceNum })
            if(i == 0){
              this.setData({ fullMax:true })
            }else{
              let preItem = fullDecMoneyList[i-1]  //上一个满减设置，比当前的大
              let differNum = floatObj.multiply(preItem.fullMoney*1,100) - fullDecMoney  //计算相差金额
              let json ={
                differNum:getNum(floatObj.divide(differNum,100)),
                nextNum: preItem.decMoney
              }
              this.setData({
                preOrNext:json
              })
            }
            let activetyF = newdata.filter(e=>e.select&&e.type==20)
            if(activetyF.length>0){
              allsum -= floatObj.multiply(reduceNum,100)
            }
            break
          }
        }
        if(reduceNum==0){  //说明一个满减条件也没满足
          let len =fullDecMoneyList.length
          let differNum= floatObj.multiply(fullDecMoneyList[len-1].fullMoney*1,100) - fullDecMoney
          let json ={
            differNum:getNum(floatObj.divide(differNum,100)),
            nextNum: fullDecMoneyList[len-1].decMoney
          }
          this.setData({
            preOrNext:json,
            reduceNum:0
          })
        }
      }
    }
    if(manyPriCombine&&manyPriCombine.length>0){ //多件多折的组合商品集合
      let newGoodsNum=0;//当前商品数量和前几个商品的数量累计的总数量
      let newGoodsNum1=0;//剩余可以计算折扣的商品件数
      if(manyPriGoodsNum >= maxCount){//已达到最大的折扣设置数量
        countMax = true;
      }else{
        countMax = false;
      }
      manyPriCombine.forEach(val => {
        newGoodsNum += val.goodsNum;
        for(let i=0 ;i<manyPriManyFoldsList.length;i++){
          if(manyPriGoodsNum >= manyPriManyFoldsList[i].count*1){//多件多折的组合商品数量大于活动设置的数量
            if(!countMax){//没有达到最大的设置数量
              manyPriManyNext.count = manyPriManyFoldsList[i-1].count-manyPriGoodsNum,//下一级数量
              manyPriManyNext.discount = manyPriManyFoldsList[i-1].discount;//下一级折扣
            }
            let discount = getNum(floatObj.divide(manyPriManyFoldsList[i].discount*1,100));//折扣率
            if(newGoodsNum <= manyPriManyFoldsList[i].count*1){//如果当前商品数量和前几个商品的数量的累计数量 <= 设置的最大数量
              newGoodsNum1 = manyPriManyFoldsList[i].count*1-newGoodsNum;//剩余可以计算折扣的商品件数
              allsum += (val.goodsNum*1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
              manyPriMany += (val.goodsNum*1) * (val.grouponPrice*1) - (val.goodsNum*1) * (val.grouponPrice*1) * discount; // 已减少的金额
            }else{//如果当前商品数量和前几个商品的数量累计数量 > 设置的数量
              if(newGoodsNum1==0){//剩余可以计算折扣的商品件数置为0时
                if(val.amountExceeded==1){//超过购买数量按照原价购买
                  allsum += (val.goodsNum*1) * (val.grouponPrice*1);
                }else{//超过购买数量按照最高折扣购买
                  allsum += (val.goodsNum*1) * (val.grouponPrice*1) * maxDiscount;
                  manyPriMany += (val.goodsNum*1) * (val.grouponPrice*1) - (val.goodsNum*1) * (val.grouponPrice*1) * maxDiscount; // 已减少的金额
                }
              }else{//剩余可以计算折扣的商品件数置不为0时
                if(val.goodsNum > newGoodsNum1){// 如果当前商品的数量 大于 剩余可以计算折扣的商品件数
                  newGoodsNum1 = 0;//剩余可以计算折扣的商品件数置为0
                  allsum += (newGoodsNum1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                  manyPriMany += (newGoodsNum1) * (val.grouponPrice*1) - (newGoodsNum1) * (val.grouponPrice*1) * discount; // 已减少的金额
                  if(val.amountExceeded==1){//超过购买数量按照原价购买
                    allsum += (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1);
                  }else{//超过购买数量按照最高折扣购买
                    allsum += (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1) * maxDiscount;
                    manyPriMany += (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1) - (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1) * maxDiscount; // 已减少的金额
                  }
                }else{// 如果当前商品的数量 等于 剩余可以计算折扣的商品件数
                  allsum += (val.goodsNum*1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                  manyPriMany += (val.goodsNum*1) * (val.grouponPrice*1) - (val.goodsNum*1) * (val.grouponPrice*1) * discount; // 已减少的金额
                }
              }
            }
            break;
          }
        }
      })
    }
    //计算总价格
    this.setData({
      totalValue: getNum(floatObj.divide(allsum, 100)),
      manyPriMany: getNum(floatObj.divide(manyPriMany, 100)),//多件多折已减少的金额
      countMax: countMax,//多件多折活动是否已达到最大设置的数量
      manyPriManyNext:manyPriManyNext
    })
  },
  //购物车商品
  getshoppingdata() {
    wx.showLoading({
      title: '加载中'
    });
    service.shoppinggoods({
      branchesId:this.data.branchId,
      smallBranchesId: this.data.cloudBranchId,
      userId: wx.getStorageSync('userId')
    }).then(res => {
      console.log('wuche',res)
        wx.hideLoading();
      if (res.data.result == 200) {
        wx.stopPullDownRefresh()
        if (res.data.data) {
          let Adata=res.data.data
          let data = Adata.cartEffectiveList?Adata.cartEffectiveList:[]
          let datax = Adata.cartExpireList?Adata.cartExpireList:[]
          let waterData = Adata.cartWaterEffectiveList?Adata.cartWaterEffectiveList:[]
          let mealData = Adata.cartMealEffectiveList?Adata.cartMealEffectiveList:[]
          let ecData = Adata.cartMallEffectiveList?Adata.cartMallEffectiveList:[]
          let cloudData = Adata.cartSmallEffectiveList?Adata.cartSmallEffectiveList:[]
          let amount =Adata.discountAmount
          let smallFlag=Adata.smallFlag
          if (data.length < 1 && datax.length < 1 && waterData.length < 1 && mealData.length < 1&&ecData.length<1 &&cloudData.length<1 ){
            this.setData({
              noData:true
            })
          }else{
            this.setData({
              noData:false
            })
          }
          if(data&&data.length>0){  //拼团商品
            data.forEach(item => {
              // discountPriceT（元） 单纯用来页面展示 discountPrice（分）不影响元属性计算
              item.discountPriceT = getNum(floatObj.divide(item.discountPrice,100))
              item.grouponPriceT = getNum(floatObj.divide(item.grouponPrice,100))
              item.select=true
            })
          }
          if(waterData&&waterData.length>0){  //水商品
            waterData.forEach(wat => {
              wat.grouponPriceT = getNum(floatObj.divide(wat.grouponPrice, 100))
              wat.select = true
            })
          }
          if(ecData&&ecData.length>0){  //商城商品
            ecData.forEach(el => {
              el.discountPriceT = getNum(floatObj.divide(el.discountPrice, 100))
              el.grouponPriceT = getNum(floatObj.divide(el.grouponPrice, 100))
              el.select=true
            })
          }
          let combineG = false;//是否是满减活动的组合商品
          let manyPriCombine = false;//多件多折组合商品集合
          if (cloudData&&cloudData.length > 0) {  //云店商品
            combineG = cloudData.some(clv=> clv.activitySet==2&&clv.type==20 );//是否是满减活动的组合商品
            manyPriCombine = JSON.parse(JSON.stringify(cloudData.filter(clv=> clv.activitySet==2&&clv.type==70 )));//多件多折的组合商品集合
            let arr=[]
            cloudData.forEach(el => {
              el.discountPriceT = getNum(floatObj.divide(el.discountPrice, 100))
              el.grouponPriceT = getNum(floatObj.divide(el.grouponPrice, 100))
              el.prePriceT = getNum(el.prePrice*1) //好物预售 预售价
              el.select=true
              el.nodis=false
              el.averagePrice = getNum(floatObj.divide((el.grouponPrice+el.grouponPrice/2)/2, 100))
              if(el.purchaseQuantity!=null&&el.userBoughtGoodsNum*1>=el.purchaseQuantity*1){
                el.nodis =true
              }
              if(!el.type){
                arr.push(el.goodsCode)
              }
            })
            this.setData({
              draowQ:arr
            })
            this.getDisCloudList();
          }
          if(mealData&&mealData.length>0){  //水套餐
            mealData.forEach(meal => {
              meal.grouponPriceT = getNum(floatObj.divide(meal.grouponPrice, 100))
              meal.select = true
              meal.detailshow=false
              let obj={
                giftPic: meal.mainGoodsPic,
                giftName: meal.mainGoodsName,
                giftNum: meal.mainGoodsNum,
                main: 1
              }
              meal.mealGift.unshift(obj)
            })
          }
          if(datax&&datax.length>0){  //过期下架商品
            datax.forEach(el => {
              el.discountPriceT = getNum(floatObj.divide(el.discountPrice, 100))
              el.grouponPriceT = getNum(floatObj.divide(el.grouponPrice, 100))
              el.select=false
            })
          }
          let alldata = [...data,...ecData,...cloudData, ...waterData,...mealData]  //数据整合

          if (this.data.shoppingdata.length > 0) {   //将上一次的选中状态重新赋值
            this.data.shoppingdata.forEach(el => {
              alldata.forEach(val => {
                if (el.cartCode == val.cartCode) {
                  val.select = el.select
                }
              })
            })
          }
          this.setData({
            shoppingdata: alldata,
            shoppingdata1: datax,
            discountAmount: getNum(floatObj.divide(amount, 100)),
            smallFlag,
            combineGood:combineG,  //是否是云店满减活动组合商品
            manyPriCombineGood:manyPriCombine, //云店多件多折组合商品
          },()=>{
            this.getdiscountm()
            this.countTotal()
            let nums = 0
            this.data.shoppingdata.forEach(v => { if (v.select) { nums++ } })
            this.setData({  //选中的数量
              closenum: nums
            })
            if (this.data.shoppingdata.length==nums) {
              this.setData({
                allSelect: true
              })
            } else {
              this.setData({
                allSelect: false
              })
            }
          })
        }else{
          this.setData({
            noData:true,
            shoppingdata:[],
            shoppingdata1:[],
            totalValue: '0.00'
          })
        }
      }else{
        this.setData({
          noData:true,
          shoppingdata: [],
          shoppingdata1: [],
          totalValue: '0.00'
        })
      }
    })
  },
  //套餐详情
  mealDetail(e){
    let meals=e.currentTarget.dataset.meals
    let newdata=this.data.shoppingdata.map(item=>{
      if(item.skuId==meals){
        item.detailshow = !item.detailshow
      }
      return item
    })
    this.setData({
      shoppingdata:newdata
    })
  },
  //重新计算最优减
  getdiscountm(){
    this.setData({
      discountAmount:0
    })
    let newarr = []
    this.data.shoppingdata.forEach(item => {
      if (item.select) {
        let list = {
          activityId: item.activityId,
          goodsCode: item.goodsCode,
          goodsNum: item.goodsNum,
          goodsResource: item.goodsResource
        }
        newarr.push(list)
      }
    })
    service.getbestcoupon({
      skuInfoDtos: newarr,
      userId: wx.getStorageSync('userId')
    }).then(res => {
      if (res.data.result == 200) {
        if (res.data.data) {
          let disnum = res.data.data.discountAmount
          this.setData({
            discountAmount: getNum(floatObj.divide(disnum, 100))
          })
        }
      }
    })
  },
  //获取默认地址
  getAddreddList(){
    if(wx.getStorageSync('isdefault')){
      this.setWaterOrderAmend();//修改地址更改状态
      return;
    }
    service.getwateraddresslist({
      "platform": "wx",
      "requestCode": 1004,
      "params": "{userId:" + wx.getStorageSync('userId') + ",pageNo:1,pageSize:20}"
    }).then(res=>{
      if (res.data.result == 0 || res.data.result == 200){
        if(res.data.data.length>0){
          res.data.data.forEach(item=>{
            if (item.isDefault==1){
              wx.setStorageSync('isdefault', item);
              this.setWaterOrderAmend();//修改地址更改状态
            }
          })
        }
      }
    })
  },
  //修改地址更改状态
  setWaterOrderAmend(){
    if(wx.getStorageSync("hasSetWaterOrderAmend")){
      this.getshoppingdata();//获取购物车数据
      return;
    }
    let isaddress = wx.getStorageSync('isaddress')?wx.getStorageSync('isaddress'):wx.getStorageSync('isdefault');
    if(isaddress){
      wx.showLoading({
        title: '加载中'
      });
      service.setwaterorderamend({
        address: `${isaddress.provinceName == isaddress.cityName ? isaddress.cityName : isaddress.provinceName + isaddress.cityName}${isaddress.districtName}${isaddress.address}`,
        cityName:isaddress.cityName,
        userId: wx.getStorageSync('userId')
      }).then(res=>{
        wx.setStorageSync("hasSetWaterOrderAmend","true");//已经请求过更改状态
        this.getshoppingdata();//获取购物车数据
      }).catch(()=>{
        this.getshoppingdata();//获取购物车数据
      })
    }
  },
  //去结算
  goBuy(){
    wx.showLoading({
      title: '加载中'
    });
    let checkGood=this.data.shoppingdata.filter(item=>{
      return item.select
    })
    let waters = checkGood.some(val => val.goodsResource == 20 || val.goodsResource==30)
    if (waters){
      if(!wx.getStorageSync('isaddress')&&!wx.getStorageSync('isdefault')){
        wx.showToast({
          title: '您的选择包含水商品，请先在“我的”页面中“地址管理”下添加收货地址后提交订单~',
          icon: 'none',
          duration:1800
        })
        return
      }
    }
    
    let money =this.data.totalValue    //总额
    if (this.data.closenum){  //选择商品才能跳转
      wx.hideLoading()
      let cloudSome=checkGood.some(res=>res.goodsResource==40)
      if(cloudSome){   //有云店商品不能直接跳转需要请求判断一下
        if(!this.data.smallFlag){
          wx.showToast({
            title: '指尖云店商品已打烊，暂时无法配送',
            icon: 'none',
            duration:1800
          })
          checkGood=checkGood.filter(item=>item.goodsResource!=40)
          if(checkGood.length<1){
            return;  //说明购物车只有云店商品
          }
          setTimeout(()=>{
            this.navigatefn(checkGood,money)
          },800)
        }else{
          this.navigatefn(checkGood,money)
        }
      }else{
        this.navigatefn(checkGood,money)
      }
    }else{
      wx.showToast({
        title: '请选择商品',
        icon: 'none',
      })
    }
  },
  navigatefn(good,money){
    let newCheckGood=encodeURIComponent(JSON.stringify(good))  //选中的商品去结算
      wx.navigateTo({
        url: "/pages/shoppingOrder/index?goods=" + newCheckGood + '&rental=' + money+'&type=3',
      })
  },
  //编辑
  edieShopping(){
      this.setData({
        delbtn:!this.data.delbtn
      },()=>{
        if(this.data.delbtn){
          let saveallselect=this.data.allSelect
          let savearr= JSON.parse(JSON.stringify(this.data.shoppingdata))
          let newarr=this.data.shoppingdata.map(item=>{
            item.select=false
            return item
          })
          let newarrT = this.data.shoppingdata1.map(el => {
            el.select = false
            return el
          })
          this.setData({
            savearr,
            saveallselect,
            shoppingdata:newarr,
            shoppingdata1:newarrT,
            allSelect:false
          })  
        }
        if(!this.data.delbtn){
          let overarr=this.data.shoppingdata.map(item=>{
            this.data.savearr.forEach(el=>{
              if (el.cartCode == item.cartCode){
                item.select=el.select
              }
            })
            return item
          })
          this.setData({
            allSelect:this.data.saveallselect,
            shoppingdata:overarr
          },()=>{
            this.getshoppingdata()   //购物车商品获取
          })
        }
      })
      
  },
  //删除所有订单
  delallorder(){
    let arr = []
    this.data.shoppingdata.forEach(item => {
      if (item.select) {
        arr.push(item.cartCode)
      }
    })
    this.data.shoppingdata1.forEach(el => {
      if (el.select) {
        arr.push(el.cartCode)
      }
    })
    if(arr.length>0){
      wx.showModal({
        content: '确认删除商品？',
        cancelColor: "#999999",
        confirmColor: "#F2922F",
        success: (res) => {
          if (res.confirm) {
              service.delshoppinggoods({
                cartCodes: arr
              }).then(res => {
                if (res.data.result == 200) {
                  app.shoppingNum()
                  this.getshoppingdata()
                }else{
                  wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                  })
                }
              })
          }
        }
      })
    }else{
      wx.showToast({
        title: '请选择删除的商品',
        icon: 'none',
      })
    }
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
    wx.hideShareMenu();
    wx.setStorageSync('hischoose', '')
    let userId = wx.getStorageSync('userId');
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点 
    this.setData({
      branchId:presentAddress?presentAddress.siteId:'',
      cloudBranchId:currentCloudShop?currentCloudShop.siteId:'',
      userId: userId,    //用户id
      delbtn:false,
      totalValue:'0.00',
      showLogin:userId&&false,
      combineGood:false,
      manyPriCombine:false,
      manyPriManyFoldsList:[]
    },()=>{
      this.getAddreddList() //获取地址
    })
    app.shoppingNum()     //购物车数量
    wx.setStorageSync('discount', "") //拼团设置每次去结算请求最新的优惠券
    wx.setStorageSync('cloudiscount', "") //云店设置每次去结算请求最新的优惠券
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
    this.setData({
      totalValue: '0.00'
    })
    this.getshoppingdata()
    app.shoppingNum()
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