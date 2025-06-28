import openmeteo from './openmeteo.js'

const uncachedGet = async (api, isOutOfBounds, location) => {
  if (isOutOfBounds(location.lat, location.lon)) {
    return undefined
  }
  return await openmeteo(api, location)
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
