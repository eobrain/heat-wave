import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { optimize, currentPlace, relTime, humanEffect, tile } from './index.js'

const api = (lat, lon) => `https://weather-424404.uc.r.appspot.com/?lat=${lat}&lon=${lon}`

describe('worldwide', () => {
  it('runs', async () => {
    let count = 0
    const { worstPlace, worstResult } = await optimize(api, () => { ++count })
    assert.ok(count > 10)
    assert.ok(count < 30)

    assert.ok(worstPlace.lon >= -180)
    assert.ok(worstPlace.lon <= 180)
    assert.ok(worstPlace.lat >= -90)
    assert.ok(worstPlace.lat <= 90)

    assert.ok(worstResult.date instanceof Date)
  })
  it('currentPlace', () => {
    const result = currentPlace()
    assert.ok(result.lon >= -180)
    assert.ok(result.lon <= 180)
    assert.ok(result.lat >= -90)
    assert.ok(result.lat <= 90)
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
