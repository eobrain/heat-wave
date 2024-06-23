import sleep from './sleep.js'
import { get } from './cached.js'
import { pp } from 'passprint'

// const randomElement = array => array[Math.floor(Math.random() * array.length)]
const KM_IN_LAT_DEG = 0.008
const D = KM_IN_LAT_DEG
const DSIN = D * Math.sqrt(3) / 2
const DCOS = D / 2
const DELTAS = [
  [-DSIN, -DCOS], [-DSIN, DCOS],
  [0, -D], /* [0,0] */[0, D],
  [DSIN, -DCOS], [DSIN, DCOS]
]

// Corresponds to about 1 km at the equator
const quantize = degree => Math.round(degree / KM_IN_LAT_DEG) * KM_IN_LAT_DEG

function latMod(lat, { minLat, maxLat }) {
  const range = maxLat - minLat
  while (lat > maxLat) {
    lat -= range
  }
  while (lat < minLat) {
    lat += range
  }
  return lat
}
function lonMod(lon, { minLon, maxLon }) {
  const range = maxLon - minLon
  while (lon > maxLon) {
    lon -= range
  }
  while (lon < minLon) {
    lon += range
  }
  return lon
}

const plus = (ll, delta, scale, bounds) => {
  const [dLat, dLon] = delta
  return {
    lat: quantize(latMod(ll.lat + dLat * scale, bounds)),
    lon: quantize(lonMod(ll.lon + dLon * scale, bounds))
  }
}

const START_QUANTIZATION_DEG = 20
const startQuantization = degree =>
  START_QUANTIZATION_DEG * Math.round(degree / START_QUANTIZATION_DEG)

class Optimizer {
  constructor() {
    this.place = {}
    this.worstWetbulb = -10000
    this.worstPlace = null
    this.visited = new Set()
  }

  // let wetbulbAtPlace

  /* async function annealMove (annealT, scale, get, show) {
  const latLon = plus(place, randomElement(DELTAS), scale)

  const result = await get(latLon)
  if (!result) {
    return false
  }
  if (result.wetbulb > this.worstWetbulb) {
    this.worstWetbulb = result.wetbulb
    this.worstPlace = latLon
  }
  const dImprovement = result.wetbulb - wetbulbAtPlace
  const accept = Math.exp(dImprovement / annealT) > Math.random()
  if (accept) {
    place.lat = latLon.lat
    place.lon = latLon.lon
    wetbulbAtPlace = result.wetbulb
    await show(result)
    return true
  }
  return false
} */

  async tabuMove(scale, api, show, bounds) {
    let highestResult = { wetbulb: -10000 }
    let highestPlace

    for (const delta of DELTAS) {
      const latLon = plus(this.place, delta, scale, bounds)
      if (this.visited.has(JSON.stringify(latLon))) {
        continue
      }
      const result = await get(api, latLon)
      if (!result) {
        continue
      }
      if (result.wetbulb > highestResult.wetbulb) {
        highestResult = result
        highestPlace = latLon
      }
    }
    if (!highestPlace) {
      return false
    }
    if (highestResult.wetbulb > this.worstWetbulb) {
      this.worstWetbulb = highestResult.wetbulb
      this.worstPlace = highestPlace
      console.log('this.tabuMove:', this.worstPlace)
      await show(highestResult)
    }
    this.place.lat = highestPlace.lat
    this.place.lon = highestPlace.lon
    // wetbulbAtPlace = highestResult.wetbulb
    this.visited.add(JSON.stringify(this.place))
    return true
  }

  /* async function hillclimbMove (scale, get, show) {
  let highestResult = { wetbulb: wetbulbAtPlace }
  let highestPlace = place
  let moved = false

  for (const delta of DELTAS) {
    const latLon = plus(place, delta, scale)
    const result = await get(latLon)
    if (!result) {
      continue
    }
    if (result.wetbulb > highestResult.wetbulb) {
      highestResult = result
      highestPlace = latLon
      moved = true
    }
  }
  if (!moved) {
    return false
  }
  if (highestResult.wetbulb > this.worstWetbulb) {
    this.worstWetbulb = highestResult.wetbulb
    this.worstPlace = highestPlace
  }
  await show(highestResult)
  place.lat = highestPlace.lat
  place.lon = highestPlace.lon
  wetbulbAtPlace = highestResult.wetbulb
  return true
} */

  // const K = 10

  async randomStart(api, show, { minLat, maxLat, minLon, maxLon }) {
    let result
    let count = 0
    const dLat = maxLat - minLat
    const dLon = maxLon - minLon
    const quant = (dLat < 2 * START_QUANTIZATION_DEG || dLon < 2 * START_QUANTIZATION_DEG) ?
      quantize : startQuantization
    while (!result) {
      if (count++ > 100) {
        console.warn('Failed to find a random start')
        await sleep(1000)
        return
      }
      this.place.lat = quant(Math.random() * dLat + minLat)
      this.place.lon = quant(Math.random() * dLon + minLon)
      result = await get(api, pp(this.place))
    }
    // wetbulbAtPlace = result.wetbulb
    await show(result)
  }

  async moveToWorst(api, show) {
    if (!this.worstPlace) {
      console.warn('No worst place found')
      await sleep(1000)
      return
    }
    this.place.lat = this.worstPlace.lat
    this.place.lon = this.worstPlace.lon
    // wetbulbAtPlace = this.worstWetbulb
    const worstResult = await get(api, this.worstPlace)
    await show(worstResult)
    console.log('this.moveToWorst:', this.worstPlace)
    return { worstPlace: this.worstPlace, worstResult }
  }

  /* async function anneal (get, show) {
  await this.randomStart(get, show)

  for (let scale = 16384; scale >= 1; scale /= 2) {
    for (let annealT = 10; ; annealT *= 0.99) {
      let anyAccept = false
      for (let i = 0; i < K; ++i) {
        anyAccept = anyAccept || await annealMove(annealT, scale, get, show)
        // await sleep(100)
      }
      if (!anyAccept) {
        break
      }
    }
    this.moveToWorst(get, show)
  }
} */

  async tabu(api, show, bounds) {
    await this.randomStart(api, show, bounds)
    let worst
    const initialScale = 16384 * Math.min(
      (bounds.maxLat - bounds.minLat) / 180,
      (bounds.maxLon - bounds.minLon) / 360
    )
    for (let scale = initialScale; scale >= 1; scale /= 8) {
      for (let i = 0; i < 100; ++i) {
        // await sleep(1000)
        if (!(await this.tabuMove(scale, api, show, bounds))) {
          break
        }
      }
      worst = this.moveToWorst(api, show)
      // await sleep(10000)
    }
    return worst
  }

  /* async function hillclimb (get, show) {
  await this.randomStart(get, show)

  for (let scale = 128; scale >= 1; scale /= 2) {
    while ((await hillclimbMove(scale, get, show))) {
      // await sleep(1000)
    }
    this.moveToWorst(get, show)
    await sleep(10000)
  }
} */
}

let optimizer

export async function optimize(api, show, bounds) {
  const { minLat, maxLat, minLon, maxLon } = bounds || {
    minLat: -90,
    maxLat: 90,
    minLon: -180,
    maxLon: 180
  }
  optimizer = new Optimizer()
  await optimizer.tabu(api, show, { minLat, maxLat, minLon, maxLon })
  return await optimizer.moveToWorst(api, show)
}

export const currentPlace = () => optimizer.place
