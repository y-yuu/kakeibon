<script setup lang="ts">
import {computed, ref, watchEffect } from "vue";
import DetailItem from "@/components/DetailItem.vue";
import {useDetailItemStore} from "@/stores/DetailItem";
import type {DetailItemInfo } from "@/interfaces";
import { useTotalByClassStore } from "@/stores/TotalByClass";

const itemStore = useDetailItemStore();

const totalByClassStore = useTotalByClassStore();
const yearMonthList = computed(() => {
    return totalByClassStore.yearMonths;
});

const _currentYearMonth = ref(itemStore.currentYearMonth);

watchEffect( async() => {
    await itemStore.setItemList( _currentYearMonth.value );
    if( _currentYearMonth.value === "" ) {
        _currentYearMonth.value = itemStore.currentYearMonth;
    }
});

const itemList = computed( (): Array<DetailItemInfo> => {
    const list = itemStore.itemList.filter( (e) => {
        return e.deleteFlg === false;
    });
    return list;
});


// -- display control float --
const isDisplayDetailListControl = ref(false);
const displayDetailListContorol = () => {
    isDisplayDetailListControl.value = true;
}

const eraseDetailListControl = () => {
    isDisplayDetailListControl.value = false;
}

// -- regist item --
const deleteItem = ( id: string ) => {
    itemStore.deleteItem( id );
}

const inputting = ref(false);
const displayYearMonthStr = computed( () => {
    return inputting.value === false;
});

const onBlurYearMonthSelector = () => {
    inputting.value = false;
}

const onClickYearMonthStr = () => {
    inputting.value = true;
}

const currentYearMonthStr = computed( () => {
    const year = _currentYearMonth.value.substring(0, 4);
    const month = _currentYearMonth.value.substring(4, 6);
    return `${year} / ${month}`;
});

</script>

<template>
    <div id="detailListContena" v-on:mouseover="displayDetailListContorol" v-on:mouseleave="eraseDetailListControl">
        <div id="detailListItemListHeader">
            <div id="detailListTitle">
                明細
            </div>
            <div id="detailListItemListControl">
                <select v-model="_currentYearMonth" v-if="inputting" v-on:blur="onBlurYearMonthSelector">
                    <option
                    v-for="(elem, index) in yearMonthList"
                    v-bind:key="index"
                    v-bind:value="elem"
                    >{{ elem }}</option>
                </select>
                <div id="detailListItemListControlDateStr" v-if="displayYearMonthStr" v-on:click="onClickYearMonthStr">
                    {{ currentYearMonthStr }}
                </div>


                <!-- <button id="detailListItemListControlItemSearch" class="detailListItemListControlButton">
                    検索
                </button>
                <button id="detailListItemListControlItemRegister" class="detailListItemListControlButton" v-on:click="displayRegistItemForm">
                    登録
                </button>
                <button id="detailListItemListControlContiRegister" class="detailListItemListControlButton" v-on:click="displayContinuosRegistForm">
                    連続登録
                </button>-->
            </div>
        </div>
        <div id="detailListItemList">
            <!--
            <div id="registItemForm" v-if="isDisplayRegistForm">
                <select id="registItemFormSelctType" v-model="registItemType" v-on:blur="eraseRegistItemForm">
                    <option value="spending">支出</option>
                    <option value="incom">収入</option>
                </select>
                <select id="registItemFormSelectClass" v-model="registItemClassId">
                    <option
                    v-for="( itemClass, index ) in classList"
                    v-bind:key="index"
                    v-bind:value="itemClass.id" > {{ itemClass.name }}</option>
                </select>
                <input type="number" id="registItemFormInputAmount" v-model="registItemAmount" v-on:keydown="registItem">
            </div>
            -->
            <DetailItem
            v-for="(item, index) in itemList"
            v-bind:key="index"
            v-bind:detail-item="item"
            v-on:delete-item="deleteItem" />
        </div>
        
    </div>
</template>

<style scoped>
#detailListContena {
    width: 100%;
    height: 80%;
    /* border-bottom: 1px solid black; */
    /*position: relative;*/
}

#detailListItemListHeader {
    height: 20px;
    width: 90%;
    position: relative;
    display: flex;
    font-size: 12px;
    padding: 5px;
}


#detailListItemListControl {
    height: 20px;
    width: 200px;
    position: absolute;
    left: 40%;

    /*border: 1px solid black;
    border-radius: 5px;*/
    /*z-index: 2000;
    background-color: white;*/
    display: flex;

    
}

#detailListItemList {
    height: 95%;
    width: 93%;
    padding-top: 20px;
    padding-left: 10px;
    padding-top: 20px;
    overflow-y: scroll;

}

.detailListItemListControlButton {
    font-size: 12px;
    margin-left: 10px;
}

#registItemForm {
    display: flex;
}

#registItemFormSelctType {

}

#registItemFormInputAmount {
    width: 80px;
}

#registItemFormSelectClass {
    width: 100px;
}


</style>