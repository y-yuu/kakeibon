<script setup lang="ts">
import {computed, ref} from "vue";
import DetailRegisterRecord from '@/components/DetailRegisterRecord.vue';
import { useDetailRegister } from "@/stores/DetailRegister";
import type { DetailItemInfo } from "@/interfaces";

const detailRegisterStore = useDetailRegister();

const displayCopyBtn = computed( () => {
    if( detailRegisterStore.itemList.length > 0 ) {
        return true;
    } else {
        return false;
    }
});


const addCopyRecord = () => {
    detailRegisterStore.addCopyRecord();
    
}

const addNewRecord = () => {
    detailRegisterStore.addNewRecord();
}

const regist = () => {
    detailRegisterStore.regist();    
    detailRegisterStore.itemList = new Array<DetailItemInfo>();
}


</script>

<template>
    <div id="detailRegisterContena">
        <div id="detailRegisterTitle">
            収入/支出の登録
        </div>
        <div id="detailRegisterRecordBase">
            <DetailRegisterRecord
            v-for="(elem, index) in detailRegisterStore.itemList"
            v-bind:key="index"
            v-bind:index="index"
            />
            <div id="detailRecordAddControle">
                <div id="detailRecordAddCopyButton" v-on:click="addCopyRecord" v-if="displayCopyBtn">+コピー</div>
                <div id="detailRecordAddNewButton" v-on:click="addNewRecord">+新規</div>
            </div>
        </div>
        <div id="detailRegisterControle">
            <button id="detailRegisterButton" v-on:click="regist">登録</button>
        </div>

    </div>
</template>

<style scoped>
    #detailRegisterContena {
        height: 100%;
        width: 100%;
    }

    #detailRegisterTitle {
        width: 95%;
        height: 3%;
        font-size: 15px;
        font-weight: bolder;
    }

    #detailRegisterRecordBase {
        height: 90%;
        width: 100%;
        overflow-y: scroll;
    }

    #detailRegisterControle {
        height: 10%;
        width: 100%;
        position: relative;
    }

    #detailRecordAddControle {
        display: flex;
        width: 100%;
        position: relative;
    }

    #detailRecordAddCopyButton {
        position: absolute;
        right: 10%;
        font-size: 12px;
        cursor: pointer;
    }

    #detailRecordAddNewButton {
        position: absolute;
        right: 5%;
        font-size: 12px;
        cursor: pointer;

    }

    #detailRegisterButton {
        position: absolute;
        right: 5%;

    }


</style>