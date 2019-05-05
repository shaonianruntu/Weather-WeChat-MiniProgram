const dayMap = [
  '星期日', 
  '星期一', 
  '星期二', 
  '星期三', 
  '星期四', 
  '星期五', 
  '星期六']


Page({
  date:{
    weekWeather: [],
  },
  onLoad(options){
    var that = this
    that.getWeekWeather()
  },
  onPullDownRefresh(){
    var that = this
    that.getWeekWeather(()=>{
      wx.stopPullDownRefresh()
    })
  },
  getWeekWeather(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        time: new Date().getTime(),
        city: "广州市"
      },
      success: res =>{
        var that = this
        let result = res.data.result
        that.setWeekWeather(result)
      },
      complete: ()=>{
        callback && callback()
      }
    })
  },
  setWeekWeather(result){
    var that = this
    let weekWeather = []
    for(let i = 0; i < 7; i++){
      let date = new Date()
      date.setDate(date.getDate() + i)
      weekWeather.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        temp: `${result[i].minTemp}° - ${result[i].maxTemp}°`,
        iconPath: '/images/' + result[i].weather + '-icon.png',
      })
    }
    weekWeather[0].day = "今天"
    that.setData({
      weekWeather: weekWeather
    })
  },
})