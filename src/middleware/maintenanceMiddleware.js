module.exports = (req,res,next)=>{
	res.status(503).send('Maintenance. Service temporary available')
}