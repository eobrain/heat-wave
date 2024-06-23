import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { get } from './cached.js'

const api = (lat, lon) => `https://weather-424404.uc.r.appspot.com/?lat=${lat}&lon=${lon}`

describe('land and sea', () => {
  it('in Venezuela, in the jungle', async () => {
    const latLon = { lat: 2.576, lon: -66.72 }
    const result = await get(api, latLon)
    assert(result)
    assert(result.wetbulb > 20)
    assert(result.wetbulb < 37)
  })
  it('off the coast of India', async () => {
    const latLon = { lat: 13.120000000000001, lon: 80.672 }
    const result = await get(api, latLon)
    assert(!result, JSON.stringify(result))
  })
  it('in the Persian Gulf', async () => {
    const latLon = { lat: 26.792, lon: 50.128 }
    const result = await get(api, latLon)
    assert(!result, JSON.stringify(result))
  })
})
