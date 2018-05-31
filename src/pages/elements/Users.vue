<template>
  <div class="main">
    <div class="questionModal" v-if="modal==='question'">
      <h2>Should we email the employee their credentials?</h2>
      <button class="yesQuestion" v-on:click="emailRegister()">Yes</button>
      <button class="noQuestion" v-on:click="registerUser()">No</button>
    </div>
    <div class="waitingModal" v-else-if="modal==='wait'">
      <h2>Please Wait</h2>
    </div>
    <div class="registerModal" v-else-if="modal==='register'">
      <h1>Register</h1>
      <h3 v-if="error">Missing Inputs</h3>
      <input class="name" v-model="name" placeholder="First Name">
      <input class="email" v-model="email" placeholder="user@example.com">
      <div class="adminInput">
        <h5>Admin</h5>
        <input type="checkbox" v-model="admin">
      </div>
      <input class="password" v-model="password" placeholder="*********" type="password" v-if="!showPass" v-on:keypress.enter="modal='question'">
      <input class="password" v-model="password" placeholder="*********" v-if="showPass" v-on:keypress.enter="modal='question'">
      <button class="togglePass" v-on:click="showPass = !showPass" v-if="!showPass">Show Password</button>
      <button class="togglePass" v-on:click="showPass = !showPass" v-if="showPass">Hide Password</button>
      <button class="editBack" v-on:click="modal=''; resetUsers">Back</button>
      <button class="registerUser" v-on:click="modal='question'">Register User</button>
    </div>
    <div class="editModal" v-else-if="modal==='edit'">
      <h1>Edit User</h1>
      <h3 v-if="error">Missing Inputs</h3>
      <input class="name" v-model="name" placeholder="First Name">
      <input class="email" v-model="email" placeholder="user@example.com">
      <div class="adminInput">
        <h5 v-if="!payment">Admin</h5>
        <input type="checkbox" v-model="admin" v-if="!payment">
      </div>
      <button class="updateUser" v-on:click="updateUser">Update User</button>
      <button class="deleteUser" v-on:click="deleteUser" v-if="!payment">Delete User</button>
      <button class="editBack" v-on:click="modal=''; resetUsers">Back</button>
    </div>
    <div class="viewModal" v-else-if="modal==='view'">
      <h2>User</h2>
      <h3>Name: {{ name }}</h3>
      <h3>Email: {{ email }}</h3>
      <h3>Admin: {{ admin }}</h3>
      <button class="viewEdit" v-on:click="modal='edit'">Edit User</button>
      <button class="viewBack" v-on:click="modal=''">Back</button>
    </div>
    <div class="mainModal" v-else>
      <h2>Users: {{ users.length }}</h2>
      <button v-on:click="modal='register'">Register a new User</button>
      <h3>User List</h3>
      <div class="users" v-for="user in users" v-bind:key="user.id">
        <span class="userInline" v-on:click="viewUser(user)">-{{ user.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Register',
  props: ['logged', 'user'],
  data () {
    return {
      modal: '',
      users: [],
      userId: '',
      showPass: false,
      email: '',
      password: '',
      name: '',
      admin: false,
      error: false,
      emailUser: false,
      payment: false
    }
  },
  created () {
    let vue = this
    axios.get('https://api.tripclockmobile.com/users/all/' + vue.user.companyId, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
      .then(function (response) {
        vue.users = response.data
      })
      .catch(function (error) {
        console.log(error)
      })
  },
  methods: {
    emailRegister () {
      let vue = this
      vue.emailUser = true
      vue.registerUser()
      vue.emailUser = false
    },
    viewUser (user) {
      let vue = this
      vue.name = user.name
      vue.email = user.email
      vue.admin = user.admin
      vue.userId = user._id
      vue.payment = user.payment
      vue.modal = 'view'
    },
    resetUsers () {
      let vue = this
      axios.get('https://api.tripclockmobile.com/users/all/' + vue.user.companyId, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
        .then(function (response) {
          vue.users = response.data
        })
        .catch(function (error) {
          console.log(error)
        })
      vue.resetUser()
    },
    resetUser () {
      let vue = this
      vue.name = ''
      vue.email = ''
      vue.admin = false
      vue.userId = ''
      vue.payment = false
    },
    updateUser () {
      let vue = this
      axios.put('https://api.tripclockmobile.com/users/' + vue.userId, {
        email: vue.email,
        name: vue.name,
        admin: vue.admin
      }, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
        .then(function (user) {
          vue.email = user.data.email
          vue.name = user.data.name
          vue.admin = user.data.admin
          vue.modal = 'view'
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    deleteUser () {
      let vue = this
      axios.delete('https://api.tripclockmobile.com/users/' + vue.userId, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
        .then(function (response) {
          vue.modal = ''
          vue.resetUsers()
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    registerUser () {
      let vue = this
      vue.modal = 'wait'
      axios.post('https://api.tripclockmobile.com/users', {
        email: vue.email,
        password: vue.password,
        name: vue.name,
        companyId: vue.user.companyId,
        admin: vue.admin,
        emailUser: vue.emailUser
      })
        .then(function (user) {
          vue.resetUsers()
          vue.modal = ''
        })
        .catch(function (error) {
          console.log(error)
          vue.error = true
        })
    }
  }
}
</script>

<style scoped lang="less">
@red: #9e2f2f;
@grey: #323d38;
@green: #1bad4a;
@blue: #325e99;

  .main {
    background-image: url('../../assets/noise2.jpg');
    position: fixed;
    height: 100%;
    width: 100%;
  }

  .registerModal {
  }

  .mainModal {
    width: 100%;
    margin-top: 10px;
  }

  h1 {
    color: @red;
    text-align: center;
    font-size: 2.5em;
    margin: 0;
    width: 80%;
    margin-left: 10%;
    margin-bottom: 20px;
    font-weight: 300;
  }

  h2 {
    text-align: center;
    margin-top: 10px;
  }

  h3 {
    text-align: center;
    margin-top: 10px;
  }

  h5 {
    text-align: center;
    grid-column: 1;
    width: 100%;
    height: 2em;
    font-size: 1em;
    margin: 0;
    padding: 0;
  }

  .adminInput {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 3em;
    padding-top: .5em;
    padding-bottom:  .5em;
  }

  .adminInput input {
    padding-top: 20%;
    padding-right: 40%;
    height: 2em;
  }

  .userInline {
    text-align: center;
    margin-top: 10px;
    width: 100%;
  }

  .users {
    text-align: center;
    margin-top: 10px;
    width: 100%;
  }

  button {
    margin-left: 5%;
    text-align: center;
    margin-top: 10px;
    width: 90%;
  }

  select option[data-default] {
    color: #888;
  }

.StripeElement {
  background-color: white;
  height: 40px;
  width: 90%;
  margin-left: 5%;
  padding: 10px 12px;
  border: 1px solid @grey;
  box-shadow: 0 1px 3px 0 #e6ebf1;
  -webkit-transition: box-shadow 150ms ease;
  transition: box-shadow 150ms ease;
}

.StripeElement--focus {
  box-shadow: 0 1px 3px 0 #cfd7df;
}

.StripeElement--invalid {
  border-color: @grey;
}

.StripeElement--webkit-autofill {
  background-color: #fefde5 !important;
}

  button {
    background-image: url('../../assets/noise.png');
    color: #fff;
    border: none;
    font-size: 1.5em;
    border-radius: 5px;
    box-shadow: 0px 2px 5px black;
  }

  input {
    border: 1px solid @grey;
    width: 90%;
    margin-left: 5%;
    border-radius: 0;
    height: 40px;
    margin-bottom: 10px;
  }

  .role {
    border: 1px solid @grey;
    width: 90%;
    margin-left: 5%;
    height: 40px;
    margin-bottom: 10px;
  }

  .togglePass {
    width: 50%;
    margin-left: 20px;
  }

  .submitRegister {
    width: 90%;
    height: 40px;
    margin-left: 5%;
    margin-top: 10px;
  }

  .submitCompany {
    width: 90%;
    height: 50px;
    margin-left: 5%;
  }

  .submitEmployee {
    width: 90%;
    height: 50px;
    margin-left: 5%;
  }

  .companyRegisterButton {
    width: 90%;
    height: 50px;
    margin-left: 5%;
  }

  .exception {
    width: 90%;
    margin-left: 5%;
    display: grid;
    grid-template-rows: 50px 20px;
    grid-template-columns: 1fr 1fr;
  }

  .employeeRegisterButton {
    grid-row: 1;
    grid-column-start: 1;
    grid-column-end: 4;
    height: 50px;
    margin: 0;
    margin-top: 10px;
  }

  h4 {
    grid-row: 2;
    grid-column: 3;
    font-size: 0.9em;
    margin: 0;
    color: @red;
  }

  .back {
    width: 34%;
    margin-left: 5%;
    margin-top: 10px;
    background-image: url('../../assets/noisered.png');
  }

  @media (min-width: 700px) {
  }
</style>
