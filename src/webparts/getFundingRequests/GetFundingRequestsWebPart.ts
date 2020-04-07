import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'GetFundingRequestsWebPartStrings';
import GetFundingRequests from './components/GetFundingRequests';
import { IGetFundingRequestsProps } from './components/IGetFundingRequestsProps';
import { IViewAllItemsProps } from './components/IViewAllItemsProps';

export interface IGetFundingRequestsWebPartProps {
  description: string;
  listName:string;
  siteUrl:string;
}

export default class GetFundingRequestsWebPart extends BaseClientSideWebPart <IViewAllItemsProps> {

  public render(): void {
    const element: React.ReactElement<IViewAllItemsProps> = React.createElement(
      GetFundingRequests,
      {
        spHttpClient: this.context.spHttpClient,
        siteUrl: this.context.pageContext.web.absoluteUrl,
        listName: this.properties.listName,
        //,
        //needsConfiguration: this.needsConfiguration(),
        //configureWebPart: this.configureWebPart,
        displayMode: this.displayMode,        
        pageSize: 2
        
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('listName', {
                  label: strings.ListNameFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
