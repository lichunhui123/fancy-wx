// component/createPosterImage.js
const service = require('../../service/index.js'); 
Component({
  lifetimes: {
    attached: function() {
      this.showShare = this.properties.showShare;
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的属性列表
   */
  properties: {
    postUrl:{//获取小程序码的接口
      type: String,
      value:""
    },
    showShare:{
      type: Boolean,
      value:false
    },
    formdata: {//获取小程序码的接口入参
      type: Object,
      value: {}
    },
    goodsInfo:{//商品信息
      type: Object,
      value:{}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    defalutPostUrl:'getwxacodeunlimit',//获取小程序码的接口
    showShare:false,//显示分享弹窗
    showPoster:false,//显示海报图弹窗
    painting:{},
    wxCode:"",//小程序页面的小程序码 base64
    posterImage:"",//海报canvas图
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //取消分享
    cancelShare(){
      //已经授权了 成功回调
      this.triggerEvent('cancelShare');
    },
    //点击取消海报弹窗
    closePoster(){
      this.cancelShare();
      this.setData({
        showPoster:false
      });
    },
    cancelBubble(){
      return false;
    },
    //弹出海报弹窗
    getPoster(){
      let that = this;
      this.cancelShare();
      if(this.data.posterImage){
        this.setData({
          showPoster:true,
        })
        return;
      }
      wx.showLoading({
        title: '绘制分享图片中',
        mask: true
      });
      if(this.data.wxCode){
        this.createPosterImage();
      }else{
        let postUrl = this.properties.postUrl?this.properties.postUrl:this.data.defalutPostUrl;//获取小程序码的接口请求
        service[postUrl](that.properties.formdata).then(res=>{
          if(res.data.result==200){
            this.setData({
              wxCode:this.properties.postUrl?res.data.data.getwxacodeunlimit:res.data.data
            },()=>{
              this.createPosterImage();
            });
          }else{
            wx.hideLoading();
            wx.showToast({
              title: '当前网络状态较差，请稍后重试',
              icon: 'none',
              duration: 2000
            });
          }
        }).catch(()=>{
          wx.showToast({
            title: '当前网络状态较差，请稍后重试',
            icon: 'none',
            duration: 2000
          });
          wx.hideLoading();
        });
      }
    },
    //生成海报图片
    createPosterImage(){
      let that = this;
      let wxCode = this.data.wxCode;//小程序码 base64的格式
      //声明文件系统
      const fs = wx.getFileSystemManager();
      //随机定义路径名称
      let times = new Date().getTime();
      let codeimg = wx.env.USER_DATA_PATH + '/' + times + '.png';

      //将base64图片写入 转成水机图片
      fs.writeFile({
        filePath: codeimg,
        data: wxCode.slice(22),
        encoding: 'base64',
        success: () => {
          //写入成功了的话，新的图片路径就能用了
          let priceLeft = "174";//销售价小于10
          let { salePrice,urlImg,goodsName,price,siteName } = that.properties.goodsInfo;
          if(salePrice<10){//销售价小于10
            priceLeft = "174";
          }else if(salePrice<100&&salePrice>=10){//销售价大于10，小于等于100
            priceLeft = "200";
          }else if(salePrice<1000&&salePrice>=100){
            priceLeft = "230";
          }else if(salePrice>=1000){
            priceLeft = "260";
          }
          let siteNameLeft = 0;
          if(siteName){
            let width = siteName.length*22;
            siteNameLeft = width>556?0:(556-width)/2;//门店的left
          }
          this.setData({
            showPoster:true,
            painting:{//绘制海报的配置参数
              width: 556,
              height: 772,
              views: [
                {
                  type: 'rect',
                  background:"#FFFFFF",//海报背景
                  width: 556,
                  height: 772,
                  left:0,
                  top:0
                },
                {
                  type: 'text',
                  content: '指尖生活派',//海报的title
                  fontSize: 32,
                  color: '#333333',
                  textAlign: 'left',
                  top: 40,
                  left: 198,
                  bolder: false
                },
                siteName?{
                  type: 'text',
                  content: siteName,//海报的title
                  fontSize: 22,
                  color: '#333333',
                  textAlign: 'left',
                  top: 82,
                  left: siteNameLeft,
                  bolder: false,
                  width: 556,
                  MaxLineNumber: 1,
                  breakWord: true,
                }:{},
                {
                  type: 'image',
                  url: urlImg,//详情图片
                  top: 112,
                  left: 40,
                  width: 476,
                  height: 476
                },
                {
                  type: 'text',
                  content: goodsName,//商品的名称
                  fontSize: 28,
                  color: '#333333',
                  textAlign: 'left',
                  top: 628,
                  left: 30,
                  width: 336,
                  MaxLineNumber: 1,
                  breakWord: true,
                  bolder: false
                },
                {
                  type: 'text',
                  content: '￥',//售价的符号
                  fontSize: 32,
                  color: '#F2922F',
                  textAlign: 'left',
                  top: 692,
                  left: 28
                },
                {
                  type: 'text',
                  content: salePrice,//销售价
                  fontSize: 52,
                  color: '#F2922F',
                  textAlign: 'left',
                  top: 676,
                  left: 56,
                  bolder: true
                },
                price?{
                  type: 'text',
                  content: `￥${price}`,//原价或者友商价
                  fontSize: 24,
                  color: '#999999',
                  textAlign: 'left',
                  top: 698,
                  left: priceLeft,
                  textDecoration: 'line-through'
                }:{},
                {
                  type: 'image',
                  url: codeimg,//当前页面的小程序码
                  top: 618,
                  left: 402,
                  width: 124,
                  height: 124
                },
              ]
            }
          });
          
        }
      });
    },
    //分享海报
    posterGetImage (event) {
      wx.hideLoading()
      const { tempFilePath } = event.detail
      this.setData({
        posterImage: tempFilePath
      })
      wx.hideLoading();
    },
    //海报保存
    posterSave(){
      wx.saveImageToPhotosAlbum({
        filePath: this.data.posterImage,
        success (res) {
          wx.showToast({
            title: '保存图片成功',
            icon: 'success',
            duration: 2000
          })
        }
      })
    }
  }
})
