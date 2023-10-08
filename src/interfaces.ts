import type { ObjStoreItem } from "./stores/Database";

// -- 支出、収入明細情報
export interface DetailItemInfo {
    id:             number;
    regisParsonId:  string;
    itemType:       "spending" | "incom";
    yearMonth:      string;
    date:           string;
    parsonId:       string;
    parsonName:     string;
    itemClassId:    string;
    className:      string;
    itemSubClassId: string;
    subClassName:   string;
    memo:           string;
    amountOfMoney:  number;
    deleteFlg:      boolean;
}

// -- リザルトテーブルの情報

// -- 項目別の支出 or 収入合計
export interface TotalByClass {
    yearMonth:              string;
    itemType:               "spending" | "incom";
    itemClassId:            string;
    itemClassName:          string;
    amountOfMoneyParson1:   number;
    amountOfMoneyParson2:   number;
    totalBySubClass:        TotalBySubClass[];
}

// -- サブ項目別の支出 or 収入合計
export interface TotalBySubClass {
    itemSubClassId:         string;
    itemSubClassName:       string;
    amountOfMoneyParson1:   number;
    amountOfMoneyParson2:   number;
}


export interface TotalByClassTotalAmount {
    yearMonth:              string;
    itemType:               "spending" | "incom";
    amount1:                number;
    amount2:                number;
}

// -- 項目別の支出 or 収入平均
export interface AverageByClass {
    date:                   string;
    itemType:               "spending" | "incom";
    itemClassId:            string;
    itemClassName:          string;
    amountOfMoneyParson1:   number;
    amountOfMoneyParson2:   number;
    rangeStartDate:         string;
    rangeEndDAte:           string;
}



// -- 収支
export interface TotalProfit {
    yearMonth:              string;
    amountOfMoneyParson1:   number;
    amountOfMoneyParson2:   number;

}


// -- 分類定義
export interface ClassInfo {
    id:         string;
    name:       string;
    itemType:   "spending" | "incom";
}

export interface SubClassInfo {
    classId:    string;
    subClassId: string;
    name:       string;
    itemType:   "spending" | "incom";
}



export interface ParsonInfo {
    id:     string;
    name:   string;
    myFlg:  boolean;
}


// -- Db Request format --

export interface DbRequest {
    command:    "calc" | 
                "put_item" | 
                "put_objstore_item" | 
                "get_total" | 
                "get_items" | 
                "get_all_total_profit" | 
                "get_all_total" | 
                "get_serial" | 
                "get_all_parson" |
                "put_parson_info";

    targetYearMonth:  string;
    sourceItem: DetailItemInfo | null;
    sourceObjStoreItem: ObjStoreItem | null;
    parsonInfo: ParsonInfo | null;
    intArg: number;
}

export interface DbResult {
    command:    "calc" | 
                "put_item" | 
                "put_objstore_item" | 
                "get_total" | 
                "get_items" | 
                "get_all_total_profit" |
                "get_all_total" | 
                "get_serial"  | 
                "get_all_parson" |
                "put_parson_info";
    data: any;
}


// -- synch format --
export interface SynchFormat {
    command: string;
    myName: string;
    items: ObjStoreItem;
}