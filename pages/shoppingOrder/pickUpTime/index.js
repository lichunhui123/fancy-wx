// pages/shoppingOrder/pickUpTime/index.js
const util = require("../../../utils/util.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    smallTakeTime:Object,
    smallTakeWeek:Object,
    selectTimes:Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    leftList:[],//左侧列表
    hourList:[],//小时列表
    minuteList:[],//分列表
    selectTimes:{
      date:"",//"2020年09月03日"
      dates:"",//"2020-09-03“
      hour:"",
      minute:"",
      week:"",//周几 如果是今天显示今天
      hourScrTop:0,//小时的滚动高度
      minuteScrTop:0,//分的滚动高度
    },
  },
  lifetimes: {
    attached(){
      let timeArr = this.setTimeArr();
      this.setData({
        leftList:timeArr,
        hourList:timeArr[0].timeList,
        minuteList:timeArr[0].timeList[0].minuteList
      },()=>{
        if(this.properties.selectTimes){//设置默认值
          let hourList=[];
          let minuteList=[];
          for(let i=0;i<timeArr.length;i++){
            if(timeArr[i].ldate==this.properties.selectTimes.date){
              hourList = timeArr[i].timeList;//小时列表
              for(let j=0;j<hourList.length;j++){
                if(hourList[j].hour==this.properties.selectTimes.hour){
                  minuteList = hourList[j].minuteList;//分钟列表
                  break;
                }
              }
              break;
            }
          }
          this.setData({
            selectTimes:this.properties.selectTimes,
            hourList,
            minuteList
          })
        }else{
          let week = "";
          if(this.data.leftList[0].today){
            week = "今天";
          }else{
            week = this.data.leftList[0].lweekChina;
          }
          this.setData({
            selectTimes:{
              date:this.data.leftList[0].ldate,
              dates:this.data.leftList[0].ldates,
              hour:this.data.hourList[0].hour,
              minute:this.data.minuteList[0],
              week:week,
              hourScrTop:0,//小时的滚动高度
              minuteScrTop:0,//分的滚动高度
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
    //设置选择时间列表
    setTimeArr(){
      let t=this;
      let takeWeek = this.properties.smallTakeWeek;//设置的自提时间 周
      let nowDate = new Date(); //当前日期
      let weekListChina = ["周一","周二","周三","周四","周五","周六","周日"];
      let appointmentList = [];
      function exchangeOtherDay(day) {
        let otherDay = {};
        otherDay.ltime = day.ltime + 86400000;
        otherDay.lyear = new Date(otherDay.ltime).getFullYear();
        otherDay.ldate =
          new Date(otherDay.ltime).getFullYear() +
          "年" +
          util.add0(new Date(otherDay.ltime).getMonth() + 1) +
          "月" +
          util.add0(new Date(otherDay.ltime).getDate()) +
          "日";
        otherDay.ldates = new Date(otherDay.ltime).getFullYear() +
          "-" +
          util.add0(new Date(otherDay.ltime).getMonth() + 1) +
          "-" +
          util.add0(new Date(otherDay.ltime).getDate());
        otherDay.lweek = new Date(otherDay.ltime).getDay();
        if (otherDay.lweek == 0) {
          otherDay.lweek = 7;
          otherDay.lweekChina = weekListChina[weekListChina.length - 1];
        } else {
          otherDay.lweekChina = weekListChina[otherDay.lweek - 1];
        }
        otherDay.timeList = t.setTimeList(false);//先设置今天的小时和分钟的选择列表;
        otherDay.today = false;
        return otherDay;
      }
      let day1 = {
        ldate: nowDate.getFullYear() + "年" +util.add0(nowDate.getMonth() + 1) + "月" + util.add0(nowDate.getDate()) + "日",//当前时间 "2020年08月27日"
        ldates: nowDate.getFullYear() + "-" +util.add0(nowDate.getMonth() + 1) + "-" + util.add0(nowDate.getDate()),//当前时间 "2020-08-27"
        ltime: nowDate.getTime(),//当前时间戳
        lyear: nowDate.getFullYear(),//当前时间 "2020"
        lweek: nowDate.getDay() == 0 ? 7 : nowDate.getDay(),//今天是周几 1，2，3，4，5，6，7
        timeList: [],//[{hour:'09',minuteList:['00','01']},{hour:'10',minuteList:['00','01']}] 几点几分组成的数组
        lweekChina: weekListChina[(nowDate.getDay() == 0 ? 7 : nowDate.getDay()) - 1],//今天是周几 转中文 周几
        today: true//是否是今天
      };
      let timeList = this.setTimeList(true);
      if(timeList.length==0){//返回空列表 说明当前时间+备货时间>设置的结束时间 今天不能选择了
        day1.today = false;
        day1 = exchangeOtherDay(day1);
      }else{
        day1.timeList = timeList;//先设置今天的小时和分钟的选择列表
      }
      
      let day2 = {};
      let day3 = {};
      if (takeWeek.length > 0) {//[0,0,0,1,1,1,0] => [周一，周二 ... 周日]
        while (takeWeek[day1.lweek - 1] == 0) {
          day1.today = false;
          day1 = exchangeOtherDay(day1);
        }
        day2 = exchangeOtherDay(day1);
        while (takeWeek[day2.lweek - 1] == 0) {
          day2 = exchangeOtherDay(day2);
        }
        day3 = exchangeOtherDay(day2);
        while (takeWeek[day3.lweek - 1] == 0) {
          day3 = exchangeOtherDay(day3);
        }
        appointmentList.push(day1, day2, day3);
      } else {
        day2 = exchangeOtherDay(day1);
        day3 = exchangeOtherDay(day2);
        appointmentList.push(day1, day2, day3);
      }
      return appointmentList;
    },
    //设置右侧时间小时和分的列表
    setTimeList(today){
      let timeList = [];
      let nowDate = new Date(); //当前日期
      let takeTime = this.properties.smallTakeTime;//设置的自提时间段 以及备货时间
      let startTime = takeTime.startTime;//设置的自提开始时间
      let endTime = takeTime.endTime;//设置的自提结束时间
      let stockUpTimes = takeTime.smallStockTime*60*1000;//备货时间分转换为毫秒
      let startTimes = new Date(nowDate.getFullYear()+"/"+(nowDate.getMonth() + 1)+"/"+nowDate.getDate()+" "+startTime+":00").getTime();//开始时间时间戳
      let endTimes = new Date(nowDate.getFullYear()+"/"+(nowDate.getMonth() + 1)+"/"+nowDate.getDate()+" "+endTime+":00").getTime();//结束时间时间戳
      let endTimeMinute = parseInt(endTime.substring(3,5));//结束时间的分 需要判断是否是“00”
      if(today){//如果今天是可以自提
        let newStartTimes = nowDate.getTime()+stockUpTimes;//当前时间+备货时间 时间戳
        if(newStartTimes<startTimes){//当前时间+备货时间 < 设置的开始时间
          //时间列表就从设置的开始时间列举
          for(let i=parseInt(startTime.substring(0,2));i<=parseInt(endTime.substring(0,2));i++){
            let minuteList = [];
            if(startTime==endTime){//开始和结束时间设置一样
              minuteList.push(startTime.substring(3,5));
            }else if(parseInt(startTime.substring(0,2))==parseInt(endTime.substring(0,2))){//开始和结束时间在同一个小时
              for(let j=parseInt(startTime.substring(3,5));j<=endTimeMinute;j++){
                minuteList.push(util.add0(j));
              }
            }else
            if(i==parseInt(startTime.substring(0,2))){//第一个小时 分列表从开始时间的分 比如从23-60
              for(let j=parseInt(startTime.substring(3,5));j<60;j++){
                minuteList.push(util.add0(j));
              }
            }else if(i == parseInt(endTime.substring(0,2))){//最后一个小时 分列表从0-59
              for(let j=0;j<=endTimeMinute;j++){
                minuteList.push(util.add0(j));
              }
            }else{//其他的小时 分列表都是从00-60
              for(let j=0;j<60;j++){
                minuteList.push(util.add0(j));
              }
            }
            timeList.push({
              hour:util.add0(i),
              minuteList
            });
          }
        }else{//当前时间+备货时间 > 设置的开始时间
          if(newStartTimes>endTimes){//当前时间+备货时间 > 设置的结束时间
            return []; //返回空列表 说明今天不能选择了
          }
          //时间列表就从设置的当前时间+备货时间列举
          let newStartTime = util.formatHen(newStartTimes);//"2020-08-27 10:45:59"
          for(let i=parseInt(newStartTime.substring(11,13));i<=parseInt(endTime.substring(0,2));i++){
            let minuteList = [];
            if(newStartTime.substring(11,16)==endTime){//开始和结束时间设置一样
              minuteList.push(newStartTime.substring(14,16));
            }else if(parseInt(newStartTime.substring(11,13))==parseInt(endTime.substring(0,2))){//开始和结束时间在同一个小时
              for(let j=parseInt(newStartTime.substring(14,16));j<=endTimeMinute;j++){
                minuteList.push(util.add0(j));
              }
            }else
            if(i==parseInt(newStartTime.substring(11,13))){//第一个小时 分列表从开始时间的分-60
              for(let j=parseInt(newStartTime.substring(14,16));j<60;j++){
                minuteList.push(util.add0(j));
              }
            }else if(i == parseInt(endTime.substring(0,2))){//最后一个小时 分列表从0-59
              for(let j=0;j<=endTimeMinute;j++){
                minuteList.push(util.add0(j));
              }
            }else{//其他的小时 分列表都是从00-60
              for(let j=0;j<60;j++){
                minuteList.push(util.add0(j));
              }
            }
            timeList.push({
              hour:util.add0(i),
              minuteList
            });
          }
        }
      }else{//如果不是今天
        //时间列表就从设置的开始时间列举
        for(let i=parseInt(startTime.substring(0,2));i<=parseInt(endTime.substring(0,2));i++){
          let minuteList = [];
          if(startTime==endTime){//开始和结束时间设置一样
            minuteList.push(startTime.substring(3,5));
          }else if(parseInt(startTime.substring(0,2))==parseInt(endTime.substring(0,2))){//开始和结束时间在同一个小时
            for(let j=parseInt(startTime.substring(3,5));j<=endTimeMinute;j++){
              minuteList.push(util.add0(j));
            }
          }else
          if(i==parseInt(startTime.substring(0,2))){//第一个小时 分列表从开始时间的分 比如从23-60
            for(let j=parseInt(startTime.substring(3,5));j<60;j++){
              minuteList.push(util.add0(j));
            }
          }else if(i == parseInt(endTime.substring(0,2))){//最后一个小时 分列表从0-59
            for(let j=0;j<=endTimeMinute;j++){
              minuteList.push(util.add0(j));
            }
          }else{//其他的小时 分列表都是从00-60
            for(let j=0;j<60;j++){
              minuteList.push(util.add0(j));
            }
          }
          timeList.push({
            hour:util.add0(i),
            minuteList
          });
        }
      }
      return timeList;
    }, 
    //年月日 选择
    chooseDate(e){
      let item = e.target.dataset.item;
      let selectTimes = this.data.selectTimes;
      selectTimes.date = item.ldate;
      selectTimes.dates = item.ldates;
      if(item.today){
        selectTimes.week = "今天";
      }else{
        selectTimes.week = item.lweekChina;
      }
      selectTimes.hour = item.timeList[0].hour;
      selectTimes.minute = item.timeList[0].minuteList[0];
      selectTimes.hourScrTop = 0;//小时的滚动高度
      selectTimes.minuteScrTop = 0;//分的滚动高度
      this.setData({
        selectTimes,
        hourList:item.timeList,
        minuteList:item.timeList[0].minuteList
      })
    },
    //选择小时
    chooseHour(e){
      let item = e.target.dataset.item;
      let selectTimes = this.data.selectTimes;
      selectTimes.hour = item.hour;
      selectTimes.minute = "";
      selectTimes.hourScrTop = e.target.offsetTop;//小时的滚动高度
      selectTimes.minuteScrTop = 0;//分的滚动高度
      this.setData({
        selectTimes,
        minuteList:item.minuteList
      })
    },
    //选择分
    chooseMinute(e){
      let item = e.target.dataset.item;
      let selectTimes = this.data.selectTimes;
      selectTimes.minute = item;
      selectTimes.minuteScrTop = e.target.offsetTop;//分的滚动高度
      this.setData({
        selectTimes,
      })
    },
    //取消
    cancel(){
      this.triggerEvent('pickupcancel')
    },
    //保存
    save(){
      if(!this.data.selectTimes.date){
        wx.showToast({
          title: '请选择自提时间',
          icon: 'none',
          duration:1800
        })
        return;
      }else if(!this.data.selectTimes.hour){
        wx.showToast({
          title: '请选择完整的自提时间',
          icon: 'none',
          duration:1800
        })
        return;
      }else if(!this.data.selectTimes.minute){
        wx.showToast({
          title: '请选择完整的自提时间',
          icon: 'none',
          duration:1800
        })
        return;
      }
      this.triggerEvent('pickupsave',{selectTimes:this.data.selectTimes})
    }
  }
})
