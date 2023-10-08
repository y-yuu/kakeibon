<script setup lang="ts">

interface Props {
    amountOfMoney1: number;
    amountOfMoney2: number;
}

const props = defineProps<Props>();

const parson1Rate = props.amountOfMoney1 / ( props.amountOfMoney1 + props.amountOfMoney2 ) * 100;
const parson2Rate = props.amountOfMoney2 / ( props.amountOfMoney1 + props.amountOfMoney2 ) * 100;

const parson1RateStr = `${parson1Rate.toString()}%`;
const parson2RateStr = `${parson2Rate.toString()}%`;

</script>

<template>
    <div id="ratiobarContena">
        <div id="parson1Bar" v-bind:style="{width: parson1RateStr }"></div>
        <div id="parson2Bar" v-bind:style="{width: parson2RateStr }"></div>
    </div>

</template>

<style scoped>
#ratiobarContena {
    display: flex;
    width: 100%;
    height: 10px;
    border: 1px solid black;
}

#parson1Bar {
    height: 100%;
    border-right: 1px solid black;
}

#parson2Bar {
    height: 100%;
}



</style>