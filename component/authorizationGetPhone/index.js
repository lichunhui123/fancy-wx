const service = require('../../service/index.js');
Component({
  /**
   * 页面的初始数据
   */
  data: {
    showGetPhone:false//是否显示授权手机
  },
  attached(){

  },
  ready(){
    //判断登录
    if(wx.getStorageSync("phone")){
      this.setData({
        showGetPhone:false
      });
      //已经授权了 成功回调
      this.triggerEvent('getPhone', {
        phone: wx.getStorageSync("consignee")&&wx.getStorageSync("consignee").putTel ? wx.getStorageSync("consignee").putTel:wx.getStorageSync("phone"),
        cloudPhone:wx.getStorageSync("consignee")&&wx.getStorageSync("consignee").putTel1 ? wx.getStorageSync("consignee").putTel1:wx.getStorageSync("phone"),
      });
    }else{
      this.setData({
        showGetPhone:true
      });
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //关闭
    closeBindPhoneFn(){
      this.triggerEvent('close');
    },
    //获取手机号
    getPhoneNumber(e){
      let that = this;
      wx.showLoading({title:"加载中..."});
      wx.login({
        success: res => {
          service.getPhone({
            'encryptedData': e.detail.encryptedData,
            'iv': e.detail.iv,
            'code': res.code
          }).then((res) => {
            wx.hideLoading();
            that.setData({
              showGetPhone:false
            });
            if (res.data.result == 200) {
              if (res.data.data.phoneNumber) {
                wx.setStorageSync("phone",res.data.data.phoneNumber);
                that.triggerEvent('getPhone', {
                  phone: res.data.data.phoneNumber,
                  cloudPhone:res.data.data.phoneNumber,
                });
                wx.showToast({
                  title: '获取成功',
                  icon: 'none',
                  duration: 2000
                });
              }else{
                that.triggerEvent('getPhone', {
                  phone: "",
                });
              }
            }else{
              that.triggerEvent('getPhone', {
                phone: "",
              });
              wx.showToast({
                title: "获取失败",
                icon: 'none',
                duration: 2000
              })
            }
            that.closeBindPhoneFn();
          })
        }
      })
    }
  }
});