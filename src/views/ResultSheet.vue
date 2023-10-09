<script setup lang="ts">
import ResultTableItem from "@/components/ResultTableItem.vue";
import ResulttableItemFloat from "@/components/ResulttableItemFloat.vue";
import { useTotalByClassStore } from "@/stores/TotalByClass";
import { computed, onMounted, ref } from "vue";
import { Graph } from "@/Graph";
import GraphInfoFloat from "@/components/GraphInfoFloat.vue";
import { useParsonStore } from "@/stores/Parson";
import { useTotalProfitStore } from "@/stores/TotalProfit";
import { useSubClassListStore } from "@/stores/SubClassList";

const totalByClassStore = useTotalByClassStore();
await totalByClassStore.reset();

const totalProfitStore = useTotalProfitStore();
await totalProfitStore.reset();

const parsonStore = useParsonStore();
const parson1 = computed( (): string => {
    return parsonStore.getById("0");
});

const parson2 = computed( (): string => {
    return parsonStore.getById("1");
});

const subClassListStore = useSubClassListStore();

// -- result table selector --

let resultTableMonth = ref("");

const resultTableDateList = computed( () => {
    if( (totalByClassStore.yearMonths.length > 0) && ( resultTableMonth.value === "" ) ) {
        resultTableMonth.value = totalByClassStore.yearMonths[0];
    }

    return totalByClassStore.yearMonths;
});


// -- 支出合計 --

const totalSpendingAmount1 = computed( () => {
    const total = totalByClassStore.getTotalSpending( resultTableMonth.value );
    return total.amount1;
});

const totalSpendingAmount2 = computed( () => {
    const total = totalByClassStore.getTotalSpending( resultTableMonth.value );
    return total.amount2;
});

// -- 収入合計 --

const totalIncomAmount1 = computed( () => {
    const total = totalByClassStore.getTotalIncom( resultTableMonth.value );
    return total.amount1;
});

const totalIncomAmount2 = computed( () => {
    const total = totalByClassStore.getTotalIncom( resultTableMonth.value );
    return total.amount2;
});


// -- spending list with rate --
const spendingListWithRate = computed( () => {
    const _spendingByClassList = totalByClassStore.getByItemType("spending", resultTableMonth.value);
    const spendingByClassList = _spendingByClassList.filter( (e) => {
        return (e.amountOfMoneyParson1 + e.amountOfMoneyParson2) > 0;
    });
    const list = spendingByClassList.map( (e) => {
        return  {
                itemType:               e.itemType,
                itemClassId:            e.itemClassId,
                itemClassName:          e.itemClassName,
                amountOfMoneyParson1:   e.amountOfMoneyParson1,
                amountOfMoneyParson2:   e.amountOfMoneyParson2,
                rate:                   (e.amountOfMoneyParson1 + e.amountOfMoneyParson2) / ( totalSpendingAmount1.value + totalSpendingAmount2.value )
        };
    });

    list.sort(( a , b ) => {
        return b.rate - a.rate;
    });

    return list;
});

// -- incom list with rate --
const incomListWithRate = computed( () => {
    const _incomList = totalByClassStore.getByItemType("incom", resultTableMonth.value);
    const incomList = _incomList.filter( (e) => {
        return ( e.amountOfMoneyParson1 + e.amountOfMoneyParson2 ) > 0;
    });
    const list = incomList.map( (e) => {

        return {
                itemType:               e.itemType,
                itemClassId:            e.itemClassId,
                itemClassName:          e.itemClassName,
                amountOfMoneyParson1:   e.amountOfMoneyParson1,
                amountOfMoneyParson2:   e.amountOfMoneyParson2,
                rate:                   (e.amountOfMoneyParson1 + e.amountOfMoneyParson2) / ( totalIncomAmount1.value + totalIncomAmount2.value )
        };
    });

    list.sort(( a , b) => {
        return b.rate - a.rate;
    });

    return list;
});



const savings1 = computed( () => {
    return totalIncomAmount1.value - totalSpendingAmount1.value;
});

const savings2 = computed( () => {
    return totalIncomAmount2.value - totalSpendingAmount2.value;
});


const updateDataList = () => {
    
    const totalProfitInfoList = totalProfitStore.getRecentList( 20 );
    const spendingList = totalByClassStore.getTotalRecentlySpendingList( 20 );
    const incomList = totalByClassStore.getTotalRecentlyIncomList( 20 );

    switch( graphMode.value ) {
        case "total":
            profitNumList = totalProfitInfoList.map( (e) => {
                return e.amountOfMoneyParson1 + e.amountOfMoneyParson2;
            });
            spendingNumList = spendingList.map( (e) => {
                return e.amount1 + e.amount2;
            });
            incomNumList = incomList.map( (e) => {
                return e.amount1 + e.amount2;
            });

            break;

        case "parson1":
            profitNumList = totalProfitInfoList.map( (e) => {
                return e.amountOfMoneyParson1;
            });
            spendingNumList = spendingList.map( (e) => {
                return e.amount1;
            });
            incomNumList = incomList.map( (e) => {
                return e.amount1
            });
            break;

        case "parson2":
            profitNumList = totalProfitInfoList.map( (e) => {
                return e.amountOfMoneyParson2;
            });
            spendingNumList = spendingList.map( (e) => {
                return e.amount2;
            });
            incomNumList = incomList.map( (e) => {
                return e.amount2;
            });
            break;
    }
}


// -- transition result graph --

let graphMode = ref("");
graphMode.value = "total";

let isDisplayFloat = ref(false);
let infoFloatLeft = ref(0);
let totalProfitForGraphFloat = ref(0);
let spendingForGraphFloat = ref(0);
let incomForGraphFloat = ref(0);

let isDisplayCursol = ref(true);
let graphCursolHeight = ref("");
let graphCursolLeft = ref("");

const dateList = ref(totalByClassStore.yearMonths);

let profitNumList: number[] = [];
let spendingNumList: number[] = [];
let incomNumList: number[] = [];
updateDataList();

let graph: Graph | null = null;

onMounted( () => {
    // -- graph --

    const graphParentObj = document.querySelector("#transitionGraph") as HTMLDivElement;
    graph = new Graph( "#transitionResultGraph", graphParentObj.clientHeight, graphParentObj.clientWidth);
    graph.drawGraph( dateList.value, profitNumList, spendingNumList, incomNumList );

    graphCursolHeight.value = `${graph.getGraphHeight()}px`;

    graph.setInfoFloatDrawer( ( index: number, mouseX: number) => {
        isDisplayFloat.value = true;
        infoFloatLeft.value = mouseX + 20;

        if( index <= dateList.value.length - 1 ) {
            if( profitNumList.length === 0 ) {
                totalProfitForGraphFloat.value = 0;
            } else {
                totalProfitForGraphFloat.value = profitNumList[index];
            }

            if( spendingNumList.length === 0 ) {
                spendingForGraphFloat.value = 0;
            } else {
                spendingForGraphFloat.value = spendingNumList[index];
            }

            if( incomNumList.length === 0 ) {
                incomForGraphFloat.value = 0;
            } else {
                incomForGraphFloat.value = incomNumList[index];
            }
            
        } else {
            if( profitNumList.length === 0 ) {
                totalProfitForGraphFloat.value = 0;
            }else {
                totalProfitForGraphFloat.value = profitNumList[dateList.value.length - 1];
            }

            if( spendingNumList.length === 0 ) {
                spendingForGraphFloat.value = 0;
            } else {
                spendingForGraphFloat.value = spendingNumList[dateList.value.length - 1];
            }
            
            if( incomNumList.length === 0 ) {
                incomForGraphFloat.value = 0;
            } else {
                incomForGraphFloat.value = incomNumList[dateList.value.length - 1];
            }
        }
    });

    graph.setInfoFloatEraser( () => {
        isDisplayFloat.value = false;
    })

    graph.setGraphCursolXGetter( ( mouseX: number ) => {
        graphCursolLeft.value = `${mouseX}px`;
    });

    // -- selector --
    if( resultTableDateList.value !== undefined && resultTableDateList.value.length > 0 ) {
        resultTableMonth.value = resultTableDateList.value[0];
    }

});

const latestTotalProfit = ref("");
const latestTotalProfitParson1 = ref("");
const latestTotalProfitParson2 = ref("");
const latestTotalProfitDiff = ref("");
const latestTotalProfitDiffColor = ref("");

if( profitNumList.length === 0 ) {
    latestTotalProfit.value = `￥0`;    
} else {
    latestTotalProfit.value = `￥${profitNumList[profitNumList.length - 1].toLocaleString()}`;
    const diff = profitNumList[profitNumList.length - 1] - profitNumList[profitNumList.length - 2];
    if( diff >= 0 ) {
        latestTotalProfitDiff.value = `↑ ￥${diff.toLocaleString()}`;
        latestTotalProfitDiffColor.value = "#188038";
    } else {
        latestTotalProfitDiff.value = `↓ ￥${diff.toLocaleString()}`;
        latestTotalProfitDiffColor.value = "#ff0000";
    }
}

latestTotalProfitParson1.value = `￥${totalProfitStore.getLatestProfitByParson(0).toLocaleString()}`;
latestTotalProfitParson2.value = `￥${totalProfitStore.getLatestProfitByParson(1).toLocaleString()}`;

// -- graph mode selector --
const updateGraph = () => {
    dateList.value = totalByClassStore.yearMonths;

    updateDataList();
    if( graph !== null ) {
        graph.clearGraph();
        graph.drawGraph( dateList.value, profitNumList, spendingNumList, incomNumList );
    }

    if( profitNumList.length === 0 ) {
        latestTotalProfit.value = `￥0`;    
    } else {
        latestTotalProfit.value = `￥${profitNumList[profitNumList.length - 1].toLocaleString()}`;
        const diff = profitNumList[profitNumList.length - 1] - profitNumList[profitNumList.length - 2];
        if( diff >= 0 ) {
            latestTotalProfitDiff.value = `↑ ￥${diff.toLocaleString()}`;
            latestTotalProfitDiffColor.value = "#188038";
        } else {
            latestTotalProfitDiff.value = `↓ ￥${diff.toLocaleString()}`;
            latestTotalProfitDiffColor.value = "#ff0000";
        }
    }

    latestTotalProfitParson1.value = `￥${totalProfitStore.getLatestProfitByParson(0).toLocaleString()}`;
    latestTotalProfitParson2.value = `￥${totalProfitStore.getLatestProfitByParson(1).toLocaleString()}`;
}

totalByClassStore.updateGraph = updateGraph;



// -- result table item float --

let isDisplayResultItemFloat = ref(false);
let resultItemFloatOffsetX = ref(0);
let resultItemFloatOffsetY = ref(0);
let resultItemFloatClassId = ref("");
let resultItemFloatItemType = ref("");
let resultItemFloatEnableSubClass = ref(false);
let resultItemFloatEnableTransition = ref(false);

const displayResultItemFloat = ( offsetX: number, offsetY: number, classId: string, itemType: "spending" | "incom" | "" ,enableSubClass: boolean, enableTransition: boolean ) => {
    if( itemType !== "" ) {
        const subList = totalByClassStore.getSubClassList( resultTableMonth.value, itemType, classId );
        if( subList.length > 0 ) {
            if( subList[0].itemSubClassName !== "" ) {
                isDisplayResultItemFloat.value = true;

                let floatX = 0;
                if( offsetX < (window.innerWidth / 2) ) {
                    floatX = window.innerWidth / 2 - 300;
                } else {
                    floatX = window.innerWidth / 2 - 300;
                }

                resultItemFloatOffsetX.value = floatX;
                resultItemFloatOffsetY.value = window.innerHeight / 2 - 10;
                resultItemFloatClassId.value = classId;
                resultItemFloatItemType.value = itemType;
                resultItemFloatEnableSubClass.value = enableSubClass;
                resultItemFloatEnableTransition.value = enableTransition;
            }
        }
    }

}

const eraseResultItemFloat = () => {
    isDisplayResultItemFloat.value = false;
}

</script>

<template>
    <div id="resultSheetTitle">
        収支の確認
    </div>
    <div id="transitionSummary">
        <div id="transitionSummaryTotalProfit">
            <p>累積収支：{{ latestTotalProfit }}</p>
            
        </div>
        <div id="transitionSummaryTotalProfitByParson1">
            <p>{{ parson1 }}:{{ latestTotalProfitParson1 }}</p>
            
        </div>
        <div id="transitionSummaryTotalProfitByParson2">
            <p>{{ parson2 }}:{{ latestTotalProfitParson2 }}</p>
            
        </div>
        <div id="transitionSummaryTotalProfitDiff" v-bind:style="{ color: latestTotalProfitDiffColor}">
            <p>{{ latestTotalProfitDiff }}</p>
            
        </div>

    </div>
    <div id="transitionGraphHeader">
        <select id="transitionGraphSelector" v-on:change="updateGraph" v-model="graphMode" >
            <option value="total">合計</option>
            <option value="parson1">{{ parson1 }}</option>
            <option value="parson2">{{ parson2 }}</option>
        </select>
    </div>
    <div id="transitionGraph">
        <canvas id="transitionResultGraph"></canvas>
        <GraphInfoFloat 
        v-if="isDisplayFloat" 
        v-bind:total-profit="totalProfitForGraphFloat"
        v-bind:spending="spendingForGraphFloat"
        v-bind:incom="incomForGraphFloat"
        v-bind:left="infoFloatLeft"  />
        <div id="graphCursol" v-if="isDisplayCursol" v-bind:style="{ height: graphCursolHeight, left: graphCursolLeft  }"></div>
    </div>
    <div id="resultTableControl">
        <select id="resultTableMonthSelector" v-model="resultTableMonth">
            <option
            v-for="( date, index ) in resultTableDateList"
            v-bind:key="index"
            v-bind:value="date"> {{ date }}</option>

        </select>
        <div>月断面</div>
    </div>
    <div id="resultTable">
        <div class="resultTableRow" id="resultTableTotalRow">
            <div class="resultTableCell">
                <!-- 支出合計 -->
                <ResultTableItem
                item-class-name="支出合計"
                item-type="spending"
                item-class-id=""
                v-bind:amount-of-money1="totalSpendingAmount1"
                v-bind:amount-of-money2="totalSpendingAmount2"
                v-bind:enable-float="true"
                v-bind:enable-sub-class="false"
                v-bind:enable-transition="false"
                v-bind:rate="0"
                v-on:result-item-on-mouse-over="displayResultItemFloat"
                v-on:result-item-on-mouse-leave="eraseResultItemFloat" />

            </div>
            <div class="resultTableCell">
                <!-- 収入合計-->
                <ResultTableItem
                item-class-name="収入合計"
                item-type="incom"
                item-class-id=""
                v-bind:amount-of-money1="totalIncomAmount1"
                v-bind:amount-of-money2="totalIncomAmount2"
                v-bind:enable-float="true"
                v-bind:enable-sub-class="false"
                v-bind:enable-transition="false"
                v-bind:rate="0"
                v-on:result-item-on-mouse-over="displayResultItemFloat"
                v-on:result-item-on-mouse-leave="eraseResultItemFloat" />

                <!-- 差引貯金額 -->
                <ResultTableItem
                item-class-name="収支"
                item-type=""
                item-class-id="0"
                v-bind:amount-of-money1="savings1"
                v-bind:amount-of-money2="savings2"
                v-bind:enable-float="true"
                v-bind:enable-sub-class="false"
                v-bind:enable-transition="false"
                v-bind:rate="0"
                v-on:result-item-on-mouse-over="displayResultItemFloat"
                v-on:result-item-on-mouse-leave="eraseResultItemFloat" />

            </div>

        </div>
        <div class="resultTableRow">
            <div class="resultTableCell">
                <!-- 項目別支出 -->
                <ResultTableItem
                v-for="(spendingItem, index) in spendingListWithRate"
                v-bind:key="index"
                v-bind:item-type="spendingItem.itemType"
                v-bind:item-class-id="spendingItem.itemClassId"
                v-bind:item-class-name="spendingItem.itemClassName"
                v-bind:amount-of-money1="spendingItem.amountOfMoneyParson1"
                v-bind:amount-of-money2="spendingItem.amountOfMoneyParson2"
                v-bind:enable-float="true"
                v-bind:enable-sub-class="true"
                v-bind:enable-transition="true"
                v-bind:rate="spendingItem.rate"
                v-on:result-item-on-mouse-over="displayResultItemFloat"
                v-on:result-item-on-mouse-leave="eraseResultItemFloat" />

            </div>
            <div class="resultTableCell">
                <!-- 項目別収入 -->
                <ResultTableItem
                v-for="(incomItem, index) in incomListWithRate"
                v-bind:key="index"
                v-bind:item-type="incomItem.itemType"
                v-bind:item-class-id="incomItem.itemClassId"
                v-bind:item-class-name="incomItem.itemClassName"
                v-bind:amount-of-money1="incomItem.amountOfMoneyParson1"
                v-bind:amount-of-money2="incomItem.amountOfMoneyParson2"
                v-bind:enable-float="true"
                v-bind:enable-sub-class="true"
                v-bind:enable-transition="true"
                v-bind:rate="incomItem.rate"
                v-on:result-item-on-mouse-over="displayResultItemFloat"
                v-on:result-item-on-mouse-leave="eraseResultItemFloat" />

            </div>

        </div>
    </div>
    <ResulttableItemFloat
    v-if="isDisplayResultItemFloat"
    v-bind:offset-x="resultItemFloatOffsetX"
    v-bind:offset-y="resultItemFloatOffsetY"
    v-bind:year-month="resultTableMonth"
    v-bind:item-type="resultItemFloatItemType"
    v-bind:class-id="resultItemFloatClassId"
    v-bind:enable-sub-class="resultItemFloatEnableSubClass"
    v-bind:enable-transition="resultItemFloatEnableTransition" />


</template>

<style scoped>
#resultSheetTitle {
    width: 95%;
    height: 3%;
    font-size: 15px;
    font-weight: bolder;
}

#transitionSummary {
    width: 95%;
    height: 2%;
    display: flex;
    font-size: 10px;
    margin-bottom: 3px;
}

#transitionSummaryTotalProfit {
    font-size: 15px;
}


#transitionSummaryTotalProfitByParson1 {
    margin-top: 3px;
    margin-left: 10px;
}

#transitionSummaryTotalProfitByParson2 {
    margin-top: 3px;
    margin-left: 10px;
}

#transitionSummaryTotalProfitDiff {
    margin-left: 20px;
    font-size: 15px;
}

#transitionSummaryTotalProfit > p {
    margin: 0;
    font-size: 15px;
}

#transitionSummaryTotalProfitByParson1 > p {
    margin: 0;
}

#transitionSummaryTotalProfitByParson2 > p {
    margin: 0;
}


#transitionSummaryTotalProfitDiff > p {
    margin: 0;
}



#transitionGraphHeader {
    height: 2%;
    width: 95%;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    padding: 0px;
    vertical-align: middle;
}
#transitionGraph {
    width: 95%;
    height: 30%;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;

    position: relative;
}

#resultTableControl {
    width: 95%;
    height: 3%;
    margin-top: 3px;
    display: flex;
}

#resultTableControl > div {
    padding-top: 5px;
    margin-left: 3px;
    font-size: 12px;
}

#resultTable {
    width: 95%;
    height: 45%;
}

.resultTableRow {
    display: flex;
    margin-bottom: 5px;

    overflow-y: scroll;
}

.resultTableCell {
    width: 50%;

    position: relative;
}

#resultTableTotalRow {
    border-bottom: 1px solid black;
}


#transitionResultGraph {
    width: 100%;
    height: 100%;
}

#graphCursol {
    position: absolute;
    width: 1px;
    top: 0px;
    background-color: black;
}

#transitionGraphSelector {
    height: 100%;
    font-size: 10px;
    margin-left: 10px;
    border: 0;

}

#resultTableMonthSelector {
    width: 100px;
    height: 100%;
    border: 0;
}


</style>