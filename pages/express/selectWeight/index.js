Component({
  /**
   * 组件的属性列表
   */
  properties: {
    weight:{
      type: String,
      value: {}
    },
  },
  attached() {},
  ready(){
    this.setData({weightNum:this.properties.weight})
  },
  /**
   * 组件的初始数据
   */
  data: {
    weightNum:1,
  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    movetan(){

    },
    //确定
    sure(){
      this.triggerEvent('sure',{weight:this.data.weightNum})
    },
    //取消
    cancel(){
      this.triggerEvent('cancel')
    },
    //减重量
    minus(){
      if(this.data.weightNum==1){
        return;
      }
      let weightNum=--this.data.weightNum;
      this.setData({weightNum})
    },
    //加重量
    plus(){
      if(this.data.weightNum==30){
        return;
      }
      let weightNum=++this.data.weightNum;
      this.setData({weightNum});
    }
  }
});
