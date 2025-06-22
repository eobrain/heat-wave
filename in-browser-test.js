const $body = document.getElementsByTagName('body')[0]
$body.insertAdjacentHTML(
  'beforeend',
  '<h1>Test Output</h1><ul id="$testLog"></ul>'
)

/* global $testLog */

const addLi = ($element, html) =>
  $element.insertAdjacentHTML('beforeend', `<li>${html}</li>`)

let describeCount = 0
let $description
export const describe = (name, fn) => {
  const describeId = `d${++describeCount}`
  addLi($testLog, `${name}<ul id="${describeId}"></ul>`)
  $description = document.getElementById(describeId)
  fn()
}

export const it = (description, fn) => {
  try {
    fn()
    addLi($description, `✔️ It ${description}`)
  } catch (error) {
    addLi($description, `❌ It ${description} - ${error.message}`)
  }
}

export const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

assert.equal = (actual, expected, message) => {
  const prefix = message ? `${message}: ` : ''
  if (actual !== expected) {
    throw new Error(`${prefix}Expected ${expected}, but got ${actual}`)
  }
}
