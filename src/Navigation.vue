<template>
  <div>
    <h3>Demo 目录</h3>
    <router-link
      v-for="component in components"
      :key="component.name"
      :to="component.name"
    >
      <span class="publish-namespace">@{{ component.publishNamespace }}/</span>{{ component.name }}
    </router-link>
  </div>
</template>

<script>
import components from './components'

export default {
  data () {
    return {
      components
    }
  }
}
</script>
<style lang="scss" scoped>
h3 {
  font-size: 24px;
}
a {
  display: block;
  font-size: 24px;
  line-height: 24px;
  margin: 10px 5px;
}
.publish-namespace {
  font-size: 18px;
  color: #999;
}
// 移动设备
@media screen and (max-width: 750px) {
  h3 {
    font-size: 48px;
  }
  a {
    font-size: 36px;
    line-height: 36px;
    margin: 20px 10px;
  }
  .publish-namespace {
    font-size: 36px;
  }
}
</style>
