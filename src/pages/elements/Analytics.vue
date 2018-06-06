<template>
  <div v-bind:class="analyticsLogic">
    <div class="graphsPane">
      <div class="timeGraphsPane" v-if="pane==='time'">
        <h4 v-if="modal==='user'">{{activeUser.name}}'s Time Record</h4>
        <h4>{{totalHours}} Total Hours Clocked</h4>
        <h5 v-if="modal==='user'">Sort By</h5>
        <select v-model="clocksFilter" class="clocksFilter" v-if="modal==='user'">
          <option value="days">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="time">All Time</option>
        </select>
        <button class="clocksFilterActivate" v-on:click="filterClocks" v-if="modal==='user'">Filter Clocks</button>
      </div>
      <div class="readouts" v-else-if="pane==='readout'">
        <div v-if="modal==='clock'">
          <h3>User: {{activeUser.name}}</h3>
          <h3>Clock {{activeClock.clockType}} {{(activeClock.month + 1)}}/{{activeClock.day}} {{activeClock.hours}}:{{activeClock.minutes}}</h3>
        </div>
        <div v-else>
          <h3>User: {{activeUser.name}}</h3>
          <h3>Trip on {{activeTrip.start.month + 1}}/{{activeTrip.start.day}} Distance: {{Math.floor(activeTrip.distance / 1609.34)}} Miles</h3>
          <h3>Start Time - {{activeTrip.start.hour}}:{{activeTrip.start.minute}}</h3>
          <h3>End Time - {{activeTrip.end.hour}}:{{activeTrip.end.minute}}</h3>
        </div>
      </div>
      <div class="mileGraphsPane" v-else>
        <h4 v-if="modal==='user'">{{activeUser.name}}'s Mileage Record</h4>
        <h4>Total Miles Driven: {{totalDistance}}</h4>
        <h5 v-if="modal==='user'">Sort By</h5>
        <select v-model="tripsFilter" class="tripsFilter" v-if="modal==='user'">
          <option value="days">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="time">All Time</option>
        </select>
        <button class="tripsFilterActivate" v-on:click="filterTrips" v-if="modal==='user'">Filter Trips</button>
      </div>
    </div>
    <div class="timeTab" v-on:click="pane='time'" v-if="pane!=='readout'">Time</div>
    <div class="mileTab" v-on:click="pane=''" v-if="pane!=='readout'">Distance</div>
    <div class="modals">
      <div class="userView" v-if="modal==='user'">
        <button class="back" v-on:click="modal=''; resetTime(); resetTrips(); populateCompanyClocks(); populateCompanyTrips()">Back</button>
        <h1>Recent Events</h1>
        <div class="clockDay" v-bind:key="day.id" v-for="day in days" v-if="pane==='time'">
          <h5 class="date" v-on:click="day.visible = !day.visible"> {{(day.month + 1)}}/{{day.day}}</h5>
          <div class="clocks" v-bind:key="clock.id" v-for="clock in day.clocks" v-if="day.visible">
            <h5 v-on:click="viewClock(clock)">Confirmed Clock {{clock.clockType}}-{{clock.hours}}:{{clock.minutes}}</h5>
          </div>
        </div>
        <div class="tripDay" v-bind:key="tripDay.id" v-for="tripDay in tripDays" v-if="pane===''">
          <h5 class="date" v-on:click="tripDay.visible = !tripDay.visible"> {{(tripDay.month + 1)}}/{{tripDay.day}}</h5>
          <div class="trips" v-bind:key="trip.id" v-for="trip in tripDay.trips" v-if="tripDay.visible">
            <h5 v-on:click="viewTrip(trip)"> Distance: {{Math.floor(trip.distance / 1609.34)}} Miles</h5>
          </div>
        </div>
      </div>
      <div class="clockMapView" v-else-if="modal==='clock'">
        <button class="mapBack" v-on:click="modal='user'; pane='time'; resetTime(); resetTrips(); populateCompanyClocks(); populateCompanyTrips()">Back</button>
        <mapbox id="map" :access-token="mapboxToken" :map-options="mapOptions" @map-load="mapLoaded"></mapbox>
      </div>
      <div class="tripMapView" v-else-if="modal==='trip'">
        <button class="mapBack" v-on:click="modal='user'; pane=''; resetTime(); resetTrips(); populateCompanyClocks(); populateCompanyTrips()">Back</button>
        <mapbox id="map" :access-token="mapboxToken" :map-options="mapOptions" @map-load="mapLoaded"></mapbox>
      </div>
      <div class="adminView" v-else>
        <h1>Employees</h1>
        <div class="user" v-for="user in users" v-bind:key="user.id">
          <h5 v-on:click="viewUser(user)">{{user.name}}</h5>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Mapbox from 'mapbox-gl-vue'
import mapboxgl from 'mapbox-gl'
import axios from 'axios'
import Decimal from 'decimal'

export default {
  name: 'analytics',
  props: ['user'],
  components: {
    'mapbox': Mapbox
  },
  data () {
    return {
      marker: document.createElement('div'),
      markerStart: document.createElement('div'),
      markerEnd: document.createElement('div'),
      coordinates: [0, 0],
      startCoordinates: [0, 0],
      endCoordinates: [0, 0],
      pane: 'time',
      modal: '',
      tripMatch: false,
      dayMatch: false,
      startTime: {
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      endTime: {
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      totalTime: {
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      totalHours: 0,
      totalDistance: 0,
      search: '',
      userSearch: '',
      users: [],
      clocks: [],
      days: [],
      activeClocks: [],
      tripDays: [],
      activeTrips: [],
      trips: [],
      activeUser: {
        id: '',
        name: '',
        companyId: '',
        email: '',
        admin: false
      },
      activeClock: {
        userId: '',
        clockType: '',
        month: '',
        day: '',
        hours: '',
        minutes: '',
        seconds: '',
        latitude: '',
        longitude: '',
        altitude: ''
      },
      activeTrip: {
        userId: '',
        distance: 0,
        start: {
          latitude: '',
          longitude: '',
          month: 0,
          day: 0,
          hour: 0,
          minute: 0,
          second: 0
        },
        end: {
          latitude: '',
          longitude: '',
          month: 0,
          day: 0,
          hour: 0,
          minute: 0,
          second: 0
        }
      },
      x: 0,
      y: 0,
      a: 0,
      b: 0,
      cx: 0,
      cy: 0,
      diffx: 0,
      diffy: 0,
      minx: 0,
      miny: 0,
      maxx: 0,
      maxy: 0,
      zoom: 0,
      zoomNum: 0,
      tripsFilter: 'month',
      clocksFilter: 'month',
      mapboxToken: 'pk.eyJ1IjoiZ3JhcGV0b2FzdCIsImEiOiJjajhkeHR5YzEwdXp4MnpwbWhqYzI4ejh0In0.JzUlf5asD6yOa5XvjUF5Ag',
      mapOptions: {
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [0, 0],
        zoom: 1
      }
    }
  },
  created () {
    let vue = this
    axios.get('https://api.tripclockmobile.com/users/all/' + vue.user.companyId, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
      .then(function (response) {
        vue.users = response.data
        vue.populateCompanyClocks()
        vue.populateCompanyTrips()
      })
      .catch(function (error) {
        console.log(error)
      })
  },
  methods: {
    filterTrips () {
      let vue = this
      vue.resetTime()
      vue.populateCompanyTrips()
    },
    filterClocks () {
      let vue = this
      vue.resetTrips()
      vue.populateCompanyClocks()
    },
    viewUser (user) {
      let vue = this
      vue.days = []
      vue.tripDays = []
      vue.totalHours = 0
      vue.totalDistance = 0
      vue.totalTime = {
        hours: 0,
        minutes: 0,
        seconds: 0
      }
      vue.activeUser.id = user._id
      vue.activeUser.name = user.name
      vue.activeUser.companyId = user.companyId
      vue.activeUser.email = user.email
      vue.activeUser.admin = user.admin
      vue.populateUserClocks()
      vue.populateUserTrips()
      vue.modal = 'user'
    },
    resetTime () {
      let vue = this
      vue.totalHours = 0
      vue.totalTime = {
        hours: 0,
        minutes: 0,
        seconds: 0
      }
    },
    resetTrips () {
      let vue = this
      vue.totalDistance = 0
      vue.activeTrips = []
    },
    populateUserTrips () {
      let vue = this
      axios.get('https://api.tripclockmobile.com/trips/' + vue.activeUser.id + '/' + vue.tripsFilter, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
        .then(function (response) {
          vue.trips = []
          vue.trips = response.data
          let j = 0
          for (j = 0; j < response.data.length; j++) {
            if (vue.tripDays.length === 0) {
              vue.tripMatch = true
              let thing = response.data[j]
              vue.tripDays.push({day: thing.start.day, month: thing.start.month, visible: false, trips: [thing]})
              continue
            }
            let q = 0
            for (q = 0; q < vue.tripDays.length; q++) {
              if (vue.tripDays[q].month === response.data[j].start.month && vue.tripDays[q].day === response.data[j].start.day) {
                vue.tripMatch = true
                vue.activeTrips = vue.tripDays[q].trips
                let w = 0
                for (w = 0; w < vue.activeTrips.length; w++) {
                  if (vue.activeTrips[w].start.hours > response.data[j].start.hours) {
                    vue.tripDays[q].trips.splice((w), 0, response.data[j])
                    break
                  } else if (vue.activeTrips[w].start.hours === response.data[j].start.hours && vue.activeTrips[w].start.minutes > response.data[j].start.minutes) {
                    vue.tripDays[q].trips.splice((w), 0, response.data[j])
                    break
                  } else if (vue.activeTrips[w].start.hours === response.data[j].start.hours && vue.activeTrips[w].start.minutes === response.data[j].start.minutes) {
                    vue.tripDays[q].trips.splice((w), 0, response.data[j])
                    break
                  } else {
                    vue.tripDays[q].trips.push(response.data[j])
                    break
                  }
                }
              }
            }
            if (vue.tripMatch === true) {
              vue.tripMatch = false
            } else {
              let z = 0
              for (z = 0; z < vue.tripDays.length; z++) {
                if (vue.tripDays[z].month === response.data[j].start.month) {
                  if (vue.tripDays[z].day > response.data[j].start.day) {
                    vue.tripDays.splice((z), 0, {day: response.data[j].start.day, month: response.data[j].start.month, visible: false, trips: [response.data[j]]})
                    break
                  } else {
                    let thing = response.data[j]
                    vue.tripDays.push({day: thing.start.day, month: thing.start.month, visible: false, trips: [thing]})
                    break
                  }
                } else if (vue.tripDays[z].month > response.data[j].start.month) {
                  vue.tripDays.splice((z), 0, {day: response.data[j].start.day, month: response.data[j].start.month, visible: false, trips: [response.data[j]]})
                  break
                } else {
                  let thing = response.data[j]
                  vue.tripDays.push({day: thing.start.day, month: thing.start.month, visible: false, trips: [thing]})
                  break
                }
              }
            }
          }
          vue.countTrips()
        })
        .catch(err => {
          console.log(err)
        })
    },
    populateUserClocks () {
      let vue = this
      axios.get('https://api.tripclockmobile.com/clocks/' + vue.activeUser.id + '/' + vue.clocksFilter, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
        .then(function (response) {
          vue.clocks = []
          vue.clocks = response.data
          let j = 0
          for (j = 0; j < response.data.length; j++) {
            let q = 0
            for (q = 0; q < vue.days.length; q++) {
              if (vue.days[q].month === response.data[j].month && vue.days[q].day === response.data[j].day) {
                vue.dayMatch = true
                let w = 0
                let clockLength = vue.days[q].clocks.length - 1
                for (w = 0; w < vue.days[q].clocks.length; w++) {
                  if (vue.days[q].clocks[w].hours > response.data[j].hours) {
                    vue.days[q].clocks.splice((w), 0, response.data[j])
                    break
                  } else if (vue.days[q].clocks[w].hours === response.data[j].hours && vue.days[q].clocks[w].minutes > response.data[j].minutes) {
                    vue.days[q].clocks.splice((w), 0, response.data[j])
                    break
                  } else if (vue.days[q].clocks[w].hours === response.data[j].hours && vue.days[q].clocks[w].minutes === response.data[j].minutes) {
                    vue.days[q].clocks.splice((w), 0, response.data[j])
                    break
                  } else if (vue.days[q].clocks[clockLength].hours < response.data[j].hours) {
                    vue.days[q].clocks.push(response.data[j])
                    break
                  } else if (vue.days[q].clocks[clockLength].hours === response.data[j].hours && vue.days[q].clocks[clockLength].minutes < response.data[j].minutes) {
                    vue.days[q].clocks.push(response.data[j])
                    break
                  } else if (vue.days[q].clocks[clockLength].hours === response.data[j].hours && vue.days[q].clocks[clockLength].minutes === response.data[j].minutes) {
                    vue.days[q].clocks.push(response.data[j])
                    break
                  }
                }
              }
            }
            if (vue.dayMatch === true) {
              vue.dayMatch = false
            } else if (vue.days.length === 0) {
              vue.days.push({day: response.data[j].day, month: response.data[j].month, visible: false, clocks: [response.data[j]]})
            } else {
              let z = 0
              for (z = 0; z < vue.days.length; z++) {
                if (vue.days[z].month === response.data[j].month) {
                  if (vue.days[z].day > response.data[j].day) {
                    vue.days.splice((z), 0, {day: response.data[j].day, month: response.data[j].month, visible: false, clocks: [response.data[j]]})
                    break
                  } else {
                    vue.days.push({day: response.data[j].day, month: response.data[j].month, visible: false, clocks: [response.data[j]]})
                    break
                  }
                } else if (vue.days[z].month > response.data[j].month) {
                  vue.days.splice((z), 0, {day: response.data[j].day, month: response.data[j].month, visible: false, clocks: [response.data[j]]})
                  break
                } else {
                  vue.days.push({day: response.data[j].day, month: response.data[j].month, visible: false, clocks: [response.data[j]]})
                  break
                }
              }
            }
          }
          vue.countClocks()
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    populateCompanyClocks () {
      let vue = this
      let i = 0
      vue.days = []
      for (i = 0; i < vue.users.length; i++) {
        vue.activeUser.id = vue.users[i]._id
        vue.populateUserClocks()
      }
    },
    populateCompanyTrips () {
      let vue = this
      vue.totalDistance = 0
      let i = 0
      vue.tripDays = []
      for (i = 0; i < vue.users.length; i++) {
        vue.activeUser.id = vue.users[i]._id
        vue.populateUserTrips()
      }
    },
    countClocks () {
      let vue = this
      vue.resetTime()
      let q = 0
      for (q = 0; q < vue.days.length; q++) {
        let i = 0
        for (i = 0; i < vue.days[q].clocks.length; i++) {
          let clockType = vue.days[q].clocks[i].clockType
          if (clockType === 'in' || clockType === 'lunch in') {
            vue.startTime = {
              hours: vue.days[q].clocks[i].hours,
              minutes: vue.days[q].clocks[i].minutes,
              seconds: vue.days[q].clocks[i].seconds
            }
          } else if (clockType === 'out' || clockType === 'lunch out') {
            vue.endTime = {
              hours: vue.days[q].clocks[i].hours,
              minutes: vue.days[q].clocks[i].minutes,
              seconds: vue.days[q].clocks[i].seconds
            }
            vue.totalTime = {
              hours: Decimal(Math.abs(Decimal(vue.endTime.hours).sub(vue.startTime.hours).toNumber())).add(vue.totalTime.hours).toNumber(),
              minutes: Decimal(Math.abs(Decimal(vue.endTime.minutes).sub(vue.startTime.minutes).toNumber())).add(vue.totalTime.minutes).toNumber(),
              seconds: Decimal(Math.abs(Decimal(vue.endTime.seconds).sub(vue.startTime.seconds).toNumber())).add(vue.totalTime.seconds).toNumber()
            }
          }
        }
        let secToMin = Math.floor(Decimal(vue.totalTime.seconds).div(60).toNumber())
        let minToHour = Math.floor(Decimal(vue.totalTime.minutes).div(60).add(secToMin).toNumber())
        vue.totalHours = Decimal(vue.totalTime.hours).add(minToHour).toNumber()
      }
    },
    countTrips () {
      let vue = this
      let i = 0
      for (i = 0; i < vue.trips.length; i++) {
        let distance = vue.trips[i].distance
        let distanceConv = Math.floor(Decimal(distance).div(1609.34))
        vue.totalDistance = Decimal(vue.totalDistance).add(distanceConv).toNumber()
      }
    },
    viewClock (clock) {
      let vue = this
      vue.activeClock.userId = clock.userId
      vue.activeClock.clockType = clock.clockType
      vue.activeClock.month = clock.month
      vue.activeClock.day = clock.day
      vue.activeClock.hours = clock.hours
      vue.activeClock.minutes = clock.minutes
      vue.activeClock.seconds = clock.seconds
      vue.activeClock.latitude = clock.latitude
      vue.activeClock.longitude = clock.longitude
      vue.activeClock.altitude = clock.altitude
      vue.coordinates = [vue.activeClock.longitude, vue.activeClock.latitude]
      vue.pane = 'readout'
      vue.modal = 'clock'
    },
    viewTrip (trip) {
      let vue = this
      vue.activeTrip.userId = trip._id
      vue.activeTrip.distance = trip.distance
      vue.activeTrip.start.month = trip.start.month
      vue.activeTrip.start.day = trip.start.day
      vue.activeTrip.start.hour = trip.start.hour
      vue.activeTrip.start.minute = trip.start.minute
      vue.activeTrip.start.second = trip.start.second
      vue.activeTrip.end.month = trip.end.month
      vue.activeTrip.end.day = trip.end.day
      vue.activeTrip.end.hour = trip.end.hour
      vue.activeTrip.end.minute = trip.end.minute
      vue.activeTrip.end.second = trip.end.second
      vue.activeTrip.start.latitude = trip.start.latitude
      vue.activeTrip.start.longitude = trip.start.longitude
      vue.activeTrip.end.latitude = trip.end.latitude
      vue.activeTrip.end.longitude = trip.end.longitude
      vue.startCoordinates = [trip.start.longitude, trip.start.latitude]
      vue.endCoordinates = [trip.end.longitude, trip.end.latitude]
      vue.pane = 'readout'
      vue.modal = 'trip'
    },
    tripZoom () {
      let vue = this
      vue.x = vue.activeTrip.start.longitude
      vue.y = vue.activeTrip.start.latitude
      vue.a = vue.activeTrip.end.longitude
      vue.b = vue.activeTrip.end.latitude
      vue.x = Decimal(vue.x).toNumber()
      vue.y = Decimal(vue.y).toNumber()
      vue.a = Decimal(vue.a).toNumber()
      vue.b = Decimal(vue.b).toNumber()
      if (vue.x > vue.a) {
        vue.minx = vue.a
        vue.maxx = vue.x
      } else {
        vue.minx = vue.x
        vue.maxx = vue.a
      }
      if (vue.y > vue.b) {
        vue.miny = vue.b
        vue.maxy = vue.y
      } else {
        vue.miny = vue.y
        vue.maxy = vue.b
      }
      if (vue.maxx !== vue.minx) {
        vue.diffx = Decimal(vue.maxx).sub(vue.minx).toNumber()
      } else {
        vue.diffx = 0
      }
      if (vue.maxy !== vue.miny) {
        vue.diffy = Decimal(vue.maxy).sub(vue.miny).toNumber()
      } else {
        vue.diffy = 0
      }
      vue.cx = Decimal(vue.diffx).div(2).add(vue.minx).toNumber()
      vue.cx = vue.cx.toString()
      vue.cy = Decimal(vue.diffy).div(2).add(vue.miny).toNumber()
      vue.cy = vue.cy.toString()
      vue.zoomNum = Decimal(vue.diffx).add(vue.diffy).toNumber()
      console.log(vue.zoomNum)
      if (vue.zoomNum >= 20) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 3
        })
      } else if (vue.zoomNum >= 10) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 4
        })
      } else if (vue.zoomNum >= 5) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 5
        })
      } else if (vue.zoomNum >= 4) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 6
        })
      } else if (vue.zoomNum >= 3) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 7
        })
      } else if (vue.zoomNum >= 2.5) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 8
        })
      } else if (vue.zoomNum >= 2) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 9
        })
      } else if (vue.zoomNum >= 1.5) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 10
        })
      } else if (vue.zoomNum >= 1) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 11
        })
      } else if (vue.zoomNum >= 0.5) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 12
        })
      } else if (vue.zoomNum >= 0.1) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 13
        })
      } else if (vue.zoomNum >= 0.05) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 14
        })
      } else if (vue.zoomNum >= 0.001) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 15
        })
      } else if (vue.zoomNum >= 0.0001) {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 16
        })
      } else {
        vue.map.jumpTo({
          center: [vue.cx, vue.cy],
          zoom: 15
        })
      }
    },
    mapLoaded (map) {
      let vue = this
      vue.map = map
      if (vue.modal === 'clock') {
        vue.addMarker()
        vue.map.jumpTo({
          center: [vue.activeClock.longitude, vue.activeClock.latitude],
          zoom: 14
        })
      } else if (vue.modal === 'trip') {
        vue.addMarkers()
        vue.tripZoom()
      } else {
        vue.addMarkers()
        vue.map.jumpTo({
          center: vue.startCoordinates,
          zoom: 14
        })
      }
    },
    addMarker () {
      let vue = this
      new mapboxgl.Marker(vue.marker)
        .setLngLat(vue.coordinates)
        .addTo(vue.map)
    },
    addMarkers () {
      let vue = this
      new mapboxgl.Marker(vue.markerStart)
        .setLngLat(vue.startCoordinates)
        .addTo(vue.map)
      new mapboxgl.Marker(vue.markerEnd)
        .setLngLat(vue.endCoordinates)
        .addTo(vue.map)
    }
  },
  computed: {
    analyticsLogic: function () {
      let vue = this
      return {
        analytics: true,
        fixed: vue.modal === 'clock' || vue.modal === 'time' || vue.modal === 'trip'
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

.analytics {
  height: 100%;
  display: grid;
  width: 100%;
  margin: 0;
  grid-template-rows: repeat(5, 100px);
  grid-template-columns: 1fr 1fr 1fr 1fr;
  overflow-y: scroll;
}

.fixed {
  position: fixed;
}

#map {
  width: 100%;
  height: 45%;
  bottom: 0;
  left: 0;
  right: 0;
  position: fixed !important;
}

.timeTab {
  grid-column-start: 1;
  grid-column-end: 3;
  text-align: center;
  background-image: url('../../assets/noise.png');
  height: 30px;
  color: #fff;
  width: 80%;
  margin-left: 10%;
  line-height: 25px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  box-shadow: 0px 2px 5px black;
}

.mileTab {
  grid-column-start: 3;
  grid-column-end: 5;
  text-align: center;
  background-image: url('../../assets/noise.png');
  height: 30px;
  color: #fff;
  margin-left: 10%;
  line-height: 25px;
  width: 80%;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  box-shadow: 0px 2px 5px black;
}

.globalSearch {
  grid-row: 4;
  grid-column-start: 1;
  grid-column-end: 5;
  width: 100%;
  height: 40px;
  border: 1px solid black;
}

.graphsPane {
  margin-top: 10px;
  grid-row-start: 1;
  grid-row-end: 3;
  grid-column-start: 1;
  grid-column-end: 5;
  border: 3px solid #444;
  border-radius: 5px;
  width: 96%;
  margin-left: 2%;
  box-shadow: 0px 2px 5px black;
  background-color: white;
}

.modals {
  grid-row: 4;
  margin-top: -70px;
  grid-column-start: 1;
  grid-column-end: 5;
  width: 90%;
  margin-left: 5%;
}

.back {
  margin-top: 6%;
  width: 45%;
  color: #fff;
  height: 30px;
  font-size: 1.2em;
  font-weight: 400;
  background-image: url('../../assets/noisered.png');
  border: none;
  border-radius: 5px;
  box-shadow: 0px 2px 5px black;
}

.mapBack {
  background-color: @red;
  color:  #fff;
  border: none;
  padding: 4px;
  width: 20%;
  position: fixed;
  border-radius: 5px;
}
h1 {
  font-size: 2em;
  text-align: center;
  font-weight: 500;
  color: #333;
}
h4 {
  font-size: 1em;
  color: #325e99;
  line-height: 10px;
  margin-left: 5%;
  text-decoration: underline;
}

h5 {
  margin-top: 0px;
  margin-bottom: 0px;
  font-size: 1em;
  height: 30px;
  padding-left: 5%;
}

h3 {
  font-size: 1em;
  margin: 0;
  margin-left: 5%;
}

input {
  border: 1px solid #000;
  width: 100%;
  margin-top: 10px;
  height: 40px;
  padding-left: 5%;
  margin-bottom: 5%;
}

.user {
  width: 100%;
  border-bottom: 1px solid #000;
  padding-left: 5%;
  height: 30px;
}

.clocks {
  padding-top: 0;
  height: 40px;
  width: 100%;
  padding-left: 5%;
  border-top: 1px solid black;
  background-color: white;
}
.clockDay {
  padding: none;
  box-shadow: 0px 1px 5px black;
}
.trips {
  padding-top: 0;
  height: 40px;
  width: 100%;
  padding-left: 5%;
  border-top: 1px solid black;
  background-color: white;
}
.tripDay {
  padding: none;
  box-shadow: 0px 1px 5px black;
}
.date {
  margin-top: 15px;
  color: white;
  background-image: url('../../assets/noise.png');
}
.tripsFilter, .clocksFilter {
  border: 1px solid black;
  margin-left: 5%;
}
.tripsFilterActivate, .clocksFilterActivate {
  color: white;
  background-image: url('../../assets/noise.png');
  border-radius: 5px;
}

@media only screen
  and (min-device-width : 414px)
  and (max-device-width : 736px) {
    .analytics {
      margin-top: 40px;
    }
  }

@media only screen
  and (min-device-width : 375px)
  and (max-device-width : 667px) {
    .analytics {
      margin-top: 40px;
    }
  }

@media only screen
  and (min-device-width : 375px)
  and (max-device-width : 812px)
  and (-webkit-device-pixel-ratio : 3) {
    .analytics {
      margin-top: 40px;
    }
  }
</style>
