<template>
  <div class="main">
    <div class="registerModal" v-if="modal==='register'">
      <h1>Register</h1>
      <h3 v-if="error">Missing Inputs</h3>
      <input class="name" v-model="name" placeholder="First Name">
      <input class="email" v-model="email" placeholder="user@example.com">
      <input class="password" v-model="password" placeholder="*********" type="password" v-if="!showPass" v-on:keypress.enter="registerUser">
      <input class="password" v-model="password" placeholder="*********" v-if="showPass" v-on:keypress.enter="registerUser">
    </div>
    <div class="companyRegister" v-else>
      <h1>Register a new Company Code</h1>
      <h4>it can be any combination of letter and numbers*</h4>
      <h3 v-if="error">Missing Inputs</h3>
      <h3 v-if="taken">Company Code Taken</h3>
      <input class="companyCode" v-model="companyId" placeholder="Company Code">
      <input class="companyName" v-model="companyName" placeholder="Company Name">
      <button class="submitCompany" v-on:click="submitCompany">Submit</button>
      <button class="back" v-on:click="$router.push('/login')">Back</button>
    </div>
    <div v-show="modal==='register'">
      <div class="form-row">
        <div id="card-element"></div>
        <div id="card-errors" role="alert"></div>
      </div>
      <button class="togglePass" v-on:click="showPass = !showPass" v-if="!showPass">Show Password</button>
      <button class="togglePass" v-on:click="showPass = !showPass" v-if="showPass">Hide Password</button>
      <button class="back" v-on:click="modal=''; error=false">Back</button>
      <button class="submitRegister" v-on:click="submitCard">Submit</button>
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
      showPass: false,
      email: '',
      password: '',
      name: '',
      company: false,
      payment: false,
      companyId: '',
      companyName: '',
      stripeSource: '',
      error: false,
      taken: false,
      stripe: '',
      card: ''
    }
  },
  methods: {
    registerUser () {
      let vue = this
      if (vue.company === true) {
        axios.post('https://api.tripclockmobile.com/companys', {
          companyId: vue.companyId,
          companyName: vue.companyName
        })
          .then(function () {
            vue.error = false
          })
          .catch(function (error) {
            console.log(error)
            vue.error = true
          })
      }
      axios.post('https://api.tripclockmobile.com/users', {
        email: vue.email,
        password: vue.password,
        name: vue.name,
        companyId: vue.companyId,
        admin: vue.company,
        payment: vue.payment,
        stripeSource: vue.stripeSource
      })
        .then(function (user) {
          vue.$emit('register', {token: user.data.token, id: user.data.userId, admin: user.data.admin})
        })
        .catch(function (error) {
          console.log(error)
          vue.error = true
        })
    },
    submitCompanyId () {
      let vue = this
      axios.get('https://api.tripclockmobile.com/companys/' + vue.companyId)
        .then(function (response) {
          vue.companyName = response.data[0].companyName
          vue.modal = 'register'
          vue.company = false
          vue.error = false
        })
        .catch(function (error) {
          console.log(error)
          vue.error = true
        })
    },
    submitCompany () {
      let vue = this
      axios.get('https://api.tripclockmobile.com/companys/' + vue.companyId)
        .then(function (response) {
          if (response.data.length === 0) {
            vue.company = true
            vue.modal = 'register'
            var stripe = window.Stripe('')
            vue.stripeSetup(stripe)
          } else {
            vue.taken = true
          }
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    stripeSetup (stripe) {
      let vue = this
      vue.stripe = stripe
      var elements = stripe.elements()
      var style = {
        base: {
          color: '#32325d',
          lineHeight: '18px',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
      vue.card = elements.create('card', {style: style})
      vue.card.mount('#card-element')
      vue.card.addEventListener('change', function (event) {
        var displayError = document.getElementById('card-errors')
        if (event.error) {
          displayError.textContent = event.error.message
        } else {
          displayError.textContent = ''
        }
      })
    },
    submitCard () {
      let vue = this
      vue.stripe.createSource(vue.card).then(function (result) {
        if (result.error) {
          const errorElement = document.getElementById('card-errors')
          errorElement.textContent = result.error.message
          console.log(result.error)
        } else {
          vue.stripeSourceHandler(result.source.id)
        }
      })
    },
    stripeSourceHandler (source) {
      let vue = this
      vue.stripeSource = source
      vue.payment = true
      vue.registerUser()
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
    background-image: url('../assets/noise2.jpg');
    position: fixed;
    height: 100%;
    width: 100%;
    padding-top: 80px;
  }

  h1 {
    color: @red;
    text-align: center;
    font-size: 2.5em;
    margin: 0;
    width: 80%;
    margin-left: 10%;
    margin-top: 200px;
    margin-bottom: 20px;
    font-weight: 300;
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
    background-image: url('../assets/noise.png');
    color: #fff;
    border: none;
    font-size: 1.5em;
    margin-left: 10px;
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
    background-image: url('../assets/noisered.png');
  }

  @media (min-width: 700px) {
  }
</style>
