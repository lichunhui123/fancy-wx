// common/nyz_area_picker/nyz_area_picker.js
const service = require('../../service/index.js');
var index = [0, 0, 0]
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {    //控制area_select显示隐藏
      type: Boolean,
      value: false
    },
    maskShow: {    //是否显示蒙层
      type: Boolean,
      value: true
    }
  },
  lifetimes: {
    ready() {
      this.setData({
        value: [0, 0, 0]
      })
      index = [0, 0, 0]
      this.getcity()
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    arrdata:[],
    provinces: [],
    citys: [],
    areas: [],
    value: [0, 0, 0],
    province: '',
    city: '',
    area: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getcity(){
      service.getcity().then((res) => {
        if (res.data.result == 200) {
          var arrdata = res.data.data
          console.log(arrdata)
          var provinces = [];
          for (var i = 0; i < arrdata.length; i++) {
            provinces.push(arrdata[i].name);
          }
          var citys = [];
          for (var i = 0; i < arrdata[index[0]].area.length; i++) {
            citys.push(arrdata[index[0]].area[i].name);
          }
          var areas = [];
          for (var i = 0; i < arrdata[index[0]].area[index[1]].area.length; i++) {
            areas.push(arrdata[index[0]].area[index[1]].area[i].name)
          }
          this.setData({
            arrdata,
            provinces: provinces,
            citys: citys,
            areas: areas,
            province: provinces[this.data.value[0]],
            city:citys[this.data.value[1]],
            area:areas[this.data.value[2]]
          })
        }
      })
    },
    handleNYZAreaChange: function (e) {
      var that = this;
      var value = e.detail.value;
      /**
       * 滚动的是省
       * 省改变 市、区都不变
       */
      if (index[0] != value[0]) {
        let citys = [];
        for (var i = 0; i < this.data.arrdata[value[0]].area.length; i++) {
          citys.push(this.data.arrdata[value[0]].area[i].name);
        }
        let areas = [];
        for (var i = 0; i < this.data.arrdata[value[0]].area[0].area.length; i++) {
          areas.push(this.data.arrdata[value[0]].area[0].area[i].name)
        }
        index = [value[0], 0, 0]
        let selectCitys = citys;
        let selectAreas = areas;
        that.setData({
          citys: selectCitys,
          areas: selectAreas,
          value: [index[0], 0, 0],
          province: this.data.provinces[index[0]],
          city: selectCitys[0],
          area: selectAreas[0]
        })
      } else if (index[1] != value[1]) {
        /**
         * 市改变了 省不变 区变
         */
        let citys = [];
        for (var i = 0; i < this.data.arrdata[value[0]].area.length; i++) {
          citys.push(this.data.arrdata[value[0]].area[i].name);
        }
        let areas = [];
        for (var i = 0; i < this.data.arrdata[value[0]].area[value[1]].area.length; i++) {
          areas.push(this.data.arrdata[value[0]].area[value[1]].area[i].name)
        }
        index = [value[0], value[1], 0]
        let selectCitys = citys;
        let selectAreas = areas;
        that.setData({
          citys: selectCitys,
          areas: selectAreas,
          value: [index[0], index[1], 0],
          province: this.data.provinces[index[0]],
          city: selectCitys[index[1]],
          area: selectAreas[0]
        })
      } else if (index[2] != value[2]) {
        /**
         * 区改变了
         */
        let citys = [];
        for (var i = 0; i < this.data.arrdata[value[0]].area.length; i++) {
          citys.push(this.data.arrdata[value[0]].area[i].name);
        }
        let areas = [];
        for (var i = 0; i < this.data.arrdata[value[0]].area[value[1]].area.length; i++) {
          areas.push(this.data.arrdata[value[0]].area[value[1]].area[i].name)
        }
        index = [value[0], value[1], value[2]]
        let selectCitys = citys;
        let selectAreas = areas;
        that.setData({
          citys: selectCitys,
          areas: selectAreas,
          value: [index[0], index[1], index[2]],
          province: this.data.provinces[index[0]],
          city: selectCitys[index[1]],
          area: selectAreas[index[2]]
        })
      }
    },
    /**
     * 确定按钮的点击事件
     */
    handleNYZAreaSelect: function (e) {
      //console.log("e:" + JSON.stringify(e));
      var myEventDetail = e; // detail对象，提供给事件监听函数
      var myEventOption = {}; // 触发事件的选项
      this.triggerEvent('sureSelectArea', myEventDetail, myEventOption)
    },
    /**
     * 取消按钮的点击事件
     */
    handleNYZAreaCancle: function (e) {
      var that = this;
      // this.setData({
      //   value:[0,0,0]
      // })
      // index=[0,0,0]
      // this.getcity()
      // console.log(this.data.value,index)
      console.log("e:" + JSON.stringify(e))
      this.triggerEvent('cancelbutton')
      that.setData({
        show: false
      })
    },
    //蒙层点击
    maskClick() {
      this.triggerEvent('cancelbutton')
      this.setData({
        show: false
      })
    }
  }
})
