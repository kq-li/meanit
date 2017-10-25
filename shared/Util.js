/**
 * @fileoverview Utility functions used across the server and client.
 */

const findObject = (objArray, conditions) => {
  objArray.forEach(object => {
    return conditions.keys().every(key => {
      if (object[key] !== conditions[key]) {
        return false
      }
    }) ? object : null
  })
  return null
}

if (typeof module === 'object') {
  module.exports = exports = { findObject }
} else {
  window.Util = { findObject }
}
