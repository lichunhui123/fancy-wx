const service = require('../../service/index.js');
import floatObj from '../../utils/floatObj.js';
import {getNum} from "../../utils/util.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    contentHeight:0,//内容区域高度
    myCommunity:"",//站点地址
    branchId: "",    //云店站点id
    groupBranchId:'', //拼团站点id
    userId: wx.getStorageSync('userId'),   //用户id
    classType:[],  //云店商品分组
    goodsList:[],  //商品列表
    navtypeall:null,  //头部分组code
    navtype:null,  //分组类型  <--限时折扣、满减活动
    pageNum:1,  //当前页数
    pageSize:10, //每页数量
    srcolloff:false, //购物车弹起
    shoppingdata:[], //购物车商品
    shoppingdata1:[], //购物车过期
    shoppnum:0, //购物车数量
    totalValue:'0.00',  //总价
    noData:false,  //无数据
    listNum:0, //数据返回长度
    showTime:false,//是否展示了时间的模块
    countdownTime: {   //限时折扣倒计时
      day: '00',
      hour: '00',
      minute: '00',
      second: '00',
    },
    hasStart:false,
    someTime:{ //满减活动，买一送一，第二件半价，多件多折，多人拼团头部时间
      startTime:'',
      endTime:''
    },
    combineGood:false,  //组合商品
    fullDecMoneyList:[], //组合商品集合
    reduceNum:0,  //已减金额
    fullMax:false,  //满足最大的满减设置
    preOrNext:{},  //相差金额和下次减金额
  },
  //倒计时时间计算
  countdown(times) {
    this.timer = null;
    this.timer = setInterval(() => {
      let day = 0,
        hour = 0,
        minute = 0,
        second = 0;//时间默认值
      if (times > 0) {
        day = Math.floor(times / (60 * 60 * 24));
        hour = Math.floor(times / (60 * 60)) - (day * 24);
        minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
        second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
      }
      if (day <= 9) day = '0' + day;
      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;
      //
      times--;

      this.setData({
        countdownTime: {
          day: day,
          hour: hour,
          minute: minute,
          second: second,
        },
      })
      if (times < 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  },
  //跳转选择站点页面
  nearSite(){
    wx.navigateTo({
      url:"/pages/homeCommunity/index?enterType=20"  //云店20 拼团10
    })
  },
  //头部类型切换
  navTypeClick(e){
    let navitem = e.target.dataset.navitem;
    if(!this.onOff){
      this.onOff = true;//开关控制重复点击
      clearInterval(this.timer);
      this.setData({
        navtypeall: navitem.groupCode,
        navtype: navitem.type,
        ['someTime.startTime']:navitem.startTime,
        ['someTime.endTime']:navitem.endTime,
        goodsList:[],
        pageNum:1,
        noData:false
      },()=>{
        this.getgroupslist()   //商品列表
        if(navitem.type==10){  //活动是限时折扣，调用计时
          let tm=navitem.endTime.substring(0, 19);
          let endtime= (new Date(tm.replace(/-/g,"/"))).getTime();
          if (endtime>0){
            let times = (endtime - (new Date()).getTime()) / 1000
            this.countdown(times)
          }else{
            this.countdown(0)
          }
        }
        if(navitem.type==80){//活动是好物预售，调用计时
          let tm=navitem.startTime.substring(0, 19);
          let startTime= (new Date(tm.replace(/-/g,"/"))).getTime();
          if (startTime>0){
            let times = (startTime - (new Date()).getTime()) / 1000;
            if(times<=0){
              this.setData({
                hasStart:true
              })
            }
            this.countdown(times)
          }else{
            this.countdown(0)
          }
        }
        if(navitem.type==10||navitem.type==20||navitem.type==50||navitem.type==60||navitem.type==70||navitem.type==80){
          this.setContentHeight(60) //设置内容区域高度
          this.setData({showTime:true});
        }else{
          this.setData({showTime:false});
        }
      })
    }
  },
  //购物车数量
  shoppingnum(){
    service.shoppingnum({
      smallBranchesId: this.data.branchId,
      branchesId:this.data.groupBranchId,
      userId: this.data.userId,
    }).then(res=>{
      if(res.data.result==200){
        this.setData({
          shoppnum: res.data.data.goodsNumber
        })
        if(res.data.data.goodsNumber>0&&this.data.goodsList.length>0){
          if(this.data.showTime){
            this.setContentHeight(320);
          }else{
            this.setContentHeight(280);
          }
        }else{
          this.setContentHeight(44);
        }
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
    let { activityId, activityGoodsId, carCode, resource,branchesId,activityCode} = dooditem
    if(inpValue>=1){
      service.addgoodnum({
        activityId:activityCode,
        branchesId: branchesId,
        userId:this.data.userId,
        goodsCode: dooditem.goodsCode,
        goodsResource: resource,  //商品来源
        goodsNum: inpValue,
      }).then(res => {
        this.refreshShopping()
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
          let newdata = this.data.goodsList.map(item => {     //购物车清空需要手动给列表清0
            if (activityId == item.activityId && activityGoodsId == item.activityGoodsId) {
              item.goodnum = 0
            }
            return item
          })
          this.setData({
            goodsList:newdata,
            shoppingdata: [],
            shoppingdata1: [],
            totalValue: '0.00'
          })
          this.refreshShopping()
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
        userId: this.data.userId,
        goodsResource: goodsResource,  //来源拼团5 水管家20
        skuId: skuId,
        goodsCode: goodsCode,
        goodsNum: inpValue,
        activityId: activityId
      }).then(res => {
        this.refreshShopping()
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
            this.goodnumreset(goodsCode)
            this.setData({
              shoppingdata: [],
              shoppingdata1: [],
              totalValue: '0.00'
            })
            this.refreshShopping()
          }
        })
      }
  },
  //好物预售商品添加按钮
  goodAddGray(){
    wx.showToast({
      title: "活动未开始",
      icon: 'none'
    })
  },
  //商品添加
  goodAdd(e){
    wx.showLoading({
      title: '加载中',
    })
    let dooditem =e.currentTarget.dataset.additem
    let { goodsCode, resource,goodnum,branchesId,activityCode} = dooditem
    service.addgoodnum({
      activityId:activityCode,
      branchesId: branchesId,
      userId: this.data.userId,
      goodsResource: resource,  //商品来源
      goodsCode: goodsCode,
      goodsNum: ++goodnum 
    }).then(res=>{
      wx.hideLoading()
      if(res.data.result==200){
        this.refreshShopping()
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
      userId: this.data.userId,
      goodsResource: goodsResource,  //商品来源
      skuId: skuId,
      goodsCode: goodsCode,
      goodsNum: ++goodsNum,
      activityId: activityId
    }).then(res => {
      wx.hideLoading()
      if (res.data.result == 200) {
        this.refreshShopping()
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
    let { goodsCode,carCode, resource, goodnum,branchesId,activityCode} = dooditem
      if (goodnum>1){
        service.addgoodnum({
          activityId:activityCode,
          branchesId: branchesId,
          userId: this.data.userId,
          goodsResource: resource,  //来源拼团5 水管家20
          goodsCode:goodsCode,
          goodsNum: --goodnum
        }).then(res => {
          wx.hideLoading()
          if (res.data.result == 200) {
            this.refreshShopping()
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
            this.goodnumreset(goodsCode)
            this.setData({
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
    let { skuId, cartCode, goodsCode, goodsResource, goodsNum, branchesId, activityId} = shdelitem
    if (goodsNum > 1) {
      service.addgoodnum({
        branchesId: branchesId,
        userId: this.data.userId,
        goodsResource: goodsResource,  //来源拼团5 水管家20
        skuId: skuId,
        goodsCode: goodsCode,
        goodsNum: --goodsNum,
        activityId: activityId
      }).then(res => {
        wx.hideLoading()
        if (res.data.result == 200) {
          this.refreshShopping()
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
          this.goodnumreset(goodsCode)
          this.refreshShopping()
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
                let newdata = this.data.goodsList.map(item => {     //购物车清空需要手动给列表清0
                  item.goodnum = 0
                  return item
                })
                this.setData({
                  goodsList:newdata,
                  shoppingdata:[],
                  shoppingdata1:[],
                  totalValue: '0.00'
                })
                this.refreshShopping()
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
  //云店商品头部分类-----1
  getClassType(){
    service.cloudStoreHeadType({
      branchesId: this.data.branchId,
    }).then((res) => {
      if (res.data.result == 200) {
        let typedata=res.data.data;
        if(typedata.length){
          this.setData({
            classType: typedata,
          },()=>{
            if(!this.onOff){
              this.onOff = true;//开关控制重复点击
              this.getgroupslist()
            }
          })
        }
      }else{
        if(!this.onOff){
          this.onOff = true;//开关控制重复点击
          this.getgroupslist()
        }
      }
    })
  },
  //商品列表-------2
  getgroupslist(){
    wx.showLoading({
      title: '加载中',
    })
    let {branchId, navtypeall, navtype, pageNum, pageSize} = this.data
    service.cloudStoreGoods({
      branchesId: branchId,
      groupCode: !navtype?navtypeall:null,  //商品分组code
      activityCode:navtype?navtypeall:null,   //活动code
      type:navtype,  //活动类型 10=折扣 20=满减
      pageNo: pageNum,
      pageSize: pageSize,
    }).then((res) => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      console.log('列表',res)
      if (res.data.result == 200) {
        let data = res.data.data
        if(data&&data.length>0){
          let dataDispose=data.map(item=>{
            item.goodsPic=item.goodsPic.split(',')[0]
            item.goodnum=0
            item.carCode=''
            item.discountRatio = item.discountRatio ? item.discountRatio / 10 : 0
            item.averagePrice = getNum((item.showSalesPrice+item.showSalesPrice/2)/2)//第二件半价的均价
            return item
          })
          let newData=[...this.data.goodsList,...dataDispose]
          this.setData({
            listNum:dataDispose.length,
            goodsList:newData,
            noData:false
          },()=>{
            this.refreshShopping()
          })
        }else{
          this.onOff = false;//开关控制重复点击
          this.setData({
            noData:true
          })
        }
      }else{
        this.onOff = false;//开关控制重复点击
        this.setData({
          noData:true
        })
      }
    }).catch(()=>{
      this.setData({
        noData:true
      })
    })
  },
  //右侧商品列表滚动底部加载下一页
  scrolltolower(){
    if(this.data.listNum<10){  //加载数据小于10条不再加载
      return;
    }else{
      this.setData({
        pageNum: ++this.data.pageNum
      },()=>{
          this.getgroupslist()
      })
    }
  },
  //刷新购物车相关
  refreshShopping(){
    this.shoppingnum()     //购物车数量
    this.getshoppingdata()   //购物车列表
  },
  //购物车商品--------3
  getshoppingdata(){
    service.shoppinggoods({
      smallBranchesId: this.data.branchId,
      branchesId:this.data.groupBranchId,
      userId: this.data.userId
    }).then(res=>{
      console.log('gouw',res.data.data)
      this.onOff = false;//开关控制重复点击
      if(res.data.result==200){
        if(res.data.data){
          let Adata=res.data.data
          let data = Adata.cartEffectiveList?Adata.cartEffectiveList:[];//拼团商品
          let datax = Adata.cartExpireList?Adata.cartExpireList:[];//
          let waterData = Adata.cartWaterEffectiveList?Adata.cartWaterEffectiveList:[];//水管家商品
          let mealData = Adata.cartMealEffectiveList?Adata.cartMealEffectiveList:[];//水票套餐商品
          let ecData = Adata.cartMallEffectiveList?Adata.cartMallEffectiveList:[];//指尖电商
          let cloudData = Adata.cartSmallEffectiveList?Adata.cartSmallEffectiveList:[];//云店商品
          let allsum = 0;
          if (data&&data.length > 0) {//拼团商品
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
          if (waterData&&waterData.length > 0) {//水管家商品
            waterData.forEach(wat => {
              allsum += (wat.grouponPrice * 1) * (wat.goodsNum * 1)
              wat.grouponPrice = getNum(wat.grouponPrice / 100)
            })
          }
          if (ecData&&ecData.length > 0) {//指尖电商
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
          if (mealData&&mealData.length > 0) {//水票套餐商品
            mealData.forEach(meal => {
              allsum += ( meal.grouponPrice * 1) * (meal.goodsNum * 1 )
              meal.grouponPrice = getNum(meal.grouponPrice / 100)
            })
          }
          let combineG = false;//满减活动的组合商品集合
          let manyPriCombine = false;//多件多折组合商品集合
          if (cloudData&&cloudData.length > 0) {//云店商品
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
              val.discountRatio=val.discountRatio?(val.discountRatio/10):0
              // （云店非活动商品）
              if(val.discountStatus !=10 &&!val.type) {
                allsum += (val.grouponPrice*1) * (val.goodsNum * 1)
              }
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
              if(val.type == 20 ){//满减活动
                let itemMoney = (val.grouponPrice*1) * (val.goodsNum * 1)
                fullDecMoney += itemMoney
                if(val.fullDecMoneyList && val.fullDecMoneyList.length>0){  //有满减活动
                  let newList= [...val.fullDecMoneyList]   //reverse()会改变原数组，这里通过...拷贝（拷贝一级）
                  let list = newList.reverse()
                  fullDecMoneyList = list
                  if(!combineG){  //非真说明是单个商品满减
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
                allsum += (val.prePrice*1*100) * (val.goodsNum * 1); //元转分 
                val.prePrice = getNum(val.prePrice*1);//预售价           
              }
              val.discountPrice = getNum(floatObj.divide(val.discountPrice,100))
              val.grouponPrice = getNum(floatObj.divide(val.grouponPrice,100))
            })
            if(combineG){  //满减活动的组合商品集合
              if(fullDecMoneyList.length>0){//满减规则
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
          }else{
            this.setData({ fullMax:true })
          }
          //总金额转为元保存
          this.setData({
            totalValue: getNum(floatObj.divide(allsum, 100))
          })
          datax.forEach(el=>{
            el.discountPrice = getNum(floatObj.divide(el.discountPrice,100))
            el.friendSellPrice = getNum(floatObj.divide(el.friendSellPrice,100))
            el.grouponPrice = getNum(floatObj.divide(el.grouponPrice,100))
          })
          let newdata = [...cloudData,...data,...waterData,...ecData,...mealData]
          this.setData({
            shoppingdata: newdata,
            shoppingdata1:datax,
            combineGood:combineG
          },()=>{
            this.updatagood(this.data.shoppingdata)  //购物车列表关联
          })
        }else{
          this.setData({
            shoppingdata: [],
            shoppingdata1: [],
            totalValue:'0.00',
            fullMax:true
          })
        }
      }
    })
  },
  //购物车数量和cartcode赋值给对应列表数据------4
  updatagood(data){
    let newdataNum =[]
      newdataNum =this.data.goodsList.map(item => {
        data.map(el=>{
          if(item.goodsCode==el.goodsCode){
            item.goodnum=el.goodsNum     //商品数量
            item.carCode = el.cartCode   //商品减少为0(相当于删除)需要cartcode
            item.nodis = el.nodis
          }
        })
        return item
      })
    this.setData({
      goodsList:newdataNum
    })
  },
  //列表手动赋值为0（列表商品数量是根据购物车数量取的，购物车某商品数量小于1时商品不存在，列表需要手动赋值0）
  goodnumreset(goodsCode) {
    let newdataNum = this.data.goodsList.map(item => {
        if (goodsCode == item.goodsCode) {
          item.goodnum = 0
        }
      return item
    })
    this.setData({
      goodsList: newdataNum
    })
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
    let { goodsCode,activityCode}=e.currentTarget.dataset.itdetail;
    wx.navigateTo({
      url: '/pages/cloudStoreDetail/index?storeGoodsId=' + goodsCode + '&activityCode='+activityCode,
    })
  },
  //空白处点击收回购物车
  showoff(){
    this.setData({
      srcolloff:false
    })  
  },
  //设置内容区域高度
  setContentHeight(height){
    let systemInfo = wx.getSystemInfoSync(); //获取设备信息
    let windowHeight = systemInfo.windowHeight;
    let useHeight = height / 750 * systemInfo.windowWidth;//rpx转px
    let contentHeight = windowHeight-useHeight;//设置最大高度
    this.setData({
      contentHeight,//内容区域最大高度
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  stopinp(){ 
    //input框冒泡
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //获取最新站点
  getcomm() {
    let historydata = wx.getStorageSync('historyCloudShop')
    let currentCloud = wx.getStorageSync('currentCloudShop')
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
            wx.setStorageSync('historyCloudShop', data)
          }
        }
      })
    }
    if (currentCloud) {
      service.getnewcommunity({
        branchId: currentCloud.siteId
      }).then(res => {
        if (res.data.result == 200) {
          let data = res.data.data
          if (currentCloud['latitude'] && currentCloud['longitude']) {
            data['distance'] = currentCloud['distance']
            data['latitude'] = currentCloud['latitude']
            data['longitude'] = currentCloud['longitude']
            wx.setStorageSync('currentCloudShop', data)
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
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店选择的站点
    let presentAddress = wx.getStorageSync("presentAddress");//拼团选择的站点
    if(currentCloudShop){
      this.getcomm()
    }else{
      wx.navigateTo({
        url:"/pages/homeCommunity/index?enterType=20"
      })
    }
    this.setData({
      branchId: currentCloudShop?currentCloudShop.siteId:'',    //云店站点id
      groupBranchId:presentAddress?presentAddress.siteId:'',    //云店站点id
      userId: wx.getStorageSync('userId'),   //用户id
      goodsList:[],
      classType:[],
      pageNum:1,
      noData:false,
      navtypeall:null,
      navtype:null
    });
    this.getClassType()   //头部分类
    this.setContentHeight(44) //设置内容区域高度
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      goodsList:[]
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
      goodsList:[],
      navtypeall:null,
      navtype:null
    })
    this.getcomm()
    this.getClassType()   //头部分类
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