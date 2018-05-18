<template>
  <div class="main">
    <h1>Your Foolproof Time Management System</h1>
    <p>
      When managing your business, you need innovative and reliable tools to increase
your profits and cut your costs. Timecrunch allows your business to manage
employees with precision.
Time tracking and GPS location monitoring support your company financially &amp;
logistically, giving the ability to coordinate like never before.
If it&#39;s time to add a dependable tool to you business&#39;s arsenal - Timecrunch is here
for you.
    </p>
    <h1 v-if="success">Success!!!</h1>
    <h1 v-if="wrong">Error</h1>
    <h2>Sign up for More INformation on TimeCrunch!</h2>
    <input class="email" v-model="email" placeholder="email"></input>
    <button class="submit"  v-on:click="subscribe">Sign Up</button>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'landing',
  data () {
    return {
      email: '',
      success: false,
      wrong: false
    }
  },
  methods: {
    subscribe () {
      let vue = this
      if (vue.email !== '') {
        axios.post('https://api.tripclockmobile.com/leads', {
          email: vue.email.toLowerCase()
        })
          .then(response => {
            vue.success = true
          })
          .catch(response => {
            console.log(response)
            this.wrong = true
          })
      }
    }
  }
}
</script>

<style scoped lang="less">
@red: #c90c2e;
@grey: #323d38;
  .main {
    margin-top: 100px;
  }
  h1 {
    text-align: center;
    font-size: 2em;

  }
  p {
    margin-left: 5%;
  }
  h2 {
    color: @red;
    margin-left: 5%;
  }
  .email {
    border: 1px solid @grey;
    margin-left: 5%;
    height: 25px;
    width: 60%
  }
  .submit {
    margin-left: 5%;
    background-color: @red;
    color: #fff;
    border: none;
    border-radius: 5px;
    height: 30px;
  }
</style>
