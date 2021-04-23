// pages/personal/index.js
const service = require("../../service/index");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLogin:false,//显示授权登录
    url:"",//登录成功后跳转页面
    userId:"",
    userInfo:null,//用户信息
    waterTicket:0,//水票
    showShapeCode:false,//显示会员码弹层
    receiptBarCode:"",//会员码
    waitePay:0,//待付款订单数量
    onTheWay:0,//待配送
    forPickup:0,//待取货
    partnerId:"",//我的推广主键ID
    identity:"",//合伙人身份
    reviewerState:"",//绑定合伙人审核状态
    showNoInvite:false,//显示无邀新活动弹层
  },
  //点击显示会员码弹层
  shapeCodeClick(){
    this.setData({
      showLogin:true,
      url:"shapeCode"
    });
  },
  //关闭会员码弹层
  hideShapeCode(){
    this.setData({
      showShapeCode:false
    });
  },
  //获取会员码
  getReceiptBarcode(){
    wx.showLoading({title:"加载中..."});
    service.getReceiptBarcode({
      userId:this.data.userId,
    }).then((res)=>{
      wx.hideLoading();
      if(res.data.result=="200") {
        this.setData({
          showShapeCode:true,
          receiptBarCode: res.data.data.receiptBarCode
        });
      }
    })
  },
  //弹窗后页面禁止滑动
  myCatchTouch(){
    return;
  },
  //获取用户基本信息
  getCusUserEntity(){
    let t=this;
    wx.showLoading({
      title: '加载中',
    });
    service.getCusUserEntity({
      userId:t.data.userId
    }).then((res)=>{
      wx.hideLoading();
      this.stopPullDownRefresh();
      if(res.data.result==200){
        let userInfo = res.data.data;
        this.setData({
          userInfo
        });
      }else{
        wx.showToast({
          title: '当前网络状态较差，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }

    })
  },
  //复制用户ID
  copyUserId(){
    wx.setClipboardData({
      data: this.data.userId,
      success: function (res) {
        wx.showToast({
          title: '已复制到粘贴板',
          icon:'none'
        });
      }
    });
  },
  //获取水票数
  getWaterTicket(){
    service.getmywaterticketnum({
      userId:wx.getStorageSync('userId')
    }).then(res=>{
      console.log(res)
      if(res.data.result==200){
        this.setData({
          waterTicket:res.data.data.ticketNum
        })
      }
    })
  },
  //获取订单数量
  getOrderNum(){
    this.setData({
      waitePay:0,
      onTheWay:0,
      forPickup:0
    });
    service.getOrderNum({
      userId:this.data.userId,
    }).then((res)=>{
      let data = res.data.data;
      data.forEach((item)=>{
        if(item.orderStatus==10){//待付款
          this.setData({waitePay:item.orderNums});
        }else if(item.orderStatus==20){//待配送
          this.setData({onTheWay:item.orderNums});
        }else if(item.orderStatus==30){//待取货
          this.setData({forPickup:item.orderNums});
        }
      })
    })
  },
  //获取我的合伙人信息
  getMyPartner(){
    service.getMyPartner({
      userId:this.data.userId
    }).then((res)=>{
      let data = res.data.data;
      this.setData({
        partnerId: data.wtPartner?data.wtPartner.id:"",//我的推广主键ID
        identity:data.identity,//身份：0.合伙人 1.都不是 2.被合伙人
        reviewerState:data.reviewerState//绑定合伙人审核状态：10.待审核 20.同意 99.拒绝
      });
    })
  },
  //获取默认地址（首次进入小程序如果用户以前有默认地址展示默认地址；）
  getAddreddList(){
    service.getwateraddresslist({
      "platform": "wx",
      "requestCode": 1004,
      "params": "{userId:" + wx.getStorageSync('userId') + ",pageNo:1,pageSize:20}"
    }).then(res=>{
      if (res.data.result == 0 || res.data.result == 200){
        if(res.data.data.length>0){
          res.data.data.forEach(item=>{
            if (item.isDefault==1){  //有默认收货地址
              wx.setStorageSync('isdefault', item)
            }
          })
        }
      }
    })
  },
  //判断登陆成功
  loginSuccess(){
    let t=this;
    this.setData({showLogin:false,userId:wx.getStorageSync("userId")});
    this.getAddreddList()
    if(this.data.url==""){
      //点击登录 成功后获取我的信息,水票信息,会员码,推广合伙人信息
      this.getCusUserEntity();
      this.getOrderNum();
      this.getMyPartner();
    }else if(this.data.url=="shapeCode"){
      this.getReceiptBarcode();
      this.getCusUserEntity();
      this.getOrderNum();
      this.getMyPartner();
    }else
    //跳转设置页
    if(this.data.url=="setting"){
      /*if(!this.data.userInfo){
        this.getCusUserEntity();
        this.getOrderNum();
        this.getMyPartner();
      }else{*/
        wx.navigateTo({
          url:'/pages/personalSetting/index'
        })
      //}
    }else if(this.data.url=="personalInviteNewActivity"){//邀新有礼
      this.getLastNewInviteActivity();
    }else{
      wx.navigateTo({
        url:t.data.url
      })
    }
  },
  //获取最新的邀新活动
  getLastNewInviteActivity(){
    wx.showLoading({title:"加载中..."});
    service.getLastNewInviteActivity().then((res)=>{
      wx.hideLoading();
      if(res.data.data!=null){//有邀新活动
        let activityCode = res.data.data.activityCode;
        wx.navigateTo({
          url:`/pages/webview/index?url=personalInviteNewActivity&activityCode=${activityCode}`
        })
        /*wx.navigateTo({
          url:'/pages/webview/index?url=personalInviteNewShareLanding&inviteUserId=164083885825589357&activityCode=HD164246597440372845'
        })*/
      }else{//没有邀新活动
        this.setData({
          showNoInvite:true
        });
      }
    });
  },
  //点击登录
  toLogin(){
    this.setData({
      showLogin:true,
      url: ''
    });
  },
  //跳转设置页面
  goSetting(){
    this.setData({
      showLogin:true,
      url: "setting"
    });
  },
  //跳转水票
  toWaterTicket(){
    this.setData({
      showLogin:true,
      url: '/pages/personalWaterDiscount/index'
    });
  },
  //跳转会员积分
  toMemberPoints(){
    this.setData({
      showLogin:true,
      url: '/pages/webview/index?url=personalMemberPoints'
    });
  },
  //跳转我的卡券
  toDiscount(){
    this.setData({
      showLogin:true,
      url: '/pages/homeDiscount/index'
    });
  },
  //跳转我的订单
  toOrderList(e){
    let index=e.currentTarget.dataset.index;
    this.setData({
      showLogin:true,
      url: '/pages/personalOrderList/index?index='+index
    });
  },
  //跳转邀新送券
  toInviteNewActivity(){
    this.setData({
      showLogin:true,
      url: 'personalInviteNewActivity'
    });
  },
  //无邀新活动弹层关闭按钮
  closeNoInvite(){
    this.setData({
      showNoInvite:false
    });
  },
  //跳转水管家推广
  toWaterPromotion(){
    let url="";
    switch (this.data.identity){
      case 0://合伙人
        if(this.data.reviewerState==20){//绑定合伙人审核状态 20 审核通过
          //转到我的推广页
          url='/pages/webview/index?url=personalWaterPromotion&partnerId='+this.data.partnerId;
        }
        if(this.data.reviewerState==10){//绑定合伙人审核状态 10 待审核
          //跳转到绑定合伙人待审核页
          url='/pages/webview/index?url=personalPartnerBinding&bindingAudit=1';
        }
        if(this.data.reviewerState==99){//绑定合伙人审核状态 99 审核拒绝
          //跳转到绑定合伙人审核拒绝页
          url='/pages/webview/index?url=personalPartnerBinding&bindingAudit=1';
        }
      break;
      case 1://都不是
        // 跳转到绑定合伙人页
        url='/pages/webview/index?url=personalPartnerBinding';
        break;
      case 2://被合伙人
        break;
    }
    this.setData({
      showLogin:true,
      url: url
    });
  },
  //跳转收货地址
  toReceiverAddress(){
    this.setData({
      showLogin:true,
      url: '/pages/waterAddress/index?source=personal'
    });
  },
  //跳转常见问题
  toFAQ(){
    wx.navigateTo({
      url: '/pages/webview/index?url=personalFAQ',
    })
  },
  //跳转历史订单
  toHistoryOrderList(){
    this.setData({
      showLogin:true,
      url: '/pages/personalHistoryOrder/index'
    });
  },
  //跳转指尖拼团
  togroup(){
    this.setData({
      showLogin:true,
      url: '/pages/group/index'
    });
  },
  //跳转自主购物
  toselfshopping(){
    this.setData({
      showLogin:true,
      url: '/pages/selfHelpPurchasing/index'
    });
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
    let userId=wx.getStorageSync("userId");
    if(userId){
      this.setData({userId,showLogin:false});
      this.getCusUserEntity();
      this.getOrderNum();
      this.getMyPartner();
      this.getWaterTicket()
      app.shoppingNum()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({showNoInvite:false});
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
    this.getCusUserEntity();
    this.getMyPartner();
  },
  // 停止刷新方法
  stopPullDownRefresh() {
    wx.stopPullDownRefresh({
      complete(res) {
      }
    })
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