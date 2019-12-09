const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const Docker = require('dockerode');
const docker = new Docker({socketPath: '/var/run/docker.sock'});
app.use(bodyParser.json());
const axios = require('axios');
const User = {
	id: {
		unique: true,
		primaryKey: true,
		autoIncrement: true,
		type: Number
	},
	userid: {
		type: String,
		allowNull: false
	             },
	password: {
	        type: String
	        },
	keyApi: {
		type: String
	},
	workers: {
		type: Number,
		defaultValue: 0
	},
	managers: {
		type: Number,
		defaultValue: 1
	}
	};

app.get('/', async (req, res) => res.json(await docker.listContainers()));


app.post('/cluster', async (req,res) => {
	const containers = await docker.listContainers()
	const totalContainer = containers.length + 1
/*
	const newOne = await docker.createContainer({
		  Image: 'docker',
		  name: res.keyApi,
		  AttachStdin: false,
		  AttachStdout: true,
		  AttachStderr: true,
		  Tty: true,
		  OpenStdin: false,
		  StdinOnce: false,
		  privileged: true,
		  PortBindings: {"2375/tcp": [{HostPort: totalContainer + "2375"}]} 
	})
	await newOne.start()
*/
	docker.run('docker', ['bash', '-c', 'uname -a'], [process.stdout, process.stderr], {Tty:false}, function (err, data, container) {
		  console.log(err);
	});
	res.status(200).json({port : totalContainer + 2375, url: res.keyApi})
})

app.listen(port)
