

export class Graph {
    ctx: CanvasRenderingContext2D;
    height: number;
    width: number;

    xList: number[];

    dataNum: number;

    //mouseDownX: number;
    isDisplayingInfoDraw: boolean;

    infoFloatDrawer: ( index: number, mouseX: number ) => void;
    infoFloatEraser: () => void;

    graphCursolXGetter: ( mouseX: number ) => void;

    constructor( canvasId: string, height: number, width: number ) {
        const h = height * 2;
        const w = width * 2;

        let canvas = document.querySelector( canvasId ) as HTMLCanvasElement;
        canvas.setAttribute("height", h.toString());
        canvas.setAttribute("width", w.toString());

        this.ctx = canvas.getContext("2d");
        this.ctx.lineWidth = 1;
        this.ctx.font = "10px Helvetica";

        this.ctx.scale(2, 2);

        this.height = height;
        this.width = width;
        this.isDisplayingInfoDraw = false;

        this.xList = [];
        this.dataNum = 20;

        canvas.onmousemove = ( e : MouseEvent ) => {
            const distance = 100;
            let xPosi = distance;
            const transX = this.width / 20;

            // -- info float --

            if( this.includeRange( this.xList, e.offsetX ) ) {
                

                this.isDisplayingInfoDraw = true;

                const index = Math.round((e.offsetX - xPosi) / transX);
                this.infoFloatDrawer( index, e.offsetX );

            } else {
                this.isDisplayingInfoDraw = false;
                this.infoFloatEraser();

            }

            // -- cursol bar --
            let cursolX = e.offsetX;
            let cursolRange = this.isCursolRange( this.xList, e.offsetX );
            if( cursolRange.isRange ) {
                cursolX = cursolRange.x;
            } 

            this.graphCursolXGetter( cursolX );
        }
    }

    // -- param
    // dateList: 期間のyyyymmddのリスト
    // transitionDataList1: 推移グラフ１用
    // monthlyDataList1: 単月グラフ１用
    // monthlyDataList2: 単月グラフ２用
    drawGraph = ( dateList: string[], transitionDataList1: number[] | null, monthlyDataList1: number[] | null, monthlyDataList2: number[] | null) => {
        const baseLine= (this.height - 20) / 2;
        const maxPointHeight = baseLine * 0.80;
        const distance = 100;
        let xPosi = distance;
        const transX = this.width / this.dataNum;

        this.ctx.strokeStyle = "black";

        // -- bottom line scale --
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height - 20 );
        this.ctx.lineTo(this.width, this.height - 20 );
        this.ctx.stroke();

        dateList.forEach( (e) => {
            this.ctx.fillText( e, xPosi - 10,  this.height - 10 );
            this.xList.push( Math.round(xPosi) );
            xPosi += transX;
        });
        xPosi = distance;

        // -- base line --
        this.ctx.beginPath();
        this.ctx.moveTo( 0, baseLine );
        this.ctx.lineTo( this.width, baseLine );
        this.ctx.stroke();


        // -- rate --

        let maxData = 0;
        let minData = 0;

        if( transitionDataList1 !== null ) {
            transitionDataList1.forEach( (e) => {
                if( maxData < e ) {
                    maxData = e;
                }

                if( minData > e ) {
                    minData = e;
                }
            });
        }

        if( monthlyDataList1 !== null ) {
            monthlyDataList1.forEach( (e) => {
                if( maxData < e ) {
                    maxData = e;
                }
            });
        }

        if( monthlyDataList2 !== null ) {
            monthlyDataList2.forEach( (e) => {
                if( maxData < e ) {
                    maxData = e;
                }
            });
        }

        let absData = 0;
        if( Math.abs(maxData) > Math.abs(minData) ) {
            absData = Math.abs(maxData);
        } else {
            absData = Math.abs(minData);
        }

        const rate = maxPointHeight / absData;

        // -- up scale --

        this.ctx.beginPath();
        this.ctx.strokeStyle = 'lightgray';
        this.ctx.fillStyle = "silver";
        
        let count = absData;
        let maxScale = 0;

        while(true) {
            const temp = count % 200000;
            if( temp === 0 ) {
                maxScale = count;
                break;
            } else if( temp <= 0 ) {
                break;
            } else {
                count -= 1;
            }
        }

        let scale = maxScale;
        let scaleY = baseLine - scale * rate;
        this.ctx.moveTo( distance - 10, scaleY );
        this.ctx.lineTo( this.width, scaleY );
        this.ctx.stroke();

        this.ctx.fillText( maxScale.toLocaleString(), distance - 50, scaleY + 4 );

        this.ctx.beginPath();

        while(true) {
            scale -= 200000;
            if( scale <= 0 ) {
                break;
            }
            scaleY = baseLine - scale * rate;

            this.ctx.moveTo( distance - 10, scaleY );
            this.ctx.lineTo( this.width, scaleY );
            this.ctx.stroke();

            this.ctx.fillText( scale.toLocaleString(), distance - 50, scaleY + 4 );
        }

        // -- down scale --

        scale = maxScale;
        scaleY = baseLine + scale * rate;

        this.ctx.beginPath();
        this.ctx.moveTo( distance - 10, scaleY );
        this.ctx.lineTo( this.width, scaleY );
        this.ctx.stroke();

        this.ctx.fillText( maxScale.toLocaleString(), distance - 50, scaleY + 4 );

        this.ctx.beginPath();

        while(true) {
            scale -= 200000;
            if( scale <= 0 ) {
                break;
            }
            scaleY = baseLine + scale * rate;

            this.ctx.moveTo( distance - 10, scaleY );
            this.ctx.lineTo( this.width, scaleY );
            this.ctx.stroke();

            this.ctx.fillText( scale.toLocaleString(), distance - 50, scaleY + 4 );
        }

        // -- total profit --

        this.ctx.strokeStyle = "#007700";
        this.ctx.fillStyle = "#007700";
        this.ctx.beginPath();

        if( transitionDataList1 !== null ) {

            const firstYPosi = baseLine - (transitionDataList1[0] * rate);

            this.ctx.moveTo( xPosi, firstYPosi );

            transitionDataList1.forEach( ( e, index ) => {
                if( index > 0 ) {
                    xPosi += transX;
                    const yPosi = baseLine - (e * rate);
                    this.ctx.lineTo(xPosi, yPosi);
                }
            });

            this.ctx.stroke();
        }
        xPosi = distance;

        // -- monthly under graph --

        this.ctx.strokeStyle = "#BBBBBB";
        this.ctx.fillStyle = "#BBBBBB";

        if( monthlyDataList1 !== null ) {

            monthlyDataList1.forEach( (e) => {
                this.ctx.beginPath();
                this.ctx.moveTo( xPosi - 5, baseLine );
                this.ctx.lineTo( xPosi - 5, e * rate + baseLine );
                this.ctx.lineTo( xPosi + 5, e * rate + baseLine );
                this.ctx.lineTo( xPosi + 5, baseLine );
                this.ctx.closePath();
                this.ctx.stroke();
                this.ctx.fill();

                xPosi += transX;
            });
        }
        xPosi = distance;

        // -- monthly up graph --

        this.ctx.strokeStyle = "#555555";
        this.ctx.fillStyle = "#555555";

        if( monthlyDataList2 !== null ) {

            monthlyDataList2.forEach( (e) => {
                this.ctx.beginPath();
                this.ctx.moveTo( xPosi - 5, baseLine );
                this.ctx.lineTo( xPosi - 5, baseLine - e * rate );
                this.ctx.lineTo( xPosi + 5, baseLine - e * rate);
                this.ctx.lineTo( xPosi + 5, baseLine );
                this.ctx.closePath();
                this.ctx.stroke();
                this.ctx.fill();

                xPosi += transX;
            });
        }
        xPosi = distance;

        // -- profit transition graph --

        this.ctx.strokeStyle = "#FF4F02";

        if( monthlyDataList1 !== null && monthlyDataList2 !== null ) {
            const transit2 = monthlyDataList1.map( ( e, index ) => {
                return monthlyDataList2[index] - e;
            });

            const firstYPosi = baseLine - (transit2[0] * rate);
            this.ctx.beginPath();
            this.ctx.moveTo( xPosi, firstYPosi );

            transit2.forEach( (e, index) => {
                if( index > 0 ) {
                    xPosi += transX;
                    const yPosi = baseLine - (e * rate);
                    this.ctx.lineTo(xPosi, yPosi);
                }
            });

            this.ctx.stroke();
        }
    }

    clearGraph = () => {
        this.ctx.clearRect(0, 0, this.width, this.height );
    }


    setInfoFloatDrawer = ( drawer: ( index: number, mouseX: number ) => void ) => {
        this.infoFloatDrawer = drawer;
    }

    setInfoFloatEraser = ( eraser: () => void ) => {
        this.infoFloatEraser = eraser;
    }

    setGraphCursolXGetter = ( getter: ( mouseX: number ) => void ) => {
        this.graphCursolXGetter = getter;
    }


    getGraphHeight = () : number => {
        return this.height - 20;
    }


    includeRange = ( list: number[], value: number ) : boolean => {
        let isInclude = false;

        list.forEach( ( e ) => {
            if( ((value - 5) < e ) && ((value + 5) > e) ) {
                isInclude = true;
            }
        });

        return isInclude;
    }

    isCursolRange = ( list: number[], value: number ) : { isRange: boolean, x: number } => {
        let result = {
            isRange: false,
            x: 0
        };

        list.forEach( ( e ) => {
            if( ((value - 5) < e ) && ((value + 5) > e) ) {
                result.isRange = true;
                result.x = e;
            }
        });

        return result;
    }
}