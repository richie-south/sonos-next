const { send } = require('micro')
const { router, get } = require('microrouter')
const { DeviceDiscovery, Sonos, SpotifyRegion } = require('sonos')
const Gpio = require('onoff').Gpio
const nextButton = new Gpio(2, 'in', 'both')
const previousButton = new Gpio(2, 'in', 'both')

const devices = []

DeviceDiscovery((device) => {
  devices.push(device)
})

const onNext = async () => {
  await Promise.all(devices.map(async (device) => {
    const sonos = new Sonos(device.host)
    sonos.setSpotifyRegion(SpotifyRegion.EU)

    await sonos.next()
  }))
}

const onPrevious = async () => {
  await Promise.all(devices.map(async (device) => {
    const sonos = new Sonos(device.host)
    sonos.setSpotifyRegion(SpotifyRegion.EU)

    await sonos.previous()
  }))
}

nextButton.watch(async (err, value) => {
  if (err) {
    return console.log(err)
  }

  try {
    await onNext()
  } catch (error) {
    console.error(error)
  }
})

previousButton.watch(async (err, value) => {
  if (err) {
    return console.log(err)
  }

  try {
    await onPrevious()
  } catch (error) {
    console.error(error)
  }
})

const onNextRoute = async (req, res) => {
  await onNext()
  send(res, 200, 'Next')
}

const onPreviousRoute = async (req, res) => {
  await onPrevious()
  send(res, 200, 'Previous')
}

module.exports = router(
  get('/next', onNextRoute),
  get('/previous', onPreviousRoute)
)
