const service = require('../../service/index.js');
import floatObj from '../../utils/floatObj.js';
import {getNum} from "../../utils/util.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showIndex:1,//卡券显示几个
    contentHeight:0,//内容区域高度
    branchId: "",    //云店站点id
    cloudBranchName:"",//云店站点名称
    deliveryAddress:"",//云店地址
    groupBranchId:'', //拼团站点id
    userId: wx.getStorageSync('userId'),   //用户id
    classType:[],  //云店商品分组
    goodsList:[],  //商品列表
    groupCode:null,  //头部分组code
    navtype:null,  //分组类型  <--限时折扣、满减活动
    pageNum:1,  //当前页数
    pageSize:10, //每页数量
    srcolloff:false, //购物车弹起
    shoppingDatas:[],//接口返回的购物车信息
    shoppingData:[], //购物车商品
    shoppNum:0, //购物车数量
    noData:false,  //无数据
    listNum:0, //数据返回长度
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
    cloundInfo:null, //云店运营信息
    colleType:false,//是否收藏
    discountList:[],//优惠券
    showDiscountCoupon:false, //是否显示优惠券的弹窗
  },
  //获取门店营业信息
  getCloudSetting(){
    service.cloudStoredispatch({
      branchesId:this.data.branchId,
      userId:wx.getStorageSync('userId')
    }).then((res)=>{
      if(res.data.result==200){
        this.setData({
          cloundInfo:res.data.data,
          colleType:res.data.data.colleType
        })
      }
    })
  },
  //收藏门店
  collectBranch(){
    if(this.submit){
      return;
    }
    this.submit=true;
    service.queryCellectBranch({
      branchesId:this.data.branchId,
      userId:wx.getStorageSync('userId')
    }).then((res)=>{
      this.submit=false;
      if(res.data.result==200){
        wx.showToast({
          title: '收藏成功',
          duration:2000,
          icon:'none'
        })
        this.setData({
          colleType:true
        })
      }else{
        wx.showToast({
          title: res.data.message,
          icon:'none'
        })
      }
    })
  },
  //取消收藏门店
  noCollect(){
    if(this.submit){
      return;
    }
    this.submit=true;
    service.cancelColleBranches({
      branchesId:this.data.branchId,
      userId:wx.getStorageSync('userId')
    }).then((res)=>{
      this.submit=false;
      if(res.data.result==200){
        wx.showToast({
          title: '取消收藏成功',
          icon:'none',
          duration:2000
        })
        this.setData({
          colleType:false
        })
      }
    })
  },
  //拨打店铺电话
  makePhoneCall(){
    let phone=this.data.cloundInfo.dobusinessPhone;
    wx.makePhoneCall({
      phoneNumber: phone, //仅为示例，并非真实的电话号码
      success(){},
      fail(){},
    })
  },
  //获取优惠券列表
  queryCardList(){
    service.queryCloudCardList({
      branchesId:this.data.branchId,
      userId:this.data.userId
    }).then((res)=>{
      if(res.data.result==200){
        let notClaimedList = res.data.data.notClaimedList||[];//未领取
        let claimedList = res.data.data.claimedList||[];//已领取
        if(claimedList.length>0){
          claimedList.forEach(val=>{
            val.usetag = true//设置已领取标识
          }) 
        }
        let newlist= [...notClaimedList,...claimedList];
        if(newlist.length>0){
          newlist.forEach(item=>{
            item.cardMoneyT = item.cardMoney?floatObj.divide(item.cardMoney,100):'-';//分转元
            item.fullMoneyT = item.fullMoney?floatObj.divide(item.fullMoney,100):'-';//分转元
            item.discountRatioT =item.discountRatio?floatObj.divide(item.discountRatio,100):'-';//分转元
            item.startTime = item.startTime?item.startTime:'-'
            item.endTime = item.endTime?item.endTime:'-'
          })
          this.setData({
            discountList:newlist
          },()=>{
            this.setContentHeight();
          })
        }
      }
    })
  },
  //弹出弹层 底部禁止滑动
  catchtouchmove(){
    return false;
  },
  //展开优惠券弹窗
  downDiscountCoupon(){
    this.setData({
      showDiscountCoupon:true
    })
  },
  //关闭优惠券弹窗
  closeDiscountCoupon(){
    this.setData({
      showDiscountCoupon:false
    })
  },
  //领取卡券
  drawCoupon(e){
    let cardCode = e.target.dataset.cardcode;
    this.drawCouponServer(cardCode);
  },
  //卡券弹层中的领取卡券回调事件
  getCoupon(e){
    let cardCode = e.detail.cardCode;
    this.drawCouponServer(cardCode);
  },
  //领取卡券的请求
  drawCouponServer(cardCode){
    wx.showLoading({
      title: '加载中',
    })
    service.cloudDraowOrder({
      userId: wx.getStorageSync('userId'),
      cardCode: cardCode
    }).then(res => {
      wx.hideLoading();
      if(res.data.result==200){
        wx.showToast({
          title: "领取成功",
          icon: 'none'
        })
        let discountList = this.data.discountList.map((item)=>{
          if(item.cardCode==cardCode){
            item.usetag = true//设置已领取标识
          }
          return item;
        });
        this.setData({discountList});
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },
  //点击跳转搜索商品
  goodsSearch(){
    wx.navigateTo({
      url:"/pages/cloudStoreSearch/index"
    })
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
      url:"/pages/cloudStoreList/index"
    })
  },
  //头部类型切换
  navTypeClick(e){
    let navitem = e.target.dataset.navitem;
    if(!this.onOff){
      this.onOff = true;//开关控制重复点击
      clearInterval(this.timer);
      this.setData({
        groupCode: navitem.groupCode,
        navtype: navitem.type,
        ['someTime.startTime']:navitem.startTime,
        ['someTime.endTime']:navitem.endTime,
        goodsList:[],
        pageNum:1,
        noData:false
      },()=>{
        this.getgroupslist()   //商品列表
        this.getTime(navitem);//处理时间
        this.setContentHeight();
      })
    }
  },
  //处理时间
  getTime(navitem){
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
  },
  //更新分类的角标添加购物车数量
  updateClassNum(type){
    let classType = this.data.classType;
    let allCount = classType[0].count;//全部商品分组的加入购物车数量
    let newClassType = classType.map((item,index) => {
      if(!item.type){//没有参加活动的商品分类
        if(this.data.groupCode && item.groupCode == this.data.groupCode){
          if(type=="add"){
            item.count>=0 ? ++item.count : 1;
          }else {
            --item.count;
          }
        }
      }
      return item;
    });
    if(this.data.groupCode){//非全部商品分组
      if(type=="add"){
        allCount>=0 ? ++allCount : 1;
      }else {
        --allCount;
      }
      newClassType[0].count = allCount;
      this.setData({classType:newClassType});
    }else{//全部商品分组重新获取分组
      this.getClassType('no');
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
          shoppNum: res.data.data.goodsNumber
        },()=>{
          this.setContentHeight();
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
    let {goodsCode, activityId, carCode, resource, branchesId, activityCode, goodnum} = dooditem
    if(inpValue>=1){
      service.addgoodnum({
        activityId:activityCode,
        branchesId: branchesId,
        userId:this.data.userId,
        goodsCode: goodsCode,
        goodsResource: resource,  //商品来源
        goodsNum: inpValue,
      }).then(res => {
        if (res.data.result != 200) {
          let newdata = this.data.goodsList.map(item => {     //购物车清空需要手动给列表清0
            if (activityId == item.activityId && goodsCode == item.goodsCode) {
              item.goodnum = goodnum;
            }
            return item
          });
          this.setData({
            goodsList:newdata
          })
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }else{
          this.getClassType('no');
          this.refreshShopping();
        }
      })
    }else{
      service.delshoppinggoods({
        cartCodes: [carCode]
      }).then(res => {
        if (res.data.result == 200) {
          let newdata = this.data.goodsList.map(item => {     //购物车清空需要手动给列表清0
            if (activityId == item.activityId && goodsCode == item.goodsCode) {
              item.goodnum = 0
            }
            return item
          })
          this.setData({
            goodsList:newdata
          })
          this.getClassType('no');
          this.refreshShopping();
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
    if(this.submit){
      return;
    }
    this.submit=true;
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
        if(this.data.navtype){
          this.getClassType('no');
          this.refreshShopping();
        }else{
          this.refreshShopping('add')
        }
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
  },
  //商品减少
  goodDel(e){
    if(this.submit){
      return;
    }
    this.submit=true;
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
            if(this.data.navtype){
              this.getClassType('no');
              this.refreshShopping();
            }else{
              this.refreshShopping('sub')
            }
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
            if(this.data.navtype){
              this.getClassType('no');
              this.refreshShopping();
            }else{
              this.refreshShopping('sub')
            }
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
  //购物车商品数量变化的回调函数
  changeShoppGood(){
    this.getClassType('no');
    this.refreshShopping();
  },
  //云店商品头部分类
  getClassType(loadGoods){
    service.cloudStoreHeadType({
      branchesId: this.data.groupBranchId,//拼团
      smallBranchesId: this.data.branchId,//云店
      userId: this.data.userId
    }).then((res) => {
      if (res.data.result == 200) {
        let typedata=res.data.data;
        if(typedata.length){
          typedata.forEach((item)=>{
            if(item.groupCode==this.data.groupCode){
              this.setData({
                ['someTime.startTime']:item.startTime,
                ['someTime.endTime']:item.endTime,
              })
              this.getTime(item);//处理时间
            }
          })
          this.setData({
            classType: typedata,
          },()=>{
            if(!this.onOff){
              if(loadGoods!="no"){//需要加载商品列表时
                this.onOff = true;//开关控制重复点击
                this.getgroupslist()
              }
            }
          })
        }
      }else{
        if(!this.onOff){
          if(loadGoods!="no"){//需要加载商品列表时
            this.onOff = true;//开关控制重复点击
            this.getgroupslist()
          }
        }
      }
    })
  },
  //商品列表
  getgroupslist(){
    wx.showLoading({
      title: '加载中',
    })
    let {branchId, groupCode, navtype, pageNum, pageSize} = this.data;
    service.cloudStoreGoods({
      branchesId: branchId,
      groupCode: !navtype?groupCode:null,  //商品分组code
      activityCode:navtype?groupCode:null,   //活动code
      type:navtype,  //活动类型 10=折扣 20=满减
      pageNo: pageNum,
      pageSize: pageSize,
    }).then((res) => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      //console.log('列表',res)
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
            if(this.data.shoppingData.length==0){
              this.refreshShopping();
            }else{
              this.updatagood(this.data.shoppingData);  //购物车列表关联
            }
          })
        }else{
          if(this.data.shoppingData.length==0){
            this.refreshShopping();
          }
          this.onOff = false;//开关控制重复点击
          this.setData({
            noData:true,
            listNum:0
          })
        }
      }else{
        this.onOff = false;//开关控制重复点击
        this.setData({
          noData:true,
          listNum:0
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
  refreshShopping(type){
    this.shoppingnum()     //购物车数量
    this.getshoppingData(type)   //购物车列表
  },
  //购物车商品--------3
  getshoppingData(type){
    service.shoppinggoods({
      smallBranchesId: this.data.branchId,
      branchesId:this.data.groupBranchId,
      userId: this.data.userId
    }).then(res=>{
      if(res.data.result==200){
        if(res.data.data){
          let Adata=res.data.data
          let data = Adata.cartEffectiveList?Adata.cartEffectiveList:[];//拼团商品
          let waterData = Adata.cartWaterEffectiveList?Adata.cartWaterEffectiveList:[];//水管家商品
          let mealData = Adata.cartMealEffectiveList?Adata.cartMealEffectiveList:[];//水票套餐商品
          let ecData = Adata.cartMallEffectiveList?Adata.cartMallEffectiveList:[];//指尖电商
          let cloudData = Adata.cartSmallEffectiveList?Adata.cartSmallEffectiveList:[];//云店商品
          let combineG = false;//满减活动的组合商品集合
          if (cloudData&&cloudData.length > 0) {//云店商品
            this.setData({ fullMax:false })
            let fullDecMoneyList = [] //用来提取组合商品满减信息
            let fullDecMoney =0  //组合商品/参与满减商品的总额
            combineG = cloudData.some(clv=> clv.activitySet==2&&clv.type==20 );//是否是满减活动的组合商品
            cloudData.forEach(val => {
              if(val.type == 20 ){//满减活动
                let itemMoney = (val.grouponPrice*1) * (val.goodsNum * 1)
                fullDecMoney += itemMoney
                if(val.fullDecMoneyList && val.fullDecMoneyList.length>0){  //有满减活动
                  let newList= [...val.fullDecMoneyList]   //reverse()会改变原数组，这里通过...拷贝（拷贝一级）
                  let list = newList.reverse();
                  fullDecMoneyList = list
                }
              }
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
          }else{
            this.setData({ fullMax:true })
          }
          
          let newdata = [...cloudData,...data,...waterData,...ecData,...mealData]
          this.setData({
            shoppingDatas: Adata,
            shoppingData: newdata,
            combineGood:combineG
          },()=>{
            this.updatagood(this.data.shoppingData,type)  //购物车列表关联
          })
        }else{
          this.setData({
            shoppingDatas: [],
            shoppingData: [],
            fullMax:true
          },()=>{
            this.updatagood(this.data.shoppingData,type)  //购物车列表关联
          })
        }
      }
    })
  },
  //购物车数量和cartcode赋值给对应列表数据------4
  updatagood(data,type){
    let newdataNum =[]
    newdataNum =this.data.goodsList.map(item => {
      item.goodnum=0;
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
    },()=>{
      this.onOff = false;//开关控制重复点击
      this.submit = false;//防止重复提交
      if(type){//更新分类添加购物车的数量
        this.updateClassNum(type);
      }
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
  //商品详情
  goodsDetailClick(e){
    let { goodsCode,activityCode}=e.currentTarget.dataset.itdetail;
    wx.navigateTo({
      url: '/pages/cloudStoreDetail/index?storeGoodsId=' + goodsCode + '&activityCode='+activityCode,
    })
  },
  //设置内容区域高度
  setContentHeight(){
    let systemInfo = wx.getSystemInfoSync(); //获取设备信息
    let windowHeight = systemInfo.windowHeight;//可使用窗口高度，单位px
    let scale = systemInfo.windowWidth;//比例
    let topHeight = 80 / 750 * scale;//头部元素高度
    let timeHeight = 0;//活动时间的高度
    let navtype = this.data.navtype;//活动的类型
    if(navtype==10||navtype==20||navtype==50||navtype==60||navtype==70||navtype==80){
      timeHeight = 60 / 750 * scale;
    }
    let discounthHeight = 0;//优惠券元素的高度
    if(this.data.discountList.length>0){
      discounthHeight = 86 / 750 *scale;
    }
    let bottomHeight = 0;//底部有购物袋元素的高度
    if(this.data.shoppNum>0){
      bottomHeight = 167 / 750 *scale;
    }
    let businessInfoHeight = 0;//营业时间元素的高度
    wx.createSelectorQuery().select('.cloudSetting').boundingClientRect((rect)=>{
      businessInfoHeight = rect?rect.height:0;
      let contentHeight = windowHeight-topHeight-timeHeight-discounthHeight-bottomHeight-businessInfoHeight;//设置最大高度
      this.setData({
        contentHeight,//内容区域最大高度
      })
    }).exec()  
  },
  //获取站点信息
  getBranchInfo() {
    let currentCloud = wx.getStorageSync('currentCloudShop')
    if (currentCloud) {
      service.getnewcommunity({
        branchId: currentCloud.siteId
      }).then(res => {
        if (res.data.result == 200) {
          let data = res.data.data
          this.setData({
            cloudBranchName: data?data.siteName:'',//云店名称
            deliveryAddress: data?data.deliveryAddress:''//云店地址
          })
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let t=this;
    //判断卡券显示几个
    wx.getSystemInfo({
      success (res) {
        let showIndex=1;
        if(res.windowWidth>=414){
          showIndex = 2;
        }
        t.setData({
          showIndex
        })
      }
    })
    if(options){
      let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店选择的站点
      if(this.data.branchId&&this.data.branchId!=currentCloudShop.siteId){//说明切换了站点
        this.setData({
          groupCode:null,
          navtype:null,
        })
      }else{
        this.setData({
          groupCode:options.groupCode&&options.groupCode!="null"?options.groupCode:null,
          navtype:options.navtype&&options.navtype!="null"?options.navtype:null,
        })
      }
    }
  },
  stopinp(){ 
    //input框冒泡
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
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店选择的站点
    let presentAddress = wx.getStorageSync("presentAddress");//拼团选择的站点
    if(currentCloudShop){
      this.getBranchInfo()
    }else{
      wx.navigateTo({
        url:"/pages/homeCommunity/index?enterType=20"
      })
    }
    if(this.data.branchId!=currentCloudShop.siteId){///说明切换了站点
      this.setData({
        branchId: currentCloudShop?currentCloudShop.siteId:'',    //云店站点id
        groupBranchId:presentAddress?presentAddress.siteId:'',    //拼团站点id
        userId: wx.getStorageSync('userId'),   //用户id
        goodsList:[],
        shoppingData:[],
        classType:[],
        pageNum:1,
        noData:false,
        discountList:[]
      })
      if(currentCloudShop){
        this.getClassType();   //头部分类
        this.getCloudSetting(); //获取门店营业信息
      }
    }else{
      this.getClassType('no');   //头部分类
      this.refreshShopping();
    }
    this.queryCardList(); //获取卡券列表
    this.setContentHeight();
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
      pageNum:1,
      goodsList:[],
      groupCode:null,
      navtype:null,
      discountList:[]
    })
    this.getBranchInfo();
    if(this.data.branchId){
      this.getClassType();   //头部分类
      this.getCloudSetting(); //获取门店营业信息
      this.queryCardList(); //获取卡券列表
    }
    this.setContentHeight();
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
  let shareCloundShop = {siteId:this.data.branchId};
     return {
       title:this.data.cloudBranchName+"-"+this.data.deliveryAddress,
       imageUrl:"https://img.goola.cn/mallImages/20210408/xJdZy5jsmWGJbSiw6ZTyJMCpnzAXHj3m.png",
       path: '/pages/cloudStoreHome/index?shareCloudStore='+JSON.stringify(shareCloundShop),
    }
  }
})