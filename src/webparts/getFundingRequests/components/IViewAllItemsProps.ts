import { SPHttpClient } from '@microsoft/sp-http';
import { DisplayMode } from '@microsoft/sp-core-library';
import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
//import {IItemProp} from '../CustomPropertyPane/PropertyPaneMultiSelect';

export interface IViewAllItemsProps {
  spHttpClient: SPHttpClient;
  siteUrl: string;
  listName: string;
  
  displayMode: DisplayMode;
  pageSize: number;
}
