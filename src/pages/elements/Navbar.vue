<template>
  <div class="main">
    <div class="navbar">
        <button class="Home" v-on:click="$router.push('/')" v-if="logged"></button>
        <h1 class="Homet" v-on:click="$router.push('/')" v-if="logged">Home</h1>
        <button class="Login" v-on:click=" $router.push('/Login')" v-if="!logged"></button>
        <h1 class="Logint" v-on:click=" $router.push('/Login')" v-if="!logged">Login</h1>
        <button class="Reg" v-on:click=" $router.push('/Register')" v-if="!logged"></button>
        <h1 class="Regt" v-on:click=" $router.push('/Register')" v-if="!logged">Register</h1>
        <button class="Account" v-on:click=" $router.push('/Account'); $emit('account')" v-if="logged"></button>
        <h1 class="Accounta" v-on:click="$router.push('/Account')" v-if="logged">Account</h1>
        <button class="Logout" v-on:click=" $emit('logout')" v-if="logged"></button>
        <h1 class="Logouta" v-on:click=" $emit('logout')" v-if="logged">Logout</h1>
    </div>
  </div>
</template>

<script>
export default {
  name: 'navbar',
  props: ['logged', 'user'],
  data () {
    return {
      toggled: false,
      isToggled: false,
      first: true
    }
  },
  methods: {
    navToggle: function () {
      // Nav button functionality
      if (window.innerWidth < 700) {
        if (this.toggled === false) {
          this.toggled = true
          this.isToggled = true
          this.first = false
        } else if (this.toggled === true) {
          this.toggled = false
          this.isToggled = false
        }
      } else {
        this.$router.push('/')
      }
    }
  },
  computed: {
    nvLogic: function () {
      return {
        nv: true,
        navButtonAnimation: this.isToggled,
        navButtonAnimationExit: !this.isToggled && !this.first
      }
    },
    navpaneLogic: function () {
      return {
        navpane: this.first,
        navpaneAnimation: this.isToggled,
        navpaneAnimationExit: !this.isToggled && !this.first
      }
    }
  }
}
</script>

<style scoped lang="less">
  @red: #c90c2e;
  @grey: #323d38;
  button {
    border: none;
    background: none;
    color: #fff;
  }

  .navpane {
    display: none;
    overflow: hidden;
  }

  .main {
    width: 100%;
  }

  .Login {
    background-image: url('../../assets/tc_Time2.svg');
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    grid-row: 1;
    grid-column: 1;
    font-size: 1em;
    line-height: 10px;
    font-weight: 400;
    margin-top: 10px;
    color: #999;
  }
  .Logint {
    grid-row: 2;
    font-size: 1em;
    line-height: 10px;
    font-weight: 400;
    color: #999;
  }

  .Reg {
    background-image: url('../../assets/tc_Odometer2.svg');
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    grid-column: 3;
    grid-row: 1;
    font-size: 1em;
    line-height: 10px;
    font-weight: 400;
    color: #999;
    margin-top: 10px;
  }
  .Regt {
    grid-column: 3;
    grid-row: 2;
    font-size: 1em;
    line-height: 10px;
    font-weight: 400;
    color: #999;
  }

  .Account {
    background-image: url('../../assets/tc_Odometer2.svg');
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    z-index: 11;
    color: #fff;
    font-size: 1.5em;
    font-weight: 400;
    grid-column: 2;
    height: 45px;
    margin-top: 10px;
  }
  .Accounta {
    grid-row: 2;
    font-size: 1em;
    line-height: 10px;
    font-weight: 400;
    color: #999;
  }

  .Home {
    background-image: url('../../assets/tc_Time2.svg');
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    z-index: 11;
    color: #fff;
    font-size: 1.5em;
    font-weight: 400;
    grid-column: 1;
    height: 45px;
    margin-top: 10px;
  }
  .Homet {
    grid-row: 2;
    font-size: 1em;
    line-height: 10px;
    font-weight: 400;
    color: #999;
  }
  .Logout {
    background-image: url('../../assets/tc_Cross2.svg');
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    z-index: 11;
    color: #fff;
    font-size: 1.5em;
    font-weight: 400;
    grid-column: 3;
    margin-top: 10px;
    height: 45px;
  }
  .Logouta {
    grid-row: 2;
    font-size: 1em;
    line-height: 10px;
    font-weight: 400;
    color: #999;
  }

  .navbar {
    width: 100%;
    height: 80px;
    position: fixed;
    background-image: url('../../assets/noise.png');
    background-size: contain;
    top: 0;
    left: 0;
    right: 0;
    z-index: 12;
    text-align: center;
    line-height: 70px;
    font-weight: lighter;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 50px 35px;
    box-shadow: 0px 2px 3px black;
  }

  .navpaneAnimation {
    animation: navpaneAnimation .35s steps(9);
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
    grid-column-start: 1;
    grid-column-end: 4;
    z-index: 12;
    opacity: 1;
    width: 100%;
    height: 77px;
    background: @red;
    color: #fff;
    box-shadow: 1px 2px 2px @grey;
    text-align: center;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    position: relative;
  }

  .navpaneAnimationExit {
    animation: navpaneAnimationReverse .35s steps(9);
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
    display: none;
  }

  .navpaneAnimationExit button {
    display: none;
  }

  @keyframes navpaneAnimation {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes navpaneAnimationReverse {
    0% { opacity: 1; }
    100% { opacity: 0; display: none;}
  }

  @keyframes navButtonAnimation {
    100% {background-position: -1440px;}
  }

  @keyframes navButtonAnimationReverse {
    0% {background-position: -1440px;}
    100% {background-position: 0px;}
  }

  .navButtonAnimation {
    animation: navButtonAnimation .35s steps(18);
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
  }

  .navButtonAnimationExit {
    animation: navButtonAnimationReverse .35s steps(18);
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
  }

  .hidden {
    display: none;
  }

</style>
