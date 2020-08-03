Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show:{
      type: Boolean,
      value: {}
    },
    expressData:{//快递数据
      type: Object,
      value: {}
    },
    expressCompany:{//已选快递
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
    movetan(){
      
    },
    //快递选择点击
    expressClick(e){
      let carrierId = e.target.dataset.carrierId;//快递的id
      let data = this.properties.expressData;
      let expressCompany=null;
      data.forEach((item)=>{
        if(item.carrierId==carrierId){
          expressCompany=item;
        }
      });
      this.triggerEvent('sure',expressCompany)
    },
    close(){
      var myEventDetail = {} ;// detail对象，提供给事件监听函数
      var myEventOption = {} ;// 触发事件的选项
      this.triggerEvent('close', myEventDetail, myEventOption)
    }
  }
});
