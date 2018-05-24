<template>
  <div class="main">
    <h1>Log-In</h1>
    <div class="loginBox">
      <div class="emailTitle">Email</div>
      <input class="email" placeholder="user@example.com" v-model="email" type="email">
      <div class="passwordTitle">Password</div>
      <input class="password" placeholder="*********" v-model="password" type="password" v-on:keypress.enter="login">
      <h3 class="logged">Stay Logged In?<input class="logButton" type="checkbox" v-model="stayLogged"></h3>
      <button class="login" v-on:click="login">Submit</button>
      <h2 class="registerlink" v-on:click="$router.push('/Register')">Create a New Account Here</h2>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Login',
  props: ['logged'],
  data () {
    return {
      email: '',
      password: '',
      stayLogged: false,
      user: {
        token: '',
        id: '',
        companyId: '',
        admin: false
      }
    }
  },
  created () {
    if (this.logged === true) {
      this.$router.push('/')
    }
  },
  methods: {
    login () {
      let vue = this
      axios.post('https://api.tripclockmobile.com/users/login', {
        email: vue.email.toLowerCase(),
        password: vue.password
      })
        .then(response => {
          if (response.status !== 401) {
            vue.user.token = response.data.token
            vue.user.id = response.data.userId
            vue.user.companyId = response.data.companyId
            vue.user.admin = response.data.admin
            if (vue.stayLogged === true) {
              localStorage.setItem('token', response.data.token)
              localStorage.setItem('userId', response.data.userId)
              localStorage.setItem('companyId', response.data.companyId)
              localStorage.setItem('admin', response.data.admin)
            } else {
              localStorage.removeItem('token')
              localStorage.removeItem('userId')
              localStorage.removeItem('companyId')
              localStorage.removeItem('admin')
            }
            vue.$emit('login', vue.user)
          }
        })
        .catch(response => {
          console.log(response)
          this.wrong = true
        })
    }
  }
}
</script>

<style scoped lang="less">
  @font: raleway;
  @red: #751d1d;
  @grey: #323d38;

  .main {
    background-image: url('../assets/noise2.jpg');
    position: fixed;
    height: 100%;
    width: 100%;
    padding-top: 100px;
  }

  h1, h2, h3{
    margin: 0;
  }

  h1 {
    color: @red;
    text-align: center;
    font-size: 3.5em;
    font-weight: 400;
  }

  .loginBox {
    display: grid;
    grid-template-columns: 1fr repeat(4, 20%) 1fr;
    grid-template-rows: 40px 30px 40px 30px 40px repeat(4, 30px);
  }

  input.email, input.password {
    padding-left: 5px;
    font-size: 1.2em;
    border: 1.5px solid @grey;
    grid-column-start: 2;
    grid-column-end: 6;
  }

  ::placeholder {
    color: grey;
    font-size: 1em;
  }

  .emailTitle, .passwordTitle {
    margin-left: 5px;
    grid-column: 2;
    margin-top: 10px;
  }

  .emailTitle {
    grid-row: 2;
  }

  .passwordTitle {
    grid-row: 4;
  }

  input.email {
    grid-row: 3;
  }

  input.password {
    grid-row: 5;
  }

  .logged {
    font-size: 1.25em;
    grid-row-start: 6;
    grid-row-end: 7;
    grid-column-start: 2;
    grid-column-end: 5;
    padding-top: 20px;
    margin-left: 10px;
  }

  .logButton {
    margin-left: 10px;
  }

  button {
    background-image: url('../assets/noise.png');
    color: #fff;
    border: none;
    font-size: 1em;
    border-radius: 5px;
    grid-row: 7;
    grid-column-start: 5;
    grid-column-end: 6;
    width: 90%;
    box-shadow: 0px 2px 5px black;
  }

  .registerlink {
    font-size: 1.25em;
    color: #555;
    grid-row: 9;
    grid-column-start: 2;
    grid-column-end: 6;
    text-align: center;
    text-decoration: underline;
    text-decoration-color: grey;
  }

  @media (min-width: 700px) {
  }
</style>
