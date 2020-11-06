<template>
  <div class="bxt-planbook" v-if="inputData">
    <div class="bxt-planbook-person">
      <div class="bxt-person-container">
        <template v-for="person in personData.personOrderList">
          <PersonInfo
            :key="person.key"
            :person-data="person"
            @change="changePersonInfo"
          ></PersonInfo>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import {
	PersonInfo,
} from 'bxs-tools-ui'
export default {
  name: 'app',
  components: {
		PersonInfo,
  },
  data() {
    return {
      inputData: null
    }
  },
  created() {},
  methods: {}
}
</script>
<style>
</style>