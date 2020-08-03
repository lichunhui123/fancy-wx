Component({
  /**
   * 组件的属性列表
   */
  properties: {
    confirmConfig:{
      type: Object,
      value: {}
    },
  },
  attached() {},
  ready(){},
  /**
   * 组件的初始数据
   */
  data: {

  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    sureClick(){
      var myEventDetail = {} ;// detail对象，提供给事件监听函数
      var myEventOption = {} ;// 触发事件的选项
      this.triggerEvent('sureClick', myEventDetail, myEventOption)
    }
  }
});
