const service = require('../../service/index.js');
import floatObj from '../../utils/floatObj.js';
import {getNum} from "../../utils/util.js";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shoppNum:Number, //购物车数量
    shoppingDatas:Object,//请求回来的未处理的数据
    needBeforeChangeShopp:Boolean,//在触发购物车数量变化时是否需要处理函数
  },

  /**
   * 组件的初始数据
   */
  data: {
    showShoppingBg: false, //购物车弹起
    totalValue: '0.00',  //总价
    userId: wx.getStorageSync('userId'),  //用户id
    shoppingData:[], //购物车商品
    shoppingExpireData:[] //购物车过期的或者已下架的商品
  },
  observers:{
    'shoppingDatas':function(field){
      //重新计算总计
      this.calculatedTotal();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //计算总计
    calculatedTotal(){
      let Adata= this.properties.shoppingDatas;//请求回来的未处理的数据
      let data = Adata.cartEffectiveList?Adata.cartEffectiveList:[];//拼团商品
      let datax = Adata.cartExpireList?Adata.cartExpireList:[];//已下架商品或者超出配送范围的商品
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
            if(ec.limitPurchaseSettings!=3){
              allsum += (ec.discountPrice * 1) * (ec.goodsNum * 1)
            }
            // 限时折扣活动（在前多少件参与折扣条件内按折扣价算）
            if(ec.limitPurchaseSettings==3&& (ec.userBoughtGoodsNum*1 + ec.goodsNum*1)<= (ec.purchaseQuantity*1))   {
              allsum += (ec.discountPrice * 1) * (ec.goodsNum * 1)
            }
            // 限时折扣活动（超出前多少件参与折扣条件按原价算）
            if(ec.limitPurchaseSettings==3&&(ec.userBoughtGoodsNum*1 + ec.goodsNum*1)>(ec.purchaseQuantity*1)){
              if(ec.userBoughtGoodsNum*1<ec.purchaseQuantity*1){  //用户历史购买小于限购数
                let num = ec.purchaseQuantity*1 - ec.userBoughtGoodsNum*1
                allsum += (ec.discountPrice*1) * (num * 1)
                let num2 = ec.goodsNum*1 - num
                allsum += (ec.grouponPrice*1) * (num2 * 1)
              }else{
                allsum += (ec.grouponPrice*1) * (ec.goodsNum * 1)
                ec.nodis=true
              }
            }
          }
          if (ec.discountStatus != 10) {
            allsum += (ec.grouponPrice * 1) * (ec.goodsNum * 1)
          }
          ec.discountRatio=ec.discountRatio?(ec.discountRatio/10):0;//折扣比例
          ec.discountPrice = getNum(ec.discountPrice / 100);
          ec.friendSellPrice = getNum(ec.friendSellPrice / 100);
          ec.grouponPrice = getNum(ec.grouponPrice / 100);
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
        let fullDecMoneyList = [] //用来提取组合商品满减信息
        let fullDecMoney =0  //组合商品/参与满减商品的总额
        let manyPriManyFoldsList = [];//多件多折设置
        let maxDiscount = 0;//多件多折的最高折扣
        combineG = cloudData.some(clv=> clv.activitySet==2&&clv.type==20 );//是否是满减活动的组合商品
        manyPriCombine = JSON.parse(JSON.stringify(cloudData.filter(clv=> clv.activitySet==2&&clv.type==70 )));//多件多折的组合商品集合
        let manyPriGoodsNum = 0;//多件多折的组合商品总数量
        cloudData.forEach(val => {
          val.nodis=false
          val.discountRatio=val.discountRatio?(val.discountRatio/10):0;//折扣比例
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
              if(!manyPriCombine||manyPriCombine.length==0||manyPriCombine.length==1){//说明活动是单个商品多件多折 或者是组合商品但是只有1个商品
                if(val.goodsNum*1 < list[list.length-1].count*1){//没有达到最低的折扣数量 按原价计算
                  allsum += (val.goodsNum*1) * (val.grouponPrice*1);
                }
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
                reduceNum = (fullDecMoneyList[i].decMoney*1);
                allsum -= floatObj.multiply(reduceNum,100);
                break
              }
            }
          }
        }
        if(manyPriCombine&&manyPriCombine.length>1){ //多件多折的组合商品集合大于1个商品时
          let newGoodsNum=0;//当前商品数量和前几个商品的数量累计的总数量
          let newGoodsNum1=0;//剩余可以计算折扣的商品件数
          manyPriCombine.forEach((val,index) => {
            if(manyPriGoodsNum < manyPriManyFoldsList[manyPriManyFoldsList.length-1].count*1){//没有达到最低的折扣数量 按原价计算
              allsum += (val.goodsNum*1) * (val.grouponPrice*1);
            }
            newGoodsNum += val.goodsNum;
            for(let i=0 ;i<manyPriManyFoldsList.length;i++){
              if(manyPriGoodsNum >= manyPriManyFoldsList[i].count*1){//多件多折的组合商品数量大于活动设置的数量
                let discount = getNum(floatObj.divide(manyPriManyFoldsList[i].discount*1,100));//折扣率
                if(newGoodsNum <= manyPriManyFoldsList[i].count*1){//如果当前商品数量和前几个商品的数量的累计数量 <= 设置的最大数量
                  newGoodsNum1 = manyPriManyFoldsList[i].count*1-newGoodsNum;//剩余可以计算折扣的商品件数
                  allsum += (val.goodsNum*1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                }else{//如果当前商品数量和前几个商品的数量累计数量 > 设置的数量
                  if(newGoodsNum1==0){//剩余可以计算折扣的商品件数置为0时
                    if(index==0 && val.goodsNum > manyPriManyFoldsList[i].count*1){//如果第一件商品的数量就大于活动设置的数量
                      allsum += (manyPriManyFoldsList[i].count*1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                      if(val.amountExceeded==1){//超过购买数量按照原价购买
                        allsum += (val.goodsNum - manyPriManyFoldsList[i].count*1) * (val.grouponPrice*1);
                      }else{//超过购买数量按照最高折扣购买
                        allsum += (val.goodsNum - manyPriManyFoldsList[i].count*1) * (val.grouponPrice*1) * maxDiscount;
                      }
                    }else{
                      if(val.amountExceeded==1){//超过购买数量按照原价购买
                        allsum += (val.goodsNum*1) * (val.grouponPrice*1);
                      }else{//超过购买数量按照最高折扣购买
                        allsum += (val.goodsNum*1) * (val.grouponPrice*1) * maxDiscount;
                      }
                    }
                  }else{//剩余可以计算折扣的商品件数置不为0时
                    if(val.goodsNum > newGoodsNum1){// 如果当前商品的数量 大于 剩余可以计算折扣的商品件数
                      allsum += (newGoodsNum1) * (val.grouponPrice*1) * discount;//按相应的折扣计算
                      if(val.amountExceeded==1){//超过购买数量按照原价购买
                        allsum += (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1);
                      }else{//超过购买数量按照最高折扣购买
                        allsum += (val.goodsNum*1 - newGoodsNum1) * (val.grouponPrice*1) * maxDiscount;
                      }
                      newGoodsNum1 = 0;//剩余可以计算折扣的商品件数置为0
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
      datax.forEach(el=>{//已下架商品或者超出配送范围的商品
        el.discountPrice = getNum(el.discountPrice / 100);
        el.friendSellPrice = getNum(el.friendSellPrice / 100);
        el.grouponPrice = getNum(el.grouponPrice / 100);
      });
      let newdata = [...cloudData,...data,...waterData,...ecData,...mealData]
      //总金额转为元保存
      this.setData({
        totalValue: getNum(floatObj.divide(allsum, 100)),//总计
        shoppingData:newdata,
        shoppingExpireData:datax//已下架商品或者超出配送范围的商品
      })
    },
    //立即购买
    buyNow(){
      wx.reLaunch({
        url: '/pages/shoppingCar/index',
      })
    },
    //购物袋点击展开和收起购物袋
    shoppingBgClick(){
      this.setData({
        showShoppingBg:!this.data.showShoppingBg
      })
    },
    //空白处点击收回购物车
    closeShoppingBg(){
      this.setData({
        showShoppingBg:false
      })  
    },
    //清空购物车
    emptyShoppingCar(){
      if (this.properties.shoppNum>0){
        let arr= [];
        this.data.shoppingData.forEach(item=>{  //上架的清空
          arr.push(item.cartCode)
        })
        this.data.shoppingExpireData.forEach(el=>{  //下架的清空
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
                wx.hideLoading();
                if(res.data.result==200){
                  //清空购物车的回调函数
                  this.triggerEvent('emptyshoppingcar')
                  this.setData({
                    totalValue: '0.00'
                  })
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
    //商品减少
    shopgoodDel(e){
      if(this.properties.needBeforeChangeShopp){//水管家需要判断是否有选择地址
        if (!wx.getStorageSync('isaddress')) {
          this.triggerEvent('beforechangeshopp');
          return;
        }
      }
      if(this.submit){
        return;
      }
      this.submit=true;
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
            setTimeout(()=>{
              this.submit = false;
            },300);
            //购物车商品减少的回调函数
            this.triggerEvent('shoppgooddel');
          } else {
            this.submit = false;
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        }).catch(res=>{
          this.submit = false;
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
            setTimeout(()=>{
              this.submit = false;
            },300);
            //购物车商品减少的回调函数
            this.triggerEvent('shoppgooddel');
          }else{
            this.submit = false;
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        }).catch(res=>{
          this.submit = false;
      })
      }
    },
    //商品添加
    shopgoodAdd(e){
      if(this.properties.needBeforeChangeShopp){//水管家需要判断是否有选择地址
        if (!wx.getStorageSync('isaddress')) {
          this.triggerEvent('beforechangeshopp');
          return;
        }
      }
      if(this.submit){
        return;
      }
      this.submit=true;
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
          setTimeout(()=>{
            this.submit = false;
          },300);
          //购物车商品添加的回调函数
          this.triggerEvent('shoppgoodadd');
        } else {
          this.submit = false;
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }).catch(res=>{
        this.submit = false;
    })
    },
    //商品数量输入框失去焦点事件
    shopgoodInp(e){
      if(this.properties.needBeforeChangeShopp){//水管家需要判断是否有选择地址
        if (!wx.getStorageSync('isaddress')) {
          this.triggerEvent('beforechangeshopp');
          return;
        }
      }
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
          if (res.data.result == 200) {
            //购物车商品数量输入框失去焦点的回调函数
            this.triggerEvent('shoppgoodinp');
          }else{
            //购物车商品数量输入框失去焦点的回调函数
            this.triggerEvent('shoppgoodinp');
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
              if (res.data.result == 200) {
                //购物车商品数量输入框失去焦点的回调函数
                this.triggerEvent('shoppgoodinp');
              }else{
                wx.showToast({
                  title: res.data.message,
                  icon: 'none'
                })
              }
            }
          })
        }
    },
    //input框冒泡
    stopinp(){}
  }
})
