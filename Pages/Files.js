import * as React from 'react';
import PullToRefresh from 'react-native-pull-refresh';

import {  View,ActivityIndicator,Text,ScrollView,Image,WebView,TouchableOpacity,Alert} from 'react-native';
import firebase from '../firebase'
import axios from 'axios';

import {Card, Title,IconButton, Colors ,Snackbar,FAB } from 'react-native-paper';

import {  WebBrowser,DocumentPicker } from 'expo';
import _ from 'lodash'

export default class Files extends React.Component {
constructor(){

  super()

this.state={
uploading:false,
  data:[],
  IP:'',
  Error:null,
  isRefreshing:false,
  NoData:false,
  ShowSnackBar:false,
  SnackBarText:''
}



}


componentDidMount(){

this.getIP()
}





getIP=()=>{


  axios({
      
    url: 'https://www.mutualfilesharing.com/ReactSocial/ipinfo.php',
    method:'GET',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    
}).then((res)=>{ 


console.log(res.data.ip)
this.setState({IP:res.data.ip},()=>{


    this.setState({isRefreshing:false},()=>{
setTimeout(()=>{
      
          this.CallFirebase()
},1800)
    })

})
  
}).catch((err)=>{
  this.getIP()

this.setState({Error:err.message,isRefreshing:false})

})
}


CallFirebase=()=>{
  this.setState({Error:null});


	firebase.database().ref(`MFS_files/${this.state.IP.replace(/\./g,'')}`).on('child_added',(daata)=>{
 

    const data = this.state.data

    data.push({key:daata.key,...daata.val()})
 this.setState({data:data,NoData:false})
 console.log("firebase call files")


 
  })


//Check if there are no nodes saved by user!!...
firebase.database().ref(`MFS_files/${this.state.IP.replace(/\./g,'')}`).once('value',(data)=>{

console.log(data.numChildren())
  if(data.numChildren() < 1){
  
    this.setState({loading:false,NoData:true})  
  }
    
  
  })

  this.TrackRemovedFiles()
}


TrackRemovedFiles = () =>{

  //Using Lodash to remove data from my array = https://lodash.com/docs/4.17.11#filter

  firebase.database().ref(`MFS_files/${this.state.IP.replace(/\./g,'')}`).on('child_removed',(daata)=>{

let key = daata.key;
let array = this.state.data
let Filtered = _.filter(array, (data) => { return data.key !== key; });



this.setState({data:Filtered})
     
  })

}





onRefresh() {
  this.setState({isRefreshing: true});
  
  // Simulate fetching data from the server
this.getIP()
}



ConfirmFileDelete = (key,name)=>{


  Alert.alert(
    'Are You Sure?',
    `Delete File " ${name} " ? `,
    [
      {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
      {text: 'Yes', onPress:  ()=>this.Delete(key)},
    ],
    { cancelable: false }
  )
}
ConfirmDeleteAllFiles = ()=>{


  Alert.alert(
    'Are You Sure?',
    "Delete All Files?",
    [
      {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
      {text: 'Yes', onPress:  ()=>this.DeleteAll()},
    ],
    { cancelable: false }
  )
}

DeleteAll =()=>{
  firebase.database().ref(`MFS_files/${this.state.IP.replace(/\./g,'')}`).remove().then(()=>{
    this.setState({ShowSnackBar:true,SnackBarText:'Succesfully Deleted All Files!'})
    
    setTimeout(()=>{
    
    
      this.setState({ShowSnackBar:false,SnackBarText:''})
    
    },3000)
      })

}

Delete=(key)=>{

  

  // console.log(key)
  firebase.database().ref(`MFS_files/${this.state.IP.replace(/\./g,'')}`).child(key).remove().then(()=>{
this.setState({ShowSnackBar:true,SnackBarText:'File Deleted Succesfully!'})

setTimeout(()=>{


  this.setState({ShowSnackBar:false,SnackBarText:''})

},3000)
  })


}



uploadfiles = async ()=>{
  let result = await DocumentPicker.getDocumentAsync({});
  //alert(result.uri);
if(result.type !== 'cancel'){
let uri = result.uri

this.setState({uploading:true})
// console.log(result)

let filesize= result.size / 1024/1024 //Size in MBS
// console.log('selectedfile location: ',result.uri)
// console.log('Pura Object: ',result)

if(filesize <11){
let link =  this.uploadImageAsync(uri,result.name)
link.then((downloadURL)=> {
this.ValidateFileExtension(downloadURL,result.name)

}).catch((err)=>{
  this.setState({uploading:false})
  alert(err.message)})
}
else if(filesize > 10){
  this.setState({uploading:false})

  alert("The Maximum File Size Allowed In App is 10MB, You can upload from our website larger files are allowed their!.")
}




}

}



ValidateFileExtension(url,naam){
  let baseurl = 'https://MutualFileSharing.com'
let name = naam
  let filedisplay = baseurl+"/fileicons/defaultfile.png";

  if(name.slice(-4) == ".png"  || name.slice(-5) == '.jpeg'  || name.slice(-4) == ".gif"  || name.slice(-4) == ".jpg"){
    filedisplay = url
  }
else 
if(name.slice(-3) == ".7z"||name.slice(-4) == ".zip"){
filedisplay = baseurl+"/fileicons/zipfile.png"
console.log("File type is zip")
}
else if(name.slice(-4) == ".mpeg"||name.slice(-4) == ".3gp"||name.slice(-4) == ".flv"||name.slice(-4) == ".wmv"||name.slice(-4) == ".mov"||name.slice(-4) == ".mp4"||name.slice(-4) == ".avi"){
filedisplay = baseurl+"/fileicons/videofile.png"
console.log("File type is video")
}
else if(name.slice(-4) == ".m4a"||name.slice(-4) == ".amr" || name.slice(-4) == ".mp3"||name.slice(-4) == ".ogg"){
filedisplay = baseurl+"/fileicons/audiofile.png"


return alert("We Currently Supporting Only Image and Video Files.! ")

console.log("File type is audio")
}

else{
filedisplay = baseurl+"/fileicons/defaultfile.png";
console.log("uknown file type \n\n",'Format:- ',name.slice(-4) , " FullName: ",name)

return alert("We Currently Supporting Only Image and Video Files.! ")
}


if(name.length > 10){
  name = "..."+name.slice(-9);
  }

 filedata = {FullName:naam,name: name,downloadlink:url,displayimage:filedisplay };
firebase.database().ref(`MFS_files/${this.state.IP.replace(/\./g,'')}`).push(filedata).then(()=>{

  this.setState({uploading:false})

})
}


async  uploadImageAsync(uri,name) {
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.onerror = function(e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  const ref = firebase
    .storage()
    .ref('/MFS_FILES/')
    .child(`${name}`)
  const snapshot = await ref.put(blob);

  // We're done with the blob, close and release it
  blob.close();

  return await snapshot.ref.getDownloadURL();
}


  render() {
const {data,Error,ShowSnackBar,SnackBarText}=this.state

    // console.log('datta: ****NEW****. ',this.state.data)
    return (
      <View style={{height:'100%'}}>

{Error !== null ? ( // If there is a error, display the error and also show Refresh button:- 
        <View style={{flex: 7, backgroundColor: '#F8F4FC'}}>
          <PullToRefresh
            isRefreshing= {this.state.isRefreshing}
            onRefresh= {this.onRefresh.bind(this)}
            animationBackgroundColor = {'#F8F4FC'}
            pullHeight = {200}
            contentView = {
              <ScrollView >
<View style={{backgroundColor:'#ffffff',width:'100%',height:'100%',alignItems:'center'}}>
<Text>{"\n"}Pull Down To Refresh{"\n"}{"\n"}</Text>     
<Text>An Error Has Accured{"\n"}</Text> 

  <Image    
          source={require('./Error.png')}
        />
<Title>{this.state.Error}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}</Title>


</View>
</ScrollView>
            }
            
            onPullAnimationSrc ={require('./Animations/coin_pull.json')}
            onStartRefreshAnimationSrc ={require('./Animations/coin_start.json')}
            onRefreshAnimationSrc = {require('./Animations/coin_repeat.json')}
            onEndRefreshAnimationSrc = {require('./Animations/coin_end.json')}
          />
        </View>
    ):(

//If there is no errors print these:- 
<ScrollView style={{height:'100%'}}>




{this.state.NoData ? (<Title style={{padding:20}}>Your Files Will Appear Here.....</Title>):(<View>
{data == [] ? <ActivityIndicator style={{position:'absolute',left:'50%',top:'50%',zIndex:999}} size="large" color="#0000ff" /> :(


<View style={{justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', flex: 1}}>
{
data.map((data,i)=>{


return (

  

  <Card key={i}  onPress={()=>WebBrowser.openBrowserAsync(data.downloadlink) } style={{width:'60%',maxHeight:220,
  boxShadow:'0px 0px 5px black',margin:5,marginTop:15, borderWidth: 1, borderColor: '#d6d7da'}}>
   
   
   <TouchableOpacity       style={{position:'absolute',zIndex:999,right:5}}
  onPress={() => this.ConfirmFileDelete(data.key,data.name)}
>
    <IconButton
    icon="delete"
style={{borderWidth: 0.5, borderColor: '#d6d7da',filter:'drop-shadow(0px 0px 5px black)'}}
    color={Colors.red500}
    size={30}
  /></TouchableOpacity>
  <Card.Cover style={{maxHeight:180}} source={{ uri: data.displayimage }} />
<Card.Content style={{padding:3,alignSelf:'center'}}>
     <Title>{data.name}</Title> 
  </Card.Content>
</Card>



)

})}
</View>
)}</View>) 
 }
</ScrollView>)

}




   <Snackbar
          visible={ShowSnackBar}
          onDismiss={() => this.setState({ visible: false })} > {SnackBarText}        </Snackbar>


{this.state.data.length >1?( //Agar files 1 se ziada  ho to delete ALL ka button show karwao else nothing

  <TouchableOpacity         style={{ position: 'absolute', margin: 16, right: 0, bottom: 0, }}
   onPress={this.ConfirmDeleteAllFiles}
>
           <FAB
           style={{backgroundColor:'red',color:'white'}}
    icon="delete"
  /></TouchableOpacity>):(null)
}


{ this.state.data == []?(null):(
<TouchableOpacity         style={{ position: 'absolute', margin: 16, right: 0, bottom: 60, }}
>
        <FAB
           onPress={this.uploadfiles}

        disabled={this.state.uploading}
           style={{backgroundColor:'green',color:'white'}}
    icon="add"
  />

</TouchableOpacity> )}
  {this.state.uploading  ? (<View style={{ position: 'absolute', margin: 26, right: 0, bottom: 60,zIndex:999}}><ActivityIndicator  size="large" color="#0000ff" /></View>):null}

      </View>
    )
  
}
}
