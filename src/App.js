import { useState, useEffect } from 'react'
import './App.css';
import Post from './Post';
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import { db, auth } from './firebase.js'
import { Button, Input } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert';
import ImageUpload from './ImageUpload';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));


function App() {
  const classes = useStyles()
  const [modalStyle] = useState(getModalStyle);
  const [posts, setPosts] = useState([])
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [user, setUser] = useState(null)
  const [openSignIn, setOpenSignIn] = useState(false)
  const [error, setError] = useState(null)
  const [postOpen, setPostOpen] = useState(false)

  useEffect(() => {
    //listens for any change in auth(logging in or out)
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        //user has logged in
        console.log(authUser)
        setUser(authUser);

        if (authUser.displayName) {
          //dont update username
        } else {
          //if we just created someone... 
          return authUser.updateProfile({
            displayName: username
          })
        }
      } else {
        //user has logged out
        setUser(null)
      }
    })

    return () => {
      //if useEffect runs again, perform some cleanup actions before refiring
      unsubscribe();
    }
  }, [user, username])


  useEffect(() => {
    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      // every time a new post is added, this code is fired off
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        post: doc.data()
      })))
    })
  }, [])

  const signUp = (e) => {
    e.preventDefault()
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username
        })
      })
      .then(setError(''))
      .catch(error => { setError(error.message) })

    error === '' && setOpen(false)
  }

  const signIn = (e) => {
    e.preventDefault()
    auth
      .signInWithEmailAndPassword(email, password)
      .then(setError(''))
      .catch(e => setError(e.message))
    error === '' && setOpenSignIn(false)
  }

  return (
    <>
      <div className='app'>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
        >
          <div style={modalStyle} className={classes.paper}>
            <form className='app__signup' onSubmit={signUp}>
              <center>
                <img src='https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png' alt="Instagram" height='150px' className="app__headerImage" />
                {error && <Alert severity='error' style={{ margin: '10px 0 20px 0' }} onClose={() => { setError('') }}>{error}</Alert>}
                <Input
                  placeholder='username'
                  style={{ width: '100%' }}
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  placeholder='email'
                  style={{ width: '100%' }}
                  type='text'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder='password'
                  style={{ width: '100%' }}
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button style={{ width: '100%' }} type="submit">Sign Up</Button>
              </center>
            </form>

          </div>
        </Modal>
        <Modal
          open={openSignIn}
          onClose={() => setOpenSignIn(false)}
        >
          <div style={modalStyle} className={classes.paper}>
            <form className='app__signup' onSubmit={signIn}>
              <center>
                <img src='https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png' alt="Instagram" height='150px' className="app__headerImage" />
                {error && <Alert severity='error' style={{ margin: '10px 0 20px 0' }} onClose={() => { setError('') }}>{error}</Alert>}
                <Input
                  placeholder='email'
                  style={{ width: '100%' }}
                  type='text'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder='password'
                  style={{ width: '100%' }}
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" style={{ width: '100%' }}>Sign In</Button>
              </center>
            </form>

          </div>
        </Modal>
        <Modal
          open={postOpen}
          onClose={() => setPostOpen(false)}
        >
          <div style={modalStyle} className={classes.paper}>
            {user?.displayName ? (
              <ImageUpload setPostOpen={setPostOpen} username={user.displayName} />
            ) : (
              <h3>Login to upload</h3>
            )}
          </div>
        </Modal>
        <div className="app__header">
          <img src='https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png' alt="Instagram" height='150px' className="app__headerImage" />
          {user ? (
            <div>
              <i onClick={() => setPostOpen(true)} style={{ marginBottom: "-10px" }} className="far fa-plus-square plus fa-md"></i>
              <Button onClick={() => auth.signOut()}>Log Out</Button>
            </div>
          ) : (
            <div className="app__loginContainer">
              <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
              <Button onClick={() => setOpen(true)}>Sign Up</Button>
            </div>
          )}
        </div>


        <div className="app__posts">
          {posts.map(({ id, post }) => (
            <Post key={id} user={user} postId={id} profilePic={post.profilePic} caption={post.caption} imageUrl={post.imageUrl} username={post.username} />
          ))}
        </div>
      </div>
    </>
  );
}
export default App;

