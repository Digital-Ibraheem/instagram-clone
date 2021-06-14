import React, { useState, useEffect } from 'react'
import './Post.css'
import { db } from './firebase'
import Avatar from '@material-ui/core/Avatar'
import { Input, Button } from '@material-ui/core'
import firebase from 'firebase'


function Post({ postId, caption, user, username, imageUrl, profilePic }) {
	const [comments, setComments] = useState([])
	const [comment, setComment] = useState('')
	const [isLiked, setIsLiked] = useState([])
	const [id, setId] = useState('')

	useEffect(() => {
		let unsubscribe;
		if (postId) {
			unsubscribe = db
				.collection("posts")
				.doc(postId)
				.collection("comments")
				.orderBy('timestamp', 'desc')
				.onSnapshot((snapshot) => {
					setComments(snapshot.docs.map((doc) => doc.data()))
				});
		}

		return () => {
			unsubscribe()
		}
	}, [postId])

	useEffect(() => {
		db.collection('posts').doc(postId).collection('likedBy').onSnapshot(snapshot => {
			setIsLiked(snapshot.docs.map(doc => doc.data()))
		})
	}, [postId])
	function deletePost() {
		db.collection('posts').doc(postId).delete()
	}

	function postComment(e) {
		e.preventDefault()

		db.collection("posts").doc(postId).collection('comments').add({
			text: comment,
			username: user.displayName,
			timestamp: firebase.firestore.FieldValue.serverTimestamp()
		})
		setComment('')
	}
	function like() {
		let lastClick = 0;
		const delay = 500;
		if (lastClick <= (Date.now() - delay)) {
			lastClick = Date.now()
			const likedBy = db.collection('posts').doc(postId).collection('likedBy')
			likedBy.onSnapshot(snapshot => setIsLiked(snapshot.docs.map((doc) => doc.data())))
			likedBy.onSnapshot(snapshot => snapshot.docs.forEach((doc) => {
				setId(doc.data().username === user.displayName && doc.id)
			}))
			if (isLiked.some(doc => doc.username === user.displayName)) {
				console.log(likedBy.doc(id))
				console.log(id)
				likedBy.doc(id).delete()
				likedBy.onSnapshot(snapshot => setIsLiked(snapshot.docs.map((doc) => doc.data())))
			} else {
				console.log('added')
				likedBy.add({
					username: user.displayName
				})
				console.log(isLiked)
			}
		}
	}

	return (
		<div className='post'>
			<div className="post__header">
				<div className="post__trash">
					<Avatar
						className='post__avatar'
						alt={username.toUpperCase()}
						src={profilePic}
					/>
					<h4>{username}</h4>
				</div>
				{user && user.displayName === username && <i onClick={deletePost} className='fas fa-trash fa-lg'></i>}
			</div>

			<img onDoubleClick={user && like} className='post__image' src={imageUrl} alt='' />
			{isLiked.length > 0 && <h4 className='post__likes'>{isLiked.length === 1 ? '1 like' : `${isLiked.length} likes`}</h4>}
			<h4 className='post__text'>
				{user && <i onClick={like} className={`fa${isLiked.some(doc => doc.username === user.displayName) > 0 ? 's' : 'r'} fa-heart fa-lg post__heart`}></i>}
				<b>{username} </b>
				{caption}
			</h4>
			<p className='post__commentsLabel'>{comments.length !== 0 && 'Comments'}</p>
			{comments.length !== 0 && (
				<div className="post__comments">
					{comments.map((comment) => (
						<p className="post__comment" key={comment.id}>
							<strong>{comment.username}</strong> {comment.text}
						</p>
					))}
				</div>
			)}
			{user && (
				<form style={{ borderTop: "1px solid lightgray", width: "95%", margin: "0 2.5%", paddingTop: "1%" }}>
					<Input
						className="post__input"
						type='text'
						placeholder='Add a comment...'
						value={comment}
						onChange={(e) => setComment(e.target.value)}
					/>
					<Button
						className='post__button'
						disabled={!comment}
						type='submit'
						onClick={postComment}
					>
						Post
					</Button>
				</form>
			)}
		</div>
	)
}

export default Post

