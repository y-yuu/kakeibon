<script setup lang="ts">
import {computed} from "vue";
import { useParsonStore } from "@/stores/Parson";

    interface Props {
        subClassName: string;
        amountOfMoneyParson1: number;
        amountOfMoneyParson2: number;
    }

    const props = defineProps<Props>();

    // -- parson name --
    const parsonStore = useParsonStore();

    const totalAmountStr = computed( () => {
        const total = props.amountOfMoneyParson1 + props.amountOfMoneyParson2;
        return `￥${total.toLocaleString()}`;
    });

    const amountParson1Str = computed( () => {
        const parson = parsonStore.getById("0");
        return `${parson}: ￥${props.amountOfMoneyParson1.toLocaleString()}`;
    });

    const amountParson2Str = computed( () => {
        const parson = parsonStore.getById("1");
        return `${parson}: ￥${props.amountOfMoneyParson2.toLocaleString()}`;
    });

</script>

<template>
    <div id="resultItemFloatSubClassContena">
        <div id="resultItemFloatSubClassName">
            {{ props.subClassName }}
        </div>
        <div id="resultItemFloatSubClassTotalAmount">
            {{ totalAmountStr }}
        </div>
        <div id="resultItemFloatSubClassAmountDetail">
            <div id="resultItemFloatSubClassByParson1">
                {{ amountParson1Str }}
            </div>
            <div id="resultItemFloatSubClassByParson2">
                {{ amountParson2Str }}
            </div>
        </div>

    </div>

</template>

<style scoped>
#resultItemFloatSubClassContena {
    display: flex;
    margin-bottom: 3px;
}

#resultItemFloatSubClassName {
    font-size: 15px;
    width: 25%;
    text-align: right;
}

#resultItemFloatSubClassTotalAmount {
    font-size: 15px;
    width: 25%;
    text-align: right;
}

#resultItemFloatSubClassAmountDetail {
    font-size: 10px;
    width: 50%;
    /*text-align: right;*/
    display: flex;
}

#resultItemFloatSubClassByParson1 {
    width: 100%;
    /*text-align: right;*/
    margin-left: 5px;
}

#resultItemFloatSubClassByParson2 {
    width: 100%;
    /*text-align: right;*/
}

</style>