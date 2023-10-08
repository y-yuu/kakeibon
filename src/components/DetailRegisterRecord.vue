<script setup lang="ts">
    import {computed, ref, watchEffect} from "vue";
    import { useDetailRegister } from "@/stores/DetailRegister";
    import { useClassListStore } from "@/stores/ClassList";
    import { useSubClassListStore } from "@/stores/SubClassList";
    import { useParsonStore } from "@/stores/Parson";
    import type { SubClassInfo } from "@/interfaces";

    interface Props {
        index: number;
    }
    const props = defineProps<Props>();
    const itemTypeName = `itemType${props.index.toString()}`;

    const detailRegister = useDetailRegister();
    const classListStore = useClassListStore();
    const subClassListStore = useSubClassListStore();
    const parsonStore = useParsonStore();

    const itemType = ref(detailRegister.itemList[props.index].itemType);
    const date = ref(detailRegister.itemList[props.index].date);
    const amount = ref(detailRegister.itemList[props.index].amountOfMoney);
    const itemClassId = ref(detailRegister.itemList[props.index].itemClassId);
    const itemSubClassId = ref(detailRegister.itemList[props.index].itemSubClassId);
    const parsonId = ref(detailRegister.itemList[props.index].parsonId);
    const memo = ref( detailRegister.itemList[props.index].memo);
    const displayItemSubClassControle = ref(false);
    let subClassInfo: SubClassInfo[] = [{
        classId: "",
        subClassId: "",
        name: "",
        itemType: "spending"
    }];
    let subClassList = ref(subClassInfo);
    
    const changeItemType = () => {
        detailRegister.setItemType( props.index, itemType.value as "spending" | "incom" );
    }

    const changeYearMonth = () => {
        detailRegister.setDateAndYearMonth( props.index, date.value );
    }

    const changeParsonId = () => {
        detailRegister.setParsonId( props.index, parsonId.value );
    }

    const changeItemClassId = () => {
        detailRegister.setItemClass( props.index, itemClassId.value );
    }

    const changeItemSubClassId = () => {
        detailRegister.setItemSubClass( props.index, itemSubClassId.value );
    }

    const changeMemo = () => {
        detailRegister.setMemo( props.index, memo.value );
    }

    const changeAmount = () => {
        detailRegister.setAmount( props.index, amount.value );
    }


    const classList = computed(() => {
        return classListStore.getByItemType( itemType.value );
    });


    watchEffect( () => {
        subClassList.value = [] as SubClassInfo[];
        const _subClassList = subClassListStore.getByClassId( itemType.value, itemClassId.value );
        _subClassList.forEach( (e) => {
            subClassList.value.push(e);
        });

        if( _subClassList.length > 0 ) {
            displayItemSubClassControle.value = true;
        } else {
            displayItemSubClassControle.value = false;
        }

    });

    const parsonList = computed( () => {
        return parsonStore.parsonList;
    });
    
</script>

<template>
    <div id="detailRegisterRecordContena">
        <div class="detailRegisterRecordInputRow">
            <div id="detailRegisterRecordInputControleItemType" class="detailRegisterRecordInputControle">
                <input type="radio" v-bind:name="itemTypeName" value="spending" v-model="itemType" v-on:change="changeItemType"><p>支出</p>
                <input type="radio" v-bind:name="itemTypeName" value="incom" v-model="itemType" v-on:change="changeItemType"><p>収入</p>
            </div>
            <div class="detailRegisterRecordInputControle">
                <div class="detailRegisterRecordInputControleTitle">
                    <p>年月日</p>
                </div>
                <div class="detailRegisterRecordInputControleValue">
                    <input type="date" v-model="date" v-on:change="changeYearMonth">
                </div>
            </div>
            <div class="detailRegisterRecordInputControle">
                <div class="detailRegisterRecordInputControleTitle">
                    <p>金額</p>
                </div>
                <div class="detailRegisterRecordInputControleValue">
                    <input type="number" v-model="amount" v-on:change="changeAmount">
                </div>
            </div>
            <div id="detailRegisterRecordInputControleItemClass" class="detailRegisterRecordInputControle">
                <div class="detailRegisterRecordInputControleTitle">
                    <p>分類</p>
                </div>
                <div id="detailRegisterRecordInputControleItemClassValue" class="detailRegisterRecordInputControleValue">
                    <select v-model="itemClassId" v-on:change="changeItemClassId">
                        <option
                        v-for="( elem, index ) in classList"
                        v-bind:key="index"
                        v-bind:value="elem.id" > {{ elem.name }} </option>
                    </select>
                </div>
            </div>
            <div id="detailRegisterRecordInputControleItemSubClassValue" v-if="displayItemSubClassControle">
                <div class="detailRegisterRecordInputControleTitle">
                    <p>サブ分類</p>
                </div>
                <div class="detailRegisterRecordInputControleValue">
                    <select v-model="itemSubClassId" v-on:change="changeItemSubClassId">
                        <option
                        v-for="( elem, index) in subClassList"
                        v-bind:key="index"
                        v-bind:value="elem.subClassId"
                        > {{ elem.name }} </option>
                    </select>
                </div>
            </div>
        </div>
        <div class="detailRegisterRecordInputRow">
            <div class="detailRegisterRecordInputControle">
                <div class="detailRegisterRecordInputControleTitle">
                    <p>人</p>
                </div>
                <div class="detailRegisterRecordInputControleValue">
                    <select v-model="parsonId" v-on:change="changeParsonId">
                        <option
                        v-for="( elem, index ) in parsonList"
                        v-bind:key="index"
                        v-bind:value="elem.id" > {{ elem.name }}</option>
                    </select>
                </div>
            </div>
            <div class="detailRegisterRecordInputControle">
                <div class="detailRegisterRecordInputControleTitle">
                    <p>メモ</p>
                </div>
                <div class="detailRegisterRecordInputControleValue">
                    <input type="text" v-model="memo" v-on:change="changeMemo">
                </div>
            </div>
        </div>

    </div>

</template>

<style scoped>
    #detailRegisterRecordContena {
        width: 95%;
        border: 1px solid black;
        border-radius: 5px;
        padding: 5px;
        font-size: 12px;
        margin-bottom: 10px;
    }

    .detailRegisterRecordInputRow {
        display: flex;
        height: 30px;
    }

    #detailRegisterRecordInputControleItemType {
        border: 1px solid black;
        border-radius: 5px;
        padding: 5px;
    }

    #detailRegisterRecordInputControleItemType > p {
        margin-top: 0;
        margin-left: 0;
        margin-bottom: 0px;
        margin-right: 5px;

    }

    #detailRegisterRecordInputControleItemType > input {
        margin-top: 0;
        margin-left: 0;
        margin-bottom: 0;
        margin-right: 5px;
    }

    .detailRegisterRecordInputControle {
        display: flex;
        margin-right: 20px;
    }

    .detailRegisterRecordInputControleTitle {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-right: 5px;
    }

    .detailRegisterRecordInputControleTitle > p {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        margin: 0;
    }


    .detailRegisterRecordInputControleValue {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    #detailRegisterRecordInputControleItemSubClassValue {
        display: flex;
        margin-left: 0;
    }

</style>