#!/usr/bin/env bash
if [ -n "${SOPHON_SERVICE_ID}" ]; then
  export NGINX_CONF_FILE=/etc/${SOPHON_SERVICE_ID}/conf/kg_pierce_mvp/default
  export PIERCE_MVP_CONF_FILE=/etc/${SOPHON_SERVICE_ID}/conf/kg_pierce_mvp/config
else
  export NGINX_CONF_FILE=/etc/kg_pierce_mvp/conf/default
  export PIERCE_MVP_CONF_FILE=/etc/kg_pierce_mvp/conf/config
fi
cd KG_PIERCE_MVP_HOME
# openssl genrsa -out server.key 2048
# openssl rsa -in server.key -out server.key
# openssl req -nodes -newkey rsa:2048 -keyout server.key -out server.csr -subj "/C=CN/ST=SHANGHAI/L=SHANGHAI/O=TRANSWARP/OU=SOPHON/CN=${HOSTNAME}"
# openssl req -new -x509 -key server.key -out ca.crt -days 3650 -subj "/C=CN/ST=SHANGHAI/L=SHANGHAI/O=TRANSWARP/OU=SOPHON/CN=${HOSTNAME}"
# openssl x509 -req -days 3650 -in server.csr -CA ca.crt -CAkey server.key -CAcreateserial -out server.crt
rm -rf /etc/nginx/conf.d/default.conf
ln -s ${NGINX_CONF_FILE} /etc/nginx/conf.d/default.conf

#nginx
source /etc/${SOPHON_SERVICE_ID}/conf/kg_pierce_mvp/config
configurable-http-proxy --ip 0.0.0.0 --port ${CHP_PORT} --api-ip 0.0.0.0 --api-port ${CHP_API_PORT} & nginx -g "daemon off;"
