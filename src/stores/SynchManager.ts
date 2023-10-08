import type { DetailItemInfo, SynchFormat } from "@/interfaces";
import type { ObjStoreItem } from "./Database";
import { useTotalByClassStore } from "./TotalByClass";
import { useTotalProfitStore } from "./TotalProfit";
import { requestGetItems, requestPutObjStoreItem, requestCalclate } from "./DbRequestWindow";
import { useClassListStore } from "./ClassList";
import { useSubClassListStore } from "./SubClassList";
import { useParsonStore } from "./Parson";
import { useDetailItemStore } from "./DetailItem";

export class SynchManager {

    connecting: boolean;

    url: string;
    ws: WebSocket | null;

    myName: string;

    onCounterOpenRequested: (( counterIpName: string ) => void) | null

    constructor() {
        this.connecting = false;
        this.url = "";
        this.ws = null;

        this.myName = "";

        this.onCounterOpenRequested = null;

    }

    connect = async ( _url: string, _myName: string, onOpenRequestFunc: ( counterIpName: string) => void ): Promise<boolean> => {

        this.url = _url;
        this.myName = _myName;
        this.onCounterOpenRequested = onOpenRequestFunc;

        return new Promise( (resolve, reject) => {
            try {
                this.ws = new WebSocket( this.url );

                this.ws.onopen = () => {
                    this.defineAction();
    
                    console.log( "-----------------");
                    
                    this.sendSignal( "start_synch" );

                    resolve(true);
                }
    
                this.ws.onerror = ( event ) => {
                    throw new Error( "connect error : " + event );
                }
    
                this.ws.onclose = () => {
                    this.connecting = false;
                }

            } catch( err ) {
                reject(err);
            }
        });
    }


    defineAction = () => {
        if( this.ws === null ) {
            return;
        }

        const totalByClassStore = useTotalByClassStore();
        const totalProfitStore = useTotalProfitStore();
        const classListStore = useClassListStore();
        const subClassListStore = useSubClassListStore();
        const parsonStore = useParsonStore();


        this.ws.onmessage = async ( e ) => {
            const receiveData = JSON.parse( e.data ) as SynchFormat;

            if( receiveData.myName === this.myName ) {
                return;
            }

            console.log( "receive: " + receiveData.command );


            switch( receiveData.command ) {
                case "start_synch":
                    this.sendSignal( "start_synch_responce" );
                    this.connecting = true;

                    if( this.onCounterOpenRequested !== null ) {
                        this.onCounterOpenRequested( receiveData.myName );
                    }
                    break;

                case "start_synch_responce":
                    {
                        await this.getAndSendItems();

                        // -- send end signal --
                        this.sendSignal( "end_data" );
                        if( this.onCounterOpenRequested !== null ) {
                            this.onCounterOpenRequested( receiveData.myName );
                        }
                        this.connecting = true;
                    }

                    break;

                case "data":
                    // -- merge data --
                    requestPutObjStoreItem( receiveData.items );
                    requestCalclate( receiveData.items.yearMonth, async ( total ) => {
                        totalByClassStore.merge( total );
                        await totalProfitStore.reset();

                        totalByClassStore.updateGraph();
                    });

                    const yearMonth = receiveData.items.yearMonth;
                    receiveData.items.itemByItemType.forEach( (byItemType) => {
                        const itemType = byItemType.itemType;

                        byItemType.itemByClassID.forEach( (byClassId) => {
                            const classId = byClassId.classId;

                            byClassId.itemBySubClassId.forEach( (bySubClassId) => {
                                const subClassId = bySubClassId.subClassId;

                                bySubClassId.itemByParsonId.forEach( (byParsonId) => {
                                    const parsonId = byParsonId.parsonId;

                                    byParsonId.itemDetail.forEach( (byDetail) => {

                                        const parsonName = parsonStore.getById( parsonId );
                                        const className = classListStore.getById( itemType, classId )
                                        const subClassName = subClassListStore.getById( itemType, classId, subClassId );

                                        const item: DetailItemInfo = {
                                            id:             byDetail.serial,
                                            regisParsonId:  byDetail.registParsonId,
                                            itemType:       itemType,
                                            yearMonth:      yearMonth,
                                            date:           byDetail.date,
                                            parsonId:       parsonId,
                                            parsonName:     parsonName,
                                            itemClassId:    classId,
                                            className:      className,
                                            itemSubClassId: subClassId,
                                            subClassName:   subClassName,
                                            memo:           byDetail.memo,
                                            amountOfMoney:  byDetail.amount,
                                            deleteFlg:      byDetail.deleteFlg
                                        };

                                        const detailItemStore = useDetailItemStore();
                                        detailItemStore.addItem( item );                                        

                                    });
                                });
                            });
                        });
                    });
                    
                    break;

                case "end_data":
                    await this.getAndSendItems();
                    break;
                
                case "disconnect":
                    this.connecting = false;
                    break;
            }
        }
    }

    getAndsendItem = ( yearMonth: string ) : Promise<boolean> => {
        return new Promise( (resolve) => {
            requestGetItems( yearMonth, ( items ) => {
                const sendData: SynchFormat = {
                    command: "data",
                    myName: this.myName,
                    items: items
                };

                console.log( "send: " + sendData.command );

                this.ws?.send( JSON.stringify( sendData ) );

                resolve( true );
            });        
        });
    }


    getAndSendItems = (): Promise<boolean[]> => {

        const totalByClassStore = useTotalByClassStore();

        const result: Promise<boolean>[] = [];
        for( const yearMonth of totalByClassStore.yearMonths ) {
            result.push( this.getAndsendItem( yearMonth ) );
        }
        
        const results = (Promise.all( result ));
        return results;
    }

    sendSignal = ( signal: string ) => {

        if( this.myName === "" ) {
            const parsonStore = useParsonStore();
            this.myName = parsonStore.getMyInfo().name;
        }

        console.log( "send: " + signal );

        const dummy: ObjStoreItem = {
            yearMonth: "",
            itemByItemType: []
        };

        const sendData: SynchFormat = {
            command: signal,
            myName: `/${this.myName}`,
            items: dummy
        };

        this.ws?.send( JSON.stringify( sendData ));
    }


    sendData = ( item: DetailItemInfo ) => {

        // -- convert to objstore format
        const objStoreItem: ObjStoreItem = {
            yearMonth: item.yearMonth,
            itemByItemType: [{
                itemType: item.itemType,
                itemByClassID: [{
                    classId: item.itemClassId,
                    itemBySubClassId: [{
                        subClassId: item.itemSubClassId,
                        itemByParsonId: [{
                            parsonId: item.parsonId,
                            itemDetail: [{
                                serial: item.id,
                                registParsonId: item.regisParsonId,
                                date: item.date,
                                amount: item.amountOfMoney,
                                memo: item.memo,
                                deleteFlg: item.deleteFlg
                            }]
                        }]
                    }]
                }]
            }]
        };

        const data: SynchFormat = {
            command: "data",
            myName: `/${this.myName}`,
            items: objStoreItem
        };

        console.log( "send: " + data.command );

        this.ws?.send( JSON.stringify( data ) );
    }

}