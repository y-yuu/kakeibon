import {defineStore} from "pinia";
import type { ClassInfo } from "@/interfaces";

interface State {
    classList: Array<ClassInfo>
}

export const useClassListStore = defineStore({
    id: "classList",
    state: (): State => {
        return {
            classList: new Array<ClassInfo>()
        }
    },

    getters: {
        getAllItems: ( state ) => {
            return (): Array<ClassInfo> => {
                return state.classList;
            }
        },

        getById: ( state ) => {
            return ( itemType: "spending" | "incom", id: string ) : string => {
                const classInfo = state.classList.find( (e) => (e.id === id) && (e.itemType === itemType));
                if( classInfo === undefined ) {
                    return "";
                } else {
                    return classInfo.name;
                }
            }
        },

        getByItemType: ( state ) => {
            return ( itemType: "spending" | "incom" ): Array<ClassInfo> => {
                return state.classList.filter( (e) => e.itemType === itemType );
            }
        }

    },

    actions: {
        initClassList(): void {
            this.classList.push({
                id: "0",
                name: "家賃",
                itemType: "spending"
            });

            this.classList.push({
                id: "1",
                name: "食費",
                itemType: "spending"
            });

            this.classList.push({
                id: "2",
                name: "水道光熱費",
                itemType: "spending"
            });

            this.classList.push({
                id: "3",
                name: "日用品",
                itemType: "spending"
            });

            this.classList.push({
                id: "4",
                name: "通信費",
                itemType: "spending"
            });

            this.classList.push({
                id: "5",
                name: "医療費",
                itemType: "spending"
            });

            this.classList.push({
                id: "6",
                name: "被服、履物",
                itemType: "spending"
            });

            this.classList.push({
                id: "7",
                name: "交通費",
                itemType: "spending"
            });

            this.classList.push({
                id: "8",
                name: "教育費",
                itemType: "spending"
            });

            this.classList.push({
                id: "9",
                name: "教養娯楽費",
                itemType: "spending"
            });

            this.classList.push({
                id: "10",
                name: "美容、理容",
                itemType: "spending"
            });

            this.classList.push({
                id: "0",
                name: "給料",
                itemType: "incom"
            });
        
            this.classList.push({
                id: "1",
                name: "賞与",
                itemType: "incom"
            });

            this.classList.push({
                id: "2",
                name: "贈与",
                itemType: "incom"
            });

            



        }



    }


})


