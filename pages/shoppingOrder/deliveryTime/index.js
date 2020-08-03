// pages/shoppingOrder/deliveryTime/index.js
const util = require("../../../utils/util.js")
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    businessTime: Object,
    operateWeek:Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    choosedate:0,    //选择日期--默认第一个
    choosetime:0,   //选择的时间--默认第一个
    lists:[],      //左侧
    list:[],      //右侧
    scrtop:0,    //历史选择位置
  },
  lifetimes: {
    attached(){
      let arr = util.getAppointTime(this.properties.businessTime, this.properties.operateWeek)
      if (wx.getStorageSync('hischoose')){
      let hischoose=wx.getStorageSync('hischoose')
        this.setData({
          choosedate:hischoose.chooseleft,
          choosetime:hischoose.chooseright,
          scrtop: hischoose.choosetop
        },()=>{
          if (hischoose.chooseright >this.data.list.length){
            this.setData({
              choosetime:0
            })
          }
          let fdata = {}
          fdata.datime = this.data.list[this.data.choosetime]
          fdata.month = this.data.lists[this.data.choosedate]
          this.triggerEvent('deliverysure', fdata)
        })
      }
      arr[0].timeList = ['尽快送达',...arr[0].timeList]
      this.setData({
        lists:arr,
        list: arr[this.data.choosedate].timeList
      })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    topClick(){
      this.triggerEvent('deliverycancel')
    },
    //右侧
    chooseTime(e) {
      let datime = e.target.dataset.datime
      this.setData({
        choosetime: e.target.dataset.ind,
        scrtop: e.target.offsetTop
      })
      let chooseArr={}
      chooseArr.chooseleft = this.data.choosedate
      chooseArr.chooseright = this.data.choosetime
      chooseArr.choosetop = this.data.scrtop
      wx.setStorageSync('hischoose', chooseArr)
      let fdata={}
      fdata.datime=datime
      fdata.month=this.data.lists[this.data.choosedate]
      this.triggerEvent('deliverysure', fdata )
      this.topClick()
    },
    //左侧切换
    chooseDate(e) {
      let inda = e.target.dataset.inda
      this.setData({
        choosetime:'o',
        choosedate: inda,
        list: this.data.lists[inda].timeList
      })
      if (this.data.choosedate == 0&&!wx.getStorageSync('hischoose')) {
        this.setData({
          choosetime: 0,
        })
      }else{
        if (this.data.choosedate == wx.getStorageSync('hischoose').chooseleft){
          this.setData({
            choosetime: wx.getStorageSync('hischoose').chooseright
          })
        }else{
          choosetime:'o'
        }
      }
    }
  }
})
