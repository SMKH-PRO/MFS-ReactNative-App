import * as React from 'react';
import texts from './Text'
import files from './Files'

import faq from './FAQ'
import { BottomNavigation, Text   } from 'react-native-paper';

// const files = () => <Text>Filelll</Text>;



export default class MyComponent extends React.Component {
  state = {
    index: 0,
    routes: [
      { key: 'text', title: 'Text', icon: 'text-fields' },
      { key: 'file', title: 'Files', icon: 'attach-file' },
      { key: 'faq', title: 'F.A.Q', icon: 'help-outline' },
    ],
  };

  _handleIndexChange = index => this.setState({ index });

  _renderScene = BottomNavigation.SceneMap({
    text: texts,
    file: files,
    faq: faq,
  });


  render() {
    return (
 
         
         <BottomNavigation
        navigationState={this.state}
        onIndexChange={this._handleIndexChange}
        renderScene={this._renderScene}
      />
    );
  }
}
