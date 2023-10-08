<script setup lang="ts">
import {computed} from "vue";
import { useParsonStore } from "@/stores/Parson";

// -- props --
interface Props {
    itemType:           "spending" | "incom" | "";
    itemClassId:        string;
    itemClassName:      string;
    amountOfMoney1:     number;
    amountOfMoney2:     number;
    enableFloat:        boolean;
    enableSubClass:     boolean;
    enableTransition:   boolean;
    rate:               number;
}
const props = defineProps<Props>();

// -- emit --
interface Emits {
    ( event: "resultItemOnMouseOver", offsetX: number, offsetY: number, classId: string, itemType: "spending" | "incom" | "", enableSubClass: boolean, enableTransition: boolean ): void;
    ( event: "resultItemOnMouseLeave" ): void;
}
const emit = defineEmits<Emits>();

const totalAmount = computed( () => {
    const total = props.amountOfMoney1 + props.amountOfMoney2;
    return `￥${total.toLocaleString()}`;
});

// -- parson1
const parsonStore = useParsonStore();
const parson1 = parsonStore.getById("0");
const parson1DisplayStr = computed( () => {
    return `${parson1}: ￥${props.amountOfMoney1.toLocaleString()}`;
});

// -- parson2
const parson2 = parsonStore.getById("1");
const parson2DisplayStr = computed( () => {
    return `${parson2}: ￥${props.amountOfMoney2.toLocaleString()}`;
});


const displayDetailFloat = ( event: MouseEvent ) => {
    emit( "resultItemOnMouseOver", event.clientX - 200, event.clientY + 10, props.itemClassId, props.itemType ,props.enableSubClass, props.enableTransition );
}

const removeDetailFloat = ( event: MouseEvent ) => {
    emit( "resultItemOnMouseLeave" );
}

const rateStr = computed( () => {
    const widthRate = props.rate * 100;
    return `${widthRate.toString()}%`;
});


</script>

<template>
    <div id="resultTableContena" v-on:mouseover="displayDetailFloat" v-on:mouseleave="removeDetailFloat">
        <div id="itemClassName">
            <div id="itemClassNameInner">{{ props.itemClassName }}</div> 
        </div>
        <div id="totalAmount">
                {{ totalAmount }}
        </div>
        <div id="amountSubInfo">
            <div id="amountByParsonInfo">
                <div class="amountByParsonItem">
                    {{ parson1DisplayStr }}
                </div>
                <div class="amountByParsonItem2">
                    {{ parson2DisplayStr }}
                </div>
            </div>
            <div id="amountLengthBar" v-bind:style="{ width: rateStr}"></div>
        </div>
    </div>


</template>

<style scoped>
#resultTableContena {
    display: flex;
    margin-bottom: 20px;
}

#itemClassName {
    width: 20%;
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    
}

#totalAmount {
    width: 15%;
    height: 40%;
    margin-bottom: 1px;
    font-size: 15px;
}

#amountSubInfo {
    margin-left: 5px;
}

#itemClassNameInner {
    position: absolute;
    right: 0;
    text-align: right;
    font-size: 15px;
}


#amountByParsonInfo {
    width: 100%;
    height: 40%;
    display: flex;
    font-size: 10px;
    margin-top: 3px;
    margin-bottom: 3px;
}

.amountByParsonItem2 {
    margin-left: 10px;
}

#amountLengthBar {
    height: 3px;
    background-color: black;
}

</style>