import { IFundingRequestItem } from './IFundingRequestItem';

export class ClassFundingRequest{

   public Title:string;
   public RequestId:string;
   public ProjectDesc:string;
   public FundRequested:number;
   public BusinessUnit:string;
   public ProjectOwner:string;
   public Status :string;
   public ID :number;

    constructor(item: IFundingRequestItem){
        this.Title= item.Title;
        this.RequestId = item.RequestId;
        this.ProjectDesc = item.ProjectDesc;
        this.FundRequested = item.FundRequested;
        this.BusinessUnit = item.BusinessUnit;
        this.ProjectOwner = item.ProjectOwner;
        this.Status=item.Status;
        this.ID = item.ID;
    }
}
