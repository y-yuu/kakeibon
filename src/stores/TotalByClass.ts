import {defineStore} from "pinia";
import type { TotalByClass, TotalByClassTotalAmount, TotalBySubClass} from "@/interfaces";
import { requestGetAllTotal } from "./DbRequestWindow";
import type { ObjStoreTotalByClassId } from "./Database";
import { useClassListStore } from "./ClassList";
import { useSubClassListStore } from "./SubClassList";

// -- 項目別の支出、収入合計のリスト

interface State {
    totalByClassList:   TotalByClass[],
    totalAmount:        TotalByClassTotalAmount[],
    yearMonths:         string[],
    updateGraph:        () => void
}

export const useTotalByClassStore = defineStore({
    id: "totalByClass",
    state: (): State => {
        return {
            totalByClassList:   new Array<TotalByClass>(),
            totalAmount:        new Array<TotalByClassTotalAmount>(),
            yearMonths:         new Array<string>(),
            updateGraph:        () => {}
        }
    },

    getters: {
        getByItemType: ( state ) => {
            return ( itemType: "spending" | "incom", yearMonth: string ) : Array<TotalByClass> => {
                const newList = state.totalByClassList.filter( ( e ) => {
                    return ( e.itemType === itemType ) && ( e.yearMonth === yearMonth ) ;
                }) as Array<TotalByClass>;

                return newList;
            }
        },

        getTotalSpending: ( state ) => {
            return ( yearMonth: string ) : TotalByClassTotalAmount => {
                let total = state.totalAmount.find( (e) => {
                    return ( e.itemType === "spending" ) && ( e.yearMonth === yearMonth );
                });

                if( total === undefined ) {
                    total = {
                        yearMonth: yearMonth,
                        itemType: "spending",
                        amount1: 0,
                        amount2: 0
                    };
                }
                return total;
            }
        },

        getTotalIncom: ( state ) => {
            return ( yearMonth: string ) : TotalByClassTotalAmount => {
                let total = state.totalAmount.find( (e) => {
                    return ( e.itemType === "incom" ) && ( e.yearMonth === yearMonth );
                });

                if( total === undefined ) {
                    total = {
                        yearMonth: yearMonth,
                        itemType: "incom",
                        amount1: 0,
                        amount2: 0
                    };
                }
                return total;
            }
        },

        getTotalRecentlySpendingList: ( state ) => {
            return ( num: number ): Array<TotalByClassTotalAmount> => {
                const _list = state.totalAmount.filter( (e) => {
                    return e.itemType === "spending";
                });

                const list = state.yearMonths.map( ( yearMonth) => {
                    const data = _list.find( (e) => e.yearMonth === yearMonth );
                    if( data === undefined ) {
                        const totalAmount : TotalByClassTotalAmount = {
                            yearMonth: yearMonth,
                            itemType: "spending",
                            amount1: 0,
                            amount2: 0
                        };

                        return totalAmount;
                    } else {
                        const totalAmount : TotalByClassTotalAmount = {
                            yearMonth: yearMonth,
                            itemType: data.itemType,
                            amount1: data.amount1,
                            amount2: data.amount2
                        };

                        return totalAmount;
                    }
                });

                if( list.length <= num ) {
                    return list;
                } else {
                    return list.slice( list.length - (1 + num) , list.length - 1 );
                }
            }
        },

        getTotalRecentlyIncomList: ( state ) => {
            return ( num: number ): Array<TotalByClassTotalAmount> => {
                const _list = state.totalAmount.filter( (e) => {
                    return e.itemType === "incom";
                });

                const list = state.yearMonths.map( ( yearMonth) => {
                    const data = _list.find( (e) => e.yearMonth === yearMonth );
                    if( data === undefined ) {
                        const totalAmount : TotalByClassTotalAmount = {
                            yearMonth: yearMonth,
                            itemType: "incom",
                            amount1: 0,
                            amount2: 0
                        };

                        return totalAmount;
                    } else {
                        const totalAmount : TotalByClassTotalAmount = {
                            yearMonth: yearMonth,
                            itemType: data.itemType,
                            amount1: data.amount1,
                            amount2: data.amount2
                        };

                        return totalAmount;
                    }
                });

                if( list.length <= num ) {
                    return list;
                } else {
                    return list.slice( list.length - (1 + num) , list.length - 1);
                }
            }
        },

        getSubClassList: ( state ) => {
            return ( yearMonth: string, itemType: "spending" | "incom", classId: string ): TotalBySubClass[] => {
                const targetList = state.totalByClassList.find( (e) => {
                    return ( e.yearMonth === yearMonth) && (e.itemType === itemType) && (e.itemClassId === classId );
                });

                if( targetList === undefined ) {
                    return [];
                } else {
                    return targetList.totalBySubClass;
                }
            }
        }
    },

    actions: {
        reset(): Promise<boolean> {

            const classListStore = useClassListStore();
            const subClassListStore = useSubClassListStore();

            this.totalByClassList = new Array<TotalByClass>();
            this.totalAmount = new Array<TotalByClassTotalAmount>();
            this.yearMonths = new Array<string>();

            return new Promise( (resolve, reject) => {
                requestGetAllTotal( ( total ) => {

                    total.forEach( (elem) => {
                        const yearMonth = elem.yearMonth;
                        this.yearMonths.push( yearMonth );
    
                        elem.totalByItemType.forEach( (byItemType) => {
                            const itemType = byItemType.itemType;
                            const totalAmount: TotalByClassTotalAmount = {
                                yearMonth: yearMonth,
                                itemType: itemType,
                                amount1: byItemType.amount1,
                                amount2: byItemType.amount2
                            };
                            this.totalAmount.push( totalAmount );
        
                            byItemType.detail.forEach( (detail) => {
                                const classId = detail.classId;
                                const className = classListStore.getById( itemType, classId );
        
                                const amount1 = detail.amount1;
                                const amount2 = detail.amount2;
        
                                const elem : TotalByClass = {
                                    yearMonth: yearMonth,
                                    itemType: itemType,
                                    itemClassId: classId,
                                    itemClassName: className,
                                    amountOfMoneyParson1: amount1,
                                    amountOfMoneyParson2: amount2,
                                    totalBySubClass: []
                                };
        
                                // -- sub class --
                                detail.totalBySubClass.forEach( (bySubClass) => {
                                    const subClassName = subClassListStore.getById( itemType, classId, bySubClass.subClassId );

                                    const subElem: TotalBySubClass = {
                                        itemSubClassId: bySubClass.subClassId,
                                        itemSubClassName: subClassName,
                                        amountOfMoneyParson1: bySubClass.amount1,
                                        amountOfMoneyParson2: bySubClass.amount2
                                    };

                                    elem.totalBySubClass.push( subElem );
                                });

                                this.totalByClassList.push( elem );
                            });
                        });
        
                    });
    
                    resolve(true);
                });
            });
        },

        merge( total: ObjStoreTotalByClassId ) {
            const classListStore = useClassListStore();
            const subClassListStore = useSubClassListStore();

            // -- delete old element
            const newTotalList = this.totalByClassList.filter( (e) => {
                return e.yearMonth !== total.yearMonth;
            });

            if( newTotalList !== undefined ) {
                this.totalByClassList = newTotalList.map ( (e) => {
                    return e;
                });
            }
        
            const newAmountList = this.totalAmount.filter( (e) => {
                return e.yearMonth !== total.yearMonth;
            });

            if( newAmountList !== undefined ) {
                this.totalAmount = newAmountList.map( (e) => {
                    return e;
                });
            }

            let newYearMonths = this.yearMonths.filter( ( yearMonth ) => {
                return yearMonth !== total.yearMonth;
            });

            if( newYearMonths !== undefined ) {
                this.yearMonths = newYearMonths.map( (e) => {
                    return e;
                })
            }

            // -- add new element

            const yearMonth = total.yearMonth;
            this.yearMonths.push( yearMonth );

            total.totalByItemType.forEach( (byItemType) => {
                const itemType = byItemType.itemType;
                const totalAmount: TotalByClassTotalAmount = {
                    yearMonth: yearMonth,
                    itemType: itemType,
                    amount1: byItemType.amount1,
                    amount2: byItemType.amount2
                };

                this.totalAmount.push( totalAmount );

                byItemType.detail.forEach( (detail) => {
                    const classId = detail.classId;
                    const className = classListStore.getById( itemType, classId );

                    const amount1 = detail.amount1;
                    const amount2 = detail.amount2;

                    const elem : TotalByClass = {
                        yearMonth: yearMonth,
                        itemType: itemType,
                        itemClassId: classId,
                        itemClassName: className,
                        amountOfMoneyParson1: amount1,
                        amountOfMoneyParson2: amount2,
                        totalBySubClass: []
                    };

                    // -- sub class --
                    detail.totalBySubClass.forEach( (bySubClass) => {
                        const subClassName = subClassListStore.getById( itemType, classId, bySubClass.subClassId );

                        const subElem: TotalBySubClass = {
                            itemSubClassId: bySubClass.subClassId,
                            itemSubClassName: subClassName,
                            amountOfMoneyParson1: bySubClass.amount1,
                            amountOfMoneyParson2: bySubClass.amount2
                        };

                        elem.totalBySubClass.push( subElem );
                    });

                    this.totalByClassList.push( elem );
                });
            });

            this.totalByClassList.sort( (a, b) => {
                if( a.yearMonth > b.yearMonth ) {
                    return 1;
                } else {
                    return -1;
                }
            });

            this.totalAmount.sort( (a, b) => {
                if( a.yearMonth > b.yearMonth ) {
                    return 1;
                } else {
                    return -1;
                }
            });
            
            this.yearMonths.sort( (a,b) => {
                if( a > b ) {
                    return 1;
                } else {
                    return -1;
                }
            });
        }
    }
});
