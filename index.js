const { DeviceDiscovery, Sonos, SpotifyRegion } = require('sonos')
const Gpio = require('onoff').Gpio
const nextButton = new Gpio(10, 'in', 'both')

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
