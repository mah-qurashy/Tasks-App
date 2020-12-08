const express = require ('express')
const { findById } = require('../models/task')
const Task = require ('../models/task')
const auth = require('../middleware/authMiddleware')

const router = new express.Router()

router.get('/tasks', auth,async (req, res) => {
	let  match = {owner: req.user._id} 
	let options = {}
	if(req.query.completed){match.completed = req.query.completed==='true'}
	if(req.query.limit){options.limit=parseInt(req.query.limit)}
	if(req.query.skip){options.skip=parseInt(req.query.skip)}
	if(req.query.sortBy){
		options.sort={}
		const parts = req.query.sortBy.split(':')
		options.sort[parts[0]] = parts[1]==='desc'? -1 : 1}
		console.log(options)
	try {
		tasks = await Task.find(match,null,options)
		res.send(tasks)
	} catch (e) {
		res.status(500).send()
	}
})

router.get('/tasks/:id',auth, async (req, res) => {
	try {
		task = await Task.findOne({_id:req.params._id,owner: req.user._id})
		if (!task) {
			return res.status(404).send()
		}
		res.send(task)
	} catch (e) {
		res.status(500).send()
	}
})

router.post('/tasks',auth, async (req, res) => {
	let task = new Task({...req.body, owner: req.user._id})
	try {
		task = await task.save()
		console.log(task)
		res.status(201).send(task)
	} catch (e) {
		console.log(e)
		res.status(400).send()
	}
})

router.patch('/tasks/:id', async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['description', 'completed']
	const isValidUpdate = updates.every((update) =>
		allowedUpdates.includes(update)
	)
	if (!isValidUpdate) {
		return res.status(400).send({ error: 'Invalid updates!' })
	}
	try {
		console.log(req.params.id, req.body)
		task = await findOne({_id: req.params.id, owner: req.user._id})
		updates.forEach((update)=>{
			task[update] = req.body[update]
		})
		await task.save()
		if (!task) {
			return res.status(404).send()
		}
		res.send(task)
	} catch (e) {
		res.status(400).send()
	}
})

router.delete('/tasks/:id', async (req, res) => {
	try {
		const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
		if (!task) {
			return res.status(404).send()
		}
		res.send(task)
	} catch (e) {
		res.status(500).send()
	}
})

module.exports = router