import {SPHttpClient,SPHttpClientResponse} from '@microsoft/sp-http';
import { IFundingRequestItem } from "../IFundingRequestItem";

export interface IFactory{
    addItem(requestor:SPHttpClient,siteUrl:string,listName:string,body:string):Promise<IFundingRequestItem>;
}

