import * as React from 'react';
//import {Router} from 'react-router-dom';
import styles from './GetFundingRequests.module.scss';
import { IViewAllItemsProps } from './IViewAllItemsProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { SPHttpClient, SPHttpClientResponse} from '@microsoft/sp-http';
import { DetailsList, 
  IColumn, 
  buildColumns,
  DetailsListLayoutMode as LayoutMode,
  ConstrainMode,
  CheckboxVisibility } from 'office-ui-fabric-react/lib/DetailsList';
//import { Config } from './Config/Config';
import Paging from './Paging/Paging';
//import { HashRouter, Switch, Route , Link} from 'react-router-dom';
import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import PageNotFound from './PageNotFound';
import Test from './NewFR/CreateNewFundRequest';
//import { IItemProp } from '../CustomPropertyPane/PropertyPaneMultiSelect'; 


export interface IViewAllItemsState {
  items?: any[];
  columns?:IColumn[];
  status?: string;
  currentPage?: number;
  itemCount?: number;
  pageSize?: number;
}
export default class MyRequests extends React.Component<IViewAllItemsProps, IViewAllItemsState> {
  private selectQuery: string[] = [];
  private expandQuery: string[] = [];
  constructor(props: IViewAllItemsProps){
    super(props);    
        
    this.state ={
      items:[],
      columns: this.buildColumns(this.props),
      currentPage:1,
      pageSize: this.props.pageSize
    };
    this._onPageUpdate = this._onPageUpdate.bind(this);
    this.newFundRequestClick = this.newFundRequestClick.bind(this);
    //debugger;
    this.getListItemsCount(`${this.props.siteUrl}/_api/web/lists/GetByTitle('${props.listName}')/ItemCount`);
    const queryParam = this.buildQueryParams(props);
    this.readItems(`${this.props.siteUrl}/_api/web/lists/GetByTitle('${props.listName}')/items${queryParam}`); 
  }

  public componentWillReceiveProps(nextProps: IViewAllItemsProps): void{   
    
    this.setState({
      columns:this.buildColumns(nextProps),
      pageSize: nextProps.pageSize
    });
    //debugger;
    this.getListItemsCount(`${this.props.siteUrl}/_api/web/lists/GetByTitle('${this.props.listName}')/ItemCount`);
      //const selectColumns = nextProps.selectedColumns === null || nextProps.selectedColumns===undefined || nextProps.selectedColumns.length === 0? "" : '?$select='+nextProps.selectedColumns.join();
    const queryParam = this.buildQueryParams(nextProps);
    this.readItems(`${this.props.siteUrl}/_api/web/lists/GetByTitle('${nextProps.listName}')/items${queryParam}`);
  }

  public render(): JSX.Element {

    //const { needsConfiguration, configureWebPart} = this.props;
    let {items, columns, pageSize} = this.state;
    return (
      
      <div className={styles.getFundingRequests}>
         
        <div>
          <div>
            <div>
              <div>
              <p>Site URL : {this.props.siteUrl}</p>
              <p>List Name : {this.props.listName}</p>
                           
              </div>
              <div>
                <button onClick={this.newFundRequestClick} >Start a new funding request</button>
              </div>
              <div>             
                <DetailsList 
                  items = {items}
                  columns = {columns}
                  isHeaderVisible = {true}
                  layoutMode = {LayoutMode.justified}
                  constrainMode ={ConstrainMode.unconstrained}
                  checkboxVisibility={CheckboxVisibility.hidden}
                  onColumnHeaderClick={ this._onColumnClick }
                />
              </div>
              <br/>
             
              <Paging 
                    totalItems={ this.state.itemCount }
                    itemsCountPerPage={ this.state.pageSize } 
                    onPageUpdate={ this._onPageUpdate } 
                    currentPage={ this.state.currentPage }
              />
               <div className={styles.status}>{this.state.status}</div>
              <div></div>
             
             
            </div>
          </div>        
        </div>
      </div>
    );
  }

  private newFundRequestClick(){
    console.log('I am clicked');
  
  }

  //read the items from list
  private readItems(url: string) {
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
      //this.props.Status(`${response.d.__next}`);
      //this.props.siteUrl = response['odata.nextLink'];
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
  private listNotConfigured(props: IViewAllItemsProps): boolean {
    return props.listName === undefined ||
      props.listName === null ||
      props.listName.length === 0;
  }

  private _onPageUpdate(pageNumber: number) {
    //this.readItems()
    this.setState({
      currentPage: pageNumber,
    });
    const p_ID = (pageNumber - 1)*this.props.pageSize;
    const selectColumns = '&$select='+this.selectQuery;
    const expandColumns = '&$expand='+this.expandQuery;
    const queryParam = `%24skiptoken=Paged%3dTRUE%26p_ID=${p_ID}&$top=${this.props.pageSize}`;
    var url = `${this.props.siteUrl}/_api/web/lists/GetByTitle('${this.props.listName}')/items?`+ queryParam + selectColumns+expandColumns;
    this.readItems(url);    
  }

  @autobind
  private _onColumnClick(event: React.MouseEvent<HTMLElement>, column: IColumn) {
    let { items, columns } = this.state;
    let isSortedDescending = column.isSortedDescending;

    // If we've sorted this column, flip it.
    if (column.isSorted) {
      isSortedDescending = !isSortedDescending;
    }

    // Sort the items.
    items = items!.concat([]).sort((a, b) => {
      let firstValue = a[column.fieldName];
      let secondValue = b[column.fieldName];

      if (isSortedDescending) {
        return firstValue > secondValue ? -1 : 1;
      } else {
        return firstValue > secondValue ? 1 : -1;
      }
    });

    // Reset the items and columns to match the state.
    this.setState({
      items: items,
      columns: columns!.map(col => {
        col.isSorted = (col.key === column.key);

        if (col.isSorted) {
          col.isSortedDescending = isSortedDescending;
        }
        return col;
      })
    });
  }

  private buildQueryParams(props: IViewAllItemsProps): string{
    this.selectQuery = [];
    this.expandQuery = [];
   // props.selectedColumns.forEach(element => {      
   //   if(element.text === "Person or Group" || element.text === "Lookup"){
   //     this.selectQuery.push(element.key+"/Title");
   //     this.expandQuery.push(element.key);
   //   }
   //   else{
   //     this.selectQuery.push(element.key);
   //   }
   // });
    const queryParam = `?%24skiptoken=Paged%3dTRUE%26p_ID=1&$top=${props.pageSize}`;
    const selectColumns = this.selectQuery === null || this.selectQuery===undefined || this.selectQuery.length === 0? "" : '&$select='+this.selectQuery.join();
    const expandColumns = this.expandQuery === null || this.expandQuery===undefined || this.expandQuery.length === 0? "" : '&$expand='+this.expandQuery.join();
    return queryParam+selectColumns+expandColumns;
  }

  private buildColumns(props: IViewAllItemsProps): IColumn[]{
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
  /*private buildColumns(props: IViewAllItemsProps): IColumn[]{
    const columns: IColumn[]=[];
    props.selectedColumns.forEach(element => {      
      if(element.text === "Person or Group" || element.text === "Lookup"){        
        const column: IColumn ={
          key: element.key,
          name: element.key.indexOf("_x0020_") !== -1?element.key.replace("_x0020_"," "):element.key,
          fieldName: element.key,
          minWidth: 100,
          maxWidth: 350,
          isResizable: true,
          data: 'string',
          onRender: (item: any) => {
            return (
              <span>
                { item[element.key]["Title"] }
              </span>
            );
          }
        };
        columns.push(column);
      }
      else{        
        const column: IColumn ={
          key: element.key,
          name: element.key.indexOf("_x0020_") !== -1?element.key.replace("_x0020_"," "):element.key,
          fieldName: element.key,
          minWidth: 100,
          maxWidth: 350,
          isResizable: true,
          data: 'string',
          isMultiline: element.text === "Multiple lines of text" ? true:false
        };
        columns.push(column);
      }
    });
    return columns;
  }
}*/

