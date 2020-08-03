// pages/personalOrderList/index.js
const app = getApp();
const service = require("../../service/index");
import floatObj from '../../utils/floatObj.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId:wx.getStorageSync("userId"),
    orderStatus:0,//tab选中状态
    tabArr:[
      {
        orderStatus:0,
        name:"全部",
        orderNum:0
      },
      {
        orderStatus:10,
        name:"待付款",
        orderNum:0
      },
      {
        orderStatus:20,
        name:"待配送",
        orderNum:0
      },
      {
        orderStatus:30,
        name:"待收货",
        orderNum:0
      }
    ],
    pageNum: 1,//第几页
    pageSize: 10,//每页数据
    imgHttp:app.globalData.imgUrl,
    noData:false,
    orderList:null,//订单列表
    noMore:false//没有下一页了
  },
  //tab切换
  getOrderChange(e){
    if(this.hasRequest){//防止点击tab时列表还没请求完
      return;
    }
    let index = e.currentTarget.dataset.index;
    this.groupCountDownTime();
    this.setData({
      orderStatus:index,
      pageNum:1,
      orderList:null,
      noData:false,
      noMore:false
    },()=>{
      this.getOrderList(index);
      this.getOrderNum();
    });
  },
  //跳转订详情
  toOrderDetail(e){
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/personalOrderDetail/index?orderCode=${item.orderCode}&payGroupCode=${item.payGroupCode}&orderStatus=${item.orderStatus}`,
    })
  },
  //取消派送
  cancelSend(e){
    let t=this;
    wx.showModal({
      content: '确定取消派送单？',
      cancelColor:"#999999",
      confirmColor:"#F2922F",
      success(res) {
        if (res.confirm) {
          let sendNo=e.currentTarget.dataset.sendcode;//派送单号
          service.waterCancelSend({
            sendNo
          }).then((res)=>{
            if(res.data.result==200){
              wx.showToast({
                title: '派送单取消成功',
                icon: 'none',
                duration: 2000
              });
              t.setData({
                pageNum:1,
                orderList:null,
                noData:false,
                noMore:false//没有更多了
              });
              t.getOrderList(t.data.orderStatus);
            }
          })
        } else if (res.cancel) {

        }
      }
    })
  },
  //获取订单数量
  getOrderNum(){
    let t=this;
    t.data.tabArr.forEach((item)=>{
      item.orderNum=0;
    });
    service.getOrderNum({
      userId:this.data.userId,
    }).then((res)=>{
      t.data.tabArr.forEach((item)=>{
        res.data.data.forEach((obj)=>{
          if(item.orderStatus==obj.orderStatus){
            item.orderNum=obj.orderNums;
          }
        })
      });
      t.setData({tabArr:t.data.tabArr});
    })
  },
  //获取订单列表
  getOrderList(index){
    let t=this;
    let orderStatus = index;
    wx.showLoading({
      title: '加载中',
    });
    this.hasRequest=true;//防止点击tab时列表还没请求完
    let param=null;
    if(!orderStatus||orderStatus=="0"){//全部状态
      param={
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        userId: this.data.userId
      };
    }else{
      param={
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        userId: this.data.userId,
        orderStatus: this.data.orderStatus
      };
    }
    service.getOrderList(
      param
    ).then((res)=>{
      wx.hideLoading();
      this.hasRequest = false;//防止点击tab时列表还没请求完
      //停止刷新
      t.stopPullDownRefresh();
      if(res.data.result==200){
        if(res.data.data==null||(res.data.data&&res.data.data.list.length==0)&&t.data.pageNum==1){
          this.setData({
            orderList:null,
            noData:true
          });
          return;
        }
        if(res.data.data.list.length<t.data.pageSize){
          this.setData({noMore:true});//没有更多了
        }
        let orderList = t.data.orderList?[...t.data.orderList, ...res.data.data.list]:res.data.data.list;
        orderList.map((item) => {
          if (item.createTime) {
            if (item.createTime.indexOf(".") != -1) {
              item.createTime = item.createTime.slice(0, item.createTime.indexOf("."));
              item.doneTime = item.doneTime?item.doneTime.slice(0, item.doneTime.indexOf(".")):"";
              item.cancelTime = item.cancelTime?item.cancelTime.slice(0, item.cancelTime.indexOf(".")):"";
            }
          }
          return item;
        });
        this.setData({
          orderList:orderList
        },()=>{
          let list = this.data.orderList;
          if(list&&list.length>0){
            list.map((item,index)=>{//云店订单 多人拼团活动 待配送-配送 待收货-自提 并且没有拼团成功的活动生成分享图片
              if(item.orderResource==40&&(item.orderStatus==20||item.orderStatus==30||item.orderStatus==31)&&item.groupCode&&item.groupStatus==1){
                this.getShareImg(item,index);
              }
            })
          }
        });
        if(!orderList||orderList.length==0){
          this.setData({
            noData:true
          });
        }
      }else{
        wx.showToast({
          title: '当前网络状态较差，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //拼团列表倒计时
  groupCountDownTime(){
    clearInterval(this.timer);
    this.timer = null;
    this.timer = setInterval(()=>{
      let orderList=this.data.orderList;
      if(orderList){
        orderList.forEach(val=>{
          if(val.orderResource==40&&(val.orderStatus==20||val.orderStatus==30||val.orderStatus==31)&&val.groupCode&&val.groupStatus==1){
            let tm= val.groupDoneTime.substring(0, 19);//拼团结束时间
            let doneTime= (new Date(tm.replace(/-/g,"/"))).getTime();
            let times = (doneTime - (new Date()).getTime()) / 1000;
            val.hour= "00";
            val.minute= "00";
            val.second= "00";
            if(times>0){
              let hour = 0,
                minute = 0,
                second = 0;//时间默认值
              if (times > 0) {
                hour = Math.floor(times / (60 * 60));
                minute = Math.floor(times / 60) - (hour * 60);
                second = Math.floor(times) - (hour * 60 * 60) - (minute * 60);
              }
              if (hour <= 9) hour = '0' + hour;
              if (minute <= 9) minute = '0' + minute;
              if (second <= 9) second = '0' + second;
              val.hour= hour;
              val.minute= minute;
              val.second= second;
            }
          }
        });
        this.setData({
          orderList
        })
      }
    },1000)
  },
  //获取分享图片
  getShareImg(item,index){
    var thats = this;
    let promise1 = new Promise(function (resolve, reject) {
      /* 获得要在画布上绘制的图片 */
      wx.getImageInfo({
        src: thats.data.imgHttp+item.orderItemList[0].goodsPhoto,
        success: function (res) {
          resolve(res);
        }
      })
    });
    let promise2 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: '../../image/smallIcon.png',
        success: function (res) {
          resolve(res);
        }
      })
    });
    let promise3 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: '../../image/share_buy_btn.png',
        success: function (res) {
          resolve(res);
        }
      })
    });
    Promise.all(
        [promise1, promise2, promise3]
    ).then(res => {
      /* 创建 canvas 画布 */
      const ctx = wx.createCanvasContext('shareImg'+index);

      /* 绘制图像到画布  图片的位置你自己计算好就行 参数的含义看文档 */
      /* ps: 网络图片的话 就不用加../../路径了 反正我这里路径得加 */
      ctx.drawImage(res[0].path, 60, 0, 250, 250)
      ctx.drawImage('../../' + res[1].path, 0, 0, 86, 86)
      ctx.drawImage('../../' + res[2].path, 0, 230, 400, 86)

      /* 绘制文字 位置自己计算 参数自己看文档 */
      ctx.setTextAlign('left');                        //  位置

      ctx.setFillStyle('red');                    //  颜色
      ctx.setFontSize(36);                            //  字号
      ctx.fillText(floatObj.divide(item.orderPrice,100).toFixed(2), 51,287);

      ctx.setFillStyle('red');
      ctx.setFontSize(22);
      ctx.fillText('￥', 30,286);

      /* 绘制 */
      ctx.stroke()
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 400,
          height: 320,
          destWidth: 800,
          destHeight: 640,
          canvasId: 'shareImg'+index,
          quality:1,
          success: function (res) {
            /* 这里 就可以显示之前写的 预览区域了 把生成的图片url给image的src */
            let filePath = res.tempFilePath;//文件路径
            item.shareImg = filePath;
            thats.setData({
              orderList:thats.data.orderList
            })
          },
          fail: function (res) {
          }
        })
      })
    })
  },
  //确认收货
  confirmReceipt(e){
    let t=this;
    let orderCode = e.currentTarget.dataset.ordercode;//订单单号
    wx.showModal({
      content:'确定已收到货？',
      cancelColor:"#999999",
      confirmColor:"#F2922F",
      success(res){
        if (res.confirm){//点击确认
          service.mallReceipt({
            operatorId:t.data.userId,
            orderCode:orderCode
          }).then(res=>{
            if(res.data.result==200){
              wx.showToast({
                title: '订单确认收货成功！',
                icon: 'none',
                duration: 2000
              });
              t.setData({
                pageNum:1,
                orderList:null,
                noData:false,
                noMore:false//没有更多了
              });
              t.getOrderList(t.data.orderStatus);
              t.getOrderNum();
            }else{
              wx.showToast({
                title: res.data.message,
                icon: 'none',
                duration: 2000
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
    this.setData({orderStatus:options.index,userId:wx.getStorageSync("userId")});
    //this.setData({orderStatus:0,userId:wx.getStorageSync("userId")});
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
    this.setData({
      pageNum:1,
      orderList:null,
      noData:false,
      noMore:false//没有更多了
    });
    this.groupCountDownTime();
    this.getOrderList(this.data.orderStatus);
    this.getOrderNum();
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
      pageNum: 1,
      orderList: [],
      noData:false,
      noMore:false//没有更多了
    });
    this.getOrderList(this.data.orderStatus);
    this.getOrderNum();
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
    let that = this;
    if(this.data.noMore){
      return;
    }
    that.setData({
      pageNum: that.data.pageNum + 1
    });
    this.getOrderList(this.data.orderStatus);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let item = res.target.dataset.item;//当前订单信息
    if(res.from=="button"){//分享来自转发按钮
      let shareImg = item.shareImg.replace(/^http(?=:)/i, 'https');
      return {
        title: `还差${item.surplusCount}人即可成团，快来一起拼吧！`, 
        path: '/pages/cloudStoreDetail/index?storeGoodsId=' + item.orderItemList[0].goodsCode + '&activityCode=' + item.orderItemList[0].activityId + '&groupCode=' + item.groupCode + '&groupShare=true',
        imageUrl: shareImg,
        success: function (res) {

        },
        fail: function (res) {
          // 转发失败
          wx.showToast({
            title: '当前网络状态较差，请稍后重试',
            icon: 'none',
            duration: 2000
          })
        }
      }
      
    }
  }
})