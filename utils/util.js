let barcode = require('./barcode');
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
};

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
};
const getNum= (x) => {
  var f = parseFloat(x);
  if (isNaN(f)) {
    return false;
  }
  var s = f.toString();
  var rs = s.indexOf('.');
  if (rs < 0) {
    rs = s.length;
    s += '.';
  }
  while (s.length <= rs + 2) {
    s += '0';
  }
  var newPrice = s.split(".");
  if(newPrice[1].length>2){
    newPrice[1] = newPrice[1].substring(0,2);
  } 
  return newPrice.join(".");
};
function add0(m) { return m < 10 ? '0' + m : m }
function formatChine(shijianchuo) {
  //shijianchuo是整数，否则要parseInt转换
  var time = new Date(shijianchuo);
  var y = time.getFullYear();
  var m = time.getMonth() + 1;
  var d = time.getDate();
  var h = time.getHours();
  var mm = time.getMinutes();
  var s = time.getSeconds();
  return y + '年' + add0(m) + '月' + add0(d) + '日  ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
}
function formatHen(shijianchuo) {
  //shijianchuo是整数，否则要parseInt转换
  var time = new Date(shijianchuo);
  var y = time.getFullYear();
  var m = time.getMonth() + 1;
  var d = time.getDate();
  var h = time.getHours();
  var mm = time.getMinutes();
  var s = time.getSeconds();
  return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
}
//校验只能输入中文和英文
function isGbOrEn(value) {
  var regu = "^[a-zA-Z\u4e00-\u9fa5]+$";
  var re = new RegExp(regu);
  if (value.search(re) != -1) {
    return true;
  } else {
    return false;
  }
}
//手机号校验
function checkPhone(phone) {
  if (!(/^1[3456789]\d{9}$/.test(phone))) {
    return false;
  }else{
    return true
  }
}
//格式化经纬度
const formatLocation = (longitude, latitude) => {
  if (typeof longitude === 'string' && typeof latitude === 'string') {
    longitude = parseFloat(longitude);
    latitude = parseFloat(latitude);
  }

  longitude = longitude.toFixed(2);
  latitude = latitude.toFixed(2);

  return {
    longitude: longitude.toString().split('.'),
    latitude: latitude.toString().split('.')
  }
};
var formitTime = function (time, length) {
  if(time){
    let timet = time.replace(/-/g, '.');
    return timet.substring(0, length - 1);
  }
};
//获取时间戳
const formatTimestamp = (time) => {
  return new Date(time.substring(0, 19).replace(/-/g,"/")).getTime();
};
//宽高转换
const convert_length = (length) => {
  return Math.round(wx.getSystemInfoSync().windowWidth * length / 750);
};
// 把数字转换成条形码
const toBarcode = (id, code, width, height) => {
  barcode.code128(wx.createCanvasContext(id), code, convert_length(width), convert_length(height))
};
// 水管家订单配送时间可选列表
const getAppointTime = (timeList, weekList) => {
  let nowDate = new Date(); //当前日期
  let hour = nowDate.getHours(); //当前日期的时钟
  let weekListChina = [
    "周一",
    "周二",
    "周三",
    "周四",
    "周五",
    "周六",
    "周日"
  ];
  let appointmentList = [];
  function exchangeOtherDay(day) {
    let otherDay = {};
    otherDay.ltime = day.ltime + 86400000;
    otherDay.lyear = new Date(otherDay.ltime).getFullYear();
    otherDay.ldate =
      new Date(otherDay.ltime).getMonth() +
      1 +
      "月" +
      new Date(otherDay.ltime).getDate() +
      "日";
    otherDay.lweek = new Date(otherDay.ltime).getDay();
    if (otherDay.lweek == 0) {
      otherDay.lweek = 7;
      otherDay.lweekChina = weekListChina[weekListChina.length - 1];
    } else {
      otherDay.lweekChina = weekListChina[otherDay.lweek - 1];
    }
    otherDay.timeList = timeList;
    otherDay.today = false;
    return otherDay;
  }
  let day1 = {
    ldate: nowDate.getMonth() + 1 + "月" + nowDate.getDate() + "日",//当前时间 "8月27日"
    ltime: nowDate.getTime(),//当前时间戳
    lyear: nowDate.getFullYear(),//当前时间 "2020年"
    lweek: nowDate.getDay() == 0 ? 7 : nowDate.getDay(),//今天是周几 1，2，3，4，5，6，7
    timeList: timeList,//['21','22','23','24'] 几点组成的数组
    lweekChina: weekListChina[(nowDate.getDay() == 0 ? 7 : nowDate.getDay()) - 1],//今天是周几 转中文 周几
    today: true//是否是今天
  };
  let timelist1 = [];
  let index = timeList.indexOf(hour);
  if (index > -1) {
    timelist1 = timeList.slice(index + 1, timeList.length);//截取今天已经过去的时间
  } else if (hour > timeList[timeList.length - 1]) {//如果当前时间已经大于所有的开放平台设置的配送时间时
    timelist1 = [];
  } else {
    timelist1 = timeList;
  }
  day1.timeList = timelist1;
  let day2 = {};
  let day3 = {};
  if (weekList.length > 0) {//[0,0,0,1,1,1,0] => [周一，周二 ... 周日]
    while (weekList[day1.lweek - 1] == 0) {
      //[1,1,1,1,1,0,0]
      day1.today = false;
      day1 = exchangeOtherDay(day1);
    }
    day2 = exchangeOtherDay(day1);
    while (weekList[day2.lweek - 1] == 0) {
      day2 = exchangeOtherDay(day2);
    }
    day3 = exchangeOtherDay(day2);
    while (weekList[day3.lweek - 1] == 0) {
      day3 = exchangeOtherDay(day3);
    }
    appointmentList.push(day1, day2, day3);
  } else {
    day2 = exchangeOtherDay(day1);
    day3 = exchangeOtherDay(day2);
    appointmentList.push(day1, day2, day3);
  }
  return appointmentList;
};
//比较微信的版本 v1>v2 返回1
const compareVersion = (v1, v2) => {
  v1 = v1.split('.');
  v2 = v2.split('.');
  let len = Math.max(v1.length, v2.length);
  while(v1.length <len) {
    v1.push('0')
  }
  while(v2.length <len) {
    v2.push('0')
  }
  for(let i = 0; i<len; i++) {
    let num1 = parseInt(v1[i]);
    let num2 = parseInt(v2[i]);
    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
};
// 获取云店订单的配送时间可选列表
const getCloudDeliveryTime = (obj)=>{
  let operateWeek = obj.smallOperateWeek?obj.smallOperateWeek.split(","):[];//配送工作日 周 [1,0,1,1,1,0,0]
  let nowDate = new Date(); //当前日期
  let weekListChina = ["周一","周二","周三","周四","周五","周六","周日"];
  let appointmentList = [];
  function exchangeOtherDay(day) {
    let otherDay = {};
    otherDay.ltime = day.ltime + 86400000;
    let ltime = new Date(otherDay.ltime);
    otherDay.lyear = ltime.getFullYear();
    otherDay.ldate =
      ltime.getFullYear() +
      "年" +
      add0(ltime.getMonth() + 1) +
      "月" +
      add0(ltime.getDate()) +
      "日";
    otherDay.ldates = ltime.getFullYear() +
      "-" +
      add0(ltime.getMonth() + 1) +
      "-" +
      add0(ltime.getDate());
    otherDay.lmonthdate = add0(ltime.getMonth() + 1) + "-" + add0(ltime.getDate()); 
    otherDay.lweek = ltime.getDay();
    if (otherDay.lweek == 0) {
      otherDay.lweek = 7;
      otherDay.lweekChina = weekListChina[weekListChina.length - 1];
    } else {
      otherDay.lweekChina = weekListChina[otherDay.lweek - 1];
    }
    otherDay.timeList = setTimeList(false,ltime);//先设置今天的小时和分钟的选择列表;
    otherDay.today = false;
    return otherDay;
  }
  //设置时间列表
  function setTimeList(today,ltime){
    let timeList = [];
    let nowDate = new Date(); //当前日期
    let smallOperateTime = obj.smallOperateTime;//设置的配送时间段
    let startTime = smallOperateTime?JSON.parse(smallOperateTime).startTime:"";//设置的自提开始时间
    let endTime = smallOperateTime?JSON.parse(smallOperateTime).endTime:"";//设置的自提结束时间
    let stockUpTimes = obj.smallDelStockTime*60*1000;//备货时间分转换为毫秒  todo 需要替换成配送的备货时间
    let countKmDelTime = obj.smallKmDelTime*60*1000*Math.ceil(obj.distance/1000);//总距离配送时长 1公里配送时长*距离
    let countTime = nowDate.getTime()+stockUpTimes+countKmDelTime;//总时间 = 当前时间+备货时间+总距离配送时长
    let interval = 30*60*1000;//间隔半个小时
    if(today){//如果今天是可以配送
      let startTimes = new Date(nowDate.getFullYear()+"/"+(nowDate.getMonth() + 1)+"/"+nowDate.getDate()+" "+startTime+":00").getTime();//开始时间时间戳
      let endTimes = new Date(nowDate.getFullYear()+"/"+(nowDate.getMonth() + 1)+"/"+nowDate.getDate()+" "+endTime+":00").getTime();//结束时间时间戳
      if(countTime>endTimes){//总时间大于门店的运营结束时间
        timeList=[];//今天不能配送了
      }else{//总时间小于门店的运营结束时间
        let todayEndTimes = new Date(nowDate.getFullYear()+"/"+(nowDate.getMonth() + 1)+"/"+nowDate.getDate()+" "+"23:59:59").getTime();//当天晚上23：59：59的时间戳
        let time1 = 0;
        if(countTime>startTimes){//总时间大于开始时间
          time1 = countTime;
        }else{
          time1 = startTimes+stockUpTimes+countKmDelTime;
        }
        for(let times=time1;times<endTimes;times+=interval){
          let sTimes = new Date(times);
          let eTimes = new Date(times+interval);
          if(times+interval>todayEndTimes){//当时间大于当天23:59:59
            eTimes = new Date(endTimes);
          }
          timeList.push({
            startTime:add0(sTimes.getHours())+":"+add0(sTimes.getMinutes()),//可选时间段的开始时间 "10:00"
            endTime:add0(eTimes.getHours())+":"+add0(eTimes.getMinutes()),//可选时间段的结束时间 "10:30"
          })
        }
      }
    }else{//不是今天
      let startTimes = new Date(ltime.getFullYear()+"/"+(ltime.getMonth() + 1)+"/"+ltime.getDate()+" "+startTime+":00").getTime();//开始时间时间戳
      let endTimes = new Date(ltime.getFullYear()+"/"+(ltime.getMonth() + 1)+"/"+ltime.getDate()+" "+endTime+":00").getTime();//结束时间时间戳
      let otherEndTimes =  new Date(ltime.getFullYear()+"/"+(ltime.getMonth() + 1)+"/"+ltime.getDate()+" "+"23:59:59").getTime();//晚上23：59：59的时间戳
      for(let times=startTimes+stockUpTimes+countKmDelTime;times<endTimes;times+=interval){
        let sTimes = new Date(times);
        let eTimes = new Date(times+interval);
        if(times+interval>otherEndTimes){//当时间大于当天23:59:59
          eTimes = new Date(endTimes);
        }
        timeList.push({
          startTime:add0(sTimes.getHours())+":"+add0(sTimes.getMinutes()),//可选时间段的开始时间 "10:00"
          endTime:add0(eTimes.getHours())+":"+add0(eTimes.getMinutes()),//可选时间段的结束时间 "10:30"
        })
      }
    }
    return timeList;
  }
  let day1 = {
    ldate: nowDate.getFullYear() + "年" +add0(nowDate.getMonth() + 1) + "月" + add0(nowDate.getDate()) + "日",//"2020年08月27日"
    ldates: nowDate.getFullYear() + "-" +add0(nowDate.getMonth() + 1) + "-" + add0(nowDate.getDate()),//"2020-08-27"
    lmonthdate: add0(nowDate.getMonth() + 1) + "-" + add0(nowDate.getDate()),//"01-18"
    ltime: nowDate.getTime(),//当前时间戳
    lyear: nowDate.getFullYear(),//当前时间 "2020"
    lweek: nowDate.getDay() == 0 ? 7 : nowDate.getDay(),//今天是周几 1，2，3，4，5，6，7
    timeList: [],//[] 时间段组成的数组
    lweekChina: weekListChina[(nowDate.getDay() == 0 ? 7 : nowDate.getDay()) - 1],//今天是周几 转中文 周几
    today: true//是否是今天
  };
  let timeList = setTimeList(true);
  if(timeList.length==0){//返回空列表 说明当前时间+备货时间>设置的结束时间 今天不能选择了
    day1.today = false;
    day1 = exchangeOtherDay(day1);
  }else{
    day1.timeList = timeList;//先设置今天的小时和分钟的选择列表
  }
  let day2 = {};
  let day3 = {};
  if (operateWeek.length > 0) {//[0,0,0,1,1,1,0] => [周一，周二 ... 周日]
    while (operateWeek[day1.lweek - 1] == 0) {
      day1.today = false;
      day1 = exchangeOtherDay(day1);
    }
    day2 = exchangeOtherDay(day1);
    while (operateWeek[day2.lweek - 1] == 0) {
      day2 = exchangeOtherDay(day2);
    }
    day3 = exchangeOtherDay(day2);
    while (operateWeek[day3.lweek - 1] == 0) {
      day3 = exchangeOtherDay(day3);
    }
    appointmentList.push(day1, day2, day3);
  } else {
    day2 = exchangeOtherDay(day1);
    day3 = exchangeOtherDay(day2);
    appointmentList.push(day1, day2, day3);
  }
  return appointmentList;
}
// 不能输入特殊字符的正则
const limitInput = (str) => {
  var pattern = new RegExp("[ `~!@#$%^&*()-+=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
  var newStr = "";
  for (var i = 0; i < str.length; i++) {
    newStr = newStr + str.substr(i, 1).replace(pattern, '');
  }
  newStr.replace(/\s+/g, '');
  return newStr;
}
//只能输入中文或英文或数字
const chOrEnOrNumInput = (str)=>{
  let newStr=str.replace(/[^\a-z\A-Z\w\u4e00-\u9fa5]/g, '');
  return newStr;
}
//获取门店信息然后切换当前门店以及曾用门店
const changeCurrentCloudShop = (branchId,noNeed)=>{
  let currentCloud = wx.getStorageSync('currentCloudShop');
  wx.setStorageSync('currentCloudShop', {siteId:branchId});
  wx.setStorageSync('historyCloudShop', currentCloud);
  if(!noNeed){
    wx.navigateTo({
      url: '/pages/cloudStoreHome/index',
    })
  }
}
module.exports = {
  formatTime: formatTime,
  getNum,
  formatLocation,
  add0,
  formatChine,
  formitTime,
  formatTimestamp,
  toBarcode,
  convert_length,
  formatHen,
  formatNumber,
  isGbOrEn,
  checkPhone,
  getAppointTime,
  compareVersion,
  getCloudDeliveryTime,
  limitInput,
  chOrEnOrNumInput,
  changeCurrentCloudShop
};
