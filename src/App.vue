<template>
  <div id="q-app">
    <navbar v-on:logout="logOut" v-on:account="account" :logged="logged" :user="user"></navbar>
    <div class="prettyModal" v-if="modal==='pretty'">
      <h2>{{prettyMessage}}</h2>
      <button class="prettyBack" v-on:click="modal=''">Back</button>
    </div>
    <router-view v-on:login="log" v-on:register="register" v-on:account="account" v-on:clockUpdateType="updateClock" v-on:closeTripModal="tripModal=''" :tripModal="tripModal" :logged="logged" :user="user" :page="page" :coordinates="coordinates" :latitude="latitude" :longitude="longitude" :lastClockType="lastClockType" :accountView="accountView"/>
  </div>
</template>

<script>
import axios from 'axios'
import navbar from './pages/elements/Navbar'
import Decimal from 'decimal'

export default {
  name: 'app',
  components: {
    'navbar': navbar
  },
  created () {
    let vue = this
    vue.user.token = localStorage.getItem('token')
    vue.user.id = localStorage.getItem('userId')
    vue.user.companyId = localStorage.getItem('companyId')
    vue.user.admin = Boolean(localStorage.getItem('admin'))
    if (vue.user.token !== null) {
      vue.logged = true
      axios.get('https://api.tripclockmobile.com/users/' + vue.user.id, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
        .then(result => {
          vue.lastClockType = result.data.lastClockType
          let today = new Date().getDate()
          let month = new Date().getMonth()
          if (result.data.tempTrip.day === today && result.data.tempTrip.month === month) {
            vue.trip.start = result.data.tempTrip
            vue.trip.start.coordinates = [parseInt(result.data.tempTrip.longitude), parseInt(result.data.tempTrip.latitude)]
            vue.tripStarted = result.data.tripStarted
          } else {
            axios.put('https://api.tripclockmobile.com/users/tripclear/' + vue.user.id, {
            }, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
              .then(result => {
                vue.tripStarted = false
              })
              .catch(err => {
                console.log(err)
              })
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
    navigator.geolocation.getCurrentPosition(vue.locationSuccess, vue.locationFail)
    vue.tripLogic()
  },
  data: function () {
    return {
      modal: '',
      tripModal: '',
      page: '',
      watch: false,
      accountView: '',
      prettyMessage: '',
      logged: false,
      lastClockType: '',
      user: {
        id: '',
        token: '',
        companyId: '',
        admin: false
      },
      distance: 0,
      latitude: '',
      longitude: '',
      firstStarted: true,
      tripStarted: false,
      coordinates: [0, 0],
      pastCoordinates: [0, 0],
      time: '',
      trip: {
        userId: '',
        distance: 0,
        year: 0,
        start: {
          startCoordinates: [0, 0],
          latitude: '',
          longitude: '',
          day: 0,
          month: 0,
          hour: 0,
          minute: 0,
          second: 0
        },
        end: {
          endCoordinates: [0, 0],
          latitude: '',
          longitude: '',
          day: 0,
          month: 0,
          hour: 0,
          minute: 0,
          second: 0
        }
      },
      mapboxToken: 'pk.eyJ1IjoiZ3JhcGV0b2FzdCIsImEiOiJjajhkeHR5YzEwdXp4MnpwbWhqYzI4ejh0In0.JzUlf5asD6yOa5XvjUF5Ag'
    }
  },
  methods: {
    prettyModal (message) {
      let vue = this
      vue.prettyMessage = message
      vue.modal = 'pretty'
    },
    updateClock (lastClockType) {
      let vue = this
      vue.lastClockType = lastClockType
      vue.updateLastClockType()
    },
    updateLastClockType () {
      let vue = this
      axios.put('https://api.tripclockmobile.com/users/' + vue.user.id, {
        lastClockType: vue.lastClockType
      }, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
        .then(function (user) {
          vue.tripModal = 'success'
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    account (view) {
      let vue = this
      vue.accountView = view || ''
    },
    log (user) {
      let vue = this
      if (user.token !== null) {
        vue.user.token = user.token
        vue.user.id = user.id
        vue.user.admin = user.admin
        vue.user.companyId = user.companyId
        vue.logged = true
        vue.$router.push('/')
      } else {
        vue.logged = false
      }
    },
    register (user) {
      let vue = this
      if (user.token) {
        vue.user.token = user.token
        vue.user.id = user.id
        vue.user.admin = user.admin
        vue.logged = true
        vue.$router.push('/')
      } else {
        vue.logged = false
      }
    },
    logOut () {
      let vue = this
      vue.user.token = ''
      vue.user.id = ''
      vue.user.admin = false
      vue.logged = false
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('admin')
      vue.$router.push('/login')
    },
    mileageLogic () {
      let vue = this
      if (vue.firstStarted === true) {
        navigator.geolocation.getCurrentPosition(vue.locationSuccess, vue.locationFail)
        if (vue.watch === false) {
          navigator.geolocation.watchPosition(vue.mileageLocationSuccess)
          vue.watch = true
        }
      } else if (vue.lastClockType === 'in' || vue.lastClockType === 'lunch in') {
        if (vue.watch === false) {
          navigator.geolocation.watchPosition(vue.mileageLocationSuccess)
          vue.watch = true
        }
        if (vue.tripStarted === false) {
          let diffLat = Math.abs(Decimal(Math.abs(vue.pastCoordinates[0])).sub(Math.abs(vue.coordinates[0])))
          let diffLong = Math.abs(Decimal(Math.abs(vue.pastCoordinates[1])).sub(Math.abs(vue.coordinates[1])))
          let totalDiff = Decimal(diffLat).add(diffLong).toNumber()
          if (totalDiff > 0.0007) {
            vue.trip.start.startCoordinates = vue.pastCoordinates
            vue.time = new Date()
            vue.trip.start.month = vue.time.getMonth()
            vue.trip.start.day = vue.time.getDate()
            vue.trip.start.hour = vue.time.getHours()
            vue.trip.start.minute = vue.time.getMinutes()
            vue.trip.start.second = vue.time.getSeconds()
            vue.trip.start.latitude = vue.pastCoordinates[1]
            vue.trip.start.longitude = vue.pastCoordinates[0]
            vue.tripStarted = true
            axios.post('https://api.tripclockmobile.com/users/trip/' + vue.user.id, {
              tempTrip: vue.trip.start,
              tripStarted: true
            }, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
              .then(result => {
              })
              .catch(err => {
                console.log(err)
              })
          }
        } else if (vue.tripStarted === true) {
          let diffLat = Math.abs(Decimal(Math.abs(vue.pastCoordinates[0])).sub(Math.abs(vue.coordinates[0])))
          let diffLong = Math.abs(Decimal(Math.abs(vue.pastCoordinates[1])).sub(Math.abs(vue.coordinates[1])))
          let totalDiff = Decimal(diffLat).add(diffLong).toNumber()
          if (totalDiff < 0.0007) {
            vue.trip.end.endCoordinates = vue.coordinates
            vue.time = new Date()
            vue.trip.year = vue.time.getFullYear
            vue.trip.end.month = vue.time.getMonth()
            vue.trip.end.day = vue.time.getDate()
            vue.trip.end.hour = vue.time.getHours()
            vue.trip.end.minute = vue.time.getMinutes()
            vue.trip.end.second = vue.time.getSeconds()
            vue.trip.end.latitude = vue.coordinates[1]
            vue.trip.end.longitude = vue.coordinates[0]
            vue.trip.userId = vue.user.id
            vue.getDirections()
            vue.postTrip()
            axios.post('https://api.tripclockmobile.com/users/tripclear/' + vue.user.id, {
            }, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
              .then(result => {
                vue.tripStarted = false
              })
              .catch(err => {
                console.log(err)
              })
          }
        }
      } else {
        navigator.geolocation.clearWatch(vue.mileageLocationSuccess)
        vue.watch = false
      }
      vue.pastCoordinates = vue.coordinates
    },
    locationSuccess (position) {
      let vue = this
      vue.coordinates = [position.coords.longitude.toPrecision(12), position.coords.latitude.toPrecision(12)]
      vue.latitude = position.coords.latitude.toPrecision(12)
      vue.longitude = position.coords.longitude.toPrecision(12)
      vue.pastCoordinates = vue.coordinates
      vue.firstStarted = false
    },
    mileageLocationSuccess (position) {
      let vue = this
      vue.coordinates = [position.coords.longitude.toPrecision(12), position.coords.latitude.toPrecision(12)]
      vue.latitude = position.coords.latitude.toPrecision(12)
      vue.longitude = position.coords.longitude.toPrecision(12)
    },
    locationFail () {
      alert('It seems we cant find you, please reload the page and try again.')
      this.locationError = true
    },
    getDirections () {
      let vue = this
      axios.get('https://api.mapbox.com/directions/v5/mapbox/driving/' + vue.trip.start.startCoordinates + ';' + vue.trip.end.endCoordinates + '?geometries=geojson&access_token=' + vue.mapboxToken)
        .then(function (response) {
          vue.trip.distance = response.data.routes[0].distance
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    postTrip () {
      let vue = this
      axios.post('https://api.tripclockmobile.com/trips', {
        userId: vue.user.id,
        year: vue.trip.year,
        start: {
          latitude: vue.trip.start.latitude,
          longitude: vue.trip.start.longitude,
          month: vue.trip.start.month,
          day: vue.trip.start.day,
          hour: vue.trip.start.hour,
          minute: vue.trip.start.minute,
          second: vue.trip.start.second
        },
        end: {
          latitude: vue.trip.end.latitude,
          longitude: vue.trip.end.longitude,
          month: vue.trip.end.month,
          day: vue.trip.end.day,
          hour: vue.trip.end.hour,
          minute: vue.trip.end.minute,
          second: vue.trip.end.second
        },
        distance: vue.trip.distance
      })
        .then(function (response) {
          vue.trip = {
            userId: '',
            distance: 0,
            start: {
              startCoordinates: [0, 0],
              latitude: '',
              longitude: '',
              day: 0,
              month: 0,
              hour: 0,
              minute: 0,
              second: 0
            },
            end: {
              endCoordinates: [0, 0],
              latitude: '',
              longitude: '',
              day: 0,
              month: 0,
              hour: 0,
              minute: 0,
              second: 0
            }
          }
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    onDeviceReady () {
      let vue = this
      try {
        cordova.plugins.backgroundMode.enable()
      } catch (error) {
        console.log(error)
      }
      vue.tripLogic()
    },
    tripLogic () {
      let vue = this
      setInterval(function () { vue.mileageLogic() }, 15000)
      vue.$router.push('/')
    }
  }
}
</script>

<style lang="less">
  .mapboxgl-marker {
    background-image: url('./assets/tc_Marker.svg');
    background-size: cover;
    width: 50px;
    height: 140px;
    z-index: 4;
    cursor: pointer;
  }
</style>
