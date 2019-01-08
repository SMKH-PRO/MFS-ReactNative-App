import * as React from 'react';
import { TextInput,Button } from 'react-native-paper';
import {  View,Clipboard,Alert,ActivityIndicator} from 'react-native';
import  firebase from  '../firebase'
import axios from 'axios';

export default class Text extends React.Component {
  state = {
    text: '',
IP:null,
    CopyBtnText:'Copy',
    SaveBtnText:'Save',
    loading:true,

    SavePossible:false,
    ClearNCopyPossible:false,
    
  };




   _setContent = async () => {
    await Clipboard.setString(this.state.text);
this.setState({CopyBtnText: 'Copied'})

setTimeout(()=>{

  this.setState({CopyBtnText: 'Copy'})

},1000)
  }
  







componentDidMount(){

  this.getIp()
}


CallFirebase=()=>{
  console.log("firebase call text")


	firebase.database().ref(`MFS/${this.state.IP.replace(/\./g,'')}`).on('child_added',(data)=>{
this.setState({text:data.val()},()=>{

  this.setState({loading:false,SavePossible:false})
  console.log("firebase call text",this.state.loading)


  if(this.state.text.replace(/ |\s|\r?\n|\r/g, '').length >0){ //Count Characters Excluding spaces!...
    this.setState({ClearNCopyPossible:true})
  }else{
    this.setState({ClearNCopyPossible:false})


  }
})

  })




//Check if there are no nodes saved by user!!...
  firebase.database().ref(`MFS/${this.state.IP.replace(/\./g,'')}`).once('value',(data)=>{


if(data.numChildren() < 1){

  this.setState({loading:false})
}
  

})


}


getIp=()=>{

    axios({
      
      url: 'https://www.mutualfilesharing.com/ReactSocial/ipinfo.php',
      method:'GET',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      
  }).then((res)=>{ 
console.log(res.data.ip)
  this.setState({IP:res.data.ip},()=>{

      this.CallFirebase()

  })
}).catch((err)=>{
  this.getIp()


})

}



  ConfirmDelete = ()=>{


    Alert.alert(
      'Are You Sure?',
      'Clear All The Text?',
      [
        {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Yes', onPress:  this.DeleteTextFromFirebase},
      ],
      { cancelable: false }
    )
  }

DeleteTextFromFirebase =()=>{
this.setState({loading:true})



firebase.database().ref(`MFS/${this.state.IP.replace(/\./g,'')}`).push("").then(()=>{

  this.setState({loading:false})


})

}


Save =()=>{

  if(this.state.SaveBtnText == 'Save'){
  this.setState({loading:true})

firebase.database().ref(`MFS/${this.state.IP.replace(/\./g,'')}`).push(this.state.text).then(()=>{

  this.setState({loading:false,SaveBtnText:'Saved'})


})


}

}


 
  render() {
    const {text,CopyBtnText,loading,SavePossible,ClearNCopyPossible,SaveBtnText} = this.state

    return (
      <View>


   
        
  <TextInput
            multiline
disabled={loading}
  style={{height:'100%'}}
        label='Text'
        value={this.state.text}
        onChangeText={text =>{ this.setState({ text },()=>{
          //text me se spaces hata kar length check karo
          if(text.replace(/ |\s|\r?\n|\r/g, '').length > 0){  this.setState({SaveBtnText:'Save',SavePossible:true,ClearNCopyPossible:true})  } //Agar user text likhay to state change karne k baad text ki lenght 1 se ziada hai to savebutton ko display karado else hide
          else{this.setState({SavePossible:false,ClearNCopyPossible:false}) }                     
      
      
      }); }}
      />

    {loading ?<ActivityIndicator style={{position:'absolute',left:'50%',top:'50%'}} size="large" color="#0000ff" /> :(    <View>


 {ClearNCopyPossible? (<Button style={{position:'absolute',left:10,bottom:10,minWidth:104,zIndex:999}} icon="content-copy"  mode="contained" onPress={()=>{if (CopyBtnText == 'Copy') {this._setContent()}}}>{CopyBtnText}</Button>
):null} 

 {ClearNCopyPossible? ( <Button style={{position:'absolute',left:10,bottom:115}} icon="delete-forever" color="#E13814" mode="contained" onPress={this.ConfirmDelete}>Clear</Button>):null} 

 
 
  {SavePossible? (<Button style={{position:'absolute',right:15,bottom:110}} color='#10A60D' icon="save" mode="contained" onPress={this.Save}>{SaveBtnText} </Button>):null}



  </View>
  )}


      </View>)
  }
}
