<script setup lang="ts">
import {computed, ref} from "vue";
import { useParsonStore } from "@/stores/Parson";
import { useClassListStore } from "@/stores/ClassList";
import type { DetailItemInfo } from '@/interfaces';

interface Props {
    detailItem: DetailItemInfo
}

interface Emits {
    ( event: "deleteItem", id: string ): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const parsonStore = useParsonStore();
const classListStore = useClassListStore();

const parsonName = computed( () => {
    return parsonStore.getById( props.detailItem.parsonId );
});

const date = computed( () => {
    return props.detailItem.date;
});

const itemType = computed( (): string => {
    if( props.detailItem.itemType === "incom" ) {
        return "収入";
    } else {
        return "支出";
    }
});

const itemTypeColor = computed( () => {
    if( itemType.value === "収入" ) {
        return "#555555";
    } else {
        return "#BBBBBB";
    }
});

const itemTypeFontColor = computed( () => {
    if( itemType.value === "収入" ) {
        return "#e2e2e2";
    } else {
        return "black";
    }
});

const itemClass = computed( () => {
    return classListStore.getById( props.detailItem.itemType, props.detailItem.itemClassId );
});

const amountOfMoney = computed( () => {
    return `￥${props.detailItem.amountOfMoney.toLocaleString()}`;
});

const isDisplayDetailItemControl = ref(false);
const itemBackGroudColor = ref("");

const displayItemControl = () => {
    isDisplayDetailItemControl.value = true;
    itemBackGroudColor.value = "Highlight";
}

const eraseItemControl = () => {
    isDisplayDetailItemControl.value = false;
    itemBackGroudColor.value = "";
}

const deleteItem = () => {
    if( confirm("削除しますか？") ) {
        emits( "deleteItem", props.detailItem.id.toString() );
    }
}

</script>

<template>
    <div id="detailItemContena" v-on:mouseover="displayItemControl" v-on:mouseleave="eraseItemControl" v-bind:style="{ backgroundColor: itemBackGroudColor}">
        <div class="detailItemHeader">
            <div class="detailItemHeaderParsonName">
                {{ parsonName }}
            </div>
            <div>
                {{ date }}
            </div>
        </div>
        <div class="detailItemData">
            <div class="detailItemType" v-bind:style="{ backgroundColor: itemTypeColor, color: itemTypeFontColor }">
                {{ itemType }}
            </div>
            <div class="detailItemClass">
                {{ itemClass }}
            </div>
            <div class="detailItemAmountOfMoney">
                {{ amountOfMoney }}
            </div>
            <div id="detailItemControl" v-if="isDisplayDetailItemControl">
                <!--<button class="detailItemControlButton" v-on:click="moveUpdateMode" >変更</button>-->
                <button class="detailItemControlButton" v-on:click="deleteItem">削除</button>
            </div>
        </div>
    </div>

</template>

<style scoped>
    #detailItemContena {
        margin-bottom: 5px;
        width: 85%;
    }

    .detailItemHeader {
        display: flex;
        font-size: 10px;
        padding-left: 30px;
        color: silver;
        width: 100%;
        text-align: right;
    }

    .detailItemData {
        display: flex;
    }

    .detailItemType{
        border:1px solid white;
        border-radius: 5px;
        font-size: 10px;
        margin-right: 5px;
        padding: 3px;
        width: 10%;
    }

    .detailItemClass {
        /*margin-right: 10px;*/
        width: 25%;
        font-size: 12px;
        text-align: right;
        padding-right: 5px;
    }

    .detailItemAmountOfMoney {
        /*margin-right: 10px;*/
        width: 30%;
        font-size: 12px;
    }

    #detailItemControl {
        display: flex;
        text-align: right;
        width: 28%;
    }

    .detailItemControlButton {
        font-size: 6px;
        height: 20px;
        width: 40px;
        margin: 0;
    }


    .detailItemHeaderParsonName {
        margin-right: 5px;
    }



</style>