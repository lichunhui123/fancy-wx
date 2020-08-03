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
// 配送时间的进阶版
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
    ldate: nowDate.getMonth() + 1 + "月" + nowDate.getDate() + "日",
    ltime: nowDate.getTime(),
    lyear: nowDate.getFullYear(),
    lweek: nowDate.getDay() == 0 ? 7 : nowDate.getDay(),
    timeList: timeList,
    lweekChina: weekListChina[nowDate.getDay() - 1],
    today: true
  };
  let timelist1 = [];
  let index = timeList.indexOf(hour);
  if (index > -1) {
    timelist1 = timeList.slice(index + 1, timeList.length);
  } else if (hour > timeList[timeList.length - 1]) {
    timelist1 = [];
  } else {
    timelist1 = timeList;
  }
  day1.timeList = timelist1;
  let day2 = {};
  let day3 = {};
  if (weekList.length > 0) {
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
module.exports = {
  formatTime: formatTime,
  getNum,
  formatLocation,
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
  compareVersion
};
