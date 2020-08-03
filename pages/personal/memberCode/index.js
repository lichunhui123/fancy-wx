// pages/home/memberCode/index.js
const barcode = require("../../../utils/barcode.js");
const util = require("../../../utils/util.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    receiptBarCode:{
      type:String,
      value:{}
    }
  },
  lifetimes:{
    ready() {
      console.log(11,util);
      let wid = util.convert_length(380);
      let hei = util.convert_length(120);
      barcode.code128(wx.createCanvasContext('barcode',this), this.properties.receiptBarCode,wid ,hei )
    }, 
  },
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    offTop(){
      this.triggerEvent('cancel')
    }
  }
})
