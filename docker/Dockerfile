FROM  172.16.1.99/pierce/nginx/nginx-x86
MAINTAINER transwarp

ENV TZ "Asia/Shanghai"
RUN rm /etc/nginx/conf.d/default.conf
ADD ./default.conf /etc/nginx/conf.d/

COPY dist/  /usr/share/nginx/html/
