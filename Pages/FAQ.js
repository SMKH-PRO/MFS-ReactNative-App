import * as React from 'react';
import {  ScrollView,View ,Linking,Alert,Button as RButton} from 'react-native';

import {  Modal,Text, Portal,Title,Button,TextInput,Card, IconButton} from 'react-native-paper';
import axios from 'axios'
import firebase from '../firebase'
import _ from 'lodash'


export default class FAQ extends React.Component {
  state = {
    M1: false,
    M2:false,
    inshort:'',
    Explained:'',
    IP:'',
ReadMoreData:'',
data:[],

  };
componentDidMount(){

  this.getIP()
}
  _showModal = (ModalNumber) => { console.log(this.state.ReadMoreData.AmIVoter); this.setState({ [ModalNumber]: true }); }
  _hideModal = (ModalNumber) => this.setState({ [ModalNumber]: false });

Vote=(key)=>{

  firebase.database().ref(`MFS_REQUEST/${key}/Votes`).once('value',(voters)=>{

if(voters.hasChild(this.state.IP.replace(/\./g,''))){
  Alert.alert('Opps.!','You already voted this feature!')
}
else{
  firebase.database().ref(`MFS_REQUEST/${key}/Votes/${this.state.IP.replace(/\./g,'')}`).set(true).then(()=>{

    Alert.alert('Success!',"Thank You For Voting :) . ")


    let ReadMoreData = Object.assign({}, this.state.ReadMoreData);    //creating copy of object
    ReadMoreData.AmIVoter = true;              
    ReadMoreData.Votes = this.state.ReadMoreData.Votes+1;              

this.setState({ReadMoreData});
  })


}

  })


}

RemoveVoteConfirmation=(key)=>{




  Alert.alert(
    'Friendly Confirmation',
    'Do you want to remove your vote for this feature?',
    [
      {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
      {text: 'Yes', onPress:  ()=>this.RemoveVote(key) },
    ],
    { cancelable: false }
  )



}

RemoveVote=(key)=>{

  firebase.database().ref(`MFS_REQUEST/${key}/Votes`).once('value',(voters)=>{

if(voters.hasChild(this.state.IP.replace(/\./g,''))){
  firebase.database().ref(`MFS_REQUEST/${key}/Votes/${this.state.IP.replace(/\./g,'')}`).remove().then(()=>{

    Alert.alert('Successfully!',"Removed Your Vote For This Feature. ")


    let ReadMoreData = Object.assign({}, this.state.ReadMoreData);    //creating copy of object
    ReadMoreData.AmIVoter = false;              
    ReadMoreData.Votes = this.state.ReadMoreData.Votes-1;              

this.setState({ReadMoreData});
  })

}
else{

Alert.alert('Opps.!','You already Un-Voted this feature!.')
}

  })


}

CallFirebase=()=>{

  firebase.database().ref(`MFS_REQUEST/`).orderByChild("AdminApproval").equalTo("Approved").on('child_added',(daata)=>{
    const data = this.state.data

    firebase.database().ref(`MFS_REQUEST/${daata.key}/Votes`).once('value',(votedata)=>{

   
       data.push({AmIVoter:votedata.hasChild(this.state.IP.replace(/\./g,'')),TotalVotes:votedata.numChildren(),key:daata.key,...daata.val()})
 this.setState({data:data})
 console.log("firebase call get requested features")
    })
     

  })
}

getIP=()=>{


  axios({
      
    url: 'https://www.mutualfilesharing.com/ReactSocial/ipinfo.php',
    method:'GET',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    
}).then((res)=>{ 

  this.CallFirebase()

console.log(res.data.ip)
this.setState({IP:res.data.ip})
  
}).catch((err)=>{
  this.getIP()


})
}

  SendRequest=()=>{
  const {inshort,Explained} = this.state
    //First check if user's IP address is not in blocklist
    firebase.database().ref(`MFS_BLOCKLIST`).once('value',(data)=>{


      if(data.hasChild(this.state.IP.replace(/\./g,''))){
        this.setState({M1:false})


Alert.alert(
  'Couldnt Send Request',
  'You have already exceeded the  "Request A Feature" submission limit..!',
)
      }

      else{


        if(inshort.replace(/ |\s|\r?\n|\r/g, '').length > 10 && Explained.replace(/ |\s|\r?\n|\r/g, '').length > 20){

this.SubmitRequest()

        }

        else if(inshort.replace(/ |\s|\r?\n|\r/g, '').length < 10){
          Alert.alert(
            'Error!',
            'Short description of your request must be atleast 10 alphabets longer',
          )
          
        }
        else if(Explained.replace(/ |\s|\r?\n|\r/g, '').length < 20){

          Alert.alert(
            'Error',
            'Explained description of your request must be atleast 30 alphabets longer',
          )
        }
        else{
          alert("Else")
        }

      }
    })
  }



  SubmitRequest=()=>{
let today = new Date();
    firebase.database().ref(`MFS_REQUEST/`).push({
      IP:this.state.IP.replace(/\./g,''),
      Time:(new Date()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), //Current Time with only minutes and hours
     Date:today.getDate()+"/"+(today.getMonth()+1)+"/"+today.getFullYear(),
     InShort: this.state.inshort.toUpperCase(),
     Description: this.state.Explained,
     AdminApproval:'Pending',
     Status: 'None',
      
       }).then(()=>{
        Alert.alert('Succefully Submitted!','Your Request Has Been Sent, Once admin approve your request you will be able to view this request at the bottom of "FAQ" section in our app. ',)
        this.setState({M1:false,inshort:'',Explained:''})
       }).catch((err)=>{

        Alert.alert(
          err.code,
         err.message
        )
       })
  }
  render() {

    const {M1,M2,inshort,Explained,data,ReadMoreData}=this.state
console.log("********************>> \n",data)
    return (
      <View style={{padding:10}}>
      <ScrollView>
                <Title>Purpose Of Saving Text App?</Title>
                <Text>There can many cases where you have copied text from one device but have to paste text on other devices, {"\n"} For Example: Consider you have copied some text from whatsapp or other app, how will you paste that text on anyother device such as computer?, Its easy with MFS just paste the text in MFS and save it then you can copy the text from any device that is connected to the same internet or has the same ip address!.{"\n"}
   <Title>HOW IT WORKS?</Title></Text>
                <Text>
                  1. Open Our App Or Website (https://MutualFileSharing.com){"\n"}{"\n"}
                  2. Save your text or upload files...{"\n"}{"\n"}
                  3. Now the text you saved or the files you uploaded are  saved on our servers and will be accessible to all your devices that are on the same internet or same ip address..!!{"\n"}{"\n"}
                  4. Now you can open our app or website from any of your devices and can access your files that you uploaded!..{"\n"}{"\n"}
                  5. The only condition that should match is "Your devices must be connected with same internet and must not use any VPN because we match internet connection using your ip address."{"\n"}{"\n"}
                </Text>
           


                
                <Title>Upcoming Features in Future Updates</Title>
                <Text>
                  1. Chat Between devices on the same internet (Family chat){"\n"}{"\n"}
                  2. Allow multiple files to be uploaded together {"\n"}{"\n"}
                  3. Allow Users To Upload Larger File Size {"\n"}{"\n"}

                </Text>

               
{this.state.IP !==''? (<Button mode="contained" onPress={()=>this._showModal('M1')
}> Request A Feature! </Button>):null
               }
<Text>{"\n"}{"\n"}</Text>
{data !==[]?(<View>
<Title>Requested Features: </Title>
<Text>The features below have been requested by the users.{"\n"} Some Features Are Under-Review Some Are In-Progress That means we are working on those features and they will be available in the app in future updates.{"\n"}{"\n"}</Text>
  

{
  data.map((data,i)=>{
let DataOBJ ={AmIVoter:data.AmIVoter,Votes:data.TotalVotes,Key:data.key,Description:data.Description,Date:data.Date,InShort:data.InShort,Status:data.Status}
    return(
 <Card key={i} style={{position:'relative',color: '#fff', backgroundColor:'rgb(49, 49, 49)', elevation: 1,margin:3}}>
 <Card.Content>
        <Title style={{color:'white'}}>{data.InShort} {"\n"}</Title>
      
        <Button mode="contained" color={data.Status == "In-Progress"? "#43a047":data.Status == "Under-Review"? "#2196f3":"#555555"} onPress={()=>this.setState({ReadMoreData:DataOBJ},()=>{this._showModal('M2')})} style={{color:'dodgerblue'}}>Read More...</Button>

<Text >{"\n"}</Text>
<Text style={{color:'white'}}>{data.Date}</Text>
       {data.Status == "Under-Review"? <Button mode="text" color="red" style={{fontWeight:'700',padding:10,position:'absolute',right:0,bottom:0}}>Under-Review</Button>:null}
       {data.Status == "In-Progress"? <Button mode="text" color="#2196f3" style={{fontWeight:'700',padding:10,position:'absolute',right:0,bottom:0}}>In-Progress</Button>:null}

        </Card.Content>
        </Card>)
  })

}
 </View>):null}
</ScrollView>


   <Modal  visible={M2} onDismiss={()=>this._hideModal('M2')}>
        <View style={{backgroundColor:'white',height:'100%',padding:10,paddingTop:30}}>
        <IconButton
    icon="highlight-off"
    color='red'
    size={30}
    style={{top:0,position:'absolute',right:0}}
    
    onPress={()=>this._hideModal('M2')}
  />


{ReadMoreData !== '' ? (<View>
  
 <Title >{"\n"}{ReadMoreData.InShort}</Title>
<Text>{ReadMoreData.Description}</Text>  
<Text>{"\n\n"}Posted On: {ReadMoreData.Date}</Text>

      {ReadMoreData.Status == "Under-Review"? <Button mode="text" color="red" style={{fontWeight:'700',padding:10,bottom:0}}>Under-Review</Button>:null}
       {ReadMoreData.Status == "In-Progress"? <Button mode="text" color="#2196f3" style={{fontWeight:'700',padding:10,bottom:0}}>In-Progress</Button>:null}

{ReadMoreData.AmIVoter?(
<Button icon="thumb-up" mode="contained" onPress={() => this.RemoveVoteConfirmation(ReadMoreData.Key)} >
{ReadMoreData.Votes} {ReadMoreData.Votes>1?"USERS":"USER"} Voted UP  </Button>):(

<Button icon="thumb-up" mode="contained" onPress={() => this.Vote(ReadMoreData.Key)}>
I WANT THIS FEATURE TOO ({ReadMoreData.Votes})  </Button>)}





</View>):null
}

        </View></Modal>


        <Modal  visible={M1} onDismiss={()=>this._hideModal('M1')}>
           <IconButton
    icon="highlight-off"
    color='red'
    size={30}
    style={{top:0,position:'absolute',right:0}}
    
    onPress={()=>this._hideModal('M1')}
  />
        <View style={{backgroundColor:'white',height:'100%',padding:10,paddingTop:40}}>

        <TextInput
        style={{margin:10}}
        label='Explain Feature in 50 Characters!..'
        value={this.state.inshort}
        mode="outlined"
        onChangeText={inshort => this.setState({ inshort })}
        maxLength = {40}

      />
        
        <TextInput
                style={{margin:10,minHeight:200}}

        multiline
        label='Explain Your Feature In Details!..'
        value={this.state.Explained}
        mode="flat"
        onChangeText={Explained => this.setState({ Explained })}
        

      />

         <Button mode="contained" style={{backgroundColor:'#43a047',color:'white'}} onPress={this.SendRequest
}> Submit Request </Button>

        </View>
        </Modal>
      </View>
    )
  }
}
