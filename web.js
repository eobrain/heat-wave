import {
  optimize,
  currentPlace,
  relTime,
  humanEffect,
  describeWetbulb,
  tile
} from './index.js'

import {
  describe,
  it,
  assert
} from 'https://cdn.jsdelivr.net/gh/eobrain/in-browser-test/index.min.js'

/* global h3 */

const api = (lat, lon) =>
  `https://weather-424404.uc.r.appspot.com/?lat=${lat}&lon=${lon}`

describe('Restricting to bounding box around Ireland', () => {
  const minLat = 40
  const maxLat = 60
  const minLon = -20
  const maxLon = 0
  it('runs', async () => {
    let count = 0
    const { worstPlace, worstResult } = await optimize(
      api,
      h3,
      () => {
        ++count
      },
      { minLat, maxLat, minLon, maxLon }
    )
    // assert(count > 3, '' + count)
    assert(count < 25, '' + count)

    assert(worstPlace.lon >= minLon, JSON.stringify(worstPlace))
    assert(worstPlace.lon <= maxLon, JSON.stringify(worstPlace))
    assert(worstPlace.lat >= minLat, JSON.stringify(worstPlace))
    assert(worstPlace.lat <= maxLat, JSON.stringify(worstPlace))

    assert(worstResult.date instanceof Date)

    const result = currentPlace()
    assert(result.lon >= minLon, JSON.stringify(result))
    assert(result.lon <= maxLon, JSON.stringify(result))
    assert(result.lat >= minLat, JSON.stringify(result))
    assert(result.lat <= maxLat, JSON.stringify(result))
  })
})

describe('Restricting to bounding box around the USA', () => {
  const minLat = 24.396308
  const maxLat = 49.384358
  const minLon = -125.0
  const maxLon = -66.93457
  it('runs', async () => {
    let count = 0
    const { worstPlace, worstResult } = await optimize(
      api,
      h3,
      () => {
        ++count
      },
      { minLat, maxLat, minLon, maxLon }
    )
    assert(count > 3, '' + count)
    assert(count < 25, '' + count)

    assert(worstPlace.lon >= minLon, JSON.stringify(worstPlace))
    assert(worstPlace.lon <= maxLon, JSON.stringify(worstPlace))
    assert(worstPlace.lat >= minLat, JSON.stringify(worstPlace))
    assert(worstPlace.lat <= maxLat, JSON.stringify(worstPlace))

    assert(worstResult.date instanceof Date)

    const result = currentPlace()
    assert(result.lon >= minLon, JSON.stringify(result))
    assert(result.lon <= maxLon, JSON.stringify(result))
    assert(result.lat >= minLat, JSON.stringify(result))
    assert(result.lat <= maxLat, JSON.stringify(result))
  })
})

describe('Worldwide', () => {
  it('runs', async () => {
    let count = 0
    const { worstPlace, worstResult } = await optimize(api, h3, () => {
      ++count
    })
    assert(count > 3, count)
    assert(count < 35, count)

    assert(worstPlace.lon >= -180)
    assert(worstPlace.lon <= 180)
    assert(worstPlace.lat >= -90)
    assert(worstPlace.lat <= 90)

    assert(worstResult.date instanceof Date)

    const result = currentPlace()
    assert(result.lon >= -180)
    assert(result.lon <= 180)
    assert(result.lat >= -90)
    assert(result.lat <= 90)
  })
})

describe('Displaying wet-bulb temperatures', () => {
  it('has relTime about now', () => {
    const date = new Date(Date.now() - 1000 * 5)
    assert.strictEqual(relTime(date), 'About now')
  })
  it('has relTime in the future', () => {
    const date = new Date(Date.now() + 1000 * 60 * 60 * 99)
    assert.strictEqual(relTime(date), '99 hours from now')
  })

  it('returns correct humanEffect when it will be OK', () => {
    assert.strictEqual(humanEffect(20), 'be OK 😃😎')
  })

  it('returns correct humanEffect when it will be uncomfortable', () => {
    assert.strictEqual(humanEffect(27), 'be uncomfortable ☹️💦')
  })

  it('returns correct humanEffect when it will kill vulnerable people', () => {
    assert.strictEqual(
      humanEffect(30),
      'kill vulnerable people 🥵💀 #DangerousWetbulb'
    )
  })

  it('returns correct humanEffect when it will kill vulnerable people and make it impossible to do physical labor', () => {
    assert.strictEqual(
      humanEffect(34),
      'make activity impossible 💀🛌 #UnlivableWetbulb'
    )
  })

  it('returns correct humanEffect when it will kill everyone who is not protected', () => {
    assert.strictEqual(
      humanEffect(35),
      'kill anyone not protected 💀💀 #UnsurvivableWetbulb'
    )
  })

  it('it returns correct describeWetbulb when it will be OK', () => {
    assert.strictEqual(
      describeWetbulb(37 - 20.2, 20.2),
      'a margin of 17 degrees below body temperature which will be OK 😃😎'
    )
  })

  it('it returns correct describeWetbulb when it will be uncomfortable', () => {
    assert.strictEqual(
      describeWetbulb(37 - 27.1, 27.1),
      'a margin of 10 degrees below body temperature which will be uncomfortable ☹️💦'
    )
  })

  it('it returns correct describeWetbulb when it will kill vulnerable people', () => {
    assert.strictEqual(
      describeWetbulb(37 - 30.2, 30.2),
      'a margin of 7 degrees below body temperature which will kill vulnerable people 🥵💀 #DangerousWetbulb'
    )
  })

  it('it returns correct describeWetbulb when it will kill vulnerable people and make it impossible to do physical labor', () => {
    assert.strictEqual(
      describeWetbulb(37 - 34.1, 34.1),
      'a margin of 3 degrees below body temperature which will make activity impossible 💀🛌 #UnlivableWetbulb'
    )
  })

  it('it returns correct describeWetbulb when it will kill everyone who is not protected', () => {
    assert.strictEqual(
      describeWetbulb(37 - 35.2, 35.2),
      'a margin of 2 degrees below body temperature which will kill anyone not protected 💀💀 #UnsurvivableWetbulb'
    )
  })

  it('it returns correct describeWetbulb when it will be unsurvivable', () => {
    assert.strictEqual(
      describeWetbulb(37 - 39.1, 39.1),
      '2 degrees **above** body temperature making it unsurvivable for humans'
    )
  })

  it('returns the correct tile or (0,0)', () => {
    const result = tile({ lat: 0, lon: 0 })
    assert.strictEqual(result, 'https://tile.openstreetmap.org/6/32/32.png')
  })

  it('rerurns the correct tile for (0,180)', () => {
    const result = tile({ lat: 0, lon: 180 })
    assert.strictEqual(result, 'https://tile.openstreetmap.org/6/64/32.png')
  })
})
