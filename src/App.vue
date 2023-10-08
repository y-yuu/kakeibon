<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, RouterView } from 'vue-router'
import DetailList from "@/views/DetailList.vue"
import AppFooter from "@/components/AppFooter.vue"
import { useDetailItemStore  } from './stores/DetailItem';
import {useClassListStore} from "@/stores/ClassList";
import { useSubClassListStore } from './stores/SubClassList';
import AcountInfo from "@/views/AcountInfo.vue"
import AcountInfoDetail from "@/components/AcountInfoDetail.vue";

const detailItemStore = useDetailItemStore();
detailItemStore.setItemList("");

const classListStore = useClassListStore();
classListStore.initClassList();

const subClassListStore = useSubClassListStore();
subClassListStore.initSubClassList();

const displayAcountInfoDetail = ref(false);

const onClickAcountInfo = () => {
  if( displayAcountInfoDetail.value === false ) {
    displayAcountInfoDetail.value = true;
  } else {
    displayAcountInfoDetail.value = false;
  }
}

const eraseAcountInfoDetail = () => {
  displayAcountInfoDetail.value = false;
}

</script>

<template>
    <header>
      <div id="logo">kakeibon</div>
      <RouterLink v-bind:to="{name: 'ResultSheet'}" class="functionLink">収支の確認</RouterLink>
      <!--<RouterLink v-bind:to="{name: 'ShareManager'}" class="functionLink">分担の管理</RouterLink>-->
      <RouterLink v-bind:to="{name: 'DetailRegister'}" class="functionLink">収入/支出の登録</RouterLink>
      <!--<RouterLink v-bind:to="{name: 'Settings'}" class="functionLink">設定</RouterLink>-->
      <Suspense>
        <AcountInfo v-on:on-click-acount-info="onClickAcountInfo"/>
      </Suspense>
  </header>
  <main>
    <div id="detailItemList">
      <DetailList />
      <!--<DbStatus />-->
    </div>
    <div id="routerView">
      <Suspense>
        <RouterView />
      </Suspense>
      
    </div>
    <AcountInfoDetail v-if="displayAcountInfoDetail" v-on:blur="eraseAcountInfoDetail"/>

  </main>
  <AppFooter />

</template>

<style>
#logo {
  margin-left: 10px;
  margin-right: 100px;
}

.functionLink {
  margin-right: 30px;
  text-decoration: none;
  color: black;
}

#base {
  height: 100%;
  width: 100%;
}

header {
  width: 100%;
  height: 3%;
  line-height: 1.5;
  display: flex;
  border-bottom: 1px solid black;
  position: relative;
  /*max-height: 100vh;*/
}

main {
  width:100%;
  height: 94%;
  display: flex;
  border-bottom: 1px solid black;
  position: relative;
}

#detailItemList {
  height: 100%;
  width: 20%;
  border-right: 1px solid black;
}

#routerView {
  height: 98%;
  width: 80%;
  padding: 1%;
}
</style>
