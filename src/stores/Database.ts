import type { DetailItemInfo, DbRequest, DbResult, ParsonInfo } from "@/interfaces";

// -- schema --

// -- item
export interface ObjStoreItem {
    yearMonth: string;                              // key
    itemByItemType: ObjStoreItemByItemType[];
}

interface ObjStoreItemByItemType {
    itemType: "spending" | "incom";
    itemByClassID: ObjStoreItemByClassId[];
}

interface ObjStoreItemByClassId {
    classId: string;
    itemBySubClassId: ObjStoreItemBySubClassId[];
}

interface ObjStoreItemBySubClassId {
    subClassId: string;
    itemByParsonId: ObjStoreItemByParsonId[];
}

interface ObjStoreItemByParsonId {
    parsonId: string;
    itemDetail: ObjStoreItemDetail[];
}

interface ObjStoreItemDetail {
    serial: number;
    registParsonId: string;
    date: string;
    amount: number;
    memo: string;
    deleteFlg: boolean;
}

// -- Total by class

export interface ObjStoreTotalByClassId {
    yearMonth: string;                      // key
    totalByItemType: ObjStoreTotalByItemType[];
}

interface ObjStoreTotalByItemType {
    itemType: "spending" | "incom";
    amount1: number;
    amount2: number;
    detail: ObjStoreTotalByClassIdDetail[];
}

interface ObjStoreTotalByClassIdDetail {
    classId: string;                       
    amount1: number;
    amount2: number;
    totalBySubClass: ObjStoreTotalBySubClassId[];
}



interface ObjStoreTotalBySubClassId {
    subClassId: string;
    amount1: number;
    amount2: number;
}

// -- average by class

interface ObjStoreAverageByClass {
    classId: string;                // key
    amount1: number;
    amount2: number;
    startYearMonth: string;
    endYearMonth: string;
}

// -- total profit 

export interface ObjStoreTotalProfit {
    yearMonth: string;              // key
    amount1: number;
    amount2: number;
}

// -- parson 

interface ObjStoreParson {
    id: string;                     // key
    name: string;
}

// -- class name

interface ObjStoreClassName {
    id: string;                     // key
    name: string;
    subClass: ObjStoreSubClassName[];
}

// -- sub class name

interface ObjStoreSubClassName {
    id: string;                     // key
    name: string;
}

// -- latest info
interface ObjStoreLatest {
    type: "serial" | "yearMonth";
    value: any;
}


// -- database functions --

let database : IDBDatabase;

const OBJ_STORE_ITEM = "item";
const OBJ_STORE_TOTAL_BY_CLASS = "totalByClass";
const OBJ_STORE_LATEST = "latest";
const OBJ_STORE_TOTAL_PROFIT = "totalProfit";
const OBJ_STORE_PARSON = "parson";

const getDatabase = async (): Promise<IDBDatabase> => {
    return new Promise( (resolve, reject ) => {
        if( database !== undefined ) {
            resolve( database );
        } else {
            const req = indexedDB.open("kakeibonDb", 1);
            req.onupgradeneeded = ( event ) => {

                // -- object store --

                const target = event.target as IDBRequest;
                const db = target.result as IDBDatabase;
                db.createObjectStore( "item",               {keyPath: "yearMonth"} );
                db.createObjectStore( "totalByClass",       {keyPath: "yearMonth"});
                db.createObjectStore( "averageByClass",     {keyPath: "classId"});
                db.createObjectStore( "parson",             {keyPath: "id"});
                db.createObjectStore( "className",          {keyPath: "id"});
                db.createObjectStore( "latest",             {keyPath: "type"}); // {type: "serial", value:"1"}, {type: "yearMonth", value: "202103"}
                const totalProfitObjs = db.createObjectStore( "totalProfit", {keyPath: "yearMonth"});

                totalProfitObjs.createIndex("yearMonth", "yearMonth", {unique: true});
            }

            req.onsuccess = ( event ) => {
                const target = event.target as IDBRequest;
                database = target.result as IDBDatabase;

                resolve( database );
            }

            req.onerror = ( event ) => {
                reject( new Error("Database open error."));
            }
        }
    });
}

const getAndUpdateItemSerialNumber = (): Promise<number> => {

    return new Promise( async (resolve, reject) => {
        const db = await getDatabase();
        const tran = db.transaction( [OBJ_STORE_LATEST], "readwrite" );
        const objs = tran.objectStore( OBJ_STORE_LATEST );
        
        let latestSerial = 0;

        const req = objs.get("serial");
        req.onsuccess = ( event ) => {
            const target = event.target as IDBRequest;
            const sel = target.result as ObjStoreLatest;

            if( sel === undefined ) {
                latestSerial = 0;
            } else {
                latestSerial = Number(sel.value) + 1;
            }

            const newLatest: ObjStoreLatest = {
                type: "serial",
                value: latestSerial
            };

            objs.put( newLatest );
        }

        tran.oncomplete = () => {
            resolve( latestSerial );
        }

        tran.onerror = ( event ) => {
            reject( new Error( "Database get latestInfo error: " + event));
        }
    });
}

const getLatestYearMonth = (): Promise<string> => {

    return new Promise( async ( resolve, reject) => {
        const db = await getDatabase();
        const tran = db.transaction( [OBJ_STORE_LATEST], "readonly" );
        const objs = tran.objectStore( OBJ_STORE_LATEST );

        let latestYearMonth = "";

        const req = objs.get( IDBKeyRange.only( "yearMonth" ) );
        req.onsuccess = ( event ) => {
            const target = event.target as IDBRequest;
            const latest = target.result as ObjStoreLatest;

            if( latest === undefined ) {
                latestYearMonth = "";
            } else {
                latestYearMonth = latest.value as string;
            }
        }
    
        tran.oncomplete = () => {
            resolve( latestYearMonth );
        }

        tran.onerror = ( event ) => {
            reject( new Error( "Database get latest error: " + event));
        }

    });
}

// -- calculate by year month

const calculate = ( yearMonth: string ): Promise<boolean> => {

    return new Promise( async( resolve, reject ) => {
        const db = await getDatabase();
        const tran = db.transaction( [OBJ_STORE_ITEM, OBJ_STORE_TOTAL_BY_CLASS], "readwrite" );
        const sourceObjStore = tran.objectStore( OBJ_STORE_ITEM );
        const destObjStore = tran.objectStore( OBJ_STORE_TOTAL_BY_CLASS );

        const sourceReq = sourceObjStore.get( IDBKeyRange.only( yearMonth ));
        sourceReq.onsuccess = ( event ) => {
            const target = event.target as IDBRequest;
            const item = target.result as ObjStoreItem;

            // -- calculate --

            let totalByClassId: ObjStoreTotalByClassId = {
                yearMonth: "",
                totalByItemType: []
            };

            totalByClassId.yearMonth = yearMonth;

            item.itemByItemType.forEach( ( byItemType) => {
                let totalByItemType: ObjStoreTotalByItemType = {
                    itemType: "spending",
                    amount1: 0,
                    amount2: 0,
                    detail: []
                };
                totalByItemType.itemType = byItemType.itemType;

                byItemType.itemByClassID.forEach( (byClassId) => {
                    let totalDetail: ObjStoreTotalByClassIdDetail = {
                        classId: "",
                        amount1: 0,
                        amount2: 0,
                        totalBySubClass: []
                    };
                    totalDetail.classId = byClassId.classId;
                    
                    byClassId.itemBySubClassId.forEach( (bySubClassId) => {
                        let totalBySub: ObjStoreTotalBySubClassId = {
                            subClassId: "",
                            amount1: 0,
                            amount2: 0
                        };
                        totalBySub.subClassId = bySubClassId.subClassId;
    
                        bySubClassId.itemByParsonId.forEach( ( byParsonId ) => {
    
                            let amount = 0;
                            byParsonId.itemDetail.forEach( (detail) => {
                                if( detail.deleteFlg === false ) {
                                    amount += detail.amount;
                                }
                            });
    
                            switch( byParsonId.parsonId ) {
                                case "0":
                                totalBySub.amount1 += amount;
                                totalDetail.amount1 += amount;
                                totalByItemType.amount1 += amount;
                                break;

                                case "1":
                                totalBySub.amount2 += amount;    
                                totalDetail.amount2 += amount;
                                totalByItemType.amount2 += amount;
                                break;
                            }

                        });
    
                        totalDetail.totalBySubClass.push( totalBySub );
                    });
    
                    totalByItemType.detail.push( totalDetail );
                });

                totalByClassId.totalByItemType.push( totalByItemType );
            });

            destObjStore.put( totalByClassId );
        }        

        tran.oncomplete = () => {
            resolve(true);
        }

        tran.onerror = ( event ) => {
            reject( new Error("Database calcurate error: " + event));
        }
    });
}

interface MonthlyIncomSpending {
    yearMonth: string;
    incom1: number;
    incom2: number;
    spending1: number;
    spending2: number;
}

const getMonthlyInComSpending = ( startYearMonth: string, endYearMonth: string ): Promise<MonthlyIncomSpending[]> => {

    let rtnList = new Array<MonthlyIncomSpending>();

    return new Promise( async( resolve, reject) => {
        const db = await getDatabase();
        const tran = db.transaction( [OBJ_STORE_TOTAL_BY_CLASS], "readwrite" );
        const objs = tran.objectStore( OBJ_STORE_TOTAL_BY_CLASS );
        const req = objs.getAll( IDBKeyRange.bound( startYearMonth, endYearMonth ) );
        req.onsuccess = (event) => {
            const target = event.target as IDBRequest;
            const totals = target.result as ObjStoreTotalByClassId[];

            totals.forEach( (elem) => {
                // -- incom1
                let incom1 = 0;
                let incom2 = 0;
                let spending1 = 0;
                let spending2 = 0;

                elem.totalByItemType.forEach( (e) => {
                    switch( e.itemType ) {
                        case "incom":
                            incom1 = e.amount1;
                            incom2 = e.amount2;
                            break;
                        
                        case "spending":
                            spending1 = e.amount1;
                            spending2 = e.amount2
                            break;
                    }
                });

                const incomSpending: MonthlyIncomSpending = {
                    yearMonth: elem.yearMonth,
                    incom1: incom1,
                    incom2: incom2,
                    spending1: spending1,
                    spending2: spending2
                };

                rtnList.push( incomSpending );
            })
        }

        tran.oncomplete = () => {
            resolve( rtnList );
        }

        tran.onerror = ( event ) => {
            reject( new Error("Database calculate total profit error: " + event ) );
        }
        
    });

}


const calculateTotalProfit = ( targetYearMonth: string ): Promise<boolean> => {

    return new Promise( async (resolve, reject) => {

        // -- latest
        let latestYearMonth = await getLatestYearMonth();
        if( latestYearMonth === "" ) {
            latestYearMonth = targetYearMonth;
        }

        // -- check this month record and insert
        const checkThisMonthAndInsert = (): Promise<boolean> => {
            return new Promise( async (resolve, reject ) => {
                const db = await getDatabase();
                const tran = db.transaction( [OBJ_STORE_TOTAL_PROFIT], "readwrite" );
                const objs = tran.objectStore( OBJ_STORE_TOTAL_PROFIT );
                const index = objs.index("yearMonth");                
                const thisMonthProfitReq = index.get( IDBKeyRange.only( targetYearMonth ) );
                thisMonthProfitReq.onsuccess = ( event ) => {
                    const target = event.target as IDBRequest;
                    const thisMonthProfit = target.result as ObjStoreTotalProfit;
        
                    if( thisMonthProfit === undefined ) {
                        const newThisMonthProfit: ObjStoreTotalProfit = {
                            yearMonth: targetYearMonth,
                            amount1: 0,
                            amount2: 0
                        };
        
                        objs.put( newThisMonthProfit );
                    }
                }

                tran.oncomplete = () => {
                    resolve(true);
                }

                tran.onerror = ( event ) => {
                    reject( new Error("Database calculate total profit error: " + event ) );
                }
            });

        };
        await checkThisMonthAndInsert();

        // -- pre

        const getPreProfit = (): Promise<ObjStoreTotalProfit> => {
            let _preProfit: ObjStoreTotalProfit = {
                yearMonth: "",
                amount1: 0,
                amount2: 0
            };
            return new Promise( async (resolve, reject) => {
                const db = await getDatabase();
                const tran = db.transaction( [OBJ_STORE_TOTAL_PROFIT], "readwrite" );
                const objs = tran.objectStore( OBJ_STORE_TOTAL_PROFIT );
                const index = objs.index("yearMonth");
                const reqPreProfit = index.getAll( IDBKeyRange.upperBound(targetYearMonth, true) );
                reqPreProfit.onsuccess = ( event ) => {
                    const target = event.target as IDBRequest;
                    if( target.result !== undefined ) {
                        const oldProfits = target.result as ObjStoreTotalProfit[];
                        if( oldProfits.length > 0 ) {
                            _preProfit = oldProfits[oldProfits.length - 1];
                        } else {
                            _preProfit.amount1 = 0;
                            _preProfit.amount2 = 0;    
                        }
                    } else {
                        _preProfit.amount1 = 0;
                        _preProfit.amount2 = 0;
                    }
                }

                tran.oncomplete = () => {
                    resolve( _preProfit );
                }

                tran.onerror = ( event ) => {
                    reject( new Error("Database calculate total profit error: " + event ) );
                }

            });
        }
        let preProfit = await getPreProfit();

        const incomSpendings = await getMonthlyInComSpending( targetYearMonth, latestYearMonth );

        const db = await getDatabase();
        const tran = db.transaction( [OBJ_STORE_TOTAL_PROFIT], "readwrite" );
        const objs = tran.objectStore( OBJ_STORE_TOTAL_PROFIT );
        const index = objs.index("yearMonth");
        const req = index.openCursor( IDBKeyRange.bound( targetYearMonth, latestYearMonth ) );
        req.onsuccess = async ( event ) => {
            const target = event.target as IDBRequest;
            const cursol = target.result as IDBCursorWithValue;

            if( cursol ) {
                const id = cursol.key as number;
                const profit = cursol.value as ObjStoreTotalProfit;
                
                let thisMonth = incomSpendings.find( (e) => {
                    return e.yearMonth === profit.yearMonth;
                });

                if( thisMonth === undefined ) {
                    thisMonth = {
                        yearMonth: "",
                        incom1: 0,
                        incom2: 0,
                        spending1: 0,
                        spending2: 0
                    };
                }

                profit.amount1 = preProfit.amount1 + ( thisMonth.incom1 - thisMonth.spending1 );
                profit.amount2 = preProfit.amount2 + ( thisMonth.incom2 - thisMonth.spending2 );

                objs.put( profit );
                preProfit = profit;

                cursol.continue();
            }
        }

        tran.oncomplete = () => {
            resolve( true );
        }

        tran.onerror = ( event ) => {
            reject( new Error( "Database calculate total profit error: " + event));
        }
    });
}


const updateLatestYearMonth = ( db: IDBDatabase, itemObjStore: IDBObjectStore ) : Promise<boolean> => {

    return new Promise( (resolve, reject) => {

        // -- check and update latest year month --

        const latestYmReq = itemObjStore.getAllKeys();
        latestYmReq.onsuccess = ( event ) => {
            const target = event.target as IDBRequest;
            const yms = target.result as string[];
            const latestYm = yms[yms.length - 1];

            const latestTran = db.transaction( [OBJ_STORE_LATEST], "readwrite" );    
            const latestObjs = latestTran.objectStore( OBJ_STORE_LATEST );
            const latestYmObjs: ObjStoreLatest = {
                type: "yearMonth",
                value: latestYm
            };

            latestObjs.put( latestYmObjs );

            resolve(true);

            latestTran.onerror = ( event ) => {
                reject( new Error( "Database put item error: " + event) );
            }
        }
    });
}

// -- put item

const putItem = async( sourceItem: DetailItemInfo ): Promise<boolean> => {

    return new Promise( async ( resolve, reject ) => {
        const db = await getDatabase();

        const tran = db.transaction( OBJ_STORE_ITEM, "readwrite" );
        const itemObjStore = tran.objectStore( OBJ_STORE_ITEM );

        const req = itemObjStore.get( IDBKeyRange.only( sourceItem.yearMonth ));
        req.onsuccess = async ( event ) => {
            const target = event.target as IDBRequest;
            let items = target.result as ObjStoreItem;

            if( items === undefined ) {
                // -- not found

                const newItem : ObjStoreItem = {
                    yearMonth: sourceItem.yearMonth,
                    itemByItemType: [{
                        itemType: sourceItem.itemType,
                        itemByClassID: [{
                            classId: sourceItem.itemClassId,
                            itemBySubClassId: [{
                                subClassId: sourceItem.itemSubClassId,
                                itemByParsonId: [{
                                    parsonId: sourceItem.parsonId,
                                    itemDetail: [{
                                        serial: sourceItem.id,
                                        registParsonId: sourceItem.regisParsonId,
                                        date: sourceItem.date,
                                        amount: sourceItem.amountOfMoney,
                                        memo: sourceItem.memo,
                                        deleteFlg: sourceItem.deleteFlg
                                    }]
                                }]
                            }]
                        }]
                    }]
                };

                itemObjStore.put( newItem );

                // -- check and update latest year month --

                await updateLatestYearMonth( db, itemObjStore );

            } else {
                // -- find key value

                const itemByItemType = items.itemByItemType.find( ( byItemType) => {
                    return byItemType.itemType === sourceItem.itemType;
                });

                if( itemByItemType === undefined ) {
                    const _itemByItemType: ObjStoreItemByItemType = {
                        itemType: sourceItem.itemType,
                        itemByClassID: [{
                            classId: sourceItem.itemClassId,
                            itemBySubClassId: [{
                                subClassId: sourceItem.itemSubClassId,
                                itemByParsonId: [{
                                    parsonId: sourceItem.parsonId,
                                    itemDetail: [{
                                        serial: sourceItem.id,
                                        registParsonId: sourceItem.regisParsonId,
                                        date: sourceItem.date,
                                        amount: sourceItem.amountOfMoney,
                                        memo: sourceItem.memo,
                                        deleteFlg: sourceItem.deleteFlg
                                    }]

                                }]

                            }]

                        }]
                    };

                    items.itemByItemType.push( _itemByItemType );

                } else {
                    const itemByClassId = itemByItemType.itemByClassID.find( ( byClassId ) => {
                        return byClassId.classId === sourceItem.itemClassId;
                    });

                    if( itemByClassId === undefined ) {
                        const _itemByClassId: ObjStoreItemByClassId = {
                            classId: sourceItem.itemClassId,
                            itemBySubClassId: [{
                                subClassId: sourceItem.itemSubClassId,
                                itemByParsonId: [{
                                    parsonId: sourceItem.parsonId,
                                    itemDetail: [{
                                        serial: sourceItem.id,
                                        registParsonId: sourceItem.regisParsonId,
                                        date: sourceItem.date,
                                        amount: sourceItem.amountOfMoney,
                                        memo: sourceItem.memo,
                                        deleteFlg: sourceItem.deleteFlg
                                    }]
                                }]
                            }]
                        };

                        itemByItemType.itemByClassID.push( _itemByClassId );

                    } else {

                        const itemBySubClassId = itemByClassId.itemBySubClassId.find( ( bySubClassId) => {
                            return bySubClassId.subClassId === sourceItem.itemSubClassId;
                        });
    
                        if( itemBySubClassId === undefined ) {
                            const _itemBySubClassId: ObjStoreItemBySubClassId = {
                                subClassId: sourceItem.itemSubClassId,
                                itemByParsonId: [{
                                    parsonId: sourceItem.parsonId,
                                    itemDetail: [{
                                        serial: sourceItem.id,
                                        registParsonId: sourceItem.regisParsonId,
                                        date: sourceItem.date,
                                        amount: sourceItem.amountOfMoney,
                                        memo: sourceItem.memo,
                                        deleteFlg: sourceItem.deleteFlg
                                    }]
                                }]
                            };

                            itemByClassId.itemBySubClassId.push( _itemBySubClassId );

                        } else {
                            const itemByParson = itemBySubClassId.itemByParsonId.find( (byParson) => {
                                return byParson.parsonId === sourceItem.parsonId;
                            });

                            if( itemByParson === undefined ) {
                                const _itemByParson: ObjStoreItemByParsonId = {
                                    parsonId: sourceItem.parsonId,
                                    itemDetail: [{
                                        serial: sourceItem.id,
                                        registParsonId: sourceItem.regisParsonId,
                                        date: sourceItem.date,
                                        amount: sourceItem.amountOfMoney,
                                        memo: sourceItem.memo,
                                        deleteFlg: sourceItem.deleteFlg
                                    }]
                                };

                                itemBySubClassId.itemByParsonId.push( _itemByParson );

                            } else {
                                const itemDetail = itemByParson.itemDetail.find( (detail) => {
                                    return ( detail.serial === sourceItem.id ) && (detail.registParsonId === sourceItem.regisParsonId);
                                });

                                if( itemDetail === undefined ) {
                                    const _itemDetail: ObjStoreItemDetail = {
                                        serial: sourceItem.id,
                                        registParsonId: sourceItem.regisParsonId,
                                        date: sourceItem.date,
                                        amount: sourceItem.amountOfMoney,
                                        memo: sourceItem.memo,
                                        deleteFlg: sourceItem.deleteFlg
                                    };

                                    itemByParson.itemDetail.push( _itemDetail );

                                } else {
                                    itemDetail.date = sourceItem.date;
                                    itemDetail.amount = sourceItem.amountOfMoney;
                                    itemDetail.deleteFlg = sourceItem.deleteFlg;                                    
                                }
                            }
                        }
                    }
                }

                itemObjStore.put( items );
            }
        }

        tran.oncomplete = () => {
            resolve(true);
        }

        tran.onerror = ( event ) => {
            reject( new Error("Database update error: " + event));
        }

    });
}


const putObjStoreItems = async ( sourceItem: ObjStoreItem ): Promise<boolean> => {
    const db = await getDatabase();

    return new Promise( (resolve, reject) => {
        const tran = db.transaction( OBJ_STORE_ITEM, "readwrite" );
        const itemObjStore = tran.objectStore( OBJ_STORE_ITEM );
    
        const req = itemObjStore.get( IDBKeyRange.only( sourceItem.yearMonth ));
        req.onsuccess = async ( event ) => {
            const target = event.target as IDBRequest;
            let items = target.result as ObjStoreItem;
    
            if( items === undefined ) {
                itemObjStore.put( sourceItem );
    
                // -- check and update latest year month --
                await updateLatestYearMonth( db, itemObjStore );
                
            } else {
    
                sourceItem.itemByItemType.forEach( (byItemType) => {
                    let destByItemType = items.itemByItemType.find( (e) => { 
                        return e.itemType === byItemType.itemType;
                    } );
                    if( destByItemType === undefined ) {
                        items.itemByItemType.push( byItemType );
    
                    } else {
                        byItemType.itemByClassID.forEach( (byItemClassId) => {
                            let destByItemClassId = destByItemType?.itemByClassID.find( (e) => { 
                                return e.classId === byItemClassId.classId;
                            });
                            if( destByItemClassId === undefined ) {
                                destByItemType?.itemByClassID.push( byItemClassId );
    
                            } else {
                                byItemClassId.itemBySubClassId.forEach( (byItemSubClassId) => {
                                    let destByItemSubClassId = destByItemClassId?.itemBySubClassId.find( (e) => { 
                                        return e.subClassId === byItemSubClassId.subClassId;
                                    });
                                    if( destByItemSubClassId === undefined ) {
                                        destByItemClassId?.itemBySubClassId.push( byItemSubClassId );
    
                                    } else {
                                        byItemSubClassId.itemByParsonId.forEach( (byParsonId) => {
                                            let destByParsonId = destByItemSubClassId?.itemByParsonId.find( (e) => { 
                                                return e.parsonId === byParsonId.parsonId; 
                                            });
                                            if( destByParsonId === undefined ) {
                                                destByItemSubClassId?.itemByParsonId.push( byParsonId );
    
                                            } else {
                                                byParsonId.itemDetail.forEach( (detail) => {
                                                    let destDetail = destByParsonId?.itemDetail.find( (e) => { 
                                                        return ( e.serial === detail.serial) && (e.registParsonId == detail.registParsonId); 
                                                    });
                                                    if( destDetail === undefined ) {
                                                        destByParsonId?.itemDetail.push( detail );
    
                                                    } else {
                                                        destDetail.date = detail.date;
                                                        destDetail.amount = detail.amount;
                                                        destDetail.memo = detail.memo;
                                                        if( destDetail.deleteFlg === false ) {
                                                            destDetail.deleteFlg = detail.deleteFlg;
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
    
                itemObjStore.put( items );
            }
        }
    
        tran.oncomplete = () => {
            resolve( true );
        }
    
        tran.onerror = ( event ) => {
            reject( new Error( "Database put objstore item error: " + event))
        }
    
    });
}




const getTotalByClass = ( yearMonth: string ): Promise<ObjStoreTotalByClassId> => {

    return new Promise( async ( resolve, reject) => {
        const db = await getDatabase();
        const tran = db.transaction([ OBJ_STORE_TOTAL_BY_CLASS], "readonly" );
        const objs = tran.objectStore( OBJ_STORE_TOTAL_BY_CLASS );

        let total: ObjStoreTotalByClassId;

        const req = objs.get( IDBKeyRange.only( yearMonth ) );
        req.onsuccess = ( event ) => {
            const target = event.target as IDBRequest;
            total = target.result as ObjStoreTotalByClassId;
        }

        tran.oncomplete = () => {
            resolve( total );
        }

        tran.onerror = ( event ) => {
            reject( new Error( "Database get taotalByClass error: " + event));
        }
    });
}


const getTotalByClassAll = (): Promise<ObjStoreTotalByClassId[]> => {

    return new Promise( async ( resolve, reject ) => {
        const db = await getDatabase();
        const tran = db.transaction( [OBJ_STORE_TOTAL_BY_CLASS], "readonly" );
        const objs = tran.objectStore( OBJ_STORE_TOTAL_BY_CLASS );

        let totalList: ObjStoreTotalByClassId[] = [];

        const req = objs.getAll();
        req.onsuccess = ( event ) => {
            const target = event.target as IDBRequest;
            if( target.result !== undefined ) {
                totalList = target.result as ObjStoreTotalByClassId[];
            }
        }

        tran.oncomplete = () => {
            resolve( totalList );
        }

        tran.onerror = ( event ) => {
            reject( new Error( "Database get all total error: " + event ) );
        }
    });



}


const getItems = ( _yearMonth: string ): Promise<ObjStoreItem> => {

    return new Promise( async (resolve, reject) => {
        let yearMonth = "";
        if( _yearMonth === "" ) {
            // -- get latest yearmonth
            yearMonth = await getLatestYearMonth();
        } else {
            yearMonth = _yearMonth;
        }

        const db = await getDatabase();
        const tran = db.transaction( [OBJ_STORE_ITEM], "readonly" );
        const objs = tran.objectStore( OBJ_STORE_ITEM );

        let item: ObjStoreItem;

        const req = objs.get( IDBKeyRange.only( yearMonth ) );
        req.onsuccess = ( event ) => {
            const target = event.target as IDBRequest;
            const _item = target.result as ObjStoreItem;

            if( _item !== undefined ) {
                item = _item;
            }
        }

        tran.oncomplete = () => {
            resolve( item );
        }

        tran.onerror = ( event ) => {
            reject( new Error( "Database get latest items error: " + event));
        }
    });
}

const getAllTotalProfit = (): Promise<ObjStoreTotalProfit[]> => {

    return new Promise( async (resolve, reject) => {

        const db = await getDatabase();
        const tran = db.transaction( [OBJ_STORE_TOTAL_PROFIT], "readonly" );
        const objs = tran.objectStore( OBJ_STORE_TOTAL_PROFIT );

        let rtnProfitList : ObjStoreTotalProfit[];

        const req = objs.getAll();
        req.onsuccess = ( event ) => {
            const target = event.target as IDBRequest;
            const profits = target.result as ObjStoreTotalProfit[];

            if( profits !== undefined ) {
                rtnProfitList = profits;
            }
        }

        tran.oncomplete = () => {
            resolve( rtnProfitList );
        }

        tran.onerror = ( event ) => {
            reject( new Error( "Database get latest total profit error: " + event ) );
        }
    });
}


// -- parson info --

const getParsonAllInfo = (): Promise<ParsonInfo[]> => {

    return new Promise( async (resolve, reject) => {

        const db = await getDatabase();
        const tran = db.transaction( [OBJ_STORE_PARSON], "readonly" );
        const objs = tran.objectStore( OBJ_STORE_PARSON );

        let parsonList: ParsonInfo[] = [];

        const req = objs.getAll();
        req.onsuccess = ( event ) => {
            const target = event.target as IDBRequest;
            const parsons = target.result as ParsonInfo[];

            if( parsons !== undefined ) {
                parsonList = parsons;
            }
        }

        tran.oncomplete = () => {
            resolve( parsonList );
        }

        tran.onerror = ( event ) => {
            reject( new Error( "Databse get parson all info error: " + event) );
        }

    });
}


const putParsonInfo = ( parson : ParsonInfo ): Promise<boolean> => {

    return new Promise( async (resolve, reject ) => {

        const db = await getDatabase();
        const tran = db.transaction( [OBJ_STORE_PARSON], "readwrite" );
        const objs = tran.objectStore( OBJ_STORE_PARSON );

        const req = objs.put( parson );

        tran.oncomplete = () => {
            resolve(true);
        }

        tran.onerror = ( event ) => {
            reject( new Error( "Database put parsoninfo error: " + event ));
        }
    });
}

// -- request queue --

let requestQueue: DbRequest[] = new Array<DbRequest>();
let isExecutingReqLoop = false;

// -- request 

onmessage = ( event ) => {
    const req = event.data as DbRequest;
    pushRequestQueue( req );

}

const pushRequestQueue = ( req: DbRequest) => {

    // -- push

    if( requestQueue.length === 0 ) {
        requestQueue.push( req );
    } else {
        switch( req.command ) {
            case "calc":
                {
                    const target = requestQueue.find( (e) => {
                        return ( e.command === req.command ) && ( e.targetYearMonth === req.targetYearMonth );
                    });
                
                    if( target === undefined ) {
                        requestQueue.push( req );
                    }
                }
                break;

            case "get_all_total_profit":
                requestQueue.push( req );
                break;

            default:
                {
                    const calcIndex = requestQueue.findIndex( (task) => {
                        return task.command === "calc";
                    });
            
                    if( calcIndex === -1 ) {
                        requestQueue.push( req );

                    } else {
                        requestQueue.splice( calcIndex, 0, req );
                    }                    
                }
                break;
        }
    }

    if( isExecutingReqLoop === false ) {
        startRequestLoop();
    }

}

const startRequestLoop = async () => {

    isExecutingReqLoop = true;

    while( true ) {
        const _task = requestQueue.shift();
        if( _task === undefined ) {
            isExecutingReqLoop = false;
            break;
        }

        const task: DbRequest = {
            ..._task
        };

        console.log( "command " + task.command + " yearmonth " + task.targetYearMonth );

        switch( task.command ) {
            case "calc":
                {
                    await calculate( task.targetYearMonth );
                    const total = await getTotalByClass( task.targetYearMonth );
                    await calculateTotalProfit( task.targetYearMonth );
                    const result: DbResult = {
                        command: "calc",
                        data: total
                    };

                    postMessage( result );

                }
                break;

            case "put_item":
                if( task.sourceItem !== null ) {
                    await putItem( task.sourceItem );
                }
                break;
            
            case "put_objstore_item":
                if( task.sourceObjStoreItem !== null ) {
                    await putObjStoreItems( task.sourceObjStoreItem );
                }
                break;

            case "get_total":
                {
                    const total = await getTotalByClass( task.targetYearMonth );
                    const result: DbResult = {
                        command: "get_total",
                        data: total
                    };

                    postMessage( result );
                }
                break;
            
            case "get_all_total":
                {
                    const totalList = await getTotalByClassAll();
                    const result: DbResult = {
                        command: "get_all_total",
                        data: totalList
                    };

                    postMessage( result );
                }
                break;

            case "get_items":
                {
                    const latestItems = await getItems( task.targetYearMonth );
                    const result: DbResult = {
                        command: "get_items",
                        data: latestItems
                    };

                    postMessage( result );    
                }
                break;

            case "get_all_total_profit":
                {
                    const totalProfitList = await getAllTotalProfit();
                    const result: DbResult = {
                        command: "get_all_total_profit",
                        data: totalProfitList
                    };

                    postMessage( result );
                }
                break;

            case "get_serial":
                {
                    const serial = await getAndUpdateItemSerialNumber();
                    const result: DbResult = {
                        command: "get_serial",
                        data: serial
                    };

                    postMessage( result );
                }
                break;
            
            case "get_all_parson":
                {
                    const parsonList = await getParsonAllInfo();
                    const result: DbResult = {
                        command: "get_all_parson",
                        data: parsonList
                    };

                    postMessage( result );
                }
                break;

            case "put_parson_info":
                {
                    if( task.parsonInfo !== null ) {
                        await putParsonInfo( task.parsonInfo );
                    }
                }
        }

    }

}
