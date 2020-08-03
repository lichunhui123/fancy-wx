// pages/expressNotTake/index.js
const app = getApp();
const service = require('../../service/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    allChoose: false, //全选
    listData: [],   //列表数据
    phone: "", //手机号
    phoneSub: "",//手机尾号
    showGrowthValueToast: false,//显示积分成长值的提示
    growth: 0,//成长值
    credits: 0,//积分
    noData: false,
    noPhone: false,  //绑定手机
    isPhoneX:false,  //iphonex
  },
  //获取取件列表
  getList(message) {
    if (message != 'message') {
      wx.showLoading({title: "加载中"});
    }
    this.setData({
      listData: []
    })
    service.getScanPickList({
      customerId: wx.getStorageSync("userId"),
      phone: this.data.phone
    }).then((res) => {
      console.log('列表', res)
      if (message != 'message') {
        wx.hideLoading();
      }
      wx.stopPullDownRefresh()
      let list = res.data.data;
      if (list && list.length > 0) {
        list.map((item) => {
          item.list.map((val, index) => {
            val.cargo = val.putawaySerialNumber.split('-')[0]
            val.choose = false
          });
        });
        this.setData({
          noData: false,
          listData: list
        })
      } else {
        this.setData({noData: true, listData: []});
      }
    }).catch(() => {
      wx.hideLoading();
      wx.stopPullDownRefresh()
    })
  },
  //签收
  signClick() {
    this.setData({
      showGrowthValueToast: false,//显示积分成长值的提示
      growth: 0,//成长值
      credits: 0,//积分
    });
    let someChoose = this.data.listData.some(vl => {
      if (vl.list) {
        let vloo = vl.list.some(el => el.choose)
        return vloo == true
      }
    })
    if (!someChoose) {
      wx.showToast({
        title: "请选择需要签收的快递",
        icon: 'none',
      })
      return
    }
    let arrId = [];
    this.data.listData.forEach(item => {
      item.list && item.list.forEach(val => {
        if (val.choose) {
          arrId.push(val.id);
        }
      })
    });
    wx.showLoading({title: "加载中"});
    service.saveScanForWx({
      customerId: wx.getStorageSync("userId"),
      id: arrId
    }).then((res) => {
      wx.hideLoading();
      if (res.data.result == 200) {
        wx.showToast({
          title: "亲，您已取件完毕",
          icon: 'none',
        });
        this.setData({
          showGrowthValueToast: true,//显示积分成长值的提示
          growth: 5,//成长值
          credits: 2,//积分
        });
        this.getList('message')
      } else {
        wx.showToast({
          title: "签收失败",
          icon: 'none',
          duration: 2000
        })
      }
    });
  },
  //跳转绑定手机
  bindPhone() {
    wx.navigateTo({url: "../../pages/personalBindPhone/index?source=expressNotTake"})
  },
  //获取用户绑定手机
  getInfo() {
    let t = this;
    if (!wx.getStorageSync("userId")) {
      return;
    }
    service.getUserInfo({
      userId: wx.getStorageSync("userId")
    }).then((res) => {
      console.log('手机', res)
      if (res.data.result === 200 || res.data.result === 0) {
        if (res.data.data.userInfo.phone) {
          let phone = res.data.data.userInfo.phone;
          t.setData({phone, phoneSub: phone.substring(7), noPhone: false});
          t.getList();
        } else {
          t.setData({noPhone: true})
        }
      } else {
        wx.showToast({
          title: "获取用户信息失败",
          icon: 'none',
          duration: 2000
        })
      }
    }).catch(() => {
      wx.showToast({
        title: "获取用户信息失败",
        icon: 'none',
        duration: 2000
      })
    });
  },
  //全选点击
  checkall() {
    this.setData({
      allChoose: !this.data.allChoose
    }, () => {
      let newdata
      if (this.data.allChoose) {
        newdata = this.data.listData.map(item => {
          item.list && item.list.forEach(val => {
            val.choose = true
          })
          return item
        })
      } else {
        newdata = this.data.listData.map(item => {
          item.list && item.list.forEach(val => {
            val.choose = false
          })
          return item
        })
      }
      this.setData({
        listData: newdata
      })
    })
  },
  //单选点击
  itemCheck(e) {
    console.log(e)
    let id = e.currentTarget.dataset.id
    let newdata = this.data.listData.map(item => {
      item.list && item.list.forEach(val => {
        if (val.id == id) {
          val.choose = !val.choose
        }
      })
      return item
    })
    this.setData({
      listData: newdata,
    }, () => {

      let allChoose = this.data.listData.every(vl => {
        if (vl.list) {
          let vloo = vl.list.every(el => el.choose)
          return vloo == true
        }
      })
      this.setData({
        allChoose
      })
    })

  },
  //跳转我的快递
  orderfn() {
    wx.redirectTo({
      url: "/pages/expressOrder/index",
    })
  },
  //跳转通知快递
  sendparcel() {
    wx.redirectTo({
      url: '/pages/express/index',
    })
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
    wx.hideShareMenu();
    this.setData({
      allChoose: false,
      listData: []
    });
    this.getInfo();
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
    this.setData({
      allChoose:false,
      listData:[]
    });
    if(this.data.phone){
      this.getList()
    }else{
      this.getInfo();
    }
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