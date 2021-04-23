Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //显示退款原因弹层
    show:{
      type: Boolean,
      value: {}
    },
    //选择的原因ID
    reasonId:{
      type: String,
      value: "1"
    },
  },
  attached() {},
  ready(){
    let reasonId = this.properties.reasonId||"1";
    this.setData({reasonId})
  },
  /**
   * 组件的初始数据
   */
  data: {
    reasonId:"1",
    reason:"商品降价",
    reasonList:[
      {
        text:"商品降价",
        select:true,
        id:1
      },
      {
        text:"不想要了",
        select:false,
        id:2
      },
      {
        text:"商品信息填写错误",
        select:false,
        id:3
      },
      {
        text:"配送时间问题",
        select:false,
        id:4
      },
      {
        text:"其他",
        select:false,
        id:5
      }
    ],
  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    movetan(){

    },
    reasonClick(e) {
      let id=e.currentTarget.dataset['id'];
      let reasonId = "";
      let reason = "";
      this.data.reasonList.map((item)=>{
        if(item.id==id){
          reasonId = item.id;
          reason = item.text;
          item.select=true;
        }else{
          item.select=false;
        }
      });
      this.setData({
        reasonList:this.data.reasonList,
        reasonId,
        reason,
      });
    },
    sure(){
      let t=this;
      if(!t.data.reasonId){
        wx.showToast({
          title: "请选择退款原因",
          icon: 'none',
          duration: 2000
        });
        return;
      }
      this.triggerEvent('sure',
          {
            reason:t.data.reason,
            reasonId:t.data.reasonId
          }
        )
    },
  }
});
