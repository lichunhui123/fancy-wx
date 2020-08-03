// pages/myorder/index.js
const service = require('../../service/index.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navItemActive:1,  //默认显示我的寄件  1.我的寄件 2.我的取件
    orderList:[],   //我的订单数据
    pageNo:1,    //当前页数
    pageSize:10,  //每页数量
    alldatatitle:true, //已加载全部数据
    noOrderList:false, //我的寄件为空
    phone:"", //当前用户手机号
    signInfoList:[],//取件列表
    noSignInfoList:false,//我的取件为空
    noPhone: false,  //绑定手机
    isPhoneX:false,
  },
  //通知快递跳转
  sendparcel(){
    wx.redirectTo({
      url: '/pages/express/index',
    })
  },
  //未取件跳转
  signFor(){
    wx.redirectTo({
      url: "/pages/expressNotTake/index",
    })
  },
  //头部tab点击切换
  navItemClick(e){
    let index=e.target.dataset.index;
    this.setData({
      navItemActive:index
    });
    if(index==2&&this.data.signInfoList.length==0){//查询我的取件
      this.querySignInfo();
    }
  },
  //查看详情
  checkdetail(e){
    let cid= e.currentTarget.dataset.cid;
    wx.navigateTo({
      url: '/pages/expressOrderDetail/index?id='+cid,
    })
  },
  //点击取消订单
  cancelorder(e){
    let qid = e.currentTarget.dataset.qid;
    wx.showModal({
      content: '确定取消订单吗？',
      cancelColor: "#999999",
      confirmColor: "#F2922F",
      success:(res)=> {
        if (res.confirm) {
          console.log('用户点击确定');
          wx.showLoading({ title: "" });
          service.cancelorder({
            id: qid
          }).then((res) => {
            wx.hideLoading();
            if (res.data.result == 200) {
              wx.showToast({
                title: "取消订单成功",
                icon: 'none',
                duration: 2000
              });
              this.setData({    
                orderList: [],  //取消订单需要让页面数据清空
                pageNo:1  
              });
              this.getOrderdata('null');
            }else{
              wx.showToast({
                title: res.data.message,
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      }
    })
  },
  //唤起电话接口
  phoneClick(e){
    let tel =e.currentTarget.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel
    })
  },
  //获取我的寄件 订单列表
  getOrderdata(status){
    wx.showLoading({
      title: '加载中',
    });
    service.userQueryOrderList({
      pageNo: this.data.pageNo,
      pageSize: this.data.pageSize,
      status: status,
      userId: this.data.userid
    }).then((res) => {
      //停止刷新
      this.stopPullDownRefresh();
      console.log(res.data.data);
      let data=res.data.data;
      this.setData({
        alldatatitle:false
      });
      if (res.data.result == 200) {
        wx.hideLoading();
        if(data.branchesInfos.length>0){
          let alldata= [...this.data.orderList,...data.branchesInfos];
          this.setData({
            orderList: alldata,
            waitorder: data.receivePending,
            alldatatitle: true
          });
          if(data.branchesInfos.length<this.data.pageSize){
            this.setData({alldatatitle:false});
          }
          if(this.data.pageNo==1&&this.data.orderList.length==0){
            this.setData({noOrderList:true});
          }
        }else{
          this.setData({
            waitorder: data.receivePending, 
            alldatatitle:false
          });
          if(this.data.pageNo==1){
            this.setData({
              noOrderList:true
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
  },
  //获取我的取件
  querySignInfo(){
    if(this.data.phone){
      this.querySignInfoList();
    }else{
      service.getUserInfo({
        userId: wx.getStorageSync("userId")
      }).then((res) => {
        if (res.data.result === 200 || res.data.result === 0) {
          if (res.data.data.userInfo.phone) {
            let phone = res.data.data.userInfo.phone;
            this.setData({phone,noPhone:false});
            this.querySignInfoList();
          }else{
            this.setData({noPhone:true})
          }
        } else {
          this.setData({noPhone:true});
          wx.showToast({
            title: "获取用户信息失败",
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },
  //查询我的取件列表
  querySignInfoList(){
    wx.showLoading({
      title: '加载中',
    });
    service.querySignInfo({
      phone: this.data.phone
    }).then((res) => {
      //停止刷新
      this.stopPullDownRefresh();
      wx.hideLoading();
      if (res.data.result === 200 || res.data.result === 0) {
        let list = res.data.data;
        if (list && list.length > 0) {
          list.map((item) => {
            item.list.map((val, index) => {
              val.cargo = val.putawaySerialNumber.split('-')[0];//货拉号
            });
          });
          this.setData({
            noSignInfoList: false,
            signInfoList: list
          })
        } else {
          this.setData({noSignInfoList: true, signInfoList: []});
        }
      }
    })
  },
  //跳转绑定手机
  bindPhone() {
    wx.navigateTo({url: "../../pages/personalBindPhone/index?source=expressNotTake"})
  },
  /**
   * 生命周期函数--监听页面加载 
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    let userid = wx.getStorageSync('userId');
    this.setData({
      userid
    })
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
    this.setData({
      orderList: [],  //取消订单需要让页面数据清空
      signInfoList: [],
      pageNo: 1,
      waitorder:0,
      noOrderList:false,
      noSignInfoList:false,//我的取件为空
    });
    this.getOrderdata('null');
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
    if(this.data.navItemActive==1){//查询我的寄件
      this.setData({
        orderList: [],
        pageNo: 1,
        noOrderList:false,
      });
      this.getOrderdata('null');
    }
    if(this.data.navItemActive==2){//查询我的取件
      this.setData({
        signInfoList: [],
        noSignInfoList:false,
      });
      this.querySignInfo();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.navItemActive==2){
      return;
    }
    this.setData({
      pageNo:this.data.pageNo+1
    });
    this.getOrderdata('null');
  },
  // 停止刷新方法
  stopPullDownRefresh() {
    wx.stopPullDownRefresh({
      complete(res) {
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})