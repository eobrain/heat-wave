import sleep from './sleep.js'
import { get } from './cached.js'
import hexDict from './hex-list.js'

const cellCodes = Object.keys(hexDict)
for (const code of cellCodes) {
  hexDict[code].cellCode = code
}

class Optimizer {
  constructor (h3, isOutOfBounds) {
    this.h3 = h3
    this.isOutOfBounds = isOutOfBounds
    this.place = {}
    this.worstWetbulb = -10000
    this.worstPlace = null
    this.visited = new Set()
  }

  async hillclimbMove (distance, api, show) {
    const rings = this.h3.gridDiskDistances(this.place.cellCode, distance)
    const outerRing = rings[rings.length - 1]

    const results = outerRing
      .filter((code) => !!hexDict[code])
      .map((code) => hexDict[code])
      .map(async (hex) => ({
        cellCode: hex.cellCode,
        result: await get(api, this.isOutOfBounds, hex)
      }))
    await sleep(1000)

    if (!results.length === 0) {
      return false
    }

    let highestResult = { wetbulb: -10000 }
    let highestPlace
    for (const rPromise of results) {
      const r = await rPromise
      const { result, cellCode } = r
      if (result && result.wetbulb > highestResult.wetbulb) {
        highestResult = result
        highestPlace = hexDict[cellCode]
      }
    }

    const foundWorse = highestResult.wetbulb > this.worstWetbulb
    if (foundWorse) {
      this.worstWetbulb = highestResult.wetbulb
      this.worstPlace = highestPlace
      await show(highestResult)
      this.place.lat = highestPlace.lat
      this.place.lon = highestPlace.lon
      this.place.cellCode = highestPlace.cellCode
      // wetbulbAtPlace = highestResult.wetbulb
    }
    return foundWorse
  }

  async tabuMove (distance, api, show) {
    const rings = this.h3.gridDiskDistances(this.place.cellCode, distance)
    const outerRing = rings[rings.length - 1]

    const results = outerRing
      .filter((code) => !!hexDict[code])
      .map((code) => hexDict[code])
      .filter((hex) => this.visited.has(hex.cellCode))
      .map(async (hex) => ({
        cellCode: hex.cellCode,
        result: await get(api, this.isOutOfBounds, hex)
      }))
    await sleep(1000)

    if (!results.length === 0) {
      return false
    }

    let highestResult = { wetbulb: -10000 }
    let highestPlace
    for (const rPromise of results) {
      const r = await rPromise
      const { result, cellCode } = r
      if (result && result.wetbulb > highestResult.wetbulb) {
        highestResult = result
        highestPlace = hexDict[cellCode]
      }
    }

    if (highestResult.wetbulb > this.worstWetbulb) {
      this.worstWetbulb = highestResult.wetbulb
      this.worstPlace = highestPlace
      await show(highestResult)
    }
    this.place.lat = highestPlace.lat
    this.place.lon = highestPlace.lon
    this.place.cellCode = highestPlace.cellCode
    // wetbulbAtPlace = highestResult.wetbulb
    this.visited.add(this.place.cellCode)
    return true
  }

  async randomStart (api, show) {
    let result
    let count = 0
    while (!result) {
      if (count++ > 10000) {
        console.warn('Failed to find a random start')
        await sleep(1000)
        return
      }
      const randomCellCode =
        cellCodes[Math.floor(Math.random() * cellCodes.length)]
      this.place = hexDict[randomCellCode]
      result = await get(api, this.isOutOfBounds, this.place)
      await sleep(1000)
    }
    await show(result)
  }

  async moveToWorst (api, show) {
    if (!this.worstPlace) {
      console.warn('No worst place found')
      await sleep(1000)
      return
    }
    this.place.lat = this.worstPlace.lat
    this.place.lon = this.worstPlace.lon
    this.place.cellCode = this.worstPlace.cellCode
    // wetbulbAtPlace = this.worstWetbulb
    const worstResult = await get(api, this.isOutOfBounds, this.worstPlace)
    await sleep(1000)
    await show(worstResult)
    // console.log('this.moveToWorst:', this.worstPlace)
    return { worstPlace: this.worstPlace, worstResult }
  }

  async tabu (api, show) {
    await this.randomStart(api, show)
    let worst
    for (let distance = 2; distance >= 1; --distance) {
      for (let i = 0; i < 100; ++i) {
        // await sleep(1000)
        if (!(await this.tabuMove(distance, api, show))) {
          break
        }
      }
      worst = this.moveToWorst(api, show)
      // await sleep(10000)
    }
    return worst
  }

  async hillClimb (api, show) {
    await this.randomStart(api, show)
    for (let distance = 1; distance <= 2; ++distance) {
      for (let i = 0; i < 100; ++i) {
        // await sleep(1000)
        if (await this.hillclimbMove(distance, api, show)) {
          this.moveToWorst(api, show)
        } else {
          break
        }
      }
      // await sleep(10000)
    }
    return this.moveToWorst(api, show)
  }

  async bruteForce (api, show) {
    const results = cellCodes
      .map((code) => hexDict[code])
      .map(async (hex) => ({
        cellCode: hex.cellCode,
        result: await get(api, this.isOutOfBounds, hex)
      }))
    await sleep(1000)

    let highestResult = { wetbulb: -10000 }
    for (const rPromise of results) {
      const r = await rPromise
      const { result, cellCode } = r
      if (result && result.wetbulb > highestResult.wetbulb) {
        highestResult = result
        this.worstPlace = hexDict[cellCode]
      }
    }
  }
}

let optimizer

export async function optimize (api, h3, show, bounds) {
  const { minLat, maxLat, minLon, maxLon } = bounds || {
    minLat: -90,
    maxLat: 90,
    minLon: -180,
    maxLon: 180
  }
  const isOutOfBounds = (lat, lon) =>
    lat < minLat || lat > maxLat || lon < minLon || lon > maxLon
  optimizer = new Optimizer(h3, isOutOfBounds)
  await optimizer.hillClimb(api, show)
  return await optimizer.moveToWorst(api, show)
}

export const currentPlace = () => optimizer.place
