<template>
  <div>
    <h1>
      @namespace/test-vue demo
    </h1>
  </div>
</template>
<script>
import * as test from '../../packages/test-vue/src/index'

export default {
  components: {},
  data() {
    return {}
  },
  created() {
    console.log(test)
  },
  mounted() {},
  methods: {}
}
</script>
