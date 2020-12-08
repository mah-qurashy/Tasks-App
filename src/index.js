//dependencies
const express = require('express')
//connect to db
require('./db/mongoose')
//mongoose models
const User = require('./models/user')
const Task = require('./models/task')
//routers
const usersRouter = require ('./routers/users')
const tasksRouter = require ('./routers/tasks')
//middlewares
const maintenanceMiddleware = require('./middleware/maintenanceMiddleware')

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(usersRouter)
app.use(tasksRouter)
//app.use(maintenanceMiddleware)


app.listen(port, () => {
	console.log('App is listening on port ' + port + '.')
})
