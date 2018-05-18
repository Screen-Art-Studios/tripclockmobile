<template>
  <div class="main">
    <div class="accountView" v-if="accountView==='view'">
      <h2 class="name">Name:<br/>{{activeUser.name}}</h2>
      <h2 class="email">Email: {{activeUser.email}}</h2>
      <button class="accountEditButton" v-on:click="$emit('account', 'edit')">Edit Account</button>
      <button class="back" v-on:click="$emit('account')">Back</button>
    </div>
    <div class="accountEdit" v-else-if="accountView==='edit'">
      <input class="nameEdit" v-model="activeUser.name" placeholder="Name">
      <input class="emailEdit" v-model="activeUser.email" placeholder="user@example.com">
      <button class="submitEdit" v-on:click="updateUser">Submit</button>
      <button class="back" v-on:click="$emit('account', 'view')">Back</button>
    </div>
    <div class="updatePass" v-else-if="accountView==='pass'">
      <input class="passwordEdit" v-model="activeUser.password" placeholder="********" v-if="!showPass" type="password">
      <input class="passwordEdit" v-model="activeUser.password" placeholder="********" v-if="showPass">
      <button class="togglePass" v-on:click="showPass = !showPass" v-if="!showPass">Show Password</button>
      <button class="togglePass" v-on:click="showPass = !showPass" v-if="showPass">Hide Password</button>
      <button class="submitUpdatePass" v-on:click="updatePass">Submit</button>
      <button class="back" v-on:click="$emit('account')">Back</button>
    </div>
    <div class="success" v-else-if="accountView==='success'">
      <h1>Success!!</h1>
      <button class="back" v-on:click="$emit('account')">Back</button>
    </div>
    <analytics class="analyticsComponent" v-on:back="$emit('account')" v-else-if="accountView==='analytics'" :user="user"></analytics>
    <div class="accountHome" v-else>
      <h1>Account</h1>
      <button class="analytics" v-on:click="$emit('account', 'analytics')" v-if="user.admin">Analytics</button>
      <button class="update" v-on:click="$emit('account', 'pass')">Update Password</button>
      <button class="viewAccount" v-on:click="$emit('account', 'view')">View Account</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Analytics from './elements/Analytics'

export default {
  name: 'account',
  components: {
    'analytics': Analytics
  },
  props: ['logged', 'user', 'accountView'],
  data () {
    return {
      modal: '',
      showPass: false,
      activeUser: {
        id: '',
        email: '',
        password: '',
        name: ''
      }
    }
  },
  created () {
    if (this.logged !== true) {
      this.$router.push('/login')
    }
    this.populateActiveUser()
  },
  methods: {
    updateUser () {
      let vue = this
      axios.put('https://api.tripclockmobile.com/users/' + vue.user.id, {
        email: vue.activeUser.email,
        name: vue.activeUser.name
      }, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
        .then(function (user) {
          vue.activeUser.email = user.data.email
          vue.activeUser.name = user.data.name
          vue.$emit('account', 'view')
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    updatePass () {
      let vue = this
      axios.put('https://api.tripclockmobile.com/users/' + vue.user.id, {
        password: vue.activeUser.password
      }, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
        .then(function (user) {
          vue.$emit('account', 'success')
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    clearActiveUser () {
      let vue = this
      vue.activeUser.email = ''
      vue.activeUser.name = ''
    },
    populateActiveUser () {
      let vue = this
      axios.get('https://api.tripclockmobile.com/users/' + vue.user.id, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
        .then(function (response) {
          vue.activeUser.email = response.data.email
          vue.activeUser.name = response.data.name
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    registerUser () {
      let vue = this
      axios.post('https://api.tripclockmobile.com/users', {
        email: vue.activeUser.email,
        password: vue.activeUser.password,
        name: vue.activeUser.name
      })
        .then(function () {
          vue.$emit('account', 'success')
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }
}
</script>

<style scoped lang="less">
@red: #c90c2e;
@grey: #323d38;

.main {
  width: 100%;
  height: 100%;
  margin-top: 100px;
}

h1 {
  color: @red;
  text-align: center;
}

h2 {
  width: 90%;
  font-size: 1.5em;
  border: 2px solid @grey;
  padding-left: 5%;
  margin-left: 5%;
}

input {
  width: 90%;
  font-size: 1.5em;
  background-color: #fff;
  border: 2px solid @red;
  padding-left: 5%;
  margin-left: 5%;
}

select option[data-default] {
  color: #888;
}

button {
  background: @grey;
  border: none;
  color: #fff;
  font-size: 2em;
  width: 90%;
  margin-bottom: 20px;
  margin-left: 5%;
  border-radius: 5px;
}

.accountView {
  margin-top: 60px;
  width: 100%;
  position: fixed;
}

.accountHome {
  margin-top: 10px;
  width: 100%;
  position: fixed;
}

.accountEdit {
  margin-top: 60px;
  position: fixed;
}

.accountEditButton {
  margin-bottom: 20px;
  background-color: @grey;
}

.submitEdit {
  margin-top: 20px;
  background-color: @red;
}

.nameEdit {
  border: 1px solid @red;
  width: 90%;
  margin-top: 20px;
  height: 40px;
}

.emailEdit {
  border: 1px solid @red;
  width: 90%;
  margin-top: 20px;
  height: 40px;
}

.updatePass {
  margin-top: 80px;
  position: fixed;
}

.togglePass {
  margin-top: 20px;
}
</style>
