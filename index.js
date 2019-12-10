const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

const util = require('util')
const exec = util.promisify(require('child_process').exec)

const {Docker} = require('node-docker-api')
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

app.use(bodyParser.json())

app.post('/cluster', async (req,res) => {
	try{
	const containers = await docker.container.list()
	const totalContainer = containers.length + 1
	const { stderr: stderrR,stdout: stdoutR } = await exec(`docker run -d --privileged --name ${req.body.keyApi} -p ${totalContainer}2375:2375 docker:18-dind`)
	console.log(stderrR)
	console.log(stdoutR)
	const { stderr : stderrT, stdout: stdoutT } = await exec(`docker -H tcp://localhost:${totalContainer}2375 swarm init`)
	console.log(stderrT)
	console.log(stdoutT)
	const { stdout: SWARM_TOKEN, stderr: fail } = await exec(`docker -H tcp://localhost:${totalContainer}2375 swarm join-token -q worker`)
	console.log(SWARM_TOKEN)
	console.log(fail)
	const list = await Promise.all([...Array(req.body.worker).keys()].map(i => exec(`docker -H tcp://localhost:${totalContainer}2375 run -d --privileged --name worker-${i+1} --hostname=worker-${i+1} -p ${i+1}2375:2375 docker:18-dind`)))
	list.map(x => {console.log(x.stderr);console.log(x.stdout)})
	const listL = await Promise.all([...Array(req.body.worker).keys()].map(i => exec(`SWARM_MASTER_IP=$(docker exec ${req.body.keyApi} docker exec worker-${i+1} ip route show | awk '/default/ {print $3}')
		docker exec ${req.body.keyApi} docker exec worker-${i+1} docker swarm join --token ${SWARM_TOKEN.trim()} \${SWARM_MASTER_IP}:2377`)))
	listL.map(x => {console.log(x.stderr);console.log(x.stdout)})
	res.status(200).json({port : totalContainer + "2375", url: res.keyApi})
	}catch(err){
	res.status(400).json({message: err})
	}
})

app.listen(port)
