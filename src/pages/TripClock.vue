<template>
  <div class="timecrunch">
    <div v-bind:class="clockLogic">{{hours + ':' + minutes + ':' + seconds}}</div>
    <div class="success" v-if="modal==='success'">
      <h4 class="succIn" v-if="lastClockType==='in'">Clocked In</h4>
      <div class="succInIcon" v-if="lastClockType==='in'"></div>
      <h4 class="succLunchOut" v-if="lastClockType==='lunch out'">Enjoy Lunch!</h4>
      <div class="succLunchOutIcon" v-if="lastClockType==='lunch out'"></div>
      <h4 class="succLunchIn" v-if="lastClockType==='lunch in'">Back to Work!</h4>
      <div class="succLunchInIcon" v-if="lastClockType==='lunch in'"></div>
      <h4 class="succOut" v-if="lastClockType==='out'">Clocked Out</h4>
      <div class="succOutIcon" v-if="lastClockType==='out'"></div>
      <button class="back" v-on:click="modal=''">Back</button>
    </div>
    <div class="prettyModal" v-else-if="modal==='pretty'">
      <h2>{{prettyMessage}}</h2>
      <div class="crossIcon"></div>
      <button class="back" v-on:click="modal=''">Back</button>
    </div>
    <div class="clockIn timeBtn" v-on:click="clockIn"> Clock In</div>
    <div class="clockOut timeBtn" v-on:click="clockOut">Clock Out</div>
    <div class="lunchOut timeBtn" v-on:click="lunchOut">Lunch Start</div>
    <div class="lunchIn timeBtn" v-on:click="lunchIn">Lunch End</div>
    <mapbox id="map" :access-token="mapboxToken" :map-options="mapOptions" @map-load="mapLoaded"></mapbox>
    <button class="recenter" v-on:click="recenter">Recenter Map</button>
  </div>
</template>

<script>
import Mapbox from 'mapbox-gl-vue'
import mapboxgl from 'mapbox-gl'
import axios from 'axios'

export default {
  name: 'tripclock',
  props: ['logged', 'user', 'page'],
  components: {
    'mapbox': Mapbox
  },
  created () {
    let vue = this
    vue.updateClock()
    setInterval(vue.updateClock, 1000)
    if (this.logged === false) {
      this.$router.push('/login')
    }
    axios.get('https://api.tripclockmobile.com/users/' + vue.user.id, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
      .then(function (response) {
        vue.lastClockType = response.data.lastClockType
      })
      .catch(function (error) {
        console.log(error)
      })
    vue.userId = vue.user.id
    navigator.geolocation.getCurrentPosition(locationSuccess, locationFail)
    function locationSuccess (position) {
      vue.latitude = position.coords.latitude
      vue.longitude = position.coords.longitude
      vue.altitude = position.coords.altitude
      vue.accuracy = position.coords.accuracy
      vue.altitudeAccuracy = position.coords.altitudeAccuracy
      vue.coordinates = [vue.longitude, vue.latitude]
    }
    function locationFail () {
      vue.prettyModal('It seems we cant find you, please reload the page and try again.')
      this.locationError = true
    }
  },
  data () {
    return {
      marker: document.createElement('div'),
      modal: '',
      prettyMessage: '',
      endMarker: document.createElement('div'),
      userId: '',
      time: '',
      month: '',
      day: '',
      hours: '',
      minutes: '',
      seconds: '',
      clockType: '',
      lastClockType: '',
      distance: 0,
      latitude: '',
      longitude: '',
      coordinates: [0, 0],
      endcoordinates: [-112, 34],
      altitude: '',
      accuracy: '',
      altitudeAccuracy: '',
      mapboxToken: 'pk.eyJ1IjoiZ3JhcGV0b2FzdCIsImEiOiJjajhkeHR5YzEwdXp4MnpwbWhqYzI4ejh0In0.JzUlf5asD6yOa5XvjUF5Ag',
      mapOptions: {
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [0, 0],
        zoom: 1
      }
    }
  },
  methods: {
    updateClock () {
      let vue = this
      vue.time = new Date()
      vue.hours = harold(vue.time.getHours())
      vue.minutes = harold(vue.time.getMinutes())
      vue.seconds = harold(vue.time.getSeconds())
      function harold (standIn) {
        if (standIn < 10) {
          standIn = '0' + standIn
        }
        return standIn
      }
    },
    prettyModal (message) {
      let vue = this
      vue.prettyMessage = message
      vue.modal = 'pretty'
    },
    recenter () {
      let vue = this
      function locationSuccess (position) {
        vue.latitude = position.coords.latitude
        vue.longitude = position.coords.longitude
        vue.altitude = position.coords.altitude
        vue.accuracy = position.coords.accuracy
        vue.altitudeAccuracy = position.coords.altitudeAccuracy
        vue.coordinates = [vue.longitude, vue.latitude]
      }
      function locationFail () {
        vue.prettyModal('It seems we cant find you, please reload the page and try again.')
        this.locationError = true
      }
      navigator.geolocation.getCurrentPosition(locationSuccess, locationFail)
      vue.startMarker()
      vue.mapJump()
    },
    submitDirections () {
      axios.get('https://api.mapbox.com/directions/v5/mapbox/driving/-112.399444,33.613509;-112,34?geometries=geojson&access_token=pk.eyJ1IjoiZ3JhcGV0b2FzdCIsImEiOiJjajhkeHR5YzEwdXp4MnpwbWhqYzI4ejh0In0.JzUlf5asD6yOa5XvjUF5Ag', {
      })
    },
    getDirections () {
      let vue = this
      axios.get('https://api.mapbox.com/directions/v5/mapbox/driving/-112.399444,33.613509;-112,34?geometries=geojson&access_token=pk.eyJ1IjoiZ3JhcGV0b2FzdCIsImEiOiJjajhkeHR5YzEwdXp4MnpwbWhqYzI4ejh0In0.JzUlf5asD6yOa5XvjUF5Ag')
        .then(function (response) {
          vue.distance = response.data.routes[0].distance
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    mapLoaded (map) {
      let vue = this
      vue.map = map
      vue.map.jumpTo({
        center: [vue.longitude, (vue.latitude - 0.002)],
        zoom: 15
      })
      vue.startMarker()
    },
    mapJump () {
      let vue = this
      vue.map.jumpTo({
        center: [vue.longitude, (vue.latitude - 0.002)],
        zoom: 15
      })
    },
    startMarker () {
      let vue = this
      new mapboxgl.Marker(vue.marker)
        .setLngLat(vue.coordinates)
        .addTo(vue.map)
    },
    updateLastClockType () {
      let vue = this
      axios.put('https://api.tripclockmobile.com/users/' + vue.user.id, {
        lastClockType: vue.lastClockType
      }, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
        .then(function (user) {
          vue.modal = 'success'
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    clock () {
      let vue = this
      function locationSuccess (position) {
        vue.latitude = position.coords.latitude
        vue.longitude = position.coords.longitude
        vue.altitude = position.coords.altitude
        vue.accuracy = position.coords.accuracy
        vue.altitudeAccuracy = position.coords.altitudeAccuracy
        vue.coordinates = [vue.longitude, vue.latitude]
      }
      function locationFail () {
        vue.prettyModal('It seems we cant find you, please reload the page and try again.')
        this.locationError = true
      }
      navigator.geolocation.getCurrentPosition(locationSuccess, locationFail)
      this.time = new Date()
      vue.month = vue.time.getMonth()
      vue.day = vue.time.getDate()
      vue.hours = vue.time.getHours()
      vue.minutes = vue.time.getMinutes()
      vue.seconds = vue.time.getSeconds()
      axios.post('https://api.tripclockmobile.com/clocks', {
        userId: vue.userId,
        clockType: vue.clockType,
        month: vue.month,
        day: vue.day,
        hours: vue.hours,
        minutes: vue.minutes,
        seconds: vue.seconds,
        latitude: vue.latitude,
        longitude: vue.longitude,
        altitude: vue.altitude
      })
        .then(function (clock) {
          if (clock.status === 201) {
            vue.lastClockType = vue.clockType
            vue.$emit('clockUpdateType', vue.lastClockType)
            vue.updateLastClockType()
          } else {
            console.log('failed to clock in')
          }
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    clockIn () {
      let vue = this
      if (this.lastClockType === 'out') {
        vue.clockType = 'in'
        vue.clock()
      } else {
        vue.prettyModal('You are already clocked in!')
      }
    },
    clockOut () {
      let vue = this
      if (this.lastClockType === 'in' || this.lastClockType === 'lunch in') {
        this.clockType = 'out'
        this.clock()
      } else if (this.lastClockType === 'lunch out') {
        vue.prettyModal('You are out to lunch!')
      } else {
        vue.prettyModal('You are not clocked in!')
      }
    },
    lunchOut () {
      let vue = this
      if (this.lastClockType === 'in') {
        this.clockType = 'lunch out'
        this.clock()
      } else if (this.lastClockType === 'lunch out') {
        vue.prettyModal('Lunch has Started!')
      } else if (this.lastClockType === 'lunch in') {
        vue.prettyModal('Lunch is Over!')
      } else {
        vue.prettyModal('You are not clocked in!')
      }
    },
    lunchIn () {
      let vue = this
      if (this.lastClockType === 'lunch out') {
        this.clockType = 'lunch in'
        this.clock()
      } else if (this.lastClockType === 'out') {
        vue.prettyModal('You are not clocked in!')
      } else if (this.lastClockType === 'in') {
        vue.prettyModal('Start Lunch first!')
      } else {
        vue.prettyModal('Lunch is Over!')
      }
    }
  },
  computed: {
    clockLogic: function () {
      let vue = this
      return {
        clock: true,
        clockRed: vue.lastClockType === 'out',
        clockGreen: vue.lastClockType === 'in' || vue.lastClockType === 'lunch in',
        clockBlue: vue.lastClockType === 'lunch out'
      }
    }
  }
}
</script>

<style scoped lang="less">
@red: #9e2f2f;
@grey: #323d38;
@green: #1bad4a;
@blue: #325e99;

.timecrunch {
  position: fixed;
  width: 100%;
  margin-top: 60px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(7, 80px);
}

.recenter {
  position: fixed;
  width: 100%;
  margin: 0;
  padding: 0;
  font-size: 2em;
  height: 50px;
  background-image: url('../assets/noise.png');
  color: #fff;
  bottom: 0;
  left: 0;
  right: 0;
}

#map {
  width: 100%;
  height: 100%;
  padding-top: none;
  padding-bottom: 50px;
  z-index: 0;
  position: fixed;
  top: 180px;
  bottom: 50px;
}

.clock {
  height: 80px;
  position: relative;
  z-index: 6;
  text-align: center;
  font-size: 3em;
  grid-row-start: 1;
  grid-row-end: 1;
  grid-column-start: 1;
  grid-column-end: 7;
  line-height: 100px;
  color: #fff;
  background-color: @red;
  box-shadow: 0px 1px 5px black;
}

.clockRed {
  background-color: @red;
}

.clockGreen {
  background-color: @green;
}

.clockBlue {
  background-color: @blue;
}

.timeBtn {
  z-index: 3;
  font-size: .8em;
  font-weight: bold;
  text-align: center;
  width: 100%;
  height: 50px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  color: white;
  line-height: 50px;
  box-shadow: 0px 1.5px 4px #000;
}

.clockIn {
  background-color: @green;
  grid-row: 2;
  grid-column: 1;
}

.lunchIn {
  z-index: 3;
  background-color: @grey;
  grid-row: 2;
  grid-column: 3;
}

.lunchOut {
  background-color: @blue;
  grid-row: 2;
  grid-column: 2;

}

.clockOut {
  background-color: @red;
  grid-row: 2;
  grid-column: 4;
}

.success {
  color: @red;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 1px 1px 1px @grey;
  z-index: 12;
  border: 2px solid black;
  grid-row-start: 3;
  grid-row-end: 6;
  grid-column-start: 2;
  grid-column-end: 4;
  display: grid;
  grid-template-rows: 2fr 4fr 1fr;
}

.prettyModal {
  color: @red;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 1px 1px 1px @grey;
  z-index: 12;
  border: 2px solid black;
  grid-row-start: 3;
  grid-row-end: 6;
  grid-column-start: 2;
  grid-column-end: 4;
  display: grid;
  grid-template-rows: 2fr 4fr 1fr;
}

.success h4 {
  font-family: sans-serif;
  font-size: 1.75em;
  text-align: center;
  padding-top: 10px;
  margin: 0;
  grid-row: 1;
}

.succIn {
  color: @green;
}

.succInIcon {
  background-image: url("../assets/tc_Time_IN.svg");
  background-repeat: no-repeat;
}

.succLunchOut {
  color: @blue;
}

.succLunchOutIcon {
  background-image: url("../assets/tc_Lunchbox_OUT.svg");
  background-repeat: no-repeat;
  margin-left: 11%;
}

.succLunchIn {
  color: @green;
}

.succLunchInIcon {
  background-image: url("../assets/tc_Lunchbox_IN.svg");
  background-repeat: no-repeat;
  margin-left: 11%;
}

.succOutIcon {
  background-image: url("../assets/tc_Time_OUT.svg");
  background-repeat: no-repeat;
}

.prettyModal h2 {
  font-family: sans-serif;
  font-size: 1.5em;
  text-align: center;
  padding-top: 10px;
  margin: 0;
  grid-row: 1;
}

.crossIcon {
  background-image: url("../assets/tc_Cross.svg");
  background-repeat: no-repeat;
  margin-left: 12%;
}

.back {
  grid-row: 3;
  background-color: @red;
  font-family: sans-serif;
  color: #fff;
  border: none;
  border-top: 2px solid #000;
  border-radius: 12px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
}
.timeBtn {
  font-weight: 400;
  font-size: 1em;
  z-index: 3;
}
</style>
