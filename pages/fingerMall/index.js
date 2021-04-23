const service = require('../../service/index.js');
import floatObj from '../../utils/floatObj.js';
import {getNum} from "../../utils/util";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isNewOpen: true, //判断当前页面是新打开还是从其他页面返回  
    contentHeight:0,//内容区域高度
    branchId: "",    //云店站点id
    groupBranchId:'', //拼团站点id
    userId: wx.getStorageSync('userId'),   //用户id
    classType:[],  //更好甄选商品分组
    goodsList:[],  //商品列表
    classCode:"",  //头部分组code
    className:"", //头部分组name
    pageNum:1,  //当前页数
    pageSize:10, //每页数量
    shoppingDatas:[],//接口返回的购物车信息
    shoppingData:[], //购物车商品
    shoppNum:0, //购物车数量
    noData:false,  //无数据
    listNum:0, //数据返回长度
  },
  //头部类型切换
  navTypeClick(e){
    let navitem = e.target.dataset.navitem;
    if(!this.onOff){
      this.onOff = true;//开关控制重复点击
      this.setData({
        classCode: navitem.classCode,
        className: navitem.className,
        goodsList:[],
        pageNum:1,
        noData:false
      },()=>{
        this.getGoodslist()   //商品列表
      })
    }
  },
  //更新分类的角标添加购物车数量
  updateClassNum(type){
    let classType = this.data.classType;
    let newClassType = classType.map(item => {
      if(item.classCode == this.data.classCode){
        if(type=="add"){
          item.skuCount>=0?++item.skuCount:1;
        }else {
          --item.skuCount;
        }
      }
      return item;
    });
    this.setData({classType:newClassType});
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
        })
        if(res.data.data.goodsNumber>0&&this.data.goodsList.length>0){
          this.setContentHeight(125);
        }else{
          this.setContentHeight(0);
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
    let inpValue=e.detail.value;
    let dooditem = e.currentTarget.dataset.inpitem;
    let { activityId, carCode,activityCode,skuCode,goodnum} = dooditem;
    if(inpValue>=1){
      service.addgoodnum({
        activityId:activityCode,
        userId:this.data.userId,
        goodsCode: skuCode,
        goodsResource: 10,  //商品来源 10-指尖商城
        goodsNum: inpValue,
      }).then(res => {
        if (res.data.result != 200) {
          let newdata = this.data.goodsList.map(item => {     //购物车清空需要手动给列表清0
            if (activityId == item.activityId && skuCode == item.skuCode) {
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
          this.getClassType('no');
          this.refreshShopping();
        }
      })  
    }
  },
  //购物车商品修改
  changeShoppGood(){
    this.getClassType('no');
    this.refreshShopping();
  },
  //商品添加
  goodAdd(e){
    if(this.submit){
      return;
    }
    this.submit=true;
    wx.showLoading({
      title: '加载中',
    });
    let dooditem =e.currentTarget.dataset.additem;
    let { skuCode,goodnum,activityId} = dooditem;
    service.addgoodnum({
      activityId:activityId,
      userId: this.data.userId,
      goodsResource: 10,  //商品来源 10-指尖商城
      goodsCode: skuCode,
      goodsNum: ++goodnum 
    }).then(res=>{
      wx.hideLoading();
      if(res.data.result==200){
        this.refreshShopping('add');
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
    });
    let dooditem = e.currentTarget.dataset.delitem;
    let { skuCode,carCode, goodnum,activityId} = dooditem;
    if (goodnum>1){
      service.addgoodnum({
        activityId:activityId,
        userId: this.data.userId,
        goodsResource:  10,  //商品来源 10-指尖商城
        goodsCode: skuCode,
        goodsNum: --goodnum
      }).then(res => {
        wx.hideLoading();
        if (res.data.result == 200) {
          this.refreshShopping('sub');
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
          let newdataNum = this.data.goodsList.map(item => {
            if (skuCode == item.skuCode) {
              item.goodnum = 0
            }
            return item
          })
          this.setData({
            shoppingData:[],
            shoppingExpireData:[],
            totalValue:'0.00',
            goodsList: newdataNum
          })
          this.refreshShopping('sub');
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
  //云店商品头部分类-----1
  getClassType(loadGoods){
    service.fingerMallClass({
     userId:this.data.userId
    }).then((res) => {
      if (res.data.result == 200) {
        let typedata=res.data.data;
        if(typedata&&typedata.length){
          if(this.data.classCode){
            this.setData({
              classType: typedata,
            });
            if(!this.onOff){
              if(loadGoods!="no"){//需要加载商品列表时
                this.onOff = true;//开关控制重复点击
                this.getGoodslist()
              }
            }
          }else{
            this.setData({
              classType: typedata,
              classCode: typedata[0].classCode,
              className: typedata[0].className
            },()=>{
              if(!this.onOff){
                if(loadGoods!="no"){//需要加载商品列表时
                  this.onOff = true;//开关控制重复点击
                  this.getGoodslist()
                }
              }
            })
          }
        }else{
          if(!this.onOff){
            if(loadGoods!="no"){//需要加载商品列表时
              this.onOff = true;//开关控制重复点击
              this.getGoodslist()
            }
          }
        }
      }else{
        if(!this.onOff){
          if(loadGoods!="no"){//需要加载商品列表时
            this.onOff = true;//开关控制重复点击
            this.getGoodslist()
          }
        }
      }
    })
  },
  //商品列表-------2
  getGoodslist(){
    wx.showLoading({
      title: '加载中',
    })
    let {className, classCode, pageNum, pageSize} = this.data
    service.fingerMallGetGoods({
      className:className,
      classCode:classCode,
      pageNum: pageNum,
      pageSize: pageSize,
    }).then((res) => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
      if (res.data.result == 200) {
        let data = res.data.data
        if(data&&data.length>0){
          let dataDispose=data.map(item=>{
            item.goodsPic=item.goodsPics.split(',')[0];
            item.goodnum=0;
            item.carCode='';
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
              this.updatagood(this.data.shoppingData);
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
          this.getGoodslist()
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
          let Adata=res.data.data;
          let data = Adata.cartEffectiveList?Adata.cartEffectiveList:[];//拼团商品
          let waterData = Adata.cartWaterEffectiveList?Adata.cartWaterEffectiveList:[];//水管家商品
          let mealData = Adata.cartMealEffectiveList?Adata.cartMealEffectiveList:[];//水票套餐商品
          let ecData = Adata.cartMallEffectiveList?Adata.cartMallEffectiveList:[];//指尖电商
          let cloudData = Adata.cartSmallEffectiveList?Adata.cartSmallEffectiveList:[];//云店商品
          
          let newdata = [...cloudData,...data,...waterData,...ecData,...mealData]
          this.setData({
            shoppingDatas: Adata,
            shoppingData: newdata,
          },()=>{
            this.updatagood(this.data.shoppingData,type)  //购物车列表关联
          })
        }else{
          this.setData({
            shoppingDatas: [],
            shoppingData: [],
          },()=>{
            this.updatagood(this.data.shoppingData,type)  //购物车列表关联
          })
        }
      }
    })
  },
  //购物车数量和cartcode赋值给对应列表数据------4
  updatagood(data,type){
    let newdataNum =[];
    newdataNum =this.data.goodsList.map(item => {
      item.goodnum=0;
      if(data.length>0){
        data.map(el=>{
          if(item.skuCode==el.goodsCode){
            item.goodnum=el.goodsNum;   //商品数量
            item.carCode = el.cartCode;   //商品减少为0(相当于删除)需要cartcode
            item.nodis = el.nodis
          }
        });
      }
      return item
    });
    this.setData({
      goodsList:newdataNum
    },()=>{
      this.onOff = false;//开关控制重复点击
      this.submit = false;//防止重复提交
      if(type){//更新分类添加购物车的数量
        this.updateClassNum(type);
      }
    });
  },
  //商品详情
  goodsDetailClick(e){
    this.setData({//跳转页面修改 isNewOpen
      isNewOpen:false
    })
    let { skuCode}=e.currentTarget.dataset.itdetail;
      wx.navigateTo({
        url: '/pages/fingerMallGoodDetail/index?skuCode=' + skuCode,
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
    if(options.classCode){
      this.setData({
        classCode:options.classCode
      })
    }
    wx.hideShareMenu();
    let currentCloudShop = wx.getStorageSync("currentCloudShop");//云店选择的站点
    let presentAddress = wx.getStorageSync("presentAddress");//拼团选择的站点
    this.setData({
      branchId: currentCloudShop?currentCloudShop.siteId:'',    //云店站点id
      groupBranchId:presentAddress?presentAddress.siteId:'',    //云店站点id
      userId: wx.getStorageSync('userId'),   //用户id
      goodsList:[],
      classType:[],
      pageNum:1,
      noData:false
    });
    this.getClassType()   //头部分类
    this.setContentHeight(0) //设置内容区域高度
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
    if(!this.data.isNewOpen){
      this.refreshShopping();
      this.getClassType('no');
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
    this.setData({
      pageNum:1,
      goodsList:[]
    })
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