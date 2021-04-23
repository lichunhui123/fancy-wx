Component({
  /**
   * 组件的属性列表
   */
  properties: {
    discountList:Object
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
    //关闭弹窗
    close(){
      this.triggerEvent('closediscountcoupon')
    },
    //领券
    getCoupon(e){
      this.triggerEvent('getcoupon',{cardCode:e.target.dataset.cardcode})
    }
  }
})
