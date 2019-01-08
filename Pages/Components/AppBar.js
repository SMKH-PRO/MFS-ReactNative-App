import * as React from 'react';
import { Appbar } from 'react-native-paper';
import { Text } from 'react-native';

export default class AppBar extends React.Component {
  

  render() {
    return (

      
      <Appbar.Header        
      >
        <Appbar.Content        style={{ flex: 1 , alignItems: 'center', }}

          title="Mutual File Sharing"
          subtitle="www.MutualFileSharing.com"        />
      </Appbar.Header>
    );
  }
}