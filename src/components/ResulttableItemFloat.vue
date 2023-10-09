<script setup lang="ts">
import {ref, computed, onMounted} from "vue";
import { useParsonStore } from "@/stores/Parson";
import { useTotalByClassStore } from "@/stores/TotalByClass";
import ResultItemFloatSubClass from "@/components/ResultItemFloatSubClass.vue"
import { Graph } from "@/Graph";
import type { TotalBySubClass } from "@/interfaces";

interface Props {
    offsetX: number;
    offsetY: number;
    yearMonth: string;
    itemType: string;
    classId: string;
    enableSubClass: boolean;
    enableTransition: boolean;
}
const props = defineProps<Props>();
const totalByClassStore = useTotalByClassStore();

// -- サブ分類

const subClassList = computed( (): TotalBySubClass[] => {
    if( props.itemType === "" ) {
        return [];
    } else {
        const subClassList = totalByClassStore.getSubClassList( props.yearMonth, props.itemType as "spending" | "incom", props.classId );
        return subClassList;
    }

} );

const floatOffsetX = computed((): string => {
    const x = props.offsetX + 200;
    return `${x.toString()}px`;
});

const floatOffsetY = computed((): string => {
    return `${props.offsetY.toString()}px`;
});


const isEnableSubClass = ref( props.enableSubClass );
const isEnableTransition = ref( props.enableTransition );

if( subClassList.value.length === 0 ) {
    isEnableSubClass.value = false;
}

</script>
<template>
    <div id="resultItemFloatContena" v-bind:style="{ top:floatOffsetY,  left: floatOffsetX }">
        <div id="resultItemFloatTitle2">
                サブ分類
            </div>
            <ResultItemFloatSubClass 
            v-for="(subClass, index) in subClassList"
            v-bind:key="index"
            v-bind:sub-class-name="subClass.itemSubClassName"
            v-bind:amount-of-money-parson1="subClass.amountOfMoneyParson1"
            v-bind:amount-of-money-parson2="subClass.amountOfMoneyParson2" />
    </div>

</template>

<style scoped>
#resultItemFloatContena {
    /*height: 400px;*/
    width: 300px;
    border: 1px solid black;
    border-radius: 5px;
    padding: 3px;

    position: absolute;
    background-color: #4e4e4e;
    color: #e2e2e2;

    z-index: 1000;
}

#resultItemFloatAverage{
    height: 100px;
    /*border-bottom: 1px solid black;*/
}
#resultItemFloatSubClass {
    height: 160px;
    border-top: 1px solid black;
}
#resultItemFloatTrantition {
    height: 140px;
    border-top: 1px solid black;
}



#resultItemFloatTitle1 {
    height: 30%;
    font-size: 12px;
}

#resultItemFloat1Row1 {
    height: 30%;
    display: flex;
}

#resultItemFloat1Row2 {
    height: 20%;
    display: flex;
}

#resultItemFloat1Row3{
    height: 20%;

}

#resultItemFloatTotalAverage {
    width: 50%;
}

#resultItemFloatPeriod {
    width: 50%;
    font-size: 10px;
}

#resultItemFloatAverageParson1 {
    width: 50%;
    font-size: 10px;
}

#resultItemFloatAverageParson2 {
    width: 50%;
    text-align: right;
    font-size: 10px;
}

#resultItemFloatTitle2 {
    font-size: 12px;
    text-decoration:underline;
}



</style>