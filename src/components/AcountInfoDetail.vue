<script setup lang="ts">
import { useParsonStore } from "@/stores/Parson";
import { ref, computed } from "vue";


const parsonStore = useParsonStore();

const name0 = ref(parsonStore.parsonList[0].name);
const name1 = ref(parsonStore.parsonList[1].name);

const inputting0 = ref(false);
const displayNameStr0 = computed( () => {
  return inputting0.value === false;
});

const inputting1 = ref(false);
const displayNameStr1 = computed( () => {
    return inputting1.value === false;
});;


const changeToNameInput0 = () => {
  inputting0.value = true;
}

const onChangeName0 = () => {
    inputting0.value = false;
    parsonStore.updateParonName( "0", name0.value );
}

const changeToNameInput1 = () => {
  inputting1.value = true;
}

const onChangeName1 = () => {
    inputting1.value = false;
    parsonStore.updateParonName( "1", name1.value );
}

const myId = ref(parsonStore.getMyInfo().id);

const onChangeMyId = () => {
    parsonStore.updateMyId( myId.value );
}


</script>

<template>

<div id="acountInfoDetail">
      <div id="acountInfoDetailTitle">
        ユーザー情報
      </div>
      <div id="acountInfoDetailSelectMe">
        <input type="radio" name="acountInfoDetailSelectMe" value="0" v-model="myId" v-on:change="onChangeMyId"><p>{{ name0 }}</p>
        <input type="radio" name="acountInfoDetailSelectMe" value="1" v-model="myId" v-on:change="onChangeMyId"><p>{{ name1 }}</p>
      </div>
      <div class="acountInfoDetailRow">
        <div class="acountInfoDetailRowElem">
          <div class="acountInfoDetailRowElemTitle">
            ID:
          </div>
          <div class="acountInfoDetailRowElemValue">
            0
          </div>
        </div>
        <div class="acountInfoDetailRowElem">
          <div class="acountInfoDetailRowElemTitle">
            名前:
          </div>
          <div class="acountInfoDetailRowElemValue" v-on:click="changeToNameInput0" v-if="displayNameStr0">
            {{ name0 }}
          </div>
          <input type="text" v-model="name0" v-if="inputting0" v-on:keyup.enter="onChangeName0" v-on:blur="onChangeName0">
        </div>
      </div>
      <div class="acountInfoDetailRow">
        <div class="acountInfoDetailRowElem">
          <div class="acountInfoDetailRowElemTitle">
            ID:
          </div>
          <div class="acountInfoDetailRowElemValue">
            1
          </div>
        </div>
        <div class="acountInfoDetailRowElem">
          <div class="acountInfoDetailRowElemTitle">
            名前:
          </div>
          <div class="acountInfoDetailRowElemValue" v-on:click="changeToNameInput1" v-if="displayNameStr1">
            {{ name1 }}
          </div>
          <input type="text" v-model="name1" v-if="inputting1" v-on:keyup.enter="onChangeName1" v-on:blur="onChangeName1">
        </div>
      </div>
    </div>

</template>

<style scoped>

#acountInfoDetail {
  position: absolute;
  right: 50px;
  top: 10px;
  width: 300px;
  height: 200px;
  border: 1px solid black;
  border-radius: 5px;
  background-color: white;
  z-index: 1000;
  padding: 5px;
  font-size: 12px;
  background-color: #4e4e4e;
  color: #e2e2e2;

}

#acountInfoDetailTitle {
    height: 10%;
    text-decoration:underline;

}

#acountInfoDetailSelectMe {
    display: flex;
    height: 20%;
}

.acountInfoDetailRow {
    height: 35%;


}

.acountInfoDetailRowElem {
    display: flex;
}

.acountInfoDetailRowElemTitle {
    width: 20%;
}

.acountInfoDetailRowElemValue {
    width: 70%;
}


</style>