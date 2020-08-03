const service = require('../../service/index.js');
Page({
    data: {
        mapCtx:null,//MapContext 实例
        longitude: 0,//经度
        latitude: 0,//维度
        //地图上的标记
        markers: [
            /*{
                iconPath: "../../image/markerIcon.png",
                id: 0,
                latitude: 39.95933,
                longitude: 116.29845,
                //title: "世纪经贸大厦",
                width: 22,
                height: 25
            },
            {
                iconPath: "../../image/markerIcon.png",
                id: 1,
                latitude: 39.98933,
                longitude: 116.30845,
                //title: "中国银行（西三环北路支行）",
                width: 22,
                height: 25
            }*/
        ],
        //附近门店
        stores:[],
        navigation:{latitude:0,longitude:0},//导航定位信息
        storeName:"",//门店
        address:"",//地址
        distance:0,//距离
        sceneNames:null,//经营项目
        hasSearch:false
    },
    //视野发生变化时触发
    regionchange(e) {
        console.log(e);
        let t=this;
        //地图发生变化的时候，获取中间点，也就是用户选择的位置toFixed
        if (e.type == "end" && (e.causedBy == "scale" || e.causedBy == "drag" || e.causedBy == "update")) {
            t.getStores();
        }
    },
    //距离处理
    clearDistance(distance){
        let newDistance = "";
        if(distance<1000){
            newDistance = distance+"m";
        }else{
            newDistance = (distance/1000).toFixed(2)+"km";
        }
        return newDistance;
    },
    //获取当前位置附近的20家门店
    getStores(){
        let t=this;
        if(!t.data.longitude){
            return;
        }
        //获取当前地图中心的经纬度。返回的是 gcj02 坐标系
        this.mapCtx.getCenterLocation({
            type: "gcj02",
            success: function (res) {
                console.log(res);
                let coreX = res.longitude;
                let coreY = res.latitude;
                if(!coreX||!coreY){
                    t.moveToLocation();
                    return;
                }
                //获取可视区西南角和东北角的经纬度
                t.mapCtx.getRegion({
                    success: function (re) {
                        console.log(re);
                        let neX = re.northeast.longitude;
                        let neY = re.northeast.latitude;
                        let wsX = re.southwest.longitude;
                        let wsY = re.southwest.latitude;
                        wx.showLoading({
                            title: '加载中',
                        });
                        console.log("longitude"+(t.data.hasSearch?t.data.searchLon:t.data.longitude));
                        console.log("latitude"+(t.data.hasSearch?t.data.searchLat:t.data.latitude));
                        service.getNearbyStore({
                            coreX: coreX,
                            coreY: coreY,
                            currentX: t.data.hasSearch?t.data.searchLon:t.data.longitude,
                            currentY: t.data.hasSearch?t.data.searchLat:t.data.latitude,
                            neX: neX,
                            neY: neY,
                            wsX: wsX,
                            wsY: wsY
                        }).then((res)=>{
                            wx.hideLoading();
                            let data = res.data.data;
                            let stores=[];
                            let markers=[];
                            if(data&&data.length>0){
                                for(let i=0;i<data.length;i++){
                                    //门店数组
                                    stores.push({
                                        storeId:i,
                                        storeName:data[i].mecName,//门店
                                        address:data[i].address,//地址
                                        longitude: data[i].coordinate.x,//经度
                                        latitude: data[i].coordinate.y,//维度
                                        distance:data[i].distance,//距离
                                        sceneNames:data[i].sceneNames,//经营项目
                                    });
                                    //地图标记
                                    markers.push({
                                        iconPath: i==0?"../../image/markerIconActive.png":"../../image/markerIcon.png",
                                        id: i,
                                        latitude: data[i].coordinate.y,//维度
                                        longitude: data[i].coordinate.x,//经度
                                        //title: "世纪经贸大厦",
                                        width: i==0?26:22,
                                        height: i==0?30.5:25
                                    })
                                }
                                if(t.data.hasSearch){
                                    t.setData({
                                        stores,
                                        markers
                                    })
                                }else{
                                    t.setData({
                                        stores,
                                        markers,
                                        navigation:{latitude:data[0].coordinate.y,longitude:data[0].coordinate.x},//导航定位信息
                                        storeName:data[0].mecName,//门店
                                        address:data[0].address,//地址
                                        distance:t.clearDistance(data[0].distance),//距离
                                        sceneNames:data[0].sceneNames,//经营项目
                                    })
                                }

                            }else{
                                t.setData({
                                    stores:null,
                                    markers:null,
                                    navigation:{latitude:0,longitude:0},//导航定位信息
                                    storeName:"",//门店
                                    address:"",//地址
                                    distance:"",//距离
                                    sceneNames:"",//经营项目
                                })
                            }
                        })
                    }
                });
            }
        });
    },
    //点击标记点触发
    markertap(e) {
        let t=this;
        let markers=[];
        this.data.markers.forEach((val)=>{
            if(e.markerId==val.id){
                val.iconPath = "../../image/markerIconActive.png";
                val.width=26;
                val.height=30;
            }else{
                val.iconPath = "../../image/markerIcon.png";
                val.width=22;
                val.height=25;
            }
            markers.push(val);
        });
        this.setData({
            markers
        });
        this.data.stores.forEach((val)=>{
            if(e.markerId==val.storeId){
                this.setData({
                    storeName:val.storeName,
                    address:val.address,
                    distance:t.clearDistance(val.distance),
                    navigation:{
                        latitude:val.latitude,
                        longitude:val.longitude
                    },
                    sceneNames:val.sceneNames
                });
            }
        })
    },
    //点击标记点对应的气泡时触发
    callouttap(e) {
        //console.log(e.markerId)
    },
    //点击控件触发
    controltap(e) {
        //console.log(e.controlId)
    },
    //导航
    navigation() {
        wx.openLocation({ // 打开微信内置地图，实现导航功能（在内置地图里面打开地图软件）
            latitude: this.data.navigation.latitude,
            longitude: this.data.navigation.longitude,
            name: this.data.storeName,
            success: function (res) {
                console.log(res);
            },
            fail: function (res) {
                console.log(res);
            }
        });
    },
    //到搜索页
    goSearch(){
        let t=this;
        let longitude=t.data.hasSearch?t.data.searchLon:t.data.longitude;
        let latitude=t.data.hasSearch?t.data.searchLat:t.data.latitude;
        if(this.data.longitude){
            wx.navigateTo({url:"../searchStores/index?latitude="+latitude+"&longitude="+longitude})
        }
    },
    //回到原点
    moveToLocation() {
        this.mapCtx.moveToLocation();
        this.getUserLocation();
        this.setData({
            hasSearch:false
        })
    },
    // 下拉刷新
    onPullDownRefresh() {

    },
    // 停止刷新方法
    stopPullDownRefresh() {

    },
    // 上拉加载更多
    onReachBottom() {

    },
    // 首次加载
    onLoad: function(options){
        let t=this;
        if(options.store){
            let store = JSON.parse(options.store);
            //console.log(store);
            this.setData({
                longitude: store.coordinate.x,
                latitude: store.coordinate.y,
                storeName:store.mecName,
                address:store.address,
                distance:t.clearDistance(store.distance),
                navigation:{latitude:store.coordinate.y,longitude:store.coordinate.x},
                sceneNames:store.sceneNames,
                searchLat:options.latitude,
                searchLon:options.longitude,
                hasSearch:true
            })
        }else{

        }
    },
    onShow() {
      wx.hideShareMenu()
        //MapContext 实例
        this.mapCtx = wx.createMapContext("map");
        if(!this.data.hasSearch){
            this.getUserLocation();
        }
    },
    // 微信授权定位
    getUserLocation: function () {
        let that = this;
        wx.showLoading({
            title:"加载中..."
        });
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
                wx.hideLoading();
                var latitude = res.latitude;
                var longitude = res.longitude;
                if(wx.getStorageSync("setAddress")){
                    longitude = wx.getStorageSync("setAddress").long;
                    latitude = wx.getStorageSync("setAddress").lati;
                }
                that.setData({latitude, longitude},()=>{
                    that.getStores();
                });
                console.log(res);
            },
            fail: function (res) {
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: '系统无法获得您的定位，请在手机系统中进行设置',
                    showCancel:false,
                    success(res){
                        if (res.confirm) {

                        }
                    }
                })
            }
        })
    },
});