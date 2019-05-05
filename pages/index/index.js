const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

var QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2


Page({
  data: {
    nowTemp: "",
    nowWeather: "",
    nowWeatherBG: "",
    hourlyWeather: [],
    todayDate: "",
    todayTemp: "",
    city: "北京市",
    locationAuthType: UNPROMPTED,
  },
  onLoad(){
    console.log('onLoad')
    var that = this
    that.qqmapsdk = new QQMapWX({
      key: '5TDBZ-K3XRW-R2CRY-RXI6X-DO2MZ-WHBI4'
    });
    wx.getSetting({
      success: res=>{
        let auth = res.authSetting["scope.userLocation"]
        that.setData({
          locationAuthType : auth ? AUTHORIZED : (auth===false) ? UNAUTHORIZED : UNPROMPTED,
        })
        if(auth){
          that.getCityAndWeather()
        }
        else{
          that.getNow()
        }
      }
    })
  },
  onPullDownRefresh(){
    var that = this
    that.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },
  getNow(callback){
    var that = this
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: that.data.city
      },
      success: (res) => {
        let result = res.data.result
        that.setNow(result)
        that.setHourlyWeather(result)
        that.setToday(result)
      },
      complete: ()=>{
        callback && callback()
      }
    })
  },
  setNow(result){
    var that = this
    let temp = result.now.temp
    let weather = result.now.weather
    that.setData({
      nowTemp: temp + "º",
      nowWeather: weatherMap[weather],
      nowWeatherBG: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather]
    })
  },
  setHourlyWeather(result){
    var that = this
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for(let i = 0; i < 8; i++){
      hourlyWeather.push({
        time: (nowHour+i*3)%24 + "时",
        iconPath: "/images/" + forecast[i].weather + "-icon.png",
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = "现在"
    that.setData({
      hourlyWeather: hourlyWeather
    })
  },
  setToday(result){
    var that = this
    let date = new Date()
    that.setData({
      todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather(){
    wx.navigateTo({
      url: '/pages/list/list?city='+this.data.city
    })
  },
  onTapLocation(){
    var that = this
    if(that.data.locationAuthType === UNAUTHORIZED){
      wx.openSetting({
        success: res=>{
          let auth = res.authSetting["scope.userLocation"]
          if(auth){
            that.getCityAndWeather()
          }
        }
      })
    }
    else{
      that.getCityAndWeather()
    }
  },
  getCityAndWeather(){
    var that = this
    wx.getLocation({
      success: res => {
        that.setData({
          locationAuthType: AUTHORIZED,
        })
        that.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            that.setData({
              city: city,
            })
            that.getNow()
          }
        })
      },
      fail: () => {
        that.setData({
          locationAuthType: UNAUTHORIZED,
        })
      }
    })
  }
})

