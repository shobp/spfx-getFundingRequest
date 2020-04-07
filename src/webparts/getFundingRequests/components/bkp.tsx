import * as React from 'react';
import styles from './GetFundingRequests.module.scss';
import styled from 'styled-components';
import { IGetFundingRequestsProps } from './IGetFundingRequestsProps';
import { escape } from '@microsoft/sp-lodash-subset';
import pnp, { Items } from 'sp-pnp-js';
import { ClassFundingRequest } from './ClassFundingRequest';
import {IFundingRequestItem} from './IFundingRequestItem';
import {Fabric} from 'office-ui-fabric-react/lib/Fabric';
import {SPHttpClient,SPHttpClientResponse} from '@microsoft/sp-http'
import {DetailsList, 
  IColumn,
  DetailsListLayoutMode, 
  buildColumns,
  Selection, 
  SelectionMode, 
  ConstrainMode,
  DetailsHeader,
  CheckboxVisibility
} from 'office-ui-fabric-react/lib/DetailsList'

import { Pagination } from 'react-js-pagination'
import Paging from './Paging/Paging'

const columnStyle ="ms-Grid-col ms-sm6 ms-md2 ms-lg2";


const StyledDetailsHeader = styled(DetailsHeader)`
&&.detailsHeaderRoot {
    background-color:red;
  
  }
`;

export default class GetFundingRequests extends React.Component<IGetFundingRequestsProps, any> {

  constructor (props:IGetFundingRequestsProps){
    super(props);
    this.state={
      status:'Ready',
      items:[],
      columns:this.buildColumns(this.props),
      currentPage :1,      
      itemsCount:null
      //siteUrl:this.context.pageContext.web.absoluteUrl
    }
    this.onRederDetailsheader = this.onRederDetailsheader.bind(this);
    this._onPageUpdate = this._onPageUpdate.bind(this);
    this.getListItemsCount(`${this.props.siteUrl}/_api/web/lists/GetByTitle('${this.props.listName}')/ItemCount`);
  }

  public componentWillReceiveProps(nextProps:IGetFundingRequestsProps):void{
    this.setState({
      columns:this.buildColumns(nextProps),
      pageSize:2
    })
    //this._getListItemsCount();
    this.getListItemsCount(`${this.props.siteUrl}/_api/web/lists/GetByTitle('${this.props.listName}')/ItemCount`);
    const queryParam = `?%24skiptoken=Paged%3dTRUE%26p_ID=1&$top=${this.state.pageSize}`;
    this._getFundingRequestDataPaged(queryParam);
  }


  public render(): React.ReactElement<IGetFundingRequestsProps> {
    
    let {items, columns, pageSize} = this.state;

    return (
      <div className={ styles.getFundingRequests }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Welcome to Funding Request Page!</span>                                    
             <div>
             <p className={ styles.description }>My Requests</p>
                  <button className={styles.button} >Start a new funding request</button>
                  <br/>
             </div>
             <br/>                                     
              <DetailsList
                items = { this.state.items }
                columns={ columns }
                isHeaderVisible={true}                
                layoutMode={DetailsListLayoutMode.justified}
                constrainMode={ConstrainMode.unconstrained}
                onRenderDetailsHeader={this.onRederDetailsheader}
                checkboxVisibility={CheckboxVisibility.hidden}

              />
              <br/>

             <Paging 
             totalItems={this.state.itemsCount}
             itemsCountPerPage ={this.props.pageSize}
             onPageUpdate={this._onPageUpdate}
             currentPage={this.state.currentPage}

             />
              <div>
                  <br/>            
                  <span>{this.state.status}</span>
              </div>     
              <div>
                 
              </div>                  
           
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  private _onPageUpdate(pageNumber: number)
  {
    //this.readItems()
        this.setState({
          currentPage: pageNumber,
        });
      const p_ID = (pageNumber - 1)*this.state.pageSize;
      //const selectColumns = '&$select='+this.selectQuery;
      //const expandColumns = '&$expand='+this.expandQuery;
      const queryParam = `%24skiptoken=Paged%3dTRUE%26p_ID=${p_ID}&$top=${this.state.pageSize}`;
      var url = `${this.props.siteUrl}/_api/web/lists/GetByTitle('${this.props.listName}')/items?`+ queryParam ;
      //+ selectColumns+expandColumns;
      this.readItems(url);
  }


  private onRederDetailsheader( props) 
  {
    return(
      <StyledDetailsHeader
      {...props}      
        // styles= {{root: {background: 'red'}}
        styles={{ root: "detailsHeaderRoot" }}        
    />
    );    
  }

  public componentDidMount(){    
    //this._getFundingRequestData();
    //this._getFundingRequestDataPaged("");

  //this._getListItemsCount();
 // this.getListItemsCount(`${this.props.siteUrl}/_api/web/lists/GetByTitle('${this.props.listName}')/ItemCount`);
  //this.readItems(this.props.siteUrl)
  //console.log('Items count items : ' , this.state.itemsCount);
  }

  //Read items using Restapi
  private readItems(url: string) {

    console.log("site url : " + url);
    this.setState({
      items: [],
      status: 'Loading all items...'
    });
    
    this.props.spHttpClient.get(url,
    SPHttpClient.configurations.v1,
    {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'odata-version': ''
      }
    }).then((response: SPHttpClientResponse): Promise<{value: any[]}> =>{
    return response.json();
    }).then((response: {value: any[]}): void => {     
     
      console.log(response.value);
      this.setState({
        items: response.value,
        //columns: _buildColumns(response.value),
        status: `Showing items ${(this.state.currentPage - 1)*this.props.pageSize +1} - ${(this.state.currentPage -1) * this.props.pageSize + response.value.length} of ${this.state.itemCount}`
      });      
    }, (error: any): void => {
      this.setState({
        items: [],
        status: 'Loading all items failed with error: ' + error
      });
    });
    
  }
  
  //Get total number of items

  private getListItemsCount(url: string) {
    this.props.spHttpClient.get(url,SPHttpClient.configurations.v1,
    {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'odata-version':''
      }
    }).then((response: SPHttpClientResponse): Promise<{value: number}> =>{
      return response.json();
    }).then((response: {value: number}): void => {
      this.setState({
        itemCount: response.value
      });
    });
  }

  private _getListItemsCount():void{
    pnp.sp.web.lists.getByTitle(`Funding Requests`).items.getAll().then(
      (response)=>
      {
        console.log('Total items : ' , response.length);
         this.setState({        
          itemsCount:response.length
         });
      });
    console.log('Items count items : ' , this.state.itemsCount);
  //  console.log('Total items : ' , this.state.itemsCount);
  }
  private _getFundingRequestDataPaged(queryParam:string):void
  {    
    pnp.sp.web.lists.getByTitle(`Funding Requests`).items.top(this.state.pageSize).getPaged().then
    ( page =>{
      if(page){
        this.setState({
          items: page.results,
          status:'Showing list Items..'
        })        
      }                        
      }
    ).catch((e:Error)=>{
      this.setState({
        status:`Error: ${e.message}`
      })
    })
  }

  private _getFundingRequestData():void
  {
    console.log(this.props.listName);
    pnp.sp.web.lists.getByTitle(`Funding Requests`).items.get().then
    (      
      (response)=>{
        console.log('Response : ',  response);       
        let fundingRequestCollection = response.map(item =>new ClassFundingRequest(item));        
        console.log(fundingRequestCollection[0]);
        this.setState({
          status:'Showing list Items..',
          items:fundingRequestCollection
        });
      }
    ).catch((e:Error)=>{
      this.setState({
        status:`Error: ${e.message}`
      });
    });
  }

  private buildColumns(props: IGetFundingRequestsProps): IColumn[]{
    const columns: IColumn[]=[];
    const column1: IColumn ={
      key: 'Title',
      name:'Title',
      fieldName:'Title',
      data: 'string',
      minWidth: 100
    }

    columns.push(column1);

    const column2: IColumn ={
      key: 'RequestId',
      name:'RequestId',
      fieldName:'RequestId',
      data: 'string',
      minWidth: 100
    }

    columns.push(column2);

    const column3: IColumn ={
      key: 'ProjectDesc',
      name:'ProjectDesc',
      fieldName:'ProjectDesc',
      data: 'string',
      minWidth: 100
    }
    columns.push(column3);
          
    return columns;
  }

}
//https://www.youtube.com/watch?v=Pnt4wbQZmw4
//LuArn5Ixaj/u
/* <div className ="ms-Grid">
                <div className="ms-Grid-row ms-bgColor-themeDark">
                  <div className ={columnStyle}>RequestId</div>
                  <div className ={columnStyle}>Description</div>
                  <div className ={columnStyle}>Status</div>
                  <div className ={columnStyle}>RequestedDate</div>                 
                </div>
                {                                    
                    this.state.items.map(function(item:IFundingRequestItem){                  
                    return(                     
                      <div className="ms-Grid-row">
                        <div className ={columnStyle}>{item.Title}</div>
                        <div className ={columnStyle}>{item.PD}</div>                                                                                                               
                      </div>
                   )
                 })
               }
              </div>

              */