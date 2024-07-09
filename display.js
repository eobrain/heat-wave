const HOUR = 1000 * 60 * 60

export const relTime = date => {
  const hours = Math.round((date.valueOf() - Date.now()) / HOUR)
  return (hours > 1) ? `${hours} hours from now` : 'About now'
}

export const BODY_TEMP = 36.9

export function humanEffect (wetbulb) {
  if (wetbulb < 21) {
    return 'be OK 😃😎'
  }
  if (wetbulb < 28) {
    return 'be uncomfortable ☹️💦'
  }
  if (wetbulb < 31) {
    return 'kill vulnerable people 🥵💀 #DangerousWetbulb'
  }
  if (wetbulb < 35) {
    return 'make activity impossible 💀🛌 #UnlivableWetbulb'
  }
  return 'kill anyone not protected 💀💀 #UnsurvivableWetbulb'
}

export const describeWetbulb = (sweatability, wetbulb) =>
  (sweatability >= 0)
    ? `a margin of ${Math.round(sweatability)} degrees below body temperature which will ${humanEffect(wetbulb)}`
    : `${Math.round(-sweatability)} degrees **above** body temperature making it unsurvivable for humans`

const ZOOM = 6

export function tile ({ lat, lon }) {
  // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
  const x = Math.floor((lon + 180) / 360 * Math.pow(2, ZOOM))
  const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, ZOOM))
  return `https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`
}
