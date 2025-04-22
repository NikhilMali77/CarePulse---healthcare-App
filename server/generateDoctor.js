import crypto from 'crypto'
import DoctorCredentials from './models/doctorCredentials.js'

const generateDoctorCredentials = async (doctorId, name) => {
  const key = crypto.randomBytes(16).toString('hex')
  // const newCredentials = new DoctorCredentials({
  //   doctorId,
  //   key,
  //   name,
  // })
  // await newCredentials.save()
  console.log('credentials created', key)
}

generateDoctorCredentials('nmeditzzz7@gmail.com', 'Jennifer Lawrence') 