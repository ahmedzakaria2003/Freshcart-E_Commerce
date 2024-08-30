import { IshippingAddress } from "./ishipping-address";

export interface Iallorders {
    cartItems:any[];
    isDelivered:boolean;
    isPaid:boolean;
    paymentMethodType:string;
    shippingAddress:IshippingAddress;
    totalOrderPrice:number;
}
