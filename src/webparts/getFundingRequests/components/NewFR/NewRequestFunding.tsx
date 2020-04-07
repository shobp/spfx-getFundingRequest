import * as React from "react";
import * as ReactDOM from "react-dom";
import styles from '../GetFundingRequests.module.scss';
import {IViewAllItemsProps} from '../IViewAllItemsProps';
import { SPHttpClient, SPHttpClientResponse} from '@microsoft/sp-http';
import { IFundingRequestItem } from "../IFundingRequestItem";
import {DatePicker} from 'office-ui-fabric-react/lib/DatePicker';
import {NormalPeoplePicker } from 'office-ui-fabric-react/lib/Pickers';
import {Dropdown, IDropdownOption,DropdownMenuItemType} from 'office-ui-fabric-react/lib/Dropdown';

import { ListItemFactory } from '../Utilities/ListItemFactory';
const listFactory: ListItemFactory= new ListItemFactory();

const _options : IDropdownOption[] = [];


export default class NewRequestFunding extends React.Component<IViewAllItemsProps,any>{

    constructor(props:IViewAllItemsProps){
        super(props);
        this.state={
            projectTitle:"",
            projectDescription:"",
            businessUnitText:"",
            fundRequested:null,
            requestedDate:null,
            businessUnits:[]
        }
       // console.log("Site Url : " , this.props.siteUrl);
        this.onNextClick= this.onNextClick.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);
    }
    handleChange= ({target}) =>
    {   
        this.setState({
            [target.name]:target.value
        });        
    }
    drpChange= ({target}) =>
    {        
        this.setState({
            [target.title]:target.textContent.trim()
        });
        console.log(target.textContent.trim());
    }
    dateChange =(date:Date | null | undefined):void => {
        this.setState({
                requestedDate:date
            });         
    }
    formatDate=(date:Date): string =>{
        
        let dd = date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();      
        return dd;
    }
   

    public componentDidMount(){

        console.log("Component Mounted");


        this.props.spHttpClient.get(`${this.props.siteUrl}/_api/web/lists/getbytitle('${this.props.listName}')/fields?$filter=EntityPropertyName eq 'BU'`,
        SPHttpClient.configurations.v1,
        {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'odata-version': ''
              }
        })
        .then((response:SPHttpClientResponse):Promise<{value : any[]}> =>{
            return response.json();
        })
        .then((response : {value:any[]}):void => {
                        
            response.value[0].Choices.map((choice:any, index:number) =>
                _options.push({
                    key:index,
                    text:choice
                })
                )
            this.setState({                
                businessUnits:_options
            });
        },(error:any):void=>{
            this.setState({
            status: 'Error while fetching data: ' + error,  
            businessUnits: [] 
            });
        });        
    }

    public render(){
        return(
            <div className={styles.container}>
                 <p>Site URL : {this.props.siteUrl} </p> 
                <h1>Project Info</h1>

                
                <div className={styles.row}>
                    <div className={styles.column}>
                        <label className={styles.label}>Project title</label>        
                    </div>
                    <div className={styles.column}>
                        <input type="text" name="projectTitle" onChange={this.handleChange}  ></input>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.column}>
                        <label className={styles.label}>Project Description</label>        
                    </div>
                    <div className={styles.column}>
                        <input type="text" name="projectDescription" onChange={this.handleChange} ></input>
                    </div>
                </div>
                //Number
                <div className={styles.row}>
                    <div className={styles.column}>
                        <label className={styles.label}>Fund Requested</label>        
                    </div>
                    <div className={styles.column}>
                        <input type="text" name="fundRequested" onChange={this.handleChange} ></input>
                    </div>
                </div>
                //Choice
                <div className={styles.row}>
                    <div className={styles.column}>
                        <label className={styles.label}>Business Unit</label>        
                    </div>
                    <div className={styles.column}>
                       <Dropdown title="businessUnitText" placeHolder="Select a option" 
                       
                       onChange={this.drpChange} 
                       options={this.state.businessUnits}/>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.column}>
                        <label className={styles.label}>Justification</label>        
                    </div>
                    <div className={styles.column}>
                        <input type="text" name="businessUnit" onChange={this.handleChange} ></input>
                    </div>
                </div>
                //People picker
                <div className={styles.row}>
                    <div className={styles.column}>
                        <label className={styles.label}>Project Owner</label>        
                    </div>
                    <div className={styles.column}>
                        <input type="text" name="projectOwner" onChange={this.handleChange} ></input>
                    </div>
                </div>
                //Requested Date
                <div className={styles.row}>
                    <div className={styles.column}>
                        <label className={styles.label}>Requested Date</label>        
                    </div>
                    <div className={styles.column}>
                       <DatePicker title="requestedDate" label="Requested date" 
                       allowTextInput={true} onSelectDate={this.dateChange}
                       formatDate={this.formatDate}
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <button onClick={this.onSaveClick} >Save</button>
                    <button onClick={this.onNextClick}>Next</button>
                </div>
                
            </div>
        );   
    }     

    //Add item to list
    private addItemToList():void{
        try{
            const body=this.loadItemBody();
            listFactory.addItem(this.props.spHttpClient,this.props.siteUrl,this.props.listName,body)
            .then((item:IFundingRequestItem)=>{
                if(item.ID !== null){
                    alert("Item created successfully");
                }
                else{
                    alert("Item creation failed!");
                }                
            });

        }catch(error){
            console.log(`Error occured in addItemToList method, error message :${error.message}`);
        }
    }

    /** Load Item Body */  
    private loadItemBody(): string {  
        try {  
            const body: string = JSON.stringify({                
                Title:this.state.projectTitle,
                ProjectDesc:this.state.projectDescription,
                BU:this.state.businessUnitText,
                FR: this.state.fundRequested,
                RequestedDate:this.state.requestedDate                   
            });  
            return body;  

        } catch (error) {  
            console.log(`Error occured in loadActionItemBody method in Process.tsx. Error message: ${error.message}`);  
        }  
    } 
    //https://www.c-sharpcorner.com/blogs/binding-dropdown-values-from-sharepoint-list-choice-column-using-spfx-and-pnpjs
    private onSaveClick():void{
       
        this.addItemToList();
        /*
        this.setState({
            status:'Creating item..',
            items:[],            
        });
        const body: string = JSON.stringify({
            'Title':this.state.projectTitle,
            'ProjectDesc':this.state.projectDescription,
            'BU':this.state.businessUnitText,
            'FR': this.state.fundRequested,
            'RequestedDate':this.state.requestedDate
            
        });
        debugger;
        this.props.spHttpClient.post(`${this.props.siteUrl}/_api/web/lists/getbytitle('${this.props.listName}')/items`,
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
        .then((item:IFundingRequestItem):void => {
            this.setState({
                status:`Item '${item.Title}' (ID: ${item.RequestId}) successfully created`,
                items:[]
            });
        },(error:any):void=>{
            this.setState({
            status: 'Error while creating the item: ' + error,  
            items: [] 
            });
        });    
        */
    }

    private onNextClick(){
    
    }

}

