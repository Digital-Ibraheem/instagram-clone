import React, { useState, useEffect } from 'react'
import './Post.css'
import { db } from './firebase'
import Avatar from '@material-ui/core/Avatar'
import { Input, Button } from '@material-ui/core'
import firebase from 'firebase'


function Post({ postId, caption, user, username, imageUrl, profilePic }) {
	const [comments, setComments] = useState([])
	const [comment, setComment] = useState('')

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

	function postComment(e) {
		e.preventDefault()

		db.collection("posts").doc(postId).collection('comments').add({
			text: comment,
			username: user.displayName,
			timestamp: firebase.firestore.FieldValue.serverTimestamp()
		})
		setComment('')
	}

	return (
		<div className='post'>
			<div className="post__header">
				<Avatar
					className='post__avatar'
					alt={username.toUpperCase()}
					src={profilePic}
				/>
				<h4>{username}</h4>
			</div>

			<img className='post__image' src={imageUrl} alt='' />
			<h4 className='post__text'><b>{username} </b> {caption}</h4>
			<p className='post__commentsLabel'>{comments.length !== 0 && 'Comments'}</p>
			{comments.length !== 0 && (
				<div className="post__comments">
					{comments.map((comment) => (
						<p className="post__comment">
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

