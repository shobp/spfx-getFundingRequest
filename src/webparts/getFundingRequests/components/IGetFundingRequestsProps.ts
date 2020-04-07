import { SPHttpClient } from '@microsoft/sp-http';

export interface IGetFundingRequestsProps {
  description: string;
  listName:string;
  spHttpClient: SPHttpClient;
  siteUrl:string,
  pageSize:number
}
