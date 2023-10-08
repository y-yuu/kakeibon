import {defineStore} from "pinia";
import type {TotalProfit} from "@/interfaces"
import { requestGetAllTotalProfit } from "./DbRequestWindow";

// -- 累積収支 --

interface State {
    profitList: Array<TotalProfit>
}

export const useTotalProfitStore = defineStore({
    id: "totalProfit",
    state: (): State => {
        return {
            profitList: new Array<TotalProfit>
        }
    },

    getters: {
        getRecentList: ( state ) => {
            return ( num: number ): Array<TotalProfit> => {
                let index = 0;
                if( num > state.profitList.length ) {
                    index = state.profitList.length - 1;
                }

                return state.profitList.slice( 0, num - 1 );
            }
        },

        getLatestProfitByParson: ( state ) => {
            return ( parsonIndex: number  ): number => {
                let amount = 0;

                if( state.profitList.length === 0 ) {
                    amount = 0;
                } else {
                    switch( parsonIndex ) {
                        case 0:
                            amount = state.profitList[ state.profitList.length - 1].amountOfMoneyParson1
                            break;
                        case 1:
                            amount = state.profitList[ state.profitList.length - 1].amountOfMoneyParson2
                            break;
                    }
                }

                return amount;
            }
        }

    },

    actions: {
        reset(): Promise<boolean> {
            
            return new Promise( (resolve, reject) => {
                requestGetAllTotalProfit( ( profitList ) => {
                    this.profitList = new Array<TotalProfit>();

                    profitList.forEach( (e) => {
                        const profit: TotalProfit = {
                            yearMonth: e.yearMonth,
                            amountOfMoneyParson1: e.amount1,
                            amountOfMoneyParson2: e.amount2
                        };
    
                        this.profitList.push( profit );
                    });

                    resolve( true );
                });
            });
        }
    }
});
