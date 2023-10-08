import {defineStore} from "pinia";
import type { ParsonInfo } from "@/interfaces";
import { requestGetAllParsonInfo, requestPutParsonInfo } from "./DbRequestWindow";


// -- 人情報

interface State {
    parsonList: Array<ParsonInfo>
}

export const useParsonStore = defineStore({
    id: "parsonInfo",
    state: (): State => {
        return {
            parsonList: new Array<ParsonInfo>()
        }
    },

    getters: {
        getById: ( state ) => {
            return ( id: string ) : string => {
                const parson = state.parsonList.find( (e) => e.id === id );

                let name = "";
                if( parson !== undefined ) {
                    name = parson.name;
                }

                return name;
            }
        },

        getMyInfo: ( state ) => {
            return (): ParsonInfo => {
                const my = state.parsonList.find( (e) => e.myFlg === true );
                if( my === undefined ) {
                    const _my: ParsonInfo = {
                        id: "-1",
                        name: "",
                        myFlg: true
                    };
                    return _my;

                } else {
                    return my;
                }
            }
        }


    },

    actions: {
        setParsonList(): Promise<boolean> {

            return new Promise( (resolve, reject) => {

                this.parsonList = new Array<ParsonInfo>();

                requestGetAllParsonInfo( ( _parsonList ) => {
    
                    if( _parsonList.length === 0 ) {
                        const parson0: ParsonInfo = {
                            id: "0",
                            name: "",
                            myFlg: true
                        };
    
                        const parson1: ParsonInfo = {
                            id: "1",
                            name: "",
                            myFlg: false
                        };
    
                        requestPutParsonInfo( parson0 );
                        requestPutParsonInfo( parson1 );
    
                        this.parsonList.push(parson0);
                        this.parsonList.push(parson1);
    
                    } else {
                        _parsonList.forEach( (parson) => {
                            this.parsonList.push({
                                id: parson.id,
                                name: parson.name,
                                myFlg: parson.myFlg
                            });
                        });    
                    }

                    resolve( true );
                });
            });

        },

        updateParonName( id: string, name: string ) {
            const parson = this.parsonList.find( (e) => {
                return e.id === id;
            });

            if( parson !== undefined ) {
                parson.name = name;

                const _parson: ParsonInfo = {
                    ...parson
                };

                requestPutParsonInfo( _parson );
            }
        },

        updateMyId( id: string ) {

            if( id === "0" ) {
                const parson0 = this.parsonList.find( (e) => {
                    return e.id === "0";
                });
                if( parson0 !== undefined ) {
                    parson0.myFlg = true;
                    const _parson0: ParsonInfo = {
                        ...parson0
                    };

                    requestPutParsonInfo( _parson0 );
                }

                const parson1 = this.parsonList.find( (e) => {
                    return e.id === "1";
                });
                if( parson1 !== undefined ){
                    parson1.myFlg = false;
                    const _parson1: ParsonInfo = {
                        ...parson1
                    };

                    requestPutParsonInfo( _parson1 );
                }

            } else {
                const parson0 = this.parsonList.find( (e) => {
                    return e.id === "0";
                });
                if( parson0 !== undefined ) {
                    parson0.myFlg = false;
                    const _parson0: ParsonInfo = {
                        ...parson0
                    };

                    requestPutParsonInfo( _parson0 );
                }

                const parson1 = this.parsonList.find( (e) => {
                    return e.id === "1";
                });
                if( parson1 !== undefined ){
                    parson1.myFlg = true;
                    const _parson1: ParsonInfo = {
                        ...parson1
                    }

                    requestPutParsonInfo( _parson1 );
                }

            }

        }
    }


});
