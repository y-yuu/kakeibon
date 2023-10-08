import {defineStore} from "pinia";
import type {DetailItemInfo} from "@/interfaces";
import { requestGetItems, requestPutItem, requestCalclate, requestGetAllTotalProfit } from "./DbRequestWindow";
import { useClassListStore } from "./ClassList";
import { useParsonStore } from "./Parson";
import { useTotalByClassStore } from "./TotalByClass";
import { useTotalProfitStore } from "./TotalProfit";
import { SynchManager } from "./SynchManager";
import { useSubClassListStore } from "./SubClassList";

// -- 支払い、収入明細のリスト --

interface State {
    itemList: Array<DetailItemInfo>,
    currentYearMonth: string,
    syncManager: SynchManager,
    counterSyncManager: SynchManager
}

export const useDetailItemStore = defineStore({
    id: "detailItems",
    state: (): State => {
        return{
            itemList: new Array<DetailItemInfo>(),
            currentYearMonth: "",
            syncManager: new SynchManager(),
            counterSyncManager: new SynchManager()
        }
    },

    getters: {
        getAllItem: ( state ) => {
            return (): Array<DetailItemInfo> => {
                return state.itemList;
            }
        }


    },

    actions: {
        initSyncManager( onOpenRequstFunc: ( counterIpName: string ) => void ): Promise<boolean> {
            const parsonStore = useParsonStore();

            return new Promise( async (resolve, reject) => {
                await this.syncManager.connect( "ws://localhost:5001/ws", parsonStore.getMyInfo().name, onOpenRequstFunc );
                resolve(true);
            });
        },

        initCounterSyncManager( ip: string, onOpenRequstFunc: ( counterIpName: string ) => void ): Promise<boolean> {
            const parsonStore = useParsonStore();

            return new Promise( async (resolve, reject) => {
                try {
                    const result = await this.counterSyncManager.connect( `ws://${ip}:5001/ws`, parsonStore.getMyInfo().name, onOpenRequstFunc );
                    resolve(result);
                } catch( err ) {
                    reject( err );
                }
            });
        },

        setItemList( yearMonth: string ): Promise<boolean> {
            const classListStore = useClassListStore();
            const parsonStore = useParsonStore();
            const subClassStore = useSubClassListStore();

            return new Promise( ( resolve, reject) => {
                requestGetItems( yearMonth, ( items ) => {
                    if( items === undefined ) {
                        return;
                    }
    
                    this.itemList = new Array<DetailItemInfo>();

                    this.currentYearMonth = items.yearMonth;
    
                    items.itemByItemType.forEach( (byItemType) => {
                        const itemType = byItemType.itemType;
    
                        byItemType.itemByClassID.forEach( (byClassId) => {
                            const classId = byClassId.classId;
                            const className = classListStore.getById( itemType, classId );
    
                            byClassId.itemBySubClassId.forEach( (bySubClassId) => {
                                const subClassId = bySubClassId.subClassId;
                                const subClassName = subClassStore.getById( itemType, classId, subClassId );

                                bySubClassId.itemByParsonId.forEach( (byParsonId) => {
                                    const parsonId = byParsonId.parsonId;
                                    const parsonName = parsonStore.getById( parsonId );
    
                                    byParsonId.itemDetail.forEach( (detail) => {
    
                                        const itemInfo: DetailItemInfo = {
                                            id: detail.serial,
                                            regisParsonId: parsonStore.getMyInfo().id,
                                            itemType: itemType,
                                            yearMonth: items.yearMonth,
                                            date: detail.date,
                                            parsonId: parsonId,
                                            parsonName: parsonName,
                                            itemClassId: classId,
                                            className: className,
                                            itemSubClassId: subClassId,
                                            subClassName: subClassName,
                                            memo: detail.memo,
                                            amountOfMoney: detail.amount,
                                            deleteFlg: detail.deleteFlg
                                        };
    
                                        this.itemList.push( itemInfo );
    
                                    });
                                });
                            });
                        });
                    });

                    resolve(true);
                });

            });


        },

        updateDisplayList() {
            this.setItemList( this.currentYearMonth );
        },

        registItem( item: DetailItemInfo ) {
            let _item: DetailItemInfo  = {
                ...item
            };

            this.itemList.unshift( _item );
            
            const totalByCLassStore = useTotalByClassStore();
            const totalProfitStore = useTotalProfitStore();

            requestPutItem( _item, ( serial ) => {
                if( this.syncManager.connecting === true ) {
                    _item.id = serial;
                    this.syncManager.sendData( _item );
                }
            } );

            requestCalclate( _item.yearMonth, async ( total ) => {
                totalByCLassStore.merge( total );
                await totalProfitStore.reset();
            });

        },

        deleteItem( id: string ) : void {
            const totalByCLassStore = useTotalByClassStore();
            const totalProfitStore = useTotalProfitStore();

            const index = this.itemList.findIndex( (e) => e.id === Number(id) );
            this.itemList[index].deleteFlg = true;

            let _item: DetailItemInfo = {
                ...this.itemList[index]
            }

            requestPutItem( _item, ( serial ) => {});
            requestCalclate( _item.yearMonth, async ( total ) => {
                totalByCLassStore.merge( total );
                await totalProfitStore.reset();

                totalByCLassStore.updateGraph();
            });

            if( this.syncManager.connecting === true ) {
                this.syncManager.sendData( this.itemList[index] );
            }

            if( this.counterSyncManager.connecting === true ) {
                this.counterSyncManager.sendData( this.itemList[index] );
            }
        },

        addItem( item: DetailItemInfo ): void {

            let _item: DetailItemInfo  = {
                ...item
            };

            const itemListElem = this.itemList.find( (e) => {
                return (e.id === _item.id) && (e.regisParsonId === _item.regisParsonId);
            });

            if( ( itemListElem === undefined ) && ( this.currentYearMonth === item.yearMonth ) ){
                this.itemList.unshift( _item );
            }
        }

    }

});


