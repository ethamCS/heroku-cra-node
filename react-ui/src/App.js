import React, { useCallback, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import FileSaver from 'file-saver';
import DefaultButton from './defaultButton';
import {sendServerRequestGET, sendServerRequestPOST, sendServerRequestPUT, getOriginalServerPort} from './rest_api'
import autobind from 'react-autobind';




class App extends React.Component {
  constructor(props){
    super(props)
    autobind(this)
    this.state = {
      admin: false,
      numberTrial : 0,
      totalStolen: 0,
      session: 0,
      sessionID: 0,
      blockID: 0,
      blockNumber: 0,
      blockUser: '',
      value: '',
      pageType: "login",
      attackType: "",
      accountNumber: -1,
      amountToSteal: 0,
      timeLeft: 10,
      time: 0,
      sessionToBlockDiff: 0,
      chanceDetect: 0,
      isDetected: false,
      startTime: new Date(), 
      reactionTime: new Date()
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Attack Methods

  sql_request(){ // Send HTTP GET to mimic SQL Injection that returns the first account
    let requestBody = {
      "requestType": "sql_inject"
    };
    sendServerRequestPUT(requestBody, getOriginalServerPort()).then(
      (res) => {
         //set trial number here
        //console.log(res.data)
        this.setState({
          pageType: "options", 
          attackType: "SQL",
          accountNumber: res.data.account,
          amountToSteal: res.data.balance, 
          //timeLeft: this.state.timeLeft,
          chanceDetect: this.state.chanceDetect + 5,
          reactionTime: new Date() - this.state.startTime,
          startTime: new Date()
        })
      }
    );
  }

  //trial begins 
  xss(){
    let requestBody = {
      "requestType": "xss"
    }
    sendServerRequestGET(requestBody, getOriginalServerPort()).then(
      (res) => {
        //set trial number here
        console.log(res.data)
        this.setState({
          pageType: "options", 
          attackType: "XSS",
          accountNumber: res.data.account,
          amountToSteal: res.data.balance, 
          //timeLeft: this.state.timeLeft,
          chanceDetect: this.state.chanceDetect + 5,
          reactionTime: new Date() - this.state.startTime,
          startTime: new Date()
        })
      }
    );
  }

  // Option Methods
  
  //trial ends here 
  logout(){
    var time1 = new Date()
    var diff = time1 - this.state.time
    let requestBody = {
      "requestType": "logout",
      "attackType": this.state.attackType,
      "account": this.state.accountNumber,
      timeInBlock: diff,
      session: this.state.session,
        sessionID: this.state.sessionID,
        blockID: this.state.blockID,
        blockNumber: this.state.blockNumber,
        blockUser: this.state.blockUser,
        value: this.state.value,
        accountNumber: this.state.accountNumber,
        amountStolen: this.state.amountStolen,
        trialNum: this.state.trialNum,
        reactionTime: new Date() - this.state.startTime,
        startTime: new Date()
    } 
    sendServerRequestPOST(requestBody, getOriginalServerPort()).then(
      (res) => {
        //set trial number here

        console.log("POST RES DATA: ")
        console.log(res.data)
        this.setState({
          pageType : "attack",
          numberTrial : this.state.numberTrial,
          amountStolen: 0,
          reactionTime: new Date() - this.state.startTime,
          startTime: new Date()

        })
        console.log(this.state)
      }
    );
    // Send update to server that we are logging out and go back to first page
    if (this.state.pageType === "zero" || (this.state.timeLeft > 0 && this.state.pageType === "options")){
      this.setState({pageType: "success", numberTrial : this.state.numberTrial+1,   reactionTime: new Date() - this.state.startTime,
      startTime: new Date()})
    }
    else {
      this.setState({
        pageType: "attack",
        attackType: "",
        accountNumber: -1,
        amountStolen: 0,
        amountToSteal: 0,
        timeLeft: 10,
        chanceDetect: 0,
        numberTrial : this.state.numberTrial,
        reactionTime: new Date() - this.state.startTime,
        startTime: new Date()
      })
    }
    console.log(this.state)
  }

  steal(){
    var time1 = new Date()
    var diff = time1 - this.state.time
    var timeTrial = new Date() - this.state.timeinTrial
    let requestBody = {
      "requestType": "steal",
      numberTrial : this.state.numberTrial,
      "attackType": this.state.attackType,
      "account": this.state.accountNumber,
      diffBetween1stTrial: diff,
      timeTrial: timeTrial,
      timeInTrial: new Date(),
      session: this.state.session,
        sessionID: this.state.sessionID,
        blockID: this.state.blockID,
        blockNumber: this.state.blockNumber,
        blockUser: this.state.blockUser,
        value: this.state.value,
        accountNumber: this.state.accountNumber,
        amountStolen: this.state.amountStolen,
        reactionTime: new Date() - this.state.startTime,
        startTime: new Date()
    };
    //console.log(this.state)

    sendServerRequestPUT(requestBody, getOriginalServerPort()).then(
      (res) => {
        console.log(res.data)
        this.setState({
          amountStolen: this.state.amountStolen + res.data.currentAccount.balance,
          accountNumber: res.data.nextAccount.account, 
          timeLeft: this.state.timeLeft - 2,
          chanceDetect: this.state.chanceDetect + 10,
          amountToSteal: res.data.nextAccount.balance,
          numberTrial : this.state.numberTrial+1,
          reactionTime: new Date() - this.state.startTime,
          startTime: new Date()
        
        },
          
          () => {
            console.log(this.state)
            //this.create_trial()
            this.hasTimeExpired()
            this.hasBeenDetected()
            }
        )
      }
    )
  }  
  populate(){
    let requestBody = {
      "requestType": "populate",
      "attackType": this.state.attackType,
      "account": this.state.accountNumber,
      
    }
    sendServerRequestPUT(requestBody, getOriginalServerPort()).then(
      (res) => {
        console.log(res.data)
        this.setState({
          accountNumber: res.data.nextAccount.account,
          timeLeft: this.state.timeLeft - 1,
          amountToSteal: res.data.nextAccount.balance,
          numberTrial : this.state.numberTrial+1
        }, () => {
          console.log(this.state)
          this.hasTimeExpired()
          }
        )
      }
    )
  }

  next(){
    let requestBody = {
      "requestType": "next",
      "attackType": this.state.attackType,
      "account": this.state.accountNumber,
      session: this.state.session,
      sessionID: this.state.sessionID,
      blockID: this.state.blockID,
      blockNumber: this.state.blockNumber,
      blockUser: this.state.blockUser,
      value: this.state.value,
      accountNumber: this.state.accountNumber,
      amountStolen: this.state.amountStolen,
      reactionTime: new Date() - this.state.startTime,
      startTime: new Date()
    }
    sendServerRequestPUT(requestBody, getOriginalServerPort()).then(
      (res) => {
        console.log(res.data)
        this.setState({
          trialNum: res.data.trialNum,
          accountNumber: res.data.nextAccount.account,
          timeLeft: this.state.timeLeft - 1,
          amountToSteal: res.data.nextAccount.balance,
          numberTrial : this.state.numberTrial+1,
          reactionTime: new Date() - this.state.startTime,
          startTime: new Date()
        }, () => {
          console.log(this.state)
          this.hasTimeExpired()
          }
        )
      }
    )
  }

  hasTimeExpired(){
    if(this.state.numberTrial <= 5){
      this.setState({timeLeft: 10})
    }

    if(this.state.numberTrial >= 5){
     
      if (this.state.timeLeft < 0){
        console.log("Attacker was caught")
        this.setState({pageType: "failure", timeLeft: 0})
      }
      else if(this.state.timeLeft === 0){
        console.log("Logout?")
        this.setState({pageType: "zero"})
      }
    }
  }

  hasBeenDetected(){
    if(this.state.numberTrial <= 5){
      this.setState({isDetected: false,
      chanceDetect: 0})
    }
    if(this.state.numberTrial >= 5){
    if (this.state.chanceDetect >= 100){
      this.setState({isDetected: true})
    }
    else {
      this.setState({isDetected: Math.random() < (this.state.chanceDetect / 100)})
    }

    if (this.state.isDetected) {
      console.log("Attacker was caught")
      this.setState({pageType: "failure", chanceDetect: 100})
    }
  }
  }



  // Button render methods

create_block(){
  let requestBody = {
    "requestType": "create_block",
    "value": this.state.value,
    "session": this.state.session,
    "sessionID": this.state.sessionID,
    "time": new Date(),
    "numberTrial:" :0
  }
  sendServerRequestPUT(requestBody, getOriginalServerPort()).then(
    (res) => {
      console.log("RES DATA: ")
      console.log(res.data)
      var time1 = new Date()
      var diff = time1 - this.state.time
      this.setState({
          time : new Date(),
          sessionToBlockDiff: diff,
          blockID:res.data.blockID,
          blockNumber:res.data.blockNumber,
          blockUser: res.data.blockUser ,
          numberTrial: 0,
          reactionTime: new Date() - this.state.startTime,
          startTime: new Date()
        
      })
      console.log(this.state)
   }
 )
}

sql(){
  this.sql_request()
  this.create_block()
}
xssRequest(){
  this.xss()
  this.create_block()

}
  render_attacks(){
    return (
      <>
        <h1 className="pb-2">{"How do you want to attack?"}</h1>
        <div className="grid grid-rows-1 grid-flow-col grid-cols-2 gap-2">
            <DefaultButton onClick={this.sql}>SQL Injection</DefaultButton>
            <DefaultButton onClick={this.xssRequest}>XSS Attack</DefaultButton>
        </div>
      </>
    )
  }
 withdraw(){
  this.steal()
  //this.create_trial()
}
  render_options(disabled){
    return (
      <div className="grid grid-cols-3 gap-2">
        <div className="grid grid-flow-row grid-rows-3 grid-cols-1 gap-2">
          <DefaultButton disabled={disabled} onClick={this.withdraw}>Withdraw</DefaultButton>
          <DefaultButton disabled={disabled} onClick={this.next}>Next</DefaultButton>
          <DefaultButton onClick={this.logout}>Logout</DefaultButton>
        </div>
        <div className="col-span-2">
          <div className="grid grid-flow-row grid-rows-3 grid-cols-1">
            <p className="p-2 text-left text-xl text-white font-medium bg-black rounded-t-xl">{"Account #" + this.state.accountNumber}</p>
            <p className="p-2 text-left text-lg font-medium bg-white">{"Balance:"}</p>
            <p className="p-2 text-right text-2xl font-bold bg-white rounded-b-xl">{"$" + this.state.amountToSteal}</p>
          </div>
        </div>
      </div>
    )
  }

  page_handler(){
    
   if (this.state.pageType === "attack"){
      return this.render_attacks()
    }
    else if (this.state.pageType === "options"){
      return this.render_options(false)
    }
    else if (this.state.pageType === "zero"){
      return this.render_options(true)
    }
    else if (this.state.pageType === "failure"){
      return (
        <div className="p-8 text-center">
          <p className="p-2">You were caught!</p>
          <DefaultButton onClick={() => this.logout()}>Start Over</DefaultButton>
        </div>
      )
    }
    else if (this.state.pageType === "success"){
      return (
        <div className="p-8 text-center">
          <p className="p-2">Congrats! You escaped successfully</p>
          <DefaultButton onClick={() => this.logout()}>Start Over</DefaultButton>
        </div>
      )
    }
  }

  render_title(){
    return (
      <div className="p-2 bg-green-400 text-center text-black rounded-t-xl">
        <h1>Vulnerable Banking App</h1>
      </div>
    )
  }

  render_stats(){
    return (
      <>
        <div className="p-2 bg-red-400 text-center text-black rounded-t-xl">
          <p>Attack Stats</p>
        </div>
        <div className="p-2 bg-gray-300 text-center text-black rounded-b-xl">
          <p>{"Amount Stolen: $" + this.state.amountStolen}</p>
          <p>{"Time Left: " + this.state.timeLeft + " mins"}</p>
          {/* <p>{"Chance of Detection: " + this.state.chanceDetect + "%"}</p> */}
        </div>
      </>
    )
  }

  create_user(){ // Send HTTP GET to mimic SQL Injection that returns the first account
    let requestBody = {
      "requestType": "user",
      "value":this.state.value,
    };
    sendServerRequestPUT(requestBody, getOriginalServerPort()).then(
      (res) => {
        //console.log(res.data.sessionUser)
        console.log(res.data.sessionNumber)
        this.setState({
          session: res.data.sessionNumber,
          sessionID: res.data.sessionID,
          accountNumber: -1,
          amountStolen: 0,
          amountToSteal: 0,
          timeLeft: 10,
          time : new Date(),
          chanceDetect: 0,
          isDetected: false,
          value:res.data.sessionUser,
          //pageType: "instructions"
        
        })
      }
    );
  }

handleChange(event) {
  this.setState({
    value: event.target.value,
    //amountStolen: 0
  });
}


authenticate(){
  let requestBody = {
    "requestType": "authenticate",
    "value": this.state.value
  }
  sendServerRequestPUT(requestBody, getOriginalServerPort()).then(
    (res) => {
      this.setState({
    
       pageType: "consent"})
            
    });

}

handleSubmit(event) {
  alert('A ID was submitted: ' + this.state.value);
  event.preventDefault();
  this.authenticate()
  // const reg1= '7WAux8KNB45EnW8';
  //const reg1= '$2a$10$7uQ9XT7S/jVJJXQ7PH0c7uuH72XaSdETDGt5FEF6vn9EW9D9rUlJK';
}

render_login_form(){
  return (
  <div className="p-16 bg-gray-300 text-black form">
  <form onSubmit={this.handleSubmit}>
    <div className="p-2">Please enter your ID

    </div>
    
    <label>
      ID:
      <input type="text" value={this.state.value} onChange={this.handleChange} />
    </label>
    <input type="submit" value="Submit" />
  </form>
</div>
)
}

render_user_login(){
  return (
     <div className='container mx-auto text-center'>
    <div className="pt-2 container mx-auto text-center">
       {this.render_title()}
   </div>
   <div className="pt-8 bg-green-400 rounded-b-xl " > {this.render_login_form()} </div>

      <div className="pt-3  bg-green-400 container mx-auto rounded-b-xl text-center">
       {this.render_footer()}
   </div>
   </div>
    
      
  )

}
render_instructions(){
  return (
   
    <div className='pt-8 container mx-auto text-center'>
       <div className="pt-8 container mx-auto text-center">
          {this.render_title()}
      </div>
      {/* <div className="pt-14 container mx-auto text-center">
      </div> */}
      <div className="p-2 bg-blue-400 text-center text-black">
        <p>Instructions</p>
      </div>
      <div className="p-2 bg-gray-300 text-black">
        <p className='text-center'>Welcome to our vulnerable banking app! (abstracted version)</p>
        <p className='text-center'>
          As a way to demonstrate our concept for a research platform we developed an abstract version
          of a vulnerable app that hackers would break into and steal money from.
        </p>
        <p>
          Our game is quite simple.
        </p>
        <br></br>
        <p className='text-center'>Your goal is to steal as much money as you can without getting caught, but there are a few rules:</p>
        <br></br>
        <ul className='list-decimal pl-5 text-left'>
          <li>You have 20 "minutes" to achieve your goal</li>
          <li>You must choose your method of attack. An SQL injection will go through each bank account to steal from sequentially, while an XSS attack will pick random bank accounts to steal from</li>
          <li>Each attack will take 3 "minutes" and as well raise your chances of getting caught</li>
          <li>You will then be presented with a bank account and the options: "Withdraw" (stealing), "Next" (skipping) or "Log Out" (escape)</li>
          <li>Stealing will take 2 "minutes" and skipping will take 1 "minute"</li>
          <li>Your chances of getting caught go up for stealing. Your chances remain the same if you skip the account</li>
          <li>Logging out finishes the game. You would want to do this if you feel like you have stolen enough money or feel like your chances of getting caught are too high</li>
          <li>It is random chance you are caught based on your probability displayed in the "Attack Stats" section, and if you run out of time you will also be caught</li>
        </ul>
        <br></br>
        <p className='text-center'>A note about future work:</p>
        <br></br>
        <p className='text-left'>
          In this current stage, this is a static web app. It is not connect to a server or database for demonstration purposes.
          In reality we want to build a functional web application that mimics a real-world banking application but is extremely vulnerable.
          Vulnerable applications exist for white-hat hackers of various expertises to test and review their skills. It would be nice to use these but they are not fitted to our research
          since they don't have a real-life context and are often giving instructions on how to break them. While we may use similar ideas to these vulnerable applications we felt it would be best
          to have something more custom that can work and be flexible for whichever direction our research goes.
        </p>
      </div>
      <div className="p-2 bg-blue-400 text-center text-black">
      <DefaultButton onClick={() => this.setState({pageType: "attack", instructionTime: new Date()-this.state.time})}>Start!</DefaultButton>
      </div>
      {/* <div className="pt-14 bg-gray-300 rounded-b-xl"></div> */}
      {/* <div className="pt-3 bg-green-400 rounded-b-xl " > {this.render_login_form()} </div> */}
      <div className="pt-3  bg-green-400 container mx-auto text-center">
       {this.render_footer()}
   </div>
    </div>
  )

}


render_footer(){
  return (
    <div className='pt-8 bg-green-400 container mx-auto rounded-b-xl text-center'>
      <p>CSU Computer Science</p>
   </div>
  )
}
csv(){ // Send HTTP GET to mimic SQL Injection that returns the first account
    let requestBody = {
      "requestType": "csv"
    };
    sendServerRequestGET(requestBody, getOriginalServerPort()).then(
      (res) => {
        this.saveFile()
        this.setState({
          pageType:"admin",
          indexOfFile:res.data.indexOfFile
        })
      }
    );
  
}

saveFile(){
  FileSaver.saveAs(
   "ahh222.csv",
    "data.csv"
);};
render_admin1(){
  return (
  <>
    <div className="pt-8 container mx-auto text-center">
          {this.render_title()}
        </div>
        
        <div className="p-5 container mx-auto bg-gray-300 text-center">
        <div className="grid grid-rows-1 grid-flow-col grid-cols-1 gap-2">
            <DefaultButton className="cv" onClick={this.csv}>download csv</DefaultButton>
            {/* <a href={require("../components/out.csv")} download='test.csv'>Click to download</a> */}
            {/* <DefaultButton className="cv" onClick={this.saveFile}>
             Download File
              </DefaultButton> */}
      
        </div>
        </div>
        <div className="pt-3  bg-green-400 container mx-auto text-center">
       {this.render_footer()}
   </div>
  </>
  );
}
consent(){
  this.setState({pageType: "instructions"})
}
render_consent(){
  return (
   
    <div className='pt-8 container mx-auto text-center'>
       <div className="pt-8 container mx-auto text-center">
          {this.render_title()}
      </div>
      {/* <div className="pt-14 container mx-auto text-center">
      </div> */}
     
      <div className="p-2 bg-gray-300 text-black">
    

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur id erat et odio tempor vulputate. Integer lobortis nisi ac massa pretium tincidunt. Nulla facilisi. Phasellus nibh augue, placerat eu velit eget, congue accumsan massa. Proin hendrerit velit velit, vehicula mollis felis finibus sit amet. Nulla facilisi. Phasellus sollicitudin, erat quis hendrerit sodales, ipsum nunc maximus turpis, non elementum felis dolor et odio. In sed felis a lorem porttitor blandit. Suspendisse commodo ex vel nulla ultrices efficitur. Sed dolor nibh, porta ac lacinia sit amet, consequat a leo. Praesent venenatis dui eget neque feugiat, et blandit diam porta. Etiam ac dapibus enim, nec finibus magna. Nulla facilisi. Vestibulum eu maximus dolor.

Praesent a neque sapien. In velit orci, luctus a magna sodales, placerat maximus sem. Nam nec dui feugiat, molestie ante eu, rhoncus nisl. Aenean non placerat augue. Vivamus eleifend vulputate leo. Ut fringilla commodo ante, sed egestas nisl semper quis. Donec varius dui augue. Cras congue eu urna vitae imperdiet. Vestibulum sed quam et massa lacinia porttitor ac eget arcu.

Sed pulvinar at nisl convallis lobortis. Pellentesque vitae tortor arcu. Ut nunc leo, tincidunt ac eleifend maximus, finibus volutpat erat. In accumsan ultrices nunc, vel commodo ipsum ullamcorper vel. Vestibulum molestie enim et tellus pellentesque placerat. In massa turpis, dapibus et elementum et, dignissim ac orci. Nunc diam quam, sollicitudin mollis neque eget, suscipit bibendum lacus.

Nunc elementum nisi elit. Praesent tincidunt justo in urna viverra tincidunt. Nulla commodo ligula non massa molestie, non vulputate sapien sodales. Ut quis mi tortor. Sed non tellus est. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Ut eleifend dapibus quam ac imperdiet. Donec eget placerat augue, a gravida velit. Maecenas faucibus auctor diam, ut consequat erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a dolor porta, tempor dui a, viverra turpis. Duis in ultricies odio. Aliquam hendrerit augue lacinia felis aliquet, eget sagittis lacus sagittis.

Vestibulum in finibus eros. Nam id condimentum ex. Fusce non vulputate nisi. Ut cursus dictum orci a pulvinar. Curabitur vitae auctor libero. Sed libero dui, elementum ut augue id, fermentum ultricies nisl. Donec eu leo ac tortor rhoncus cursus sed in nunc. Pellentesque placerat, mauris eget rhoncus dictum, dui elit rutrum elit, in efficitur augue sapien scelerisque eros. Sed at sollicitudin lorem. Phasellus faucibus luctus nibh. Donec vehicula, arcu ut pharetra molestie, velit urna euismod tortor, eu tincidunt orci enim vel nibh. Quisque interdum nulla ligula. Nulla id enim scelerisque, condimentum quam at, rutrum odio. Vestibulum at sapien porttitor, dapibus augue eget, dapibus mauris. Praesent pellentesque, metus non sagittis tempor, nisl neque vestibulum justo, quis commodo arcu sem malesuada mauris. Proin nec magna ligula. 
      </div>
      <div className="p-2 bg-blue-400 text-center text-black">
      <DefaultButton onClick={() => this.consent()}>consent</DefaultButton>
      </div>
      {/* <div className="pt-14 bg-gray-300 rounded-b-xl"></div> */}
      {/* <div className="pt-3 bg-green-400 rounded-b-xl " > {this.render_login_form()} </div> */}
      <div className="pt-3  bg-green-400 container mx-auto text-center">
       {this.render_footer()}
   </div>
    </div>
  )

}
  render(){
    if (this.state.pageType === "login"){
      return this.render_user_login()
    }
    else if (this.state.pageType === "admin"){
      console.log("admin")
      return this.render_admin1()
    }
    else if (this.state.pageType === "consent"){
      console.log("consent")
      return this.render_consent()
    }
    else if (this.state.pageType === "instructions"){
      return this.render_instructions()
    }
    else {return (
      <>
        <div className="pt-8 container mx-auto text-center">
          {this.render_title()}
        </div>
        <div className="p-2 container mx-auto bg-gray-300 rounded-b-xl text-center">
          {this.page_handler()}
        </div>
        <div className="pt-8 container mx-auto text-center">
          {this.render_stats()}
        </div>
      </>
    );
    }
  }
}

export default App;
