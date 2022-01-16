import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


firebase.initializeApp({
  apiKey: "AIzaSyDifGkBVHxcQ_CKvfDwNt2YudhezViwt-Q",
  authDomain: "socialapp-10b8a.firebaseapp.com",
  projectId: "socialapp-10b8a",
  storageBucket: "socialapp-10b8a.appspot.com",
  messagingSenderId: "520886012282",
  appId: "1:520886012282:web:ecf937c68f7559eb022ec3"
})


const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className='App'>
      <header>
        <div className='title'>SocialApp</div>
        <div ><SignOut /></div>
      </header>
      <div className='profile'>
        {user ? <Profile /> : <SignIn />}
      </div>
      <section>
        {user ? <TimeLine /> : <SignIn />}
      </section>
    </div>
  );
}


function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <a className="sign-out" onClick={() => auth.signOut()}>Sign Out</a>
  )
}

function TimeLine() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', 'desc').limit(100);

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      displayName,
      photoURL
    })

    setFormValue('');

  }

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <span ref={dummy}></span>
    </main>

    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="What is on your mind?" />
      <button type="submit" disabled={!formValue}>Send</button>
    </form>
  </>)
}

function ChatMessage(props) {
  const { text, uid, photoURL, displayName, createdAt } = props.message;

  const messageClass = uid == auth.currentUser.uid ? 'sent' : 'received';
  return (<>
    <div className={`message ${messageClass}`}>
      <div className="userInfo"> <img src={photoURL} />
        <h3>{displayName}</h3></div>
      <p> {text} </p>

    </div>
  </>)
}

function Profile() {
  let user = firebase.auth().currentUser;
  var signupDate = new Date(user.metadata.creationTime);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  var month = monthNames[signupDate.getUTCMonth()];
  var year = signupDate.getUTCFullYear();
  var newdate = month + ", " + year;

  return (<>
    <div className='container'>
      <div className='profile'>
        <div className='profile-img'>
          <img src={user.photoURL} />
        </div>
        <div className='profile-name'>
          {user.displayName}
        </div>
        <div className='joined'>
          📅  Joined {newdate}
        </div>
      </div>
    </div>
  </>)
}
export default App;
