// pages/water/mask/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

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
    //添加地址
    chooseAddress() {
      this.triggerEvent('maskcal')
      wx.navigateTo({
        url: '/pages/waterAddress/index',
      })
    },
    chooseAddresst() {
      this.triggerEvent('maskcal')
    },
  }
})
