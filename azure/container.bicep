param location string = 'brazilsouth'
param environmentName string = 'cae-smartpark-gkszz1126'
param name string
param image string
param external bool = false
param targetPort int = 3000
param env array = []
@secure()
param secrets object = {}
resource environment 'Microsoft.App/managedEnvironments@2024-03-01' existing = {name:environmentName}
resource app 'Microsoft.App/containerApps@2024-03-01' = {
 name:name
 location:location
 properties:{
  managedEnvironmentId:environment.id
  workloadProfileName:'Consumption'
  configuration:{
   activeRevisionsMode:'Single'
   ingress:{external:external,targetPort:targetPort,transport:'http',allowInsecure:!external}
   secrets:[for entry in items(secrets): {name:entry.key,value:entry.value}]
  }
  template:{
   containers:[{
    name:name
    image:image
    env:env
    resources:{cpu:json('0.25'),memory:'0.5Gi'}
    probes:[
     {type:'Liveness',httpGet:{path:'/health',port:targetPort},initialDelaySeconds:20,periodSeconds:30,failureThreshold:3}
     {type:'Readiness',httpGet:{path:'/health',port:targetPort},initialDelaySeconds:5,periodSeconds:10,failureThreshold:10}
     {type:'Startup',httpGet:{path:'/health',port:targetPort},initialDelaySeconds:5,periodSeconds:10,failureThreshold:30}
    ]
   }]
   scale:{minReplicas:0,maxReplicas:1,rules:[{name:'http',http:{metadata:{concurrentRequests:'20'}}}]}
  }
 }
}
output fqdn string = app.properties.configuration.ingress.fqdn
output outboundIps array = app.properties.outboundIpAddresses
