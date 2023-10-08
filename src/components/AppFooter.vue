<script setup lang="ts">
import {computed, ref} from "vue";
import { useDetailItemStore } from '@/stores/DetailItem';

const counterIp = ref("");
const counterIpName = ref("");
const inputting = ref(false);
const connected = ref(false);

const detailItemStore = useDetailItemStore();
detailItemStore.initSyncManager( ( _counterIpName : string ) => {
    counterIpName.value = _counterIpName;

    connected.value = true;
    inputting.value = false;

});


// -- connected / unconnected --

const displayCounterIpContena = computed( () => {
    return (connected.value === true) && (inputting.value === false);
});

const displayUnconnectedMsg = computed( () => {
    return (connected.value === false) && (inputting.value === false);
});


// -- input / display --

const displayCounterIpInput = computed( () => {
    return inputting.value === true;
});

const changeToDisplayCounterIpInput = () => {
    inputting.value = true;
}
const changeToDisplayCounterIp = () => {
    inputting.value = false;
}


const startSync = async () => {
    connected.value = await detailItemStore.initCounterSyncManager( counterIp.value, ( _counterIpName ) => {
        counterIpName.value = _counterIpName;
    });

    inputting.value = false;
}



</script>

<template>
    <div id="appFooterContena">
        <div id="appFooterCounter" v-if="displayCounterIpContena" v-on:click="changeToDisplayCounterIpInput">
            <div>connected to : </div>
            <div>{{ counterIpName }}</div>
        </div>
        <div id="appFooterUnConnectedMsg" v-if="displayUnconnectedMsg" v-on:click="changeToDisplayCounterIpInput">
            unconnected
        </div>
        <input type="text" v-if="displayCounterIpInput" v-model="counterIp" v-on:blur="changeToDisplayCounterIp" v-on:keyup.enter="startSync">
    </div>

</template>

<style scoped>
    #appFooterContena {
        width: 90%;
        height: 2%;
        display: flex;
        /*padding-top: 3px;*/
        padding-left: 10px;
        font-size: 12px;
    }

    #appFootermyLocalIpInfo {
        width: 100px;
    }

    #appFooterSeparater {
        width: 10px;
    }

    #appFooterCounter {
        display: flex;
    }

    #appFooterCounter > div {
        margin-right: 5px;
    }

</style>