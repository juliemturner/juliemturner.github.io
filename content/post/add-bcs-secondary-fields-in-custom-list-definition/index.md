---
title: Add BCS Secondary Fields to a custom list definition
date: Thu, 12 May 2011 19:15:37 +0000
draft: false
tags:
  - SharePoint
  - Server 2010
  - BCS
  - C#
aliases: ["/2011/05/add-bcs-secondary-fields-in-custom-list-definition/"]
---

When working with BCS data and creating an external data column in a list or library it is often desirable to show some or all of the secondary fields. In the SharePoint UI, this is a simple task, completed by checking off the fields to capture for viewing, searching, filtering, and sorting later. 

{{< figure src="BCSSecondaryFields1.gif" alt="BCSSecondaryFields1">}}

However, when you're building your list or library using a custom list definition schema.xml file this is not as simple. After struggling a bit trying to code the XML myself, it dawned on me that I could mock up the field using the UI and then extract the properly formated field tags by getting the schemaxml property of the list. 

{{< figure src="BCSSecondaryFields2.gif" alt="BCSSecondaryFields2">}}

There are various ways to do this but I've found the simplest way it to use a tool like [SharePoint Manager](https://spm.codeplex.com/ "SharePoint Manager 2010")

1. Browse to the list/library definition using SharePoint Manager
2. Copy and paste the SchemaXML property into a text file
3. Save the text file with an XML extention
4. Open the XML file in Visual Studio (or some other XML editor). If using Visual Studio, select "Format Document" from the Edit/Advanced menu (Ctrl+E, D)
5. Scroll down to find the external data field you created through the UI. You're looking for a `<Field>` tag with the Type attribute equal to "BusinessData" The next `<Field>` tag with Type="Note" will be the hidden field that stores the key value for the selected value. All the additional `<Field>` tags that follow will be the secondary fields you selected in the UI.

{{< figure src="BCSSecondaryFields3.gif" alt="BCSSecondaryFields3">}}

If you copy and paste those Field tags into your list definition schema file and remove the "SourceID" attribute, the list definition will generate a list with the appropriately defined external data column including the secondary fields. To dig a little deeper note that you could potentially do this by hand. Creating the field tags for the hidden primary key field and the additional secondary fields isn't all that difficult. Where this all gets tricky is trying to figure out how to format the SecondaryFieldBdcNames, SecondaryFieldWssNames, SecondaryFieldsWssStaticNames attributes of the primary "BusinessData" field tag. Below is our example field tag for the primary business data field.

```html
<Field Type="BusinessData" DisplayName="Order" Required="FALSE" ID="{5a261e1a-e157-436c-83a2-fda125d72266}"
    StaticName="Order0" BaseRenderingType="Text" Name="Order0" ColName="nvarchar3" RowOrdinal="0"
    Version="6" Group="" SystemInstance="MSSExternal" EntityNamespace="https://sharepoint/bidemo"
    EntityName="Order" BdcField="OrderNumber" Profile="/\_layouts/ActionRedirect.aspx?EntityNamespace=http%3A%2F%2Fjturner%2Dsrv08r2%2Fbidemo&amp;EntityName=Order&amp;LOBSystemInstanceName=MSSExternal&amp;ItemID="
    HasActions="True"
    SecondaryFieldBdcNames="15%2014%2015%208%20CustomerRegion%20CustomerState%20CustomerTarget%20Product%2011"
    RelatedField="Order\_ID"
    SecondaryFieldWssNames= "33%2033%2033%2027%20Order%5Fx003a%5F%5Fx0020%5FCustomerRegio%20Order%5Fx003a%5F%5Fx0020%5FCustomerState%20Order%5Fx003a%5F%5Fx0020%5FCustomerTarge%20Order%5Fx003a%5F%5Fx0020%5FProduct%2012"
    RelatedFieldBDCField=""
    RelatedFieldWssStaticName="Order\_ID"
    SecondaryFieldsWssStaticNames="33%2033%2033%2027%20Order%5Fx003a%5F%5Fx0020%5FCustomerRegio%20Order%5Fx003a%5F%5Fx0020%5FCustomerState%20Order%5Fx003a%5F%5Fx0020%5FCustomerTarge%20Order%5Fx003a%5F%5Fx0020%5FProduct%2012"
    AddFieldOption="AddToDefaultContentType, AddFieldToDefaultView"/>
```

If you take the value of SecondaryFieldBdcNames attribute for instance and decode it you get: 15 14 15 8 CustomerRegion CustomerState CustomerTarget Product 11 The text _CustomerRegion_, _CustomerState_, etc all make sense, they are the root BDC field names. However the numbers that proceed and follow the field names allude me completely. Regardless, I hope this workaround helps anyone out there who too was struggling to define secondary fields in a custom list definition.
