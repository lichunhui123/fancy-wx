//指尖云店商品订单选择配送时间弹窗
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    deliveryTimeList:Object,//计算好的可选时间段
    selectTimes:Object,//已选择时间
    postage:String,//配送费
  },

  /**
   * 组件的初始数据
   */
  data: {
    leftList:[],//左侧列表
    rightList:[],//右侧列表
    selectTimes:{
      date:"",//"2020-09-03“
      startTime:"",//"16:00"
      endTime:"",//"16:30"
      week:"",//周几
      today:false,//是否今天
      scrollTop:0,//滚动高度
    },
  },
  //组件初始化
  lifetimes: {
    attached(){
      let timeArr = this.properties.deliveryTimeList;//计算好的可选时间段
      this.setData({
        leftList:timeArr,
        rightList:timeArr[0].timeList,
      },()=>{
        if(this.properties.selectTimes){//设置默认值
          let rightList=[];
          for(let i=0;i<timeArr.length;i++){
            if(timeArr[i].ldates==this.properties.selectTimes.date){
              rightList = timeArr[i].timeList;//时间段列表
              break;
            }
          }
          this.setData({
            selectTimes:this.properties.selectTimes,
            rightList
          })
        }else{
          this.setData({
            selectTimes:{
              date:this.data.leftList[0].ldates,//"2021-01-18"
              startTime:this.data.rightList[0].startTime,
              endTime:this.data.rightList[0].endTime,
              week:this.data.leftList[0].lweekChina,
              today:this.data.leftList[0].today,
              scrollTop:0,//时间段的滚动高度
            }
          })
        }
      });
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //年月日 选择
    chooseDate(e){
      let item = e.target.dataset.item;
      let selectTimes = this.data.selectTimes;
      selectTimes.date = item.ldates;
      selectTimes.startTime = item.timeList[0].startTime;
      selectTimes.endTime = item.timeList[0].endTime;
      selectTimes.week = item.lweekChina;
      selectTimes.today = item.today;
      selectTimes.scrollTop = 0;//时间段的滚动高度
      this.setData({
        selectTimes,
        rightList:item.timeList
      })
    },
    //选择时间段
    chooseTime(e){
      let item = e.target.dataset.item;
      let selectTimes = this.data.selectTimes;
      selectTimes.startTime = item.startTime;
      selectTimes.endTime = item.endTime;
      selectTimes.scrollTop = e.target.offsetTop;//滚动高度
      this.setData({
        selectTimes
      })
    },
    //取消
    cancel(){
      this.triggerEvent('clouddeliverycancel')
    },
    //保存
    save(){
      if(!this.data.selectTimes.date){
        wx.showToast({
          title: '请选择配送时间',
          icon: 'none',
          duration:1800
        })
        return;
      }else if(!this.data.selectTimes.startTime){
        wx.showToast({
          title: '请选择完整的配送时间',
          icon: 'none',
          duration:1800
        })
        return;
      }
      this.triggerEvent('clouddeliverysave',{selectTimes:this.data.selectTimes})
    }
  }
})
