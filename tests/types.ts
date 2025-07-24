import * as borsh from "borsh";


export class CounterAccount{
    count: number;

    constructor({count}:{count:number}){
        this.count = count;
    }
}

export const schema = {
    struct:{
        count: 'u32'
    }
};

export const COUNTER_SIZE = borsh.serialize(schema,new CounterAccount({count:0})).length;  

