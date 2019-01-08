import * as React from 'react';

import {View,Linking} from 'react-native'

import {FileSystem,Permissions} from 'expo'


import {Card, Title } from 'react-native-paper';

import {  WebBrowser } from 'expo';

export default class Cards extends React.Component {

    constructor(props){

        super(props)

        
    }

  render() {

    const {data}= this.props

    console.log("card " ,data)
    return (
   
<View  style={{margin:10}} >



  <Card   onPress={ WebBrowser.openBrowserAsync(data.downloadlink) } style={{maxHeight:220,boxShadow:'0px 0px 5px black'}}>
  
    <Card.Cover style={{maxHeight:180}} source={{ uri: data.displayimage }} />
 <Card.Content style={{padding:5}}>
       <Title>{data.name}</Title> 
    </Card.Content>
  </Card>
</View>

    )
  }
}
 