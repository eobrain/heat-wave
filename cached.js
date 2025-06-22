import openweathermap from './openweathermap.js'
import countryNames from './country-names.js'

const uncachedGet = async (api, isOutOfBounds, location) => {
  if (isOutOfBounds(location.lat, location.lon)) {
    return undefined
  }
  const { name, country, date, weather, population, description, main } = await openweathermap(api, location)

  if (!name || population === 0) {
    return undefined
  }
  // if (name.match(/^[0-9,.-]*$/)) {
  //  return undefined
  // }

  const { temp, humidity, feels_like: feelsLike, wetbulb } = main

  return {
    name,
    country: countryNames[country] || country,
    date,
    weather,
    description,
    temp,
    humidity,
    feelsLike,
    wetbulb
  }
}

const cache = new Map()
let hitCount = 0
let totalCount = 0

export const get = async (api, isOutOfBounds, location) => {
  if ((totalCount % 100) === 99) {
    console.log(`misses=${totalCount - hitCount}, hit rate ${Math.round(100 * hitCount / totalCount)}`)
  }
  const key = JSON.stringify(location)
  ++totalCount
  if (cache.has(key)) {
    ++hitCount
    return cache.get(key)
  }
  const result = await uncachedGet(api, isOutOfBounds, location)
  cache.set(key, result)
  return result
}
