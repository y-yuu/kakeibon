import {defineStore} from "pinia";
import type { SubClassInfo, TotalBySubClass } from "@/interfaces";

interface State {
    subClassList: Array<SubClassInfo>
}

export const useSubClassListStore = defineStore({
    id: "subClasslist",
    state: (): State => {
        return {
            subClassList: new Array<SubClassInfo>()
        }
    },

    getters: {
        getAllItems: ( state ) => {
            return (): Array<SubClassInfo> => {
                return state.subClassList;
            }
        },

        getById: ( state ) => {
            return ( itemType: "spending" | "incom", classId: string, subClassId: string ): string => {
                const subClassInfo = state.subClassList.find( (e) => {
                    return ( e.itemType === itemType ) && ( e.classId === classId ) && ( e.subClassId === subClassId );
                });

                if( subClassInfo === undefined ) {
                    return "";
                } else {
                    return subClassInfo.name;
                }
            }
        },

        getByClassId: ( state ) => {
            return ( itemType: "spending" | "incom", classId: string ): SubClassInfo[] => {
                const subClassInfoList = state.subClassList.filter( (e) => {
                    return (e.itemType === itemType) && (e.classId === classId );
                });

                if( subClassInfoList.length === 0 ) {
                    return [];
                } else {
                    return subClassInfoList;
                }
            }
        }
    },

    actions: {
        initSubClassList(): void {
            this.subClassList.push({
                classId: "1",
                subClassId: "0",
                name: "スーパー",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "1",
                subClassId: "1",
                name: "コンビニ",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "1",
                subClassId: "2",
                name: "平日昼",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "1",
                subClassId: "3",
                name: "間食",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "1",
                subClassId: "4",
                name: "外食",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "1",
                subClassId: "5",
                name: "備蓄用",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "1",
                subClassId: "6",
                name: "その他",
                itemType: "spending"
            });

            // --------------------

            this.subClassList.push({
                classId: "2",
                subClassId: "0",
                name: "水道代",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "2",
                subClassId: "1",
                name: "電気代",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "2",
                subClassId: "2",
                name: "ガス代",
                itemType: "spending"
            });

            // ---------------------

            this.subClassList.push({
                classId: "3",
                subClassId: "0",
                name: "消耗品",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "3",
                subClassId: "1",
                name: "非消耗品",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "3",
                subClassId: "2",
                name: "その他",
                itemType: "spending"
            });

            // -------------------

            this.subClassList.push({
                classId: "6",
                subClassId: "0",
                name: "スマホ代",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "6",
                subClassId: "1",
                name: "インターネット代",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "6",
                subClassId: "2",
                name: "NHK受信料",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "6",
                subClassId: "3",
                name: "その他",
                itemType: "spending"
            });

            // -------------------

            this.subClassList.push({
                classId: "7",
                subClassId: "0",
                name: "歯科",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "7",
                subClassId: "1",
                name: "婦人科",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "7",
                subClassId: "2",
                name: "皮膚科",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "7",
                subClassId: "3",
                name: "耳鼻科",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "7",
                subClassId: "4",
                name: "内科",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "7",
                subClassId: "5",
                name: "市販薬",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "7",
                subClassId: "6",
                name: "その他",
                itemType: "spending"
            });

            // --------------------

            this.subClassList.push({
                classId: "13",
                subClassId: "0",
                name: "美容院・床屋",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "13",
                subClassId: "1",
                name: "コスメ（必須）",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "13",
                subClassId: "2",
                name: "コスメ（オプション）",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "13",
                subClassId: "3",
                name: "その他",
                itemType: "spending"
            });





        }

    }
    
});