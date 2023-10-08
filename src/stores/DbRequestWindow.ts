import type { DbRequest, DbResult, DetailItemInfo, ParsonInfo,  } from "@/interfaces";
import type { ObjStoreItem, ObjStoreTotalByClassId, ObjStoreTotalProfit } from "./Database";

const dbWorker = new Worker( "./src/stores/Database.ts" );


// -- receive result from db --

let getItemsFunc: (( items: ObjStoreItem ) => void)[] = [];
let getCalcResultFunc: {
    yearMonth: String,
    func: ( total: ObjStoreTotalByClassId ) => void
}[] = [];

let getTotalProfitFunc: (( profitList: ObjStoreTotalProfit[] ) => void )[] = [];
let getTotalFunc: (( total: ObjStoreTotalByClassId ) => void )[] = [];
let getAllTotalFunc: (( totalList: ObjStoreTotalByClassId[] ) => void )[] = [];
let getSerialFunc: ( ( serial: number ) => void )[] = [];
let getAllParsonInfoFunc: ( ( parsonList: ParsonInfo[] ) => void )[] = [];

dbWorker.onmessage = ( e ) => {
    const result = e.data as DbResult;
    switch( result.command ) {
        case "get_items":
            {
                const resultAction = getItemsFunc.shift();
                if( resultAction !== undefined ) {
                    resultAction( result.data as ObjStoreItem );
                }
            }
            break;

        case "calc":
            {
                const data = result.data as ObjStoreTotalByClassId;;

                const resultActions = getCalcResultFunc.filter( (e) => {
                    return e.yearMonth === data.yearMonth;
                });

                resultActions.forEach( (e) => {
                    e.func( data );
                });


                const newList = getCalcResultFunc.filter( (e) => {
                    return e.yearMonth !== data.yearMonth;
                });

                getCalcResultFunc = newList.map( (e) => {
                    return e;
                });
            }            
            break;

        case "get_all_total_profit":
            {
                const resultAction = getTotalProfitFunc.shift();
                if( resultAction !== undefined ) {
                    resultAction( result.data as ObjStoreTotalProfit[] );
                }
            }
            break;

        case "get_total":
            {
                const resultAction = getTotalFunc.shift();
                if( resultAction !== undefined ) {
                    resultAction( result.data as ObjStoreTotalByClassId );
                }
            }
            break;

        case "get_all_total":
            {
                const resultAction = getAllTotalFunc.shift();
                if( resultAction !== undefined ) {
                    resultAction( result.data as ObjStoreTotalByClassId[] );
                }

            }
            break;

        case "get_serial":
            {
                const resultAction = getSerialFunc.shift();
                if( resultAction !== undefined ) {
                    resultAction( result.data as number );
                }
            }
            break;
        
        case "get_all_parson":
            {
                const resultAction = getAllParsonInfoFunc.shift();
                if( resultAction !== undefined ) {
                    resultAction( result.data as ParsonInfo[] );
                }
            }
    }
}


// -- receive request --

export const requestPutItem = ( item: DetailItemInfo, resultAction: ( serial: number ) => void ) => {

    const req: DbRequest = {
        command: "put_item",
        targetYearMonth: "",
        sourceItem: item,
        sourceObjStoreItem: null,
        parsonInfo: null,
        intArg: 0
    };

    dbWorker.postMessage( req );
}

export const requestPutObjStoreItem = ( item: ObjStoreItem ) => {

    const req: DbRequest = {
        command: "put_objstore_item",
        targetYearMonth: "",
        sourceItem: null,
        sourceObjStoreItem: item,
        parsonInfo: null,
        intArg: 0
    };

    dbWorker.postMessage( req );
}

export const requestGetItems = ( yearMonth: string, resultAction: ( items: ObjStoreItem ) => void ) => {

    // -- set func
    getItemsFunc.push( resultAction );

    // -- send request
    const req: DbRequest = {
        command: "get_items",
        targetYearMonth: yearMonth,
        sourceItem: null,
        sourceObjStoreItem: null,
        parsonInfo: null,
        intArg: 0
    };

    dbWorker.postMessage( req );
}


export const requestCalclate = ( yearMonth: string, resultAction: ( total: ObjStoreTotalByClassId ) => void ) => {

    // -- set func
    getCalcResultFunc.push({
        yearMonth: yearMonth,
        func: resultAction
    });

    // -- send request
    const req: DbRequest = {
        command: "calc",
        targetYearMonth: yearMonth,
        sourceItem: null,
        sourceObjStoreItem: null,
        parsonInfo: null,
        intArg: 0
    };

    dbWorker.postMessage( req );
}


export const requestGetAllTotalProfit = ( resultAction: ( profitList: ObjStoreTotalProfit[] ) => void ) => {

    // -- set func
    getTotalProfitFunc.push( resultAction );

    // -- send request
    const req: DbRequest = {
        command: "get_all_total_profit",
        targetYearMonth: "",
        sourceItem: null,
        sourceObjStoreItem: null,
        parsonInfo: null,
        intArg: 0
    };

    dbWorker.postMessage( req );
} 


export const requestGetTotal = ( yearMonth: string, resultAction: ( total: ObjStoreTotalByClassId ) => void ) => {

    // -- set func
    getTotalFunc.push( resultAction );

    // -- send request
    const req: DbRequest = {
        command: "get_total",
        targetYearMonth: yearMonth,
        sourceItem: null,
        sourceObjStoreItem: null,
        parsonInfo: null,
        intArg: 0
    };

    dbWorker.postMessage( req );
}

export const requestGetAllTotal = ( resultAction: ( totalList: ObjStoreTotalByClassId[] ) => void ) => {

    // -- set func
    getAllTotalFunc.push( resultAction );

    const req: DbRequest = {
        command: "get_all_total",
        targetYearMonth: "",
        sourceItem: null,
        sourceObjStoreItem: null,
        parsonInfo: null,
        intArg: 0
    };

    dbWorker.postMessage( req );
}

export const requestGetSerial = ( resultAction: ( serial: number ) => void ) => {

    getSerialFunc.push( resultAction );

    const req: DbRequest = {
        command: "get_serial",
        targetYearMonth: "",
        sourceItem: null,
        sourceObjStoreItem: null,
        parsonInfo: null,
        intArg: 0
    };

    dbWorker.postMessage( req );
}

export const requestGetAllParsonInfo = ( resultAction: ( parsonList: ParsonInfo[] ) => void ) => {

    getAllParsonInfoFunc.push( resultAction );

    const req: DbRequest = {
        command: "get_all_parson",
        targetYearMonth: "",
        sourceItem: null,
        sourceObjStoreItem: null,
        parsonInfo: null,
        intArg: 0
    };

    dbWorker.postMessage( req );
}

export const requestPutParsonInfo = ( parson: ParsonInfo ) => {

    const req: DbRequest = {
        command: "put_parson_info",
        targetYearMonth: "",
        sourceItem: null,
        sourceObjStoreItem: null,
        parsonInfo: parson,
        intArg: 0
    };

    dbWorker.postMessage( req );
}