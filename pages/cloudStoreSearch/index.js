// pages/cloudStoreSearch/index.js
const service = require('../../service/index.js');
import {getNum,chOrEnOrNumInput} from "../../utils/util.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showGoodsContent:false,
    message:null,
    inpValue: "", //input框内容
    listData: [],  //列表数据
    noData:false,  //无数据
    sumNumber:'',//购物车数量
    button:'',//标签内容
    hotVocabular:'',//热门搜索
    userVocabular:'',//历史搜索
    showSearchBtn:true,//判断显示搜索还是购物车图标
  },
  //input确认事件
  inputWatch(e){
    this.setData({
      inpValue:e.detail.value
    },()=>{
      this.setData({
        listData:[],
      })
      if(this.data.inpValue){
        this.getSmallGoodsSearchList()
      }
    })
  },
  //input输入事件
  inputBack(e){
    let value=chOrEnOrNumInput(e.detail.value);
    this.setData({
      inpValue:value
    })
    if(value==""){
      this.setData({
        showGoodsContent:false
      })
    }
  },
  //清空输入框
  clearInput(){
    this.setData({
      inpValue:"",
      showGoodsContent:false,
      showSearchBtn:true
    })
  },
  //搜索按钮点击
  searchWord(){
    if(this.data.inpValue){
      this.getSmallGoodsSearchList();
    }else{
      wx.showToast({
        title: "请输入搜索内容",
        icon: 'none'
      })
    }
  },
  //标签获取搜索
  searchBtn(e){
    let item=e.currentTarget.dataset.item;
    this.setData({
      inpValue:item
    },()=>{
      this.getSmallGoodsSearchList()
    })
  },
  //获取热门搜索、历史搜索信息
  getSmallGoodsSearchVocabulary(){
    wx.showLoading({
      title: '加载中',
    })
    service.getSmallGoodsSearchVocabulary({
      userId:wx.getStorageSync('userId'),
    }).then(res=>{
      if(res.data.result==200){
        wx.hideLoading();
        let data=res.data.data;
        let hotVocabular = data.hotVocabular;//热门搜索
        let userVocabular = data.userVocabular;//历史搜索
        this.setData({
          hotVocabular: hotVocabular,
          userVocabular: userVocabular
        })
      } 
    })
  },
  //获取微店商品列表
  getSmallGoodsSearchList(){
    if(!this.data.inpValue){
      return;
    }
    this.setData({
      showSearchBtn:false
    })
    wx.showLoading({
      title:'加载中'
    });
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点 
    service.getSmallGoodsSearchList({
      branchesId:currentCloudShop?currentCloudShop.siteId:'',
      goodsName:this.data.inpValue,
      userId:wx.getStorageSync('userId'),
    }).then(res=>{
      if(res.data.result==200){
        wx.hideLoading();
        let data=res.data.data;
        if(data&&data.length>0){
          let dataDispose=data.map(item=>{
            item.goodsPic=item.goodsPic.split(',')[0]
            item.goodnum=0
            item.carCode=''
            item.averagePrice = getNum((item.showSalesPrice+item.showSalesPrice/2)/2)//第二件半价的均价
            return item
          })
          this.setData({
            listData:dataDispose,
            showGoodsContent:true,
            message:res.data.message,
          },()=>{
            if(dataDispose.length>0){
              this.getshoppingdata();
            }
          })
        } else{
          this.setData({
            showGoodsContent:true,
            noData:true
          })
        }
      }
    })
  },
  //购物车商品--------3
  getshoppingdata(){
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点 
    service.shoppinggoods({
      branchesId:presentAddress?presentAddress.siteId:'',
      smallBranchesId:currentCloudShop?currentCloudShop.siteId:'',
      userId: wx.getStorageSync('userId')
    }).then(res=>{
      this.onOff = true;//开关控制重复点击
      if(res.data.result==200){
        if(res.data.data){
          let Adata=res.data.data
          let cloudData = Adata.cartSmallEffectiveList?Adata.cartSmallEffectiveList:[];//云店商品
          this.updatagood(cloudData)  //购物车列表关联
        }else{
          this.updatagood()  //购物车列表关联
        }
      }
    })
  },
  //购物车数量和cartcode赋值给对应列表数据------4
  updatagood(data){
    let newdataNum =[]
    newdataNum =this.data.listData.map(item => {
      item.goodnum=0;
      if(data){
        data.map(el=>{
          if(item.goodsCode==el.goodsCode){
            item.goodnum=el.goodsNum     //商品数量
            item.carCode = el.cartCode   //商品减少为0(相当于删除)需要cartcode
            item.nodis = el.nodis
          }
        })
      }
      return item
    })
    this.setData({
      listData:newdataNum
    })
  },
   //好物预售商品添加按钮
   goodAddGray(){
    wx.showToast({
      title: "活动未开始",
      icon: 'none'
    })
  },
  //商品添加购物车
  goodAdd(e){
    if(!this.onOff){
      return;
    }
    this.onOff = false;//开关控制重复点击
    wx.showLoading({
      title: '加载中',
    })
    let dooditem =e.currentTarget.dataset.additem
    let { goodsCode, resource,goodnum,branchesId,activityCode} = dooditem
    service.addgoodnum({
      activityId:activityCode,
      branchesId: branchesId,
      userId: wx.getStorageSync('userId'),
      goodsResource: resource,  //商品来源
      goodsCode: goodsCode,
      goodsNum: ++goodnum 
    }).then(res=>{
      wx.hideLoading();
      if(res.data.result==200){
        this.getshoppingdata();
        let sum=++this.data.sumNumber;
        if (sum > 0) {
          this.setData({
            sumNumber:sum
          })
        }
        if (sum > 99) {
           this.setData({
            sumNumber:'99+'
           })
        }
      }else{
        this.onOff = true;//开关控制重复点击
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    }).catch(res=>{
      this.onOff = false;
    })
  },
  //商品减少
  goodDel(e){
    if(!this.onOff){
      return;
    }
    this.onOff = false;//开关控制重复点击
    wx.showLoading({
      title: '加载中',
    })
    let dooditem = e.currentTarget.dataset.delitem
    let { goodsCode,carCode, resource, goodnum,branchesId,activityCode} = dooditem
      if (goodnum>1){
        service.addgoodnum({
          activityId:activityCode,
          branchesId: branchesId,
          userId: wx.getStorageSync('userId'),
          goodsResource: resource,  //来源拼团5 水管家20
          goodsCode:goodsCode,
          goodsNum: --goodnum
        }).then(res => {
          wx.hideLoading();
          if (res.data.result == 200) {
            this.getshoppingdata();
            let sum=--this.data.sumNumber;
            this.setData({
              sumNumber:sum
            })
            if (sum > 99) {
              this.setData({
                sumNumber:'99+'
              })
            }
          }else{
            this.onOff = true;
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        }).catch(res=>{
          this.onOff = true;
       })
      }else{
        wx.showLoading({
          title: '加载中',
        })
        service.delshoppinggoods({
          cartCodes: [carCode]
        }).then(res => {
          wx.hideLoading();
          if (res.data.result == 200) {
            this.getshoppingdata();
            let sum=--this.data.sumNumber;
            this.setData({
              sumNumber:sum
            })
            if (sum > 99) {
              this.setData({
                sumNumber:'99+'
              })
            }
          }else{
            this.onOff = true;
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        }).catch(res=>{
          this.onOff = true;
       })
      }
  },
  //input框数量输入
  goodInp(e){
    let inpValue=e.detail.value
    let dooditem = e.currentTarget.dataset.inpitem
    let { activityId, activityGoodsId, carCode, resource,branchesId,activityCode,goodnum} = dooditem
    if(inpValue>=1){
      service.addgoodnum({
        activityId:activityCode,
        branchesId: branchesId,
        userId:wx.getStorageSync('userId'),
        goodsCode: dooditem.goodsCode,
        goodsResource: resource,  //商品来源
        goodsNum: inpValue,
      }).then(res => {
        if (res.data.result != 200) {
          this.getshoppingdata();
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }else{
          this.getshoppingdata();
          let sum = this.data.sumNumber+(inpValue-goodnum);
          this.setData({
            sumNumber:sum
          })
          if (sum > 99) {
            this.setData({
              sumNumber:'99+'
            })
          }
        }
      })
    }else{
      service.delshoppinggoods({
        cartCodes: [carCode]
      }).then(res => {
        if (res.data.result == 200) {
          let sum = this.data.sumNumber+(inpValue-goodnum);
          this.setData({
            sumNumber:sum
          })
          if (sum > 99) {
            this.setData({
              sumNumber:'99+'
            })
          }
          let newdata = this.data.listData.map(item => {     //购物车清空需要手动给列表清0
            if (activityId == item.activityId && activityGoodsId == item.activityGoodsId) {
              item.goodnum = 0
            }
            return item
          })
          this.setData({
            listData:newdata,
          })
        }
      })  
    }
  },
  //跳转到购物车列表页
  inpshopp(){
    wx.reLaunch({
      url: '/pages/shoppingCar/index',
    })
  },
  //购物车数量
  shoppingNum() {
    let presentAddress = wx.getStorageSync("presentAddress");//拼团站点
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店站点 
    service.shoppingnum({
      branchesId:presentAddress?presentAddress.siteId:'',
      smallBranchesId:currentCloudShop?currentCloudShop.siteId:'',
      userId: wx.getStorageSync('userId')
    }).then(res => {
      if (res.data.result == 200) {
        let sum=res.data.data.goodsNumber
        if (sum > 0) {
          this.setData({
            sumNumber:sum
          })
        }
        if (sum > 99) {
          this.setData({
            sumNumber:'99+'
          })
        }
      }
    })
  }, 
  //商品详情
  goodsDetailClick(e){
    let { goodsCode,activityCode}=e.currentTarget.dataset.itdetail;
    wx.navigateTo({
      url: '/pages/cloudStoreDetail/index?storeGoodsId=' + goodsCode + '&activityCode='+activityCode,
    })
  },
  //历史搜索删除按钮
  delete(e){
    service.deleteSmallGoodsSearchUser({
      userId:wx.getStorageSync('userId')
    }).then(res=>{
      if(res.data.result==200){
        let data=res.data.data;
        this.setData({
          userVocabular:[]
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSmallGoodsSearchVocabulary();//历史搜索、热门搜索
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
    this.shoppingNum();
    if(this.data.listData.length>0){
      this.getshoppingdata();
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