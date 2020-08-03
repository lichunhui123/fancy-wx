// pages/webview/index.js
let config = require("../../config.js");
let service = require("../../service/index");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options:"",//路由参数
    url:"",
    showLogin:true,
  },
  //判断登陆成功
  loginSuccess(val){
    let options=this.data.options;//初始值
    let url="";
    if(options.url=="imprint"){//时光印记
      url=config.imprint;
    }
    if(options.url=="water"){//水管家
      url=config.water;
    }
    if(options.url=="personalWaterTicket"){//水票
      url=config.personalWaterTicket;
    }
    if(options.url=="personalMemberPoints"){//会员积分
      url=config.personalMemberPoints;
    }
    if(options.url=="personalInviteNewActivity"){//邀新送券
      url=config.personalInviteNewActivity+"?inviteUserId="+wx.getStorageSync("userId")+"&activityCode="+options.activityCode;
    }
    if(options.url=="personalInviteNewShareLanding"){//邀新送券分享落地页 inviteUserId 邀请人ID
      if(val.detail){//授权登录返回的用户信息
        this.inviteError(val.detail.userInfo);
      }else{//没有返回信息 重新调用登录接口
        this.userLogin();
      }
      url=config.personalInviteNewShareLanding+"?inviteUserId="+options.inviteUserId+"&userId="+wx.getStorageSync("userId");
    }
    if(options.url=="personalWaterPromotion"){//水管家推广
      url=config.personalWaterPromotion+"?partnerId="+options.partnerId;
    }
    if(options.url=="personalPartnerBinding"){//水管家推广绑定页
      url=config.personalPartnerBinding+(options.bindingAudit?"?bindingAudit="+options.bindingAudit:"");
    }
    if(options.url=="personalReceiverAddress"){//收货地址
      url=config.personalReceiverAddress;
    }
    if(options.url=="personalFAQ"){//常见问题
      url=config.personalFAQ;
    }
    this.setData({url:url,showLogin:false});
  },
  //登录失败
  loginError(){
    wx.switchTab({
      url:"/pages/home/index"
    })
  },
  //邀新失败
  inviteError(val){
    console.log(val);
    if(val.inviteErrorMessage){
      wx.showModal({
        title: '温馨提示',
        content: val.inviteErrorMessage,
        showCancel:false,
        success (res) {
          if (res.confirm) {
            wx.switchTab({
              url:"/pages/home/index"
            })
          }
        }
      })
    }else
    if(!val.bnew){//是否新用户  bnew为false (老用户)返回首页
      wx.switchTab({
        url:"/pages/home/index"
      })
    }
  },
  // 获取用户信息
  userLogin(){
    let t=this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              var userInfo = wx.getStorageSync('userInfo') || res.userInfo;
              var encryptedData = res.encryptedData;
              var iv = res.iv;
              //请求后台获取用户数据
              wx.login({
                success: function (res) {
                  const that = this;
                  if (res.code) {
                    service.getUser({
                      code: res.code,
                      avatarUrl: userInfo.avatarUrl,
                      nickName: userInfo.nickName,
                      encryptedData: encryptedData,
                      iv: iv,
                      invitorUserId: t.data.options.inviteUserId, //邀请人用户ID
                      inviteActivityCode:t.data.options.activityCode,//邀新活动编码
                    }).then(function(res){
                      let token = res.data.data.token;
                      wx.setStorageSync("token", token);
                      t.inviteError(res.data.data);
                    }).catch(function(res){
                      wx.switchTab({url:"/pages/home/index"});
                      wx.showToast({
                        title: '当前网络状态较差，请稍后重试',
                        icon: 'none',
                        duration: 2000
                      })
                    })

                  }
                }
              });
            }
          })
        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let url=options.url;
    let title="";
    if(options.url=="imprint"){//时光印记
      title="时光印记";
    }
    if(options.url=="water"){//水管家
      title="水管家";
    }
    if(options.url=="personalWaterTicket"){//水票
      title="我的水票";
    }
    if(options.url=="personalMemberPoints"){//会员积分
      title="积分介绍";
    }
    if(options.url=="personalInviteNewActivity"){//邀新送券
      title="邀新送券";
    }
    if(options.url=="personalInviteNewShareLanding"){//邀新送券分享落地页
      title="新人专享";
    }
    if(options.url=="personalWaterPromotion"||options.url=="personalPartnerBinding"){//水管家推广或者推广绑定页
      title="水管家推广";
    }
    if(options.url=="personalReceiverAddress"){//收货地址
      title="收货地址";
    }
    if(options.url=="personalFAQ"){//常见问题
      title="常见问题";
    }
    this.setData({options:options});
    wx.setNavigationBarTitle({
      title: title
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
    if(this.data.options.url=="personalInviteNewActivity"){
      return {
        title: '新人专享，优惠礼券，速速来领！',
        path: '/pages/webview/index?url=personalInviteNewShareLanding&inviteUserId='+wx.getStorageSync("userId")+"&activityCode="+this.data.options.activityCode
      }
    }
  }
})