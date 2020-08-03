Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //显示体积弹层
    show:{
      type: Boolean,
      value: {}
    },
    //体积 长宽高
    volume:{
      type: Object,
      value: {}
    },
  },
  attached() {},
  ready(){
    let volume = this.properties.volume;
    this.setData({
      long:volume.long,
      width:volume.width,
      height:volume.height,
    })
  },
  /**
   * 组件的初始数据
   */
  data: {
    long:"",
    width:"",
    height:"",
  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    movetan(){

    },
    //长宽高输入事件
    changeInput(e){
      let max=e.target.dataset.max;
      let value=e.target.dataset.value;
      e.detail.value = parseInt(e.detail.value.replace(/[^0-9.]+/, ''));
      if(parseInt(e.detail.value)>parseInt(max)){
        wx.showToast({
          title: "尺寸不合规，请重新输入",
          icon: 'none',
          duration: 2000
        });
        e.detail.value=max;
      }
      if(value=="long"){
        this.setData({
          long:e.detail.value
        })
      }
      if(value=="width"){
        this.setData({
          width:e.detail.value
        })
      }
      if(value=="height"){
        this.setData({
          height:e.detail.value
        })
      }
    },
    sure(){
      let t=this;
      if(!t.data.long){
        wx.showToast({
          title: "请填写长度",
          icon: 'none',
          duration: 2000
        });
        return;
      }
      if(!t.data.width){
        wx.showToast({
          title: "请填写宽度",
          icon: 'none',
          duration: 2000
        });
        return;
      }
      if(!t.data.height){
        wx.showToast({
          title: "请填写高度",
          icon: 'none',
          duration: 2000
        });
        return;
      }
      this.triggerEvent('sure',
          {
            long:t.data.long,
            width:t.data.width,
            height:t.data.height,
          }
        )
    },
    close(){
      let volume = this.properties.volume;
      this.setData({
        long:volume.long,
        width:volume.width,
        height:volume.height,
      })
      var myEventDetail = {} ;// detail对象，提供给事件监听函数
      var myEventOption = {} ;// 触发事件的选项
      this.triggerEvent('close', myEventDetail, myEventOption)
    }
  }
});
