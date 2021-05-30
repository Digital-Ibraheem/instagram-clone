import React, { useState } from 'react'
import firebase from 'firebase'
import { storage, db } from './firebase'
import { Button, Input } from '@material-ui/core'
import './ImageUpload.css'


function ImageUpload({ username, setPostOpen }) {
    const [caption, setCaption] = useState('')
    const [image, setImage] = useState(null)
    const [progress, setProgress] = useState(0)

    const chooseFile = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0])
        }
    }
    const handleUpload = () => {
        setPostOpen(false)
        const uploadTask = storage.ref(`images/${image.name}`).put(image)
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                )
                setProgress(progress)
            },
            (error) => {
                console.log(error)
                alert(error.message)
            },
            () => {
                storage
                    .ref("images")
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        //post image
                        db.collection('posts').add({
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            caption,
                            imageUrl: url,
                            username
                        })
                        setProgress(0)
                        setCaption('')
                        setImage(null)
                    })
            }
        )
    }
    return (
        <div className='imageUpload'>
            <progress className='imageUpload__progress' value={progress} max='100' />
            <input type="file" name="file" id="file" onChange={chooseFile} className="imageUpload__inputFile" />
            <Button>
                <label for="file">{image != null ? 'FILE CHOSEN' : 'CHOOSE FILE'}</label>
            </Button>
            <Input className='imageUpload__caption' type="text" placeholder='Enter a caption...' value={caption} onChange={e => setCaption(e.target.value)} />
            <Button disabled={!caption || !image} onClick={handleUpload}>
                Upload
            </Button>
        </div>
    )
}

export default ImageUpload
