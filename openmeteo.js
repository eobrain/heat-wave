import wetbulb from './wetbulb.js'
import sleep from './sleep.js'

const MAX_RPM = 50 // Below openweatehrmap.org's limit of 60 RPM
const DELAY_MS = 60 * 1000 / MAX_RPM

const cached = async (api, { lat, lon }) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m`
  const result = await fetch(url)
  await sleep(DELAY_MS)
  return await result.json()
}

export default async (api, { lat, lon }) => {
  const result = await cached(api, { lat, lon })
  const { hourly } = result
  const { time, temperature_2m: temps, relative_humidity_2m: humidities } = hourly
  const zipped = time.map((t, i) => ({
    date: new Date(t),
    temp: temps[i],
    humidity: humidities[i]
  }))

  const forecasts = zipped.map(f => { f.wetbulb = wetbulb(f.temp, f.humidity); return f })
  const worstForecast = forecasts.reduce((worstF, f) =>
    worstF.wetbulb > f.wetbulb ? worstF : f)
  return worstForecast
}
