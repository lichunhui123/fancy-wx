const app = getApp();
const service = require('../../service/index.js');
Component({
  /**
   * 页面的初始数据
   */
  properties: {
    growth: {//成长值
      type: Number,
      value: ''
    },
    credits: {//会员积分
      type: Number,
      value: ''
    }
  },
  data: {
    growth:0,
    credits:0,
    animationData: {}
  },
  attached(){

  },
  ready(){
    this.setData({
      growth:this.properties.growth,
      credits:this.properties.credits
    });
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    });
    this.animation = animation;
    animation.left(0).step();
    this.setData({
      animationData:animation.export()
    });
    let t=this;
    setTimeout(()=>{
      animation.left(-200).step();
      t.setData({
        animationData:animation.export()
      });
    },1200)
  },
  /**
   * 组件的方法列表
   */
  methods: {

  }
});