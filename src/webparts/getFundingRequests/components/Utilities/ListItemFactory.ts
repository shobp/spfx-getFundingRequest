import {SPHttpClient,SPHttpClientResponse} from '@microsoft/sp-http'
import { IFactory } from './IFactory';
import { IFundingRequestItem } from "../IFundingRequestItem";

export class ListItemFactory implements IFactory{

    //Add item to SharePoint list
   public addItem(requestor:SPHttpClient,siteUrl:string,listName:string,body:string):Promise<IFundingRequestItem>
   {
       //debugger;
       try{  
           let url = `${siteUrl}/_api/web/lists/getbytitle('${listName}')/items`;      
            return requestor.post(url,
            SPHttpClient.configurations.v1,
            {
                headers: {  
                    'Accept': 'application/json;odata=nometadata',  
                    'Content-type': 'application/json;odata=nometadata',  
                    'odata-version': ''  
                },
                body:body
            })
            .then((response:SPHttpClientResponse):Promise<IFundingRequestItem> =>{
                return response.json();
            })
            .then((item:IFundingRequestItem):IFundingRequestItem => {
                return item;
            });   

       }catch(error){
        console.log(`Error occured in addItem method in ListFactory.ts. Error message: ${error.message}`);  
        throw error;
       }
   }
}