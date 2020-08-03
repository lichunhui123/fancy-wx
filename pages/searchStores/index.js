const service = require('../../service/index.js');
Page({
    data: {
        searchValue:"",
        pageNo:1,
        pageCount:10,
        storeList:null,
        latitude:'',//维度
        longitude:'',//经度
        noData:false,//没有数据
        noMore:false,//没有更多了
    },
    searchAction(){
        let t=this;
        wx.showLoading({
            title: '加载中',
        });
        this.setData({
            loading:true,
        });
        service.getSearchStore({
            pageCount:t.data.pageCount,
            pageNo:t.data.pageNo,
            searchKey:t.data.searchValue,
            serviceRangeDto:{x:t.data.longitude,y:t.data.latitude}
        }).then((res)=>{
            wx.hideLoading();
            t.setData({
                loading: false
            });
            //console.log(res);
            let storeList;
            let data = res.data.data; 
            let noData = false;
            if(t.data.pageNo==1){
                storeList = data;
                if(!data){
                    noData = true;
                }
            }else{
                if(data==null||(data&&data.length<t.data.pageCount)){//请求没有返回10条数据
                    t.setData({
                        noMore: true
                    });
                }
                if(res.data.data){
                    storeList = t.data.storeList.concat(res.data.data);
                }
            }
            t.setData({
                storeList:storeList,
                noData
            })
        })
    },
    //搜索
    getStore(e){
        let t=this;
        this.setData({
            searchValue:e.detail.value
        });
        clearTimeout(t.timer);
        if(!e.detail.value){
            t.clearInput();
            return;
        }else{
            t.timer = setTimeout(()=>{
                t.searchAction();//后端请求
            },300) //延迟时间
        }
    },
    //点击列表回到地图页
    goNearbyStores(e){
        let t=this;
        let item=JSON.stringify(e.currentTarget.dataset.item);
        wx.redirectTo({
            url:"../nearbyStores/index?store="+item+"&latitude="+t.data.latitude+"&longitude="+t.data.longitude
        })
    },
    //清空输入框
    clearInput(){
        this.setData({
            searchValue:"",
            storeList:null,
            pageNo:1,
            noData:false,
            noMore:false
        });
    },
    // 下拉刷新
    onPullDownRefresh() {

    },
    // 停止刷新方法
    stopPullDownRefresh() {

    },
    // 上拉加载更多
    onReachBottom() {
        //console.log(this.data.noMore);
        if(this.data.noMore){
            return;
        }
        let pageNo = ++this.data.pageNo;
        this.setData({
            pageNo:pageNo
        });
        this.searchAction();
    },
    // 微信授权定位
    getUserLocation: function () {
        let that = this;
        wx.getSetting({
            success: (res) => {
                // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
                // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
                // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
                if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
                    wx.showModal({
                        title: '请求授权当前位置',
                        content: '需要获取您的地理位置，请确认授权',
                        success: function (res) {
                            if (res.cancel) {
                                wx.showToast({
                                    title: '拒绝授权',
                                    icon: 'none',
                                    duration: 1000
                                })
                            } else if (res.confirm) {
                                wx.openSetting({
                                    success: function (dataAu) {
                                        console.log(dataAu);
                                        if (dataAu.authSetting["scope.userLocation"] == true) {
                                            wx.showToast({
                                                title: '授权成功',
                                                icon: 'success',
                                                duration: 1000
                                            });
                                            //再次授权，调用wx.getLocation的API
                                            that.getLocation();
                                        } else {
                                            wx.showToast({
                                                title: '授权失败',
                                                icon: 'none',
                                                duration: 1000
                                            })
                                        }
                                    },
                                    fail() {
                                        console.log("失败")
                                    }
                                })
                            }
                        }
                    })
                } else if (res.authSetting['scope.userLocation'] == undefined) {
                    //调用wx.getLocation的API
                    that.getLocation();
                } else {
                    //调用wx.getLocation的API
                    that.getLocation();
                }
            }
        })
    },
    // 微信获得经纬度
    getLocation: function () {
        let that = this;
        wx.getLocation({
            type: 'gcj02',
            success: function (res) {
                let latitude = res.latitude;
                let longitude = res.longitude;
                that.setData({latitude, longitude});
            },
            fail: function (res) {
                wx.showModal({
                    title: '提示',
                    content: '系统无法获得您的定位，请在手机系统中进行设置',
                    showCancel:false,
                    success(res){
                        if (res.confirm) {
                            wx.switchTab({
                                url:"/pages/home/index"
                            })
                        }
                    }
                })
            }
        })
    },
    // 首次加载
    onLoad: function(options){
        console.log(options);
        if(options){
            this.setData({
                longitude:options.longitude,
                latitude:options.latitude,
            })
        }
    },
    onShow() {
      wx.hideShareMenu()
        this.getUserLocation();
    },
});