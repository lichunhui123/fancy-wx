const app = getApp();
const service = require('../../service/index.js');
Component({
  /**
   * 页面的初始数据
   */
  properties: {
    invitorUserId: {//邀新有礼活动 邀请人ID
      type: String,
      value: ''
    },
    activityCode: {//邀新活动编码
      type: String,
      value: ''
    }
  },
  data: {
    hasUserInfo:true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showGrowthValueToast:false,//显示积分成长值的提示
    growth:0,//成长值
    credits:0,//积分
  },
  attached(){

  },
  ready(){
    //判断登录
    if(wx.getStorageSync("userId")&&wx.getStorageSync("userId")!=null){
      this.setData({
        hasUserInfo:true
      });
      //已经登录了 成功回调
      this.triggerEvent('loginSuccess', null);
    }else{
      this.setData({
        hasUserInfo:false
      });
      this.getUserLocation();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 微信授权定位
    getUserLocation: function () {
      let that = this;
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
            wx.showModal({
              title: '请求授权当前位置',
              content: '需要获取您的地理位置，请确认授权',
              success: function (res) {
                if (res.cancel) {
                  wx.showToast({
                    title: '拒绝授权',
                    icon: 'none',
                    duration: 1000
                  })
                } else if (res.confirm) {
                  wx.openSetting({
                    success: function (dataAu) {
                      if (dataAu.authSetting["scope.userLocation"] == true) {
                        wx.showToast({
                          title: '授权成功',
                          icon: 'success',
                          duration: 1000
                        });
                        //再次授权，调用wx.getLocation的API
                        that.getLocation();
                      } else {
                        wx.showToast({
                          title: '授权失败',
                          icon: 'none',
                          duration: 1000
                        })
                      }
                    }
                  })
                }
              }
            })
          } else if (res.authSetting['scope.userLocation'] == undefined) {
            //调用wx.getLocation的API
            that.getLocation();
          } else {
            //调用wx.getLocation的API
            that.getLocation();
          }
        }
      })
    },
    // 微信获得经纬度
    getLocation: function () {
      let that = this;
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          console.log(res);
          var latitude = res.latitude;
          var longitude = res.longitude;
          that.setData({latitude,longitude});
          that.ifGetUserinfo(latitude, longitude);
        },
        fail: function (res) {
          wx.showToast({
            title: '亲，记得打开手机定位哟！',
            icon: 'none',
            duration: 2000
          })
        }
      })
    },
    // 判断是否授权
    ifGetUserinfo: function () {
      // 判断是否授权登录
      if (this.data.canIUse) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = res => {

        }
      } else {
        // 在没有 open-type=getUserInfo 版本的兼容处理
        app.userInfoReadyCallback = res => {
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    },
    // 微信授权登录
    getUserInfo: function (e) {
      const that = this;
      if (e.detail.userInfo) {
        wx.showLoading({title:"登录中..."});
        var userInfo = e.detail.userInfo;
        wx.setStorageSync('userInfo', userInfo);
        app.globalData.userInfo = userInfo;
        // 授权登录的时候请求后台
        //请求后台获取用户数据
        wx.login({
          success: function (res) {
            if (res.code) {
              wx.getUserInfo({
                success: function (res1) {
                  let param={
                    code: res.code,
                    avatarUrl: userInfo.avatarUrl,
                    nickName: userInfo.nickName,
                    gender:userInfo.gender,//性别 0：未知  1：男  2：女
                    encryptedData: res1.encryptedData,
                    iv: res1.iv,
                    latitude:that.data.latitude,
                    longitude:that.data.longitude
                  };
                  if(that.properties.invitorUserId){//邀新有礼活动需要传递的邀请人ID
                    param.invitorUserId = that.properties.invitorUserId;
                  }
                  if(that.properties.activityCode){//有邀新活动编码时
                    param.inviteActivityCode = that.properties.activityCode;
                  }
                  service.getUser(
                      param
                  ).then(function (resp) {
                    console.log(resp);
                    wx.setStorageSync('openId', resp.data.data.openId);
                    wx.setStorageSync('userId', resp.data.data.userId);
                    let token = resp.data.data.token;
                    wx.setStorageSync("token", token);
                    if(resp.data.data.bnew&&resp.data.data.userId){//新用户注册
                      //显示成长值和积分
                      that.setData({
                        showGrowthValueToast:true,
                        growth:10,//成长值
                      });
                    }
                    setTimeout(()=>{
                      //成功回调函数
                      wx.hideLoading();
                      that.triggerEvent('loginSuccess', {userInfo:resp.data.data});
                    },2000);
                  }).catch(function (rec) {
                    //wx.clearStorage();
                    that.triggerEvent('loginError', null);
                    wx.hideLoading();
                    wx.showToast({
                      title: '当前网络状态较差，请稍后重试',
                      icon: 'none',
                      duration: 2000
                    })
                  })
                },
                fail(err) {
                  //wx.clearStorage();
                  that.triggerEvent('loginError', null);
                  wx.hideLoading();
                  console.log("当前网络状态较差，请稍后重试");
                }
              })
            }
          }
        })
      } else {

      }

    },
  }
});