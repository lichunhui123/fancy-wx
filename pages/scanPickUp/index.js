const app = getApp();
const service = require('../../service/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLogin:true,//显示授权登录组件 判断是否授权登录
    phone:"",//显示授权获取手机号的弹窗
    phoneSub:"",//手机尾号
    buttonState:false,//签收按钮状态
    list:null,
    showGrowthValueToast:false,//显示积分成长值的提示
    growth:0,//成长值
    credits:0,//积分
    noData:false,//没有数据
    noPhone:false//没有手机
  },
  //登录成功回调
  loginSuccess(){
    this.setData({showLogin:false});
    this.getInfo();
  },
  //获取用户信息
  getInfo(){
    let t=this;
    if(!wx.getStorageSync("userId")){
      return;
    }
    service.getUserInfo({
      userId:wx.getStorageSync("userId")
    }).then((res)=>{
      console.log(res);
      if(res.data.result === 200||res.data.result === 0){
        if(res.data.data.userInfo.phone){
          let phone=res.data.data.userInfo.phone;
          t.setData({phone,phoneSub:phone.substring(7),noPhone:false});
          t.getList();
        }else{
          t.setData({noPhone:true})
        }
      }else{
        wx.showToast({
          title: "获取用户信息失败",
          icon: 'none',
          duration: 2000
        })
      }
    }).catch(()=>{
      wx.showToast({
        title: "获取用户信息失败",
        icon: 'none',
        duration: 2000
      })
    });
  },
  //获取取件列表
  getList(){
    wx.showLoading({title:"加载中"});
    service.getScanPickList({
      customerId: wx.getStorageSync("userId"),
      phone:this.data.phone
    }).then((res)=>{
      wx.hideLoading();
      let list = res.data.data;
      if(list&&list.length>0){
        list.map((item)=>{
          item.list.map((val,index)=>{
            item.list[index].choice=false;
            item.list[index].cargo = val.putawaySerialNumber.split('-')[0]
          });
        });
        console.log(list);
        this.setData({list,noData:false})
      }else{
        this.setData({noData:true});
      }
    }).catch(()=>{
      wx.hideLoading();
    })
  },
  //选择
  select(e){
    let id=e.currentTarget.dataset.id;
    this.data.list.map((item)=>{
      item.list.map((val,index)=>{
        if(val.id==id){
          item.list[index].choice=!item.list[index].choice;
        }
      })
    });
    this.setData({list:this.data.list});
    let buttonState = false;
    this.data.list.forEach((item)=>{
      item.list.map((val)=>{
        if(val.choice){
          buttonState=true;
        }
      })
    });
    this.setData({buttonState});
  },
  //回到首页
  goIndex(){
    wx.switchTab({url:"../../pages/home/index"})
  },
  //跳转绑定手机
  bindPhone(){
    wx.navigateTo({url:"../../pages/personalBindPhone/index?source=scanPickUp"})
  },
  //签收
  signForFn(){
    let t=this;
    if(this.data.buttonState){
      let id=[];
      this.data.list.forEach((item)=>{
        item.list.map((val)=>{
          if(val.choice){
            id.push(val.id);
          }
        })
      });
      wx.showLoading({title:"加载中"});
      service.saveScanForWx({
        customerId:wx.getStorageSync("userId"),
        id:id
      }).then((res)=>{
        wx.hideLoading();
        if(res.data.result==200){
          wx.showToast({
            title:"亲，您已取件完毕",
            icon: 'none',
            duration: 2000
          });
          t.setData({
            showGrowthValueToast:true,//显示积分成长值的提示
            growth:5,//成长值
            credits:2,//积分
          });
          setTimeout(()=>{
            t.goIndex();
          },2000)
        }else{
          wx.showToast({
            title: "签收失败",
            icon: 'none',
            duration: 2000
          })
        }
      });
    }
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
    wx.hideShareMenu()
    /*if (app.globalData.userInfo) {
      this.getInfo();
    }*/
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