const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/authMiddleware')

const router = new express.Router()

const upload = multer({
	limits: {
		fileSize: 2000000,
	},
	fileFilter(req, file, callback) {
		if (file.originalname.match(/\.(jpg|jpeg)$/)) {
			return callback(undefined, true)
		}
		callback(new Error('Supported types: JPG, JPEG.'))
	},
})

router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()
		res.send({ user: user.getPublicProfile(), token })
	} catch (e) {
		res.status(400).send()
	}
})

router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token
		})
		await req.user.save()
		res.send()
	} catch (e) {
		res.status(500).send()
	}
})

router.post('/users/logoutall', auth, async (req, res) => {
	try {
		req.user.tokens = []
		await req.user.save()
		res.send()
	} catch (e) {
		res.status(500).send()
	}
})

router.get('/users/me', auth, async (req, res) => {
	res.send(req.user.getPublicProfile())
})

router.post(
	'/users/me/profilepic', auth,
	upload.single('profilepic'),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer).resize({width:250, height: 250}).png().toBuffer()
		req.user.profilepic = buffer
		try{
		await req.user.save()
		res.send()
		}catch(e){
			res.status(500).send()
		}
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message })
	}
)

router.delete('/users/me/profilepic', auth, async(req,res) =>{
	req.user.profilepic = undefined
	try{
	await req.user.save()
	res.send()
	}catch(e){
		res.status(500).send()
	}
})
router.get('/users/:id/profilepic', async (req, res) =>{
	try {
		const user = await User.findById(req.params.id)
		console.log(user)
		if (!user || !user.profilepic){
			throw new Error()
		}
		res.set('Content-Type','image/png')
		res.send(user.profilepic)

	}catch (e){
		res.status(404).send()
	}
})


router.post('/users', async (req, res) => {
	const user = new User(req.body)
	try {
		await user.save()
		const token = await user.generateAuthToken()
		console.log({ user, token })
		res.status(201).send({ user: user.getPublicProfile(), token })
	} catch (e) {
		res.status(400).send(e)
	}
})

router.patch('/users/me', auth, async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['name', 'email', 'password', 'age']
	const isValidUpdate = updates.every((update) =>
		allowedUpdates.includes(update)
	)
	if (!isValidUpdate) {
		res.status(400).send({ error: 'Invalid updates.' })
	}
	try {
		updates.forEach((update) => {
			req.user[update] = req.body[update]
		})
		await req.user.save()
		res.send(req.user.getPublicProfile())
	} catch (e) {
		res.status(400).send(e)
	}
})

router.delete('/users/me', auth, async (req, res) => {
	try {
		await req.user.remove()
		res.send(req.user.getPublicProfile())
	} catch (e) {
		res.status(500).send()
	}
})

module.exports = router
