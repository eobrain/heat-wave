import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { optimize, currentPlace, relTime, humanEffect, describeWetbulb, tile } from './index.js'

const api = (lat, lon) => `https://weather-424404.uc.r.appspot.com/?lat=${lat}&lon=${lon}`

/* describe('worldwide', () => {
  it('runs', async () => {
    let count = 0
    const { worstPlace, worstResult } = await optimize(api, () => { ++count })
    assert(count > 10, count)
    assert(count < 35, count)

    assert(worstPlace.lon >= -180)
    assert(worstPlace.lon <= 180)
    assert(worstPlace.lat >= -90)
    assert(worstPlace.lat <= 90)

    assert(worstResult.date instanceof Date)
  })
  it('currentPlace', () => {
    const result = currentPlace()
    assert(result.lon >= -180)
    assert(result.lon <= 180)
    assert(result.lat >= -90)
    assert(result.lat <= 90)
  })
}) */

describe('ireland', () => {
  const minLat = 51.6693012559
  const maxLat = 55.1316222195
  const minLon = -9.97708574059
  const maxLon = -6.03298539878
  it('runs', async () => {
    let count = 0
    const { worstPlace, worstResult } = await optimize(
      api, () => { ++count },
      { minLat, maxLat, minLon, maxLon })
    assert(count > 5, '' + count)
    assert(count < 25, '' + count)

    assert(worstPlace.lon >= minLon, JSON.stringify(worstPlace))
    assert(worstPlace.lon <= maxLon, JSON.stringify(worstPlace))
    assert(worstPlace.lat >= minLat, JSON.stringify(worstPlace))
    assert(worstPlace.lat <= maxLat, JSON.stringify(worstPlace))

    assert(worstResult.date instanceof Date)
  })
  it('currentPlace', () => {
    const result = currentPlace()
    assert(result.lon >= minLon, JSON.stringify(result))
    assert(result.lon <= maxLon, JSON.stringify(result))
    assert(result.lat >= minLat, JSON.stringify(result))
    assert(result.lat <= maxLat, JSON.stringify(result))
  })
})

/*
describe('usa', () => {
  const minLat = 24.396308
  const maxLat = 49.384358
  const minLon = -125.0
  const maxLon = -66.93457
  it('runs', async () => {
    let count = 0
    const { worstPlace, worstResult } = await optimize(
      api, () => { ++count },
      { minLat, maxLat, minLon, maxLon })
    assert(count > 5, '' + count)
    assert(count < 25, '' + count)

    assert(worstPlace.lon >= minLon, JSON.stringify(worstPlace))
    assert(worstPlace.lon <= maxLon, JSON.stringify(worstPlace))
    assert(worstPlace.lat >= minLat, JSON.stringify(worstPlace))
    assert(worstPlace.lat <= maxLat, JSON.stringify(worstPlace))

    assert(worstResult.date instanceof Date)
  })
  it('currentPlace', () => {
    const result = currentPlace()
    assert(result.lon >= minLon, JSON.stringify(result))
    assert(result.lon <= maxLon, JSON.stringify(result))
    assert(result.lat >= minLat, JSON.stringify(result))
    assert(result.lat <= maxLat, JSON.stringify(result))
  })
})
*/

describe('display', () => {
  it('relTime about now', () => {
    const date = new Date(Date.now() - 1000 * 5)
    assert.equal(relTime(date), 'About now')
  })
  it('relTime in the future', () => {
    const date = new Date(Date.now() + 1000 * 60 * 60 * 99)
    assert.equal(relTime(date), '99 hours from now')
  })

  it('humanEffect be OK', () => {
    assert.equal(humanEffect(20), 'be OK 😃😎')
  })

  it('humanEffect be uncomfortable', () => {
    assert.equal(humanEffect(27), 'be uncomfortable ☹️💦')
  })

  it('humanEffect kill vulnerable people', () => {
    assert.equal(humanEffect(30), 'kill vulnerable people 🥵💀 #DangerousWetbulb')
  })

  it('humanEffect kill vulnerable people and make it impossible to do physical labor', () => {
    assert.equal(humanEffect(34), 'make activity impossible 💀🛌 #UnlivableWetbulb')
  })

  it('humanEffect kill everyone who is not protected', () => {
    assert.equal(humanEffect(35), 'kill anyone not protected 💀💀 #UnsurvivableWetbulb')
  })

  it('describeWetbulb be OK', () => {
    assert.equal(describeWetbulb(37 - 20.2, 20.2),
      'a margin of 17 degrees below body temperature which will be OK')
  })

  it('describeWetbulb be uncomfortable', () => {
    assert.equal(describeWetbulb(37 - 27.1, 27.1),
      'a margin of 10 degrees below body temperature which will be uncomfortable')
  })

  it('describeWetbulb kill vulnerable people', () => {
    assert.equal(describeWetbulb(37 - 30.2, 30.2),
      'a margin of 7 degrees below body temperature which will kill vulnerable people')
  })

  it('describeWetbulb kill vulnerable people and make it impossible to do physical labor', () => {
    assert.equal(describeWetbulb(37 - 34.1, 34.1),
      'a margin of 3 degrees below body temperature which will kill vulnerable people and make it impossible to do physical labor')
  })

  it('describeWetbulb kill everyone who is not protected', () => {
    assert.equal(describeWetbulb(37 - 35.2, 35.2),
      'a margin of 2 degrees below body temperature which will kill everyone who is not protected')
  })

  it('describeWetbulb unsurvivable', () => {
    assert.equal(describeWetbulb(37 - 39.1, 39.1),
      '2 degrees **above** body temperature making it unsurvivable for humans')
  })

  it('tile', () => {
    const result = tile({ lat: 0, lon: 0 })
    assert.equal(result, 'https://tile.openstreetmap.org/6/32/32.png')
  })

  it('tile', () => {
    const result = tile({ lat: 0, lon: 180 })
    assert.equal(result, 'https://tile.openstreetmap.org/6/64/32.png')
  })
})
