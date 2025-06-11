const WEATHER_API_KEY = process.env.WEATHER_API_KEY
console.log('WEATHER_API_KEY:', WEATHER_API_KEY)

let fs = require('fs')
let formatDistance = require('date-fns/formatDistance')
let got = require('got')
let qty = require('js-quantities')

const emojis = {
  '01d': '☀️',
  '02d': '⛅️',
  '03d': '☁️',
  '04d': '☁️',
  '09d': '🌧',
  '10d': '🌦',
  '11d': '🌩',
  '13d': '❄️',
  '50d': '🌫'
}

// Time working at PlanetScale
function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}
const today = convertTZ(new Date(), "Asia/Bangkok");
const todayDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(today);

const psTime = formatDistance(new Date(2020, 12, 14), today, {
  addSuffix: false
})

// Today's weather
async function buildSVG() {
  try {
    const response = await got('https://api.openweathermap.org/data/2.5/onecall', {
      searchParams: {
        lat: 16.047079,
        lon: 108.206230,
        units: 'imperial',
        lang: 'en',
        appid: WEATHER_API_KEY
      },
      responseType: 'json'
    })

    const data = response.body

  const degF = Math.round(data.daily[0].temp.max)
  const degC = Math.round(qty(`${degF} tempF`).to('tempC').scalar)
  const icon = data.daily[0].weather[0].icon
  const wdes = data.daily[0].weather[0].description

    fs.readFile('template.svg', 'utf-8', (error, file) => {
      if (error) {
        console.error(error)
        return
      }

      file = file.replace('{degF}', degF)
      file = file.replace('{degC}', degC)
      file = file.replace('{weatherEmoji}', emojis[icon])
      file = file.replace('{psTime}', psTime)
      file = file.replace('{todayDay}', todayDay)
      file = file.replace('{wdes}', wdes)

      fs.writeFile('chat.svg', file, (err) => {
        if (err) {
          console.error(err)
        }
      })
    })
  } catch (err) {
    console.error(err)
  }
}

buildSVG()
