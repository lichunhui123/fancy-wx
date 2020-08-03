//app.js
import Watchdata from './utils/watchdata.js'
const service = require('/service/index.js');
App({
  onLaunch: function () {
    // 展示本地存储能力
    this.updateManager();
    //获取用户信息
    wx.getSetting({
      success: res => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;
              var userInfo = res.userInfo;
              wx.setStorageSync('userInfo', userInfo);
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
                        iv: iv
                    }).then(function(res){
                      console.log(res);
                        var userInfo = wx.getStorageSync('userId') || null;
                        wx.setStorageSync('openId', res.data.data.openId);
                        wx.setStorageSync('userId', res.data.data.userId);
                        let token = res.data.data.token;
                        wx.setStorageSync("token", token)
                    }).catch(function(res){
                        wx.showToast({
                          title: '当前网络状态较差，请稍后重试',
                          icon: 'none',
                          duration: 2000
                        })
                    })

                  }
                }
              })
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });
    this.getSystemInfo()
  },
  // 模拟器model值跟真机上是不一样的，这里通过search()来检索字符串
  getSystemInfo: function () {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log('获取系统信息', res);
        let models = res.model;
        if (models.search('iPhone X') != -1 || models.search('iPhone 11') != -1) {
          that.globalData.isIPhoneX = true
        }
      }
    });
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
      console.log(res.data.data)
      if (res.data.result == 200) {
          let sum=res.data.data.goodsNumber
          if (sum > 0) {
            wx.setTabBarBadge({
              index: 1,
              text: sum + ''
            })
            if (sum > 99) {
              wx.setTabBarBadge({
                index: 1,
                text: '99+'
              })
            }
          }else{
            wx.removeTabBarBadge({
              index: 1,
              text:''
            })
          }
      }
    })
  },
  updateManager() {
    //console.log("gengxin");
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  globalData: {
    userInfo: wx.getStorageSync('userInfo'),
    userId: wx.getStorageSync('userId'),
    sceneValue: wx.getStorageSync('sceneValue'),
    listActivityGoods: [],
    imgUrl: "https://img.goola.cn/",
    version: "", // 微信版本号
    SDKVersion: "", //客户端基础库版本
    appletVersion: "1.0.0", // 小程序的版本号
    isIPhoneX: false  //当前设备是否为 iPhone X
  },
  Watchdata:new Watchdata()
});