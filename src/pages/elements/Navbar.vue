<template>
  <div class="main">
    <div class="navbar">
      <div class="logo" v-on:click="$router.push('/')"></div>
      <div v-bind:class="nvLogic" v-on:click="navToggle"></div>
      <div v-bind:class="navpaneLogic">
        <button class="Home" v-on:click="navToggle(); $router.push('/')" v-if="logged">Home</button>
        <button class="Login" v-on:click="navToggle(); $router.push('/Login')" v-if="!logged">Login</button>
        <button class="Reg" v-on:click="navToggle(); $router.push('/Register')" v-if="!logged">Register</button>
        <button class="Account" v-on:click="navToggle(); $router.push('/Account'); $emit('account')" v-if="logged">Account</button>
        <button class="Logout" v-on:click="navToggle(); $emit('logout')" v-if="logged">Logout</button>
    </div>
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

  .logo {
    background-image: url('../../assets/tripclockmobilelogo.svg');
    background-repeat: no-repeat;
    background-size: contain;
    height: 80px;
    width: 200px;
    margin-top: 16px;
    margin-left: 10px;
  }

  .nv {
    width: 80px;
    height: 80px;
    overflow: hidden;
    margin-top: 10px;
    margin-right: 20px;
    grid-column: 3;
    z-index: 8;
    background-repeat: no-repeat;
    background-image: url("../../assets/navbuttonAnimationWhiteBorder.svg");
  }

  .Login {
    z-index: 11;
    color: #fff;
    font-size: 2em;
    font-weight: 400;
    grid-column: 1;
  }

  .Reg {
    z-index: 11;
    color: #fff;
    font-size: 2em;
    font-weight: 400;
    grid-column: 3;
  }

  .Account {
    z-index: 11;
    color: #fff;
    font-size: 1.5em;
    font-weight: 400;
    grid-column: 2;
  }

  .Home {
    z-index: 11;
    color: #fff;
    font-size: 1.5em;
    font-weight: 400;
    grid-column: 1;
  }

  .Logout {
    z-index: 11;
    color: #fff;
    font-size: 1.5em;
    font-weight: 400;
    grid-column: 3;
  }

  .navbar {
    width: 100%;
    height: 100px;
    border-bottom: 5px solid #000;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 11;
    text-align: center;
    line-height: 70px;
    font-weight: lighter;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: 100px;
    background-color: #fff;
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
