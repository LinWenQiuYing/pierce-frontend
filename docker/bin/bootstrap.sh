#!/usr/bin/env bash
set -x
mkdir -p /etc/kg_pierce_mvp/conf
confd -onetime

export NGINX_CONF_FILE=/etc/kg_pierce_mvp/conf/default

cd KG_PIERCE_MVP_HOME
# openssl genrsa -out server.key 2048
# openssl rsa -in server.key -out server.key
# openssl req -nodes -newkey rsa:2048 -keyout server.key -out server.csr -subj "/C=CN/ST=SHANGHAI/L=SHANGHAI/O=TRANSWARP/OU=SOPHON/CN=${HOSTNAME}"
# openssl req -new -x509 -key server.key -out ca.crt -days 3650 -subj "/C=CN/ST=SHANGHAI/L=SHANGHAI/O=TRANSWARP/OU=SOPHON/CN=${HOSTNAME}"
# openssl x509 -req -days 3650 -in server.csr -CA ca.crt -CAkey server.key -CAcreateserial -out server.crt

rm -rf /etc/nginx/sites-enabled/default
ln -s ${NGINX_CONF_FILE} /etc/nginx/sites-enabled/default
#nginx
#source /etc/sophon_web/conf/config
source /etc/${SOPHON_SERVICE_ID}/conf/kg_pierce_mvp/config
configurable-http-proxy --ip 0.0.0.0 --port ${CHP_PORT} --api-ip 0.0.0.0 --api-port ${CHP_API_PORT} & nginx -g "daemon off;"
