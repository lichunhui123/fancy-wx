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
    shoppingDatas:[],//接口返回的购物车信息
    shoppingData:[], //购物车商品
    shoppNum:0, //购物车数量
    noData:false,  //无数据
    listNum:0, //数据返回长度
    goGoodtype:'', //进入类型
    toView:'',
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
      this.getshoppingData()   //购物车列表
    })
    
  },
  //购物车商品
  getshoppingData(){
    service.shoppinggoods({
      branchesId:this.data.branchId,
      smallBranchesId: this.data.cloudBranchId,
      userId: wx.getStorageSync('userId')
    }).then(res=>{
      if(res.data.result==200){
        if(res.data.data){
          let Adata=res.data.data
          let data = Adata.cartEffectiveList?Adata.cartEffectiveList:[]
          let waterData = Adata.cartWaterEffectiveList?Adata.cartWaterEffectiveList:[]
          let mealData = Adata.cartMealEffectiveList?Adata.cartMealEffectiveList:[]
          let ecData = Adata.cartMallEffectiveList?Adata.cartMallEffectiveList:[]
          let cloudData = Adata.cartSmallEffectiveList?Adata.cartSmallEffectiveList:[]
          let newdata = [...data,...ecData,...cloudData, ...waterData,...mealData]
          this.setData({
            shoppingDatas: Adata,
            shoppingData: newdata
          },()=>{
            this.updatagood(this.data.shoppingData)  //购物车列表关联
          })
        }else{
          this.setData({
            shoppingDatas: [],
            shoppingData: [],
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
          shoppNum: res.data.data.goodsNumber
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
    let { activityId, activityGoodsId, carCode, goodsSource,branchId,goodnum} = dooditem
    if(inpValue>=1){
      service.addgoodnum({
        branchesId: branchId,
        userId: wx.getStorageSync('userId'),
        activityId: dooditem.activityId,
        goodsCode: dooditem.goodsCode,
        goodsResource: goodsSource,  //商品来源
        goodsNum: inpValue,
      }).then(res => {
        if (res.data.result != 200) {
          let newdata = this.data.grouplist.map(item => {     //购物车清空需要手动给列表清0
            if (activityId == item.activityId && activityGoodsId == item.activityGoodsId) {
              item.goodnum = goodnum
            }
            return item
          })
          this.setData({
            grouplist:newdata,
          })
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }else{
          this.shoppingnum()
          this.getshoppingData()
        }
      })
    }else{
      service.delshoppinggoods({
        cartCodes: [carCode]
      }).then(res => {
        if (res.data.result == 200) {
          this.shoppingnum()
          this.getshoppingData()
        }
      })  
    }
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
        this.getshoppingData()
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
            this.getshoppingData()
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
            let newdata = this.data.grouplist.map(item => {     //购物车清空需要手动给列表清0
              if (activityId == item.activityId && activityGoodsId == item.activityGoodsId) {
                item.goodnum = 0
              }
              return item
            })
            this.setData({
              grouplist: newdata,
              shoppingData:[],
              shoppingData1:[],
              totalValue:'0.00'
            })
            this.shoppingnum()
            this.getshoppingData()
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
  //购物车商品改变时回调函数
  changeShoppGood(){
    this.shoppingnum();
    this.getshoppingData();
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
            if(this.data.shoppingData.length==0){
              this.getshoppingData();
            }else{
              this.updatagood(this.data.shoppingData);  //购物车列表关联
            }
          })
        }
        if(res.data.data.list.length<1){
          this.getshoppingData();
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
            this.getshoppingData()   //购物车列表
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
    let newdataNum =[]
    newdataNum =this.data.grouplist.map(item => {
      item.goodnum=0;
      data.map(el=>{
        if(item.activityId==el.activityId&&item.goodsCode==el.goodsCode){
          item.goodnum=el.goodsNum     //商品数量
          item.carCode = el.cartCode   //清空购物车需要cartcode
          item.nodis = el.nodis
        }
      })
      return item
    })
    this.setData({
      grouplist:newdataNum
    },()=>{
      this.submit = false;//防止重复提交
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
    if(this.data.branchId!=presentAddress.siteId){//说明切换了站点
      this.setData({
        branchId: presentAddress?presentAddress.siteId:"",    //拼团站点id
        cloudBranchId:currentCloudShop?currentCloudShop.siteId:"",    //云店站点id
        userId: wx.getStorageSync('userId'),   //用户id
        grouplist:[],
        shoppingData:[],
        pageNum:1,
        noData:false
      });
      if(this.data.goGoodtype=='10'){ //限时折扣
        this.getDiscountTimelist()
      }else{
        this.getGroupType()   //拼团头部分类
      }
    }else{
      this.getshoppingData()   //购物车列表
    }
    this.shoppingnum()     //购物车数量
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
      grouplist:[]
    })
    this.getcomm();
    if(this.data.goGoodtype=='10'){
      this.getDiscountTimelist()
    }else{
      this.getGroupType()   //拼团头部分类
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