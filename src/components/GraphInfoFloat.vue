<script setup lang="ts">
import { computed } from "vue";

    interface Props {
        totalProfit: number;
        spending: number;
        incom: number;
        left: number;
    }
    const props = defineProps<Props>();

    const totalProfitStr = computed( () => {
        return `￥${props.totalProfit.toLocaleString()}`;
    });

    const spendingStr = computed( () => {
        return `￥${props.spending.toLocaleString()}`;
    });

    const incomStr = computed( () => {
        return `￥${props.incom.toLocaleString()}`;
    });

    const monthlyProfitStr = computed( () => {
        const profit = props.incom - props.spending;
        return `￥${profit.toLocaleString()}`;
    });
    
    const left = computed( () => {
        return `${props.left.toString()}px`;
    });

</script>

<template>
    <div id="graphInfoFloatContena" v-bind:style="{ left: left }">
        <div class="graphInfoFloatRow">
            <div class="graphInfoFloatRowsampleTotalProfit"></div>
            <div class="graphInfoFloatRowTitle">累積収支：</div>
            <div class="graphInfoFloatRowValue">{{ totalProfitStr }}</div>
        </div>
        <div class="graphInfoFloatRow">
            <div class="graphInfoFloatRowsampleMonthlyProfit"></div>
            <div class="graphInfoFloatRowTitle">単月収支：</div>
            <div class="graphInfoFloatRowValue">{{ monthlyProfitStr }}</div>
        </div>
        <div class="graphInfoFloatRow">
            <div class="graphInfoFloatRowsampleIncom"></div>
            <div class="graphInfoFloatRowTitle">収入：</div>
            <div class="graphInfoFloatRowValue">{{ incomStr }}</div>
        </div>
        <div class="graphInfoFloatRow" >
            <div class="graphInfoFloatRowsampleSpending"></div>
            <div class="graphInfoFloatRowTitle">支出：</div>
            <div class="graphInfoFloatRowValue">{{ spendingStr }}</div>
        </div>
    </div>

</template>

<style scoped>
    #graphInfoFloatContena {
        width: 200px;
        height: 100px;

        top: 30px;

        border: 1px solid black;
        border-radius: 5px;
        background-color: #1b1b1b;
        color: #e2e2e2;

        position: absolute;
        z-index: 1000;

        padding: 5px;
    }

    .graphInfoFloatRow {
        height: 25%;
        display: flex;
    }

    .graphInfoFloatRowTitle {
        font-size: 10px;
        height: 100%;
        margin: 0;
        padding: 0;
        text-align: right;
        width: 40%;
    }

    .graphInfoFloatRowValue {
        width: 40%;
    }

    .graphInfoFloatRowsampleTotalProfit {
        background-color: #007700;
        width: 20%;
        height: 3px;
    }

    .graphInfoFloatRowsampleMonthlyProfit {
        background-color: #FF4F02;
        width: 20%;
        height: 3px;
    }

    .graphInfoFloatRowsampleSpending {
        background-color: #BBBBBB;
        width: 20%;
        height: 10px;
    }

    .graphInfoFloatRowsampleIncom {
        background-color: #555555;
        width: 20%;
        height: 10px;
    }

</style>


