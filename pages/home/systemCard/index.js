// pages/home/systemCard/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    coupondata:Object,
    mecName:String,
  },
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
     
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
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
    //关闭系统卡券弹框
    closeBtn(){
      this.triggerEvent('cancel')
    },
    //to云店
    goSmallShopPage(){
      this.triggerEvent('goCloudShop')
    },
  }
})
