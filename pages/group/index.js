// pages/group/index.js
const service = require('../../service/index.js');
import floatObj from '../../utils/floatObj.js';
import {getNum} from "../../utils/util";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myCommunity:"",//站点地址
    branchId: "",    //拼团站点id
    cloudBranchId:'', //云店站点id
    userId: wx.getStorageSync('userId'),   //用户id
    groupType:[],  //拼团商品分类
    grouplist:[],  //商品列表
    navtypeall:null,  //头部商品code
    tabName:0,  //商品类型默认下标为0
    flag:0,   //分类标识  0=全部商品
    activityType:1, //活动类型
    discountStatus: null,  //10=参与折扣 20 null 未参与
    pageNum:1,  //当前页数
    pageSize:10, //每页数量
    srcolloff:false, //购物车弹起
    shoppingdata:[], //购物车商品
    shoppingdata1:[], //购物车过期
    shoppnum:0, //购物车数量
    totalValue:'0.00',  //总价
    noData:false,  //无数据
    listNum:0, //数据返回长度
    goGoodtype:'', //进入类型
    toView:'',
    reduceNum:0,  //已减金额
    fullMax:false,  //满足最大的满减设置
    preOrNext:{},  //相差金额和下次减金额
  },
  //跳转选择站点页面
  nearSite(){
    wx.navigateTo({
      url:"/pages/homeCommunity/index?enterType=10"  //云店20 拼团10
    })
  },
  //头部类型切换
  navTypeClick(e){
    let systemInfo = wx.getSystemInfoSync(); //获取设备信息
    //rpx 转 px 公式 rpx /750* 设备高度
    let mypx = 230 / 750 * systemInfo.windowWidth  
    this.setData({
      navtypeall: e.target.dataset.ind.categoryCode,
      flag: e.target.dataset.ind.flag,
      activityType: e.target.dataset.ind.activityType,
      tabName: e.target.dataset.typeind,
      toView: e.target.offsetLeft - mypx,  //切换时item移动到第一个
      grouplist:[],
      pageNum:1,
      noData:false
    },()=>{
      this.getgroupslist()   //商品列表
      this.shoppingnum()     //购物车数量
      this.getshoppingdata()   //购物车列表
    })
    
  },
  //购物车商品
  getshoppingdata(){
    service.shoppinggoods({
      branchesId:this.data.branchId,
      smallBranchesId: this.data.cloudBranchId,
      userId: wx.getStorageSync('userId')
    }).then(res=>{
      console.log(4444,res.data.data)
      if(res.data.result==200){
        if(res.data.data){
          let Adata=res.data.data
          let data = Adata.cartEffectiveList?Adata.cartEffectiveList:[]
          let datax = Adata.cartExpireList?Adata.cartExpireList:[]
          let waterData = Adata.cartWaterEffectiveList?Adata.cartWaterEffectiveList:[]
          let mealData = Adata.cartMealEffectiveList?Adata.cartMealEffectiveList:[]
          let ecData = Adata.cartMallEffectiveList?Adata.cartMallEffectiveList:[]
          let cloudData = Adata.cartSmallEffectiveList?Adata.cartSmallEffectiveList:[]
          let allsum=0
          if (data&&data.length > 0) {
            data.forEach(item => {
              if (item.discountStatus == 10) {   //计算总价格
                allsum += (item.discountPrice * 1) * (item.goodsNum * 1)
              }
              if (item.discountStatus != 10) {
                allsum += (item.grouponPrice * 1) * (item.goodsNum * 1)
              }

              item.discountPrice = getNum(item.discountPrice / 100)
              item.friendSellPrice = getNum(item.friendSellPrice / 100)
              item.grouponPrice = getNum(item.grouponPrice / 100)
            })
          }
          if (waterData&&waterData.length > 0) {
            waterData.forEach(wat => {
              allsum += wat.grouponPrice * 1 * wat.goodsNum * 1
              wat.grouponPrice = getNum(wat.grouponPrice / 100)
            })
          }
          if (ecData&&ecData.length > 0) {
            ecData.forEach(ec => {
              if (ec.discountStatus == 10) {   //计算总价格
                allsum += (ec.discountPrice * 1) * (ec.goodsNum * 1)
              }
              if (ec.discountStatus != 10) {
                allsum += (ec.grouponPrice * 1) * (ec.goodsNum * 1)
              }
              ec.discountPrice = getNum(ec.discountPrice / 100)
              ec.friendSellPrice = getNum(ec.friendSellPrice / 100)
              ec.grouponPrice = getNum(ec.grouponPrice / 100)
            })
          }
          if (mealData&&mealData.length > 0) {
            mealData.forEach(meal => {
              allsum += meal.grouponPrice * 1 * meal.goodsNum * 1
              meal.grouponPrice = getNum(meal.grouponPrice / 100)
            })
          }
          let combineG = false;//满减活动的组合商品集合
          let manyPriCombine = false;//多件多折组合商品集合
          if (cloudData&&cloudData.length > 0) {
            this.setData({ fullMax:false })
            let fullDecMoneyList = [] //用来提取组合商品满减信息
            let fullDecMoney =0  //组合商品/参与满减商品的总额
            let manyPriManyFoldsList = [];//多件多折设置
            let maxDiscount = 0;//多件多折的最高折扣
            combineG = cloudData.some(clv=> clv.activitySet==2&&clv.type==20 );//是否是满减活动的组合商品
            manyPriCombine = JSON.parse(JSON.stringify(cloudData.filter(clv=> clv.activitySet==2&&clv.type==70 )));//多件多折的组合商品集合
            let manyPriGoodsNum = 0;//多件多折的组合商品总数量
            cloudData.forEach(val => {
              val.nodis=false
              // （云店非活动商品）
              if(val.discountStatus !=10 &&!val.type) {
                allsum += (val.grouponPrice*1) * (val.goodsNum * 1)
              }
              console.log(allsum)
              if(val.type ==10&& val.limitPurchaseSettings!=3){//限时折扣活动 并且限购设置是 1.不限购 和 2.每人每种商品限购*件 
                allsum += (val.discountPrice*1) * (val.goodsNum * 1)
              }else{
                // 云店限时折扣活动（在前多少件参与折扣条件内按折扣价算）
                if(val.type == 10&&val.limitPurchaseSettings==3&& (val.userBoughtGoodsNum*1 + val.goodsNum*1)<= (val.purchaseQuantity*1))   {
                  allsum += (val.discountPrice * 1) * (val.goodsNum * 1)
                }
                // 云店限时折扣活动（超出前多少件参与折扣条件按原价算）
                if(val.type == 10&&val.limitPurchaseSettings==3&&(val.userBoughtGoodsNum*1 + val.goodsNum*1)>(val.purchaseQuantity*1)){
                  if(val.userBoughtGoodsNum*1<val.purchaseQuantity*1){  //用户历史购买小于限购数
                    let num = val.purchaseQuantity*1 - val.userBoughtGoodsNum*1
                    allsum += (val.discountPrice*1) * (num * 1)
                    let num2 = val.goodsNum*1 - num
                    allsum += (val.grouponPrice*1) * (num2 * 1)
                  }else{
                    allsum += (val.grouponPrice*1) * (val.goodsNum * 1)
                    val.nodis=true
                  }
                }
              }
              if(val.type == 20 ){
                let itemMoney = (val.grouponPrice*1) * (val.goodsNum * 1)
                fullDecMoney += itemMoney
                if(val.fullDecMoneyList && val.fullDecMoneyList.length>0){  //有满减活动
                  let newList= [...val.fullDecMoneyList]   //reverse()会改变原数组，这里通过...拷贝（拷贝一级）
                  let list = newList.reverse()
                  fullDecMoneyList = list
                  if(!combineG){  //非真说明是单个商品
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
              if(val.type == 50 ){//买一送一  直接按原价计算
                allsum += (val.grouponPrice*1) * (val.goodsNum * 1);               
              }
              if(val.type == 60){//第二件半价 
                allsum += (val.grouponPrice*1) * (val.goodsNum * 1); 
                if(val.goodsNum*1>=2){//购买数量大于2的需要减去数量除于2的向下取整数的一半价格
                  let minusNum = Math.floor(val.goodsNum / 2);
                  allsum -= (val.grouponPrice*1)/2*(minusNum);
                }
                val.averagePrice = getNum(floatObj.divide(((val.grouponPrice*1)+(val.grouponPrice*1)/2)/2,100));//买2件均价
              }
              if(val.type == 70){//多件多折 
                if(val.manyPriManyFoldsList && val.manyPriManyFoldsList.length>0){  //有多件多折设置
                  let newList= [...val.manyPriManyFoldsList];   //reverse()会改变原数组，这里通过...拷贝（拷贝一级）
                  let list = newList.reverse();
                  manyPriManyFoldsList = list;
                  for(let i=0 ;i<list.length;i++){//循环获取最高折扣率
                    if(getNum(floatObj.divide(list[i].discount*1,100))<maxDiscount||maxDiscount==0){
                      maxDiscount = getNum(floatObj.divide(list[i].discount*1,100));//最高折扣率
                    }
                  }
                  if(!manyPriCombine||manyPriCombine.length==0){//说明活动是单个商品多件多折
                    for(let i=0 ;i<list.length;i++){
                      if(val.goodsNum*1 >= list[i].count*1){//购买数量大于活动设置的数量
                        let discount = getNum(floatObj.divide(list[i].discount*1,100));//折扣率
                        allsum += (list[i].count*1) * (val.grouponPrice*1) * discount;//达到购买数量的那一部分按相应的折扣计算
                        if(val.amountExceeded==1){//超过购买数量按照原价购买
                          allsum += (val.goodsNum*1 - list[i].count*1) * (val.grouponPrice*1);
                        }else{//超过购买数量按照最高折扣购买
                          allsum += (val.goodsNum*1 - list[i].count*1) * (val.grouponPrice*1) * maxDiscount;
                        }
                        break
                      }
                    }
                  }else{
                    manyPriGoodsNum += val.goodsNum*1;//组合商品总数量
                  }
                }
              }
              if(val.type == 80 ){//好物预售  直接按预售价计算
                allsum += (val.prePrice*1*100) * (val.goodsNum * 1);  
                val.prePrice = getNum(val.prePrice*1);//预售价          
              }
              val.discountPrice = getNum(val.discountPrice / 100)
              val.grouponPrice = getNum(val.grouponPrice / 100)
            })
            if(combineG ){  //满减活动的组合商品集合
              if(fullDecMoneyList.length>0){
                let reduceNum= 0
                for(let i=0 ;i<fullDecMoneyList.length;i++){
                  if(fullDecMoney >= floatObj.multiply(fullDecMoneyList[i].fullMoney*1,100)){
                    reduceNum = (fullDecMoneyList[i].decMoney*1)
                    this.setData({ reduceNum })
                    if(i == 0){
                      this.setData({ fullMax:true })
                    }else{
                      let preItem = fullDecMoneyList[i-1]  //上一个满减设置，比当前的大
                      let differNum = floatObj.multiply(preItem.fullMoney*1,100)  - fullDecMoney  //计算相差金额
                      let json ={
                        differNum:getNum(floatObj.divide(differNum,100)),
                        nextNum: preItem.decMoney
                      }
                      this.setData({
                        preOrNext:json
                      })
                    }
                    allsum -= floatObj.multiply(reduceNum,100)
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
              manyPriCombine.forEach(val => {
                newGoodsNum += val.goodsNum;
                for(let i=0 ;i<manyPriManyFoldsList.length;i++){
                  if(manyPriGoodsNum >= manyPriManyFoldsList[i].count*1){//多件多折的组合商品数量大于活动设置的数量
                    let discount = getNum(floatObj.divide(manyPriManyFoldsList[i].discount*1,100));//折扣率
                    if(newGoodsNum <= manyPriManyFoldsList[i].count*1){//如果当前商品数量和前几个商品的数量的累计数量 <= 设置的最大数量
                      newGoodsNum1 = manyPriManyFoldsList[i].count*1-newGoodsNum;//剩余可以计算折扣的商品件数
                      allsum += (val.goodsNum*1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                    }else{//如果当前商品数量和前几个商品的数量累计数量 > 设置的数量
                      if(newGoodsNum1==0){//剩余可以计算折扣的商品件数置为0时
                        if(val.amountExceeded==1){//超过购买数量按照原价购买
                          allsum += (val.goodsNum*1) * (val.grouponPrice*1);
                        }else{//超过购买数量按照最高折扣购买
                          allsum += (val.goodsNum*1) * (val.grouponPrice*1) * maxDiscount;
                        }
                      }else{//剩余可以计算折扣的商品件数置不为0时
                        if(val.goodsNum > newGoodsNum1){// 如果当前商品的数量 大于 剩余可以计算折扣的商品件数
                          newGoodsNum1 = 0;//剩余可以计算折扣的商品件数置为0
                          allsum += (newGoodsNum1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                          if(val.amountExceeded==1){//超过购买数量按照原价购买
                            allsum += (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1);
                          }else{//超过购买数量按照最高折扣购买
                            allsum += (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1) * maxDiscount;
                          }
                        }else{// 如果当前商品的数量 等于 剩余可以计算折扣的商品件数
                          allsum += (val.goodsNum*1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                        }
                      }
                    }
                    break;
                  }
                }
              })
            }
          }
          //总金额转为元保存
          this.setData({
            totalValue: getNum(floatObj.divide(allsum, 100))
          })
        datax.forEach(el=>{
          el.discountPrice = getNum(el.discountPrice / 100)
          el.friendSellPrice = getNum(el.friendSellPrice / 100)
          el.grouponPrice = getNum(el.grouponPrice / 100)
        })
          let newdata = [...data,...ecData,...cloudData, ...waterData,...mealData]
        this.setData({
          shoppingdata: newdata,
          shoppingdata1:datax
        },()=>{
          this.updatagood(this.data.shoppingdata)  //购物车列表关联
        })
        }else{
          this.setData({
            shoppingdata: [],
            shoppingdata1: [],
            totalValue:'0.00'
          })
        }
      }
    })
  },
  //购物车数量
  shoppingnum(){
    service.shoppingnum({
      branchesId:this.data.branchId,
      smallBranchesId: this.data.cloudBranchId,
      userId: wx.getStorageSync('userId'),
      activityId: null,
      goodsCode: null,
    }).then(res=>{
      if(res.data.result==200){
        this.setData({
          shoppnum: res.data.data.goodsNumber
        })
        if(res.data.data.goodsNumber<1){  //购物车数量小于1隐藏购物袋
          this.setData({
            srcolloff: false
          })
        }
      }
    })
  },
  //input框数量输入
  goodInp(e){
    let inpValue=e.detail.value
    let dooditem = e.currentTarget.dataset.inpitem
    let { activityId, activityGoodsId, carCode, goodsSource,branchId} = dooditem
    if(inpValue>=1){
      service.addgoodnum({
        branchesId: branchId,
        userId: wx.getStorageSync('userId'),
        activityId: dooditem.activityId,
        goodsCode: dooditem.goodsCode,
        goodsResource: goodsSource,  //商品来源
        goodsNum: inpValue,
      }).then(res => {
        this.shoppingnum()
        this.getshoppingdata()
        if (res.data.result != 200) {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    }else{
      service.delshoppinggoods({
        cartCodes: [carCode]
      }).then(res => {
        if (res.data.result == 200) {
          let newdata = this.data.grouplist.map(item => {     //购物车清空需要手动给列表清0
            if (activityId == item.activityId && activityGoodsId == item.activityGoodsId) {
              item.goodnum = 0
            }
            return item
          })
          this.setData({
            grouplist:newdata,
            shoppingdata: [],
            shoppingdata1: [],
            totalValue: '0.00'
          })
          this.shoppingnum()
          this.getshoppingdata()
        }
      })  
    }
  },
  //购物车input数量输入
  shopgoodInp(e){
    let inpValue = e.detail.value
    let shinpitem = e.currentTarget.dataset.shinpitem
    let { skuId, cartCode, goodsCode, goodsResource, branchesId, activityId } = shinpitem
    if (inpValue >= 1) {
      service.addgoodnum({
        branchesId: branchesId,
        userId: wx.getStorageSync('userId'),
        goodsResource: goodsResource,  //来源拼团5 水管家20
        skuId: skuId,
        goodsCode: goodsCode,
        goodsNum: inpValue,
        activityId: activityId
      }).then(res => {
        this.shoppingnum()
        this.getshoppingdata()
        if (res.data.result != 200) {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    }else{
        service.delshoppinggoods({
          cartCodes: [cartCode]
        }).then(res => {
          if (res.data.result == 200) {
            let newdata = this.data.grouplist.map(item => {     //购物车清空需要手动给列表清0
              if (activityId == item.activityId && activityGoodsId == item.activityGoodsId) {
                item.goodnum = 0
              }
              return item
            })
            this.setData({
              grouplist:newdata,
              shoppingdata: [],
              shoppingdata1: [],
              totalValue: '0.00'
            })
            this.shoppingnum()
            this.getshoppingdata()
          }
        })
      }
  },
  //商品添加
  goodAdd(e){
    wx.showLoading({
      title: '加载中',
    })
    let dooditem =e.currentTarget.dataset.additem
    let { activityId, goodsCode, goodsSource,goodnum,branchId} = dooditem
    service.addgoodnum({
      branchesId: branchId,
      userId: wx.getStorageSync('userId'),
      goodsResource: goodsSource,  //商品来源
      activityId: activityId,
      goodsCode: goodsCode,
      goodsNum: ++goodnum
    }).then(res=>{
      wx.hideLoading()
      if(res.data.result==200){
        this.shoppingnum()
        this.getshoppingdata()
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //购物车商品添加
  shopgoodAdd(e){
    let shadditem = e.currentTarget.dataset.shadditem
    let { skuId, goodsCode, goodsResource, goodsNum, branchesId, activityId} = shadditem
    service.addgoodnum({
      branchesId: branchesId,
      userId: wx.getStorageSync('userId'),
      goodsResource: goodsResource,  //商品来源
      skuId: skuId,
      goodsCode: goodsCode,
      goodsNum: ++goodsNum,
      activityId: activityId
    }).then(res => {
      wx.hideLoading()
      if (res.data.result == 200) {
        this.shoppingnum()
        this.getshoppingdata()
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //商品减少
  goodDel(e){
    wx.showLoading({
      title: '加载中',
    })
    let dooditem = e.currentTarget.dataset.delitem
    let { activityId, activityGoodsId, carCode, goodsSource, goodnum,branchId} = dooditem
      if (goodnum>1){
        service.addgoodnum({
          branchesId: branchId,
          userId: wx.getStorageSync('userId'),
          goodsResource: goodsSource,  //来源拼团5 水管家20
          activityId: dooditem.activityId,
          goodsCode: dooditem.goodsCode,
          goodsNum: --goodnum
        }).then(res => {
          wx.hideLoading()
          if (res.data.result == 200) {
            this.shoppingnum()
            this.getshoppingdata()
          }else{
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        })
      }else{
        wx.showLoading({
          title: '加载中',
        })
        service.delshoppinggoods({
          cartCodes: [carCode]
        }).then(res => {
          wx.hideLoading()
          if (res.data.result == 200) {
            let newdata = this.data.grouplist.map(item => {     //购物车清空需要手动给列表清0
              if (activityId == item.activityId && activityGoodsId == item.activityGoodsId) {
                item.goodnum = 0
              }
              return item
            })
            this.setData({
              grouplist: newdata,
              shoppingdata:[],
              shoppingdata1:[],
              totalValue:'0.00'
            })
            this.shoppingnum()
            this.getshoppingdata()
          }else{
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        })
      }
  },
  //购物车商品减少
  shopgoodDel(e){
    wx.showLoading({
      title: '加载中',
    })
    let shdelitem = e.currentTarget.dataset.shdelitem
    let { skuId, cartCode, goodsCode, goodsResource, goodsNum, branchesId, activityId, activityGoodsId} = shdelitem
    if (goodsNum > 1) {
      service.addgoodnum({
        branchesId: branchesId,
        userId: wx.getStorageSync('userId'),
        goodsResource: goodsResource,  //来源拼团5 水管家20
        skuId: skuId,
        goodsCode: goodsCode,
        goodsNum: --goodsNum,
        activityId: activityId
      }).then(res => {
        wx.hideLoading()
        if (res.data.result == 200) {
          this.shoppingnum()
          this.getshoppingdata()
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    } else {
      wx.showLoading({
        title: '加载中',
      })
      service.delshoppinggoods({
        cartCodes: [cartCode]
      }).then(res => {
        wx.hideLoading()
        if (res.data.result == 200) {
          this.setData({
            shoppingdata: [],
            shoppingdata1: [],
            totalValue: '0.00'
          })
          this.shoppingnum()
          this.goodnumreset(activityGoodsId)
          this.getshoppingdata()
        }else{
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
    }
  },
  //清空购物车
  emptygood(){
    if (this.data.shoppnum>0){
      let arr= [];
      this.data.shoppingdata.forEach(item=>{  //上架的清空
        arr.push(item.cartCode)
      })
      this.data.shoppingdata1.forEach(el=>{  //下架的清空
        arr.push(el.cartCode)
      })
      wx.showModal({
        title: '提示',
        content: '确定清空购物车吗？',
        confirmColor: '#F2922F',
        success:(res)=> {
          if (res.confirm) {
            wx.showLoading({
              title: '加载中',
            })
            service.delshoppinggoods({
              cartCodes: arr
            }).then(res => {
              wx.hideLoading()
              if(res.data.result==200){
                let newdata = this.data.grouplist.map(item => {     //购物车清空需要手动给列表清0
                  item.goodnum = 0
                  return item
                })
                this.setData({
                  grouplist:newdata,
                  shoppingdata:[],
                  shoppingdata1:[],
                  totalValue: '0.00'
                })
                this.shoppingnum()     //购物车数量
                this.getshoppingdata()   //购物车列表
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
    }
  },
  //购物袋点击
  buydaiClick(){
    this.setData({
      srcolloff:!this.data.srcolloff
    })
  },
  //立即购买
  buyNow(){
    wx.switchTab({
      url: '/pages/shoppingCar/index',
    })
  },
  //商品详情
  goodsDetailClick(e){
    let { storeGoodsId, activityId, repertory,goodsCode}=e.currentTarget.dataset.itdetail;
    if (repertory!=0){
      if(this.data.goGoodtype==20){
      wx.navigateTo({
        url: '/pages/groupGoodDetail/index?storeGoodsId=' + storeGoodsId + '&activityId=' + activityId,
      })
    }
    if(this.data.goGoodtype==10){
      wx.navigateTo({
        url: '/pages/fingerMallGoodDetail/index?skuCode=' + goodsCode,
      })
    }
    }else{
      wx.showToast({
        title: '已售罄',
        icon: 'none'
      })
    }
  },
  //空白处点击收回购物车
  showoff(){
    this.setData({
      srcolloff:false
    })
  },
  //商品列表
  getgroupslist(){
    wx.showLoading({
      title: '加载中',
    })
    service.getgrouplist({
      branchId: this.data.branchId,
      userId: wx.getStorageSync('userId'),
      discountStatus: this.data.discountStatus,
      activityType: this.data.activityType,
      categoryCode: this.data.navtypeall,
      pageSize: this.data.pageSize,
      pageNum: this.data.pageNum,
      flag: this.data.flag,
      activityStatus: 1,
    }).then((res) => {
      wx.hideLoading()
      if (res.data.result == 200) {
        wx.stopPullDownRefresh()
        let data = res.data.data.list
        if(data&&data.length>0){
          let dataDispose=data.map(item=>{
            item.goodsPhotos=item.goodsPhotos.split(',')[0]
            item.discountPrice = getNum(item.discountPrice / 100)
            item.cardAmount = getNum(item.cardAmount / 100)
            item.goodnum=0
            item.carCode=''
            return item
          })
          let newData=[...this.data.grouplist,...dataDispose]
          this.setData({
            grouplist:newData,
            listNum:dataDispose.length
          },()=>{
            this.getshoppingdata()   //购物车列表
          })
        }
        if(res.data.data.list.length<1){
          this.setData({
            noData:true
          })
        }else{
          this.setData({
            noData:false
          })
        }
      }
    })
  },
  //限时折扣商品列表
  getDiscountTimelist(){
    wx.showLoading({
      title: '加载中',
    })
    service.queryActivityGoodsList({
      userId:wx.getStorageSync('userId'),
      pageSize: this.data.pageSize,
      pageNum: this.data.pageNum,
    }).then((res) => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      console.log('限时折扣',res)
      if (res.data.result == 200) {
        let data = res.data.data
        if(data&&data.length>0){
          let dataDispose=data.map(item=>{
            item.goodsPhotos=item.goodsPic.split(',')[0]
            item.discountPrice = getNum(item.discountPrice / 100)
            item.cardAmount = getNum(item.cardAmount / 100)
            item.goodnum=0
            item.carCode=''
            return item
          })
          let newData=[...this.data.grouplist,...dataDispose]
          console.log(newData)
          this.setData({
            grouplist:newData,
            listNum:dataDispose.length
          },()=>{
            this.getshoppingdata()   //购物车列表
          })
        }
        if(res.data.data.length<1){
          this.setData({
            noData:true
          })
        }else{
          this.setData({
            noData:false
          })
        }
      }
    })
  },
  touchret(){},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.type==10){  //限时折扣进入
      wx.setNavigationBarTitle({
        title: '限时折扣'
      })
      this.setData({
        goGoodtype:'10',
      })
    }
    if(options.type==20){  //拼团进入
      wx.setNavigationBarTitle({
        title: '指尖拼团'
      })
      this.setData({
        goGoodtype:'20',
        flag: 0,
      })
    }
  },
  stopinp(){
    //input框冒泡
  },
  //拼团商品头部分类
  getGroupType(){
    service.getgrouptype({
      branchId: this.data.branchId,
      activityStatus: 1,
    }).then((res) => {
      if (res.data.result == 200) {
        let typedata=res.data.data
        this.setData({
          groupType: typedata,
        },()=>{
          if (typedata.length) {
            if (!this.data.flag) {
              this.setData({
                activityType: typedata[0].activityType,
                navtypeall: typedata[0].categoryCode,
                flag: typedata[0].flag,
              })
            }
          }
          this.getgroupslist()
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //购物车数量和cartcode赋值给对应列表数据
  updatagood(data){
    console.log(11111,data)
    console.log(this.data.grouplist)
    let newdataNum =[]
    newdataNum =this.data.grouplist.map(item => {
      data.map(el=>{
        if(item.activityGoodsId==el.activityGoodsId){
          item.goodnum=el.goodsNum     //商品数量
          item.carCode = el.cartCode   //清空购物车需要cartcode
          item.nodis = el.nodis
        }
      })
      return item
    })
    this.setData({
      grouplist:newdataNum
    })
  },
  //购物车某商品数量小于1时列表需要手动赋值为0
  goodnumreset(activityGoodsId) {
    let newdataNum = this.data.grouplist.map(item => {
        if (activityGoodsId == item.activityGoodsId) {
          item.goodnum = 0
        }
      return item
    })
    this.setData({
      grouplist: newdataNum
    })
  },
  //获取最新站点
  getcomm() {
    let historydata = wx.getStorageSync('historyAddress')
    let presentAddress = wx.getStorageSync('presentAddress')
    if (historydata) {
      service.getnewcommunity({
        branchId: historydata.siteId
      }).then(res => {
        if (res.data.result == 200) {
          let data = res.data.data
          if (historydata['latitude'] && historydata['longitude']) {
            data['distance'] = historydata['distance']
            data['latitude'] = historydata['latitude']
            data['longitude'] = historydata['longitude']
            wx.setStorageSync('historyAddress', data)
          }
        }
      })
    }
    if (presentAddress) {
      service.getnewcommunity({
        branchId: presentAddress.siteId
      }).then(res => {
        console.log(res)
        if (res.data.result == 200) {
          let data = res.data.data
          if (presentAddress['latitude'] && presentAddress['longitude']) {
            data['distance'] = presentAddress['distance']
            data['latitude'] = presentAddress['latitude']
            data['longitude'] = presentAddress['longitude']
            wx.setStorageSync('presentAddress', data)
            this.setData({
              myCommunity: data.siteName
            })
          }
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideShareMenu();
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点
    if(presentAddress){
      this.getcomm()
    }else{
      if(this.data.goGoodtype!=10){
        wx.navigateTo({
          url:"/pages/homeCommunity/index?enterType=10"  //云店20 拼团10
        })
      }
    }
    
    this.setData({
      branchId: presentAddress?presentAddress.siteId:"",    //拼团站点id
      cloudBranchId:currentCloudShop?currentCloudShop.siteId:"",    //云店站点id
      userId: wx.getStorageSync('userId'),   //用户id
      grouplist:[],
      pageNum:1,
      noData:false
    });
    if(this.data.goGoodtype=='10'){ //限时折扣
      this.getDiscountTimelist()
    }else{
      this.getGroupType()   //拼团头部分类
    }
    this.shoppingnum()     //购物车数量
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      grouplist:[]
    })
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
      pageNum:1,
      grouplist:[]
    })
    this.getcomm()
    if(this.data.goGoodtype=='20'){
      this.getgroupslist()
    }
    if(this.data.goGoodtype=='10'){
      this.getDiscountTimelist()
    }
    this.shoppingnum()     //购物车数量
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.listNum<10){  //加载数据小于10条不再加载
      return;
    }else{
      this.setData({
        pageNum: ++this.data.pageNum
      },()=>{
        if(this.data.goGoodtype=='20'){
          this.getgroupslist()
        }
        if(this.data.goGoodtype=='10'){
          this.getDiscountTimelist()
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})