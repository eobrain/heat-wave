import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { optimize, currentPlace, relTime, humanEffect, tile } from './index.js'

const api = (lat, lon) => `https://weather-424404.uc.r.appspot.com/?lat=${lat}&lon=${lon}`

describe('worldwide', () => {
  it('runs', async () => {
    let count = 0
    const { worstPlace, worstResult } = await optimize(api, () => { ++count })
    assert(count > 10)
    assert(count < 30)

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
})

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
    assert(count < 20, '' + count)

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
    assert.equal(humanEffect(20), 'be OK')
  })

  it('humanEffect be uncomfortable', () => {
    assert.equal(humanEffect(27), 'be uncomfortable')
  })

  it('humanEffect kill vulnerable people', () => {
    assert.equal(humanEffect(30), 'kill vulnerable people')
  })

  it('humanEffect kill vulnerable people and make it impossible to do physical labor', () => {
    assert.equal(humanEffect(34), 'kill vulnerable people and make it impossible to do physical labor')
  })

  it('humanEffect kill everyone who is not protected', () => {
    assert.equal(humanEffect(35), 'kill everyone who is not protected')
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
