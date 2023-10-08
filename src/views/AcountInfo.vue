<script setup lang="ts">
import { useParsonStore } from '@/stores/Parson';
import { computed } from 'vue';

interface Emits {
    ( event: "onClickAcountInfo" ) : void
}

const emits = defineEmits<Emits>();


const parsonStore = useParsonStore();
await parsonStore.setParsonList();

const myName = computed( () => {
    return parsonStore.getMyInfo().name;
});

const onClickAcountInfo = () => {
    emits( "onClickAcountInfo" );
}


</script>

<template>
    <div id="acountInfoContena" v-on:click="onClickAcountInfo">
        {{ myName }}
    </div>
</template>

<style scoped>

#acountInfoContena {
    width: 100px;
    height: 90%;
    border: 1px solid black;
    border-radius: 5px;
    
    position: absolute;
    right: 50px;

    text-align: center;

}




</style>