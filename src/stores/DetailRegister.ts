import { defineStore } from "pinia";
import { requestPutItem, requestCalclate, requestGetSerial,  } from "./DbRequestWindow";
import { useTotalByClassStore } from "./TotalByClass";
import { useTotalProfitStore } from "./TotalProfit";
import { useDetailItemStore } from "./DetailItem";
import { useClassListStore } from "./ClassList";
import { useSubClassListStore } from "./SubClassList";
import { useParsonStore } from "./Parson";
import type { DetailItemInfo } from "@/interfaces";


interface State {
    itemList: Array<DetailItemInfo>
}

export const useDetailRegister = defineStore({
    id: "DetailRegister",
    state: (): State => {
        return {
            itemList: new Array<DetailItemInfo>()
        }
    },

    getters: {



    },

    actions: {
        addCopyRecord(): void {
            if( this.itemList.length > 0 ) {
                const lastElem = this.itemList[this.itemList.length - 1];
                
                const item : DetailItemInfo = {
                    id:             lastElem.id,
                    regisParsonId:  lastElem.regisParsonId,
                    itemType:       lastElem.itemType,
                    yearMonth:      lastElem.yearMonth,
                    date:           lastElem.date,
                    parsonId:       lastElem.parsonId,
                    parsonName:     lastElem.parsonName,
                    itemClassId:    lastElem.itemClassId,
                    className:      lastElem.className,
                    itemSubClassId: lastElem.itemSubClassId,
                    subClassName:   lastElem.subClassName,
                    memo:           lastElem.memo,
                    amountOfMoney:  lastElem.amountOfMoney,
                    deleteFlg:      false
                };

                this.itemList.push( item );

            } else {

            }
        },

        addNewRecord(): void {
            const classListStore = useClassListStore();
            const subClassListStore = useSubClassListStore();
            const parsonStore = useParsonStore();

            

            const adjast = ( source: number ) => {
                return ("0" +(( source + 1).toString())).slice(-2);
            }
    
            const today = new Date();
            const yearMonth = `${today.getFullYear()}${adjast( today.getMonth())}`;
            const todayStr = `${today.getFullYear().toString()}-${adjast( today.getMonth())}-${adjast( today.getDate())}`;
    
            const item : DetailItemInfo = {
                id:             0,
                regisParsonId:  parsonStore.getMyInfo().id,
                itemType:       "spending",
                yearMonth:      yearMonth,
                date:           todayStr,
                parsonId:       parsonStore.getMyInfo().id,
                parsonName:     "",
                itemClassId:    classListStore.classList[0].id,
                className:      "",
                itemSubClassId: subClassListStore.subClassList[0].subClassId,
                subClassName:   "",
                memo:           "",
                amountOfMoney:  0,
                deleteFlg:      false
            };

            this.itemList.push( item );
        },

        regist() {
            const totalByCLassStore = useTotalByClassStore();
            const totalProfitStore = useTotalProfitStore();
            const detailItemStore = useDetailItemStore();

            const getSerial = (): Promise<number> => {
                return new Promise( (resolve, reject ) => {
                    requestGetSerial( ( serial ) => {
                        resolve( serial );
                    });
                });
            }

            const targetList = this.itemList.filter( (e) => {
                return e.amountOfMoney > 0;
            });

            targetList.forEach( async ( item ) => {
                const _item: DetailItemInfo = {
                    ...item
                };

                _item.id = await getSerial();                

                requestPutItem( _item, () => {});
                requestCalclate( _item.yearMonth, async ( total ) => {
                    totalByCLassStore.merge( total );
                    await totalProfitStore.reset();
                });

                if( (detailItemStore.currentYearMonth === _item.yearMonth) || detailItemStore.currentYearMonth === "" ) {
                    detailItemStore.addItem( _item );
                }

                if( detailItemStore.syncManager.connecting === true ) {
                    detailItemStore.syncManager.sendData( _item );
                }

                if( detailItemStore.counterSyncManager.connecting === true ) {
                    detailItemStore.counterSyncManager.sendData( _item );
                }


            });

        },

        
        setItemType( index: number, itemType: "spending" | "incom" ): void {
            this.itemList[index].itemType = itemType;
        },

        setDateAndYearMonth( index: number, date: string ): void {
            this.itemList[index].date = date;
            this.itemList[index].yearMonth = date.slice(0, 4) + date.slice(5, 7);
        },

        setParsonId( index: number, parsonId: string ): void {
            this.itemList[index].parsonId = parsonId;
        },

        setItemClass( index: number, classId: string ): void {
            this.itemList[index].itemClassId = classId;
        },

        setItemSubClass( index: number, subClassId: string ): void {
            this.itemList[index].itemSubClassId = subClassId;
        },

        setMemo( index: number, memo: string ): void {
            this.itemList[index].memo = memo;
        },

        setAmount( index: number, amount: number ): void {
            this.itemList[index].amountOfMoney = amount;
        },

        setDeleteFlg( index: number, deleteFlg: boolean ): void {
            this.itemList[index].deleteFlg = deleteFlg;
        }
        
    }

})



