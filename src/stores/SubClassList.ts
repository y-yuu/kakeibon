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
                name: "カフェ",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "1",
                subClassId: "2",
                name: "外食",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "1",
                subClassId: "3",
                name: "その他",
                itemType: "spending"
            });

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

            this.subClassList.push({
                classId: "3",
                subClassId: "0",
                name: "家事消耗品",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "3",
                subClassId: "1",
                name: "家具家電",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "3",
                subClassId: "2",
                name: "その他",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "4",
                subClassId: "0",
                name: "スマホ代",
                itemType: "spending"
            });

            this.subClassList.push({
                classId: "4",
                subClassId: "1",
                name: "インターネット代",
                itemType: "spending"
            });





        }

    }
    
});